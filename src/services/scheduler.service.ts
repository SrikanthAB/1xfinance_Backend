import cron from 'node-cron';
import GoldRate from '../models/goldRate.model';
import { LoanService } from './loan.service';

export class SchedulerService {
  private static isRunning = false;
  private static cronJob: any = null;

  // Gold purity multipliers
  private static readonly GOLD_PURITY_MULTIPLIERS = {
    "18K": 0.75,  // 18/24 = 0.75
    "22K": 0.916, // 22/24 = 0.916
    "24K": 1.0,   // 24/24 = 1.0
  };

  // Start all scheduled jobs
  static startScheduler() {
    if (this.isRunning) {
      console.log('Scheduler is already running');
      return;
    }

    console.log('Starting scheduler service...');
    
    // Schedule gold rate fetch at midnight (00:00) every day
    this.cronJob = cron.schedule('0 0 * * *', async () => {
      console.log('Running daily gold rate fetch at midnight...');
      await this.fetchAndStoreGoldRate();
    }, {
      timezone: "Asia/Kolkata" // Indian timezone
    });

    // Also run immediately on startup to ensure we have today's rate
    this.fetchAndStoreGoldRate();

    this.isRunning = true;
    console.log('Scheduler service started successfully');
  }

  // Stop all scheduled jobs
  static stopScheduler() {
    if (!this.isRunning) {
      console.log('Scheduler is not running');
      return;
    }

    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
    }
    this.isRunning = false;
    console.log('Scheduler service stopped');
  }

  // Fetch gold rate from API and store in database
  static async fetchAndStoreGoldRate() {
    try {
      console.log('Fetching gold rate from API...');
      
      // Fetch gold rate using the existing method
      const goldRatePerGram24K = await this.fetchGoldRateFromAPI();
      
      // Calculate rates for different purities
      const ratePerGram18K = goldRatePerGram24K * this.GOLD_PURITY_MULTIPLIERS["18K"];
      const ratePerGram22K = goldRatePerGram24K * this.GOLD_PURITY_MULTIPLIERS["22K"];

      // Get today's date (start of day)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if rate already exists for today
      const existingRate = await GoldRate.findOne({
        date: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) // Next day
        }
      });

      if (existingRate) {
        console.log('Gold rate for today already exists, updating...');
        existingRate.ratePerGram24K = goldRatePerGram24K;
        existingRate.ratePerGram18K = ratePerGram18K;
        existingRate.ratePerGram22K = ratePerGram22K;
        await existingRate.save();
        console.log('Gold rate updated successfully');
      } else {
        // Create new rate record
        const goldRate = new GoldRate({
          ratePerGram24K: goldRatePerGram24K,
          ratePerGram18K: ratePerGram18K,
          ratePerGram22K: ratePerGram22K,
          date: today
        });

        await goldRate.save();
        console.log('New gold rate saved successfully');
      }

      // Clean up old records (keep only last 30 days)
      await this.cleanupOldRates();

    } catch (error) {
      console.error('Error fetching and storing gold rate:', error);
    }
  }

  // Fetch gold rate from MetalPriceAPI
  private static async fetchGoldRateFromAPI(): Promise<number> {
    try {
      const response = await fetch(
        'https://api.metalpriceapi.com/v1/latest?api_key=7fb7df5917d9397377f6942be8d9da21&base=INR&currencies=XAU'
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      // The API returns XAU as the rate per ounce in the base currency (INR)
      // But the value seems to be inverted, so we need to use INRXAU instead
      const goldRatePerOunce = data.rates.INRXAU || (1 / data.rates.XAU);
      
      // Convert from per ounce to per gram (1 ounce = 31.1035 grams)
      const goldRatePerGram = goldRatePerOunce / 31.1035;
      
      return goldRatePerGram;
    } catch (error) {
      console.error('Failed to fetch gold rate from API:', error);
      // Fallback to static rate if API fails
      return 4815; // 18K rate as fallback, will be converted to 24K
    }
  }

  // Clean up old gold rate records (keep only last 30 days)
  private static async cleanupOldRates() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      thirtyDaysAgo.setHours(0, 0, 0, 0);

      const result = await GoldRate.deleteMany({
        date: { $lt: thirtyDaysAgo }
      });

      if (result.deletedCount > 0) {
        console.log(`Cleaned up ${result.deletedCount} old gold rate records`);
      }
    } catch (error) {
      console.error('Error cleaning up old gold rates:', error);
    }
  }

  // Get the latest gold rate from database
  static async getLatestGoldRate(): Promise<{
    ratePerGram24K: number;
    ratePerGram18K: number;
    ratePerGram22K: number;
    date: Date;
  } | null> {
    try {
      const latestRate = await GoldRate.findOne()
        .sort({ date: -1 })
        .limit(1);

      if (!latestRate) {
        console.log('No gold rate found in database');
        return null;
      }

      return {
        ratePerGram24K: latestRate.ratePerGram24K,
        ratePerGram18K: latestRate.ratePerGram18K,
        ratePerGram22K: latestRate.ratePerGram22K,
        date: latestRate.date
      };
    } catch (error) {
      console.error('Error fetching latest gold rate from database:', error);
      return null;
    }
  }

  // Get gold rate for a specific date
  static async getGoldRateForDate(date: Date): Promise<{
    ratePerGram24K: number;
    ratePerGram18K: number;
    ratePerGram22K: number;
    date: Date;
  } | null> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const rate = await GoldRate.findOne({
        date: {
          $gte: startOfDay,
          $lt: endOfDay
        }
      });

      if (!rate) {
        console.log(`No gold rate found for date: ${date.toISOString().split('T')[0]}`);
        return null;
      }

      return {
        ratePerGram24K: rate.ratePerGram24K,
        ratePerGram18K: rate.ratePerGram18K,
        ratePerGram22K: rate.ratePerGram22K,
        date: rate.date
      };
    } catch (error) {
      console.error('Error fetching gold rate for date:', error);
      return null;
    }
  }
}

export default SchedulerService;
