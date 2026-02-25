import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { routes } from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { apiLimiter, authLimiter } from './middlewares/rateLimit';
import { config } from './config';
import { PrismaClient } from "@prisma/client";


const app = express();

const prisma = new PrismaClient();
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.use('/api/v1/auth', authLimiter);
// app.use(apiLimiter);

app.use(routes);

app.use(errorHandler);

app.listen(config.port,"0.0.0.0", () => {
  console.log(`TradeLearn Pro API running on port ${config.port} (${config.env})`);
});




async function testConnection() {
  try {
    await prisma.$connect();
    console.log("Database Connected Successfully ✅");
  } catch (error) {
    console.error("Database Connection Failed ❌", error);
  }
}

testConnection();