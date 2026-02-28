import cron from 'node-cron';
import { settingsService } from './settings.service';
import { aliceBlueWS } from '../market/aliceblue.ws';
import { logger } from '../../utils/activity-logger';

export const cronService = {
    init() {

        // Job 1: Midnight (00:00) - Turn OFF Live Prices
        cron.schedule('0 0 * * *', async () => {
            try {
                await settingsService.upsert('LIVE_PRICE_ENABLED', 'false', 'Automatically disabled by system at 12:00 AM');

                // Disconnect Alice Blue
                aliceBlueWS.disconnect();

                // Log activity (System action, using a placeholder admin ID or 'SYSTEM')
                await logger.log({
                    userId: 'SYSTEM',
                    action: 'LIVE_PRICE_TOGGLE',
                    resource: 'Market',
                    details: { enabled: false, trigger: 'cron', time: '00:00' }
                });

            } catch (error) {
                console.error('[Cron] Midnight Job Error:', error);
            }
        });

        // Job 2: Morning (07:00) - Turn ON Live Prices
        cron.schedule('0 7 * * *', async () => {
            try {
                await settingsService.upsert('LIVE_PRICE_ENABLED', 'true', 'Automatically enabled by system at 07:00 AM');

                // Reconnect Alice Blue
                await aliceBlueWS.connect();

                // Log activity
                await logger.log({
                    userId: 'SYSTEM',
                    action: 'LIVE_PRICE_TOGGLE',
                    resource: 'Market',
                    details: { enabled: true, trigger: 'cron', time: '07:00' }
                });

            } catch (error) {
                console.error('[Cron] Morning Job Error:', error);
            }
        });
    }
};
