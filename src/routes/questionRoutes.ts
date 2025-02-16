import express from 'express';
import { answerQuestion, getQuestion } from '../controllers/questionController';

const questionRouter = express.Router();

/**
 * Question routes (students)
 * GET /question/:quizId/question/:questionId
 */
questionRouter.get('/:quizId/question/:questionId', getQuestion);

/**
 * Question routes (students)
 * POST /question/:quizId/question/:questionId
 * @param {string} answer - The answer of the question
 */
questionRouter.post('/:quizId/question/:questionId', answerQuestion);

export default questionRouter;
