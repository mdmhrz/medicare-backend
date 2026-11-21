import { Request, Response } from "express";

const getStats = async (req: Request, res: Response) => {
    res.status(200).json({ message: "RAG stats fetched successfully" });
    console.log("RAG stats fetched successfully");
    console.log(req.query)
    console.log(req)
}

export const RagController = {
    getStats
}

