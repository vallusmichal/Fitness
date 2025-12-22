import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'
import bcrypt from 'bcrypt'
import { models } from '../db'

const { User } = models

export const JWT_SECRET = 'my-super-duper-secret-key';

const localStrategy = new LocalStrategy(
	{
		usernameField: 'email',
		passwordField: 'password'
	},
	async (email: string, password: string, done) => {
		try {
			const user = await User.findOne({ where: { email } })
			
			if (!user) {
				return done(null, false, { message: 'Invalid email or password' })
			}

			const isValidPassword = await bcrypt.compare(password, user.password)
			
			if (!isValidPassword) {
				return done(null, false, { message: 'Invalid email or password' })
			}

			return done(null, user)
		} catch (error) {
			return done(error)
		}
	}
)

const jwtStrategy = new JwtStrategy(
	{
		jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
		secretOrKey: JWT_SECRET
	},
	async (payload: any, done) => {
		try {
			const user = await User.findByPk(payload.userId)
			
			if (!user) {
				return done(null, false)
			}

			return done(null, user)
		} catch (error) {
			return done(error)
		}
	}
)

export const configurePassport = () => {
	passport.use(localStrategy)
	passport.use(jwtStrategy)
}
