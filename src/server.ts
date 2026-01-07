import express from 'express' 
import morgan from 'morgan'
import { db } from './config/db'
import cors from 'cors'


//rutas
import authRouter from './routes/arqueros'
import torneoRouter from './routes/torneos'
import participacionRouter from './routes/participaciones'
import { sembrarCategorias } from './seeders/CategoriaModalidadSeeder'

async function connectDB(){
  try {
        await db.authenticate()
        await db.sync({ alter: false })
        console.log( 'Conexión exitosa a la BD') 

        await sembrarCategorias();
    } catch (error) {
        console.log('Error al conectar a la BD:', error)
        
    }
}
connectDB()

const app = express()
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  })
)
app.use(morgan('dev'))

app.use(express.json())

//rutas
app.use('/api/arqueros', authRouter)
app.use('/api/torneos', torneoRouter)
app.use('/api/participaciones', participacionRouter)

export default app