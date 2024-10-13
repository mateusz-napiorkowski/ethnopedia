import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken";

export const authAsyncWrapper = (
    handler: (req: Request, res: Response, next: NextFunction) => any,
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization?.split(" ")[1]
            if (!token) {
                const err = new Error("No token provided")
                res.status(400).json({ error: err.message })
                return next(err)
            }
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string)
            await handler(req, res, next)
        } catch {
            const err = new Error('Access denied')
            res.status(401).json({ error: err.message })
            return next(err)
        }
    }
}