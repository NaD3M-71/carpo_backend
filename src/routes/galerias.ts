import { Router } from "express";
import { handleInputErrors } from "../middlewares/validation";
import { body, param } from "express-validator";
import { GaleriaController } from "../controllers/galeriaController";
import { authenticate } from "../middlewares/auth";
import { authorize } from "../middlewares/roles";
import { Rol } from "../models/Arquero";

const router = Router();

router.get('/', GaleriaController.getAll);

router.post('/',
  authenticate,
  authorize(Rol.ADMIN, Rol.SUPERADMIN),
  body('titulo')
    .notEmpty().withMessage('El título es obligatorio')
    .isLength({ max: 150 }).withMessage('El título es demasiado largo'),
  body('descripcion')
    .optional()
    .isLength({ max: 500 }).withMessage('La descripción es demasiado larga'),
  body('link')
    .notEmpty().withMessage('El link es obligatorio')
    .isURL().withMessage('El link debe ser una URL válida'),
  handleInputErrors,
  GaleriaController.create
);

router.put('/:id',
  authenticate,
  authorize(Rol.ADMIN, Rol.SUPERADMIN),
  param('id').isInt().withMessage('ID no válido'),
  body('titulo')
    .optional()
    .isLength({ max: 150 }).withMessage('El título es demasiado largo'),
  body('descripcion')
    .optional()
    .isLength({ max: 500 }).withMessage('La descripción es demasiado larga'),
  body('link')
    .optional()
    .isURL().withMessage('El link debe ser una URL válida'),
  handleInputErrors,
  GaleriaController.update
);

router.delete('/:id',
  authenticate,
  authorize(Rol.ADMIN, Rol.SUPERADMIN),
  param('id').isInt().withMessage('ID no válido'),
  handleInputErrors,
  GaleriaController.delete
);

export default router;
