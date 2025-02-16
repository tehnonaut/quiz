import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { createQuiz, deleteQuiz, getQuiz } from '../controllers/quizController';
import { getQuizList, updateQuiz } from '../controllers/quizController';

const quizRouter = express.Router();

//qu
quizRouter.get('/', authMiddleware, getQuizList);
quizRouter.post('/', authMiddleware, createQuiz);
quizRouter.get('/:id', authMiddleware, getQuiz);
quizRouter.put('/:id', authMiddleware, updateQuiz);
quizRouter.delete('/:id', authMiddleware, deleteQuiz);

export default quizRouter;
