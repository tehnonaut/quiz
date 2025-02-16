import mongoose from 'mongoose';

const mongoUri: string = process.env.MONGO_DB_URI ?? 'mongodb://127.0.0.1:27017/quiz';

export const connectDatabase = async () => {
	try {
		await mongoose.connect(mongoUri);
	} catch (error) {
		console.error('⚠️ Error connecting to MongoDB:', error);		
	}
};

export default connectDatabase;