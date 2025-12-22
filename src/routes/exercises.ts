import { Router, Request, Response, NextFunction } from 'express'

import { models } from '../db'
import { EXERCISE_DIFFICULTY, USER_ROLE } from '../utils/enums'
import { authenticate, requireRole } from '../middleware/auth'

const router = Router()

const {
	Exercise,
	Program,
	CompletedExercise,
	User
} = models

export default () => {
	router.get('/',
		authenticate,
		async (_req: Request, res: Response, _next: NextFunction): Promise<any> => {

		const exercises = await Exercise.findAll({
			include: [{
				model: Program
			}]
		})

		return res.json({
			data: exercises,
			message: 'List of exercises'
		})
	})

	router.post('/',
		authenticate,
		requireRole(USER_ROLE.ADMIN),
		async (req: Request, res: Response, _next: NextFunction): Promise<any> => {

		try {
			const { name, difficulty, programID } = req.body

			if (!name || !difficulty || !programID) {
				return res.status(400).json({
					data: {},
					message: 'Name, difficulty, and programID are required'
				})
			}

			if (!Object.values(EXERCISE_DIFFICULTY).includes(difficulty)) {
				return res.status(400).json({
					data: {},
					message: 'Invalid difficulty. Must be EASY, MEDIUM, or HARD'
				})
			}

			const program = await Program.findByPk(programID)
			if (!program) {
				return res.status(404).json({
					data: {},
					message: 'Program not found'
				})
			}

			const newExercise = await Exercise.create({
				name,
				difficulty,
				programID
			})

			return res.status(201).json({
				data: {
					id: newExercise.id
				},
				message: 'Exercise created successfully'
			})
		} catch (error: any) {
			return res.status(500).json({
				data: {},
				message: 'Failed to create exercise'
			})
		}
	})

	router.put('/:id',
		authenticate,
		requireRole(USER_ROLE.ADMIN),
		async (req: Request, res: Response, _next: NextFunction): Promise<any> => {

		try {
			const { id } = req.params
			const { name, difficulty, programID } = req.body

			const exercise = await Exercise.findByPk(id)

			if (!exercise) {
				return res.status(404).json({
					data: {},
					message: 'Exercise not found'
				})
			}

			if (difficulty && !Object.values(EXERCISE_DIFFICULTY).includes(difficulty)) {
				return res.status(400).json({
					data: {},
					message: 'Invalid difficulty. Must be EASY, MEDIUM, or HARD'
				})
			}

			if (programID) {
				const program = await Program.findByPk(programID)
				if (!program) {
					return res.status(404).json({
						data: {},
						message: 'Program not found'
					})
				}
			}

			const updateData: any = {}
			if (name !== undefined) updateData.name = name
			if (difficulty !== undefined) updateData.difficulty = difficulty
			if (programID !== undefined) updateData.programID = programID

			await exercise.update(updateData)

			return res.status(200).json({
				data: {
					id: exercise.id
				},
				message: 'Exercise updated successfully'
			})
		} catch (error: any) {
			return res.status(500).json({
				data: {},
				message: 'Failed to update exercise'
			})
		}
	})

	router.delete('/:id',
		authenticate,
		requireRole(USER_ROLE.ADMIN),
		async (req: Request, res: Response, _next: NextFunction): Promise<any> => {

		try {
			const { id } = req.params

			const exercise = await Exercise.findByPk(id)

			if (!exercise) {
				return res.status(404).json({
					data: {},
					message: 'Exercise not found'
				})
			}

			await exercise.destroy()

			return res.status(200).json({
				data: {
					id: exercise.id
				},
				message: 'Exercise deleted successfully'
			})
		} catch (error: any) {
			return res.status(500).json({
				data: {},
				message: 'Failed to delete exercise'
			})
		}
	})

	router.post('/completed',
		authenticate,
		requireRole(USER_ROLE.USER),
		async (req: Request, res: Response, _next: NextFunction): Promise<any> => {

		try {
			const userId = req.user!.id
			const { exerciseId, duration, completedAt } = req.body

			if (!exerciseId || !duration) {
				return res.status(400).json({
					data: {},
					message: 'exerciseId and duration are required'
				})
			}

			if (typeof duration !== 'number' || duration <= 0) {
				return res.status(400).json({
					data: {},
					message: 'duration must be a positive number (in seconds)'
				})
			}

			const user = await User.findByPk(userId)
			if (!user) {
				return res.status(404).json({
					data: {},
					message: 'User not found'
				})
			}

			const exercise = await Exercise.findByPk(exerciseId)
			if (!exercise) {
				return res.status(404).json({
					data: {},
					message: 'Exercise not found'
				})
			}

			const completedExerciseData: any = {
				userId,
				exerciseId,
				duration
			}

			if (completedAt) {
				completedExerciseData.completedAt = new Date(completedAt)
			}

			const completedExercise = await CompletedExercise.create(completedExerciseData)

			return res.status(201).json({
				data: {
					id: completedExercise.id
				},
				message: 'Exercise tracked successfully'
			})
		} catch (error: any) {
			return res.status(500).json({
				data: {},
				message: 'Failed to track exercise'
			})
		}
	})

	router.get('/completed',
		authenticate,
		requireRole(USER_ROLE.USER),
		async (req: Request, res: Response, _next: NextFunction): Promise<any> => {

		try {
			const userId = req.user!.id

			const completedExercises = await CompletedExercise.findAll({
				where: { userId },
				include: [{
					model: Exercise,
					attributes: ['id', 'name', 'difficulty']
				}],
				order: [['completedAt', 'DESC']]
			})

			return res.status(200).json({
				data: completedExercises,
				message: 'List of completed exercises'
			})
		} catch (error: any) {
			return res.status(500).json({
				data: {},
				message: 'Failed to fetch completed exercises'
			})
		}
	})

	router.delete('/completed/:id',
		authenticate,
		requireRole(USER_ROLE.USER),
		async (req: Request, res: Response, _next: NextFunction): Promise<any> => {

		try {
			const { id } = req.params
			const userId = req.user!.id

			const completedExercise = await CompletedExercise.findByPk(id)

			if (!completedExercise) {
				return res.status(404).json({
					data: {},
					message: 'Completed exercise not found'
				})
			}

			if (completedExercise.get('userId') != userId) {
				return res.status(403).json({
					data: {},
					message: 'You can only delete your own completed exercises'
				})
			}

			await completedExercise.destroy()

			return res.status(200).json({
				data: {
					id: completedExercise.id
				},
				message: 'Completed exercise removed successfully'
			})
		} catch (error: any) {
			return res.status(500).json({
				data: {},
				message: 'Failed to remove completed exercise'
			})
		}
	})

	return router
}
