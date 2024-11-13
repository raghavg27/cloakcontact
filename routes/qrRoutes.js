const express = require("express");
const { PrismaClient } = require("@prisma/client");
const authenticateToken = require("../middleware/authenticateToken");

const { qrSchema } = require("../helpers/validation_schema");

const router = express.Router();
const prisma = new PrismaClient();

// QR Code creation
router.post("/qr-codes", authenticateToken, async (req, res) => {
  const { message, options } = req.body;
  const userId = req.user?.id;

  const { error } = qrSchema.validate({ message, options });

  if (error) {
    res.status(400).send({ error: error.details[0].message });
  }

  try {
    const qr = await prisma.qr_codes.create({
      data: {
        message: message,
        options: options,
        user_id: userId,
      },
    });
    console.log(qr);
    res.status(201).send({ message: `Qr created with uuid: ${qr.uuid}` });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).send({
      error: `Internal server error. `,
      Details: `${error}`,
    });
  }
});

// QR Code fetch
router.get("/qr-codes/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!id) {
    res.status(400).send({ error: "Valid id is required" });
  }

  try {
    const qr = await prisma.qr_codes.findFirst({
      where: {
        uuid: id,
      },
    });

    console.log(qr);

    if (!qr) {
      return res.status(404).send({
        error: "QR not found!",
      });
    }

    res.status(200).send({ qr });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).send({
      error: `Internal server error. `,
      Details: `${error}`,
    });
  }
});

module.exports = router;
