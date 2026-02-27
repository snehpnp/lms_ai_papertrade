import { PrismaClient, ExerciseType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {

    // --- COURSE 1: What is Trading? ---
    const course1 = await prisma.course.upsert({
        where: { slug: 'what-is-trading' },
        update: {},
        create: {
            title: 'What is Trading? (Basics of Stock Market)',
            slug: 'what-is-trading',
            description: 'Is course me hum trading ke basic concepts, types of trading aur stock market kaise kaam karta hai, ye sikhenge. Ye beginners ke liye ek complete guide hai.',
            thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1000',
            price: 0,
            isPublished: true,
            modules: {
                create: [
                    {
                        title: 'Module 1: Introduction to Stock Market',
                        order: 1,
                        lessons: {
                            create: [
                                {
                                    title: 'Lesson 1.1: Trading vs Investing (Kya fark hai?)',
                                    order: 1,
                                    content: `<p>Trading ka matlab hai financial instruments (jaise stocks, options, ya currency) ko short-term ke liye kharidna aur bechna, taaki price movements se profit kamaya ja sake.</p><p>Investing ka focus long-term wealth creation par hota hai (jaise saalon tak shares hold karna).</p><p>Trading me technical analysis use hoti hai, jabki investing me fundamental analysis.</p><p><strong>Example:</strong> Agar aap aaj Reliance ke shares kharid kar aaj hi bechte hain, to wo intraday trading hai.</p>`,
                                    exercises: {
                                        create: [
                                            {
                                                type: ExerciseType.MCQ,
                                                question: 'Trading aur Investing me sabse bada difference kya hai?',
                                                options: [
                                                    { id: '1', text: 'Time horizon (Short-term vs Long-term)', isCorrect: true },
                                                    { id: '2', text: 'Trading me risk zero hota hai', isCorrect: false },
                                                    { id: '3', text: 'Investing me technical analysis use hoti hai', isCorrect: false }
                                                ]
                                            },
                                            {
                                                type: ExerciseType.MCQ,
                                                question: 'Jab hum same day share kharid kar bech dete hain, use kya kehte hain?',
                                                options: [
                                                    { id: '1', text: 'Long-term investing', isCorrect: false },
                                                    { id: '2', text: 'Intraday Trading', isCorrect: true },
                                                    { id: '3', text: 'Value Investing', isCorrect: false }
                                                ]
                                            }
                                        ]
                                    }
                                },
                                {
                                    title: 'Lesson 1.2: Stock Market Basic Terminologies',
                                    order: 2,
                                    content: `<p>Market me kaam karne se pehle ye terms aane chahiye:</p><ul><li><strong>Bull Market:</strong> Jab market lagatar upar ja raha ho.</li><li><strong>Bear Market:</strong> Jab market lagatar gir raha ho.</li><li><strong>Long/Short:</strong> 'Long' ka matlab buy karna (price badhne ki umeed me). 'Short' ka matlab pehle sell karna aur baad me lower price par buy karna.</li><li><strong>Bid/Ask Price:</strong> Bid wo price hai jis par buyer kharidna chahta hai, Ask wo price hai jis par seller bechna chahta hai.</li></ul>`,
                                    exercises: {
                                        create: [
                                            {
                                                type: ExerciseType.MCQ,
                                                question: '\'Bull Market\' ka kya matlab hai?',
                                                options: [
                                                    { id: '1', text: 'Market down ja raha hai', isCorrect: false },
                                                    { id: '2', text: 'Market upar (UP) ja raha hai', isCorrect: true },
                                                    { id: '3', text: 'Market close ho gaya hai', isCorrect: false }
                                                ]
                                            },
                                            {
                                                type: ExerciseType.MCQ,
                                                question: 'Agar aap price girne par profit kamana chahte hain, to aap kya karenge?',
                                                options: [
                                                    { id: '1', text: 'Long position banayenge', isCorrect: false },
                                                    { id: '2', text: 'Short Sell karenge', isCorrect: true },
                                                    { id: '3', text: 'Wait karenge', isCorrect: false }
                                                ]
                                            }
                                        ]
                                    }
                                }
                            ]
                        }
                    },
                    {
                        title: 'Module 2: Types of Trading',
                        order: 2,
                        lessons: {
                            create: [
                                {
                                    title: 'Lesson 2.1: Intraday, Swing, and Positional Trading',
                                    order: 1,
                                    pdfUrl: 'https://example.com/trading-styles-comparison.pdf',
                                    content: `<p><strong>Intraday Trading:</strong> Same day buy aur sell. Market close hone se pehle position square-off karni hoti hai.</p><p><strong>Swing Trading:</strong> Kuch dino se lekar kuch hafto tak trades hold karna. Swing traders trends aur chart patterns ka fayda uthate hain.</p><p><strong>Positional Trading:</strong> Months se lekar saalon tak positions hold karna. Ye fundamental aur macroeconomic factors par based hota hai.</p><p><em>(Note: Niche diye gaye PDF me teeno trading styles ka comparison chart dekhein).</em></p>`,
                                    exercises: {
                                        create: [
                                            {
                                                type: ExerciseType.MCQ,
                                                question: 'Swing trading ka holding period generally kitna hota hai?',
                                                options: [
                                                    { id: '1', text: 'Kuch minute', isCorrect: false },
                                                    { id: '2', text: 'Kuch din se hafte', isCorrect: true },
                                                    { id: '3', text: '10 saal', isCorrect: false }
                                                ]
                                            },
                                            {
                                                type: ExerciseType.MCQ,
                                                question: 'Intraday trading me position kab close karni hoti hai?',
                                                options: [
                                                    { id: '1', text: 'Same day market close hone se pehle', isCorrect: true },
                                                    { id: '2', text: 'Agle din', isCorrect: false },
                                                    { id: '3', text: 'Kabhi bhi expiry par', isCorrect: false }
                                                ]
                                            }
                                        ]
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        }
    });


    // --- COURSE 2: Strategies in Trading ---
    const course2 = await prisma.course.upsert({
        where: { slug: 'trading-strategies' },
        update: {},
        create: {
            title: 'Strategies in Trading & How to Make One',
            slug: 'trading-strategies',
            description: 'Trading strategy kyu zaroori hai aur aap apni khud ki profitable trading strategy kaise bana sakte hain? Risk management, backtesting aur price action ka masterclass.',
            thumbnail: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=1000',
            price: 0,
            isPublished: true,
            modules: {
                create: [
                    {
                        title: 'Module 1: Strategy Concepts',
                        order: 1,
                        lessons: {
                            create: [
                                {
                                    title: 'Lesson 1.1: Trading Strategy kya hoti hai aur kyu zaroori hai?',
                                    order: 1,
                                    content: `<p>Bina strategy ke trading karna gambling (jua) jaisa hai. Ek trading strategy rules ka ek fixed set hota hai—jo decide karta hai ki kab entry leni hai, kab exit karna hai, target kya hoga aur stop loss kahan lagega.</p><p>Strategy apko emotions (Fear and Greed) se bachati hai aur data-driven decisions lene me madad karti hai. Achi strategy me minimum 1:2 ka Risk-to-Reward ratio hona chahiye.</p>`,
                                    exercises: {
                                        create: [
                                            {
                                                type: ExerciseType.MCQ,
                                                question: 'Trading strategy follow karne ka sabse bada fayda kya hai?',
                                                options: [
                                                    { id: '1', text: 'Emotional trading control hoti hai', isCorrect: true },
                                                    { id: '2', text: '100% profit ki guarantee milti hai', isCorrect: false },
                                                    { id: '3', text: 'Stop loss hit nahi hota', isCorrect: false }
                                                ]
                                            },
                                            {
                                                type: ExerciseType.MCQ,
                                                question: 'Ideal Risk-to-Reward ratio ek achi strategy ke liye kitna hona chahiye?',
                                                options: [
                                                    { id: '1', text: '1:0.5', isCorrect: false },
                                                    { id: '2', text: '1:1', isCorrect: false },
                                                    { id: '3', text: '1:2 ya usse zyada', isCorrect: true }
                                                ]
                                            }
                                        ]
                                    }
                                }
                            ]
                        }
                    },
                    {
                        title: 'Module 2: Building Your Own Strategy',
                        order: 2,
                        lessons: {
                            create: [
                                {
                                    title: 'Lesson 2.1: Step-by-Step Guide to Create a Strategy',
                                    order: 1,
                                    content: `<p>Apni strategy banane ke liye ye steps follow karein:</p><ol><li><strong>Market Select karein:</strong> Options, Equity ya Forex.</li><li><strong>Indicator ya Price Action choose karein:</strong> Decide karein ki entry kis basis par hogi (Jaise Moving Average crossover).</li><li><strong>Backtesting:</strong> Purane data (past charts) par apni strategy check karein ki wo pichle 1 saal me kitni baar chali.</li><li><strong>Risk Management:</strong> Rule fix karein ki ek trade me apne capital ka 1-2% se zyada risk nahi lenge.</li><li><strong>Forward Testing (Paper Trading):</strong> Live market me virtual money se test karein (Jaise hamari TradeLearn App par).</li></ol>`,
                                    exercises: {
                                        create: [
                                            {
                                                type: ExerciseType.MCQ,
                                                question: 'Purane data par strategy check karne ke process ko kya kehte hain?',
                                                options: [
                                                    { id: '1', text: 'Forward testing', isCorrect: false },
                                                    { id: '2', text: 'Backtesting', isCorrect: true },
                                                    { id: '3', text: 'Paper trading', isCorrect: false }
                                                ]
                                            },
                                            {
                                                type: ExerciseType.MCQ,
                                                question: 'Per trade maximum kitna risk recommend kiya jata hai?',
                                                options: [
                                                    { id: '1', text: 'Capital ka 1-2%', isCorrect: true },
                                                    { id: '2', text: 'Capital ka 20%', isCorrect: false },
                                                    { id: '3', text: 'Capital ka 50%', isCorrect: false }
                                                ]
                                            }
                                        ]
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        }
    });


    // --- COURSE 3: Indicators Kya Hote Hai? ---
    const course3 = await prisma.course.upsert({
        where: { slug: 'indicators-masterclass' },
        update: {},
        create: {
            title: 'Indicators Kya Hote Hai? (Indicators Masterclass)',
            slug: 'indicators-masterclass',
            description: 'Technical analysis ke sabse important tool - Indicators. Leading aur lagging indicators kya hain aur RSI, MACD, aur Moving Averages ko sahi tareeke se kaise use karein.',
            thumbnail: 'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?auto=format&fit=crop&q=80&w=1000',
            price: 0,
            isPublished: true,
            modules: {
                create: [
                    {
                        title: 'Module 1: Indicator Basics',
                        order: 1,
                        lessons: {
                            create: [
                                {
                                    title: 'Lesson 1.1: Leading vs Lagging Indicators',
                                    order: 1,
                                    content: `<p>Indicators mathematical calculations hote hain jo past price aur volume ko calculate kar ke future prediction me madad karte hain.</p><ul><li><strong>Lagging Indicators (Trend-following):</strong> Ye price trend banne ke baad signal dete hain. Example: Moving Average. Ye sideways market me fake signals dete hain.</li><li><strong>Leading Indicators (Oscillators):</strong> Ye price movement se pehle advance signal dene ki koshish karte hain, jaise Overbought ya Oversold zone. Example: RSI.</li></ul>`,
                                    exercises: {
                                        create: [
                                            {
                                                type: ExerciseType.MCQ,
                                                question: 'Inme se konsa Lagging Indicator hai?',
                                                options: [
                                                    { id: '1', text: 'Moving Average', isCorrect: true },
                                                    { id: '2', text: 'RSI', isCorrect: false },
                                                    { id: '3', text: 'Stochastic', isCorrect: false }
                                                ]
                                            },
                                            {
                                                type: ExerciseType.MCQ,
                                                question: 'Sideways market me Lagging indicators ka response kaisa hota hai?',
                                                options: [
                                                    { id: '1', text: 'Bohat accurate', isCorrect: false },
                                                    { id: '2', text: 'Fake aur confusing signals dete hain', isCorrect: true },
                                                    { id: '3', text: 'Koi signal nahi dete', isCorrect: false }
                                                ]
                                            }
                                        ]
                                    }
                                }
                            ]
                        }
                    },
                    {
                        title: 'Module 2: Powerful Indicators',
                        order: 2,
                        lessons: {
                            create: [
                                {
                                    title: 'Lesson 2.1: RSI (Relative Strength Index) aur MACD',
                                    order: 1,
                                    content: `<p><strong>RSI:</strong> Ye 0 se 100 ke beech ghumta hai. Generally, RSI 70 ke upar "Overbought" mana jata hai (yahan se market gir sakta hai), aur 30 ke niche "Oversold" mana jata hai (yahan se market badh sakta hai).</p><p><strong>MACD:</strong> Moving Average Convergence Divergence. Isme do lines hoti hain (MACD line aur signal line). Jab ye cross karti hain, to trade signals generate hote hain. Zero line ke upar ka crossover Bullish hota hai.</p>`,
                                    exercises: {
                                        create: [
                                            {
                                                type: ExerciseType.MCQ,
                                                question: 'RSI me kaunsa level \'Overbought\' condition show karta hai?',
                                                options: [
                                                    { id: '1', text: '30 ke niche', isCorrect: false },
                                                    { id: '2', text: '50 ke aas paas', isCorrect: false },
                                                    { id: '3', text: '70 ke upar', isCorrect: true }
                                                ]
                                            },
                                            {
                                                type: ExerciseType.MCQ,
                                                question: 'MACD ka full form kya hai?',
                                                options: [
                                                    { id: '1', text: 'Maximum Average Center Demand', isCorrect: false },
                                                    { id: '2', text: 'Moving Average Convergence Divergence', isCorrect: true },
                                                    { id: '3', text: 'Momentum Average Calculation Direct', isCorrect: false }
                                                ]
                                            }
                                        ]
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        }
    });

}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
