const router = require("express").Router();

const {
  createSpace,
  getAllSpaces,
  getSpace,
  updateStatus,
  deleteSpace
} = require("../controllers/spaceController");

// CREATE SPACE
router.post("/", createSpace);

// GET ALL SPACES
router.get("/", getAllSpaces);

// GET SINGLE SPACE
router.get("/:id", getSpace);

// UPDATE STATUS (VACANT / OCCUPIED)
router.put("/status/:id", updateStatus);

// DELETE SPACE
router.delete("/:id", deleteSpace);

module.exports = router;