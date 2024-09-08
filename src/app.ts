// Importar módulos necessários
import dotenv from 'dotenv';
import { resolve } from 'path';
import express, { Application } from 'express'; 
import helmet from 'helmet';
import cors from 'cors';
import fileUpload from 'express-fileupload';

dotenv.config({ path: resolve(__dirname, '..', '.env') });

import { resumePdf } from './resumePdf';

const whiteList = [
  process.env.WHITE_LIST_WEBSITE as string,
];

const corsOptions: {
  origin: (origin: string | undefined, callback: (err: Error | null, allowed?: boolean) => void) => void;
  credentials: boolean;
} = {
  origin(origin, callback) {
    if (whiteList.includes(origin ?? '') || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.middleware();
    this.routes();
  }

  private middleware(): void {
    this.app.use(cors(corsOptions));
    this.app.use(helmet());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
    this.app.use(fileUpload({
      limits: { fileSize: 10 * 1024 * 1024 },
    }));
  }

  private routes(): void {
    this.app.post('/upload', resumePdf);
  }
} 

export default new App().app;
