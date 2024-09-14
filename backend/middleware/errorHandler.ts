import { NextFunction, Request, Response } from "express";

function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    console.log(err)
}
  
module.exports = errorHandler;
