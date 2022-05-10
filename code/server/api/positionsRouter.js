const express = require('express');
const router = express.Router();

/**
 * Position
 */

const {
    getAllPositions,
    createPosition,
    updatePosition,
    updatePositionId,
    deletePosition
} = require("../controller/positionsController.js");

router.get("/positions", getAllPositions);
router.post("/position", createPosition);
router.put("/position/:positionID", updatePosition);
router.put("/position/:positionID/changeID", updatePositionId);
router.delete("/position/:positionID", deletePosition);

// module export
module.exports = router;

