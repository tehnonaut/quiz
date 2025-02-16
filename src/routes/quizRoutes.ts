import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { createQuiz, deleteQuiz, getQuiz, getQuizResults } from '../controllers/quizController';
import { getQuizList, updateQuiz } from '../controllers/quizController';

const quizRouter = express.Router();

/**
 * Get Quiz List (teachers)
 * GET /quiz
 */
quizRouter.get('/', authMiddleware, getQuizList);

/**
 * Create Quiz (teachers)
 * POST /quiz
 * @param {string} name - The name of the quiz
 * @param {string} description - The description of the quiz
 * @param {IQuestion[]} questions - The questions of the quiz (array of question objects)
 *      @param {string} type  - The question type (choice, answer)
 *      @param {string[]} question - The question text
 *      @param {string[]} answers - The answers of the question (array of strings)
 *      @param {string[]} correctAnswers - The correct answers of the question (array of strings)
 */
quizRouter.post('/', authMiddleware, createQuiz);

/**
 * Update Quiz (teachers)
 * PUT /quiz/:quizId
 * @param {string} name - The name of the quiz
 * @param {string} description - The description of the quiz
 * @param {IQuestion[]} questions - The questions of the quiz (array of question objects)
 *      @param {string} type  - The question type (choice, answer)
 *      @param {string[]} question - The question text
 *      @param {string[]} answers - The answers of the question (array of strings)
 *      @param {string[]} correctAnswers - The correct answers of the question (array of strings)
 */
quizRouter.put('/:quizId', authMiddleware, updateQuiz);

/**
 * Get Quiz Results (teachers)
 * GET /quiz/:quizId/results/:participantId
 */
quizRouter.get('/:quizId/results/:participantId', authMiddleware, getQuizResults);

/**
 * Quiz routes (students)
 * /quiz/:quizId
 */
quizRouter.get('/:quizId', getQuiz); //no auth required

/**
 * Delete Quiz (teachers)
 * DELETE /quiz/:quizId
 */
quizRouter.delete('/:quizId', authMiddleware, deleteQuiz);

export default quizRouter;
