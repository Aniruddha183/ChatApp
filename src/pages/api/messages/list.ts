import type { NextApiResponse } from "next";
import { authMiddleware, AuthenticatedRequest } from "../../middleware/auth";
import dbConnect from "../../lib/mondodb";
import Message from "../../models/Message";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();

    const messages = await Message.find({
      $or: [{ sender: req.userId }, { recipient: req.userId }],
    })
      .sort({ timestamp: 1 })
      .populate("sender recipient", "username");

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages", error });
  }
}

export default authMiddleware(handler);
