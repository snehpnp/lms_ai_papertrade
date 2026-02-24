import { useState, useEffect, useMemo, useCallback } from "react";
import PageHeader from "@/components/common/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Eye, TrendingUp, TrendingDown, X,
  BarChart3, Clock, History, Star, StarOff, Wallet, ShieldCheck,
  Target, Percent, DollarSign, Activity, Zap, ListOrdered, Search,
  ChevronUp, ChevronDown, RefreshCw, IndianRupee, AlertCircle,
  CheckCircle2, Loader2, CandlestickChart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import tradeService, {
  type SymbolItem, type Order, type Position, type Trade, type PortfolioSummary,
} from "@/services/trade.service";

// ── Types ──────────────────────────────────────────────
type OrderSide = "BUY" | "SELL";
type OrderType = "MARKET" | "LIMIT";

interface WatchlistItem extends SymbolItem {
  starred: boolean;
  lastPrice?: number;
}

// ── Component ──────────────────────────────────────────────
const PaperTrade = () => {
  // Watchlist state
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [watchlistSearch, setWatchlistSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SymbolItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Order form state
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [orderSide, setOrderSide] = useState<OrderSide>("BUY");
  const [orderType, setOrderType] = useState<OrderType>("MARKET");
  const [quantity, setQuantity] = useState("1");
  const [limitPrice, setLimitPrice] = useState("");
  const [orderPrice, setOrderPrice] = useState("");
  const [orderLoading, setOrderLoading] = useState(false);

  // Data state
  const [positions, setPositions] = useState<Position[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tradeHistory, setTradeHistory] = useState<Trade[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // UI state
  const [bottomTab, setBottomTab] = useState("positions");
  const [closingPositionId, setClosingPositionId] = useState<string | null>(null);
  const [closePriceInput, setClosePriceInput] = useState("");
  const [showCloseModal, setShowCloseModal] = useState(false);

  // ── Load all data ─────────────────────────────────────
  const loadAllData = useCallback(async () => {
    try {
      setDataLoading(true);
      const [pos, ord, hist, port] = await Promise.all([
        tradeService.getOpenPositions(),
        tradeService.getOrders(),
        tradeService.getTradeHistory(),
        tradeService.getPortfolio(),
      ]);
      setPositions(pos || []);
      setOrders(ord || []);
      setTradeHistory(hist || []);
      setPortfolio(port);
    } catch (err: any) {
      console.error("Failed to load trade data:", err);
      // Still set empty data so UI doesn't break
      setPositions([]);
      setOrders([]);
      setTradeHistory([]);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
    loadWatchlist();
  }, []);

  // ── Watchlist from localStorage ────────────────────────
  const loadWatchlist = () => {
    const saved = localStorage.getItem("pt_watchlist");
    if (saved) {
      try {
        setWatchlist(JSON.parse(saved));
      } catch {}
    }
  };

  const saveWatchlist = (items: WatchlistItem[]) => {
    localStorage.setItem("pt_watchlist", JSON.stringify(items));
    setWatchlist(items);
  };

  const toggleStar = (symbol: string) => {
    const next = watchlist.map((w) =>
      w.tradingSymbol === symbol ? { ...w, starred: !w.starred } : w
    );
    saveWatchlist(next);
  };

  const removeFromWatchlist = (symbol: string) => {
    const next = watchlist.filter((w) => w.tradingSymbol !== symbol);
    saveWatchlist(next);
  };

  const addToWatchlist = (item: SymbolItem) => {
    if (watchlist.some((w) => w.tradingSymbol === item.tradingSymbol)) {
      toast.info("Already in watchlist");
      return;
    }
    const newItem: WatchlistItem = { ...item, starred: false };
    const next = [...watchlist, newItem];
    saveWatchlist(next);
    toast.success(`${item.tradingSymbol} added to watchlist`);
  };

  // ── Symbol search (from API) ──────────────────────────
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const res = await tradeService.searchSymbols({
          q: searchQuery,
          limit: 15,
        });
        setSearchResults(res.items || []);
      } catch (err) {
        console.error("Search failed:", err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ── Filtered watchlist ────────────────────────────────
  const filteredWatchlist = useMemo(() => {
    if (!watchlistSearch) return watchlist;
    return watchlist.filter(
      (w) =>
        w.tradingSymbol?.toLowerCase().includes(watchlistSearch.toLowerCase()) ||
        w.symbol?.toLowerCase().includes(watchlistSearch.toLowerCase())
    );
  }, [watchlist, watchlistSearch]);

  // ── Place Order ───────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!selectedSymbol) {
      toast.error("Please select a symbol");
      return;
    }
    const qty = parseInt(quantity);
    if (!qty || qty <= 0) {
      toast.error("Quantity must be positive");
      return;
    }
    const price = parseFloat(orderPrice);
    if (!price || price <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    try {
      setOrderLoading(true);
      const payload = {
        symbol: selectedSymbol,
        side: orderSide,
        quantity: qty,
        price,
        orderType,
      };
      if (orderType === "LIMIT" && limitPrice) {
        payload.price = parseFloat(limitPrice);
      }
      await tradeService.placeOrder(payload);
      toast.success(
        `${orderSide} order placed for ${qty} x ${selectedSymbol} @ ₹${price}`
      );
      // Reset form
      setQuantity("1");
      setOrderPrice("");
      setLimitPrice("");
      // Reload data
      await loadAllData();
      setBottomTab("orders");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to place order";
      toast.error(msg);
    } finally {
      setOrderLoading(false);
    }
  };

  // ── Close Position ────────────────────────────────────
  const handleClosePosition = async (positionId: string) => {
    const price = parseFloat(closePriceInput);
    if (!price || price <= 0) {
      toast.error("Enter a valid closing price");
      return;
    }
    try {
      setClosingPositionId(positionId);
      const res = await tradeService.closePosition(positionId, price);
      toast.success(`Position closed! P&L: ₹${res.pnl?.toFixed(2)}`);
      setShowCloseModal(false);
      setClosePriceInput("");
      await loadAllData();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to close position";
      toast.error(msg);
    } finally {
      setClosingPositionId(null);
    }
  };

  // ── Calculations ──────────────────────────────────────
  const walletBalance = portfolio?.walletBalance ?? 0;
  const totalOpenPnl = portfolio?.totalPnl ?? 0;
  const totalOpenValue = portfolio?.totalOpenValue ?? 0;
  const openPositionsCount = portfolio?.openPositionsCount ?? positions.length;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="📊 Paper Trading"
        subtitle="Indian Market — ₹10,00,000 virtual funds ke saath risk-free trading practice karein"
        action={
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs"
            onClick={loadAllData}
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        }
      />

      {/* ── Account Summary Strip ─────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {[
          {
            label: "Wallet Balance",
            value: `₹${walletBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
            icon: Wallet,
            color: "text-primary",
          },
          {
            label: "Total P&L",
            value: `${totalOpenPnl >= 0 ? "+" : ""}₹${totalOpenPnl.toFixed(2)}`,
            icon: totalOpenPnl >= 0 ? TrendingUp : TrendingDown,
            color: totalOpenPnl >= 0 ? "text-profit" : "text-loss",
          },
          {
            label: "Open Value",
            value: `₹${totalOpenValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
            icon: BarChart3,
            color: "text-primary",
          },
          {
            label: "Open Positions",
            value: String(openPositionsCount),
            icon: ListOrdered,
            color: "text-primary",
          },
          {
            label: "Net P&L",
            value: `${(portfolio?.netPnl ?? 0) >= 0 ? "+" : ""}₹${(portfolio?.netPnl ?? 0).toFixed(2)}`,
            icon: IndianRupee,
            color: (portfolio?.netPnl ?? 0) >= 0 ? "text-profit" : "text-loss",
          },
        ].map((stat) => (
          <Card key={stat.label} className="border-border hover:shadow-md transition-shadow">
            <CardContent className="p-3 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <stat.icon className={cn("w-4 h-4", stat.color)} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </p>
                <p className={cn("text-sm font-bold truncate", stat.color)}>
                  {stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Main Grid: Order Panel + Watchlist ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* ── Order Execution Panel ──────────────────────────── */}
        <Card className="border-border lg:col-span-4 xl:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> New Order
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Symbol Input */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
                Symbol (NSE/BSE)
              </label>
              <Input
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value.toUpperCase())}
                placeholder="e.g. RELIANCE, TCS, INFY"
                className="h-9 font-mono"
              />
            </div>

            {/* Order Type */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
                Order Type
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(["MARKET", "LIMIT"] as OrderType[]).map((t) => (
                  <Button
                    key={t}
                    size="sm"
                    variant={orderType === t ? "default" : "outline"}
                    className={cn(
                      "h-8 text-xs font-medium",
                      orderType === t && "bg-primary text-primary-foreground"
                    )}
                    onClick={() => setOrderType(t)}
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>

            {/* Buy / Sell */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className={cn(
                  "h-12 font-bold text-sm border-2 transition-all",
                  orderSide === "BUY"
                    ? "bg-profit/10 border-profit text-profit hover:bg-profit/20"
                    : "border-border text-muted-foreground hover:border-profit hover:text-profit"
                )}
                onClick={() => setOrderSide("BUY")}
              >
                <ChevronUp className="w-4 h-4 mr-1" />
                BUY
              </Button>
              <Button
                variant="outline"
                className={cn(
                  "h-12 font-bold text-sm border-2 transition-all",
                  orderSide === "SELL"
                    ? "bg-loss/10 border-loss text-loss hover:bg-loss/20"
                    : "border-border text-muted-foreground hover:border-loss hover:text-loss"
                )}
                onClick={() => setOrderSide("SELL")}
              >
                <ChevronDown className="w-4 h-4 mr-1" />
                SELL
              </Button>
            </div>

            {/* Price */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
                {orderType === "MARKET" ? "Execution Price (₹)" : "Limit Price (₹)"}
              </label>
              <Input
                type="number"
                step="0.05"
                min="0.01"
                className="h-9 font-mono"
                value={orderType === "MARKET" ? orderPrice : limitPrice}
                onChange={(e) =>
                  orderType === "MARKET"
                    ? setOrderPrice(e.target.value)
                    : setLimitPrice(e.target.value)
                }
                placeholder="Enter price"
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
                Quantity
              </label>
              <div className="flex gap-1.5">
                <Input
                  type="number"
                  step="1"
                  min="1"
                  className="h-9 font-mono"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
                {["1", "5", "10", "25", "50"].map((v) => (
                  <Button
                    key={v}
                    size="sm"
                    variant="outline"
                    className={cn(
                      "h-9 px-2 text-[10px] font-mono shrink-0",
                      quantity === v && "border-primary text-primary"
                    )}
                    onClick={() => setQuantity(v)}
                  >
                    {v}
                  </Button>
                ))}
              </div>
            </div>

            {/* Order Value */}
            {selectedSymbol && (orderPrice || limitPrice) && quantity && (
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 text-xs">
                <span className="text-muted-foreground">Order Value:</span>
                <span className="font-mono font-semibold">
                  ₹
                  {(
                    (parseFloat(orderType === "MARKET" ? orderPrice : limitPrice) || 0) *
                    (parseInt(quantity) || 0)
                  ).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}

            {/* Execute Button */}
            <Button
              className={cn(
                "w-full h-11 font-bold text-sm tracking-wide",
                orderSide === "BUY"
                  ? "bg-profit hover:bg-profit/90 text-white"
                  : "bg-loss hover:bg-loss/90 text-white"
              )}
              onClick={handlePlaceOrder}
              disabled={orderLoading}
            >
              {orderLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {orderSide === "BUY" ? "BUY" : "SELL"} {selectedSymbol || "—"}
            </Button>
          </CardContent>
        </Card>

        {/* ── Watchlist ──────────────────────────────────────── */}
        <Card className="border-border lg:col-span-8 xl:col-span-9">
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" /> Watchlist & Symbol Search
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Filter watchlist..."
                    className="h-8 pl-8 w-36 text-xs"
                    value={watchlistSearch}
                    onChange={(e) => setWatchlistSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Symbol Search from DB */}
            <div className="mb-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search NSE/BSE symbols to add... (e.g. RELIANCE, TCS, HDFC)"
                  className="h-10 pl-10 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchLoading && (
                  <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                )}
              </div>
              {searchResults.length > 0 && (
                <div className="mt-2 max-h-48 overflow-auto border border-border rounded-lg divide-y divide-border">
                  {searchResults.map((sym) => (
                    <div
                      key={sym.id}
                      className="flex items-center justify-between px-3 py-2 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => addToWatchlist(sym)}
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {sym.exchange}
                        </Badge>
                        <div>
                          <span className="font-semibold text-sm">{sym.tradingSymbol}</span>
                          <span className="text-xs text-muted-foreground ml-2">{sym.symbol}</span>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px] text-primary">
                        + Add
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              {searchQuery.length >= 2 && searchResults.length === 0 && !searchLoading && (
                <p className="text-xs text-muted-foreground text-center py-3">
                  No symbols found for "{searchQuery}"
                </p>
              )}
            </div>

            {/* Watchlist Table */}
            <div className="overflow-auto max-h-[350px]">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-8"></TableHead>
                    <TableHead className="text-xs">Symbol</TableHead>
                    <TableHead className="text-xs">Exchange</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">Instrument</TableHead>
                    <TableHead className="text-xs text-right w-28">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWatchlist.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-sm">
                        {watchlist.length === 0
                          ? "🔍 Search symbols above to add to your watchlist"
                          : "No symbols match your filter"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredWatchlist.map((item) => (
                      <TableRow
                        key={item.tradingSymbol}
                        className={cn(
                          "cursor-pointer transition-colors",
                          selectedSymbol === item.tradingSymbol
                            ? "bg-primary/5"
                            : "hover:bg-muted/50"
                        )}
                        onClick={() => setSelectedSymbol(item.tradingSymbol)}
                      >
                        <TableCell className="px-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStar(item.tradingSymbol);
                            }}
                          >
                            {item.starred ? (
                              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                            ) : (
                              <StarOff className="w-3.5 h-3.5 text-muted-foreground/50 hover:text-yellow-500" />
                            )}
                          </button>
                        </TableCell>
                        <TableCell>
                          <div>
                            <span className="font-semibold text-foreground text-sm">
                              {item.tradingSymbol}
                            </span>
                            <p className="text-[10px] text-muted-foreground">{item.symbol}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {item.exchange}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                          {item.instrument}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-[10px] font-bold text-profit hover:bg-profit/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSymbol(item.tradingSymbol);
                                setOrderSide("BUY");
                              }}
                            >
                              BUY
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-[10px] font-bold text-loss hover:bg-loss/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSymbol(item.tradingSymbol);
                                setOrderSide("SELL");
                              }}
                            >
                              SELL
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-[10px] text-muted-foreground hover:text-loss"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFromWatchlist(item.tradingSymbol);
                              }}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Bottom Tabs: Positions / Orders / History ────── */}
      <Card className="border-border">
        <Tabs value={bottomTab} onValueChange={setBottomTab}>
          <CardHeader className="pb-0 flex-row items-center justify-between">
            <TabsList className="h-9">
              <TabsTrigger value="positions" className="gap-1 text-xs h-7">
                <Activity className="w-3 h-3" /> Positions ({positions.length})
              </TabsTrigger>
              <TabsTrigger value="orders" className="gap-1 text-xs h-7">
                <ListOrdered className="w-3 h-3" /> Orders ({orders.length})
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-1 text-xs h-7">
                <History className="w-3 h-3" /> Trade History ({tradeHistory.length})
              </TabsTrigger>
            </TabsList>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs gap-1 text-muted-foreground"
              onClick={loadAllData}
            >
              <RefreshCw className="w-3 h-3" /> Refresh
            </Button>
          </CardHeader>

          <CardContent className="pt-3 p-0">
            {/* ── Open Positions ──────────────────────────────── */}
            <TabsContent value="positions" className="mt-0">
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      {["Symbol", "Side", "Qty", "Avg Price", "Status", "Opened At", ""].map(
                        (h) => (
                          <TableHead
                            key={h}
                            className={cn(
                              "text-[10px] uppercase tracking-wider",
                              ["Qty", "Avg Price"].includes(h) && "text-right"
                            )}
                          >
                            {h}
                          </TableHead>
                        )
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dataLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10">
                          <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    ) : positions.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-10 text-muted-foreground"
                        >
                          No open positions — place your first trade!
                        </TableCell>
                      </TableRow>
                    ) : (
                      positions.map((pos) => (
                        <TableRow key={pos.id} className="hover:bg-muted/30">
                          <TableCell className="font-semibold text-sm">
                            {pos.symbol}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={cn(
                                "text-[10px] font-bold border-0",
                                pos.side === "BUY"
                                  ? "bg-profit/15 text-profit"
                                  : "bg-loss/15 text-loss"
                              )}
                            >
                              {pos.side}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            {Number(pos.quantity)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            ₹{Number(pos.avgPrice).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px]",
                                pos.status === "OPEN"
                                  ? "text-profit border-profit/30"
                                  : "text-muted-foreground"
                              )}
                            >
                              {pos.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {new Date(pos.openedAt).toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell className="text-right">
                            {pos.status === "OPEN" && (
                              <div className="flex items-center gap-1 justify-end">
                                <Input
                                  type="number"
                                  placeholder="Close ₹"
                                  className="h-6 w-20 text-[10px] font-mono"
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => setClosePriceInput(e.target.value)}
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 px-2 text-[10px] text-loss hover:text-loss hover:bg-loss/10"
                                  disabled={closingPositionId === pos.id}
                                  onClick={() => handleClosePosition(pos.id)}
                                >
                                  {closingPositionId === pos.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <>
                                      <X className="w-3 h-3 mr-0.5" /> Close
                                    </>
                                  )}
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* ── Orders ──────────────────────────────────────── */}
            <TabsContent value="orders" className="mt-0">
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      {["Symbol", "Side", "Type", "Qty", "Price", "Filled", "Status", "Time"].map(
                        (h) => (
                          <TableHead
                            key={h}
                            className={cn(
                              "text-[10px] uppercase tracking-wider",
                              ["Qty", "Price", "Filled"].includes(h) && "text-right"
                            )}
                          >
                            {h}
                          </TableHead>
                        )
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dataLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-10">
                          <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    ) : orders.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="text-center py-10 text-muted-foreground"
                        >
                          No orders yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.map((order) => (
                        <TableRow key={order.id} className="hover:bg-muted/30">
                          <TableCell className="font-semibold text-sm">
                            {order.symbol}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={cn(
                                "text-[10px] font-bold border-0",
                                order.side === "BUY"
                                  ? "bg-profit/15 text-profit"
                                  : "bg-loss/15 text-loss"
                              )}
                            >
                              {order.side}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px]">
                              {order.orderType}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            {order.quantity}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            {order.price ? `₹${Number(order.price).toFixed(2)}` : "—"}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            {order.filledQty}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={cn(
                                "text-[10px] border-0 font-bold",
                                order.status === "FILLED"
                                  ? "bg-profit/15 text-profit"
                                  : order.status === "PENDING"
                                  ? "bg-yellow-500/15 text-yellow-600"
                                  : order.status === "CANCELLED"
                                  ? "bg-muted text-muted-foreground"
                                  : "bg-loss/15 text-loss"
                              )}
                            >
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {new Date(order.createdAt).toLocaleString("en-IN")}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* ── Trade History ────────────────────────────────── */}
            <TabsContent value="history" className="mt-0">
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      {["Symbol", "Side", "Qty", "Price", "Brokerage", "P&L", "Time"].map(
                        (h) => (
                          <TableHead
                            key={h}
                            className={cn(
                              "text-[10px] uppercase tracking-wider",
                              ["Qty", "Price", "Brokerage", "P&L"].includes(h) && "text-right"
                            )}
                          >
                            {h}
                          </TableHead>
                        )
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dataLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10">
                          <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    ) : tradeHistory.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-10 text-muted-foreground"
                        >
                          No trade history yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      tradeHistory.map((trade) => (
                        <TableRow key={trade.id} className="hover:bg-muted/30">
                          <TableCell className="font-semibold text-sm">
                            {trade.symbol}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={cn(
                                "text-[10px] font-bold border-0",
                                trade.side === "BUY"
                                  ? "bg-profit/15 text-profit"
                                  : "bg-loss/15 text-loss"
                              )}
                            >
                              {trade.side}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            {trade.quantity}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            ₹{Number(trade.price).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs text-muted-foreground">
                            ₹{Number(trade.brokerage).toFixed(2)}
                          </TableCell>
                          <TableCell
                            className={cn(
                              "text-right font-bold text-sm",
                              trade.pnl != null
                                ? Number(trade.pnl) >= 0
                                  ? "text-profit"
                                  : "text-loss"
                                : "text-muted-foreground"
                            )}
                          >
                            {trade.pnl != null
                              ? `${Number(trade.pnl) >= 0 ? "+" : ""}₹${Number(trade.pnl).toFixed(2)}`
                              : "—"}
                          </TableCell>
                          <TableCell className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {new Date(trade.executedAt).toLocaleString("en-IN")}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default PaperTrade;
