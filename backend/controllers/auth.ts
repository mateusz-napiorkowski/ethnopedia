import mongoose from "mongoose"

import {authAsyncWrapper} from "../middleware/auth"

import {NextFunction, Request, Response} from "express"
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
import User from "../models/user";
require("dotenv").config()

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
    const newUsername = req.body.username
    const newFirstName = req.body.firstName
    const newPassword = req.body.password
    if (newUsername && newFirstName && newPassword) {
        try {
            const existingUser = await User.findOne({username: newUsername}).exec()
            if (existingUser) {
                const err = new Error("User already exists")
                res.status(409).json({error: err.message})
                return next(err)
            }
        } catch {
            const err = new Error("Database unavailable")
            res.status(503).json({error: err.message})
            return next(err)
        }

        const hashCallback = async (err: Error, hashedPassword: string) => {
            if (err) {
                const err = new Error("Password encryption error")
                res.status(500).json({error: err.message})
                return next(err)
            }
            try {
                const user = await User.create({
                    username: newUsername,
                    password: hashedPassword,
                    firstName: newFirstName,
                })
                const token = jwt.sign(
                    {username: user.username, firstName: user.firstName, userId: user._id},
                    process.env.ACCESS_TOKEN_SECRET,
                    {expiresIn: process.env.EXPIRATION_TIME}
                )
                return res.status(201).json({token})
            } catch {
                const err = new Error("Database unavailable")
                res.status(503).json({error: err.message})
                return next(err)
            }
        }
        const saltRounds = 10
        return bcrypt.hash(newPassword, saltRounds, hashCallback)
    }
    const err = new Error(`Incorrect request body provided`)
    res.status(400).json({error: err.message})
    return next(err)
}

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    const loginUsername = req.body.username
    const loginPassword = req.body.password
    if (loginUsername && loginPassword) {
        try {
            const user = await User.findOne({username: loginUsername}).exec()
            if (!user) {
                const err = new Error("Invalid username or password")
                res.status(404).json({error: err.message})
                return next(err)
            }

            const compareCallback = (err: Error, validPassword: string) => {
                if (err) {
                    const err = new Error("Internal server error")
                    res.status(500).json({error: err.message})
                    return next(err)
                }
                if (!validPassword) {
                    const err = new Error("Invalid username or password")
                    res.status(404).json({error: err.message})
                    return next(err)
                }
                const token = jwt.sign(
                    {username: user.username, firstName: user.firstName, userId: user._id},
                    process.env.ACCESS_TOKEN_SECRET,
                    {expiresIn: process.env.EXPIRATION_TIME})
                return res.status(200).json({token})
            }
            return bcrypt.compare(loginPassword, user.password, compareCallback)
        } catch {
            const err = new Error("Database unavailable")
            res.status(503).json({error: err.message})
            return next(err)
        }
    }
    const err = new Error("Incorrect request body provided")
    res.status(400).json({error: err.message})
    return next(err)
}

export const deleteUser = authAsyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId
    if (!mongoose.isValidObjectId(userId)) {
        const err = new Error(`Invalid user id: ${userId}`)
        res.status(400).json({error: err.message})
        return next(err)
    }
    try {
        const deletedUserData = await User.findByIdAndRemove(userId,{ lean: true }).exec()
        if (!deletedUserData) {
            const err = new Error(`User not found`)
            res.status(404).json({error: err.message})
            return next(err)
        }
        return res.status(200).json(deletedUserData)
    } catch {
        const err = new Error("Database unavailable")
        res.status(503).json({error: err.message})
        return next(err)
    }
})