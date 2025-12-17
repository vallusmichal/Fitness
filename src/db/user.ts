import { Sequelize, DataTypes, Model } from 'sequelize'
import { USER_ROLE } from '../utils/enums'

export interface UserModel extends Model {
	id: number
	name: string
	surname: string
	nickName: string
	email: string
	password: string
	age: number
	role: USER_ROLE
}

export default (sequelize: Sequelize, modelName: string) => {
	const UserModelCtor = sequelize.define<UserModel>(
		modelName,
		{
			id: {
				type: DataTypes.BIGINT,
				primaryKey: true,
				allowNull: false,
				autoIncrement: true
			},
			name: {
				type: DataTypes.STRING(200),
				allowNull: false
			},
			surname: {
				type: DataTypes.STRING(200),
				allowNull: false
			},
			nickName: {
				type: DataTypes.STRING(200),
				allowNull: false
			},
			email: {
				type: DataTypes.STRING(200),
				allowNull: false,
				unique: true
			},
			password: {
				type: DataTypes.STRING(255),
				allowNull: false
			},
			age: {
				type: DataTypes.INTEGER,
				allowNull: false
			},
			role: {
				type: DataTypes.ENUM(...Object.values(USER_ROLE)),
				allowNull: false,
				defaultValue: USER_ROLE.USER
			}
		}, 
		{
			paranoid: true,
			timestamps: true,
			tableName: 'users'
		}
	)

	UserModelCtor.associate = (models) => {
		UserModelCtor.hasMany(models.CompletedExercise, {
			foreignKey: 'userId'
		})
	}

	return UserModelCtor
}
