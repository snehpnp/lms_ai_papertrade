import Redis from 'ioredis';
import { config } from '../config';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
});

redis.on('connect', () => console.log('✅ Redis Connected'));
redis.on('error', (err) => console.error('❌ Redis Error:', err));

export default redis;
