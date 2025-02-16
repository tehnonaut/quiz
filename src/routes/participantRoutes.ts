import express from 'express';
import { createParticipant, getParticipant, getParticipantAnswer } from '../controllers/participantController';

const participantRouter = express.Router();

/**
 * Get Participant (students)
 * GET /participant/:participantId
 */
participantRouter.get('/:participantId', getParticipant);

/**
 * Create Participant (students)
 * POST /participant
 * @param {string} name - The name of the participant
 * @param {string} studentId - The studentId of the participant
 * @param {string} quizId - The quizId of the participant
 */
participantRouter.post('/', createParticipant);

/**
 * Get Participant Answer (student)
 * GET /participant/:participantId/question/:questionId
 */
participantRouter.get('/:participantId/question/:questionId', getParticipantAnswer);

export default participantRouter;
