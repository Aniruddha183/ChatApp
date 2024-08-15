import type { NextApiResponse } from "next";
import { authMiddleware, AuthenticatedRequest } from "../../middleware/auth";
import dbConnect from "../../lib/mondodb";
import User from "../../models/User";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();

    const users = await User.find({}, "username").sort("username");

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
}

export default authMiddleware(handler);
