import { Router } from "express";
import { handleInputErrors } from "../middlewares/validation";
import { body, param } from "express-validator";
import { ArqueroController } from "../controllers/arqueroController";
import { authenticate } from "../middlewares/auth";
import { authorize } from "../middlewares/roles";
import { Rol } from "../models/Arquero";

const router = Router();


// Obtener arqueros

router.get("/", 
  ArqueroController.getAll
);
router.get("/:id", 
  param('id')
    .isInt().withMessage('ID no válido'),
  handleInputErrors,
  ArqueroController.getById);

// registro de arquero
router.post("/register", // Validaciones
  body('nombre')
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ max: 100 }).withMessage('El nombre es demasiado largo'),
    
    body('apellido')
      .notEmpty().withMessage('El apellido es obligatorio')
      .isLength({ max: 100 }).withMessage('El apellido es demasiado largo'),
    
  body('email')
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('Email no válido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  
  body('tipoArco')
    .notEmpty().withMessage('El tipo de arco es obligatorio')
    .isIn(['RECURVO', 'COMPUESTO', 'LONGBOW', 'TRADICIONAL','RASO'])
    .withMessage('Tipo de arco no válido'),
  
  body('lateralidad')
    .notEmpty().withMessage('La lateralidad es obligatoria')
    .isIn(['DIESTRO', 'ZURDO'])
    .withMessage('Lateralidad no válida'),
  
  body('categoriaGeneral')
    .notEmpty().withMessage('La categoría general es obligatoria')
    .isIn(['ESCUELA','SENIOR'])
    .withMessage('Categoría general no válida'),
  
  body('sexo')
    .notEmpty().withMessage('El sexo es obligatorio')
    .isIn(['MASCULINO', 'FEMENINO'])
    .withMessage('Sexo no válido'),

  body('dni')
    .optional()
    .isInt().withMessage('El DNI debe ser un número'),

  body('telefono')
    .optional()
    .isLength({ max: 50 }).withMessage('El teléfono es demasiado largo'),

  body('fechaNacimiento')
    .optional()
    .isISO8601().withMessage('Fecha de nacimiento no válida'),

  // Middleware para manejar errores
  handleInputErrors,
  
  // Controller
  ArqueroController.registrarArquero)

// Actualizar un arquero
router.put('/:id',
  param('id')
    .isInt().withMessage('ID no válido'),
  
  body('nombre')
    .optional()
    .isLength({ max: 100 }).withMessage('El nombre es demasiado largo'),
  
  body('email')
    .optional()
    .isEmail().withMessage('Email no válido')
    .normalizeEmail(),
  
  body('password')
    .optional()
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  
  body('tipoArco')
    .optional()
    .isIn(['RECURVO', 'COMPUESTO', 'LONGBOW', 'TRADICIONAL'])
    .withMessage('Tipo de arco no válido'),
  
  body('lateralidad')
    .optional()
    .isIn(['DIESTRO', 'ZURDO'])
    .withMessage('Lateralidad no válida'),
  
  body('categoriaGeneral')
    .optional()
    .isIn(['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO', 'COMPETICION'])
    .withMessage('Categoría general no válida'),
  
  body('sexo')
    .optional()
    .isIn(['MASCULINO', 'FEMENINO', 'OTRO'])
    .withMessage('Sexo no válido'),

  body('rol')
    .optional()
    .isIn(['USER', 'ADMIN', 'SUPERADMIN'])
    .withMessage('Rol no válido'),

  body('dni')
    .optional()
    .isInt().withMessage('El DNI debe ser un número'),

  body('telefono')
    .optional()
    .isLength({ max: 50 }).withMessage('El teléfono es demasiado largo'),

  body('fechaNacimiento')
    .optional()
    .isISO8601().withMessage('Fecha de nacimiento no válida'),

  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive debe ser un booleano'),

  handleInputErrors,
  ArqueroController.updateArquero
);

// Eliminar un arquero
router.delete('/:id',
  param('id')
    .isInt().withMessage('ID no válido'),
  handleInputErrors,
  ArqueroController.deleteArquero
);


// Login
router.post('/login',
  body('email')
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('Email no válido'),
  
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria'),

  handleInputErrors,
  ArqueroController.login
);

// Logout
router.post('/logout', ArqueroController.logout)

export default router;