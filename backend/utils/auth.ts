import jwt from "jsonwebtoken";

export const verifyToken = (authHeader: string | undefined) => {
    try {
        const token = authHeader ? authHeader.split(" ")[1] : undefined
        if (!token)
            throw new Error("No token provided")
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string)
    } catch {
        throw new Error('Access denied')
    }
}