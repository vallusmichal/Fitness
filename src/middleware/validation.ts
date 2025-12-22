import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { USER_ROLE, EXERCISE_DIFFICULTY } from '../utils/enums'

type ZodSchema = z.ZodType<any, any, any>

const idSchema = z.string().regex(/^\d+$/, 'ID must be a valid number')

const userRegistrationSchema = z.object({
	email: z.string().email('Invalid email format'),
	password: z.string().min(8, 'Password must be at least 8 characters'),
	role: z.enum([USER_ROLE.ADMIN, USER_ROLE.USER]).optional(),
	name: z.string().optional(),
	surname: z.string().optional(),
	nickName: z.string().optional(),
	age: z.number().int().positive('Age must be a positive integer').optional()
})

const userUpdateSchema = z.object({
	name: z.string().optional(),
	surname: z.string().optional(),
	nickName: z.string().optional(),
	age: z.number().int().positive('Age must be a positive integer').optional(),
	role: z.enum([USER_ROLE.ADMIN, USER_ROLE.USER]).optional()
})

const exerciseCreateSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	difficulty: z.enum([EXERCISE_DIFFICULTY.EASY, EXERCISE_DIFFICULTY.MEDIUM, EXERCISE_DIFFICULTY.HARD], {
		message: 'Invalid difficulty. Must be EASY, MEDIUM, or HARD'
	}),
	programID: z.union([z.string(), z.number()], {
		message: 'programID is required'
	})
})

const exerciseUpdateSchema = z.object({
	name: z.string().optional(),
	difficulty: z.enum([EXERCISE_DIFFICULTY.EASY, EXERCISE_DIFFICULTY.MEDIUM, EXERCISE_DIFFICULTY.HARD], {
		message: 'Invalid difficulty. Must be EASY, MEDIUM, or HARD'
	}).optional(),
	programID: z.union([z.string(), z.number()]).optional()
})

const completedExerciseSchema = z.object({
	exerciseId: z.union([z.string(), z.number()], {
		message: 'exerciseId is required'
	}),
	duration: z.number().positive('duration must be a positive number (in seconds)'),
	completedAt: z.string().datetime().optional()
})

const programExerciseParamsSchema = z.object({
	programId: z.string().regex(/^\d+$/, 'programId must be a valid number'),
	exerciseId: z.string().regex(/^\d+$/, 'exerciseId must be a valid number')
})

function getFirstErrorMessage(error: z.core.$ZodError): string {
	const issues = error.issues
	if (issues.length > 0) {
		return issues[0].message
	}
	return 'Validation failed'
}

function validate(schema: ZodSchema, source: 'body' | 'params' | 'query' = 'body') {
	return (req: Request, res: Response, next: NextFunction): any => {
		const result = schema.safeParse(req[source])

		if (!result.success) {
			return res.status(400).json({
				data: {},
				message: getFirstErrorMessage(result.error)
			})
		}

		next()
	}
}

function validateMultiple(schemas: { body?: ZodSchema; params?: ZodSchema; query?: ZodSchema }) {
	return (req: Request, res: Response, next: NextFunction): any => {
		if (schemas.params) {
			const result = schemas.params.safeParse(req.params)
			if (!result.success) {
				return res.status(400).json({
					data: {},
					message: getFirstErrorMessage(result.error)
				})
			}
		}

		if (schemas.query) {
			const result = schemas.query.safeParse(req.query)
			if (!result.success) {
				return res.status(400).json({
					data: {},
					message: getFirstErrorMessage(result.error)
				})
			}
		}

		if (schemas.body) {
			const result = schemas.body.safeParse(req.body)
			if (!result.success) {
				return res.status(400).json({
					data: {},
					message: getFirstErrorMessage(result.error)
				})
			}
		}

		next()
	}
}

export const validateRegistration = validate(userRegistrationSchema)
export const validateUserUpdate = validateMultiple({
	params: z.object({ id: idSchema }),
	body: userUpdateSchema
})
export const validateUserIdParam = validate(z.object({ id: idSchema }), 'params')

export const validateExerciseCreate = validate(exerciseCreateSchema)
export const validateExerciseUpdate = validateMultiple({
	params: z.object({ id: idSchema }),
	body: exerciseUpdateSchema
})
export const validateExerciseIdParam = validate(z.object({ id: idSchema }), 'params')
export const validateCompletedExercise = validate(completedExerciseSchema)

export const validateProgramExerciseParams = validate(programExerciseParamsSchema, 'params')
