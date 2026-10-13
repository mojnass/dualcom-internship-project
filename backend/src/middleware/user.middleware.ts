import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

declare global {
    namespace Express {
        interface Request {
            userId?: string
            userRole?: string
        }
    }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]
        if (!token) return res.status(401).json({ message: 'No token provided' })

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string, role: string }
        req.userId = decoded.id
        req.userRole = decoded.role
        next()
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(401).json({ message: error.message })
        } else {
            res.status(401).json({ message: 'Invalid token' })
        }
    }
}

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]
        if (!token) return res.status(401).json({ message: 'No token provided' })

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string, role: string }
        if (decoded.role !== 'admin'){
             return res.status(403).json({ message: 'Not authorized' })
        }
        req.userId = decoded.id
        req.userRole = decoded.role
        next()
    } catch (error:unknown) {
       if (error instanceof Error) {
        res.status(401).json({ message: error.message })
    } else {
        res.status(401).json({ message: 'Invalid token' })
    }
    }
}

export const storeOwnerMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]
        if (!token) return res.status(401).json({ message: 'No token provided' })

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string, role: string }
        if (decoded.role !== 'store_owner'){
             return res.status(403).json({ message: 'Not authorized' })
        }
        req.userId = decoded.id
        req.userRole = decoded.role
        next()
    } catch (error: unknown) {
 if (error instanceof Error) {
        res.status(401).json({ message: error.message })
    } else {
        res.status(401).json({ message: 'Invalid token' })
    }    }
}

export const customerMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]
        if (!token) return res.status(401).json({ message: 'No token provided' })

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string, role: string }
        if (decoded.role !== 'customer'){ return res.status(403).json({ message: 'Not authorized' })
        }
        req.userId = decoded.id
        req.userRole = decoded.role
        next()
    } catch (error: unknown) {
 if (error instanceof Error) {
        res.status(401).json({ message: error.message })
    } else {
        res.status(401).json({ message: 'Invalid token' })
    }    }
}
