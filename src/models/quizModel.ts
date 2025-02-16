import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { IUser } from './userModel';
import { IQuestion } from './questionModel';

export interface IQuiz extends Document {
	_id: Types.ObjectId;

	title: string;
	description: string;

	creator: IUser['_id'];

	questions: IQuestion['_id'][];

	duration: number; // in minutes
	isActive: boolean;

	isDeleted: boolean;

	createdAt: Date;
	updatedAt: Date;
}

const quizSchema = new Schema<IQuiz>(
	{
		title: { type: String, required: true },
		description: { type: String, default: '' },
		creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		questions: { type: [Schema.Types.ObjectId], ref: 'Question', required: true },
		duration: { type: Number, default: 45 },
		isActive: { type: Boolean, default: true },
		isDeleted: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

const Quiz: Model<IQuiz> = mongoose.model('Quiz', quizSchema);

export default Quiz;
