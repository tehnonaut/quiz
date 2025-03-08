import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { IQuiz } from './quizModel';

export interface IParticipant extends Document {
	_id: Types.ObjectId; // id of the participant
	quiz: IQuiz['_id']; // id of the quiz
	name: string; // name of the participant
	studentId: string; // student id of the participant
	isCompleted: boolean; // if the participant has marked quiz completed
	isGraded: boolean; // if the participant has been graded
	createdAt: Date; // date of creation
	updatedAt: Date; // date of update
}

const participantSchema = new Schema<IParticipant>(
	{
		quiz: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
		name: { type: String, required: true },
		studentId: { type: String, required: true },
		isCompleted: { type: Boolean, default: false },
		isGraded: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

//combination of quiz and studentId must be unique
participantSchema.index({ quiz: 1, studentId: 1 }, { unique: true });

const Participant: Model<IParticipant> = mongoose.model('Participant', participantSchema);

export default Participant;
