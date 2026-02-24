import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Zap, IndianRupee, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import tradeService from "@/services/trade.service";

const TradePlacementPage = () => {
    const [searchParams] = useSearchParams();
    const [symbol, setSymbol] = useState(searchParams.get("symbol") || "");
    const [symbolId, setSymbolId] = useState(searchParams.get("symbolId") || "");
    const [side, setSide] = useState<"BUY" | "SELL">((searchParams.get("side") as any) || "BUY");
    const [orderType, setOrderType] = useState<"MARKET" | "LIMIT">("MARKET");
    const [quantity, setQuantity] = useState("1");
    const [price, setPrice] = useState("100.00");
    const [loading, setLoading] = useState(false);
    const [availableBalance, setAvailableBalance] = useState<number>(0);

    useEffect(() => {
        tradeService.getWalletBalance().then(res => setAvailableBalance(res.balance));
    }, []);

    const estimatedCost = parseFloat(price || "0") * parseInt(quantity || "0");
    const isInsufficient = estimatedCost > availableBalance;

    const handlePlaceOrder = async () => {
        if (!symbol) { toast.error("Select a symbol"); return; }
        try {
            setLoading(true);
            await tradeService.placeOrder({
                symbolId,
                symbol,
                side,
                quantity: parseInt(quantity),
                price: parseFloat(price),
                orderType
            });
            toast.success(`${side} Order placed for ${symbol}`);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Order failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 pb-20">
            <PageHeader title="Execution Terminal" subtitle="Place your market or limit orders" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <Card className="lg:col-span-5 xl:col-span-4 border-2 border-primary/10 shadow-xl overflow-hidden">
                    <CardHeader className="bg-primary/5 border-b border-primary/10">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-lg font-black uppercase tracking-tight">Order Form</CardTitle>
                            <Badge variant="secondary" className="font-bold">Live</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-muted-foreground pl-1">Selected Stock</label>
                            <div className="relative">
                                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <Input value={symbol} readOnly className="pl-9 h-12 font-bold bg-muted/20" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant={side === "BUY" ? "default" : "outline"}
                                className={cn("h-12 font-black", side === "BUY" ? "bg-profit hover:bg-profit/90" : "")}
                                onClick={() => setSide("BUY")}
                            >BUY</Button>
                            <Button
                                variant={side === "SELL" ? "default" : "outline"}
                                className={cn("h-12 font-black", side === "SELL" ? "bg-loss hover:bg-loss/90" : "")}
                                onClick={() => setSide("SELL")}
                            >SELL</Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-muted-foreground pl-1">Quantity</label>
                                <Input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} className="h-12 text-center text-lg font-black" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-muted-foreground pl-1">Type</label>
                                <div className="grid grid-cols-2 bg-muted p-1 rounded-lg h-12">
                                    <button onClick={() => setOrderType("MARKET")} className={cn("text-[10px] font-black rounded-md", orderType === "MARKET" ? "bg-background shadow-sm" : "opacity-50")}>MKT</button>
                                    <button onClick={() => setOrderType("LIMIT")} className={cn("text-[10px] font-black rounded-md", orderType === "LIMIT" ? "bg-background shadow-sm" : "opacity-50")}>LMT</button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-muted-foreground pl-1">{orderType === "MARKET" ? "LTP (Last Price)" : "Price"}</label>
                            <div className="relative">
                                <Input type="number" value={price} onChange={e => setPrice(e.target.value)} className="h-12 pl-8 text-lg font-black" />
                                <IndianRupee className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            </div>
                        </div>

                        <div className={cn("p-4 rounded-xl border flex flex-col gap-2", isInsufficient ? "bg-loss/10 border-loss/30" : "bg-muted/50 border-border")}>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold uppercase text-muted-foreground">Estimate Cost</span>
                                <span className={cn("text-sm font-black", isInsufficient ? "text-loss" : "")}>₹{estimatedCost.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-border/10">
                                <span className="text-[10px] font-bold uppercase text-muted-foreground">Available Ballance</span>
                                <span className="text-[10px] font-black">₹{availableBalance.toLocaleString()}</span>
                            </div>
                            {isInsufficient && (
                                <p className="text-[10px] font-bold text-loss mt-1 animate-pulse uppercase">Insufficient Funds</p>
                            )}
                        </div>

                        <Button
                            className={cn("w-full h-14 font-black text-lg tracking-widest shadow-lg", side === "BUY" ? "bg-profit hover:bg-profit/90" : "bg-loss hover:bg-loss/90")}
                            onClick={handlePlaceOrder}
                            disabled={loading || !symbol || isInsufficient}
                        >
                            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : `${side} ${symbol || "Select Stock"}`}
                        </Button>
                    </CardContent>
                </Card>

                <div className="lg:col-span-1 xl:col-span-8 space-y-6">
                    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                        <CardHeader>
                            <CardTitle className="text-xl font-black">{symbol || "No Symbol Selected"}</CardTitle>
                            <CardDescription>Trading session active • Virtual currency enabled</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!symbol ? (
                                <div className="py-10 text-center text-muted-foreground">
                                    <Zap className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">Please select a stock from watchlist to start trading</p>
                                </div>
                            ) : (
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-muted-foreground">Quote</p>
                                        <p className="text-4xl font-black text-profit">₹{price}</p>
                                    </div>
                                    <Badge variant="outline" className="text-profit border-profit font-black">+2.45% (Today)</Badge>
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
