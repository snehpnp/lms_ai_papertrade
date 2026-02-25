import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Zap, IndianRupee, Loader2, Search, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import tradeService from "@/services/trade.service";

interface SymbolItem {
    id: number;
    symbol: string;
    tradingSymbol: string;
    exchange: string;
}

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
        if (querySymbol && queryId) {
            setSymbol(querySymbol);
            setSymbolId(queryId);
            setSearchQuery(querySymbol);
        }
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
        setSearchQuery(item.tradingSymbol);
        setIsDropdownOpen(false);
        setSearchParams({ symbol: item.tradingSymbol, symbolId: item.id.toString(), side });
    };

    const estimatedCost = (orderType === "LIMIT" ? parseFloat(price || "0") : 0) * parseInt(quantity || "0");
    const formattedCost = orderType === "MARKET" ? "Market Approx" : `₹${estimatedCost.toLocaleString("en-IN")}`;

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
                price: orderType === "LIMIT" ? parseFloat(price) : undefined,
                orderType
            });
            toast.success(`${side} order submitted for ${symbol}`);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Order placement failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-6 pb-20 fade-in">
            <PageHeader title="Execution Terminal" subtitle="Place fast, reliable market or limit orders" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Main Order Panel */}
                <Card className="lg:col-span-6 xl:col-span-5 border-border shadow-sm overflow-visible bg-card">
                    <CardHeader className="pb-4 border-b border-border/50">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-base font-semibold">New Order</CardTitle>
                            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">VIRTUAL</span>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-5 pt-6">

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
                                                <p className="text-[10px] text-muted-foreground">{item.symbol}</p>
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

                        {/* Order Type Toggle */}
                        <div className="bg-muted/50 p-1 rounded-lg flex mt-2 border border-border/50">
                            <button
                                onClick={() => { setSide("BUY"); setSearchParams({ symbol: symbol || "", symbolId: symbolId || "", side: "BUY" }); }}
                                className={cn(
                                    "flex-1 text-sm font-medium py-2 rounded-md transition-all duration-200",
                                    side === "BUY" ? "bg-background text-profit shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                BUY
                            </button>
                            <button
                                onClick={() => { setSide("SELL"); setSearchParams({ symbol: symbol || "", symbolId: symbolId || "", side: "SELL" }); }}
                                className={cn(
                                    "flex-1 text-sm font-medium py-2 rounded-md transition-all duration-200",
                                    side === "SELL" ? "bg-background text-loss shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground"
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
                                    <Input value="MKT" readOnly className="font-mono text-base bg-muted/30 text-muted-foreground text-center pointer-events-none" />
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

                        {/* Order Summary Summary Panel */}
                        <div className={cn(
                            "p-4 rounded-lg border transition-colors",
                            isInsufficient ? "bg-red-500/5 border-red-500/20" : "bg-muted/30 border-border"
                        )}>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground font-medium">Margin Required</span>
                                    <span className={cn("font-medium", isInsufficient ? "text-loss" : "font-semibold")}>
                                        {formattedCost}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-muted-foreground">Available Margin</span>
                                    <span>₹{availableBalance.toLocaleString("en-IN")}</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        <Button
                            className={cn(
                                "w-full h-12 text-sm font-semibold tracking-wide shadow-sm transition-all",
                                side === "BUY" ? "bg-profit hover:bg-profit/90 text-white" : "bg-loss hover:bg-loss/90 text-white"
                            )}
                            onClick={handlePlaceOrder}
                            disabled={loading || !symbol || isInsufficient}
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                `PLACE ${side} ORDER`
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
                                        <p className="text-sm text-muted-foreground mt-1">Current simulation asset target</p>

                                        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-6">
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground mb-1">Status</p>
                                                <div className="flex items-center gap-1.5 text-sm font-medium">
                                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                                    Market Open
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground mb-1">Exchange</p>
                                                <p className="text-sm font-medium">NSE / BSE</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground mb-1">Pricing Model</p>
                                                <p className="text-sm font-medium text-amber-500">Virtual (Demo)</p>
                                            </div>
                                        </div>
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
