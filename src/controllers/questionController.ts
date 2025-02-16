import { NextFunction, Request, Response } from 'express';
import Question from '../models/questionModel';
import Participant from '../models/participantModel';
import ParticipantAnswer from '../models/participantAnswerModel';

export const answerQuestion = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { questionId, answer, participantId } = req.body;

		const question = await Question.findById(questionId);
		if (!question) {
			res.status(404).json({ message: 'Question not found' });
			return;
		}

		const participant = await Participant.findById(participantId);
		if (!participant) {
			res.status(404).json({ message: 'Participant not found' });
			return;
		}

		//find participant answer if exists
		let participantAnswer = await ParticipantAnswer.findOne({ question: questionId, participant: participantId });

		if (!participantAnswer) {
			//create answer
			participantAnswer = await ParticipantAnswer.create({
				question: questionId,
				answer,
				participant: participantId,
			});
		} else {
			//update answer
			participantAnswer.answer = answer;
			await participantAnswer.save();
		}

		res.json({ message: 'Answer submitted', answer: participantAnswer });
	} catch (error) {
		next(error);
	}
};

export const getQuestion = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { questionId } = req.params;

		const question = await Question.findById(questionId);
		if (!question) {
			res.status(404).json({ message: 'Question not found' });
			return;
		}

		res.json({ message: 'Question fetched', question });
	} catch (error) {
		next(error);
	}
};
