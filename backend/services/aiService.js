/**
 * AI Service for PostWise-AI
 * Strictly uses Groq API (llama-3.3-70b-versatile) or OpenAI API (gpt-4o-mini)
 * with structured JSON generation.
 */

const https = require('https');

const PLATFORMS = ['Instagram', 'LinkedIn', 'X'];

function formatDateString(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Call LLM API (Groq API or OpenAI API)
async function callLLM({ prompt, groqApiKey, openAiApiKey }) {
  let hostname = 'api.groq.com';
  let path = '/openai/v1/chat/completions';
  let apiKey = groqApiKey;
  let model = 'openai/gpt-oss-120b';

  if (!groqApiKey && openAiApiKey) {
    hostname = 'api.openai.com';
    path = '/v1/chat/completions';
    apiKey = openAiApiKey;
    model = 'gpt-4o-mini';
  }

  if (!apiKey) {
    throw new Error('API Key missing: Please set GROQ_API or OPENAI_API_KEY in backend/.env file');
  }

  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert social media manager. Respond ONLY with a valid, clean JSON object matching the requested schema.'
        },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7
    });

    const options = {
      hostname: hostname,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsed = JSON.parse(data);
            let contentStr = parsed.choices && parsed.choices[0] && parsed.choices[0].message ? parsed.choices[0].message.content : '';
            if (!contentStr) {
              return reject(new Error('Empty content received from LLM'));
            }
            // Strip markdown fences like ```json ... ``` if model returned them
            contentStr = contentStr.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
            resolve(JSON.parse(contentStr));
          } catch (e) {
            console.error('[AI Service Error] Raw data was:', data);
            reject(new Error(`Failed to parse API JSON response: ${e.message}`));
          }
        } else {
          console.error('[AI Service Error] HTTP error from API:', res.statusCode, data);
          reject(new Error(`API returned status ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.write(payload);
    req.end();
  });
}

/**
 * Main function: Generate ~30 posts directly via Groq API
 */
const generateCalendarPosts = async ({ brand, startDate, month, year, platforms }) => {
  const brandName = brand.brandName || brand.name || 'Our Brand';
  const industry = brand.industry || 'General';
  const audience = brand.targetAudience || 'General Audience';
  const tone = brand.tone || 'Professional';
  const goals = brand.postingGoals || brand.goals || 'Growth & Engagement';

  let start = startDate ? new Date(startDate) : new Date();
  if (isNaN(start.getTime())) {
    start = new Date();
  }

  // Determine platforms to target
  let activePlatforms = Array.isArray(platforms) && platforms.length > 0
    ? platforms.map(p => (p === 'Twitter' || p === 'X/Twitter') ? 'X' : p)
    : (Array.isArray(brand.platforms) && brand.platforms.length > 0
        ? brand.platforms.map(p => (p === 'Twitter' || p === 'X/Twitter') ? 'X' : p)
        : PLATFORMS);

  // Keep only valid recognized platforms, fallback if empty
  activePlatforms = activePlatforms.filter(p => ['Instagram', 'LinkedIn', 'X'].includes(p));
  if (activePlatforms.length === 0) {
    activePlatforms = PLATFORMS;
  }

  const groqApiKey = (process.env.GROQ_API || process.env.GROQ_API_KEY || '').trim();
  const openAiApiKey = (process.env.OPENAI_API_KEY || '').trim();

  if (!groqApiKey && !openAiApiKey) {
    throw new Error('API Key missing: Please set GROQ_API or OPENAI_API_KEY in backend/.env');
  }

  const apiProvider = groqApiKey ? 'Groq API (openai/gpt-oss-120b)' : 'OpenAI API (gpt-4o-mini)';
  console.log(`[AI Service] Generating 30 posts directly via ${apiProvider} for platforms: [${activePlatforms.join(', ')}]...`);

  const platformsListStr = activePlatforms.map(p => `"${p}"`).join(', ');
  const platformRulesList = [];
  if (activePlatforms.includes('Instagram')) {
    platformRulesList.push(`Instagram:
- Conversational and engaging
- Use relevant emojis naturally
- Proper spacing for readability
- Strong hook
- Include a clear call-to-action (CTA)
- Include relevant hashtags`);
  }
  if (activePlatforms.includes('LinkedIn')) {
    platformRulesList.push(`LinkedIn:
- Professional and insightful
- Value-driven
- Suitable for a professional audience
- Avoid excessive emojis
- Strong industry-focused hook
- Encourage meaningful discussion
- Include relevant hashtags`);
  }
  if (activePlatforms.includes('X')) {
    platformRulesList.push(`X:
- Concise and punchy
- Maximum 280 characters for the caption
- Strong hook
- Minimal emojis
- Direct and engaging
- Include relevant hashtags where appropriate`);
  }

  const prompt = `
Generate a 30-day social media content calendar(30 posts) for:
Brand Name: "${brandName}"
Industry: "${industry}"
Target Audience: "${audience}"
Tone of Voice: "${tone}"
Posting Goals: "${goals}"
Start Date: "${formatDateString(start)}"

Requirements:
- Generate exactly 30 posts starting from Start Date.
- Selected Platforms: ${platformsListStr}. ONLY generate posts for these selected platforms: ${platformsListStr}. Do NOT use any other platforms.
- IMPORTANT: Create a DIFFERENT, platform-specific version of content tailored specifically for the selected platforms.

Platform-specific content rules:

${platformRulesList.join('\n\n')}

Return a clean JSON object with key "posts" which is an array of 30 post objects.
Each post object format:
{
  "date": "YYYY-MM-DD",
  "platform": ${platformsListStr},
  "postType": "Educational" | "Promotional" | "Behind-the-Scenes" | "Interactive" | "Thought Leadership",
  "idea": "Platform-specific headline or hook",
  "caption": "Platform-tailored caption adhering strictly to platform rules (max 280 chars if X)",
  "hashtags": ["#tag1", "#tag2", "#tag3"],
  "imagePrompt": "Visual prompt matching the post",
  "engagementTip": "Actionable platform-specific engagement tip"
}
`;

  const aiResponse = await callLLM({ prompt, groqApiKey, openAiApiKey });
  if (aiResponse && Array.isArray(aiResponse.posts) && aiResponse.posts.length > 0) {
    console.log(`[AI Service Success] Successfully generated ${aiResponse.posts.length} posts via API!`);
    // Map existing posts
    const generated = aiResponse.posts.map((p, i) => {
      const postDate = new Date(start);
      postDate.setDate(postDate.getDate() + i);
      let rawPlat = p.platform === 'Twitter' || p.platform === 'X/Twitter' ? 'X' : p.platform;
      // Guarantee the platform is strictly one of the user's selected platforms
      const plat = activePlatforms.includes(rawPlat) ? rawPlat : activePlatforms[i % activePlatforms.length];
      return {
        date: postDate,
        platform: plat,
        postType: p.postType || 'Educational',
        idea: p.idea || `Day ${i + 1} Idea for ${brandName}`,
        caption: p.caption || `Post caption for ${brandName}`,
        hashtags: Array.isArray(p.hashtags) ? p.hashtags : [`#${brandName.replace(/\\s+/g, '')}`, '#ContentStrategy'],
        imagePrompt: p.imagePrompt || '',
        engagementTip: p.engagementTip || '',
        status: i < 3 ? 'scheduled' : 'draft',
      };
    });
    // If fewer than 30 posts, pad with default entries strictly from selected platforms
    if (generated.length < 30) {
      for (let i = generated.length; i < 30; i++) {
        const postDate = new Date(start);
        postDate.setDate(postDate.getDate() + i);
        generated.push({
          date: postDate,
          platform: activePlatforms[i % activePlatforms.length],
          postType: 'Educational',
          idea: `Day ${i + 1} Idea for ${brandName}`,
          caption: `Post caption for ${brandName}`,
          hashtags: [`#${brandName.replace(/\\s+/g, '')}`, '#ContentStrategy'],
          imagePrompt: '',
          engagementTip: '',
          status: i < 3 ? 'scheduled' : 'draft',
        });
      }
    }
    return generated;
  }

  throw new Error('AI API returned an invalid or empty response payload');
};

/**
 * Regenerate single post directly via Groq API
 */
const regenerateSinglePost = async ({ post, brand, customInstruction }) => {
  const brandName = brand.brandName || brand.name || 'Brand';
  const industry = brand.industry || 'Industry';
  const audience = brand.targetAudience || 'Audience';
  const currentIdea = post.idea || post.title || 'Brand content update';
  const rawPlatform = post.platform || 'Instagram';
  const platform = (rawPlatform === 'X/Twitter' || rawPlatform === 'Twitter') ? 'X' : rawPlatform;

  const groqApiKey = (process.env.GROQ_API || process.env.GROQ_API_KEY || '').trim();
  const openAiApiKey = (process.env.OPENAI_API_KEY || '').trim();

  if (!groqApiKey && !openAiApiKey) {
    throw new Error('API Key missing: Please set GROQ_API or OPENAI_API_KEY in backend/.env');
  }

  const prompt = `
Generate a platform-specific social media post.

Brand Information:
Brand Name: "${brandName}"
Industry: "${industry}"
Target Audience: "${audience}"

Target Platform:
"${platform}"

Current Idea:
"${currentIdea}"

Custom Instruction:
"${customInstruction || "Make the content fresh, creative, relevant, and highly engaging."}"

IMPORTANT:
Create a platform-specific version of the content tailored specifically for "${platform}". Do NOT simply reformat a generic caption.

Platform-specific content rules:

Instagram:
- Conversational and engaging
- Use relevant emojis naturally
- Proper spacing for readability
- Strong hook
- Include a clear call-to-action
- Include relevant hashtags

LinkedIn:
- Professional and insightful
- Value-driven
- Suitable for a professional audience
- Avoid excessive emojis
- Strong industry-focused hook
- Encourage meaningful discussion
- Include relevant hashtags

X:
- Concise and punchy
- Maximum 280 characters for the caption
- Strong hook
- Minimal emojis
- Direct and engaging
- Include relevant hashtags where appropriate

Return clean JSON matching this exact structure:
{
  "platform": "${platform}",
  "idea": "Platform-specific headline or hook",
  "caption": "Platform-specific caption strictly following platform rules",
  "hashtags": ["#tag1", "#tag2", "#tag3"],
  "imagePrompt": "Visual prompt matching the post",
  "engagementTip": "Actionable ${platform} engagement tip"
}
`;

  // Call the LLM to regenerate the post. Wrap in try/catch to provide clearer errors.
  try {
    const aiResponse = await callLLM({ prompt, groqApiKey, openAiApiKey });
    if (aiResponse && typeof aiResponse === 'object' && aiResponse.caption) {
      return {
        idea: aiResponse.idea || `[Updated] ${post.idea}`,
        caption: aiResponse.caption,
        hashtags: Array.isArray(aiResponse.hashtags) ? aiResponse.hashtags : post.hashtags,
        imagePrompt: aiResponse.imagePrompt || post.imagePrompt || '',
        engagementTip: aiResponse.engagementTip || post.engagementTip || '',
      };
    }
    // If the response is missing expected fields, throw a detailed error.
    throw new Error('AI response missing required fields (e.g., caption).');
  } catch (err) {
    // Log the underlying error for debugging and rethrow a generic message.
    console.error('[AI Service] Regeneration error:', err);
    throw new Error('Failed to regenerate post via AI service: ' + err.message);
  }
};

module.exports = {
  generateCalendarPosts,
  regenerateSinglePost,
};
