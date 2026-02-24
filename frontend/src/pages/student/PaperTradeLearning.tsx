import { useState, useEffect } from "react";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen, GraduationCap, TrendingUp, Shield, BarChart3,
  ChevronDown, ChevronUp, CheckCircle2, Clock, Star,
  AlertTriangle, Target, Lightbulb, ArrowRight,
  IndianRupee, CandlestickChart, Layers, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Learning Module Data ────────────────────────────────
interface LessonItem {
  id: string;
  title: string;
  content: string;
  duration: string;
  tips?: string[];
}

interface LearningModule {
  id: string;
  title: string;
  icon: any;
  color: string;
  bgColor: string;
  description: string;
  lessons: LessonItem[];
}

const learningModules: LearningModule[] = [
  {
    id: "basics",
    title: "Stock Market Basics",
    icon: BookOpen,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    description: "शेयर बाजार की बुनियादी बातें समझें — NSE, BSE, और कैसे काम करता है trading।",
    lessons: [
      {
        id: "b1",
        title: "What is Stock Market?",
        duration: "5 min",
        content: "Stock market एक ऐसी जगह है जहां कंपनियों के shares (हिस्सेदारी) खरीदे और बेचे जाते हैं। India में दो प्रमुख stock exchanges हैं:\n\n• **NSE (National Stock Exchange)** — India का सबसे बड़ा exchange, NIFTY 50 index यहीं से है।\n• **BSE (Bombay Stock Exchange)** — Asia का सबसे पुराना exchange, SENSEX index यहीं से है।\n\nजब आप किसी कंपनी का share खरीदते हैं, तो आप उस कंपनी के एक छोटे हिस्से के मालिक बन जाते हैं।",
        tips: ["पहले demo/paper trading से शुरू करें", "किसी अच्छे broker से account खोलें (Zerodha, Angel One, etc.)", "Market hours: सोमवार-शुक्रवार, 9:15 AM - 3:30 PM IST"],
      },
      {
        id: "b2",
        title: "Bull vs Bear Market",
        duration: "4 min",
        content: "**Bull Market (तेजी):** जब market ऊपर जा रहा हो और investors में optimism हो।\n\n**Bear Market (मंदी):** जब market 20% या उससे ज्यादा नीचे आ चुका हो और pessimism हो।\n\nKey Points:\n• Bull market में stocks खरीदना (Long position) फायदेमंद होता है।\n• Bear market में experienced traders Short Selling करते हैं।\n• Sector rotation strategy use करें — हर market cycle में अलग-अलग sectors अच्छा perform करते हैं।",
        tips: ["'Buy low, sell high' — सुनने में आसान, करने में मुश्किल!", "Panic selling से बचें", "SIP (Systematic Investment Plan) long-term के लिए best है"],
      },
      {
        id: "b3",
        title: "Market Participants",
        duration: "4 min",
        content: "Stock market में कई तरह के participants होते हैं:\n\n• **Retail Investors** — आम लोग जो अपने पैसे invest करते हैं।\n• **FII (Foreign Institutional Investors)** — विदेशी बड़ी संस्थाएं।\n• **DII (Domestic Institutional Investors)** — भारतीय म्यूचुअल फंड, Insurance कंपनियां।\n• **HNI (High Net-worth Individuals)** — बड़े पैसे वाले व्यक्तिगत निवेशक।\n• **Market Makers** — Liquidity provide करने वाले।\n\nFII और DII की activity market direction तय करती है।",
      },
    ],
  },
  {
    id: "orders",
    title: "Order Types & Execution",
    icon: Layers,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    description: "Market orders, Limit orders, और Stop-Loss orders कैसे काम करते हैं।",
    lessons: [
      {
        id: "o1",
        title: "Market Order",
        duration: "3 min",
        content: "**Market Order** — तुरंत मौजूदा price पर buy/sell हो जाता है।\n\n**कब use करें:**\n• जब speed ज्यादा important हो और price थोड़ा ऊपर-नीचे चलता रहे।\n• High-liquidity stocks में (जैसे Reliance, TCS, HDFC Bank)\n\n**ध्यान रखें:**\n• Open/close time पर spread ज्यादा हो सकता है।\n• Low-volume stocks में slippage हो सकता है — यानी actual price expected से अलग।",
        tips: ["Volatile markets में Market Order से बचें", "Paper Trading platform पर practice करें"],
      },
      {
        id: "o2",
        title: "Limit Order",
        duration: "4 min",
        content: "**Limit Order** — आप एक specific price set करते हैं जिस पर buy/sell करना है।\n\n**Buy Limit:** Current price से नीचे set किया जाता है। जब price गिरकर आपकी limit तक आए, तब order execute हो।\n\n**Sell Limit:** Current price से ऊपर set किया जाता है।\n\n**Example:**\n• TATA Steel का CMP (Current Market Price) है ₹130\n• आप buy limit ₹125 पर लगाते हैं — जब price ₹125 पर आएगा, tab buy हो जाएगा।",
        tips: ["Long-term investing के लिए best choice", "Order expire हो सकता है अगर price reach नहीं करता"],
      },
      {
        id: "o3",
        title: "Stop-Loss Order",
        duration: "5 min",
        content: "**Stop-Loss (SL)** — Risk management का सबसे important tool!\n\n**कैसे काम करता है:**\n1. आपने ₹500 पर stock खरीदा\n2. Stop-Loss ₹475 पर लगा दिया\n3. अगर price ₹475 तक गिरता है, तो automatically sell हो जाएगा\n4. आपका maximum loss: ₹25 per share (5%)\n\n**Types:**\n• **SL-Market** — Trigger price hit होने पर market order execute\n• **SL-Limit** — Trigger price hit होने पर limit order place\n\n**Golden Rule:** हमेशा Stop-Loss लगाएं! बिना SL के trading मत करें।",
        tips: ["SL generally 2-5% of entry price रखें", "Trailing SL: profit बढ़ने के साथ SL भी ऊपर move करें", "₹1000 के stock पर ₹50 SL = 5% risk"],
      },
    ],
  },
  {
    id: "charts",
    title: "Technical Analysis Basics",
    icon: CandlestickChart,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    description: "Candlestick patterns, support/resistance, और trend analysis सीखें।",
    lessons: [
      {
        id: "c1",
        title: "Candlestick Charts Reading",
        duration: "6 min",
        content: "**Candlestick** — सबसे popular chart type!\n\nहर candle 4 चीज़ें बताती है:\n• **Open** — Candle किस price से शुरू हुई\n• **High** — सबसे ऊंचा price\n• **Low** — सबसे नीचा price\n• **Close** — Candle किस price पर बंद हुई\n\n**Green/White Candle:** Close > Open (तेजी)\n**Red/Black Candle:** Close < Open (मंदी)\n\n**Important Patterns:**\n• **Doji** — Open ≈ Close, market undecided\n• **Hammer** — Bottom पर bullish reversal signal\n• **Shooting Star** — Top पर bearish reversal signal\n• **Engulfing** — Strong trend reversal signal",
        tips: ["Multiple timeframes check करें — Daily + Hourly", "Pattern को confirm करने के लिए अगली candle का wait करें"],
      },
      {
        id: "c2",
        title: "Support & Resistance",
        duration: "5 min",
        content: "**Support Level** — वो price level जहां से stock bounce back करता है (buying pressure ज्यादा)।\n\n**Resistance Level** — वो level जहां से stock नीचे आता है (selling pressure ज्यादा)।\n\n**Key Concepts:**\n• Support टूटने पर वो Resistance बन जाता है (और vice versa)\n• जितने बार एक level test हो, उतना strong माना जाता है\n• Volume confirmation ज़रूरी है\n\n**Example:**\nNIFTY 50 at 22,000 — अगर ये 3 बार 21,800 से bounce कर चुका है, तो 21,800 एक strong support है।",
        tips: ["Round numbers (₹100, ₹500, ₹1000) अक्सर S/R levels होते हैं", "Breakout + Volume = Strong signal"],
      },
    ],
  },
  {
    id: "risk",
    title: "Risk Management",
    icon: Shield,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    description: "Capital protection, position sizing, और risk-reward ratio — trading में survive करने का formula।",
    lessons: [
      {
        id: "r1",
        title: "Position Sizing",
        duration: "5 min",
        content: "**Position Sizing** — कितना पैसा एक trade में लगाना है?\n\n**2% Rule (सबसे popular):**\n• एक trade में अपनी total capital का maximum 2% risk करें।\n\n**Example:**\n• Total Capital: ₹1,00,000\n• Max Risk per Trade: ₹2,000 (2%)\n• Stock Price: ₹500, SL: ₹480 (₹20 risk per share)\n• Max Shares: ₹2,000 / ₹20 = 100 shares\n• Position Size: 100 × ₹500 = ₹50,000\n\n**Benefits:**\n• 10 consecutive losses ke baad bhi 80% capital bachi rahti hai\n• एक bad trade से account blow up नहीं होगा",
        tips: ["शुरुआत में 1% rule follow करें", "कभी 5% से ज्यादा risk एक trade पर मत लें"],
      },
      {
        id: "r2",
        title: "Risk-Reward Ratio",
        duration: "4 min",
        content: "**Risk-Reward Ratio (RRR)** — कितना risk लेने पर कितना potential reward?\n\n**Minimum 1:2 RRR target करें:**\n• Risk: ₹20 (SL distance)\n• Reward: ₹40 (Target distance)\n• RRR = 1:2\n\n**Why it matters:**\nAgar aapka win rate 40% bhi hai aur RRR 1:2 hai:\n• 10 trades: 4 wins × ₹40 = ₹160 profit\n• 10 trades: 6 losses × ₹20 = ₹120 loss\n• **Net profit: ₹40** (loss zyada hone par bhi profit!)\n\nIs liye RRR win rate se zyada important hai!",
        tips: ["1:3 RRR ideal hai swing trading ke liye", "Trade entry se pehle RRR calculate karein"],
      },
      {
        id: "r3",
        title: "Trading Psychology",
        duration: "5 min",
        content: "**Trading Psychology** — 90% traders fail kyun hote hain?\n\n**Common Mistakes:**\n1. **FOMO (Fear Of Missing Out)** — Rally miss hone ke darr mein late entry\n2. **Revenge Trading** — Loss ke baad jaldi recover karne ke liye bade trades\n3. **Overtrading** — Zyada trades = zyada brokerage + zyada risk\n4. **Not Following Plan** — SL hata dena, target badal dena\n\n**Solutions:**\n• Trading journal rakhein — har trade record karein\n• Pre-defined rules banayein aur follow karein\n• Daily loss limit set karein (2-3% of capital)\n• Emotions ko trading se separate karein\n\n**Paper Trading** isiliye important hai — real money lagane se pehle practice karein!",
        tips: ["Har din maximum 3-5 trades karein", "Loss hone par PC se dur rahein, break lein", "Paper Trading mein kam se kam 1 mahina practice karein"],
      },
    ],
  },
  {
    id: "indian",
    title: "Indian Market Specifics",
    icon: IndianRupee,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    description: "NSE/BSE trading hours, SEBI regulations, circuits, और settlement process।",
    lessons: [
      {
        id: "i1",
        title: "Trading Hours & Sessions",
        duration: "3 min",
        content: "**Indian Stock Market Timings:**\n\n• **Pre-Market Session:** 9:00 AM - 9:15 AM (Order matching)\n• **Market Hours:** 9:15 AM - 3:30 PM (Continuous trading)\n• **Post-Closing:** 3:30 PM - 4:00 PM\n\n**Best Trading Times:**\n• **9:15 - 9:45 AM** — High volatility, gap up/down trades\n• **2:30 - 3:30 PM** — Closing time trades, trend confirmation\n• **11:00 - 1:00 PM** — Generally low volume, avoid trading\n\n**Market Holidays:** SEBI 15-18 holidays announce karta hai har saal (Diwali, Republic Day, etc.)",
        tips: ["First 15 minutes mein trade avoid karein agar beginner hain", "Muhurat Trading: Diwali par special 1-hour session hota hai"],
      },
      {
        id: "i2",
        title: "SEBI Rules & Circuit Breakers",
        duration: "4 min",
        content: "**SEBI (Securities & Exchange Board of India)** — Indian market ka regulator।\n\n**Circuit Breaker Limits:**\n• **Individual Stock:**\n  — 5%, 10%, 20% — daily price movement limits\n  — Upper Circuit: stock zyada upar nahi ja sakta\n  — Lower Circuit: stock zyada niche nahi gir sakta\n\n• **Market-wide Circuit Breaker:**\n  — 10% movement: 45 min halt (pehle 1 PM tak)\n  — 15% movement: 1:45 hrs halt\n  — 20% movement: Trading band for the day\n\n**T+1 Settlement:**\n• 2024 se India mein T+1 settlement hai\n• Aaj buy kiya, kal demat account mein shares aayenge\n• Sell karne par paisa T+1 par account mein aayega",
        tips: ["Circuit stock mein trading avoid karein agar beginner hain", "F&O mein circuit nahi lagta, caution se trade karein"],
      },
      {
        id: "i3",
        title: "Popular Indian Indices & Sectors",
        duration: "4 min",
        content: "**Major Indian Indices:**\n\n• **NIFTY 50** — Top 50 companies of NSE\n• **SENSEX** — Top 30 companies of BSE\n• **NIFTY BANK** — Top banking stocks\n• **NIFTY IT** — IT sector index\n• **NIFTY MIDCAP** — Mid-cap companies\n\n**Key Sectors:**\n1. **Banking & Finance** — HDFC, ICICI, SBI, Kotak\n2. **IT** — TCS, Infosys, Wipro, HCL Tech\n3. **FMCG** — HUL, ITC, Nestle, Dabur\n4. **Pharma** — Sun Pharma, Dr. Reddy's, Cipla\n5. **Auto** — Tata Motors, M&M, Maruti\n6. **Energy** — Reliance, ONGC, NTPC, Power Grid\n\nSector rotation samajhna profitable trading ke liye crucial hai!",
      },
    ],
  },
  {
    id: "paper",
    title: "Paper Trading Guide",
    icon: Target,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    description: "Paper Trading kaise karein, strategy test karein, aur real market ke liye prepare hon।",
    lessons: [
      {
        id: "p1",
        title: "What is Paper Trading?",
        duration: "3 min",
        content: "**Paper Trading** — Virtual money se real market conditions mein trade karna।\n\n**Benefits:**\n• ✅ Zero risk — real money nahi lagta\n• ✅ Strategy testing — apni strategy 100 trades pe test karein\n• ✅ Platform familiarity — trading platform seekhein bina dar ke\n• ✅ Emotional control — discipline develop karein\n• ✅ Record keeping — win rate, RRR track karein\n\n**Yahan Platform Mein:**\n• ₹10,00,000 virtual balance milta hai\n• Real Indian market symbols (NSE/BSE stocks)\n• Real-time jaise order execution\n• Complete P&L tracking\n• Trade history aur performance analytics",
        tips: ["Minimum 100 trades complete karein paper trading mein", "Paper trading ko seriously treat karein — jaise real money ho"],
      },
      {
        id: "p2",
        title: "How to Use This Platform",
        duration: "5 min",
        content: "**Step-by-Step Paper Trading Guide:**\n\n**1. Watchlist banayein:**\n• Symbols search karein (RELIANCE, TCS, etc.)\n• Favorites mein add karein\n\n**2. Analysis karein:**\n• Support/Resistance identify karein\n• Volume check karein\n\n**3. Order Place karein:**\n• Symbol select karein\n• BUY ya SELL choose karein\n• Quantity enter karein\n• Order type select karein (MARKET / LIMIT)\n• Stop-Loss zaroor set karein\n\n**4. Position Monitor karein:**\n• Open positions tab mein apni positions dekhein\n• P&L track karein\n\n**5. Position Close karein:**\n• Target ya SL hit hone par close karein\n• Trade history mein review karein\n\n**6. Review & Improve:**\n• Har hafte apne trades review karein\n• Win rate aur RRR calculate karein\n• Strategy mein improvements karein",
        tips: ["Phir real trading mein shift karein tab bhi chhoti capital se shuru karein", "Har trade se kuch seekhein — chahe profit ho ya loss"],
      },
    ],
  },
];

// ── Component ──────────────────────────────────────────────
const PaperTradeLearning = () => {
  const [expandedModule, setExpandedModule] = useState<string | null>("basics");
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [expandedLesson, setExpandedLesson] = useState<string | null>("b1");

  // Load progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("pt_learning_progress");
    if (saved) {
      try {
        const arr = JSON.parse(saved);
        setCompletedLessons(new Set(arr));
      } catch {}
    }
  }, []);

  const toggleLessonComplete = (lessonId: string) => {
    setCompletedLessons((prev) => {
      const next = new Set(prev);
      if (next.has(lessonId)) {
        next.delete(lessonId);
      } else {
        next.add(lessonId);
      }
      localStorage.setItem("pt_learning_progress", JSON.stringify([...next]));
      return next;
    });
  };

  const totalLessons = learningModules.reduce((s, m) => s + m.lessons.length, 0);
  const completedCount = completedLessons.size;
  const overallProgress = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="📚 Paper Trading Learning Hub"
        subtitle="Indian Stock Market ki complete guide — basics se advanced tak, Hindi aur English mein"
      />

      {/* ── Overall Progress Card ──────────────────────────── */}
      <Card className="mb-6 border-border overflow-hidden">
        <div className="relative">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              background:
                "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)",
            }}
          />
          <CardContent className="relative p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center">
                  <GraduationCap className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    Your Learning Progress
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {completedCount} of {totalLessons} lessons completed
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 min-w-[200px]">
                <Progress value={overallProgress} className="h-3 flex-1" />
                <span className="text-sm font-bold text-primary min-w-[40px] text-right">
                  {Math.round(overallProgress)}%
                </span>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* ── Quick Start Cards ──────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="border-border group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              onClick={() => { setExpandedModule("basics"); setExpandedLesson("b1"); }}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Lightbulb className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="font-semibold text-sm">Beginner?</p>
              <p className="text-xs text-muted-foreground">Basics se shuru karein →</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              onClick={() => { setExpandedModule("risk"); setExpandedLesson("r1"); }}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="font-semibold text-sm">Risk Management</p>
              <p className="text-xs text-muted-foreground">Paise bachana seekhein →</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              onClick={() => { setExpandedModule("paper"); setExpandedLesson("p2"); }}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <p className="font-semibold text-sm">Start Trading</p>
              <p className="text-xs text-muted-foreground">Platform kaise use karein →</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Learning Modules ──────────────────────────────── */}
      <div className="space-y-4">
        {learningModules.map((module) => {
          const isExpanded = expandedModule === module.id;
          const moduleCompleted = module.lessons.filter((l) => completedLessons.has(l.id)).length;
          const modulePct = (moduleCompleted / module.lessons.length) * 100;

          return (
            <Card
              key={module.id}
              className={cn(
                "border-border transition-all duration-300 overflow-hidden",
                isExpanded && "shadow-lg ring-1 ring-primary/20"
              )}
            >
              {/* Module Header */}
              <CardHeader
                className="cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedModule(isExpanded ? null : module.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center transition-transform",
                        module.bgColor,
                        isExpanded && "scale-110"
                      )}
                    >
                      <module.icon className={cn("w-6 h-6", module.color)} />
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {module.title}
                        {modulePct === 100 && (
                          <Badge className="bg-profit/15 text-profit border-0 text-[10px]">
                            <CheckCircle2 className="w-3 h-3 mr-0.5" /> Complete
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        {module.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2 min-w-[120px]">
                      <Progress value={modulePct} className="h-1.5 flex-1" />
                      <span className="text-xs text-muted-foreground min-w-[28px] text-right">
                        {moduleCompleted}/{module.lessons.length}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CardHeader>

              {/* Module Lessons */}
              {isExpanded && (
                <CardContent className="pt-0 space-y-3">
                  {module.lessons.map((lesson) => {
                    const isLessonExpanded = expandedLesson === lesson.id;
                    const isDone = completedLessons.has(lesson.id);

                    return (
                      <div
                        key={lesson.id}
                        className={cn(
                          "rounded-xl border transition-all duration-200",
                          isLessonExpanded
                            ? "border-primary/30 bg-primary/[0.02] shadow-sm"
                            : "border-border hover:border-primary/20"
                        )}
                      >
                        {/* Lesson Header */}
                        <button
                          className="w-full flex items-center justify-between p-4 text-left"
                          onClick={() =>
                            setExpandedLesson(isLessonExpanded ? null : lesson.id)
                          }
                        >
                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLessonComplete(lesson.id);
                              }}
                              className={cn(
                                "w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all shrink-0",
                                isDone
                                  ? "bg-profit border-profit text-white"
                                  : "border-border hover:border-primary"
                              )}
                            >
                              {isDone && <CheckCircle2 className="w-4 h-4" />}
                            </button>
                            <div>
                              <span
                                className={cn(
                                  "font-medium text-sm",
                                  isDone && "line-through text-muted-foreground"
                                )}
                              >
                                {lesson.title}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              {lesson.duration}
                            </Badge>
                            {isLessonExpanded ? (
                              <ChevronUp className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                        </button>

                        {/* Lesson Content */}
                        {isLessonExpanded && (
                          <div className="px-4 pb-4 pt-0">
                            <div className="ml-10 space-y-4">
                              {/* Content */}
                              <div className="prose prose-sm max-w-none text-foreground/90 text-sm leading-relaxed">
                                {lesson.content.split("\n").map((line, i) => {
                                  if (line.startsWith("**") && line.endsWith("**")) {
                                    return (
                                      <h4 key={i} className="font-bold text-foreground mt-3 mb-1">
                                        {line.replace(/\*\*/g, "")}
                                      </h4>
                                    );
                                  }
                                  if (line.startsWith("• ") || line.startsWith("— ")) {
                                    return (
                                      <p key={i} className="ml-3 text-foreground/80">
                                        {line}
                                      </p>
                                    );
                                  }
                                  if (line.match(/^\d+\./)) {
                                    return (
                                      <p key={i} className="ml-3 text-foreground/80 font-medium">
                                        {line}
                                      </p>
                                    );
                                  }
                                  if (line.trim() === "") return <br key={i} />;
                                  return (
                                    <p key={i} className="text-foreground/80">
                                      {line.replace(/\*\*(.*?)\*\*/g, "「$1」")}
                                    </p>
                                  );
                                })}
                              </div>

                              {/* Tips */}
                              {lesson.tips && lesson.tips.length > 0 && (
                                <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                                    <span className="text-xs font-bold text-amber-600">
                                      💡 Pro Tips
                                    </span>
                                  </div>
                                  <ul className="space-y-1">
                                    {lesson.tips.map((tip, i) => (
                                      <li
                                        key={i}
                                        className="text-xs text-foreground/70 flex items-start gap-2"
                                      >
                                        <Star className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                                        {tip}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Mark as complete */}
                              <div className="flex items-center justify-between pt-2">
                                <Button
                                  size="sm"
                                  variant={isDone ? "outline" : "default"}
                                  className="gap-1.5 text-xs"
                                  onClick={() => toggleLessonComplete(lesson.id)}
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  {isDone ? "Mark Incomplete" : "Mark as Complete"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* ── CTA Card ──────────────────────────────────────── */}
      <Card className="mt-8 border-border overflow-hidden">
        <div className="relative">
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              background:
                "linear-gradient(135deg, hsl(142 71% 45%) 0%, hsl(199 89% 48%) 100%)",
            }}
          />
          <CardContent className="relative p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-profit/15 flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-profit" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Ready to Start Trading?</h3>
                <p className="text-sm text-muted-foreground">
                  ₹10,00,000 virtual balance ke saath risk-free practice karein
                </p>
              </div>
            </div>
            <Button
              className="gap-2 bg-profit hover:bg-profit/90 text-white shadow-lg"
              onClick={() => (window.location.href = "/user/paper-trade")}
            >
              <CandlestickChart className="w-4 h-4" />
              Start Paper Trading
              <ArrowRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </div>
      </Card>
    </div>
  );
};

export default PaperTradeLearning;
