import mongoose from "mongoose"

const asyncWrapper = require("../middleware/async")

const User = require("../models/user")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require("dotenv").config()
import { NextFunction, Request, Response } from "express"

const registerUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const existingUser = await User.findOne({ username: req.body.username }).exec()
        if (existingUser) {
            const err = new Error("User already exists")
            res.status(409)
            return next(err)
        }
    } catch {
        const err = new Error("Database unavailable")
        res.status(503)
        return next(err)
    }

    const bcryptCallback = async (err: Error, hashedPassword: string) => {
        if(err) {
            const err = new Error("Password encryption error")
            res.status(500)
            return next(err)
        }
        try {
            const user = await User.create({
                username: req.body.username,
                password: hashedPassword,
                firstName: req.body.firstName,
            })
            const token = jwt.sign(
                { username: user.username, firstName: user.firstName, userId: user._id },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: process.env.EXPIRATION_TIME }
            )
            return res.status(201).json({ token })
        } catch {
            const err = new Error("Database unavailable")
            res.status(503)
            return next(err)
        }
    }

    const saltRounds = 10
    bcrypt.hash(req.body.password, saltRounds, bcryptCallback)        
}

const loginUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        const user = await User.findOne({ username: req.body.username })

        if (!user) {
            return res.status(404).send("Invalid username or password")
        }

        const validPassword = await bcrypt.compare(req.body.password, user.password)

        if (!validPassword) {
            return res.status(404).json("Invalid username or password")
        }

        const token = jwt.sign({ username: user.username, firstName: user.firstName, userId: user._id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.EXPIRATION_TIME })
        return res.status(200).json({ token })

    } catch (err) {
        return res.status(500).json(err)
    }
}

const deleteUser = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId

    try {
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json(`Invalid user id: ${userId}`)
        }

        const isSuccess = await User.findByIdAndRemove(userId).exec()

        if (!isSuccess) {
            return res.status(404).json("User not found")
        }

        return res.sendStatus(204)
    } catch (error) {
        next(error)
    }
})

module.exports = {
    registerUser,
    loginUser,
    deleteUser,
}