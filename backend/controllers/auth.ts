import mongoose from "mongoose"

import {authAsyncWrapper} from "../middleware/auth"

import { Request, Response} from "express"
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
import User from "../models/user";
require("dotenv").config()

export const registerUser = async (req: Request, res: Response) => {
    const newUsername = req.body.username
    const newFirstName = req.body.firstName
    const newPassword = req.body.password
    try {
        if (!newUsername || !newFirstName || !newPassword)
            throw new Error('Incorrect request body provided')
        const existingUser = await User.findOne({username: newUsername}).exec()
        if (existingUser)
            throw new Error("User already exists")
        
        const saltRounds = 10
        return bcrypt.hash(newPassword, saltRounds, async (err: Error, hashedPassword: string) => {   
            if (err) {
                console.error(err)
                return res.status(500).json({ error: "Password encryption error" })
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
            } catch (error) {
                console.error(error)
                res.status(503).json({ error: `Database unavailable` })       
            }
        })
    } catch (error) {
        const err = error as Error
        console.error(error)
        if (err.message === `Incorrect request body provided`)
            res.status(400).json({ error: err.message })
        else if(err.message === 'User already exists')
            res.status(409).json({ error: err.message })
        else
            res.status(503).json({ error: `Database unavailable` })       
    }  
}

export const loginUser = async (req: Request, res: Response) => {
    const loginUsername = req.body.username
    const loginPassword = req.body.password
    try {
        if (!loginUsername || !loginPassword)
            throw new Error("Incorrect request body provided")
        
        const user = await User.findOne({username: loginUsername}).exec()
        if (!user)
            throw new Error("Invalid username or password")

        return bcrypt.compare(loginPassword, user.password, (err: Error, validPassword: string) => {
            if (err) {
                throw new Error("Internal server error")
            }
            if (!validPassword)
                throw new Error("Invalid username or password")
            const token = jwt.sign(
                {username: user.username, firstName: user.firstName, userId: user._id},
                process.env.ACCESS_TOKEN_SECRET,
                {expiresIn: process.env.EXPIRATION_TIME})
            return res.status(200).json({token})
        })
    } catch (error) {
        const err = error as Error
        console.error(error)
        if (err.message === `Incorrect request body provided`)
            return res.status(400).json({ error: err.message })
        else if (err.message === 'Invalid username or password')
            return res.status(404).json({ error: err.message })
        else if (err.message === 'Internal server error')
            return res.status(500).json({ error: err.message })
        else
            return res.status(503).json({ error: `Database unavailable` })  
    }   
}

export const deleteUser = authAsyncWrapper(async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId
        if (!mongoose.isValidObjectId(userId))
            throw new Error('Invalid user id')
        const deletedUserData = await User.findByIdAndRemove(userId, { lean: true }).exec()
        if (!deletedUserData)
            throw new Error('User not found')
        res.status(200).json(deletedUserData)
    } catch (error) {
        const err = error as Error
        console.error(error)
        if (err.message === `Invalid user id`)
            return res.status(400).json({ error: err.message })
        else if (err.message === 'User not found')
            return res.status(404).json({ error: err.message })
        else
            return res.status(503).json({ error: `Database unavailable` })  
    }
})