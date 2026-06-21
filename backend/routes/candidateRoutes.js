import express from 'express';
import {
  getCandidates,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  castVote,
} from '../controllers/candidateController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getCandidates)
  .post(protect, admin, createCandidate);

router.route('/:id')
  .put(protect, admin, updateCandidate)
  .delete(protect, admin, deleteCandidate);

router.post('/vote/:id', protect, castVote);

export default router;
