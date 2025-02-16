import { Request, Response, NextFunction } from 'express';
import Quiz from '../models/quizModel';
import Participant from '../models/participantModel';

export const createParticipant = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { quizId, name, studentId } = req.body;
		const quiz = await Quiz.findById(quizId);
		if (!quiz) {
			res.status(404).json({ message: 'Quiz not found' });
			return;
		}

		const existingParticipant = await Participant.findOne({ quiz: quizId, studentId });
		if (existingParticipant) {
			res.status(400).json({ message: 'Participant already exists', participant: existingParticipant });
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
		const { id } = req.params;
		const participant = await Participant.findById(id);
		if (!participant) {
			res.status(404).json({ message: 'Participant not found' });
			return;
		}

		res.json({ message: 'Participant fetched', participant });
	} catch (error) {
		next(error);
	}
};

export const getParticipants = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { quizId } = req.params;
		const participants = await Participant.find({ quiz: quizId });
		res.json({ message: 'Participants fetched', participants });
	} catch (error) {
		next(error);
	}
};

export const updateParticipant = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { id } = req.params;
		const { name, studentId } = req.body;
		const participant = await Participant.findByIdAndUpdate(id, { name, studentId }, { new: true });
		if (!participant) {
			res.status(404).json({ message: 'Participant not found' });
			return;
		}

		res.json({ message: 'Participant updated', participant });
	} catch (error) {
		next(error);
	}
};
