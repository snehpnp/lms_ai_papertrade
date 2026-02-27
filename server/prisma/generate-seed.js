const fs = require('fs');

const courses = [
  {
    title: "Beginner's Guide to Day Trading",
    desc: "Master the fast-paced world of day trading. Learn how to capitalize on short-term market movements, manage risk, and build a consistent daily routine.",
    slug: "beginners-guide-day-trading",
    price: 49.99,
    modules: ["Day Trading Fundamentals", "Technical Setups for Intraday", "Execution and Psychology"]
  },
  {
    title: "Options Selling and Theta Decay",
    desc: "Learn how to act like the casino. Generate consistent income by selling options and taking advantage of time decay.",
    slug: "options-selling-theta",
    price: 149.99,
    modules: ["The Mechanics of Option Selling", "Advanced Credit Spreads", "Risk Management & Adjustments"]
  },
  {
    title: "Price Action and Volume Mastery",
    desc: "Trade naked charts like a pro. Combine pure price action with volume profile to pinpoint institutional entries and exits.",
    slug: "price-action-volume",
    price: 99.99,
    modules: ["Decoding Candlesticks & Market Structure", "Volume Spread Analysis (VSA)", "Trading the Zones"]
  },
  {
    title: "Swing Trading Strategies",
    desc: "Capture multi-day and multi-week trends. Perfect for part-time traders looking to maximize returns without watching the screen all day.",
    slug: "swing-trading-strategies",
    price: 89.99,
    modules: ["Swing Trading Basics", "Trend Identification & Pullbacks", "Position Sizing for Swings"]
  },
  {
    title: "Algorithmic & System Trading",
    desc: "Remove human emotion by building systematic rules. Introduction to backtesting, edge calculation, and automated trading.",
    slug: "algo-system-trading",
    price: 199.99,
    modules: ["System Building 101", "Backtesting & Optimization", "Deploying and Monitoring Strategies"]
  }
];

const lessonsData = [
  // Module 1
  ["What is it?", "Market Hours", "Choosing a Broker", "Charting Tools", "Risk/Reward Basics"],
  // Module 2
  ["Support & Resistance", "Breakout Patterns", "Moving Average Strategies", "VWAP Trading", "Order Flow Basics"],
  // Module 3
  ["Entering Market vs Limit", "Scaling In and Out", "Handling Losses", "Daily Trading Routine", "Journaling Trades"]
];

function generateVideoUrl() {
  return "https://www.youtube.com/embed/dQw4w9WgXcQ";
}

let coursesData = [];

for (let i = 0; i < courses.length; i++) {
  let c = courses[i];
  let courseObj = {
    title: c.title,
    description: c.desc,
    slug: c.slug,
    price: c.price,
    modules: []
  };

  for (let j = 0; j < 3; j++) {
    let modObj = {
      title: c.modules[j],
      lessons: []
    };

    for (let k = 0; k < 5; k++) {
      let lessonTitle = `${lessonsData[j][k]} in ${c.title.split(' ')[0]}`;
      modObj.lessons.push({
        title: lessonTitle,
        videoUrl: "https://www.youtube.com/embed/jfKfPfyJRdk", // Lofi hip hop as placeholder or general trading video.
        content: `Comprehensive guide and deep dive into ${lessonTitle}. In this lesson, we will cover the core principles, practical examples, and actionable steps you need to take to master this concept. Pay close attention to the video and notes below.`,
        description: `High quality lesson covering ${lessonTitle}.`
      });
    }
    courseObj.modules.push(modObj);
  }
  coursesData.push(courseObj);
}

const fileContent = `import { PrismaClient, Role, ExerciseType } from '@prisma/client';
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

const COURSES_DATA = ${JSON.stringify(coursesData, null, 2)};

async function seedExercises(lessonId: string) {
  // Add 10 exercises for each lesson
  for (let i = 1; i <= 10; i++) {
    await prisma.exercise.create({
      data: {
        lessonId,
        type: ExerciseType.MCQ,
        question: \`Exercise \${i} for this lesson: What is the primary concept discussed?\`,
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
        subadminId: admin.id,
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
            description: lessonData.description || \`Detailed description for \${lessonData.title}\`,
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
`;

fs.writeFileSync('e:/lms_ai_papertrade/server/prisma/seed-courses.ts', fileContent);

