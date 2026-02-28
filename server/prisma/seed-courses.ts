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
  }
  return admin;
}

const COURSES_DATA = [
  {
    "title": "Beginner's Guide to Day Trading",
    "description": "Master the fast-paced world of day trading. Learn how to capitalize on short-term market movements, manage risk, and build a consistent daily routine.",
    "slug": "beginners-guide-day-trading",
    "price": 49.99,
    "modules": [
      {
        "title": "Day Trading Fundamentals",
        "lessons": [
          {
            "title": "What is it? in Beginner's",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into What is it? in Beginner's. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering What is it? in Beginner's."
          },
          {
            "title": "Market Hours in Beginner's",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Market Hours in Beginner's. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Market Hours in Beginner's."
          },
          {
            "title": "Choosing a Broker in Beginner's",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Choosing a Broker in Beginner's. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Choosing a Broker in Beginner's."
          },
          {
            "title": "Charting Tools in Beginner's",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Charting Tools in Beginner's. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Charting Tools in Beginner's."
          },
          {
            "title": "Risk/Reward Basics in Beginner's",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Risk/Reward Basics in Beginner's. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Risk/Reward Basics in Beginner's."
          }
        ]
      },
      {
        "title": "Technical Setups for Intraday",
        "lessons": [
          {
            "title": "Support & Resistance in Beginner's",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Support & Resistance in Beginner's. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Support & Resistance in Beginner's."
          },
          {
            "title": "Breakout Patterns in Beginner's",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Breakout Patterns in Beginner's. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Breakout Patterns in Beginner's."
          },
          {
            "title": "Moving Average Strategies in Beginner's",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Moving Average Strategies in Beginner's. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Moving Average Strategies in Beginner's."
          },
          {
            "title": "VWAP Trading in Beginner's",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into VWAP Trading in Beginner's. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering VWAP Trading in Beginner's."
          },
          {
            "title": "Order Flow Basics in Beginner's",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Order Flow Basics in Beginner's. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Order Flow Basics in Beginner's."
          }
        ]
      },
      {
        "title": "Execution and Psychology",
        "lessons": [
          {
            "title": "Entering Market vs Limit in Beginner's",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Entering Market vs Limit in Beginner's. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Entering Market vs Limit in Beginner's."
          },
          {
            "title": "Scaling In and Out in Beginner's",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Scaling In and Out in Beginner's. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Scaling In and Out in Beginner's."
          },
          {
            "title": "Handling Losses in Beginner's",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Handling Losses in Beginner's. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Handling Losses in Beginner's."
          },
          {
            "title": "Daily Trading Routine in Beginner's",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Daily Trading Routine in Beginner's. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Daily Trading Routine in Beginner's."
          },
          {
            "title": "Journaling Trades in Beginner's",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Journaling Trades in Beginner's. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Journaling Trades in Beginner's."
          }
        ]
      }
    ]
  },
  {
    "title": "Options Selling and Theta Decay",
    "description": "Learn how to act like the casino. Generate consistent income by selling options and taking advantage of time decay.",
    "slug": "options-selling-theta",
    "price": 149.99,
    "modules": [
      {
        "title": "The Mechanics of Option Selling",
        "lessons": [
          {
            "title": "What is it? in Options",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into What is it? in Options. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering What is it? in Options."
          },
          {
            "title": "Market Hours in Options",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Market Hours in Options. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Market Hours in Options."
          },
          {
            "title": "Choosing a Broker in Options",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Choosing a Broker in Options. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Choosing a Broker in Options."
          },
          {
            "title": "Charting Tools in Options",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Charting Tools in Options. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Charting Tools in Options."
          },
          {
            "title": "Risk/Reward Basics in Options",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Risk/Reward Basics in Options. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Risk/Reward Basics in Options."
          }
        ]
      },
      {
        "title": "Advanced Credit Spreads",
        "lessons": [
          {
            "title": "Support & Resistance in Options",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Support & Resistance in Options. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Support & Resistance in Options."
          },
          {
            "title": "Breakout Patterns in Options",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Breakout Patterns in Options. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Breakout Patterns in Options."
          },
          {
            "title": "Moving Average Strategies in Options",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Moving Average Strategies in Options. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Moving Average Strategies in Options."
          },
          {
            "title": "VWAP Trading in Options",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into VWAP Trading in Options. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering VWAP Trading in Options."
          },
          {
            "title": "Order Flow Basics in Options",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Order Flow Basics in Options. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Order Flow Basics in Options."
          }
        ]
      },
      {
        "title": "Risk Management & Adjustments",
        "lessons": [
          {
            "title": "Entering Market vs Limit in Options",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Entering Market vs Limit in Options. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Entering Market vs Limit in Options."
          },
          {
            "title": "Scaling In and Out in Options",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Scaling In and Out in Options. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Scaling In and Out in Options."
          },
          {
            "title": "Handling Losses in Options",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Handling Losses in Options. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Handling Losses in Options."
          },
          {
            "title": "Daily Trading Routine in Options",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Daily Trading Routine in Options. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Daily Trading Routine in Options."
          },
          {
            "title": "Journaling Trades in Options",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Journaling Trades in Options. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Journaling Trades in Options."
          }
        ]
      }
    ]
  },
  {
    "title": "Price Action and Volume Mastery",
    "description": "Trade naked charts like a pro. Combine pure price action with volume profile to pinpoint institutional entries and exits.",
    "slug": "price-action-volume",
    "price": 99.99,
    "modules": [
      {
        "title": "Decoding Candlesticks & Market Structure",
        "lessons": [
          {
            "title": "What is it? in Price",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into What is it? in Price. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering What is it? in Price."
          },
          {
            "title": "Market Hours in Price",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Market Hours in Price. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Market Hours in Price."
          },
          {
            "title": "Choosing a Broker in Price",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Choosing a Broker in Price. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Choosing a Broker in Price."
          },
          {
            "title": "Charting Tools in Price",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Charting Tools in Price. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Charting Tools in Price."
          },
          {
            "title": "Risk/Reward Basics in Price",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Risk/Reward Basics in Price. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Risk/Reward Basics in Price."
          }
        ]
      },
      {
        "title": "Volume Spread Analysis (VSA)",
        "lessons": [
          {
            "title": "Support & Resistance in Price",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Support & Resistance in Price. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Support & Resistance in Price."
          },
          {
            "title": "Breakout Patterns in Price",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Breakout Patterns in Price. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Breakout Patterns in Price."
          },
          {
            "title": "Moving Average Strategies in Price",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Moving Average Strategies in Price. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Moving Average Strategies in Price."
          },
          {
            "title": "VWAP Trading in Price",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into VWAP Trading in Price. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering VWAP Trading in Price."
          },
          {
            "title": "Order Flow Basics in Price",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Order Flow Basics in Price. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Order Flow Basics in Price."
          }
        ]
      },
      {
        "title": "Trading the Zones",
        "lessons": [
          {
            "title": "Entering Market vs Limit in Price",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Entering Market vs Limit in Price. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Entering Market vs Limit in Price."
          },
          {
            "title": "Scaling In and Out in Price",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Scaling In and Out in Price. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Scaling In and Out in Price."
          },
          {
            "title": "Handling Losses in Price",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Handling Losses in Price. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Handling Losses in Price."
          },
          {
            "title": "Daily Trading Routine in Price",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Daily Trading Routine in Price. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Daily Trading Routine in Price."
          },
          {
            "title": "Journaling Trades in Price",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Journaling Trades in Price. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Journaling Trades in Price."
          }
        ]
      }
    ]
  },
  {
    "title": "Swing Trading Strategies",
    "description": "Capture multi-day and multi-week trends. Perfect for part-time traders looking to maximize returns without watching the screen all day.",
    "slug": "swing-trading-strategies",
    "price": 89.99,
    "modules": [
      {
        "title": "Swing Trading Basics",
        "lessons": [
          {
            "title": "What is it? in Swing",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into What is it? in Swing. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering What is it? in Swing."
          },
          {
            "title": "Market Hours in Swing",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Market Hours in Swing. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Market Hours in Swing."
          },
          {
            "title": "Choosing a Broker in Swing",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Choosing a Broker in Swing. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Choosing a Broker in Swing."
          },
          {
            "title": "Charting Tools in Swing",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Charting Tools in Swing. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Charting Tools in Swing."
          },
          {
            "title": "Risk/Reward Basics in Swing",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Risk/Reward Basics in Swing. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Risk/Reward Basics in Swing."
          }
        ]
      },
      {
        "title": "Trend Identification & Pullbacks",
        "lessons": [
          {
            "title": "Support & Resistance in Swing",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Support & Resistance in Swing. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Support & Resistance in Swing."
          },
          {
            "title": "Breakout Patterns in Swing",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Breakout Patterns in Swing. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Breakout Patterns in Swing."
          },
          {
            "title": "Moving Average Strategies in Swing",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Moving Average Strategies in Swing. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Moving Average Strategies in Swing."
          },
          {
            "title": "VWAP Trading in Swing",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into VWAP Trading in Swing. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering VWAP Trading in Swing."
          },
          {
            "title": "Order Flow Basics in Swing",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Order Flow Basics in Swing. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Order Flow Basics in Swing."
          }
        ]
      },
      {
        "title": "Position Sizing for Swings",
        "lessons": [
          {
            "title": "Entering Market vs Limit in Swing",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Entering Market vs Limit in Swing. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Entering Market vs Limit in Swing."
          },
          {
            "title": "Scaling In and Out in Swing",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Scaling In and Out in Swing. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Scaling In and Out in Swing."
          },
          {
            "title": "Handling Losses in Swing",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Handling Losses in Swing. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Handling Losses in Swing."
          },
          {
            "title": "Daily Trading Routine in Swing",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Daily Trading Routine in Swing. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Daily Trading Routine in Swing."
          },
          {
            "title": "Journaling Trades in Swing",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Journaling Trades in Swing. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Journaling Trades in Swing."
          }
        ]
      }
    ]
  },
  {
    "title": "Algorithmic & System Trading",
    "description": "Remove human emotion by building systematic rules. Introduction to backtesting, edge calculation, and automated trading.",
    "slug": "algo-system-trading",
    "price": 199.99,
    "modules": [
      {
        "title": "System Building 101",
        "lessons": [
          {
            "title": "What is it? in Algorithmic",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into What is it? in Algorithmic. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering What is it? in Algorithmic."
          },
          {
            "title": "Market Hours in Algorithmic",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Market Hours in Algorithmic. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Market Hours in Algorithmic."
          },
          {
            "title": "Choosing a Broker in Algorithmic",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Choosing a Broker in Algorithmic. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Choosing a Broker in Algorithmic."
          },
          {
            "title": "Charting Tools in Algorithmic",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Charting Tools in Algorithmic. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Charting Tools in Algorithmic."
          },
          {
            "title": "Risk/Reward Basics in Algorithmic",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Risk/Reward Basics in Algorithmic. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Risk/Reward Basics in Algorithmic."
          }
        ]
      },
      {
        "title": "Backtesting & Optimization",
        "lessons": [
          {
            "title": "Support & Resistance in Algorithmic",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Support & Resistance in Algorithmic. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Support & Resistance in Algorithmic."
          },
          {
            "title": "Breakout Patterns in Algorithmic",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Breakout Patterns in Algorithmic. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Breakout Patterns in Algorithmic."
          },
          {
            "title": "Moving Average Strategies in Algorithmic",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Moving Average Strategies in Algorithmic. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Moving Average Strategies in Algorithmic."
          },
          {
            "title": "VWAP Trading in Algorithmic",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into VWAP Trading in Algorithmic. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering VWAP Trading in Algorithmic."
          },
          {
            "title": "Order Flow Basics in Algorithmic",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Order Flow Basics in Algorithmic. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Order Flow Basics in Algorithmic."
          }
        ]
      },
      {
        "title": "Deploying and Monitoring Strategies",
        "lessons": [
          {
            "title": "Entering Market vs Limit in Algorithmic",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Entering Market vs Limit in Algorithmic. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Entering Market vs Limit in Algorithmic."
          },
          {
            "title": "Scaling In and Out in Algorithmic",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Scaling In and Out in Algorithmic. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Scaling In and Out in Algorithmic."
          },
          {
            "title": "Handling Losses in Algorithmic",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Handling Losses in Algorithmic. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Handling Losses in Algorithmic."
          },
          {
            "title": "Daily Trading Routine in Algorithmic",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Daily Trading Routine in Algorithmic. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Daily Trading Routine in Algorithmic."
          },
          {
            "title": "Journaling Trades in Algorithmic",
            "videoUrl": "https://www.youtube.com/embed/jfKfPfyJRdk",
            "content": "Comprehensive guide and deep dive into Journaling Trades in Algorithmic. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.",
            "description": "High quality lesson covering Journaling Trades in Algorithmic."
          }
        ]
      }
    ]
  }
];

async function seedExercises(lessonId: string) {
  // Add 10 exercises for each lesson
  for (let i = 1; i <= 10; i++) {
    await prisma.exercise.create({
      data: {
        lessonId,
        type: ExerciseType.MCQ,
        question: `Exercise ${i} for this lesson: What is the primary concept discussed?`,
        options: [
          { id: '1', text: 'Correct Answer', isCorrect: true },
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

  // Optionally clear existing courses/lessons to prevent duplicates:
  // await prisma.course.deleteMany({});

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
        subadminId: admin.id || "4c7ff01c-1b22-4b38-b433-dfc690b64356",
        isPublished: true,
      },
    });

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
            order: lIndex + 1,
            description: lessonData.description || `Detailed description for ${lessonData.title}`,
          }
        });

        await seedExercises(lesson.id);
      }
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
