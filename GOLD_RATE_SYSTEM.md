# Gold Rate System

This system automatically fetches gold rates daily at midnight and stores them in the database to avoid repeated API calls that cost money.

## How it works

1. **Daily Scheduler**: A cron job runs every day at midnight (00:00) Indian time to fetch the latest gold rate from the MetalPriceAPI.

2. **Database Storage**: The fetched gold rate is stored in the `goldrates` collection with rates for different purities (18K, 22K, 24K).

3. **Automatic Cleanup**: Old gold rate records (older than 30 days) are automatically deleted to keep the database clean.

4. **Fallback System**: If the database doesn't have a gold rate, the system falls back to the API call.

## Database Schema

The `GoldRate` model stores:
- `ratePerGram24K`: 24K gold rate per gram
- `ratePerGram18K`: 18K gold rate per gram (calculated as 24K * 0.75)
- `ratePerGram22K`: 22K gold rate per gram (calculated as 24K * 0.916)
- `date`: The date for which the rate is valid
- `createdAt` and `updatedAt`: Timestamps

## API Endpoints

### Admin Endpoints (for testing and monitoring)

1. **Manual Gold Rate Fetch**
   ```
   POST /api/admin/fetch-gold-rate
   ```
   Manually triggers gold rate fetch and storage.

2. **Get Latest Gold Rate**
   ```
   GET /api/admin/gold-rate
   ```
   Returns the latest stored gold rate from the database.

## Configuration

- **Timezone**: Asia/Kolkata (Indian Standard Time)
- **Schedule**: Every day at 00:00 (midnight)
- **Retention**: 30 days of historical data
- **Fallback**: Static rate (₹4815 for 18K) if all else fails

## Benefits

1. **Cost Savings**: Only one API call per day instead of multiple calls per request
2. **Performance**: Faster response times as rates are served from database
3. **Reliability**: Fallback system ensures service availability
4. **Historical Data**: Maintains 30 days of rate history for analysis

## Monitoring

The system logs all activities:
- Successful rate fetches
- API failures and fallbacks
- Database operations
- Cleanup activities

Check the application logs to monitor the system health.
