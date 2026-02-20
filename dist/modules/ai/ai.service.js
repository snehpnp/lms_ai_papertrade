"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiService = void 0;
const openai_1 = __importDefault(require("openai"));
const config_1 = require("../../config");
const errors_1 = require("../../utils/errors");
const DISCLAIMER = `
You are an educational assistant for a trading and investing learning platform. You must NOT:
- Give buy/sell recommendations or trading signals
- Guarantee profits or specific returns
- Provide personalized financial advice
- Recommend specific securities or entry/exit points

You MAY explain concepts, analyze learning progress, suggest study improvements, and explain market concepts in an educational way.
`.trim();
exports.aiService = {
    async ask(userId, message, context) {
        if (!config_1.config.openai.apiKey)
            throw new errors_1.BadRequestError('AI service not configured');
        const openai = new openai_1.default({ apiKey: config_1.config.openai.apiKey });
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
    async getConceptExplanation(topic) {
        if (!config_1.config.openai.apiKey)
            throw new errors_1.BadRequestError('AI service not configured');
        const openai = new openai_1.default({ apiKey: config_1.config.openai.apiKey });
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
    async analyzePerformance(userId, stats) {
        return this.ask(userId, 'Analyze my trading performance and suggest how I can improve my learning.', {
            type: 'performance',
            data: stats,
        });
    },
};
//# sourceMappingURL=ai.service.js.map