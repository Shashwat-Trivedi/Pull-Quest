import { Request, Response, NextFunction } from "express";
import { RequestHandler } from 'express';
export declare const handleCodeReview: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const handlePRSummary: RequestHandler;
export declare const fullReview: RequestHandler;
