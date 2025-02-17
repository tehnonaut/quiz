import express from 'express';
import { createParticipant, getParticipant } from '../controllers/participantController';

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

export default participantRouter;
