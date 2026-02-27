import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Zap, IndianRupee, Loader2, Search, CheckCircle2, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import tradeService, { SymbolItem } from "@/services/trade.service";
import { useLivePrice } from "@/hooks/useLivePrice";

const TradePlacementPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // Form States
    const [symbol, setSymbol] = useState(searchParams.get("symbol") || "");
    const [symbolId, setSymbolId] = useState(searchParams.get("symbolId") || "");
    const [side, setSide] = useState<"BUY" | "SELL">((searchParams.get("side") as any) || "BUY");
    const [orderType, setOrderType] = useState<"MARKET" | "LIMIT">("MARKET");
    const [quantity, setQuantity] = useState("1");
    const [price, setPrice] = useState("");
    const [loading, setLoading] = useState(false);

    // Selected symbol exchange + token for live price
    const [selectedExchange, setSelectedExchange] = useState(searchParams.get("exchange") || "");
    const [selectedToken, setSelectedToken] = useState(searchParams.get("token") || "");

    // Live Price Hook — passes exchange|token to Alice Blue WebSocket
    const { lastPrice, change, price: priceData, connected: priceConnected, loading: priceLoading } = useLivePrice({
        exchange: selectedExchange,
        token: selectedToken,
        enabled: !!selectedExchange && !!selectedToken,
    });

    // Balance
    const [availableBalance, setAvailableBalance] = useState<number>(0);

    // Search Logic
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SymbolItem[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        tradeService.getWalletBalance().then(res => setAvailableBalance(res.balance));
    }, []);

    // Watch query parameter updates externally
    useEffect(() => {
        const querySymbol = searchParams.get("symbol");
        const queryId = searchParams.get("symbolId");
        const queryExchange = searchParams.get("exchange");
        const queryToken = searchParams.get("token");
        if (querySymbol && queryId) {
            setSymbol(querySymbol);
            setSymbolId(queryId);
            setSearchQuery(querySymbol);
        }
        if (queryExchange) setSelectedExchange(queryExchange);
        if (queryToken) setSelectedToken(queryToken);
    }, [searchParams]);

    // Handle Symbol Search
    useEffect(() => {
        if (!searchQuery || searchQuery.length < 2) {
            setSearchResults([]);
            return;
        }

        // If query perfectly matches selected, don't perform search automatically
        if (searchQuery === symbol) return;

        const timer = setTimeout(async () => {
            try {
                setSearchLoading(true);
                const res = await tradeService.searchSymbols({ q: searchQuery, limit: 10 });
                setSearchResults(res.items || []);
                setIsDropdownOpen(true);
            } catch (err) {
                console.error("Search failed:", err);
            } finally {
                setSearchLoading(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, symbol]);

    const handleSelectSymbol = (item: SymbolItem) => {
        setSymbol(item.tradingSymbol);
        setSymbolId(item.id.toString());
        setSelectedExchange(item.exchange);
        setSelectedToken(item.token);
        setSearchQuery(item.tradingSymbol);
        setIsDropdownOpen(false);
        setSearchParams({
            symbol: item.tradingSymbol,
            symbolId: item.id.toString(),
            exchange: item.exchange,
            token: item.token,
            side,
        });
    };

    // Use live price for estimated cost when market order
    const liveOrInputPrice = orderType === "MARKET" ? (lastPrice || 0) : parseFloat(price || "0");
    const estimatedCost = liveOrInputPrice * parseInt(quantity || "0");
    const formattedCost = orderType === "MARKET"
        ? (lastPrice ? `≈ ₹${estimatedCost.toLocaleString("en-IN")}` : "Market Approx")
        : `₹${estimatedCost.toLocaleString("en-IN")}`;

    // Only strictly block if limit order definitively exceeds funds
    const isInsufficient = orderType === "LIMIT" && estimatedCost > availableBalance;

    const handlePlaceOrder = async () => {
        if (!symbol) { toast.error("Select a symbol"); return; }
        if (!quantity || parseInt(quantity) <= 0) { toast.error("Enter valid quantity"); return; }
        if (orderType === "LIMIT" && (!price || parseFloat(price) <= 0)) { toast.error("Enter valid limit price"); return; }

        try {
            setLoading(true);
            await tradeService.placeOrder({
                symbolId,
                symbol,
                side,
                quantity: parseInt(quantity),
                price: orderType === "LIMIT" ? parseFloat(price) : (lastPrice || undefined),
                orderType
            });
            toast.success(`${side} order submitted for ${symbol}`);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Order placement failed");
        } finally {
            setLoading(false);
        }
    };

    const isPositiveChange = change !== null && change >= 0;

    return (
        <div className="space-y-4 md:space-y-6 max-w-5xl mx-auto p-4 md:p-6 pb-24 fade-in">
            <PageHeader title="Execution Terminal" subtitle="Fast market or limit orders" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Main Order Panel */}
                <Card className="lg:col-span-6 xl:col-span-5 border-border shadow-md overflow-visible bg-card rounded-2xl">
                    <CardHeader className="pb-4 border-b border-border/50">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-sm md:text-base font-bold uppercase tracking-tight">New Order</CardTitle>
                            <span className="text-[9px] font-black text-muted-foreground bg-muted px-2 py-0.5 rounded-full uppercase tracking-widest">Virtual</span>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">

                        {/* Search Input Box */}
                        <div className="space-y-1.5 relative">
                            <label className="text-xs font-medium text-muted-foreground">Select Instrument</label>
                            <div className="relative">
                                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setIsDropdownOpen(true);
                                    }}
                                    onFocus={() => {
                                        if (searchResults.length > 0) setIsDropdownOpen(true);
                                    }}
                                    placeholder="Search stocks (e.g. RELIANCE, TATAMOTORS)"
                                    className="pl-9 bg-background focus-visible:ring-1"
                                />
                                {searchLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
                            </div>

                            {/* Autocomplete Dropdown */}
                            {isDropdownOpen && searchResults.length > 0 && (
                                <div className="absolute top-[68px] left-0 w-full bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                                    {searchResults.map(item => (
                                        <div
                                            key={item.id}
                                            onClick={() => handleSelectSymbol(item)}
                                            className="px-4 py-3 hover:bg-muted/50 cursor-pointer flex justify-between items-center border-b border-border/50 last:border-0"
                                        >
                                            <div>
                                                <p className="text-sm font-medium">{item.tradingSymbol}</p>
                                                <p className="text-[10px] text-muted-foreground">{item.symbol} • Token: {item.token}</p>
                                            </div>
                                            <Badge variant="outline" className="text-[9px] uppercase">{item.exchange}</Badge>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {isDropdownOpen && searchQuery.length >= 2 && searchResults.length === 0 && !searchLoading && (
                                <div className="absolute top-[68px] left-0 w-full bg-card border border-border rounded-lg shadow-xl z-50 p-4 text-center">
                                    <p className="text-xs text-muted-foreground">No stocks found</p>
                                </div>
                            )}
                        </div>

                        {/* Live Price Display */}
                        {symbol && selectedExchange && selectedToken && (
                            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50">
                                <div className="flex items-center gap-2">
                                    <Activity className={cn("h-3.5 w-3.5", priceConnected ? "text-green-500" : "text-muted-foreground")} />
                                    <span className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">Live Price</span>
                                </div>
                                {priceLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                ) : lastPrice ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg md:text-2xl font-black font-mono">₹{lastPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                        {change !== null && (
                                            <span className={cn("text-[11px] md:text-xs font-black flex items-center gap-0.5 px-1.5 py-0.5 rounded-full", isPositiveChange ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss")}>
                                                {isPositiveChange ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                                {isPositiveChange ? "+" : ""}{change.toFixed(2)}%
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-xs text-muted-foreground font-bold">Connecting...</span>
                                )}
                            </div>
                        )}

                        {/* Order Side Toggle */}
                        <div className="bg-muted/50 p-1 rounded-xl flex mt-2 border border-border/50">
                            <button
                                onClick={() => { setSide("BUY"); setSearchParams({ symbol: symbol || "", symbolId: symbolId || "", exchange: selectedExchange, token: selectedToken, side: "BUY" }); }}
                                className={cn(
                                    "flex-1 text-xs md:text-sm font-black py-2.5 rounded-lg transition-all duration-200 uppercase tracking-widest",
                                    side === "BUY" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                BUY
                            </button>
                            <button
                                onClick={() => { setSide("SELL"); setSearchParams({ symbol: symbol || "", symbolId: symbolId || "", exchange: selectedExchange, token: selectedToken, side: "SELL" }); }}
                                className={cn(
                                    "flex-1 text-xs md:text-sm font-black py-2.5 rounded-lg transition-all duration-200 uppercase tracking-widest",
                                    side === "SELL" ? "bg-rose-600 text-white shadow-lg shadow-rose-500/20" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                SELL
                            </button>
                        </div>

                        {/* Order Details Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Quantity</label>
                                <Input
                                    type="number"
                                    value={quantity}
                                    onChange={e => setQuantity(e.target.value)}
                                    className="font-mono text-base bg-background"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground flex justify-between">
                                    <span>{orderType === "MARKET" ? "Market Price" : "Limit Price"}</span>
                                    <span
                                        onClick={() => setOrderType(orderType === "MARKET" ? "LIMIT" : "MARKET")}
                                        className="text-primary hover:underline cursor-pointer"
                                    >
                                        Type: {orderType}
                                    </span>
                                </label>
                                {orderType === "MARKET" ? (
                                    <Input
                                        value={lastPrice ? `₹${lastPrice.toLocaleString("en-IN")}` : "MKT"}
                                        readOnly
                                        className="font-mono text-base bg-muted/30 text-muted-foreground text-center pointer-events-none"
                                    />
                                ) : (
                                    <div className="relative">
                                        <IndianRupee className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            type="number"
                                            value={price}
                                            onChange={e => setPrice(e.target.value)}
                                            className="font-mono text-base pl-8 bg-background"
                                            placeholder="0.00"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Summary Panel */}
                        <div className={cn(
                            "p-3 md:p-4 rounded-xl border transition-colors",
                            isInsufficient ? "bg-red-500/5 border-red-500/20" : "bg-muted/30 border-border"
                        )}>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-xs md:text-sm">
                                    <span className="text-muted-foreground font-bold uppercase tracking-wider text-[10px]">Margin Used</span>
                                    <span className={cn("font-black", isInsufficient ? "text-loss" : "font-black text-primary")}>
                                        {formattedCost}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] md:text-xs">
                                    <span className="text-muted-foreground font-bold uppercase tracking-wider">Available</span>
                                    <span className="font-bold">₹{availableBalance.toLocaleString("en-IN")}</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        <Button
                            className={cn(
                                "w-full h-12 md:h-14 text-sm font-black tracking-widest shadow-xl transition-all rounded-xl uppercase",
                                side === "BUY" ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20" : "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20"
                            )}
                            onClick={handlePlaceOrder}
                            disabled={loading || !symbol || isInsufficient}
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                `EXECUTE ${side}`
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Info / Quote Panel */}
                <div className="lg:col-span-6 xl:col-span-7">
                    <Card className="bg-transparent border-none shadow-none">
                        <CardHeader className="px-0 pb-4">
                            <CardTitle className="text-lg font-medium">Market Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="px-0">
                            {!symbol ? (
                                <div className="p-12 text-center rounded-xl border border-dashed border-border/60 bg-muted/10">
                                    <Search className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                                    <p className="text-sm font-medium text-muted-foreground">Search and select an instrument</p>
                                    <p className="text-xs text-muted-foreground/70 mt-1">Instrument details will appear here.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="p-6 rounded-xl border border-border bg-card shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                                            <Zap className="h-32 w-32" />
                                        </div>
                                        <Badge variant="outline" className="mb-4 bg-muted/50 backdrop-blur-sm border-primary/20 text-primary">Paper Trading Mode Active</Badge>
                                        <h2 className="text-3xl font-bold tracking-tight">{symbol}</h2>

                                        {/* Live Price Display */}
                                        {lastPrice ? (
                                            <div className="flex items-baseline gap-3 mt-2">
                                                <span className="text-2xl font-bold font-mono text-foreground">
                                                    ₹{lastPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                                </span>
                                                {change !== null && (
                                                    <span className={cn("text-sm font-semibold flex items-center gap-1", isPositiveChange ? "text-profit" : "text-loss")}>
                                                        {isPositiveChange ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                                        {isPositiveChange ? "+" : ""}{change.toFixed(2)}%
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {priceLoading ? "Loading live price..." : "Current simulation asset target"}
                                            </p>
                                        )}

                                        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground mb-1">Status</p>
                                                <div className="flex items-center gap-1.5 text-sm font-medium">
                                                    <span className={cn("w-2 h-2 rounded-full", priceConnected ? "bg-green-500 animate-pulse" : "bg-yellow-500")}></span>
                                                    {priceConnected ? "Live" : "Connecting"}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground mb-1">Exchange</p>
                                                <p className="text-sm font-medium">{selectedExchange}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground mb-1">Token</p>
                                                <p className="text-sm font-medium font-mono">{selectedToken}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground mb-1">Mode</p>
                                                <p className="text-sm font-medium text-amber-500">Virtual (Demo)</p>
                                            </div>
                                        </div>

                                        {/* OHLC Data from live feed */}
                                        {priceData && (priceData.o || priceData.h || priceData.l || priceData.c) && (
                                            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-muted/30 border border-border/50">
                                                <div className="text-center md:text-left">
                                                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Open</p>
                                                    <p className="text-sm md:text-base font-mono font-black">{priceData.o || "—"}</p>
                                                </div>
                                                <div className="text-center md:text-left">
                                                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">High</p>
                                                    <p className="text-sm md:text-base font-mono font-black text-emerald-500">{priceData.h || "—"}</p>
                                                </div>
                                                <div className="text-center md:text-left">
                                                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Low</p>
                                                    <p className="text-sm md:text-base font-mono font-black text-rose-500">{priceData.l || "—"}</p>
                                                </div>
                                                <div className="text-center md:text-left">
                                                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Close</p>
                                                    <p className="text-sm md:text-base font-mono font-black">{priceData.c || "—"}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2 p-3 bg-muted/40 rounded-lg border border-border text-xs text-muted-foreground">
                                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                                        <p>Orders placed in this terminal are for educational purposes. Real funds are never used or affected by these transactions.</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
};

export default TradePlacementPage;
