import express from 'express';
import { createElection, getElections, getElectionDetails } from '../controllers/electionController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, admin, createElection)
  .get(protect, getElections);

router.route('/:id')
  .get(protect, getElectionDetails);

export default router;
