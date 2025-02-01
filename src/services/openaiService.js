// src/services/openaiService.js
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function analyzeWatchData(watchData, userInput = '') {
  try {
    const prompt = `
      Analyze the following health metrics and determine the user's mental state:
      
      Current Health Data:
      - Heart Rate: ${watchData.heartRate} bpm
      - Blood Oxygen: ${watchData.bloodOxygen}%
      - Stress Level: ${watchData.stressLevel || 'N/A'}/100
      - Steps: ${watchData.steps}
      - Calories Burned: ${watchData.calories}  // using 'calories' as in your watchData
      
      User Input: "${userInput}"

      Based on this data, please:
      1. Determine if the user is "stressed", "relaxed", or "neutral"
      2. Provide a brief reasoning for this assessment
      3. Suggest 2-3 actions to improve their state if needed

      Format the response as JSON:
      {
        "mentalState": "stressed|neutral|relaxed",
        "confidence": 0.0-1.0,
        "analysis": {
          "reasoning": "brief explanation",
          "suggestedActions": ["action1", "action2"]
        }
      }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4", // Update to the correct model identifier if necessary
      messages: [
        {
          role: "system",
          content: "You are a wellness analysis AI. Respond only with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
      // Remove response_format if not needed or adjust according to your library version
    });

    // Extract and parse the response content
    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('No content in OpenAI response');
    }
    
    const analysis = JSON.parse(responseContent);
    return analysis;
  } catch (error) {
    console.error('OpenAI analysis error:', error);
    throw new Error(`Failed to analyze health data: ${error.message}`);
  }
}
