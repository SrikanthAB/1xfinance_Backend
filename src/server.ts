import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { UserRoutes } from './routes/user/auth.route';
import { LoanRoutes } from './routes/loan/loan.route';
import { connectToDatabase } from './db/connection';
import { SchedulerService } from './services/scheduler.service';
import BusinessRoutes from './routes/business/business.route';

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

app.get('/health', async (_req: Request, res: Response) => {
  res.status(200).json({ status: '1x finance api new this' });
});

// Admin endpoint to manually trigger gold rate fetch (for testing)
app.post('/api/admin/fetch-gold-rate', async (_req: Request, res: Response) => {
  try {
    // This will trigger the gold rate fetch immediately
    await SchedulerService.fetchAndStoreGoldRate();
    res.status(200).json({ 
      success: true, 
      message: 'Gold rate fetched and stored successfully' 
    });
  } catch (error) {
    console.error('Error manually fetching gold rate:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch gold rate',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Admin endpoint to get latest gold rate
app.get('/api/admin/gold-rate', async (_req: Request, res: Response) => {
  try {
    const latestRate = await SchedulerService.getLatestGoldRate();
    if (!latestRate) {
      return res.status(404).json({ 
        success: false, 
        message: 'No gold rate found in database' 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      data: latestRate 
    });
  } catch (error) {
    console.error('Error fetching latest gold rate:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch latest gold rate',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Auth alias routes
app.use('/api/auth', new UserRoutes().router);

// Loan routes
app.use('/api/loans', new LoanRoutes().router);

app.use('/api/business', new BusinessRoutes().router);

const port: number = parseInt(process.env.PORT || '3001', 10);

connectToDatabase()
  .then(() => {
    // Start the scheduler service for gold rate fetching
    SchedulerService.startScheduler();
    
    app.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  SchedulerService.stopScheduler();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  SchedulerService.stopScheduler();
  process.exit(0);
});

