import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

const port: number = parseInt(process.env.PORT || '3000', 10);

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

