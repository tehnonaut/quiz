import express from 'express';

import cors from 'cors';

import userRouter from '../routes/userRoutes';
import quizRouter from '../routes/quizRoutes';

import participantRouter from '../routes/participantRoutes';
import { errorHandlerMiddleware } from '../middlewares/errorHandlerMiddleware';
const allowedOrigins = [
	'http://localhost:3000',
	'http://localhost:8080',
	'https://quiz.tools',
	'https://api.quiz.tools',
	'https://igor.quiz.tools',
	'https://api.dev.quiz.tools',
];

const app = express();

// Security (hide the server name)
app.disable('x-powered-by');

// Trust proxy (to forward the request with the correct IP address)
app.set('trust proxy', true);

const corsOptions = {
	origin: (origin: string | undefined, callback: (error: Error | null, allowed: boolean) => void) => {
		// Allow requests with no origin (like mobile apps, curl, Postman)
		if (!origin) {
			return callback(null, true);
		}

		if (allowedOrigins.includes(origin)) {
			return callback(null, true);
		}

		callback(new Error('Not allowed by CORS'), false);
	},
	credentials: true,
};

app.use(cors(corsOptions));
// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/user', userRouter);
app.use('/quiz', quizRouter);
app.use('/participant', participantRouter);

app.use('/', (_req, res) => {
	res.json({ message: 'Hello from Quiz API' });
});

app.use(errorHandlerMiddleware);

const PORT = parseInt(process.env?.SERVER_PORT ?? '8000');
const ADDR = process.env?.SERVER_ADDR ?? '127.0.0.1';

const startServer = () => {
	try {
		app.listen(PORT, ADDR, () => {
			console.log(`Server is running on ${ADDR}:${PORT}`);
		});
	} catch (error) {
		console.error('⚠️ Server is not running', error);
	}
};

export default startServer;
