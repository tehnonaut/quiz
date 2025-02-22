import express from 'express';
import {
	createParticipant,
	getParticipant,
	getParticipantAnswers,
	markParticipantFinished,
	updateParticipantAnswer,
} from '../controllers/participantController';

const participantRouter = express.Router();

/**
 * @api {get} /participant/:participantId Get Participant
 * @apiName GetParticipant
 * @apiGroup Participant
 * @apiPermission Public
 *
 * @apiParam {String} participantId The id of the participant
 */
participantRouter.get('/:participantId', getParticipant);

/**
 * @api {post} /participant Create Participant
 * @apiName CreateParticipant
 * @apiGroup Participant
 * @apiPermission Public
 *
 * @apiBody {String} name The name of the participant
 * @apiBody {String} studentId The studentId of the participant
 * @apiBody {String} quizId The quizId of the participant
 */
participantRouter.post('/', createParticipant);

/**
 * @api {post} /participant/:participantId/question/:questionId/answer Update Participant Answer
 * @apiName UpdateParticipantAnswer
 * @apiGroup Participant
 * @apiPermission Public
 *
 * @apiParam {String} participantId The id of the participant
 * @apiParam {String} questionId The id of the question
 * @apiParam {String} answer The answer of the participant
 */
participantRouter.post('/:participantId/question/:questionId', updateParticipantAnswer);
/**
 * @api {get} /participant/:participantId/answers Get Participant Answers
 * @apiName GetParticipantAnswers
 * @apiGroup Participant
 * @apiPermission Public
 *
 * @apiParam {String} participantId The id of the participant
 */
participantRouter.get('/:participantId/answers', getParticipantAnswers);

/**
 * @api {get} /participant/:participantId/finished Mark Participant Finished
 * @apiName MarkParticipantFinished
 * @apiGroup Participant
 * @apiPermission Public
 *
 * @apiParam {String} participantId The id of the participant
 */
participantRouter.get('/:participantId/finished', markParticipantFinished);

export default participantRouter;
