import { Request, Response } from 'express';
import { Arquero } from '../models/Arquero';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt';
import { Torneo } from '../models/Torneo';
import { CategoriaModalidad } from '../models/CategoriaModalidad';

export class TorneoController {

  // CREATE
  static crearTorneo = async (req:Request, res:Response)=>{
    try {
      const data = req.body;
      const nuevoTorneo = await Torneo.create(data);

      res.status(201).json({
        message: 'Torneo creado exitosamente',
        torneo: nuevoTorneo
      });
    } catch (error) {
      console.log(error);
    }
  }

  // READ
  static getAllTorneos = async (req: Request, res: Response): Promise<void> => {
    try {
      const torneos = await Torneo.findAll({
        where: { activo: true },
        order: [['fechaInicio', 'DESC']]
      });

      res.status(200).json({
        total: torneos.length,
        torneos
      });

    } catch (error) {
      console.error('Error al obtener torneos:', error);
      res.status(500).json({ error: 'Error al obtener los torneos' });
    }
  };

  // obtener torneo por id
  static getTorneoById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const torneo = await Torneo.findByPk(id);

      if (!torneo) {
        res.status(404).json({ error: 'Torneo no encontrado' });
        return;
      }

      res.status(200).json({ torneo });

    } catch (error) {
      console.error('Error al obtener torneo:', error);
      res.status(500).json({ error: 'Error al obtener el torneo' });
    }
  };

  // obtener los torneos de un año específico
   static getTorneosByAnio = async (req: Request, res: Response): Promise<void> => {
    try {
      const { anio } = req.params;

      const torneos = await Torneo.findAll({
        where: { 
          anio: parseInt(anio),
          activo: true 
        },
        order: [['fechaInicio', 'ASC']]
      });

      res.status(200).json({
        anio: parseInt(anio),
        total: torneos.length,
        torneos
      });

    } catch (error) {
      console.error('Error al obtener torneos por año:', error);
      res.status(500).json({ error: 'Error al obtener los torneos' });
    }
  };

  // Obtener torneos que son Copa CARPO en un año específico
  static getTorneosCopaCARPO = async (req: Request, res: Response): Promise<void> => {
    try {
      const { anio } = req.params;

      const torneos = await Torneo.findAll({
        where: { 
          esCopaCARPO: true,
          anio: parseInt(anio),
          activo: true 
        },
        order: [['fechaInicio', 'ASC']]
      });

      res.status(200).json({
        anio: parseInt(anio),
        copa: 'Copa CARPO',
        total: torneos.length,
        torneos
      });

    } catch (error) {
      console.error('Error al obtener torneos Copa CARPO:', error);
      res.status(500).json({ error: 'Error al obtener los torneos de la Copa CARPO' });
    }
  };

  // UPDATE
  static updateTorneo = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const torneo = await Torneo.findByPk(id);

      if (!torneo) {
        res.status(404).json({ error: 'Torneo no encontrado' });
        return;
      }

      await torneo.update(req.body);

      res.status(200).json({
        message: 'Torneo actualizado exitosamente',
        torneo
      });

    } catch (error) {
      console.error('Error al actualizar torneo:', error);
      res.status(500).json({ error: 'Error al actualizar el torneo' });
    }
  };

  // DELETE
  static deleteTorneo = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const torneo = await Torneo.findByPk(id);

      if (!torneo) {
        res.status(404).json({ error: 'Torneo no encontrado' });
        return;
      }

      // Soft delete: marcar como inactivo
      await torneo.update({ activo: false });

      res.status(200).json({
        message: 'Torneo eliminado exitosamente'
      });

    } catch (error) {
      console.error('Error al eliminar torneo:', error);
      res.status(500).json({ error: 'Error al eliminar el torneo' });
    }
  };

  static getCategoriasEspecificasTorneo = async (req: Request, res: Response): Promise<void> => {
    try {
      const { modalidad } = req.params;

      // Lógica para obtener las categorías específicas según la modalidad
      const categoriasEspecificas = await CategoriaModalidad.findAll({
        where: { modalidad }
      });
      res.status(200).json({ categoriasEspecificas });
    } catch (error) {
      console.error('Error al obtener categorías específicas:', error);
      res.status(500).json({ error: 'Error al obtener las categorías específicas' });
    }
  }
}