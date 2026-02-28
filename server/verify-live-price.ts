import { settingsService } from './src/modules/settings/settings.service';
import { aliceBlueWS } from './src/modules/market/aliceblue.ws';


async function test() {

    // 1. Manually disable
    await settingsService.upsert('LIVE_PRICE_ENABLED', 'false');
    await aliceBlueWS.connect(); // Should return false and not connect
    const status = aliceBlueWS.getStatus();
    await settingsService.upsert('LIVE_PRICE_ENABLED', 'true');
    const connected = await aliceBlueWS.connect();

    process.exit(0);
}

test().catch(console.error);
