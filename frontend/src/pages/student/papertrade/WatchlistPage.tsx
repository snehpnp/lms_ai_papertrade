import { useRef } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Loader2, Activity, Maximize2
} from "lucide-react";
import { useLivePrices } from "@/hooks/useLivePrice";
import TradingChart, { TradingChartRef } from "@/components/trading/TradingChart";
import TradeModal from "@/components/trading/TradeModal";
import { useWatchlistStore } from "@/store/watchlistStore";
import { useState } from "react";

const WatchlistPage = () => {
    const { selectedItem } = useWatchlistStore();
    const chartRef = useRef<TradingChartRef>(null);

    // Trade Modal Local State
    const [tradeModal, setTradeModal] = useState<{
        isOpen: boolean;
        symbol: string;
        symbolId: string;
        exchange: string;
        token: string;
        side: "BUY" | "SELL";
    }>({
        isOpen: false,
        symbol: "",
        symbolId: "",
        exchange: "",
        token: "",
        side: "BUY"
    });

    const channels = selectedItem ? [{
        exchange: selectedItem.symbol.exchange,
        token: selectedItem.symbol.token,
    }] : [];

    const { prices: livePrices } = useLivePrices(channels, channels.length > 0);
    const symbolKey = selectedItem ? `${selectedItem.symbol.exchange}|${selectedItem.symbol.token}` : null;
    const currentPriceData = symbolKey ? livePrices.get(symbolKey) : null;

    if (!selectedItem) {
        return (
            <div className="h-[calc(100vh-120px)] flex flex-col items-center justify-center opacity-30 select-none">
                <Activity className="h-16 w-16 mb-4 stroke-1" />
                <h2 className="text-xl font-black uppercase tracking-widest text-center">Open Trading Terminal</h2>
                <p className="text-xs font-semibold mt-1">Select a symbol from your watchlist to start analysis</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full -m-4 md:-m-6 gap-0 bg-background overflow-hidden relative">
            {/* Symbol Header */}
            <div className="p-4 md:p-6 border-b border-border bg-card flex flex-col md:flex-row md:items-center justify-between shrink-0 gap-4">
                <div className="flex items-center justify-between md:justify-start gap-4 md:gap-6">
                    <div>
                        <h1 className="text-xl md:text-3xl font-black tracking-tighter leading-none flex items-center gap-2 uppercase">
                            {selectedItem.symbol.tradingSymbol}
                        </h1>
                        <p className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase mt-1 tracking-widest">{selectedItem.symbol.symbol} • {selectedItem.symbol.exchange}</p>
                    </div>

                    <div className="md:pl-6 md:border-l md:border-border h-10 flex flex-col justify-center text-right md:text-left">
                        {currentPriceData ? (
                            <div className="flex flex-col md:flex-row items-end md:items-center gap-1 md:gap-3">
                                <span className="text-lg md:text-2xl font-black font-mono leading-none">
                                    ₹{parseFloat(currentPriceData.lp).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                </span>
                                <Badge className={cn("text-[9px] md:text-[11px] font-black border-none h-5 px-1.5", parseFloat(currentPriceData.pc) >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500")}>
                                    {parseFloat(currentPriceData.pc) >= 0 ? "+" : ""}{parseFloat(currentPriceData.pc).toFixed(2)}%
                                </Badge>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin text-muted-foreground" />
                                <span className="text-[9px] md:text-[10px] text-muted-foreground font-black uppercase tracking-tighter">Connecting...</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                    <Button
                        className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 md:px-8 h-10 md:h-11 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all text-xs md:text-sm uppercase tracking-tight"
                        onClick={() => setTradeModal({
                            isOpen: true,
                            symbol: selectedItem.symbol.tradingSymbol,
                            symbolId: selectedItem.symbolId,
                            exchange: selectedItem.symbol.exchange,
                            token: selectedItem.symbol.token,
                            side: "BUY"
                        })}
                    >
                        BUY
                    </Button>
                    <Button
                        className="flex-1 md:flex-none bg-rose-600 hover:bg-rose-700 text-white font-black px-6 md:px-8 h-10 md:h-11 shadow-lg shadow-rose-500/20 active:scale-95 transition-all text-xs md:text-sm uppercase tracking-tight"
                        onClick={() => setTradeModal({
                            isOpen: true,
                            symbol: selectedItem.symbol.tradingSymbol,
                            symbolId: selectedItem.symbolId,
                            exchange: selectedItem.symbol.exchange,
                            token: selectedItem.symbol.token,
                            side: "SELL"
                        })}
                    >
                        SELL
                    </Button>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-6 space-y-6">
                {/* Advanced Chart */}
                <Card className="border-border/50 shadow-2xl bg-card overflow-hidden rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between px-6 py-4 bg-muted/20 border-b border-border/50">
                        <div className="flex items-center gap-3">
                            <Activity className="h-4 w-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Interactive Analysis</span>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => chartRef.current?.refresh()}>
                                <Activity className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                                <Maximize2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <TradingChart
                            ref={chartRef}
                            symbol={selectedItem.symbol.tradingSymbol}
                            exchange={selectedItem.symbol.exchange}
                            token={selectedItem.symbol.token}
                        />
                    </CardContent>
                </Card>

                {/* Market Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 pb-4">
                    {[
                        { label: "High", value: currentPriceData?.h ?? "—", color: "text-emerald-500" },
                        { label: "Low", value: currentPriceData?.l ?? "—", color: "text-rose-500" },
                        { label: "Open", value: currentPriceData?.o ?? "—", color: "text-muted-foreground" },
                        { label: "Volume", value: currentPriceData?.v ?? "—", color: "text-primary" },
                    ].map((stat, i) => (
                        <div key={i} className="bg-card border border-border/40 p-4 md:p-5 rounded-2xl shadow-sm hover:border-primary/20 transition-colors">
                            <p className="text-[9px] md:text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest mb-1">{stat.label}</p>
                            <p className={cn("text-base md:text-xl font-black font-mono tracking-tight", stat.color)}>
                                {stat.value !== "—" ? (stat.label === "Volume" ? parseInt(stat.value as string).toLocaleString() : parseFloat(stat.value as string).toLocaleString("en-IN", { minimumFractionDigits: 2 })) : "—"}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <TradeModal
                isOpen={tradeModal.isOpen}
                onClose={() => setTradeModal(prev => ({ ...prev, isOpen: false }))}
                symbol={tradeModal.symbol}
                symbolId={tradeModal.symbolId}
                exchange={tradeModal.exchange}
                token={tradeModal.token}
                initialSide={tradeModal.side}
            />
        </div>
    );
};

export default WatchlistPage;
