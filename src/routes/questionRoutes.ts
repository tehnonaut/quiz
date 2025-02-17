import express from 'express';
import { answerQuestion, getQuestion } from '../controllers/questionController';

const questionRouter = express.Router();

/**
 * @api {get} /question/:quizId/question/:questionId Get Question
 * @apiName GetQuestion
 * @apiGroup Question
 * @apiPermission Public
 *
 * @apiParam {String} quizId The id of the quiz
 * @apiParam {String} questionId The id of the question
 */
questionRouter.get('/:quizId/question/:questionId', getQuestion);

/**
 * @api {post} /question/:quizId/question/:questionId Answer Question
 * @apiName AnswerQuestion
 * @apiGroup Question
 * @apiPermission Public
 *
 * @apiParam {String} quizId The id of the quiz
 * @apiParam {String} questionId The id of the question
 *
 * @apiBody {String} answer The answer of the question
 */
questionRouter.post('/:quizId/question/:questionId', answerQuestion);

export default questionRouter;
