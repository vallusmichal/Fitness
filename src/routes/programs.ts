import {
	Router,
	Request,
	Response,
	NextFunction
} from 'express'

import { models } from '../db'

const router = Router()

const {
	Program,
	Exercise
} = models

export default () => {
	router.get('/', async (_req: Request, res: Response, _next: NextFunction): Promise<any> => {
		const programs = await Program.findAll()
		return res.json({
			data: programs,
			message: 'List of programs'
		})
	})

	// TODO: Add admin auth middleware
	router.post('/:programId/exercises/:exerciseId', async (req: Request, res: Response, _next: NextFunction): Promise<any> => {
		try {
			const { programId, exerciseId } = req.params

			const program = await Program.findByPk(programId)
			if (!program) {
				return res.status(404).json({
					error: 'Program not found'
				})
			}

			const exercise = await Exercise.findByPk(exerciseId)
			if (!exercise) {
				return res.status(404).json({
					error: 'Exercise not found'
				})
			}

			await exercise.update({ programID: programId })

			return res.status(200).json({
				data: {
					exerciseId: exercise.id,
					programId: program.id
				},
				message: 'Exercise added to program successfully'
			})
		} catch (error: any) {
			return res.status(500).json({
				error: 'Failed to add exercise to program',
				details: error.message
			})
		}
	})

	// TODO: Add admin auth middleware
	router.delete('/:programId/exercises/:exerciseId', async (req: Request, res: Response, _next: NextFunction): Promise<any> => {
		try {
			const { programId, exerciseId } = req.params

			const program = await Program.findByPk(programId)
			if (!program) {
				return res.status(404).json({
					error: 'Program not found'
				})
			}

			const exercise = await Exercise.findByPk(exerciseId)
			if (!exercise) {
				return res.status(404).json({
					error: 'Exercise not found'
				})
			}

			if (exercise.get('programID') !== parseInt(programId)) {
				return res.status(400).json({
					error: 'Exercise does not belong to this program'
				})
			}

			await exercise.destroy()

			return res.status(200).json({
				data: {
					exerciseId: exercise.id,
					programId: program.id
				},
				message: 'Exercise removed from program successfully'
			})
		} catch (error: any) {
			return res.status(500).json({
				error: 'Failed to remove exercise from program',
				details: error.message
			})
		}
	})

	return router
}
