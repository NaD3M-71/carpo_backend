import { Router } from "express";
import { handleInputErrors } from "../middlewares/validation";
import { body, param } from "express-validator";
import { ArqueroController } from "../controllers/arqueroController";
import { authenticate } from "../middlewares/auth";
import { authorize } from "../middlewares/roles";
import { Rol } from "../models/Arquero";
import { TorneoController } from "../controllers/torneoController";
import { ModalidadTorneo } from "../models/Torneo";

const router = Router();

// READ
router.get('/', 
  TorneoController.getAllTorneos
);
router.get('/:id',
  param('id').isInt().withMessage('ID no válido'),
  handleInputErrors,
  TorneoController.getTorneoById
);
router.get('/anio/:anio',
  param('anio')
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Año no válido'),
  handleInputErrors,
  TorneoController.getTorneosByAnio
);
router.get('/copa-carpo/:anio',
  param('anio')
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Año no válido'),
  handleInputErrors,
  TorneoController.getTorneosCopaCARPO
);

// crear torneo
router.post("/create",
  authenticate,
  authorize(Rol.SUPERADMIN, Rol.ADMIN),
  body('nombre').
    notEmpty().withMessage("El nombre del torneo es obligatorio")
    .isLength({max: 100}).withMessage("El nombre del torneo es demasiado largo"),
  body('modalidad')
  .notEmpty().withMessage("La modalidad del torneo es obligatoria")
  .isIn(['3D',"SALA","CAMPO","MULTITARGET","AIRE_LIBRE"]).withMessage("Modalidad no válida"),
  body('fechaInicio')
    .notEmpty().withMessage("La fecha de inicio es obligatoria")
    .isISO8601().toDate().withMessage("Fecha de inicio no válida"),
  body('lugar').
    notEmpty().withMessage("El lugar del torneo es obligatorio")
    .isLength({max: 100}).withMessage("El lugar del torneo es demasiado largo"),
    body('anio').
      notEmpty().withMessage("El año del torneo es obligatorio")
      .isInt().withMessage("El año del torneo no es válido"),
    handleInputErrors,
    TorneoController.crearTorneo  
)

// UPDATE
router.put('/:id',
  authenticate,
  authorize(Rol.ADMIN, Rol.SUPERADMIN),
  param('id').isInt().withMessage('ID no válido'),
  
  body('nombre')
    .optional()
    .isLength({ max: 150 }).withMessage('El nombre es demasiado largo'),
  
  body('modalidad')
    .optional()
    .isIn(Object.values(ModalidadTorneo))
    .withMessage('Modalidad no válida'),
  
  body('fechaInicio')
    .optional()
    .isISO8601().withMessage('Fecha de inicio no válida'),
  
  body('fechaFin')
    .optional()
    .isISO8601().withMessage('Fecha de fin no válida'),
  
  body('fechaLimiteInscripcion')
    .optional()
    .isISO8601().withMessage('Fecha límite de inscripción no válida'),
  
  body('esCopaCARPO')
    .optional()
    .isBoolean().withMessage('esCopaCARPO debe ser un booleano'),
  
  body('anio')
    .optional()
    .isInt({ min: 2000, max: 2100 }).withMessage('Año no válido'),
  
  body('activo')
    .optional()
    .isBoolean().withMessage('activo debe ser un booleano'),

  handleInputErrors,
  TorneoController.updateTorneo
);

// DELETE
router.delete('/:id',
  authenticate,
  authorize(Rol.ADMIN, Rol.SUPERADMIN),
  param('id').isInt().withMessage('ID no válido'),
  handleInputErrors,
  TorneoController.deleteTorneo
);



export default router;