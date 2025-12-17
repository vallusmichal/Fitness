import { Sequelize, DataTypes, Model } from 'sequelize'

export interface CompletedExerciseModel extends Model {
	id: number
	userId: number
	exerciseId: number
	completedAt: Date
	duration: number
}

export default (sequelize: Sequelize, modelName: string) => {
	const CompletedExerciseModelCtor = sequelize.define<CompletedExerciseModel>(
		modelName,
		{
			id: {
				type: DataTypes.BIGINT,
				primaryKey: true,
				allowNull: false,
				autoIncrement: true
			},
			userId: {
				type: DataTypes.BIGINT,
				allowNull: false,
				references: {
					model: 'users',
					key: 'id'
				}
			},
			exerciseId: {
				type: DataTypes.BIGINT,
				allowNull: false,
				references: {
					model: 'exercises',
					key: 'id'
				}
			},
			completedAt: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: DataTypes.NOW
			},
			duration: {
				type: DataTypes.INTEGER,
				allowNull: false
			}
		},
		{
			paranoid: true,
			timestamps: true,
			tableName: 'completed_exercises'
		}
	)

	CompletedExerciseModelCtor.associate = (models) => {
		CompletedExerciseModelCtor.belongsTo(models.User, {
			foreignKey: {
				name: 'userId',
				allowNull: false
			}
		})
		CompletedExerciseModelCtor.belongsTo(models.Exercise, {
			foreignKey: {
				name: 'exerciseId',
				allowNull: false
			}
		})
	}

	return CompletedExerciseModelCtor
}
