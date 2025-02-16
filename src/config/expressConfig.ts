import path from 'path';

import express from 'express';

import userRouter from '../routes/userRoutes';
import quizRouter from '../routes/quizRoutes';

const app = express();

// Security (hide the server name)
app.disable('x-powered-by');

// Trust proxy (to forward the request with the correct IP address)
app.set('trust proxy', true);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
const rootDir = process.env?.DIR_ROOT ?? '';

app.use(express.static(path.join(rootDir, 'public')));

//EJS
app.set('view engine', 'ejs');
app.set('views', path.join(rootDir, 'views'));

app.use('/api/user', userRouter);
app.use('/api/quiz', quizRouter);

const PORT = parseInt(process.env?.SERVER_PORT ?? '3000');
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
