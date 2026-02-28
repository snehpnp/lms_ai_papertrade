import { RiskEngine } from './modules/trade/risk.service';
import { aliceBlueWS } from './modules/market/aliceblue.ws';
import { prisma } from './utils/prisma';
import { settingsService } from './modules/settings/settings.service';

let isRiskEngineRunning = false;

async function checkAndToggleRiskEngine() {
    try {
        const isEnabled = await settingsService.getByKey('LIVE_PRICE_ENABLED');

        if (isEnabled === 'false') {
            if (isRiskEngineRunning) {

                RiskEngine.stop();
                aliceBlueWS.disconnect();
                isRiskEngineRunning = false;
            }
            // If already paused, just wait silently to avoid spamming the logs
        } else {
            if (!isRiskEngineRunning) {
                const connected = await aliceBlueWS.connect();
                if (connected) {
                    await RiskEngine.init();
                    isRiskEngineRunning = true;
                } else {
                    console.error('❌ Failed to connect to Alice Blue WebSocket. Will retry...');
                }
            } else {
                // Already running, maybe check connection status if needed
                const status = aliceBlueWS.getStatus();
                if (!status.connected) {
                    const connected = await aliceBlueWS.connect();
                    if (!connected) {
                        console.error('❌ Failed to reconnect to Alice Blue WebSocket.');
                    }
                }
            }
        }
    } catch (error) {
        console.error('❌ Error in checkAndToggleRiskEngine:', error);
    }
}

async function startWorker() {

    try {
        await prisma.$connect();

        // Run the first check immediately
        await checkAndToggleRiskEngine();

        // Then poll every 5 seconds to check if admin changes the status
        setInterval(checkAndToggleRiskEngine, 5000);

    } catch (error) {
        console.error('❌ Risk Engine Startup Error:', error);
        process.exit(1);
    }
}

startWorker();
