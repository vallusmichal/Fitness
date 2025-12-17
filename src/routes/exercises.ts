import { Router, Request, Response, NextFunction } from 'express'

import { models } from '../db'
import { EXERCISE_DIFFICULTY } from '../utils/enums'

const router = Router()

const {
	Exercise,
	Program
} = models

export default () => {
	router.get('/', async (_req: Request, res: Response, _next: NextFunction): Promise<any> => {
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

	// TODO: Add admin auth middleware
	router.post('/', async (req: Request, res: Response, _next: NextFunction): Promise<any> => {
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

	// TODO: Add admin auth middleware
	router.put('/:id', async (req: Request, res: Response, _next: NextFunction): Promise<any> => {
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

	// TODO: Add admin auth middleware
	router.delete('/:id', async (req: Request, res: Response, _next: NextFunction): Promise<any> => {
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

	return router
}
