import { Request, Response } from 'express';
import { Galeria } from '../models/Galeria';

export class GaleriaController {
  static getAll = async (_req: Request, res: Response): Promise<void> => {
    try {
      const galerias = await Galeria.findAll({
        order: [['createdAt', 'DESC']]
      });
      res.status(200).json({ galerias });
    } catch (error) {
      console.error('Error al obtener galerías:', error);
      res.status(500).json({ error: 'Error al obtener galerías' });
    }
  };

  static create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { titulo, descripcion, link } = req.body;
      const galeria = await Galeria.create({ titulo, descripcion, link });
      res.status(201).json({ galeria });
    } catch (error) {
      console.error('Error al crear galería:', error);
      res.status(500).json({ error: 'Error al crear galería' });
    }
  };

  static update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const galeria = await Galeria.findByPk(id);
      if (!galeria) {
        res.status(404).json({ error: 'Galería no encontrada' });
        return;
      }
      await galeria.update(req.body);
      res.status(200).json({ galeria });
    } catch (error) {
      console.error('Error al actualizar galería:', error);
      res.status(500).json({ error: 'Error al actualizar galería' });
    }
  };

  static delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const galeria = await Galeria.findByPk(id);
      if (!galeria) {
        res.status(404).json({ error: 'Galería no encontrada' });
        return;
      }
      await galeria.destroy();
      res.status(200).json({ message: 'Galería eliminada exitosamente' });
    } catch (error) {
      console.error('Error al eliminar galería:', error);
      res.status(500).json({ error: 'Error al eliminar galería' });
    }
  };
}
