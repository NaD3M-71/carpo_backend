
import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import { Arquero } from '../models/Arquero';
import { Torneo } from '../models/Torneo';
import { CategoriaModalidad } from '../models/CategoriaModalidad';
import { Participacion } from '../models/Participacion';
dotenv.config();

// Creamos la instancia de conexión a la BD
export const db = new Sequelize(
  process.env.DB_NAME ,    // nombre de la base
  process.env.DB_USER ,        // usuario de MySQL
  process.env.DB_PASSWORD ,        // contraseña de MySQL
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
    models: [Arquero,Torneo, CategoriaModalidad,Participacion]                 // pone true si querés ver las consultas SQL en consola
    

  }
);


