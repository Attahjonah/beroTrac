import express from 'express';
import authRoutes from './auth.routes';
import dashboardRoutes from './dashboard.routes';
import financialRoutes from './financial.routes';
import testRoutes from './test.routes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/financial', financialRoutes);
router.use('/test', testRoutes);

export default router;
