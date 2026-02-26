import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Zap, IndianRupee, Loader2, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import tradeService from "@/services/trade.service";
import { useLivePrice } from "@/hooks/useLivePrice";

interface TradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    symbol: string;
    symbolId: string;
    exchange: string;
    token: string;
    initialSide?: "BUY" | "SELL";
}

const TradeModal = ({ isOpen, onClose, symbol, symbolId, exchange, token, initialSide = "BUY" }: TradeModalProps) => {
    const [side, setSide] = useState<"BUY" | "SELL">(initialSide);
    const [orderType, setOrderType] = useState<"MARKET" | "LIMIT">("MARKET");
    const [quantity, setQuantity] = useState("1");
    const [price, setPrice] = useState("");
    const [loading, setLoading] = useState(false);
    const [availableBalance, setAvailableBalance] = useState<number>(0);

    const { lastPrice, change, connected: priceConnected, loading: priceLoading } = useLivePrice({
        exchange,
        token,
        enabled: isOpen && !!exchange && !!token,
    });

    useEffect(() => {
        if (isOpen) {
            tradeService.getWalletBalance().then(res => setAvailableBalance(res.balance));
            setSide(initialSide);
        }
    }, [isOpen, initialSide]);

    const liveOrInputPrice = orderType === "MARKET" ? (lastPrice || 0) : parseFloat(price || "0");
    const estimatedCost = liveOrInputPrice * parseInt(quantity || "0");
    const formattedCost = `₹${estimatedCost.toLocaleString("en-IN")}`;
    const isInsufficient = orderType === "LIMIT" && estimatedCost > availableBalance;

    const handlePlaceOrder = async () => {
        if (!symbol) return;
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
            onClose();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Order placement failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-border bg-card">
                <DialogHeader className="px-6 py-4 border-b border-border bg-muted/20">
                    <div className="flex justify-between items-center pr-6">
                        <DialogTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                            <Zap className="h-4 w-4 text-primary" /> Order Panel
                        </DialogTitle>
                        <Badge variant="outline" className="bg-primary/5 text-primary">VIRTUAL</Badge>
                    </div>
                </DialogHeader>

                <div className="p-6 space-y-6">
                    {/* Header Info */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xl font-black tracking-tighter">{symbol}</p>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{exchange} • {token}</p>
                        </div>
                        <div className="text-right">
                            {lastPrice ? (
                                <div className="space-y-0.5">
                                    <p className="text-lg font-black font-mono">₹{lastPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                                    {change !== null && (
                                        <p className={cn("text-[11px] font-bold flex items-center justify-end gap-1", change >= 0 ? "text-green-500" : "text-red-500")}>
                                            {change >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                                            {change >= 0 ? "+" : ""}{change.toFixed(2)}%
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground font-medium italic">Fetching LTP...</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Side Toggle */}
                    <div className="flex p-1 rounded-xl bg-muted/50 border border-border">
                        <button
                            onClick={() => setSide("BUY")}
                            className={cn(
                                "flex-1 py-2 text-xs font-black rounded-lg transition-all active:scale-95",
                                side === "BUY" ? "bg-green-500 text-white shadow-lg shadow-green-500/20" : "text-muted-foreground hover:bg-muted"
                            )}
                        >
                            BUY
                        </button>
                        <button
                            onClick={() => setSide("SELL")}
                            className={cn(
                                "flex-1 py-2 text-xs font-black rounded-lg transition-all active:scale-95",
                                side === "SELL" ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "text-muted-foreground hover:bg-muted"
                            )}
                        >
                            SELL
                        </button>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-muted-foreground">Quantity</label>
                            <Input
                                type="number"
                                value={quantity}
                                onChange={e => setQuantity(e.target.value)}
                                className="h-12 bg-muted/30 border-none font-mono text-base font-bold text-center"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-muted-foreground flex justify-between">
                                <span>{orderType} Price</span>
                                <span
                                    onClick={() => setOrderType(orderType === 'MARKET' ? 'LIMIT' : 'MARKET')}
                                    className="text-primary hover:underline cursor-pointer lowercase"
                                >
                                    toggle
                                </span>
                            </label>
                            {orderType === 'MARKET' ? (
                                <div className="h-12 flex items-center justify-center bg-muted/50 rounded-xl border border-dashed border-border text-muted-foreground text-sm font-bold opacity-60">
                                    Market Price
                                </div>
                            ) : (
                                <div className="relative">
                                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="number"
                                        value={price}
                                        onChange={e => setPrice(e.target.value)}
                                        className="h-12 pl-10 bg-muted/30 border-none font-mono text-base font-bold text-center"
                                        placeholder="0.00"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Summary */}
                    <div className={cn(
                        "p-4 rounded-xl border border-dashed transition-all",
                        isInsufficient ? "bg-red-500/5 border-red-500/30" : "bg-primary/5 border-primary/20"
                    )}>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Est. Capital</span>
                            <span className={cn("text-sm font-black italic", isInsufficient ? "text-red-500" : "text-primary")}>
                                {formattedCost}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Available</span>
                            <span className="text-[11px] font-bold">₹{availableBalance.toLocaleString("en-IN")}</span>
                        </div>
                    </div>

                    <Button
                        onClick={handlePlaceOrder}
                        disabled={loading || isInsufficient || (!lastPrice && orderType === 'MARKET')}
                        className={cn(
                            "w-full h-14 rounded-xl text-sm font-black uppercase tracking-widest shadow-xl transition-all active:scale-95",
                            side === "BUY" ? "bg-green-600 hover:bg-green-700 shadow-green-500/20" : "bg-red-600 hover:bg-red-700 shadow-red-500/20"
                        )}
                    >
                        {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : `Place ${side} Order`}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default TradeModal;
