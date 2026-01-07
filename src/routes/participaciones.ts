import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { handleInputErrors } from '../middlewares/validation';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/roles';
import { ParticipacionController } from '../controllers/participacionController';
import { Rol, Sexo, TipoArco } from '../models/Arquero';
import { Medalla } from '../models/Participacion';

const router = Router();

// ==================== RUTAS PÚBLICAS ====================

// Obtener participaciones de un torneo específico
router.get('/torneo/:torneoId',
  param('torneoId').isInt().withMessage('ID de torneo no válido'),
  handleInputErrors,
  ParticipacionController.obtenerParticipacionesPorTorneo
);

// Obtener participaciones de un arquero específico
router.get('/arquero/:arqueroId',
  param('arqueroId').isInt().withMessage('ID de arquero no válido'),
  handleInputErrors,
  ParticipacionController.obtenerParticipacionesPorArquero
);

// Tabla general de la Copa CARPO por año
router.get('/tabla-general/:anio',
  param('anio')
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Año no válido'),
  handleInputErrors,
  ParticipacionController.mostrarTablaGeneral
);

router.get('/tabla-categoria/:anio/:tipoArco',
  param('anio')
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Año no válido'),
  param('tipoArco')
    .isIn(Object.values(TipoArco))
    .withMessage('Tipo de arco no válido'),
  query('sexo')
    .optional()
    .isIn(Object.values(Sexo))
    .withMessage('Sexo no válido'),
  handleInputErrors,
  ParticipacionController.mostrarTablaPorCategoria
);
// ==================== RUTAS PROTEGIDAS (USUARIO LOGUEADO) ====================

// Inscribir arquero a un torneo
router.post('/',
  authenticate,
  body('torneoId')
    .notEmpty().withMessage('El ID del torneo es obligatorio')
    .isInt().withMessage('ID de torneo no válido'),
  
  body('arqueroId')
    .notEmpty().withMessage('El ID del arquero es obligatorio')
    .isInt().withMessage('ID de arquero no válido'),
  
  body('categoriaEspecificaId')
    .notEmpty().withMessage('La categoría específica es obligatoria')
    .isInt().withMessage('ID de categoría no válido'),
  
  body('tipoArco')
    .optional()
    .isString().withMessage('Tipo de arco no válido'),
  
  body('sexo')
    .optional()
    .isString().withMessage('Sexo no válido'),

  handleInputErrors,
  ParticipacionController.inscribirArquero
);

// Desinscribir arquero de un torneo
router.delete('/:torneoId/:arqueroId',
  authenticate,
  param('torneoId').isInt().withMessage('ID de torneo no válido'),
  param('arqueroId').isInt().withMessage('ID de arquero no válido'),
  handleInputErrors,
  ParticipacionController.desinscribirArquero
);

// ==================== RUTAS PROTEGIDAS (SOLO ADMIN) ====================

// Cargar resultados de una participación
router.patch('/:torneoId/resultados',
  authenticate,
  authorize(Rol.ADMIN, Rol.SUPERADMIN),
  param('torneoId').isInt().withMessage('ID de torneo no válido'),
  
  body('puntajeClasificacion')
    .optional()
    .isFloat().withMessage('El puntaje de clasificación debe ser un número'),
  
  body('posicionClasificacion')
    .optional()
    .isInt().withMessage('La posición de clasificación debe ser un número entero'),
  
  body('posicionFinal')
    .optional()
    .isInt().withMessage('La posición final debe ser un número entero'),
  
  body('medalla')
    .optional()
    .isIn(Object.values(Medalla))
    .withMessage('Medalla no válida'),
  
  body('esMejorClasificacion')
    .optional()
    .isBoolean().withMessage('esMejorClasificacion debe ser un booleano'),
  
  body('puntosExtra')
    .optional()
    .isFloat().withMessage('Los puntos extra deben ser un número'),

  handleInputErrors,
  ParticipacionController.cargarResultados
);

export default router;