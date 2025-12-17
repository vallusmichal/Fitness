import { Router, Request, Response, NextFunction } from 'express'
import bcrypt from 'bcrypt'

import { models } from '../db'
import { USER_ROLE } from '../utils/enums'

const router = Router()

const { User } = models

const SALT_ROUNDS = 10

export default () => {
	router.post('/register', async (req: Request, res: Response, _next: NextFunction): Promise<any> => {
		try {
			const { email, password, role, name, surname, nickName, age } = req.body

			if (!email || !password) {
				return res.status(400).json({
					error: 'Email and password are required'
				})
			}

			if (role && !Object.values(USER_ROLE).includes(role)) {
				return res.status(400).json({
					error: 'Invalid role. Must be ADMIN or USER'
				})
			}

			const existingUser = await User.findOne({ where: { email } })
			if (existingUser) {
				return res.status(409).json({
					error: 'User with this email already exists'
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
				error: 'Failed to register user',
				details: error.message
			})
		}
	})

	// TODO: Add admin auth middleware
	router.get('/', async (_req: Request, res: Response, _next: NextFunction): Promise<any> => {
		try {
			const users = await User.findAll({
				attributes: { exclude: ['password'] }
			})

			return res.status(200).json({
				data: users,
				message: 'List of users'
			})
		} catch (error: any) {
			return res.status(500).json({
				error: 'Failed to fetch users',
				details: error.message
			})
		}
	})

	// TODO: Add admin auth middleware
	router.get('/:id', async (req: Request, res: Response, _next: NextFunction): Promise<any> => {
		try {
			const { id } = req.params

			const user = await User.findByPk(id, {
				attributes: { exclude: ['password'] }
			})

			if (!user) {
				return res.status(404).json({
					error: 'User not found'
				})
			}

			return res.status(200).json({
				data: user,
				message: 'User details'
			})
		} catch (error: any) {
			return res.status(500).json({
				error: 'Failed to fetch user',
				details: error.message
			})
		}
	})

	// TODO: Add admin auth middleware
	router.put('/:id', async (req: Request, res: Response, _next: NextFunction): Promise<any> => {
		try {
			const { id } = req.params
			const { name, surname, nickName, age, role } = req.body

			const user = await User.findByPk(id)

			if (!user) {
				return res.status(404).json({
					error: 'User not found'
				})
			}

			if (role && !Object.values(USER_ROLE).includes(role)) {
				return res.status(400).json({
					error: 'Invalid role. Must be ADMIN or USER'
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
				error: 'Failed to update user',
				details: error.message
			})
		}
	})

	return router
}
