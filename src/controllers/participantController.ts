import { Request, Response, NextFunction } from 'express';
import Quiz from '../models/quizModel';
import Participant from '../models/participantModel';
import ParticipantAnswer from '../models/participantAnswerModel';
import Question from '../models/questionModel';
export const createParticipant = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { quizId, name, studentId } = req.body;
		const quiz = await Quiz.findById(quizId);
		if (!quiz) {
			res.status(404).json({ message: 'Quiz not found', participant: null });
			return;
		}

		if (quiz.isActive === false) {
			res.status(401).json({ message: 'Quiz is not active, please contact the creator to activate it' });
			return;
		}

		const existingParticipant = await Participant.findOne({ quiz: quizId, studentId });
		if (existingParticipant) {
			// 202 Accepted
			res.status(202).json({ message: 'Participant already exists', participant: existingParticipant });
			return;
		}

		const participant = await Participant.create({ quiz: quizId, name, studentId });
		res.status(201).json({ message: 'Participant created', participant });
	} catch (error) {
		next(error);
	}
};

export const getParticipant = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { participantId } = req.params;
		const participant = await Participant.findById(participantId);
		if (!participant) {
			res.status(404).json({ message: 'Participant not found', participant: null });
			return;
		}

		res.json({ message: 'Participant fetched', participant });
	} catch (error) {
		next(error);
	}
};

export const getParticipantAnswer = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { questionId, participantId } = req.params;
		const participant = await Participant.findById(participantId);
		if (!participant) {
			res.status(404).json({ message: 'Participant not found', question: null });
			return;
		}

		const question = await Question.findById(questionId);
		if (!question) {
			res.status(404).json({ message: 'Question not found', question: null });
			return;
		}

		const answers = await ParticipantAnswer.find({ participant: participantId, question: questionId });
		res.json({ message: 'Participant answers fetched', answers });
	} catch (error) {
		next(error);
	}
};

export const getParticipantAnswers = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { participantId } = req.params;
		const participant = await Participant.findById(participantId);
		if (!participant) {
			res.status(404).json({ message: 'Participant not found' });
			return;
		}

		const answers = await ParticipantAnswer.find({ participant: participantId });
		res.json({ message: 'Participant answers fetched', answers });
	} catch (error) {
		next(error);
	}
};

export const updateParticipantAnswer = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { participantId, questionId } = req.params;
		const { answer } = req.body;
		const participant = await Participant.findById(participantId);
		if (!participant) {
			res.status(404).json({ message: 'Participant not found' });
			return;
		}

		const question = await Question.findById(questionId);
		if (!question) {
			res.status(404).json({ message: 'Question not found' });
			return;
		}

		const quiz = await Quiz.findById(participant.quiz);
		if (!quiz) {
			res.status(404).json({ message: 'Quiz not found' });
			return;
		}

		if (quiz.isActive === false) {
			res.status(401).json({ message: 'Quiz is not active, answers cannot be submitted' });
			return;
		}

		let participantAnswer = await ParticipantAnswer.findOne({ participant: participantId, question: questionId });
		if (participantAnswer) {
			participantAnswer.answer = answer;
			await participantAnswer.save();
			res.json({ message: 'Participant answer updated', participantAnswer });
			return;
		} else {
			participantAnswer = await ParticipantAnswer.create({
				participant: participantId,
				quiz: participant.quiz,
				question: questionId,
				answer,
			});
			res.json({ message: 'Participant answer submitted', participantAnswer });
		}
	} catch (error) {
		next(error);
	}
};

export const markParticipantFinished = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { participantId } = req.params;
		const participant = await Participant.findById(participantId);
		if (!participant) {
			res.status(404).json({ message: 'Participant not found' });
			return;
		}
		participant.isCompleted = true;
		await participant.save();
		res.json({ message: 'Participant marked as finished', participant });
	} catch (error) {
		next(error);
	}
};
