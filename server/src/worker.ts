import { RiskEngine } from './modules/trade/risk.service';
import { aliceBlueWS } from './modules/market/aliceblue.ws';
import { prisma } from './utils/prisma';

async function startRiskEngine() {
    console.log('🚀 Starting Dedicated Risk Engine Worker...');

    try {
        await prisma.$connect();
        console.log('✅ Connected to Database');

        const connected = await aliceBlueWS.connect();
        if (connected) {
            console.log('✅ Connected to Alice Blue WebSocket');
            await RiskEngine.init();
            console.log('🔥 Risk Engine is now monitoring positions');
        } else {
            console.error('❌ Failed to connect to Alice Blue WebSocket. Retrying in 10s...');
            setTimeout(startRiskEngine, 10000);
        }
    } catch (error) {
        console.error('❌ Risk Engine Startup Error:', error);
        process.exit(1);
    }
}

startRiskEngine();
