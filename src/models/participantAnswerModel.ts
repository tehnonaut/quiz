import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { IQuiz } from './quizModel';
import { IQuestion } from './questionModel';
import { IParticipant } from './participantModel';

export interface IParticipantAnswer extends Document {
	_id: Types.ObjectId; // id of the participant
	participant: IParticipant['_id'];
	quiz: IQuiz['_id']; // id of the quiz
	question: IQuestion['_id']; // id of the question
	answer: string;
	createdAt: Date; // date of creation
	updatedAt: Date; // date of update
}

const participantAnswerSchema = new Schema<IParticipantAnswer>(
	{
		participant: { type: Schema.Types.ObjectId, ref: 'Participant', required: true },
		quiz: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
		question: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
		answer: { type: String, required: true }, // answer of the participant
	},
	{ timestamps: true }
);

const ParticipantAnswer: Model<IParticipantAnswer> = mongoose.model('ParticipantAnswer', participantAnswerSchema);

export default ParticipantAnswer;
