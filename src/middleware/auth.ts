import { Request, Response, NextFunction, RequestHandler } from 'express'
import passport from 'passport'
import { UserModel } from '../db/user'
import { USER_ROLE } from '../utils/enums'

declare global {
	namespace Express {
		interface User extends UserModel {}
	}
}

export const authenticate: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
	passport.authenticate('jwt', { session: false }, (err: any, user: UserModel | false) => {
		if (err) {
			return res.status(500).json({
				data: {},
				message: 'Authentication error'
			})
		}

		if (!user) {
			return res.status(401).json({
				data: {},
				message: 'Unauthorized - Invalid or missing token'
			})
		}

		req.user = user;
		next();
	})(req, res, next)
}

export const requireRole = (role: USER_ROLE): RequestHandler => {
	return (req: Request, res: Response, next: NextFunction): any => {
		if (!req.user) {
			return res.status(401).json({
				data: {},
				message: 'Unauthorized - Authentication required'
			})
		}

		if (req.user.role !== role) {
			return res.status(403).json({
				data: {},
				message: `Forbidden - ${role} role required`
			})
		}

		next();
	}
}
