import type { NextApiResponse } from "next";
import { authMiddleware, AuthenticatedRequest } from "../middleware/auth";
import dbConnect from "../lib/mondodb";
import Message from "../models/Message";
import User from "../models/User";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();

    const { recipientId, content } = req.body;

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(400).json({ message: "Recipient not found" });
    }

    const newMessage = new Message({
      sender: req.userId,
      recipient: recipientId,
      content,
    });

    await newMessage.save();

    res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error sending message", error });
  }
}

export default authMiddleware(handler);
