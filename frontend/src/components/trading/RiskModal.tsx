import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingUp, TrendingDown, IndianRupee, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import tradeService from "@/services/trade.service";

interface RiskModalProps {
    isOpen: boolean;
    onClose: () => void;
    position: {
        id: string;
        symbol: string;
        target?: number;
        stopLoss?: number;
    } | null;
    onUpdate: () => void;
}

const RiskModal = ({ isOpen, onClose, position, onUpdate }: RiskModalProps) => {
    const [target, setTarget] = useState("");
    const [stopLoss, setStopLoss] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (position) {
            setTarget(position.target?.toString() || "");
            setStopLoss(position.stopLoss?.toString() || "");
        }
    }, [position]);

    const handleUpdate = async () => {
        if (!position) return;
        try {
            setLoading(true);
            await tradeService.updatePositionRisk(position.id, {
                target: target ? parseFloat(target) : undefined,
                stopLoss: stopLoss ? parseFloat(stopLoss) : undefined
            });
            toast.success("Risk parameters updated successfully");
            onUpdate();
            onClose();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Update failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-border bg-card">
                <DialogHeader className="px-6 py-4 border-b border-border bg-muted/20">
                    <DialogTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-primary" /> Risk Management
                    </DialogTitle>
                </DialogHeader>

                <div className="p-6 space-y-6">
                    <div>
                        <p className="text-lg font-black tracking-tight uppercase">{position?.symbol}</p>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Adjust Target and Stop Loss</p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-emerald-500/70 flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" /> Target Price
                            </label>
                            <div className="relative">
                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500/40" />
                                <Input
                                    type="number"
                                    value={target}
                                    onChange={e => setTarget(e.target.value)}
                                    className="h-12 pl-10 bg-emerald-500/5 border-emerald-500/10 font-mono text-base font-bold"
                                    placeholder="No Target"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-rose-500/70 flex items-center gap-1">
                                <TrendingDown className="h-3 w-3" /> Stop Loss Price
                            </label>
                            <div className="relative">
                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-500/40" />
                                <Input
                                    type="number"
                                    value={stopLoss}
                                    onChange={e => setStopLoss(e.target.value)}
                                    className="h-12 pl-10 bg-rose-500/5 border-rose-500/10 font-mono text-base font-bold"
                                    placeholder="No SL"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-primary/5 p-4 rounded-xl border border-dashed border-primary/20">
                        <p className="text-[10px] font-black uppercase text-muted-foreground leading-relaxed">
                            💡 These orders will be triggered as "Market Exit" when the price hits your target or stop loss.
                        </p>
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 bg-muted/20 border-t border-border mt-0">
                    <Button variant="ghost" onClick={onClose} className="text-[10px] font-black uppercase">Cancel</Button>
                    <Button
                        onClick={handleUpdate}
                        disabled={loading}
                        className="bg-primary hover:bg-primary/90 text-white font-black text-[10px] uppercase tracking-widest min-w-[120px]"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default RiskModal;
