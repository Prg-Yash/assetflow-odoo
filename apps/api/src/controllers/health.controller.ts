import { Request, Response, NextFunction } from "express";

export function getHealth(req: Request, res: Response, next: NextFunction): void {
  try {
    res.status(200).json({
      success: true,
      data: {
        status: "OK",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
}
