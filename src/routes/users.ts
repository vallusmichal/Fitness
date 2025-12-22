import { Router, Request, Response, NextFunction } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import passport from 'passport'

import { models } from '../db'
import { USER_ROLE } from '../utils/enums'
import { authenticate, requireRole } from '../middleware/auth'
import { JWT_SECRET } from '../middleware/passport'

const router = Router()

const { User } = models

const SALT_ROUNDS = 10

export default () => {
	router.post('/register',
		async (req: Request, res: Response, _next: NextFunction): Promise<any> => {

		try {
			const { email, password, role, name, surname, nickName, age } = req.body

			if (!email || !password) {
				return res.status(400).json({
					data: {},
					message: 'Email and password are required'
				})
			}

			if (role && !Object.values(USER_ROLE).includes(role)) {
				return res.status(400).json({
					data: {},
					message: 'Invalid role. Must be ADMIN or USER'
				})
			}

			const existingUser = await User.findOne({ where: { email } })
			if (existingUser) {
				return res.status(409).json({
					data: {},
					message: 'User with this email already exists'
				})
			}

			const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

			const newUser = await User.create({
				email,
				password: hashedPassword,
				role: role || USER_ROLE.USER,
				name: name || '',
				surname: surname || '',
				nickName: nickName || '',
				age: age || 0
			})

			return res.status(201).json({
				data: {
					id: newUser.id
				},
				message: 'User registered successfully'
			})
		} catch (error: any) {
			return res.status(500).json({
				data: {},
				message: 'Failed to register user'
			})
		}
	})

	router.post('/login',
		async (req: Request, res: Response, next: NextFunction): Promise<any> => {

		passport.authenticate('local', { session: false }, (err: any, user: any, info: any) => {
			if (err) {
				return res.status(500).json({
					data: {},
					message: 'Login failed'
				})
			}

			if (!user) {
				return res.status(401).json({
					data: {},
					message: info?.message || 'Invalid email or password'
				})
			}

			const token = jwt.sign(
				{
					userId: user.id,
					email: user.email,
					role: user.role
				},
				JWT_SECRET,
				{ expiresIn: '7d' }
			)

			return res.status(200).json({
				data: {
					token,
					user: {
						id: user.id,
						email: user.email,
						role: user.role,
						name: user.name,
						surname: user.surname,
						nickName: user.nickName,
						age: user.age
					}
				},
				message: 'Login successful'
			})
		})(req, res, next)
	})

	router.get('/',
		authenticate,
		requireRole(USER_ROLE.USER),
		async (_req: Request, res: Response, _next: NextFunction): Promise<any> => {

		try {
			const users = await User.findAll({
				attributes: ['id', 'nickName']
			})

			return res.status(200).json({
				data: users,
				message: 'List of users'
			})
		} catch (error: any) {
			return res.status(500).json({
				data: {},
				message: 'Failed to fetch users'
			})
		}
	})

	router.get('/profile',
		authenticate,
		async (req: Request, res: Response, _next: NextFunction): Promise<any> => {

		try {
			const userId = req.user!.id

			const user = await User.findByPk(userId, {
				attributes: ['name', 'surname', 'age', 'nickName']
			})

			if (!user) {
				return res.status(404).json({
					data: {},
					message: 'User not found'
				})
			}

			return res.status(200).json({
				data: user,
				message: 'User profile'
			})
		} catch (error: any) {
			return res.status(500).json({
				data: {},
				message: 'Failed to fetch user profile'
			})
		}
	})

	router.get('/:id',
		authenticate,
		requireRole(USER_ROLE.ADMIN),
		async (req: Request, res: Response, _next: NextFunction): Promise<any> => {

		try {
			const { id } = req.params

			const user = await User.findByPk(id, {
				attributes: { exclude: ['password'] }
			})

			if (!user) {
				return res.status(404).json({
					data: {},
					message: 'User not found'
				})
			}

			return res.status(200).json({
				data: user,
				message: 'User details'
			})
		} catch (error: any) {
			return res.status(500).json({
				data: {},
				message: 'Failed to fetch user'
			})
		}
	})

	router.put('/:id',
		authenticate,
		requireRole(USER_ROLE.ADMIN),
		async (req: Request, res: Response, _next: NextFunction): Promise<any> => {

		try {
			const { id } = req.params
			const { name, surname, nickName, age, role } = req.body

			const user = await User.findByPk(id)

			if (!user) {
				return res.status(404).json({
					data: {},
					message: 'User not found'
				})
			}

			if (role && !Object.values(USER_ROLE).includes(role)) {
				return res.status(400).json({
					data: {},
					message: 'Invalid role. Must be ADMIN or USER'
				})
			}

			const updateData: any = {}
			if (name !== undefined) updateData.name = name
			if (surname !== undefined) updateData.surname = surname
			if (nickName !== undefined) updateData.nickName = nickName
			if (age !== undefined) updateData.age = age
			if (role !== undefined) updateData.role = role

			await user.update(updateData)

			return res.status(200).json({
				data: {
					id: user.id
				},
				message: 'User updated successfully'
			})
		} catch (error: any) {
			return res.status(500).json({
				data: {},
				message: 'Failed to update user'
			})
		}
	})

	return router
}
