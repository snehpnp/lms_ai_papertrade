import OpenAI from 'openai';
import { config } from '../../config';
import { BadRequestError } from '../../utils/errors';

const DISCLAIMER = `
You are an expert educational assistant for a versatile learning platform. You must NOT:
- Give absolute financial buy/sell recommendations or trading signals (if the topic is trading)
- Guarantee specific results or outcomes
- Provide personalized legal or professional advice outside of educational context

You MAY explain concepts, analyze learning progress, suggest study improvements, and explain complex topics in an educational way.
`.trim();

export const aiService = {
  async ask(userId: string, message: string, context?: { type: string; data?: unknown }) {
    if (!config.openai.apiKey) throw new BadRequestError('AI service not configured');

    const openai = new OpenAI({ apiKey: config.openai.apiKey });
    const systemContent = DISCLAIMER;

    const userContent = context?.type === 'performance'
      ? `User is asking about their performance. Context: ${JSON.stringify(context.data)}. User message: ${message}`
      : message;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemContent },
        { role: 'user', content: userContent },
      ],
      max_tokens: 1024,
      temperature: 0.5,
    });

    const reply = completion.choices[0]?.message?.content ?? 'No response generated.';
    return { reply, usage: completion.usage };
  },

  async getConceptExplanation(topic: string) {
    if (!config.openai.apiKey) throw new BadRequestError('AI service not configured');
    const openai = new OpenAI({ apiKey: config.openai.apiKey });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: DISCLAIMER },
        { role: 'user', content: `Explain the following concept in a clear, educational way (no trading advice): ${topic}` },
      ],
      max_tokens: 1024,
      temperature: 0.5,
    });
    return { explanation: completion.choices[0]?.message?.content ?? '' };
  },

  async analyzePerformance(userId: string, stats: { winRate: number; totalPnl: number; tradeCount: number }) {
    return this.ask(userId, 'Analyze my trading performance and suggest how I can improve my learning.', {
      type: 'performance',
      data: stats,
    });
  },

  async generateCourseDescription(title: string) {

    if (!config.groq.apiKey) throw new BadRequestError('Groq AI service not configured');

    // Using axios for Groq since it's OpenAI-compatible
    const axios = require('axios');
    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are an expert educational content creator. Your task is to write a compelling, professional, and clear course description for a learning platform based on a course title. Keep it engaging for students.',
            },
            {
              role: 'user',
              content: `Create a professional course description (approx 100-150 words) for a course titled: "${title}"`,
            },
          ],
          max_tokens: 500,
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer ${config.groq.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const description = response.data.choices[0]?.message?.content ?? '';
      return { description: description.trim() };
    } catch (error: any) {
      console.error('Groq API Error:', error.response?.data || error.message);
      throw new BadRequestError('Failed to generate description from AI');
    }
  },

  async generateLessonDescription(title: string) {
    if (!config.groq.apiKey) throw new BadRequestError('Groq AI service not configured');

    const axios = require('axios');
    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are an expert educational content creator. Your task is to write a concise and engaging lesson description based on a lesson title. Keep it clear and professional.',
            },
            {
              role: 'user',
              content: `Create a concise and engaging lesson description (approx 50-80 words) for a lesson titled: "${title}". The description should summarize what the student will learn.`,
            },
          ],
          max_tokens: 300,
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer ${config.groq.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const description = response.data.choices[0]?.message?.content ?? '';
      return { description: description.trim() };
    } catch (error: any) {
      console.error('Groq API Error:', error.response?.data || error.message);
      throw new BadRequestError('Failed to generate lesson description from AI');
    }
  },

  async generateLessonContent(title: string, description: string) {
    if (!config.groq.apiKey) throw new BadRequestError('Groq AI service not configured');

    const axios = require('axios');
    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are an expert educational content creator. Your task is to write detailed, educational lesson content formatted in clean HTML.',
            },
            {
              role: 'user',
              content: `Create a detailed and educational lesson content for a lesson titled: "${title}". 
              Description: ${description}
              The content should be formatted using clean HTML tags (<h2>, <p>, <ul>, <li>, <strong>). Include sections like Introduction, Key Concepts, Examples, and a Summary. Avoid <html>, <body>, or <head> tags. Ensure the information is accurate and helpful for students.`,
            },
          ],
          max_tokens: 1500,
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer ${config.groq.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const content = response.data.choices[0]?.message?.content ?? '';
      return { content: content.trim() };
    } catch (error: any) {
      console.error('Groq API Error:', error.response?.data || error.message);
      throw new BadRequestError('Failed to generate lesson content from AI');
    }
  },

  async generateQuizQuestions(title: string, content: string, count: number) {
    if (!config.groq.apiKey) throw new BadRequestError('Groq AI service not configured');

    const axios = require('axios');
    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are an expert quiz creator. Your task is to generate high-quality Multiple Choice Questions (MCQs) based on the topic or content provided.
              
              Instructions:
              1. Correct any obvious typos in the topic (e.g., "Indecators" -> "Indicators").
              2. Generate exactly the number of questions requested.
              3. Each question must be of type "MCQ".
              4. Each question must have exactly 4 options.
              5. Exactly one option must be marked as isCorrect: true.
              
              Output MUST be a valid JSON object with the following structure:
              {
                "questions": [
                  {
                    "question": "Question text here?",
                    "type": "MCQ",
                    "options": [
                      { "id": "1", "text": "Option 1", "isCorrect": true },
                      { "id": "2", "text": "Option 2", "isCorrect": false },
                      { "id": "3", "text": "Option 3", "isCorrect": false },
                      { "id": "4", "text": "Option 4", "isCorrect": false }
                    ]
                  }
                ]
              }
              Return ONLY the JSON object. No markdown formatting, no preamble.`,
            },
            {
              role: 'user',
              content: `Topic: "${title}"
              ${content ? `Context/Content: "${content.replace(/<[^>]*>?/gm, '')}"` : 'Use your general knowledge about this topic.'}
              Number of Questions to Generate: ${count}`,
            },
          ],
          max_tokens: 2500,
          temperature: 0.7,
          response_format: { type: 'json_object' }
        },
        {
          headers: {
            'Authorization': `Bearer ${config.groq.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const resultText = response.data.choices[0]?.message?.content ?? '{"questions": []}';
      const parsed = JSON.parse(resultText);
      const questions = parsed.questions || [];

      return { questions };
    } catch (error: any) {
      console.error('Groq Quiz API Error:', error.response?.data || error.message);
      throw new BadRequestError('Failed to generate quiz questions from AI');
    }
  },
};
