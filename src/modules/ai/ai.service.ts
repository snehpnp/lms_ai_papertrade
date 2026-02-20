import OpenAI from 'openai';
import { config } from '../../config';
import { BadRequestError } from '../../utils/errors';

const DISCLAIMER = `
You are an educational assistant for a trading and investing learning platform. You must NOT:
- Give buy/sell recommendations or trading signals
- Guarantee profits or specific returns
- Provide personalized financial advice
- Recommend specific securities or entry/exit points

You MAY explain concepts, analyze learning progress, suggest study improvements, and explain market concepts in an educational way.
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
};
