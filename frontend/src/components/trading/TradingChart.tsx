// TradingChart component for high-performance candlestick and volume visualization
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickSeries, HistogramSeries, CandlestickData } from 'lightweight-charts';
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

const TradingChart = forwardRef<TradingChartRef, TradingChartProps>(({ symbol, exchange, token, resolution }, ref) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candleSeriesRef = useRef<ISeriesApi<any> | null>(null);
    const volumeSeriesRef = useRef<ISeriesApi<any> | null>(null);

    const fetchData = async () => {
        if (!exchange || !token) return;

        try {
            const now = new Date();
            const fromDate = subDays(now, 200); // 30 days lookback
            const formatStr = 'yyyy-MM-dd';

            const data = await tradeService.getHistory({
                exchange,
                token,
                from: format(fromDate, formatStr),
                to: format(now, formatStr),
                resolution: "D"  // D 1
            });
            console.log(data);
            if (candleSeriesRef.current && data && Array.isArray(data)) {
                const formatted: CandlestickData[] = [];
                const volumeData: any[] = [];

                data.forEach(d => {
                    // Extract YYYY-MM-DD if resolution is 'D'
                    const timeStr = d.time.split(' ')[0];
                    const open = parseFloat(d.open);
                    const close = parseFloat(d.close);

                    formatted.push({
                        time: timeStr,
                        open,
                        high: parseFloat(d.high),
                        low: parseFloat(d.low),
                        close,
                    });

                    volumeData.push({
                        time: timeStr,
                        value: parseFloat(d.volume || 0),
                        color: close >= open ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)',
                    });
                });

                // Unique & Sort
                const uniqueCandles = formatted
                    .filter((v, i, a) => a.findIndex(t => t.time === v.time) === i)
                    .sort((a, b) => (a.time as string).localeCompare(b.time as string));

                const uniqueVolume = volumeData
                    .filter((v, i, a) => a.findIndex(t => t.time === v.time) === i)
                    .sort((a, b) => (a.time as string).localeCompare(b.time as string));

                candleSeriesRef.current.setData(uniqueCandles);
                if (volumeSeriesRef.current) {
                    volumeSeriesRef.current.setData(uniqueVolume);
                }

                if (chartRef.current) {
                    chartRef.current.timeScale().fitContent();
                }
            }
        } catch (err) {
            console.error('Chart Data Error:', err);
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
                fontSize: 10,
            },
            grid: {
                vertLines: { color: 'rgba(148, 163, 184, 0.05)' },
                horzLines: { color: 'rgba(148, 163, 184, 0.05)' },
            },
            width: chartContainerRef.current.clientWidth,
            height: 450,
            crosshair: {
                mode: 1, // Normal
                vertLine: { labelBackgroundColor: '#1e293b' },
                horzLine: { labelBackgroundColor: '#1e293b' },
            },
            timeScale: {
                borderColor: 'rgba(148, 163, 184, 0.1)',
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
            priceLineVisible: true,
            lastValueVisible: true,
        });

        const volumeSeries = chart.addSeries(HistogramSeries, {
            color: '#3b82f6',
            priceFormat: { type: 'volume' },
            priceScaleId: '', // Separate scale
        });

        volumeSeries.priceScale().applyOptions({
            scaleMargins: {
                top: 0.8, // Volume bars at the bottom
                bottom: 0,
            },
        });

        chartRef.current = chart;
        candleSeriesRef.current = candleSeries;
        volumeSeriesRef.current = volumeSeries;

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
