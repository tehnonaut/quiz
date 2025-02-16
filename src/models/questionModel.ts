import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { IQuiz } from './quizModel';

export enum QuestionType {
	CHOICE = 'choice',
	ANSWER = 'answer',
}

export interface IQuestion extends Document {
	_id: Types.ObjectId;
	type: QuestionType;
	question: string;
	answers: string[];
	correctAnswers: string[]; // select: false means that the correctAnswer will not be returned in the response
	quiz: IQuiz['_id'];

	isDeleted: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>(
	{
		type: { type: String, enum: QuestionType, required: true },
		question: { type: String, required: true, trim: true },
		answers: { type: [String], required: false, default: [] },
		correctAnswers: [{ type: String, required: false, default: [], trim: true, select: false }], // select: false means that the correctAnswer will not be returned in the response
		quiz: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
		isDeleted: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

const Question: Model<IQuestion> = mongoose.model('Question', questionSchema);

export default Question;
