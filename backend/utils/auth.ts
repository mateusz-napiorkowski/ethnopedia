import { Request } from "express"
const jwt = require("jsonwebtoken")

export const checkUserIsLoggedIn = async (req: Request) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]
        if (!token) return false;
        try {
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string)
            return true
        } catch (error) {
            return false
        }
    } catch (error) {
        return false
    }
}

module.exports = { checkUserIsLoggedIn }