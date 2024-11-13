const express = require("express");
const { PrismaClient } = require("@prisma/client");
const authenticateToken = require("../middleware/authenticateToken");

const router = express.Router();
const prisma = new PrismaClient();

// Get all users
router.get("/users", async (req, res) => {
  try {
    const users = await prisma.users.findMany();
    res.status(200).send(users);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      error: `Internal server error. `,
      Details: `${error}`,
    });
  }
});

// Get all users
router.get("/contactRequests", authenticateToken, async (req, res) => {
  const { qr_code_id } = req.body;
    const userId = req.user?.id; 

  if (!qr_code_id){
    res.status(400).send({ error: "Valid qr_code_id is required" });
  }


  try {
    const contact_requests = await prisma.contact_requests.findMany({
      where: {
        qr_code_id: qr_code_id,
      },
    });
    res.status(200).send(contact_requests);

  } catch (error) {
    console.error(error);
    res.status(500).send({
      error: `Internal server error. `,
      Details: `${error}`,
    });
  }
});


module.exports = router;
