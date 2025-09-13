import { Request, Response, NextFunction } from 'express';
import Quiz from '../models/quizModel';
import Participant from '../models/participantModel';
import ParticipantAnswer, { IParticipantAnswer } from '../models/participantAnswerModel';
import Question, { QuestionType } from '../models/questionModel';
import { IQuiz } from '../models/quizModel';

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

		const existingParticipant = await Participant.findOne({ quiz: { $eq: quizId }, studentId: { $eq: studentId } });
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

		//clean the response
		const participantResponse: any = { ...participant.toObject() };
		delete participantResponse.points;
		delete participantResponse.isGraded;
		delete participantResponse.hasCompleted;

		res.json({ message: 'Participant fetched', participant: participantResponse });
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

		const answersResponse = answers.map((answer) => {
			const answerResponse: any = { ...answer.toObject() };
			delete answerResponse.isCorrect;
			delete answerResponse.points;
			return answerResponse;
		});

		res.json({ message: 'Participant answers fetched', answers: answersResponse });
	} catch (error) {
		next(error);
	}
};

export const updateParticipantAnswer = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { participantId, questionId } = req.params;
		const { answer } = req.body;
		const participant = await Participant.findById(participantId, '+points').populate('quiz');
		if (!participant) {
			res.status(404).json({ message: 'Participant not found' });
			return;
		}

		let isCorrect = undefined;
		let points = 0;
		const question = await Question.findById(questionId, '+correctAnswers');
		if (!question) {
			res.status(404).json({ message: 'Question not found' });
			return;
		}

		//check if the answer is correct
		if (question.correctAnswers.length > 0) {
			if (question.type === QuestionType.CHOICE) {
				isCorrect = question.correctAnswers.includes(answer);
				if (isCorrect) {
					points = question.points;
				}
			}
		}

		const quiz = participant.quiz as unknown as IQuiz;
		if (!quiz) {
			res.status(404).json({ message: 'Quiz not found' });
			return;
		}

		if (quiz.isActive === false) {
			res.status(401).json({ message: 'Quiz is not active, answers cannot be submitted' });
			return;
		}

		//check if the time ran out (quiz duration in minutes)
		const quizDuration = quiz.duration * 60 * 1000;
		const participantAnswerTime = participant.createdAt;
		const timeDifference = new Date().getTime() - new Date(participantAnswerTime).getTime();
		if (timeDifference > quizDuration) {
			res.status(401).json({ message: 'Quiz time ran out, answers cannot be submitted' });
			return;
		}

		let participantAnswer = await ParticipantAnswer.findOne({
			participant: { $eq: participantId },
			question: { $eq: questionId },
		});
		if (participantAnswer) {
			// Update Answer
			participantAnswer.answer = answer;
			participantAnswer.isCorrect = isCorrect ?? undefined;
			participantAnswer.points = points;
			await participantAnswer.save();
		} else {
			// Create Answer
			participantAnswer = await ParticipantAnswer.create({
				participant: participantId,
				quiz: participant.quiz,
				question: questionId,
				answer,
				isCorrect,
				points,
			});
		}

		//clean the response
		const answerResponse: any = { ...(participantAnswer as unknown as IParticipantAnswer).toObject() };
		delete answerResponse.points;
		delete answerResponse.isCorrect;
		res.json({ message: 'Participant answer updated', answer: answerResponse });
	} catch (error) {
		next(error);
	}
};

export const markParticipantAsFinished = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { participantId } = req.params;
		const participant = await Participant.findById(participantId);
		if (!participant) {
			res.status(404).json({ message: 'Participant not found' });
			return;
		}
		participant.hasCompleted = true;
		await participant.save();

		//clean the response
		const participantResponse: any = { ...participant.toObject() };
		delete participantResponse.points;
		delete participantResponse.isGraded;
		delete participantResponse.hasCompleted;

		res.json({ message: 'Participant marked as finished', participant: participantResponse });
	} catch (error) {
		next(error);
	}
};
