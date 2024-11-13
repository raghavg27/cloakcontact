const express = require("express");
const { PrismaClient } = require("@prisma/client");
const authenticateToken = require("../middleware/authenticateToken");

const { contactRequestSchema } = require("../helpers/validation_schema");

const router = express.Router();
const prisma = new PrismaClient();

// Function to create a notification using existing schema
async function createNotification(request_id, user_id) {
  try {
    await prisma.notifications.create({
      data: {
        request_id: request_id,
        notification_type: "email", // Or the appropriate type
        status: "pending",
        timestamp: new Date(),
      },
    });
    console.log("Notification created for user:", user_id);
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}

// Function to create a chat with "pending" status
async function createChat(request_id, qr_code_id) {
  try {
    await prisma.chats.create({
      data: {
        qr_code_id: qr_code_id,
        status: "pending",
        created_at: new Date(),
      },
    });
    console.log("Chat created with pending status for request:", request_id);
  } catch (error) {
    console.error("Failed to create chat:", error);
  }
}

// User contact via QRID
router.post("/contact", async (req, res) => {
  const { qr_code_id, reason, additional_info } = req.body;
  const { error } = contactRequestSchema.validate({ qr_code_id, reason });

  if (error) {
    return res.status(400).send({
      error: `${error.details[0].message}`,
    });
  }

  try {
    // Step 1: Create Contact Request for User
    const contactRequest = await prisma.contact_requests.create({
      data: {
        qr_code_id: qr_code_id,
        client_reason: `${reason}`,
        ...(additional_info && { additional_info }),
      },
    });

    // Step 2: Retrieve User ID through QR Code
    const qrCode = await prisma.qr_codes.findUnique({
      where: { qr_code_id: qr_code_id },
      select: { user_id: true },
    });

    if (!qrCode) {
      return res.status(404).send({ error: "QR code not found." });
    }

    const user_id = qrCode.user_id;

    // Step 3: Create Notification for User
    await createNotification(contactRequest.request_id, user_id);

    // Step 4: Create Chat with "pending" status
    await createChat(contactRequest.request_id, qr_code_id);

    res.status(201).send({
      message: `User contacted!`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: `Internal server error. `,
      Details: `${error}`,
    });
  }
});

module.exports = router;
