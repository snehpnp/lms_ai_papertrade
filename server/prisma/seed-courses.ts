import { PrismaClient, Role, ExerciseType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

function generateReferralCode(): string {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

async function getOrUpdateAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@tradelearn.pro';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    const hash = await bcrypt.hash(adminPassword, 12);
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: hash,
        name: 'Admin',
        role: Role.ADMIN,
        referralCode: generateReferralCode(),
      },
    });
    console.log('Created Admin user:', adminEmail);
  }
  return admin;
}

const COURSES_DATA = [
  {
    title: "Stock Market Basics for Beginners",
    description: "Master the fundamentals of stock market investing, from understanding how exchanges work to making your first trade.",
    slug: "stock-market-basics",
    price: 99.99,
    modules: [
      {
        title: "Introduction to Financial Markets",
        lessons: [
          { title: "What is a Stock Market?", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Comprehensive guide to stock markets.", pdfUrl: "https://example.com/basics.pdf" },
          { title: "History of Exchanges", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Evolution of trading platforms." },
          { title: "Role of SEBI/Regulators", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Understanding market oversight." },
          { title: "Types of Instruments", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Stocks, Bonds, and more." },
          { title: "Market Participants", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Retail vs Institutional investors." }
        ]
      },
      {
        title: "Understanding Stock Prices",
        lessons: [
          { title: "Demand and Supply", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Wait makes prices move?" },
          { title: "Market Capitalization", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Small, Mid, and Large caps." },
          { title: "Stock Indices (Nifty, Sensex)", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Tracking market performance." },
          { title: "Opening and Closing Sessions", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Market timing basics." },
          { title: "Corporate Actions", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Dividends, Splits, and Bonuses." }
        ]
      },
      {
        title: "Demat and Trading Accounts",
        lessons: [
          { title: "Opening an Account", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "KYC and documentation." },
          { title: "Brokers and Platforms", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Choosing the right broker." },
          { title: "Security and Safety", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Protecting your investments." },
          { title: "Trading Terminology", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Bid, Ask, Spread, etc." },
          { title: "Order Types", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Market, Limit, and SL orders." }
        ]
      },
      {
        title: "Basics of Analysis",
        lessons: [
          { title: "Intro to Fundamental Analysis", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Analyzing company health." },
          { title: "Intro to Technical Analysis", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Reading price charts." },
          { title: "Qualitative Factors", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Management and industry trends." },
          { title: "Quantitative Factors", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Financial statements 101." },
          { title: "Valuation Concepts", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "P/E ratios and more." }
        ]
      },
      {
        title: "First Steps in Trading",
        lessons: [
          { title: "Placing Your First Trade", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Step-by-step execution." },
          { title: "Portfolio Diversification", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Risk management basics." },
          { title: "Common Mistakes to Avoid", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Learning from early errors." },
          { title: "Developing a Mindset", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Psychology of investing." },
          { title: "Continuing the Journey", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Resources for further learning." }
        ]
      }
    ]
  },
  {
    title: "Advanced Technical Analysis",
    description: "Go beyond basic charts. Master indicators, patterns, and algorithmic thinking for precision trading.",
    slug: "advanced-technical-analysis",
    price: 149.99,
    modules: [
      {
        title: "Advanced Candlestick Patterns",
        lessons: [
          { title: "Multibar Patterns", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Complex trading signals." },
          { title: "Gap Analysis", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Trading breakaway gaps." },
          { title: "Heikin Ashi Techniques", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Filtering market noise." },
          { title: "Continuation Patterns", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Flags and Pennants." },
          { title: "Reversal Masterclass", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Identifying trend changes." }
        ]
      },
      {
        title: "Momentum Indicators",
        lessons: [
          { title: "RSI Divergence", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Hidden and Regular divergence." },
          { title: "MACD Strategies", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Histogram analysis." },
          { title: "Stochastic Oscillators", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Overbought/Oversold fine-tuning." },
          { title: "ADX and Trend Strength", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Measuring market momentum." },
          { title: "Combining Indicators", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Building a confluence system." }
        ]
      },
      {
        title: "Price Action Mastery",
        lessons: [
          { title: "Support and Resistance 2.0", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Dynamic levels." },
          { title: "Trendline Breakouts", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Validating price moves." },
          { title: "Order Block Theory", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Institutional trading zones." },
          { title: "Market Structure Shift", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Understanding BOS and CHoCH." },
          { title: "Liquidity Grabs", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Avoiding bull and bear traps." }
        ]
      },
      {
        title: "Fibonacci and Harmonic Trading",
        lessons: [
          { title: "Fibonacci Retracements", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Golden ratios in trading." },
          { title: "Extensions and Projections", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Setting profit targets." },
          { title: "The Gartley Pattern", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Intro to harmonics." },
          { title: "Butterfly and Bat Patterns", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Advanced geometric trading." },
          { title: "Fibonacci Time Zones", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Predicting market turns." }
        ]
      },
      {
        title: "Algorithmic Indicators",
        lessons: [
          { title: "Ichimoku Cloud Basics", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Five lines of insight." },
          { title: "Bollinger Band Squeeze", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Volatility breakouts." },
          { title: "Keltner Channels", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "ATR-based price channels." },
          { title: "Pivot Point Strategies", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Daily and Weekly levels." },
          { title: "Custom Scripting Intro", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Automating your analysis." }
        ]
      }
    ]
  },
  {
    title: "Mastering Options Trading",
    description: "Learn to trade equity and index options. Understand Greeks, spreads, and income-generating strategies.",
    slug: "mastering-options",
    price: 199.99,
    modules: [
      {
        title: "Foundations of Options",
        lessons: [
          { title: "Calls vs Puts", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "The basic building blocks." },
          { title: "Intrinsic vs Extrinsic Value", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Understanding premium pricing." },
          { title: "Moneyness (ITM, ATM, OTM)", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Strike price relationships." },
          { title: "Option Expiration Cycles", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Weekly vs Monthly options." },
          { title: "Exercise and Assignment", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Rights vs Obligations." }
        ]
      },
      {
        title: "The Option Greeks",
        lessons: [
          { title: "Delta: Directional Sensitivity", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Measuring price change impact." },
          { title: "Theta: Time Decay", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "The silent killer of premiums." },
          { title: "Gamma: Acceleration", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "How Delta changes." },
          { title: "Vega: Volatility", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Impact of IV on prices." },
          { title: "Rho: Interest Rates", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Long-term option sensitivity." }
        ]
      },
      {
        title: "Basic Option Strategies",
        lessons: [
          { title: "Long Calls and Puts", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Speculating on direction." },
          { title: "Covered Calls", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Generating income from stocks." },
          { title: "Cash Secured Puts", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Acquiring stocks at a discount." },
          { title: "Vertical Spreads", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Capping risk and reward." },
          { title: "The Wheel Strategy", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "A cyclical income approach." }
        ]
      },
      {
        title: "Volatility Strategies",
        lessons: [
          { title: "Straddles and Strangles", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Trading pure volatility." },
          { title: "Iron Condors", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Neutral market income." },
          { title: "Butterfly Spreads", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Low-cost high-reward trades." },
          { title: "Calendar Spreads", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Trading time decay difference." },
          { title: "Ratio Spreads", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Advanced credit/debit combos." }
        ]
      },
      {
        title: "Risk Management and IV",
        lessons: [
          { title: "Implied Volatility Rank", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Finding cheap/expensive options." },
          { title: "Managing Winners/Losers", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Adjustment techniques." },
          { title: "Portfolio Delta Neutrality", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Hedging your exposure." },
          { title: "Margin Requirements", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Understanding buying power." },
          { title: "Psychology of Option Selling", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Staying disciplined." }
        ]
      }
    ]
  },
  {
    title: "Fundamental Analysis Mastery",
    description: "Learn to read financial statements like a pro. Evaluate business models and calculate intrinsic value.",
    slug: "fundamental-analysis-mastery",
    price: 129.99,
    modules: [
      {
        title: "Reading Financial Statements",
        lessons: [
          { title: "The Balance Sheet", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Assets, Liabilities, and Equity.", pdfUrl: "https://example.com/balance-sheet.pdf" },
          { title: "Profit and Loss Statement", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Revenue and Expenses." },
          { title: "Cash Flow Statement", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Operating, Investing, Financing." },
          { title: "Notes to Accounts", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Where the secrets are hidden." },
          { title: "Annual Report Deep Dive", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Extracting key info." }
        ]
      },
      {
        title: "Ratio Analysis",
        lessons: [
          { title: "Liquidity Ratios", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Current and Quick Ratios." },
          { title: "Profitability Ratios", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "ROE, ROCE, and Margins." },
          { title: "Efficiency Ratios", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Inventory and Asset Turnover." },
          { title: "Solvency Ratios", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Debt to Equity analysis." },
          { title: "Market Ratios", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "P/E, P/B, and Dividend Yield." }
        ]
      },
      {
        title: "Qualitative Analysis",
        lessons: [
          { title: "Management Quality", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Integrity and Vision." },
          { title: "Competitive Moats", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Brand, Cost, and Network effects." },
          { title: "Porter's Five Forces", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Analyzing industry structure." },
          { title: "SWOT Analysis", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Internal and external factors." },
          { title: "Corporate Governance", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Red flags to watch for." }
        ]
      },
      {
        title: "Valuation Models",
        lessons: [
          { title: "Discounted Cash Flow (DCF)", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Calculating future value." },
          { title: "Relative Valuation", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Peer comparison methods." },
          { title: "Dividend Discount Model", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Valuing income stocks." },
          { title: "Asset-Based Valuation", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Liquidation value concepts." },
          { title: "Margin of Safety", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Protecting against errors." }
        ]
      },
      {
        title: "Industry Specific Analysis",
        lessons: [
          { title: "Banking Sector Metrics", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "NIM, CASA, and GNPA." },
          { title: "IT Sector Analysis", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Attrition and Order pipeline." },
          { title: "FMCG Sector Dynamics", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Distribution and Volume growth." },
          { title: "Manufacturing Sector", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Capacity utilization." },
          { title: "Cyclical Industries", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Timing the commodities cycle." }
        ]
      }
    ]
  },
  {
    title: "Psychology and Risk Management",
    description: "Master the mental game of trading. Develop discipline, build a trading plan, and manage risk effectively.",
    slug: "trading-psychology-risk",
    price: 79.99,
    modules: [
      {
        title: "Trading Mindset",
        lessons: [
          { title: "Fear and Greed", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "The duel emotions of traders." },
          { title: "The Probabilistic Mindset", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Thinking in distributions." },
          { title: "Overcoming Biases", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Confirmation and Sunk Cost bias." },
          { title: "The Discipline Flow", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Following rules blindly." },
          { title: "Building Confidence", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Trusting your system." }
        ]
      },
      {
        title: "Position Sizing",
        lessons: [
          { title: "The 1% Rule", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Capping per-trade risk." },
          { title: "Fixed Fractional Sizing", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Growing with your account." },
          { title: "Kelly Criterion Intro", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Mathematical bet sizing." },
          { title: "Managing Drawdowns", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Survival during losing streaks." },
          { title: "Leverage and Ruin", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "The dangers of margin." }
        ]
      },
      {
        title: "The Trading Plan",
        lessons: [
          { title: "Defining Entry Rules", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Checklists for buying." },
          { title: "Exit Strategies", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Knowing when to walk away." },
          { title: "The Trading Journal", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Recording and Reviewing." },
          { title: "Routine and Preparation", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Pre-market rituals." },
          { title: "Review and Refinement", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Iterative improvement." }
        ]
      },
      {
        title: "Risk Control Techniques",
        lessons: [
          { title: "Stop Loss Management", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Placement and Trailing." },
          { title: "Hedging Basics", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Using options to protect." },
          { title: "Correlation Risk", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Don't put all eggs in one sector." },
          { title: "Time-Based Stops", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Closing stagnant trades." },
          { title: "Liquidity Risk", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Avoiding penny stock traps." }
        ]
      },
      {
        title: "Long term Survival",
        lessons: [
          { title: "Avoiding Blowups", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "The 'Game Over' scenarios." },
          { title: "Consistency over Home Runs", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "The power of base hits." },
          { title: "Scaling Your Business", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "From trader to portfolio manager." },
          { title: "Trading for a Living", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "The reality of full-time trading." },
          { title: "Mindfulness and Trading", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", content: "Staying calm in chaos." }
        ]
      }
    ]
  }
];

async function seedExercises(lessonId: string) {
  // Add 5 exercises for each lesson
  for (let i = 1; i <= 5; i++) {
    await prisma.exercise.create({
      data: {
        lessonId,
        type: ExerciseType.MCQ,
        question: `Exercise ${i} for this lesson: What is the primary concept discussed?`,
        options: [
          { id: '1', text: 'Option A', isCorrect: true },
          { id: '2', text: 'Option B', isCorrect: false },
          { id: '3', text: 'Option C', isCorrect: false },
          { id: '4', text: 'Option D', isCorrect: false }
        ],
        order: i,
      }
    });
  }
}

async function main() {
  const admin = await getOrUpdateAdmin();

  console.log('Starting course seed...');

  for (const courseData of COURSES_DATA) {
    const course = await prisma.course.upsert({
      where: { slug: courseData.slug },
      update: {
        title: courseData.title,
        description: courseData.description,
        price: courseData.price,
        subadminId: admin.id,
        isPublished: true,
      },
      create: {
        title: courseData.title,
        description: courseData.description,
        slug: courseData.slug,
        price: courseData.price,
        subadminId: admin.id,
        isPublished: true,
      },
    });

    console.log(`- Seeded Course: ${course.title}`);

    for (let mIndex = 0; mIndex < courseData.modules.length; mIndex++) {
      const moduleData = courseData.modules[mIndex];
      const module = await prisma.module.create({
        data: {
          courseId: course.id,
          title: moduleData.title,
          order: mIndex + 1,
        }
      });

      for (let lIndex = 0; lIndex < moduleData.lessons.length; lIndex++) {
        const lessonData = moduleData.lessons[lIndex];
        const lesson = await prisma.lesson.create({
          data: {
            moduleId: module.id,
            title: lessonData.title,
            content: lessonData.content,
            videoUrl: lessonData.videoUrl,
            pdfUrl: lessonData.pdfUrl || null,
            order: lIndex + 1,
            description: `Detailed description for ${lessonData.title}`,
          }
        });

        await seedExercises(lesson.id);
      }
    }
  }

  console.log('Course seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
