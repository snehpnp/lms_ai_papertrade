import { useEffect, useRef, useState, useCallback } from "react";
import axiosInstance from "@/lib/axios";
import { getAccessToken } from "@/lib/token";

/* ── Types ── */
export interface LivePriceData {
    exchange: string;
    token: string;
    lp: string;       // last price
    pc?: string;      // percent change
    v?: string;       // volume
    h?: string;       // high
    l?: string;       // low
    o?: string;       // open
    c?: string;       // close
    bp1?: string;     // buy price 1
    sp1?: string;     // sell price 1
}

interface UseLivePriceOptions {
    exchange: string;
    token: string;
    enabled?: boolean; // default: true
}

interface UseLivePriceReturn {
    price: LivePriceData | null;
    lastPrice: number | null;
    change: number | null;
    loading: boolean;
    error: string | null;
    connected: boolean;
}

/* ── EventSource-based SSE hook for live price streaming ── */
export function useLivePrice({ exchange, token, enabled = true }: UseLivePriceOptions): UseLivePriceReturn {
    const [price, setPrice] = useState<LivePriceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [connected, setConnected] = useState(false);
    const eventSourceRef = useRef<EventSource | null>(null);


    useEffect(() => {
        if (!enabled || !exchange || !token) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        // Build SSE URL
        const baseUrl = axiosInstance.defaults.baseURL || "";
        const channel = `${exchange}|${token}`;

        // Get auth token (same key the app uses: "accessToken")
        const authToken = getAccessToken() || "";

        // We'll use fetch-based SSE since EventSource doesn't support custom headers
        const controller = new AbortController();

        const connectSSE = async () => {
            try {
                const response = await fetch(`${baseUrl}/market/live-stream?channels=${encodeURIComponent(channel)}`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Accept': 'text/event-stream',
                    },
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const reader = response.body?.getReader();
                if (!reader) throw new Error('No readable stream');

                const decoder = new TextDecoder();
                setConnected(true);
                setLoading(false);

                let buffer = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.slice(6));
                                if (data.lp) {
                                    setPrice(data);
                                }
                                if (data.type === 'connected') {
                                    setConnected(true);
                                }
                            } catch {
                                // ignore parse errors
                            }
                        }
                    }
                }
            } catch (err: any) {
                if (err.name !== 'AbortError') {
                    setError(err.message || 'Connection failed');
                    setConnected(false);
                    setLoading(false);
                }
            }
        };

        connectSSE();

        return () => {
            controller.abort();
            setConnected(false);
        };
    }, [exchange, token, enabled]);

    return {
        price,
        lastPrice: price?.lp ? parseFloat(price.lp) : null,
        change: price?.pc ? parseFloat(price.pc) : null,
        loading,
        error,
        connected,
    };
}

/* ── One-shot price fetch (non-streaming) ── */
export async function fetchLivePrice(exchange: string, token: string): Promise<LivePriceData | null> {
    try {
        const { data } = await axiosInstance.get(`/market/live-price`, {
            params: { exchange, token },
        });
        return data.success ? data.data : null;
    } catch {
        return null;
    }
}

/* ── Multi-channel streaming hook ── */
export function useLivePrices(channels: { exchange: string; token: string }[], enabled = true) {
    const [prices, setPrices] = useState<Map<string, LivePriceData>>(new Map());
    const [connected, setConnected] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!enabled || channels.length === 0) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const controller = new AbortController();

        const channelStr = channels.map(c => `${c.exchange}|${c.token}`).join(',');
        const baseUrl = axiosInstance.defaults.baseURL || "";
        const authToken = getAccessToken() || "";

        const connectSSE = async () => {
            try {
                const response = await fetch(`${baseUrl}/market/live-stream?channels=${encodeURIComponent(channelStr)}`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Accept': 'text/event-stream',
                    },
                    signal: controller.signal,
                });

                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                const reader = response.body?.getReader();
                if (!reader) throw new Error('No readable stream');

                const decoder = new TextDecoder();
                setConnected(true);
                setLoading(false);

                let buffer = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.slice(6));
                                if (data.lp && data.e && data.tk) {
                                    const key = `${data.e}|${data.tk}`;
                                    setPrices(prev => {
                                        const newMap = new Map(prev);
                                        newMap.set(key, data);
                                        return newMap;
                                    });
                                }
                            } catch {
                                // ignore
                            }
                        }
                    }
                }
            } catch (err: any) {
                if (err.name !== 'AbortError') {
                    setConnected(false);
                    setLoading(false);
                }
            }
        };

        connectSSE();

        return () => {
            controller.abort();
            setConnected(false);
        };
    }, [JSON.stringify(channels), enabled]);

    return { prices, connected, loading };
}
