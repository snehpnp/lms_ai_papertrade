import OpenAI from 'openai';
export declare const aiService: {
    ask(userId: string, message: string, context?: {
        type: string;
        data?: unknown;
    }): Promise<{
        reply: string;
        usage: OpenAI.Completions.CompletionUsage | undefined;
    }>;
    getConceptExplanation(topic: string): Promise<{
        explanation: string;
    }>;
    analyzePerformance(userId: string, stats: {
        winRate: number;
        totalPnl: number;
        tradeCount: number;
    }): Promise<{
        reply: string;
        usage: OpenAI.Completions.CompletionUsage | undefined;
    }>;
};
//# sourceMappingURL=ai.service.d.ts.map