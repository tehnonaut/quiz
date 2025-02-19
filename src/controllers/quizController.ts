import { Request, Response, NextFunction } from 'express';
import Quiz, { IQuiz } from '../models/quizModel';
import { IUserToken } from '../models/userModel';
import Question from '../models/questionModel';
import Participant, { IParticipant } from '../models/participantModel';
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

		const { quizId } = req.params;

		let quiz: IQuiz | null = null;
		let participants: IParticipant[] | null = null;
		if (!u) {
			// User is a student, so we need to show the quiz without the correct answers
			quiz = await Quiz.findById(quizId).populate('questions');
		} else {
			// User is a teacher, so we need to show the correct answers
			quiz = await Quiz.findOne({ _id: quizId, creator: u.id }).populate('questions', '+correctAnswers');
			participants = await Participant.find({ quiz: quizId });
		}

		if (!quiz) {
			res.status(404).json({ message: 'Quiz not found' });
			return;
		}

		if (!u && quiz.isActive == false) {
			res.status(404).json({ message: 'Quiz is not active, please contact the creator to activate it' });
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

		const questionsToUpdate = questions.filter((q: any) => q._id);
		const questionsToCreate = questions.filter((q: any) => !q._id);
		const questionsToDelete = quiz.questions.filter((q: any) => !questions.some((q2: any) => q2._id === q));

		for (const question of questionsToUpdate) {
			const q = await Question.findById(question._id);
			if (!q) {
				res.status(404).json({ message: 'Question not found' });
				return;
			}
			await q.updateOne(question);
			quiz.questions = quiz.questions.map((q) => (q.toString() === question._id.toString() ? q : q));
		}

		for (const question of questionsToCreate) {
			question.quiz = quiz._id;
			const q = await Question.create(question);
			quiz.questions.push(q._id);
			quiz.questions = quiz.questions.map((q) => (q.toString() === q._id.toString() ? q : q));
		}

		for (const question of questionsToDelete) {
			await Question.findByIdAndDelete(question);
			quiz.questions = quiz.questions.filter((q) => q.toString() !== question.toString());
		}

		//sort the questions in the order they are sent in the questions req.body, some might not have ids
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
export const getQuizParticipantResults = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const u = req.user as IUserToken;
		const { quizId, participantId } = req.params;

		const quiz = await Quiz.findOne({ _id: quizId, creator: u.id }).populate('questions', '+correctAnswers');
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

		res.json({ message: 'Quiz results fetched', quiz, participant, results });
	} catch (error) {
		next(error);
	}
};
