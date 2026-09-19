const https = require('https');
const querystring = require('querystring');
require('dotenv').config();

const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI;
const SCOPES = process.env.LINKEDIN_SCOPES || 'openid profile email w_member_social';

function httpsRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ statusCode: res.statusCode, data });
        } else {
          reject(new Error(`LinkedIn request failed ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

function getAuthUrl() {
  const params = querystring.stringify({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    state: 'linkedin_' + Date.now(),
  });
  return `https://www.linkedin.com/oauth/v2/authorization?${params}`;
}

async function exchangeCode(code) {
  const payload = querystring.stringify({
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });
  const options = {
    hostname: 'www.linkedin.com',
    path: '/oauth/v2/accessToken',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(payload),
    },
  };
  const { data } = await httpsRequest(options, payload);
  const parsed = JSON.parse(data);
  const expiresAt = new Date(Date.now() + parsed.expires_in * 1000);
  return { accessToken: parsed.access_token, refreshToken: parsed.refresh_token, expiresAt };
}

async function getProfile(accessToken) {
  const options = {
    hostname: 'api.linkedin.com',
    path: '/v2/userinfo',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Cache-Control': 'no-cache',
      'LinkedIn-Version': '202603',
    },
  };
  const { data } = await httpsRequest(options);
  const parsed = JSON.parse(data);
  // userinfo returns 'sub' as the person ID
  const personId = parsed.sub || parsed.id;
  return personId ? `urn:li:person:${personId}` : null;
}

async function refreshTokenIfNeeded(tokenDoc) {
  if (new Date() < tokenDoc.expiresAt) return tokenDoc;
  const payload = querystring.stringify({
    grant_type: 'refresh_token',
    refresh_token: tokenDoc.refreshToken,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });
  const options = {
    hostname: 'www.linkedin.com',
    path: '/oauth/v2/accessToken',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(payload),
    },
  };
  const { data } = await httpsRequest(options, payload);
  const parsed = JSON.parse(data);
  tokenDoc.accessToken = parsed.access_token;
  tokenDoc.expiresAt = new Date(Date.now() + parsed.expires_in * 1000);
  if (parsed.refresh_token) tokenDoc.refreshToken = parsed.refresh_token;
  await tokenDoc.save();
  return tokenDoc;
}

function downloadImageBuffer(imageUrl) {
  return new Promise((resolve, reject) => {
    const url = new URL(imageUrl);
    const client = url.protocol === 'https:' ? https : require('http');
    client.get(imageUrl, (res) => {
      // Follow redirects if any (e.g. 301, 302)
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImageBuffer(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error(`Failed to download image: status ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const contentType = res.headers['content-type'] || 'image/jpeg';
        resolve({ buffer, contentType });
      });
    }).on('error', reject);
  });
}

async function uploadImageToLinkedIn({ accessToken, authorUrn, imageUrl }) {
  try {
    // 1. Download image from URL (e.g. Pexels)
    const { buffer, contentType } = await downloadImageBuffer(imageUrl);

    // 2. Initialize upload with LinkedIn
    const initPayload = JSON.stringify({
      initializeUploadRequest: {
        owner: authorUrn,
      },
    });

    const initOptions = {
      hostname: 'api.linkedin.com',
      path: '/rest/images?action=initializeUpload',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(initPayload),
        'LinkedIn-Version': '202603',
        'X-Restli-Protocol-Version': '2.0.0',
      },
    };

    const { data: initDataStr } = await httpsRequest(initOptions, initPayload);
    const initData = JSON.parse(initDataStr);
    const uploadUrl = initData.value?.uploadUrl;
    const imageUrn = initData.value?.image;

    if (!uploadUrl || !imageUrn) {
      console.warn('[LinkedIn Service] Missing uploadUrl or imageUrn from initializeUpload:', initDataStr);
      return null;
    }

    // 3. Upload binary buffer to the provided uploadUrl
    const uploadParsedUrl = new URL(uploadUrl);
    const uploadOptions = {
      hostname: uploadParsedUrl.hostname,
      path: uploadParsedUrl.pathname + uploadParsedUrl.search,
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': contentType || 'image/jpeg',
        'Content-Length': buffer.length,
      },
    };

    await new Promise((resolve, reject) => {
      const client = uploadParsedUrl.protocol === 'https:' ? https : require('http');
      const req = client.request(uploadOptions, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve();
        } else {
          let errData = '';
          res.on('data', (d) => (errData += d));
          res.on('end', () => reject(new Error(`Image upload failed: ${res.statusCode} ${errData}`)));
        }
      });
      req.on('error', reject);
      req.write(buffer);
      req.end();
    });

    console.log(`[LinkedIn Service] Successfully uploaded image to LinkedIn: ${imageUrn}`);
    return imageUrn;
  } catch (err) {
    console.error('[LinkedIn Service] Failed to upload image to LinkedIn:', err);
    return null;
  }
}

async function publishPost({ accessToken, authorUrn, post, imageUrl }) {
  const contentText = `${post.caption}\n\n${(post.hashtags || []).join(' ')}`;
  const targetImage = imageUrl || post.imageUrl;

  const payloadObj = {
    author: authorUrn,
    commentary: contentText,
    visibility: 'PUBLIC',
    distribution: {
      feedDistribution: 'MAIN_FEED',
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
    lifecycleState: 'PUBLISHED',
    isReshareDisabledByAuthor: false,
  };

  // If there is an image URL (from Pexels), upload image and attach media
  if (targetImage) {
    try {
      const imageUrn = await uploadImageToLinkedIn({
        accessToken,
        authorUrn,
        imageUrl: targetImage,
      });
      if (imageUrn) {
        payloadObj.content = {
          media: {
            id: imageUrn,
            altText: post.idea || post.title || 'PostWise Social Media Visual',
          },
        };
      }
    } catch (e) {
      console.warn('[LinkedIn Service] Image upload failed, falling back to text-only post:', e.message);
    }
  }

  const payload = JSON.stringify(payloadObj);
  const options = {
    hostname: 'api.linkedin.com',
    path: '/rest/posts',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
      'LinkedIn-Version': '202603',
      'X-Restli-Protocol-Version': '2.0.0',
    },
  };
  const { statusCode, data } = await httpsRequest(options, payload);
  // LinkedIn returns 201 with the post URN in the x-restli-id header or in response body
  let postId;
  try {
    const parsed = JSON.parse(data);
    postId = parsed.id || parsed.value?.id;
  } catch {
    postId = data; // sometimes it's just the URN string
  }
  return { id: postId || 'published' };
}

module.exports = { getAuthUrl, exchangeCode, getProfile, refreshTokenIfNeeded, publishPost };