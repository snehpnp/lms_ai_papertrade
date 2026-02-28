import OpenAI from 'openai';
import { config } from '../../config';
import { BadRequestError } from '../../utils/errors';
import axios from 'axios';

const DISCLAIMER = `
You are an expert educational assistant for a versatile learning platform. You must NOT:
- Give absolute financial buy/sell recommendations or trading signals (if the topic is trading)
- Guarantee specific results or outcomes
- Provide personalized legal or professional advice outside of educational context
`.trim();

export const aiService = {
  // Generic AI Ask (OpenAI)
  async ask(userId: string, message: string, context?: { type: string; data?: unknown }) {
    if (!config.openai.apiKey) throw new BadRequestError('AI service not configured');
    const openai = new OpenAI({ apiKey: config.openai.apiKey });
    const systemContent = DISCLAIMER;
    const userContent = context?.type === 'performance'
      ? `User is asking about their performance. Context: ${JSON.stringify(context.data)}. User message: ${message}`
      : message;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: systemContent }, { role: 'user', content: userContent }],
      max_tokens: 1024,
      temperature: 0.5,
    });
    return { reply: completion.choices[0]?.message?.content ?? 'No response.', usage: completion.usage };
  },

  async getConceptExplanation(topic: string) {
    if (!config.groq.apiKey) throw new BadRequestError('AI service not configured');
    try {
      const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: DISCLAIMER },
          { role: 'user', content: `Explain the following concept in a clear, educational way (no trading advice): ${topic}` },
        ],
        max_tokens: 1024,
        temperature: 0.5,
      }, { headers: { 'Authorization': `Bearer ${config.groq.apiKey}` } });
      return { explanation: response.data.choices[0]?.message?.content ?? '' };
    } catch (e) {
      throw new BadRequestError('Failed to generate explanation');
    }
  },

  async analyzePerformance(userId: string, stats: { winRate: number; totalPnl: number; tradeCount: number }) {
    return this.ask(userId, 'Analyze my trading performance and suggest how I can improve my learning.', {
      type: 'performance',
      data: stats,
    });
  },

  // Course & Lesson Generation (Using Groq for speed & cost)
  async generateCourseDescription(title: string) {
    if (!config.groq.apiKey) throw new BadRequestError('Groq AI service not configured');
    try {
      const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are an expert educational content creator.' },
          { role: 'user', content: `Create a professional course description (approx 100-150 words) for: "${title}"` },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }, { headers: { 'Authorization': `Bearer ${config.groq.apiKey}` } });
      return { description: (response.data.choices[0]?.message?.content ?? '').trim() };
    } catch (error: any) {
      throw new BadRequestError('Failed to generate description from AI');
    }
  },

  async generateLessonDescription(title: string) {
    return this.generateCourseDescription(title);
  },

  async generateLessonContent(title: string, description: string) {
    if (!config.groq.apiKey) throw new BadRequestError('Groq AI service not configured');
    try {
      const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are an expert educational content creator. Format in clean HTML (h2, p, ul, li).' },
          { role: 'user', content: `Create detailed lesson content for: "${title}". Description: ${description}` },
        ],
        max_tokens: 1500,
      }, { headers: { 'Authorization': `Bearer ${config.groq.apiKey}` } });
      return { content: response.data.choices[0]?.message?.content ?? '' };
    } catch (e) {
      throw new BadRequestError('Failed to generate content');
    }
  },

  async generateQuizQuestions(title: string, content: string, count: number) {
    if (!config.groq.apiKey) throw new BadRequestError('Groq AI service not configured');
    try {
      const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are a quiz generator. Return ONLY a JSON object with a "questions" array of MCQs.' },
          { role: 'user', content: `Topic: ${title}. Content: ${content}. Create ${count} MCQs.` },
        ],
        response_format: { type: 'json_object' }
      }, { headers: { 'Authorization': `Bearer ${config.groq.apiKey}` } });
      const parsed = JSON.parse(response.data.choices[0]?.message?.content || '{"questions":[]}');
      return { questions: parsed.questions || [] };
    } catch (e) {
      return { questions: [] };
    }
  },

  async chatWithCourse(userId: string, courseTitle: string, history: any[], currentMessage: string, courseContent: string) {
    if (!config.groq.apiKey) throw new BadRequestError('AI service not configured');
    try {
      const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: `Assistant for course: ${courseTitle}. Content: ${courseContent.slice(0, 2000)}` },
          ...history.slice(-5),
          { role: 'user', content: currentMessage }
        ]
      }, { headers: { 'Authorization': `Bearer ${config.groq.apiKey}` } });
      return response.data.choices[0]?.message?.content ?? 'No response.';
    } catch (e) {
      return 'AI currently unavailable.';
    }
  },

  // Banner Generator (OpenAI -> Pollinations)
  async generateCourseBanner(title: string, description: string) {
    // Aggressive sanitization: replace all non-alphanumeric chars with underscores for safe URL
    const safeTitle = title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();

    // 1. TRY OPENAI (DALL-E 3)
    if (config.openai.apiKey) {
      try {
        const openai = new OpenAI({ apiKey: config.openai.apiKey });
        const response = await openai.images.generate({
          model: "dall-e-3",
          prompt: `Professional cinematic educational banner for "${title}". Dark theme, orange accents, high-quality, TradeLearn Pro branding.`,
          n: 1,
          size: "1024x1024",
        });
        if (response.data?.[0]?.url) return { url: response.data[0].url };
      } catch (error) { }
    }

    // 2. FREE FALLBACK (Pollinations - Direct Image Access)
    const seed = Math.floor(Math.random() * 999999);
    const freeImageUrl = `https://image.pollinations.ai/prompt/professional_cinematic_educational_banner_for_${safeTitle}_TradeLearn_Pro_branding_dark_theme_orange_accents?width=1024&height=1024&model=flux&nologo=true&seed=${seed}`;

    return { url: freeImageUrl };
  },
};
