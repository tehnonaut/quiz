import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { createQuiz, deleteQuiz, getQuiz, getQuizResults } from '../controllers/quizController';
import { getQuizList, updateQuiz } from '../controllers/quizController';

const quizRouter = express.Router();

/**
 * @api {get} /quiz Get Quiz List
 * @apiName GetQuizList
 * @apiGroup Quiz
 * @apiPermission User
 *
 * @apiHeader {String} Authorization Bearer token
 */
quizRouter.get('/', authMiddleware, getQuizList);

/**
 * @api {post} /quiz Create Quiz
 * @apiName CreateQuiz
 * @apiGroup Quiz
 * @apiPermission User
 *
 * @apiHeader {String} Authorization Bearer token
 *
 * @apiBody {String} name The name of the quiz
 * @apiBody {String} description The description of the quiz
 * @apiBody {Number} duration The duration of the quiz (in minutes)
 * @apiBody {Boolean} isActive The active status of the quiz
 * @apiBody {Object[]} questions The questions of the quiz (array of question objects)
 * * @apiBody {string} question.type  - The question type (choice, answer)
 * * @apiBody {string[]} question.question - The question text
 * * @apiBody {string[]} question.answers - The answers of the question (array of strings)
 * * @apiBody {string[]} question.correctAnswers - The correct answers of the question (array of strings)
 */
quizRouter.post('/', authMiddleware, createQuiz);

/**
 * @api {put} /quiz/:quizId Update Quiz
 * @apiName UpdateQuiz
 * @apiGroup Quiz
 * @apiPermission User
 *
 * @apiHeader {String} Authorization Bearer token
 *
 * @apiBody {String} quizId The id of the quiz
 * @apiBody {String} name The name of the quiz
 * @apiBody {String} description The description of the quiz
 * @apiBody {Number} duration The duration of the quiz (in minutes)
 * @apiBody {Boolean} isActive The active status of the quiz
 * @apiBody {Object[]} questions The questions of the quiz (array of question objects)
 * * @apiBody {string} question._id - The id of the question
 * * @apiBody {string} question.type  - The question type (choice, answer)
 * * @apiBody {string[]} question.question - The question text
 * * @apiBody {string[]} question.answers - The answers of the question (array of strings)
 * * @apiBody {string[]} question.correctAnswers - The correct answers of the question (array of strings)
 */
quizRouter.put('/:quizId', authMiddleware, updateQuiz);

/**
 * @api {get} /quiz/:quizId/results/:participantId Get Quiz Results
 * @apiName GetQuizResults
 * @apiGroup Quiz
 * @apiPermission User
 *
 * @apiHeader {String} Authorization Bearer token
 *
 * @apiParam {String} quizId The id of the quiz
 * @apiParam {String} participantId The id of the participant
 */
quizRouter.get('/:quizId/results/:participantId', authMiddleware, getQuizResults);

/**
 * @api {get} /quiz/:quizId Get Quiz
 * @apiName GetQuiz
 * @apiGroup Quiz
 * @apiPermission User
 *
 * @apiHeader {String} Authorization Bearer token
 *
 * @apiParam {String} quizId The id of the quiz
 */
quizRouter.get('/:quizId', getQuiz); //no auth required

/**
 * @api {delete} /quiz/:quizId Delete Quiz
 * @apiName DeleteQuiz
 * @apiGroup Quiz
 * @apiPermission User
 *
 * @apiHeader {String} Authorization Bearer token
 *
 * @apiParam {String} quizId The id of the quiz
 */
quizRouter.delete('/:quizId', authMiddleware, deleteQuiz);

export default quizRouter;
