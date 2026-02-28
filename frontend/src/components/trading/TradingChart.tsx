import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickSeries, UTCTimestamp, CandlestickData } from 'lightweight-charts';
import tradeService from '@/services/trade.service';
import { format, subDays } from 'date-fns';

interface TradingChartProps {
    symbol: string | null;
    exchange: string | null;
    token: string | null;
    resolution?: string;
}

export interface TradingChartRef {
    refresh: () => void;
}

const TradingChart = forwardRef<TradingChartRef, TradingChartProps>(({ symbol, exchange, token, resolution = 'D' }, ref) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candleSeriesRef = useRef<ISeriesApi<any> | null>(null);

    const fetchData = async () => {
        if (!exchange || !token) return;

        try {
            const now = new Date();
            const fromDate = subDays(now, 5); // last 5 days
            const formatStr = 'yyyy-MM-dd';

            const data = await tradeService.getHistory({
                exchange,
                token,
                from: format(fromDate, formatStr),
                to: format(now, formatStr),
                resolution
            });

            if (candleSeriesRef.current && data) {
                // Formatting data for lightweight charts
                // Alice Blue usually returns [time, o, h, l, c, v] in seconds or ISO.
                // My backend service already maps this to {time, open, high, low, close}
                const formatted: CandlestickData[] = data.map(d => ({
                    time: (Math.floor(new Date(d.time).getTime() / 1000)) as UTCTimestamp, // Converting ms to seconds for chart
                    open: parseFloat(d.open),
                    high: parseFloat(d.high),
                    low: parseFloat(d.low),
                    close: parseFloat(d.close),
                })).sort((a, b) => (a.time as number) - (b.time as number));

                candleSeriesRef.current.setData(formatted);
            }
        } catch (err) {
            console.log('Chart Data Error:', err);
        }
    };

    useImperativeHandle(ref, () => ({
        refresh: fetchData
    }));

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#94a3b8',
            },
            grid: {
                vertLines: { color: 'rgba(148, 163, 184, 0.1)' },
                horzLines: { color: 'rgba(148, 163, 184, 0.1)' },
            },
            width: chartContainerRef.current.clientWidth,
            height: 400,
            crosshair: {
                mode: 1, // Normal
            },
            timeScale: {
                borderColor: 'rgba(148, 163, 184, 0.2)',
                timeVisible: true,
                secondsVisible: false,
            },
        });

        const candleSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#22c55e',
            downColor: '#ef4444',
            borderVisible: false,
            wickUpColor: '#22c55e',
            wickDownColor: '#ef4444',
        });

        chartRef.current = chart;
        candleSeriesRef.current = candleSeries;

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        window.addEventListener('resize', handleResize);

        fetchData();

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [exchange, token]);

    return (
        <div className="w-full relative">
            <div ref={chartContainerRef} className="w-full h-[450px]" />
            {!symbol && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
                    <p className="text-muted-foreground text-sm font-medium">Select a symbol to view chart</p>
                </div>
            )}
        </div>
    );
});

TradingChart.displayName = 'TradingChart';
export default TradingChart;
