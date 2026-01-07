import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { Rol } from '../models/Arquero';

export const authorize = (...rolesPermitidos: Rol[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }
    if (!rolesPermitidos.includes(req.user.rol as Rol)) {
      res.status(403).json({ 
        error: 'No tienes permisos para realizar esta acción' 
      });
      return;
    }

    next();
  };
};