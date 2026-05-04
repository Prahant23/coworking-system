const router = require("express").Router();

const {
  createContract,
  getAllContracts,
  endContract
} = require("../controllers/contractController");

router.post("/", createContract);
router.get("/", getAllContracts);
router.put("/end/:id", endContract);

module.exports = router;