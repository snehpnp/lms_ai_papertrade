import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Search, X, Loader2, Plus,
    Trash2, Edit2, List, MoreVertical,
    TrendingUp, TrendingDown, Activity, IndianRupee,
    ArrowUpDown, SortAsc, SortDesc, CandlestickChart
} from "lucide-react";
import { toast } from "sonner";
import tradeService, { type SymbolItem } from "@/services/trade.service";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useLivePrices } from "@/hooks/useLivePrice";
import TradeModal from "@/components/trading/TradeModal";
import { useWatchlistStore } from "@/store/watchlistStore";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "@/lib/axios";

const WatchlistSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        watchlists,
        activeWatchlistId,
        selectedItem,
        loading,
        fetchWatchlists,
        setActiveWatchlistId,
        setSelectedItem,
        createWatchlist,
        renameWatchlist,
        deleteWatchlist,
        addToWatchlist,
        removeFromWatchlist
    } = useWatchlistStore();

    // Search
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SymbolItem[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);

    // Modals
    const [newWatchlistName, setNewWatchlistName] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
    const [renameId, setRenameId] = useState("");

    // Trade Modal
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

    // Sorting
    const [sortBy, setSortBy] = useState<'name' | 'price' | 'none'>('none');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    useEffect(() => {
        fetchWatchlists();
    }, [fetchWatchlists]);

    const activeWatchlist = useMemo(() => {
        return watchlists.find(w => w.id === activeWatchlistId);
    }, [watchlists, activeWatchlistId]);

    const channels = useMemo(() => {
        if (!activeWatchlist) return [];
        return activeWatchlist.items
            .filter(item => item.symbol?.exchange && item.symbol?.token)
            .map(item => ({
                exchange: item.symbol.exchange,
                token: item.symbol.token,
            }));
    }, [activeWatchlist]);

    const { prices: livePrices, connected } = useLivePrices(channels, channels.length > 0);

    const sortedItems = useMemo(() => {
        if (!activeWatchlist) return [];
        const items = [...activeWatchlist.items];
        if (sortBy === 'none') return items;

        return items.sort((a, b) => {
            if (sortBy === 'name') {
                const valA = a.symbol.tradingSymbol;
                const valB = b.symbol.tradingSymbol;
                return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
            }
            if (sortBy === 'price') {
                const keyA = `${a.symbol.exchange}|${a.symbol.token}`;
                const keyB = `${b.symbol.exchange}|${b.symbol.token}`;
                const valA = parseFloat(livePrices.get(keyA)?.lp || '0');
                const valB = parseFloat(livePrices.get(keyB)?.lp || '0');
                return sortOrder === 'asc' ? valA - valB : valB - valA;
            }
            return 0;
        });
    }, [activeWatchlist, sortBy, sortOrder, livePrices]);

    useEffect(() => {
        if (!searchQuery || searchQuery.length < 2) {
            setSearchResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            try {
                setSearchLoading(true);
                const res = await tradeService.searchSymbols({ q: searchQuery, limit: 15 });
                setSearchResults(res.items || []);
            } catch (err) {
                console.error("Search failed:", err);
            } finally {
                setSearchLoading(false);
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleCreate = async () => {
        if (!newWatchlistName.trim()) return;
        await createWatchlist(newWatchlistName);
        setNewWatchlistName("");
        setIsCreateModalOpen(false);
    };

    const handleRename = async () => {
        if (!newWatchlistName.trim()) return;
        await renameWatchlist(renameId, newWatchlistName);
        setNewWatchlistName("");
        setIsRenameModalOpen(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? All symbols in this list will be removed.")) return;
        await deleteWatchlist(id);
    };

    const handleSelectItem = (item: any) => {
        setSelectedItem(item);
        // If not on watchlist page, navigate there to show chart
        if (location.pathname !== "/user/paper-trade/watchlist") {
            navigate("/user/paper-trade/watchlist");
        }
    };

    return (
        <div className="flex h-full border-r border-border bg-card overflow-hidden shrink-0">
            {/* 1. Watchlist Tabs Sidebar (Narrow) */}
            <div className="w-14 border-r border-border bg-muted/20 flex flex-col items-center py-4 gap-4 shrink-0">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-xl border border-dashed border-muted-foreground/30 hover:border-primary hover:text-primary transition-all"
                    onClick={() => setIsCreateModalOpen(true)}
                    title="New Watchlist"
                >
                    <Plus className="h-4 w-4" />
                </Button>
                <div className="flex-1 w-full flex flex-col items-center gap-3 overflow-y-auto no-scrollbar px-2 px-1">
                    {watchlists.map((wl, idx) => (
                        <button
                            key={wl.id}
                            onClick={() => setActiveWatchlistId(wl.id)}
                            className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black transition-all",
                                activeWatchlistId === wl.id
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                                    : "bg-background border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                            title={wl.name}
                        >
                            {idx + 1}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. Symbols Column */}
            <div className="w-80 md:w-[360px] flex flex-col overflow-hidden">
                <div className="p-4 border-b border-border space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Watchlist</h2>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                                        <ArrowUpDown className="h-3 w-3" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-40">
                                    <DropdownMenuItem onClick={() => { setSortBy('name'); setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); }} className="text-xs font-bold">
                                        <List className="h-3 w-3 mr-2" /> Name
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => { setSortBy('price'); setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); }} className="text-xs font-bold">
                                        <IndianRupee className="h-3 w-3 mr-2" /> Price
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        {connected && <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />}
                    </div>

                    <div className="relative group">
                        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search symbols..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-muted/40 border-none h-10 pl-9 text-xs font-bold"
                        />
                        {searchResults.length > 0 && (
                            <div className="absolute top-full left-0 w-full mt-1 bg-popover border border-border rounded-xl shadow-2xl z-50 max-h-[300px] overflow-y-auto overflow-hidden p-1">
                                {searchResults.map(sym => (
                                    <div
                                        key={sym.id}
                                        className="flex items-center justify-between p-2 rounded-lg hover:bg-muted cursor-pointer group/search"
                                        onClick={() => { addToWatchlist(sym); setSearchQuery(""); setSearchResults([]); }}
                                    >
                                        <div className="min-w-0">
                                            <p className="text-xs font-black truncate">{sym.tradingSymbol}</p>
                                            <p className="text-[9px] text-muted-foreground font-bold uppercase">{sym.exchange}</p>
                                        </div>
                                        <Plus className="h-3.5 w-3.5 opacity-0 group-hover/search:opacity-100 transition-opacity text-primary" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar">
                    {loading ? (
                        <div className="h-full flex items-center justify-center opacity-20"><Loader2 className="h-6 w-6 animate-spin" /></div>
                    ) : sortedItems.map(item => {
                        const sym = item.symbol;
                        const key = `${sym.exchange}|${sym.token}`;
                        const price = livePrices.get(key);
                        const ltp = price?.lp ? parseFloat(price.lp) : null;
                        const change = price?.pc ? parseFloat(price.pc) : null;
                        const isUp = (change ?? 0) >= 0;
                        const isSelected = selectedItem?.id === item.id;

                        return (
                            <div
                                key={item.id}
                                onClick={() => handleSelectItem(item)}
                                className={cn(
                                    "group px-4 py-2.5 flex items-center justify-between border-b border-border/10 cursor-pointer transition-all hover:bg-muted/50 relative overflow-hidden",
                                    isSelected && "bg-primary/5 border-l-2 border-primary"
                                )}
                            >
                                <div className="flex-1 min-w-0 transition-opacity group-hover:opacity-40">
                                    <p className="text-xs font-black tracking-tight flex items-center gap-1.5 uppercase truncate">
                                        {sym.tradingSymbol}
                                        <span className="text-[9px] text-muted-foreground font-bold opacity-40">{sym.exchange}</span>
                                    </p>
                                </div>

                                <div className="text-right shrink-0 group-hover:hidden">
                                    <p className={cn("text-xs font-black font-mono", isUp ? "text-emerald-500" : "text-rose-500")}>
                                        {ltp !== null ? ltp.toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "—"}
                                    </p>
                                    <p className={cn("text-[9px] font-bold", isUp ? "text-emerald-500/80" : "text-rose-500/80")}>
                                        {change !== null ? `${isUp ? "+" : ""}${change.toFixed(2)}%` : "0.00%"}
                                    </p>
                                </div>

                                {/* Hover Actions */}
                                <div className="hidden group-hover:flex items-center gap-1 animate-in slide-in-from-right-2 duration-200">
                                    <Button
                                        size="sm"
                                        className="h-7 px-2.5 text-[9px] font-black bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-lg shadow-emerald-500/20"
                                        onClick={(e) => { e.stopPropagation(); setTradeModal({ isOpen: true, symbol: sym.tradingSymbol, symbolId: item.symbolId, exchange: sym.exchange, token: sym.token, side: "BUY" }); }}
                                    >
                                        BUY
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="h-7 px-2.5 text-[9px] font-black bg-rose-600 hover:bg-rose-700 text-white border-0 shadow-lg shadow-rose-500/20"
                                        onClick={(e) => { e.stopPropagation(); setTradeModal({ isOpen: true, symbol: sym.tradingSymbol, symbolId: item.symbolId, exchange: sym.exchange, token: sym.token, side: "SELL" }); }}
                                    >
                                        SELL
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7 text-primary hover:bg-primary/10"
                                        onClick={(e) => { e.stopPropagation(); handleSelectItem(item); }}
                                        title="View Chart"
                                    >
                                        <CandlestickChart className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                        onClick={(e) => { e.stopPropagation(); removeFromWatchlist(item.symbolId); }}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="p-3 bg-muted/20 border-t border-border flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{activeWatchlist?.name}</span>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6"><MoreVertical className="h-3 w-3" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => { setRenameId(activeWatchlistId!); setNewWatchlistName(activeWatchlist!.name); setIsRenameModalOpen(true); }} className="text-xs font-bold">
                                <Edit2 className="h-3 w-3 mr-2" /> Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(activeWatchlistId!)} className="text-xs font-bold text-destructive">
                                <Trash2 className="h-3 w-3 mr-2" /> Delete List
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
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

            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="sm:max-w-xs">
                    <DialogHeader><DialogTitle className="text-sm font-black uppercase">New Watchlist</DialogTitle></DialogHeader>
                    <Input placeholder="List Name" value={newWatchlistName} onChange={(e) => setNewWatchlistName(e.target.value)} className="h-10 text-sm" autoFocus />
                    <DialogFooter><Button onClick={handleCreate} disabled={!newWatchlistName.trim()} className="w-full text-xs font-black uppercase">Create</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isRenameModalOpen} onOpenChange={setIsRenameModalOpen}>
                <DialogContent className="sm:max-w-xs">
                    <DialogHeader><DialogTitle className="text-sm font-black uppercase">Rename List</DialogTitle></DialogHeader>
                    <Input value={newWatchlistName} onChange={(e) => setNewWatchlistName(e.target.value)} className="h-10 text-sm" autoFocus />
                    <DialogFooter><Button onClick={handleRename} disabled={!newWatchlistName.trim()} className="w-full text-xs font-black uppercase">Save</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default WatchlistSidebar;
