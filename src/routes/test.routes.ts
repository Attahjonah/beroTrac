import express from 'express';

const router = express.Router();

/**
 * @swagger
 * /test:
 *   get:
 *     summary: Test endpoint
 *     tags:
 *       - Test
 *     responses:
 *       200:
 *         description: API is working
 */
router.get('/test', (_req, res) => {
  res.json({
    success: true,
    message: 'BeroTrac API is working',
  });
});

export default router;
