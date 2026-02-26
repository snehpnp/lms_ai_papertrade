import { useState, useEffect, useMemo, useCallback } from "react";
import PageHeader from "@/components/common/PageHeader";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Search, Star, X, Loader2, Plus,
    Trash2, Edit2, List, MoreVertical,
    TrendingUp, TrendingDown, Activity, ShoppingCart, ArrowDownToLine
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
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

const WatchlistPage = () => {
    const navigate = useNavigate();
    const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
    const [activeWatchlistId, setActiveWatchlistId] = useState<string | null>(null);
    const [pageLoading, setPageLoading] = useState(true);

    // Search
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SymbolItem[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);

    // Filter
    const [watchlistFilter, setWatchlistFilter] = useState("");

    // Modals
    const [newWatchlistName, setNewWatchlistName] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
    const [renameId, setRenameId] = useState("");

    const loadData = useCallback(async () => {
        try {
            setPageLoading(true);
            const data = await tradeService.getWatchlists();
            setWatchlists(data || []);
            if (data && data.length > 0 && !activeWatchlistId) {
                setActiveWatchlistId(data[0].id);
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

    // Build channels for live prices from active watchlist
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

    useEffect(() => {
        if (!searchQuery || searchQuery.length < 2) {
            setSearchResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            try {
                setSearchLoading(true);
                const res = await tradeService.searchSymbols({ q: searchQuery, limit: 10 });
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
        if (!confirm("Are you sure you want to delete this watchlist?")) return;
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
            toast.success("Removed from watchlist");
        } catch (err) {
            toast.error("Failed to remove symbol");
        }
    };

    const filteredItems = useMemo(() => {
        if (!activeWatchlist) return [];
        if (!watchlistFilter) return activeWatchlist.items;
        return activeWatchlist.items.filter(i =>
            i.symbol.tradingSymbol.toLowerCase().includes(watchlistFilter.toLowerCase()) ||
            i.symbol.symbol.toLowerCase().includes(watchlistFilter.toLowerCase())
        );
    }, [activeWatchlist, watchlistFilter]);

    const handleTrade = (item: WatchlistItem, side: 'BUY' | 'SELL') => {
        const sym = item.symbol;
        navigate(`/user/paper-trade/trade?symbol=${sym.tradingSymbol}&side=${side}&symbolId=${item.symbolId}&exchange=${sym.exchange}&token=${sym.token}`);
    };

    const formatPrice = (val: number) =>
        `₹${val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 pb-20 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <PageHeader title="Market Watchlists" subtitle="Manage multiple lists of your favorite stocks" />
                <div className="flex items-center gap-3">
                    {connected && (
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            <Activity className="h-3 w-3 text-green-500" />
                            <span>Live</span>
                        </div>
                    )}
                    <Button onClick={() => { setNewWatchlistName(""); setIsCreateModalOpen(true); }} className="gap-2">
                        <Plus className="h-4 w-4" /> Create New List
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Sidebar - List of Watchlists */}
                <Card className="lg:col-span-3 border-none bg-muted/20">
                    <CardHeader className="pb-3 px-4">
                        <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <List className="h-3 w-3" /> My Watchlists
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-2 space-y-1">
                        {pageLoading ? (
                            <div className="py-10 flex flex-col items-center gap-2">
                                <Loader2 className="h-6 w-6 animate-spin text-primary opacity-20" />
                                <p className="text-[10px] text-muted-foreground uppercase">Loading...</p>
                            </div>
                        ) : watchlists.length === 0 ? (
                            <div className="py-10 text-center px-4">
                                <p className="text-xs text-muted-foreground italic">No watchlists yet</p>
                            </div>
                        ) : (
                            watchlists.map(wl => (
                                <div key={wl.id} className="relative group">
                                    <button
                                        onClick={() => setActiveWatchlistId(wl.id)}
                                        className={cn(
                                            "w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex items-center justify-between",
                                            activeWatchlistId === wl.id
                                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                                                : "hover:bg-muted text-foreground/70 hover:text-foreground"
                                        )}
                                    >
                                        <span className="truncate pr-8">{`${wl.name} (${wl.items.length})`}</span>
                                    </button>

                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className={cn("h-7 w-7", activeWatchlistId === wl.id && "hover:bg-primary-foreground/10 text-primary-foreground")}>
                                                    <MoreVertical className="h-3.5 w-3.5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40">
                                                <DropdownMenuItem onClick={() => { setRenameId(wl.id); setNewWatchlistName(wl.name); setIsRenameModalOpen(true); }}>
                                                    <Edit2 className="h-3.5 w-3.5 mr-2" /> Rename
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-loss" onClick={() => handleDeleteWatchlist(wl.id)}>
                                                    <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Main Content - Symbols */}
                <div className="lg:col-span-9 space-y-6">
                    {!activeWatchlistId && !pageLoading ? (
                        <Card className="h-64 flex items-center justify-center border-dashed bg-muted/5">
                            <div className="text-center space-y-4">
                                <Star className="h-12 w-12 mx-auto text-muted-foreground/20" />
                                <p className="text-sm text-muted-foreground">Select or create a watchlist to start adding stocks</p>
                            </div>
                        </Card>
                    ) : (
                        <Card className="border-none shadow-xl shadow-muted/20 overflow-hidden">
                            <CardHeader className="bg-muted/10 border-b border-border space-y-4">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="relative w-full sm:w-80 lg:w-96">
                                        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder="Find stocks to add..."
                                            className="pl-9 h-11 bg-background border-primary/10 focus-visible:ring-primary/20"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                        {searchLoading && <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-primary" />}

                                        {searchResults.length > 0 && (
                                            <div className="absolute z-20 w-full mt-2 bg-popover border border-border rounded-xl shadow-2xl overflow-hidden divide-y animate-in slide-in-from-top-2">
                                                {searchResults.map(sym => (
                                                    <div
                                                        key={sym.id}
                                                        className="flex items-center justify-between p-3 hover:bg-accent cursor-pointer group/item"
                                                        onClick={() => addToWatchlist(sym)}
                                                    >
                                                        <div>
                                                            <p className="text-sm group-hover/item:text-primary transition-colors">{sym.tradingSymbol}</p>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] text-muted-foreground uppercase">{sym.exchange}</span>
                                                                <span className="text-[10px] text-muted-foreground opacity-50 truncate max-w-[150px]">{sym.symbol}</span>
                                                            </div>
                                                        </div>
                                                        <Plus className="h-4 w-4 text-muted-foreground group-hover/item:text-primary" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="relative w-full sm:w-48">
                                        <Search className="h-3 w-3 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder="Filter table..."
                                            className="pl-8 h-9 text-xs bg-background/50 border-none"
                                            value={watchlistFilter}
                                            onChange={(e) => setWatchlistFilter(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </CardHeader>

                            {/* Watchlist Table */}
                            <CardContent className="p-0">
                                {filteredItems.length === 0 ? (
                                    <div className="py-16 text-center">
                                        <Star className="h-10 w-10 mx-auto text-muted-foreground/20 mb-3" />
                                        <p className="text-sm text-muted-foreground">This watchlist is empty</p>
                                        <p className="text-xs text-muted-foreground/60 mt-1">Search and add stocks above</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-border bg-muted/30">
                                                    <th className="text-left text-[10px] uppercase tracking-wider text-muted-foreground font-semibold py-3 px-4">Symbol</th>
                                                    <th className="text-left text-[10px] uppercase tracking-wider text-muted-foreground font-semibold py-3 px-3">Exchange</th>
                                                    <th className="text-right text-[10px] uppercase tracking-wider text-muted-foreground font-semibold py-3 px-3">LTP</th>
                                                    <th className="text-right text-[10px] uppercase tracking-wider text-muted-foreground font-semibold py-3 px-3">Change</th>
                                                    <th className="text-center text-[10px] uppercase tracking-wider text-muted-foreground font-semibold py-3 px-4">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredItems.map(item => {
                                                    const sym = item.symbol;
                                                    const key = `${sym.exchange}|${sym.token}`;
                                                    const priceData = livePrices.get(key);
                                                    const ltp = priceData?.lp ? parseFloat(priceData.lp) : null;
                                                    const change = priceData?.pc ? parseFloat(priceData.pc) : null;
                                                    const isUp = (change ?? 0) >= 0;

                                                    return (
                                                        <tr key={item.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors group">
                                                            {/* Symbol */}
                                                            <td className="py-3 px-4">
                                                                <p className="text-sm font-semibold">{sym.tradingSymbol}</p>
                                                                <p className="text-[10px] text-muted-foreground">{sym.symbol}</p>
                                                            </td>

                                                            {/* Exchange */}
                                                            <td className="py-3 px-3">
                                                                <Badge variant="outline" className="text-[9px] uppercase tracking-tighter">{sym.exchange}</Badge>
                                                            </td>

                                                            {/* LTP */}
                                                            <td className="py-3 px-3 text-right">
                                                                {ltp !== null ? (
                                                                    <span className="text-sm font-mono font-semibold">{formatPrice(ltp)}</span>
                                                                ) : (
                                                                    <span className="text-xs text-muted-foreground">—</span>
                                                                )}
                                                            </td>

                                                            {/* Change */}
                                                            <td className="py-3 px-3 text-right">
                                                                {change !== null ? (
                                                                    <span className={cn("text-xs font-semibold inline-flex items-center gap-0.5", isUp ? "text-profit" : "text-loss")}>
                                                                        {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                                                        {isUp ? "+" : ""}{change.toFixed(2)}%
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-xs text-muted-foreground">—</span>
                                                                )}
                                                            </td>

                                                            {/* Actions - BUY / SELL / Remove */}
                                                            <td className="py-3 px-4">
                                                                <div className="flex gap-1.5 justify-center items-center">
                                                                    <Button
                                                                        size="sm"
                                                                        className="h-7 px-3 text-[10px] font-bold bg-profit hover:bg-profit/90 text-white"
                                                                        onClick={() => handleTrade(item, 'BUY')}
                                                                    >
                                                                        <ShoppingCart className="h-3 w-3 mr-1" />
                                                                        BUY
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        className="h-7 px-3 text-[10px] font-bold bg-loss hover:bg-loss/90 text-white"
                                                                        onClick={() => handleTrade(item, 'SELL')}
                                                                    >
                                                                        <ArrowDownToLine className="h-3 w-3 mr-1" />
                                                                        SELL
                                                                    </Button>
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className="h-7 w-7 hover:text-loss hover:bg-loss/10"
                                                                        onClick={() => removeFromWatchlist(item.symbolId)}
                                                                    >
                                                                        <X className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Create Modal */}
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

            {/* Rename Modal */}
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
