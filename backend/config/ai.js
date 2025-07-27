import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const token = process.env.GITHUB_TOKEN;
const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4.1";

// Debug: Check if token is loaded
console.log('GitHub Token loaded:', token ? 'Yes' : 'No');
console.log('Token length:', token ? token.length : 0);

// Initialize Azure AI client for GitHub Models
const client = ModelClient(
  endpoint,
  new AzureKeyCredential(token),
);

// AI Co-founder personality and settings
const AI_COFOUNDER_CONFIG = {
  model: model,
  systemPrompt: `You are HiiNen, an advanced AI co-founder and business mentor integrated into the HiiNen platform. You help entrepreneurs build successful startups from idea to scale.

Your personality:
- Intelligent, supportive, and results-driven business partner
- Expert in all aspects of entrepreneurship and startup development
- Friendly but professional, with deep business acumen
- Proactive in offering insights and actionable recommendations
- Remember user context and build ongoing co-founder relationships
- Always focus on practical, implementable solutions

Your core expertise spans:
- Business strategy and planning (business model canvas, roadmaps)
- Market research and competitive intelligence
- Funding strategies and investor relations (seed to Series A+)
- Product development and MVP creation
- Marketing and customer acquisition strategies
- Financial modeling and projections
- Team building and leadership development
- Analytics and business metrics optimization

As an AI co-founder, you provide:
- Real-time business insights and recommendations
- Personalized guidance based on user's startup stage and industry
- Strategic advice for growth and scaling
- Market analysis and opportunity identification
- Risk assessment and mitigation strategies

Always respond as a trusted business partner who genuinely cares about the entrepreneur's success.`,
  
  temperature: 0.7, // Balanced creativity and consistency
  maxTokens: 1000,
  conversationMemory: true
};

// Function to get AI response
async function getAIResponse(userMessage, conversationHistory = []) {
  try {
    const messages = [
      {
        role: 'system',
        content: AI_COFOUNDER_CONFIG.systemPrompt
      },
      ...conversationHistory,
      {
        role: 'user',
        content: userMessage
      }
    ];

    const response = await client.path("/chat/completions").post({
      body: {
        messages: messages,
        temperature: AI_COFOUNDER_CONFIG.temperature,
        max_tokens: AI_COFOUNDER_CONFIG.maxTokens,
        model: AI_COFOUNDER_CONFIG.model
      }
    });

    if (isUnexpected(response)) {
      throw response.body.error;
    }

    return {
      success: true,
      response: response.body.choices[0].message.content,
      usage: response.body.usage
    };
  } catch (error) {
    console.error('AI Co-founder Error:', error);
    return {
      success: false,
      error: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.',
      details: error.message
    };
  }
}

// Function to generate business insights for dashboard
async function generateBusinessInsights(userData, requestType = 'dashboard_insights') {
  console.log('AI generateBusinessInsights - Processing request type:', requestType);
  console.log('AI generateBusinessInsights - User data:', JSON.stringify(userData, null, 2));

  let prompt;
  
  if (requestType === 'dashboard_insights') {
    prompt = `As HiiNen, your AI co-founder and business mentor, analyze this entrepreneur's profile and provide personalized business insights for their dashboard.

User Profile: ${JSON.stringify(userData)}

Provide insights in this exact JSON format:
{
  "success": true,
  "insights": [
    {"title": "Key Business Insight 1", "description": "Detailed analysis of current business status", "action": "Specific actionable recommendation", "priority": "high"},
    {"title": "Key Business Insight 2", "description": "Market opportunity or challenge identified", "action": "Strategic next step", "priority": "medium"},
    {"title": "Key Business Insight 3", "description": "Growth or optimization opportunity", "action": "Tactical implementation step", "priority": "medium"}
  ],
  "recommendations": [
    {"type": "immediate", "title": "Immediate Action", "description": "What to do right now"},
    {"type": "short_term", "title": "This Week", "description": "Weekly goal"},
    {"type": "long_term", "title": "This Month", "description": "Monthly objective"}
  ],
  "focusArea": "Primary area to focus on this week",
  "confidence": 95
}`;
  } else if (requestType === 'idea_validation') {
    prompt = `As HiiNen, validate this business idea and provide structured feedback:

Idea Data: ${JSON.stringify(userData)}

Provide validation in this exact JSON format:
{
  "success": true,
  "validation": {
    "score": 85,
    "strengths": ["Strong market demand", "Clear value proposition"],
    "weaknesses": ["High competition", "Regulatory challenges"],
    "opportunities": ["Market gap identified", "Timing advantage"],
    "threats": ["Market saturation", "Economic factors"],
    "recommendations": [
      {"priority": "high", "action": "Conduct market research"},
      {"priority": "medium", "action": "Develop MVP"},
      {"priority": "low", "action": "Build strategic partnerships"}
    ]
  },
  "nextSteps": ["Step 1", "Step 2", "Step 3"]
}`;
  } else {
    // Generic insights format
    prompt = `As HiiNen, provide business insights for this data:

Data: ${JSON.stringify(userData)}
Request Type: ${requestType}

Provide insights in JSON format with "success": true and relevant data structure.`;
  }

  console.log('AI generateBusinessInsights - Sending prompt to model');
  return await getAIResponse(prompt);
}

// Function to generate market analysis
async function generateMarketAnalysis(businessIdea, industry) {
  const prompt = `Analyze the market for this business idea: "${businessIdea}" in the ${industry} industry.
  
  Provide analysis in JSON format:
  {
    "marketSize": "Market size description",
    "competition": "Competition level and key players",
    "opportunities": ["opportunity1", "opportunity2", "opportunity3"],
    "threats": ["threat1", "threat2"],
    "recommendation": "Overall recommendation"
  }`;

  return await getAIResponse(prompt);
}

export {
  getAIResponse,
  generateBusinessInsights,
  generateMarketAnalysis,
  AI_COFOUNDER_CONFIG
};
