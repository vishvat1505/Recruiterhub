import 'express-async-errors';
import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
const app = express();
import http from 'http';
import morgan from 'morgan';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cloudinary from 'cloudinary';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';

// routers
import jobRouter from './routes/jobRouter.js';
import authRouter from './routes/authRouter.js';
import userRouter from './routes/userRouter.js';
import profileRouter from './routes/profileRouter.js';
import applicationRouter from './routes/applicationRouter.js';
import interviewRouter from './routes/interviewRouter.js';
import dashboardRouter from './routes/dashboardRouter.js';
import analyticsRouter from './routes/analyticsRouter.js';
import notificationRouter from './routes/notificationRouter.js';
// public
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';

// middleware
import errorHandlerMiddleware from './middleware/errorHandlerMiddleware.js';
import { authenticateUser } from './middleware/authMiddleware.js';
// realtime
import { initSocket } from './utils/socket.js';

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const __dirname = dirname(fileURLToPath(import.meta.url));
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.static(path.resolve(__dirname, './client/dist')));
app.use(cookieParser());
app.use(express.json());
app.use(helmet());
app.use(mongoSanitize());

app.get('/api/v1/test', (req, res) => {
  res.json({ msg: 'test route' });
});

// Public + authenticated job routes (open browse is inside, but the
// router is auth-protected; candidates are authenticated users)
app.use('/api/v1/jobs', authenticateUser, jobRouter);
app.use('/api/v1/users', authenticateUser, userRouter);
app.use('/api/v1/profiles', authenticateUser, profileRouter);
app.use('/api/v1/applications', authenticateUser, applicationRouter);
app.use('/api/v1/interviews', authenticateUser, interviewRouter);
app.use('/api/v1/dashboard', authenticateUser, dashboardRouter);
app.use('/api/v1/analytics', authenticateUser, analyticsRouter);
app.use('/api/v1/notifications', authenticateUser, notificationRouter);
app.use('/api/v1/auth', authRouter);

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, './client/dist', 'index.html'));
});

app.use('*', (req, res) => {
  res.status(404).json({ msg: 'not found' });
});

app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5100;

// HTTP server wraps Express so Socket.IO can share the same port
const server = http.createServer(app);
initSocket(server);

try {
  await mongoose.connect(process.env.MONGO_URL);
  server.listen(port, () => {
    console.log(`server running on PORT ${port}...`);
  });
} catch (error) {
  console.log(error);
  process.exit(1);
}
