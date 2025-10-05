import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { UserRoutes } from './routes/user/auth.route';
import { connectToDatabase } from './db/connection';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', async (_req: Request, res: Response) => {
  res.status(200).json({ status: '1x finance api for this' });
});

// Auth alias routes
app.use('/api/auth', new UserRoutes().router);

const port: number = parseInt(process.env.PORT || '3001', 10);

connectToDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

