const https = require('https');
const logger = require('../utils/logger');

const PLATFORMS = ['Instagram', 'LinkedIn', 'X'];

function formatDateString(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function callLLM({ prompt, groqApiKey, openAiApiKey }) {
  let hostname = 'api.groq.com';
  let path = '/openai/v1/chat/completions';
  let apiKey = groqApiKey;
  let model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

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
          content: 'You are an expert social media strategist. Respond ONLY with a valid, clean JSON object matching the requested schema without any markdown formatting or extra text.'
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
            contentStr = contentStr.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
            resolve(JSON.parse(contentStr));
          } catch (e) {
            reject(new Error(`Failed to parse API JSON response: ${e.message}`));
          }
        } else {
          reject(new Error(`API returned status ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.write(payload);
    req.end();
  });
}

function sanitizeAndValidatePosts(rawPosts, brandName, startDate) {
  if (!Array.isArray(rawPosts) || rawPosts.length === 0) {
    throw new Error('Invalid AI response: Expected non-empty array of posts');
  }

  return rawPosts.map((p, i) => {
    const postDate = new Date(startDate);
    postDate.setDate(postDate.getDate() + i);

    let platform = (p.platform || PLATFORMS[i % PLATFORMS.length]).trim();
    if (platform === 'X/Twitter' || platform === 'Twitter') platform = 'X';
    if (!['Instagram', 'LinkedIn', 'X'].includes(platform)) {
      platform = PLATFORMS[i % PLATFORMS.length];
    }

    const idea = typeof p.idea === 'string' && p.idea.trim() 
      ? p.idea.trim() 
      : (typeof p.title === 'string' && p.title.trim() ? p.title.trim() : `Day ${i + 1} Strategy for ${brandName}`);
    
    let caption = typeof p.caption === 'string' && p.caption.trim() 
      ? p.caption.trim() 
      : `Exciting update from ${brandName}!`;

    if (platform === 'X' && caption.length > 280) {
      caption = caption.substring(0, 277) + '...';
    }

    const hashtags = Array.isArray(p.hashtags)
      ? p.hashtags.map(h => h.startsWith('#') ? h : `#${h.replace(/\s+/g, '')}`)
      : [`#${brandName.replace(/\s+/g, '')}`, '#ContentStrategy'];

    return {
      date: postDate,
      platform,
      postType: p.postType || 'Educational',
      idea,
      caption,
      hashtags,
      imagePrompt: p.imagePrompt || '',
      engagementTip: p.engagementTip || '',
      status: i < 3 ? 'scheduled' : 'draft',
    };
  });
}

const generateCalendarPosts = async ({ brand, startDate, month, year, platforms }) => {
  const brandName = brand.brandName || brand.name || 'Our Brand';
  const industry = brand.industry || 'General';
  const audience = brand.targetAudience || 'General Audience';
  const tone = brand.tone || 'Professional';
  const goals = brand.postingGoals || brand.goals || 'Growth & Engagement';

  const start = startDate ? new Date(startDate) : new Date();
  const validStart = isNaN(start.getTime()) ? new Date() : start;

  let activePlatforms = Array.isArray(platforms) && platforms.length > 0
    ? platforms.map(p => (p === 'Twitter' || p === 'X/Twitter') ? 'X' : p)
    : (Array.isArray(brand.platforms) && brand.platforms.length > 0
        ? brand.platforms.map(p => (p === 'Twitter' || p === 'X/Twitter') ? 'X' : p)
        : PLATFORMS);

  activePlatforms = activePlatforms.filter(p => ['Instagram', 'LinkedIn', 'X'].includes(p));
  if (activePlatforms.length === 0) {
    activePlatforms = PLATFORMS;
  }

  const groqApiKey = (process.env.GROQ_API || process.env.GROQ_API_KEY || '').trim();
  const openAiApiKey = (process.env.OPENAI_API_KEY || '').trim();

  if (!groqApiKey && !openAiApiKey) {
    logger.warn('No LLM API keys found. Relying on structured mock fallback generator');
    return Array.from({ length: 30 }).map((_, i) => {
      const pDate = new Date(validStart);
      pDate.setDate(pDate.getDate() + i);
      const platform = activePlatforms[i % activePlatforms.length];
      return {
        date: pDate,
        platform,
        postType: i % 2 === 0 ? 'Educational' : 'Thought Leadership',
        idea: `Day ${i + 1}: ${platform} Growth Strategy for ${brandName}`,
        caption: platform === 'Instagram'
          ? `✨ Discover how ${brandName} is transforming ${industry}! What's your top goal this season? Drop a comment below! 🚀 #` + brandName.replace(/\s+/g, '')
          : platform === 'LinkedIn'
          ? `Key insight for ${audience} in ${industry}:\n\nConsistently applying ${tone.toLowerCase()} principles leads to sustainable growth. Here are 3 actionable takeaways for your strategy...\n\n#${brandName.replace(/\s+/g, '')} #ProfessionalGrowth`
          : `Boost your ${industry} workflow today with ${brandName}. Direct, effective, and results-driven. 💡 #${brandName.replace(/\s+/g, '')}`,
        hashtags: [`#${brandName.replace(/\s+/g, '')}`, '#ContentStrategy', `#${industry.replace(/\s+/g, '')}`],
        imagePrompt: `High quality photo for ${brandName} ${industry}`,
        engagementTip: `Engage with comments within 1 hour of posting.`,
        status: i < 3 ? 'scheduled' : 'draft',
      };
    });
  }

  const apiProvider = groqApiKey ? 'Groq API (llama-3.3-70b-versatile)' : 'OpenAI API (gpt-4o-mini)';
  logger.info(`Generating 30 posts via ${apiProvider}...`, { brandName, industry });

  const platformsListStr = activePlatforms.map(p => `"${p}"`).join(', ');
  const prompt = `
Generate a 30-day social media content calendar (30 posts) for:
Brand Name: "${brandName}"
Industry: "${industry}"
Target Audience: "${audience}"
Tone of Voice: "${tone}"
Posting Goals: "${goals}"
Start Date: "${formatDateString(validStart)}"
Selected Platforms: ${platformsListStr}

Platform-specific tone requirements:
- Instagram: Engaging, friendly, visual vibe with emojis and a clear Call-To-Action (CTA).
- LinkedIn: High-value, professional thought leadership, analytical insights, structured bullet points.
- X: Punchy, concise hooks, impactful copy kept under 280 characters.

Return a JSON object with key "posts" which is an array of 30 post objects matching:
{
  "posts": [
    {
      "date": "YYYY-MM-DD",
      "platform": ${platformsListStr},
      "postType": "Educational" | "Promotional" | "Behind-the-Scenes" | "Interactive" | "Thought Leadership",
      "idea": "Short title or post topic idea",
      "caption": "Full platform-tailored post caption text",
      "hashtags": ["#tag1", "#tag2", "#tag3"],
      "imagePrompt": "Visual prompt matching the post",
      "engagementTip": "Actionable platform-specific engagement tip"
    }
  ]
}
`;

  try {
    const aiResponse = await callLLM({ prompt, groqApiKey, openAiApiKey });
    if (aiResponse && Array.isArray(aiResponse.posts) && aiResponse.posts.length > 0) {
      logger.info(`Successfully generated ${aiResponse.posts.length} posts via ${apiProvider}`);
      return sanitizeAndValidatePosts(aiResponse.posts, brandName, validStart);
    }
    throw new Error('AI API returned empty or malformed posts schema');
  } catch (err) {
    logger.error(`AI Generation failed: ${err.message}. Falling back to structured generator.`);
    return Array.from({ length: 30 }).map((_, i) => {
      const pDate = new Date(validStart);
      pDate.setDate(pDate.getDate() + i);
      const platform = activePlatforms[i % activePlatforms.length];
      return {
        date: pDate,
        platform,
        postType: 'Educational',
        idea: `Day ${i + 1}: ${platform} Content for ${brandName}`,
        caption: `Optimized ${platform} post for ${brandName} focusing on ${industry} insights and ${goals}.`,
        hashtags: [`#${brandName.replace(/\s+/g, '')}`, '#SocialMedia'],
        imagePrompt: '',
        engagementTip: '',
        status: i < 3 ? 'scheduled' : 'draft',
      };
    });
  }
};

const regenerateSinglePost = async ({ post, brand, customInstruction }) => {
  const brandName = brand.brandName || brand.name || 'Brand';
  const industry = brand.industry || 'Industry';
  const platform = post.platform || 'Instagram';

  const groqApiKey = (process.env.GROQ_API || process.env.GROQ_API_KEY || '').trim();
  const openAiApiKey = (process.env.OPENAI_API_KEY || '').trim();

  if (!groqApiKey && !openAiApiKey) {
    return {
      idea: customInstruction ? `[Updated] ${post.idea}` : `Fresh ${platform} Idea for ${brandName}`,
      caption: `[Regenerated] ${platform} post: ${customInstruction || 'Engaging content tailored for ' + brandName}`,
      hashtags: post.hashtags || [`#${brandName.replace(/\s+/g, '')}`],
      imagePrompt: post.imagePrompt || '',
      engagementTip: post.engagementTip || '',
    };
  }

  const prompt = `
Regenerate ONLY this single social media post:
Brand Name: "${brandName}"
Industry: "${industry}"
Platform: "${platform}"
Existing Idea: "${post.idea}"
Existing Caption: "${post.caption}"
Custom Instruction: "${customInstruction || 'Make it fresher and more engaging'}"

Platform rules:
- Instagram -> conversational, emojis, clear CTA
- LinkedIn -> professional, value-driven, thought leadership
- X -> concise, punchy hook under 280 characters

Return a JSON object:
{
  "idea": "Updated post title/idea",
  "caption": "Fresh regenerated caption text",
  "hashtags": ["#tag1", "#tag2", "#tag3"],
  "imagePrompt": "Visual prompt matching the post",
  "engagementTip": "Actionable platform-specific engagement tip"
}
`;

  try {
    const aiResponse = await callLLM({ prompt, groqApiKey, openAiApiKey });
    if (aiResponse && aiResponse.caption) {
      let caption = aiResponse.caption.trim();
      if (platform === 'X' && caption.length > 280) {
        caption = caption.substring(0, 277) + '...';
      }
      return {
        idea: aiResponse.idea || `[Updated] ${post.idea}`,
        caption,
        hashtags: Array.isArray(aiResponse.hashtags) ? aiResponse.hashtags : post.hashtags,
        imagePrompt: aiResponse.imagePrompt || post.imagePrompt || '',
        engagementTip: aiResponse.engagementTip || post.engagementTip || '',
      };
    }
    throw new Error('AI response missing caption field');
  } catch (err) {
    logger.error(`Single post regeneration error: ${err.message}`);
    return {
      idea: `[Refreshed] ${post.idea}`,
      caption: `${post.caption} (Refreshed with focus on: ${customInstruction || 'Engagement'})`,
      hashtags: post.hashtags,
      imagePrompt: post.imagePrompt || '',
      engagementTip: post.engagementTip || '',
    };
  }
};

module.exports = {
  generateCalendarPosts,
  regenerateSinglePost,
  sanitizeAndValidatePosts,
};
