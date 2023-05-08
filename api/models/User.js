import { Model, DataTypes } from 'sequelize';
import sequelize from '../connection.js';

class User extends Model {
}

User.init(
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize, 
    modelName: 'User', 
    timestamps: true,
  }
);

export default User;


