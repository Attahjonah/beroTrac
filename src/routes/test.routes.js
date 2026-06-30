const express = require("express");

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
router.get("/test", (req, res) => {
    res.json({
        success: true,
        message: "BeroTrac API is working",
    });
});

module.exports = router;