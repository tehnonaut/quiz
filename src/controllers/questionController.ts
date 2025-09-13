import { NextFunction, Request, Response } from 'express';
import Question from '../models/questionModel';
import Participant from '../models/participantModel';
import ParticipantAnswer from '../models/participantAnswerModel';

import { IQuiz } from '../models/quizModel';
export const answerQuestion = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { quizId, questionId } = req.params;
		const participantId = req.body.participantId;
		const answer = req.body.answer;

		const question = await Question.findById(questionId).populate('quiz');
		if (!question) {
			res.status(404).json({ message: 'Question not found' });
			return;
		}

		const quiz = question.quiz as unknown as IQuiz;
		if (!quiz) {
			res.status(404).json({ message: 'Quiz not found' });
			return;
		}

		if (quiz.isActive == false) {
			res.status(404).json({ message: 'Quiz is not active, please contact the creator to activate it' });
			return;
		}

		const participant = await Participant.findById(participantId);
		if (!participant) {
			res.status(404).json({ message: 'Participant not found' });
			return;
		}

		//find participant answer if exists
		let participantAnswer = await ParticipantAnswer.findOne({
			question: { $eq: questionId },
			participant: { $eq: participantId },
		});

		if (!participantAnswer) {
			//create answer
			participantAnswer = await ParticipantAnswer.create({
				question: questionId,
				answer,
				participant: participantId,
				quiz: quizId,
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
		const { quizId, questionId } = req.params;

		const question = await Question.findOne({ quiz: { $eq: quizId }, _id: { $eq: questionId } });
		if (!question) {
			res.status(404).json({ message: 'Question not found' });
			return;
		}

		res.json({ message: 'Question fetched', question });
	} catch (error) {
		next(error);
	}
};
