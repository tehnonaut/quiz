import { Request, Response, NextFunction } from 'express';
import Quiz, { IQuiz } from '../models/quizModel';
import { IUserToken } from '../models/userModel';
import Question from '../models/questionModel';
import Participant from '../models/participantModel';
import ParticipantAnswer from '../models/participantAnswerModel';

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

		const { id } = req.params;

		let quiz: IQuiz | null = null;
		if (!u) {
			// User is a student, so we need to show the quiz without the correct answers
			quiz = await Quiz.findById(id).populate('questions');
		} else {
			// User is a teacher, so we need to show the correct answers
			quiz = await Quiz.findOne({ _id: id, creator: u.id }).select('+correctAnswers').populate('questions');
		}

		if (!quiz) {
			res.status(404).json({ message: 'Quiz not found' });
			return;
		}

		if (!u && quiz.isActive == false) {
			res.status(404).json({ message: 'Quiz is not active, please contact the creator to activate it' });
			return;
		}

		res.json({ message: 'Quiz fetched', quiz });
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

		const { id } = req.params;
		const { title, description, questions, duration, isActive } = req.body;

		const quiz = await Quiz.findOne({ _id: id, creator: u.id });
		if (!quiz) {
			res.status(404).json({ message: 'Quiz not found' });
			return;
		}

		quiz.title = title;
		quiz.description = description;
		quiz.duration = duration;
		quiz.isActive = isActive;

		for (const question of questions) {
			if (question._id) {
				const q = await Question.findById(question._id);
				if (!q) {
					res.status(404).json({ message: 'Question not found' });
					return;
				}
				//update the question
				await q.updateOne(question);
			} else {
				const q = await Question.create(question);
				quiz.questions.push(q._id);
				question._id = q._id; //used to sort the questions in the order they are sent in the questions req.body
			}
		}

		//sort the questions in the order they are sent in the questions req.body
		quiz.questions.sort((a, b) => {
			const aIndex = questions.findIndex((q: any) => q._id === a);
			const bIndex = questions.findIndex((q: any) => q._id === b);
			return aIndex - bIndex;
		});

		await quiz.save();
		res.json({ message: 'Quiz updated', quiz });
	} catch (error) {
		next(error);
	}
};

export const deleteQuiz = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const u = req.user as IUserToken;

		const { id } = req.params;
		const quiz = await Quiz.findOne({ _id: id, creator: u.id });
		if (!quiz) {
			res.status(404).json({ message: 'Quiz not found' });
			return;
		}

		await Quiz.findByIdAndDelete(id);
		res.json({ message: 'Quiz deleted' });
	} catch (error) {
		next(error);
	}
};

export const getQuizResults = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const u = req.user as IUserToken;
		const { quizId, participantId } = req.params;

		const quiz = await Quiz.findOne({ _id: quizId, creator: u.id }).select('+correctAnswers').populate('questions');
		if (!quiz) {
			res.status(404).json({ message: 'Quiz not found' });
			return;
		}

		const participant = await Participant.findById(participantId);
		if (!participant) {
			res.status(404).json({ message: 'Participant not found' });
			return;
		}

		const participantAnswers = await ParticipantAnswer.find({
			participant: participantId,
			question: { $in: quiz.questions },
		});

		const results = participantAnswers.map((answer) => {
			const question = quiz.questions.find((q) => q._id.equals(answer.question)) as any;
			return {
				question: question?.question,
				answer: answer.answer,
				correct: question?.correctAnswers.includes(answer.answer),
			};
		});

		res.json({ message: 'Quiz results fetched', results });
	} catch (error) {
		next(error);
	}
};
