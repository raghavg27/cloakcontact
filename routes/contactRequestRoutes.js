const express = require("express");
const { PrismaClient } = require("@prisma/client");
const authenticateToken = require("../middleware/authenticateToken");

const { contactRequestSchema } = require("../helpers/validation_schema");

const router = express.Router();
const prisma = new PrismaClient();

// User contact via QRID
router.post ("/contact", async (req, res) => {
  const { qr_code_id, reason, additional_info } = req.body;
  const { error } = contactRequestSchema.validate({ qr_code_id, reason });

  if (error) {
    res.status(400).send({
      error: `${error.details[0].message}`,
    });
  }

  try {
    await prisma.contact_requests.create({
      data: {
        qr_code_id: qr_code_id,
        client_reason: `${reason}`,
        ...(additional_info && { additional_info }),
      },
    });
    res.status(201).send({
      message: `User contacted!`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      error: `Internal server error. `,
      Details: `${error}`,
    });
  }
});

module.exports = router;