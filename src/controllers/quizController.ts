import { Request, Response, NextFunction } from 'express';
import Quiz, { IQuiz } from '../models/quizModel';
import { IUserToken } from '../models/userModel';
import Question from '../models/questionModel';

export const getQuizList = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const u = req.user as IUserToken;
		const quizes = await Quiz.find({ creator: u.id }).sort({ createdAt: -1 });
		res.json({ message: 'Quizes fetched', quizes });
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
			quiz = await Quiz.findById(id);
		} else {
			quiz = await Quiz.findOne({ _id: id, creator: u.id });
		}

		if (!quiz) {
			res.status(404).json({ message: 'Quiz not found' });
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

		const { title, description, questions } = req.body;

		//create the questions
		const createdQuestions = [];
		for (const question of questions) {
			const q = await Question.create(question);
			createdQuestions.push(q._id);
		}

		const quiz = await Quiz.create({ title, description, questions: createdQuestions, creator: u.id });
		res.json({ message: 'Quiz created', quiz });
	} catch (error) {
		next(error);
	}
};

export const updateQuiz = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const u = req.user as IUserToken;

		const { id } = req.params;
		const { title, description, questions } = req.body;

		const quiz = await Quiz.findOne({ _id: id, creator: u.id });
		if (!quiz) {
			res.status(404).json({ message: 'Quiz not found' });
			return;
		}

		quiz.title = title;
		quiz.description = description;

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
