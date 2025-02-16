import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

process.env.DIR_ROOT = path.resolve(process.cwd());

import connectDatabase from './config/mongooseConfig';
import startServer from './config/expressConfig';

try {
	connectDatabase();
	startServer();
} catch (error) {
	console.error('⚠️ Error connecting to MongoDB:', error);
	process.exit(1);
}
