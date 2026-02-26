import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Search, Star, X, Loader2, Plus,
    Trash2, Edit2, List, MoreVertical,
    TrendingUp, TrendingDown, Activity, IndianRupee, LayoutGrid, Maximize2,
    ArrowUpDown, SortAsc, SortDesc
} from "lucide-react";
import { toast } from "sonner";
import tradeService, {
    type SymbolItem, type Watchlist, type WatchlistItem
} from "@/services/trade.service";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useLivePrices } from "@/hooks/useLivePrice";
import TradingChart, { TradingChartRef } from "@/components/trading/TradingChart";
import TradeModal from "@/components/trading/TradeModal";

const WatchlistPage = () => {
    const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
    const [activeWatchlistId, setActiveWatchlistId] = useState<string | null>(null);
    const [pageLoading, setPageLoading] = useState(true);

    // Selected Symbol for Chart/Details
    const [selectedItem, setSelectedItem] = useState<WatchlistItem | null>(null);

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

    const chartRef = useRef<TradingChartRef>(null);

    const loadData = useCallback(async () => {
        try {
            setPageLoading(true);
            const data = await tradeService.getWatchlists();
            setWatchlists(data || []);
            if (data && data.length > 0 && !activeWatchlistId) {
                setActiveWatchlistId(data[0].id);
                if (data[0].items.length > 0) {
                    setSelectedItem(data[0].items[0]);
                }
            }
        } catch (err) {
            toast.error("Failed to load watchlists");
        } finally {
            setPageLoading(false);
        }
    }, [activeWatchlistId]);

    useEffect(() => {
        loadData();
    }, []);

    const activeWatchlist = useMemo(() => {
        return watchlists.find(w => w.id === activeWatchlistId);
    }, [watchlists, activeWatchlistId]);

    // Live prices for ALL watchlists or just active? 
    // Usually brokers stream for the active list.
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

    const handleCreateWatchlist = async () => {
        if (!newWatchlistName.trim()) return;
        try {
            const data = await tradeService.createWatchlist(newWatchlistName);
            setWatchlists(prev => [...prev, { ...data, items: [] }]);
            setActiveWatchlistId(data.id);
            setNewWatchlistName("");
            setIsCreateModalOpen(false);
            toast.success("Watchlist created");
        } catch (err) {
            toast.error("Failed to create watchlist");
        }
    };

    const handleRenameWatchlist = async () => {
        if (!newWatchlistName.trim()) return;
        try {
            await tradeService.updateWatchlist(renameId, newWatchlistName);
            setWatchlists(prev => prev.map(w => w.id === renameId ? { ...w, name: newWatchlistName } : w));
            setNewWatchlistName("");
            setIsRenameModalOpen(false);
            toast.success("Watchlist renamed");
        } catch (err) {
            toast.error("Failed to rename watchlist");
        }
    };

    const handleDeleteWatchlist = async (id: string) => {
        if (!confirm("Are you sure? All symbols in this list will be removed.")) return;
        try {
            await tradeService.deleteWatchlist(id);
            const updated = watchlists.filter(w => w.id !== id);
            setWatchlists(updated);
            if (activeWatchlistId === id) {
                setActiveWatchlistId(updated.length > 0 ? updated[0].id : null);
            }
            toast.success("Watchlist deleted");
        } catch (err) {
            toast.error("Failed to delete watchlist");
        }
    };

    const addToWatchlist = async (symbol: SymbolItem) => {
        if (!activeWatchlistId) {
            toast.error("Select a watchlist first");
            return;
        }
        if (activeWatchlist?.items.some(item => item.symbolId === (symbol.id as any))) {
            toast.info("Symbol already in this watchlist");
            return;
        }
        try {
            const newItem = await tradeService.addSymbolToWatchlist(activeWatchlistId, symbol.id as any);
            setWatchlists(prev => prev.map(w => {
                if (w.id === activeWatchlistId) {
                    return { ...w, items: [...w.items, newItem] };
                }
                return w;
            }));
            toast.success(`${symbol.tradingSymbol} added`);
            setSearchQuery("");
            setSearchResults([]);
            setSelectedItem(newItem);
        } catch (err) {
            toast.error("Failed to add symbol");
        }
    };

    const removeFromWatchlist = async (symbolId: string) => {
        if (!activeWatchlistId) return;
        try {
            await tradeService.removeSymbolFromWatchlist(activeWatchlistId, symbolId);
            setWatchlists(prev => prev.map(w => {
                if (w.id === activeWatchlistId) {
                    return { ...w, items: w.items.filter(i => i.symbolId !== symbolId) };
                }
                return w;
            }));
            if (selectedItem?.symbolId === symbolId) {
                setSelectedItem(null);
            }
            toast.success("Removed from watchlist");
        } catch (err) {
            toast.error("Failed to remove symbol");
        }
    };

    const formatPrice = (val: number) =>
        `₹${val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return (
        <div className="flex h-[calc(100vh-80px)] -m-3 md:-m-6 overflow-hidden bg-background">
            {/* 1. Watchlist List Sidebar (Very narrow) */}
            <div className="w-16 border-r border-border bg-muted/10 flex flex-col items-center py-4 gap-4 shrink-0">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-xl"
                    onClick={() => setIsCreateModalOpen(true)}
                    title="New Watchlist"
                >
                    <Plus className="h-5 w-5" />
                </Button>
                <div className="flex-1 w-full flex flex-col items-center gap-3 overflow-y-auto no-scrollbar px-2">
                    {watchlists.map((wl, idx) => (
                        <button
                            key={wl.id}
                            onClick={() => setActiveWatchlistId(wl.id)}
                            className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black transition-all",
                                activeWatchlistId === wl.id
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110"
                                    : "bg-muted text-muted-foreground hover:bg-muted-foreground hover:text-background"
                            )}
                            title={wl.name}
                        >
                            {wl.name.slice(0, 1).toUpperCase()}{idx + 1}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. Symbols Column (Standard width) */}
            <div className="w-80 md:w-96 border-r border-border bg-card flex flex-col shrink-0 overflow-hidden">
                {/* Search Header */}
                <div className="p-4 border-b border-border space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Market Watch</h2>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary">
                                        <ArrowUpDown className="h-3 w-3" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-40">
                                    <div className="px-2 py-1.5 text-[10px] font-black text-muted-foreground uppercase opacity-50">Sort By</div>
                                    <DropdownMenuItem onClick={() => { setSortBy('name'); setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); }} className="text-xs font-bold">
                                        <SortAsc className="h-3 w-3 mr-2" /> Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => { setSortBy('price'); setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); }} className="text-xs font-bold">
                                        <IndianRupee className="h-3 w-3 mr-2" /> Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSortBy('none')} className="text-xs font-bold text-red-500">
                                        <X className="h-3 w-3 mr-2" /> Reset
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        {connected && <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-500 uppercase tracking-tighter"><Activity className="h-3 w-3" /> Live</div>}
                    </div>

                    <div className="relative group">
                        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search & Add Symbols..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-muted/30 border-none h-11 pl-9 pr-8 text-sm font-bold focus-visible:ring-1 focus-visible:ring-primary/20"
                        />
                        {searchLoading && <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-primary" />}
                        {searchQuery && !searchLoading && <X className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => setSearchQuery("")} />}

                        {/* Search Results Dropdown */}
                        {searchResults.length > 0 && (
                            <div className="absolute top-full left-0 w-full mt-2 bg-popover border border-border rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[400px]">
                                <div className="p-2 border-b border-border bg-muted/20 text-[10px] uppercase font-black tracking-widest text-muted-foreground">Search Results</div>
                                <div className="overflow-y-auto no-scrollbar p-1">
                                    {searchResults.map(sym => (
                                        <div
                                            key={sym.id}
                                            className="flex items-center justify-between p-3 rounded-lg hover:bg-accent cursor-pointer group/item hover:border-l-2 hover:border-primary transition-all"
                                            onClick={() => addToWatchlist(sym)}
                                        >
                                            <div>
                                                <p className="text-sm font-black tracking-tight">{sym.tradingSymbol}</p>
                                                <div className="flex gap-2">
                                                    <span className="text-[10px] text-muted-foreground font-bold uppercase">{sym.exchange}</span>
                                                    <span className="text-[10px] text-muted-foreground font-medium opacity-60 truncate max-w-[120px]">{sym.symbol}</span>
                                                </div>
                                            </div>
                                            <Plus className="h-4 w-4 text-muted-foreground group-hover/item:text-primary" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Symbols List */}
                <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
                    {pageLoading ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-30 select-none">
                            <Loader2 className="h-8 w-8 animate-spin mb-2" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Loading Market</p>
                        </div>
                    ) : !activeWatchlist || activeWatchlist.items.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center text-center p-8 opacity-40">
                            <List className="h-10 w-10 mb-2" />
                            <p className="text-xs font-bold">Watchlist is empty</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/30">
                            {sortedItems.map(item => {
                                const sym = item.symbol;
                                const key = `${sym.exchange}|${sym.token}`;
                                const priceData = livePrices.get(key);
                                const ltp = priceData?.lp ? parseFloat(priceData.lp) : null;
                                const change = priceData?.pc ? parseFloat(priceData.pc) : null;
                                const isUp = (change ?? 0) >= 0;
                                const isSelected = selectedItem?.id === item.id;

                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedItem(item)}
                                        className={cn(
                                            "group px-4 py-2 flex items-center justify-between min-h-[52px] cursor-pointer transition-all hover:bg-accent relative overflow-hidden border-b border-border/10",
                                            isSelected && "bg-primary/5 border-l-2 border-primary"
                                        )}
                                    >
                                        <div className="flex-1 min-w-0 transition-all duration-200 group-hover:pr-24">
                                            <p className="text-sm font-black tracking-tight uppercase leading-none truncate">{sym.tradingSymbol}</p>
                                            <p className="text-[10px] text-muted-foreground font-bold mt-1 uppercase opacity-70">{sym.exchange}</p>
                                        </div>

                                        <div className="text-right transition-all duration-200 group-hover:opacity-0 group-hover:translate-x-4">
                                            <p className={cn("text-sm font-black font-mono leading-none", isUp ? "text-green-500" : "text-red-500")}>
                                                {ltp !== null ? ltp.toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "—"}
                                            </p>
                                            <p className={cn("text-[10px] font-bold mt-1", isUp ? "text-green-500/80" : "text-red-500/80")}>
                                                {change !== null ? `${isUp ? "+" : ""}${change.toFixed(2)}%` : "0.00%"}
                                            </p>
                                        </div>

                                        {/* Action Overlay (Visible on Hover/Selected) */}
                                        <div className={cn(
                                            "absolute right-4 top-1/2 -translate-y-1/2 flex gap-1 items-center opacity-0 translate-x-10 transition-all duration-300 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto",
                                            isSelected && "opacity-100 translate-x-0 pointer-events-auto"
                                        )}>
                                            <Button
                                                size="sm"
                                                className="h-7 px-3 text-[10px] font-black bg-green-600 hover:bg-green-700 text-white border-0 shadow-lg shadow-green-500/20"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setTradeModal({
                                                        isOpen: true,
                                                        symbol: sym.tradingSymbol,
                                                        symbolId: item.symbolId,
                                                        exchange: sym.exchange,
                                                        token: sym.token,
                                                        side: "BUY"
                                                    });
                                                }}
                                            >
                                                BUY
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="h-7 px-3 text-[10px] font-black bg-red-600 hover:bg-red-700 text-white border-0 shadow-lg shadow-red-500/20"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setTradeModal({
                                                        isOpen: true,
                                                        symbol: sym.tradingSymbol,
                                                        symbolId: item.symbolId,
                                                        exchange: sym.exchange,
                                                        token: sym.token,
                                                        side: "SELL"
                                                    });
                                                }}
                                            >
                                                SELL
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-7 w-7 hover:bg-red-500/10 hover:text-red-500 text-muted-foreground"
                                                onClick={(e) => { e.stopPropagation(); removeFromWatchlist(item.symbolId); }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Watchlist Management Footer */}
                <div className="p-4 bg-muted/20 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{activeWatchlist?.name}</span>
                        <Badge variant="secondary" className="text-[9px] h-4 rounded-sm">{activeWatchlist?.items.length ?? 0}</Badge>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setRenameId(activeWatchlistId!); setNewWatchlistName(activeWatchlist!.name); setIsRenameModalOpen(true); }} disabled={!activeWatchlistId}>
                            <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-500/10" onClick={() => handleDeleteWatchlist(activeWatchlistId!)} disabled={!activeWatchlistId}>
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* 3. Main Chart & Details Area */}
            <div className="flex-1 bg-muted/5 flex flex-col overflow-hidden relative">
                {!selectedItem ? (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-30 select-none">
                        <Activity className="h-16 w-16 mb-4 stroke-1" />
                        <h2 className="text-xl font-black uppercase tracking-widest">Trading Terminal</h2>
                        <p className="text-xs font-semibold mt-1">Select a symbol to start analysis</p>
                    </div>
                ) : (
                    <>
                        {/* Selected Symbol Header */}
                        <div className="p-4 md:p-6 border-b border-border bg-card flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-4">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-black tracking-tighter leading-none">{selectedItem.symbol.tradingSymbol}</h1>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase mt-1 tracking-widest">{selectedItem.symbol.symbol} • {selectedItem.symbol.exchange} • {selectedItem.symbol.token}</p>
                                </div>
                                <div className="hidden sm:block pl-6 border-l border-border">
                                    {livePrices.has(`${selectedItem.symbol.exchange}|${selectedItem.symbol.token}`) ? (
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl font-black font-mono">
                                                ₹{parseFloat(livePrices.get(`${selectedItem.symbol.exchange}|${selectedItem.symbol.token}`)!.lp).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                            </span>
                                            <Badge className={cn("text-[11px] font-bold", parseFloat(livePrices.get(`${selectedItem.symbol.exchange}|${selectedItem.symbol.token}`)!.pc) >= 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500")}>
                                                {parseFloat(livePrices.get(`${selectedItem.symbol.exchange}|${selectedItem.symbol.token}`)!.pc) >= 0 ? "+" : ""}{parseFloat(livePrices.get(`${selectedItem.symbol.exchange}|${selectedItem.symbol.token}`)!.pc).toFixed(2)}%
                                            </Badge>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground italic">Fetching Live LTP...</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    className="bg-green-600 hover:bg-green-700 text-white font-black px-6 shadow-xl shadow-green-500/20 active:scale-95 transition-all"
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
                                    className="bg-red-600 hover:bg-red-700 text-white font-black px-6 shadow-xl shadow-red-500/20 active:scale-95 transition-all"
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

                        {/* Chart Area */}
                        <div className="flex-1 p-2 md:p-4 overflow-y-auto no-scrollbar">
                            <Card className="border-none shadow-xl bg-card overflow-hidden">
                                <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/10 border-b border-border/50">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-4 w-4 text-primary" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Advanced Simulation Chart</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => chartRef.current?.refresh()}>
                                            <Activity className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-7 w-7">
                                            <Maximize2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0 pt-4">
                                    <TradingChart
                                        ref={chartRef}
                                        symbol={selectedItem.symbol.tradingSymbol}
                                        exchange={selectedItem.symbol.exchange}
                                        token={selectedItem.symbol.token}
                                    />
                                </CardContent>
                            </Card>

                            {/* Stat Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                {[
                                    { label: "High", value: livePrices.get(`${selectedItem.symbol.exchange}|${selectedItem.symbol.token}`)?.h ?? "—", color: "text-green-500" },
                                    { label: "Low", value: livePrices.get(`${selectedItem.symbol.exchange}|${selectedItem.symbol.token}`)?.l ?? "—", color: "text-red-500" },
                                    { label: "Open", value: livePrices.get(`${selectedItem.symbol.exchange}|${selectedItem.symbol.token}`)?.o ?? "—", color: "text-muted-foreground" },
                                    { label: "Close", value: livePrices.get(`${selectedItem.symbol.exchange}|${selectedItem.symbol.token}`)?.c ?? "—", color: "text-muted-foreground" },
                                ].map((stat, i) => (
                                    <Card key={i} className="border-none bg-card p-4 shadow-sm">
                                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">{stat.label}</p>
                                        <p className={cn("text-lg font-black font-mono", stat.color)}>{stat.value !== "—" ? parseFloat(stat.value as string).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "—"}</p>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Modals */}
            <TradeModal
                isOpen={tradeModal.isOpen}
                onClose={() => setTradeModal(prev => ({ ...prev, isOpen: false }))}
                symbol={tradeModal.symbol}
                symbolId={tradeModal.symbolId}
                exchange={tradeModal.exchange}
                token={tradeModal.token}
                initialSide={tradeModal.side}
            />

            {/* Watchlist Management Modals */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="uppercase tracking-tight">Create New Watchlist</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            placeholder="Enter list name (e.g. My Favorites, Bank Nifty)"
                            value={newWatchlistName}
                            onChange={(e) => setNewWatchlistName(e.target.value)}
                            className="h-12"
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateWatchlist()}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateWatchlist} disabled={!newWatchlistName.trim()}>Create Watchlist</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isRenameModalOpen} onOpenChange={setIsRenameModalOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="uppercase tracking-tight">Rename Watchlist</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            value={newWatchlistName}
                            onChange={(e) => setNewWatchlistName(e.target.value)}
                            className="h-12"
                            onKeyDown={(e) => e.key === 'Enter' && handleRenameWatchlist()}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRenameModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleRenameWatchlist} disabled={!newWatchlistName.trim()}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default WatchlistPage;
