import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import tradeService, { type Watchlist, type WatchlistItem, type SymbolItem } from '@/services/trade.service';
import { toast } from 'sonner';

interface WatchlistState {
    watchlists: Watchlist[];
    activeWatchlistId: string | null;
    selectedItem: WatchlistItem | null;
    loading: boolean;

    // Actions
    fetchWatchlists: () => Promise<void>;
    setActiveWatchlistId: (id: string) => void;
    setSelectedItem: (item: WatchlistItem | null) => void;

    createWatchlist: (name: string) => Promise<void>;
    renameWatchlist: (id: string, name: string) => Promise<void>;
    deleteWatchlist: (id: string) => Promise<void>;

    addToWatchlist: (symbol: SymbolItem) => Promise<void>;
    removeFromWatchlist: (symbolId: string) => Promise<void>;
}

export const useWatchlistStore = create<WatchlistState>()(
    persist(
        (set, get) => ({
            watchlists: [],
            activeWatchlistId: null,
            selectedItem: null,
            loading: false,

            fetchWatchlists: async () => {
                set({ loading: true });
                try {
                    const data = await tradeService.getWatchlists();
                    set({ watchlists: data || [] });

                    if (data && data.length > 0 && !get().activeWatchlistId) {
                        set({ activeWatchlistId: data[0].id });
                        if (data[0].items.length > 0 && !get().selectedItem) {
                            set({ selectedItem: data[0].items[0] });
                        }
                    }
                } catch (err) {
                    toast.error("Failed to load watchlists");
                } finally {
                    set({ loading: false });
                }
            },

            setActiveWatchlistId: (id) => set({ activeWatchlistId: id }),
            setSelectedItem: (item) => set({ selectedItem: item }),

            createWatchlist: async (name) => {
                try {
                    const data = await tradeService.createWatchlist(name);
                    set((state) => ({
                        watchlists: [...state.watchlists, { ...data, items: [] }],
                        activeWatchlistId: data.id
                    }));
                    toast.success("Watchlist created");
                } catch (err) {
                    toast.error("Failed to create watchlist");
                }
            },

            renameWatchlist: async (id, name) => {
                try {
                    await tradeService.updateWatchlist(id, name);
                    set((state) => ({
                        watchlists: state.watchlists.map(w => w.id === id ? { ...w, name } : w)
                    }));
                    toast.success("Watchlist renamed");
                } catch (err) {
                    toast.error("Failed to rename watchlist");
                }
            },

            deleteWatchlist: async (id) => {
                try {
                    await tradeService.deleteWatchlist(id);
                    set((state) => {
                        const updated = state.watchlists.filter(w => w.id !== id);
                        let nextActiveId = state.activeWatchlistId;
                        if (state.activeWatchlistId === id) {
                            nextActiveId = updated.length > 0 ? updated[0].id : null;
                        }
                        return { watchlists: updated, activeWatchlistId: nextActiveId };
                    });
                    toast.success("Watchlist deleted");
                } catch (err) {
                    toast.error("Failed to delete watchlist");
                }
            },

            addToWatchlist: async (symbol) => {
                const { activeWatchlistId, watchlists } = get();
                if (!activeWatchlistId) {
                    toast.error("Select a watchlist first");
                    return;
                }
                const activeWl = watchlists.find(w => w.id === activeWatchlistId);
                if (activeWl?.items.some(item => item.symbolId === (symbol.id as any))) {
                    toast.info("Symbol already in this watchlist");
                    return;
                }
                try {
                    const newItem = await tradeService.addSymbolToWatchlist(activeWatchlistId, symbol.id as any);
                    set((state) => ({
                        watchlists: state.watchlists.map(w => {
                            if (w.id === activeWatchlistId) {
                                return { ...w, items: [...w.items, newItem] };
                            }
                            return w;
                        }),
                        selectedItem: newItem
                    }));
                    toast.success(`${symbol.tradingSymbol} added`);
                } catch (err) {
                    toast.error("Failed to add symbol");
                }
            },

            removeFromWatchlist: async (symbolId) => {
                const { activeWatchlistId, selectedItem } = get();
                if (!activeWatchlistId) return;
                try {
                    await tradeService.removeSymbolFromWatchlist(activeWatchlistId, symbolId);
                    set((state) => ({
                        watchlists: state.watchlists.map(w => {
                            if (w.id === activeWatchlistId) {
                                return { ...w, items: w.items.filter(i => i.symbolId !== symbolId) };
                            }
                            return w;
                        }),
                        selectedItem: selectedItem?.symbolId === symbolId ? null : selectedItem
                    }));
                    toast.success("Removed from watchlist");
                } catch (err) {
                    toast.error("Failed to remove symbol");
                }
            }
        }),
        {
            name: 'watchlist-storage',
            partialize: (state) => ({ activeWatchlistId: state.activeWatchlistId }),
        }
    )
);
