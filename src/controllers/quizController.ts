import { Request, Response, NextFunction } from 'express';
import Quiz, { IQuiz } from '../models/quizModel';
import { IUserToken } from '../models/userModel';
import Question, { IQuestion } from '../models/questionModel';
import Participant, { IParticipant } from '../models/participantModel';
import ParticipantAnswer, { IParticipantAnswer } from '../models/participantAnswerModel';

export const getQuizList = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const u = req.user as IUserToken;
		const quizzes = await Quiz.find({ creator: u.id }).sort({ createdAt: -1 });
		res.json({ message: 'Quizzes fetched', quizzes });
	} catch (error) {
		next(error);
	}
};

export const getQuiz = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const u = req.user as IUserToken;

		const { quizId } = req.params;

		let quiz: IQuiz | null = null;
		let participants: IParticipant[] = [];
		if (!u) {
			// User is a student, so we need to show the quiz without the correct answers
			quiz = await Quiz.findById(quizId).populate('questions');
		} else {
			// User is a teacher, so we need to show the correct answers
			quiz = await Quiz.findOne({ _id: quizId, creator: u.id }).populate('questions', '+correctAnswers');
			participants = await Participant.find({ quiz: quizId });
		}

		if (!quiz) {
			res.status(404).json({ message: 'Quiz not found', quiz: null, participants: [] });
			return;
		}

		if (!u && !quiz.isActive) {
			quiz.questions = [];
			res.status(401).json({ message: 'Quiz is not active', quiz, participants });
			return;
		}

		res.json({ message: 'Quiz fetched', quiz, participants });
	} catch (error) {
		next(error);
	}
};

export const createQuiz = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const u = req.user as IUserToken;

		const { title, description, questions, duration, isActive } = req.body;

		const quiz = await Quiz.create({
			title,
			description,
			questions: [],
			creator: u.id,
			duration,
			isActive,
		});

		if (!quiz) {
			res.status(400).json({ message: 'Failed to create quiz' });
		}
		//create the questions
		for (const question of questions) {
			question.quiz = quiz._id;
			const q = await Question.create(question);

			quiz.questions.push(q._id);
		}

		//sort the questions in the order they are sent in the questions req.body
		quiz.questions.sort((a, b) => {
			const aIndex = questions.findIndex((q: any) => q._id === a);
			const bIndex = questions.findIndex((q: any) => q._id === b);
			return aIndex - bIndex;
		});

		await quiz.save();

		res.json({ message: 'Quiz created', quiz });
	} catch (error) {
		next(error);
	}
};

export const updateQuiz = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const u = req.user as IUserToken;

		const { quizId } = req.params;
		const { title, description, questions, duration, isActive } = req.body;

		const quiz = await Quiz.findOne({ _id: quizId, creator: u.id });
		if (!quiz) {
			res.status(404).json({ message: 'Quiz not found' });
			return;
		}

		quiz.title = title;
		quiz.description = description;
		quiz.duration = duration;
		quiz.isActive = isActive;

		const newQuestionIds = [];

		for (const question of questions) {
			question.quiz = quiz._id;
			if (question?._id) {
				const q = await Question.findById(question._id);
				if (!q) {
					res.status(404).json({ message: 'Question not found' });
					return;
				}
				await q.updateOne(question);
				newQuestionIds.push(q._id);
				quiz.questions = quiz.questions.map((q) => (q.toString() === question._id.toString() ? q : q));
			} else {
				const q = await Question.create(question);
				if (q) {
					newQuestionIds.push(q._id);
				}
			}
		}

		quiz.questions = newQuestionIds;

		await quiz.save();

		res.json({ message: 'Quiz updated', quiz });
	} catch (error) {
		next(error);
	}
};

export const deleteQuiz = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const u = req.user as IUserToken;

		const { quizId } = req.params;
		const quiz = await Quiz.findOne({ _id: quizId, creator: u.id });
		if (!quiz) {
			res.status(404).json({ message: 'Quiz not found' });
			return;
		}

		await quiz.deleteOne();
		res.json({ message: 'Quiz deleted' });
	} catch (error) {
		next(error);
	}
};

export const getQuizParticipants = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const u = req.user as IUserToken;
		const { quizId } = req.params;

		const quiz = await Quiz.findOne({ _id: quizId, creator: u.id });
		if (!quiz) {
			res.status(404).json({ message: 'Quiz not found' });
			return;
		}

		const participants = await Participant.find({ quiz: quizId });
		res.json({ message: 'Quiz participants fetched', quiz, participants });
	} catch (error) {
		next(error);
	}
};

// Rename the interface to avoid conflict
type QuizResult = {
	question: IQuestion;
	answer: IParticipantAnswer | null;
	correct: boolean;
};

export const getQuizParticipantResults = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const u = req.user as IUserToken;
		const { quizId, participantId } = req.params;

		const quiz = await Quiz.findOne({ _id: quizId, creator: u.id }).populate('questions', '+correctAnswers');
		if (!quiz) {
			res.status(404).json({ message: 'Quiz not found' });
			return;
		}

		const questions = quiz.questions as unknown as IQuestion[];

		const participant = await Participant.findById(participantId);
		if (!participant) {
			res.status(404).json({ message: 'Participant not found' });
			return;
		}

		const participantAnswers = await ParticipantAnswer.find({
			participant: participantId,
		});

		const results: QuizResult[] = [];

		for (const answer of participantAnswers) {
			const q = questions.find((q) => q._id.toString() === answer.question.toString());
			if (!q) {
				continue;
			}

			const correctAnswers = q.correctAnswers as string[];

			const correct = correctAnswers.every((a) => answer.answer.includes(a));

			let a = answer as unknown as IParticipantAnswer | null;

			if (!answer) {
				a = null;
			}

			results.push({
				question: q,
				answer: a,
				correct: correct,
			});
		}

		for (const question of questions) {
			const result = results.find((r) => r.question._id.toString() === question._id.toString());
			if (!result) {
				results.push({
					question: question,
					answer: null,
					correct: false,
				});
			}
		}

		//sort the results like in the quiz.questions array
		results.sort((a, b) => {
			const aIndex = questions.findIndex((q) => q._id.toString() === a.question._id.toString());
			const bIndex = questions.findIndex((q) => q._id.toString() === b.question._id.toString());
			return aIndex - bIndex;
		});

		res.json({ message: 'Quiz results fetched', quiz, questions, participant, results });
	} catch (error) {
		next(error);
	}
};

export const getQuizQuestion = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const u = req.user as IUserToken;
		const { quizId, questionId } = req.params;

		let quiz: IQuiz | null = null;
		if (u) {
			quiz = await Quiz.findOne({ _id: quizId, creator: u.id }).populate('questions', '+correctAnswers');
		} else {
			quiz = await Quiz.findById(quizId).populate('questions');
		}

		if (!quiz) {
			res.status(404).json({ message: 'Quiz not found' });
			return;
		}

		const question = quiz.questions.find((q) => q._id.equals(questionId));

		if (!question) {
			res.status(404).json({ message: 'Question not found' });
			return;
		}

		res.json({ message: 'Quiz question fetched', quiz, question });
	} catch (error) {
		next(error);
	}
};
