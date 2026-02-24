/**
 * Course Seed — 5 Tech/Coding Courses
 * Creates courses with modules, lessons, and quizzes under the ADMIN account.
 *
 * Run:  npx ts-node prisma/seed-courses.ts
 */

import { PrismaClient, ExerciseType } from '@prisma/client';

const prisma = new PrismaClient();

// ──────────────────────────────────────────────────────────────
// Data
// ──────────────────────────────────────────────────────────────

const COURSES = [
  {
    title: 'JavaScript Fundamentals',
    slug: 'javascript-fundamentals',
    description:
      'Master the core concepts of JavaScript — variables, functions, loops, DOM manipulation, and asynchronous programming from scratch.',
    price: 0,            // FREE
    thumbnail:
      'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=1280&q=80',
    modules: [
      {
        title: 'Getting Started with JavaScript',
        lessons: [
          {
            title: 'What is JavaScript?',
            content: 'JavaScript is a lightweight, interpreted programming language with first-class functions. It is most well-known as the scripting language for Web pages...',
            videoUrl: 'https://www.youtube.com/watch?v=W6NZfCO5SIk',
            order: 1,
          },
          {
            title: 'Variables and Data Types',
            content: 'Learn about var, let, const and the different data types: string, number, boolean, null, undefined, symbol, and object.',
            videoUrl: 'https://www.youtube.com/watch?v=9emXNzqCKyg',
            order: 2,
          },
        ],
        quizzes: [
          {
            question: 'Which keyword declares a block-scoped variable in JavaScript?',
            type: ExerciseType.MCQ,
            options: [
              { id: 'a', text: 'var', isCorrect: false },
              { id: 'b', text: 'let', isCorrect: true },
              { id: 'c', text: 'def', isCorrect: false },
              { id: 'd', text: 'dim', isCorrect: false },
            ],
          },
        ],
      },
      {
        title: 'Functions & Scope',
        lessons: [
          {
            title: 'Function Declarations vs Expressions',
            content: 'Understand the difference between function declarations, function expressions, and arrow functions.',
            videoUrl: 'https://www.youtube.com/watch?v=gigtS_5KOqo',
            order: 1,
          },
          {
            title: 'Closures Explained',
            content: 'A closure is the combination of a function bundled together with references to its surrounding state (the lexical environment).',
            videoUrl: 'https://www.youtube.com/watch?v=vKJpN5FAeF4',
            order: 2,
          },
        ],
        quizzes: [
          {
            question: 'What is a closure in JavaScript?',
            type: ExerciseType.FILL_IN_BLANKS,
            answer: JSON.stringify(['a function that remembers its lexical scope']),
          },
        ],
      },
      {
        title: 'Async JavaScript',
        lessons: [
          {
            title: 'Promises and .then()',
            content: 'A Promise is an object representing the eventual completion or failure of an asynchronous operation.',
            videoUrl: 'https://www.youtube.com/watch?v=DHvZLI7Db8E',
            order: 1,
          },
          {
            title: 'Async / Await',
            content: 'The async and await keywords enable asynchronous, promise-based behavior to be written more easily.',
            videoUrl: 'https://www.youtube.com/watch?v=V_Kr9OSfDeU',
            order: 2,
          },
        ],
        quizzes: [
          {
            question: 'What does the async keyword do to a function?',
            type: ExerciseType.MCQ,
            options: [
              { id: 'a', text: 'Makes it run on a separate thread', isCorrect: false },
              { id: 'b', text: 'Makes it always return a Promise', isCorrect: true },
              { id: 'c', text: 'Prevents it from throwing errors', isCorrect: false },
              { id: 'd', text: 'Makes it synchronous', isCorrect: false },
            ],
          },
        ],
      },
    ],
  },

  {
    title: 'Python for Beginners',
    slug: 'python-for-beginners',
    description:
      'Learn Python programming from scratch. Covers syntax, data structures, OOP, file handling, and real-world mini projects.',
    price: 1999,
    thumbnail:
      'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=1280&q=80',
    modules: [
      {
        title: 'Python Basics',
        lessons: [
          {
            title: 'Installing Python & First Program',
            content: 'Set up Python 3.x, configure VS Code, and write your first Hello World program.',
            videoUrl: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
            order: 1,
          },
          {
            title: 'Lists, Tuples, and Dictionaries',
            content: 'Python\'s built-in data structures allow you to store and organize data efficiently.',
            videoUrl: 'https://www.youtube.com/watch?v=n0krwG38SHI',
            order: 2,
          },
        ],
        quizzes: [
          {
            question: 'Which data structure is immutable in Python?',
            type: ExerciseType.MCQ,
            options: [
              { id: 'a', text: 'list', isCorrect: false },
              { id: 'b', text: 'dict', isCorrect: false },
              { id: 'c', text: 'tuple', isCorrect: true },
              { id: 'd', text: 'set', isCorrect: false },
            ],
          },
        ],
      },
      {
        title: 'Object-Oriented Python',
        lessons: [
          {
            title: 'Classes and Objects',
            content: 'Python is an object-oriented language. A class is a blueprint for objects.',
            videoUrl: 'https://www.youtube.com/watch?v=ZDa-Z5JzLYM',
            order: 1,
          },
          {
            title: 'Inheritance & Polymorphism',
            content: 'Inheritance allows you to define a class that inherits all the methods and properties from another class.',
            videoUrl: 'https://www.youtube.com/watch?v=Cn7AkDb4pIU',
            order: 2,
          },
        ],
        quizzes: [
          {
            question: 'Which method is called automatically when an object is created?',
            type: ExerciseType.MCQ,
            options: [
              { id: 'a', text: '__create__', isCorrect: false },
              { id: 'b', text: '__init__', isCorrect: true },
              { id: 'c', text: '__start__', isCorrect: false },
              { id: 'd', text: '__new__', isCorrect: false },
            ],
          },
        ],
      },
    ],
  },

  {
    title: 'React.js Complete Guide',
    slug: 'reactjs-complete-guide',
    description:
      'Build modern UIs with React. Learn components, hooks, state management, React Router, and connect to REST APIs.',
    price: 2999,
    thumbnail:
      'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1280&q=80',
    modules: [
      {
        title: 'React Core Concepts',
        lessons: [
          {
            title: 'What is React and Why Use It?',
            content: 'React is a declarative, component-based JavaScript library for building user interfaces.',
            videoUrl: 'https://www.youtube.com/watch?v=w7ejDZ8SWv8',
            order: 1,
          },
          {
            title: 'JSX Deep Dive',
            content: 'JSX is a syntax extension for JavaScript. It lets you write HTML-like code inside JavaScript.',
            videoUrl: 'https://www.youtube.com/watch?v=7fPXI_MnBOY',
            order: 2,
          },
        ],
        quizzes: [
          {
            question: 'What does JSX stand for?',
            type: ExerciseType.MCQ,
            options: [
              { id: 'a', text: 'JavaScript XML', isCorrect: true },
              { id: 'b', text: 'Java Syntax Extension', isCorrect: false },
              { id: 'c', text: 'JavaScript Extra', isCorrect: false },
              { id: 'd', text: 'JSON Extended', isCorrect: false },
            ],
          },
        ],
      },
      {
        title: 'Hooks & State',
        lessons: [
          {
            title: 'useState Hook',
            content: 'useState is a React hook that lets you add a state variable to your component.',
            videoUrl: 'https://www.youtube.com/watch?v=O6P86uwfdR0',
            order: 1,
          },
          {
            title: 'useEffect Hook',
            content: 'useEffect lets you synchronize a component with an external system such as APIs or subscriptions.',
            videoUrl: 'https://www.youtube.com/watch?v=0ZJgIjIuY7U',
            order: 2,
          },
          {
            title: 'Custom Hooks',
            content: 'Custom hooks let you extract component logic into reusable functions.',
            videoUrl: 'https://www.youtube.com/watch?v=6ThXsUwLWvc',
            order: 3,
          },
        ],
        quizzes: [
          {
            question: 'What is the first argument returned by useState?',
            type: ExerciseType.MCQ,
            options: [
              { id: 'a', text: 'A setter function', isCorrect: false },
              { id: 'b', text: 'The current state value', isCorrect: true },
              { id: 'c', text: 'A ref object', isCorrect: false },
              { id: 'd', text: 'A reducer', isCorrect: false },
            ],
          },
        ],
      },
    ],
  },

  {
    title: 'Node.js & Express REST API',
    slug: 'nodejs-express-rest-api',
    description:
      'Build robust REST APIs with Node.js and Express. Covers routing, middleware, authentication with JWT, and PostgreSQL integration.',
    price: 3499,
    thumbnail:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1280&q=80',
    modules: [
      {
        title: 'Node.js Foundations',
        lessons: [
          {
            title: 'How Node.js Works Under the Hood',
            content: 'Node.js is a JavaScript runtime built on Chrome\'s V8 engine. It uses an event-driven, non-blocking I/O model.',
            videoUrl: 'https://www.youtube.com/watch?v=ENrzD9HAZK4',
            order: 1,
          },
          {
            title: 'Modules & npm',
            content: 'Node.js uses CommonJS modules. npm is the world\'s largest software registry.',
            videoUrl: 'https://www.youtube.com/watch?v=jnnpLoon0zE',
            order: 2,
          },
        ],
        quizzes: [
          {
            question: 'Node.js is based on which JavaScript engine?',
            type: ExerciseType.MCQ,
            options: [
              { id: 'a', text: 'SpiderMonkey', isCorrect: false },
              { id: 'b', text: 'Chakra', isCorrect: false },
              { id: 'c', text: 'V8', isCorrect: true },
              { id: 'd', text: 'Hermes', isCorrect: false },
            ],
          },
        ],
      },
      {
        title: 'Building REST APIs with Express',
        lessons: [
          {
            title: 'Setting Up Express Server',
            content: 'Express is a minimal and flexible Node.js web application framework that provides a robust set of features.',
            videoUrl: 'https://www.youtube.com/watch?v=pKd0Rpw7O48',
            order: 1,
          },
          {
            title: 'Middleware & Error Handling',
            content: 'Middleware functions are functions that have access to the request, response, and next middleware function.',
            videoUrl: 'https://www.youtube.com/watch?v=lY6icfhap2o',
            order: 2,
          },
          {
            title: 'JWT Authentication',
            content: 'JSON Web Tokens are an open standard for securely transmitting information between parties as a JSON object.',
            videoUrl: 'https://www.youtube.com/watch?v=mbsmsi7l3r4',
            order: 3,
          },
        ],
        quizzes: [
          {
            question: 'Which HTTP method is used to UPDATE a resource?',
            type: ExerciseType.MCQ,
            options: [
              { id: 'a', text: 'GET', isCorrect: false },
              { id: 'b', text: 'POST', isCorrect: false },
              { id: 'c', text: 'PATCH', isCorrect: true },
              { id: 'd', text: 'DELETE', isCorrect: false },
            ],
          },
          {
            question: 'JWT stands for ___',
            type: ExerciseType.FILL_IN_BLANKS,
            answer: JSON.stringify(['JSON Web Token']),
          },
        ],
      },
    ],
  },

  {
    title: 'Data Structures & Algorithms in TypeScript',
    slug: 'dsa-typescript',
    description:
      'Master the most important data structures and algorithms using TypeScript. Covers arrays, linked lists, trees, graphs, sorting, and dynamic programming.',
    price: 4999,
    thumbnail:
      'https://images.unsplash.com/photo-1509966756634-9c23dd6e6815?w=1280&q=80',
    modules: [
      {
        title: 'Arrays & Strings',
        lessons: [
          {
            title: 'Arrays — Basics & Common Patterns',
            content: 'Arrays are the most fundamental data structure. Learn two-pointer, sliding window, and prefix sum techniques.',
            videoUrl: 'https://www.youtube.com/watch?v=RBSGKlAvoiM',
            order: 1,
          },
          {
            title: 'String Manipulation',
            content: 'Strings are immutable sequences of characters. We cover reversal, anagram detection, and palindrome checks.',
            videoUrl: 'https://www.youtube.com/watch?v=XKu_SEDAykw',
            order: 2,
          },
        ],
        quizzes: [
          {
            question: 'What is the time complexity of binary search?',
            type: ExerciseType.MCQ,
            options: [
              { id: 'a', text: 'O(n)', isCorrect: false },
              { id: 'b', text: 'O(log n)', isCorrect: true },
              { id: 'c', text: 'O(n²)', isCorrect: false },
              { id: 'd', text: 'O(1)', isCorrect: false },
            ],
          },
        ],
      },
      {
        title: 'Recursion & Dynamic Programming',
        lessons: [
          {
            title: 'Understanding Recursion',
            content: 'Recursion is a method where the solution to a problem depends on solutions to smaller instances of the same problem.',
            videoUrl: 'https://www.youtube.com/watch?v=ngCos392W4w',
            order: 1,
          },
          {
            title: 'Memoization vs Tabulation',
            content: 'Dynamic programming is an optimization technique that stores subproblem results to avoid redundant computations.',
            videoUrl: 'https://www.youtube.com/watch?v=oBt53YbR9Kk',
            order: 2,
          },
        ],
        quizzes: [
          {
            question: 'What is memoization?',
            type: ExerciseType.MCQ,
            options: [
              { id: 'a', text: 'Storing query results in a database', isCorrect: false },
              { id: 'b', text: 'Caching the results of expensive function calls', isCorrect: true },
              { id: 'c', text: 'A sorting algorithm', isCorrect: false },
              { id: 'd', text: 'A graph traversal method', isCorrect: false },
            ],
          },
          {
            question: 'The base case in recursion prevents ___',
            type: ExerciseType.FILL_IN_BLANKS,
            answer: JSON.stringify(['infinite recursion', 'stack overflow']),
          },
        ],
      },
      {
        title: 'Sorting Algorithms',
        lessons: [
          {
            title: 'Bubble Sort & Selection Sort',
            content: 'Learn the simplest comparison-based sorting algorithms and understand their O(n²) time complexity.',
            videoUrl: 'https://www.youtube.com/watch?v=xli_FI7CuzA',
            order: 1,
          },
          {
            title: 'Merge Sort & Quick Sort',
            content: 'Divide-and-conquer sorting algorithms that achieve O(n log n) average time complexity.',
            videoUrl: 'https://www.youtube.com/watch?v=4VqmGXwpLqc',
            order: 2,
          },
        ],
        quizzes: [
          {
            question: 'Which sorting algorithm is stable and has O(n log n) worst-case complexity?',
            type: ExerciseType.MCQ,
            options: [
              { id: 'a', text: 'Quick Sort', isCorrect: false },
              { id: 'b', text: 'Selection Sort', isCorrect: false },
              { id: 'c', text: 'Merge Sort', isCorrect: true },
              { id: 'd', text: 'Heap Sort', isCorrect: false },
            ],
          },
        ],
      },
    ],
  },
];

// ──────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────

async function main() {
  // Find the admin user
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) {
    console.error('❌  No ADMIN user found. Run the main seed first: npm run prisma:seed');
    process.exit(1);
  }

  console.log(`\n🌱  Seeding courses as Admin: ${admin.email}\n`);

  for (const courseData of COURSES) {
    // ── Upsert Course ──
    const existing = await prisma.course.findUnique({ where: { slug: courseData.slug } });
    if (existing) {
      console.log(`  ⏭  Skipping (already exists): ${courseData.title}`);
      continue;
    }

    const course = await prisma.course.create({
      data: {
        title: courseData.title,
        slug: courseData.slug,
        description: courseData.description,
        price: courseData.price,
        thumbnail: courseData.thumbnail,
        isPublished: true,
        subadminId: admin.id,   // Admin is the creator
      },
    });

    console.log(`  ✅  Course: ${course.title} (${courseData.price === 0 ? 'FREE' : `₹${courseData.price}`})`);

    let moduleOrder = 1;
    for (const moduleData of courseData.modules) {
      // ── Create Module ──
      const module = await prisma.module.create({
        data: {
          courseId: course.id,
          title: moduleData.title,
          order: moduleOrder++,
        },
      });
      console.log(`     📦  Module: ${module.title}`);

      // ── Create Lessons ──
      for (const lessonData of moduleData.lessons) {
        const lesson = await prisma.lesson.create({
          data: {
            moduleId: module.id,
            title: lessonData.title,
            content: lessonData.content,
            videoUrl: lessonData.videoUrl,
            order: lessonData.order,
          },
        });
        console.log(`        📖  Lesson: ${lesson.title}`);
      }

      // ── Create Quizzes (linked to module via course) ──
      for (const quiz of moduleData.quizzes) {
        await prisma.exercise.create({
          data: {
            courseId: course.id,
            type: quiz.type,
            question: quiz.question,
            options: (quiz as any).options ?? undefined,
            answer: (quiz as any).answer ?? undefined,
            order: 0,
          },
        });
        console.log(`        ❓  Quiz: ${quiz.question.slice(0, 50)}...`);
      }
    }
  }

  console.log('\n🎉  Course seeding complete!\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
