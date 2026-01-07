import { Request, Response } from 'express';
import { Participacion, Medalla } from '../models/Participacion';
import { Arquero } from '../models/Arquero';
import { Torneo, EstadoTorneo } from '../models/Torneo';
import { CategoriaModalidad } from '../models/CategoriaModalidad';
import { AuthRequest } from '../types';

export class ParticipacionController {

  // Inscribir arquero a un torneo
  static inscribirArquero = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { torneoId, arqueroId, categoriaEspecificaId, tipoArco, sexo } = req.body;
      
      // Validar que el torneo existe
      const torneo = await Torneo.findByPk(torneoId);
      if (!torneo) {
        res.status(404).json({ error: 'Torneo no encontrado' });
        return;
      }

      // Validar que el torneo no esté cerrado o cancelado
      if (torneo.estado === EstadoTorneo.CERRADO ) {
        res.status(400).json({ error: 'El torneo está cerrado o cancelado, no se permiten inscripciones' });
        return;
      }

      // Validar que el arquero existe
      const arquero = await Arquero.findByPk(arqueroId);
      if (!arquero) {
        res.status(404).json({ error: 'Arquero no encontrado' });
        return;
      }

      // Validar que la categoría existe
      const categoria = await CategoriaModalidad.findByPk(categoriaEspecificaId);
      if (!categoria) {
        res.status(404).json({ error: 'Categoría no encontrada' });
        return;
      }

      // Validar que la categoría corresponde a la modalidad del torneo
      if (categoria.modalidad !== torneo.modalidad) {
        res.status(400).json({ 
          error: `La categoría no corresponde a la modalidad del torneo (${torneo.modalidad})` 
        });
        return;
      }

      // Verificar si ya está inscrito
      const yaInscrito = await Participacion.findOne({
        where: { arqueroId, torneoId }
      });

      if (yaInscrito) {
        res.status(409).json({ error: 'El arquero ya está inscrito en este torneo' });
        return;
      }

      // Crear la participación
      const participacion = await Participacion.create({
        arqueroId,
        torneoId,
        categoriaEspecificaId,
        tipoArco: tipoArco || arquero.tipoArco, // Usa el del arquero si no se especifica
        sexo: sexo || arquero.sexo // Usa el del arquero si no se especifica
      });

      res.status(201).json({
        message: 'Inscripción exitosa',
        participacion
      });

    } catch (error) {
      console.error('Error al inscribir arquero:', error);
      res.status(500).json({ error: 'Error al inscribir el arquero' });
    }
  };

  // Desinscribir arquero de un torneo
  static desinscribirArquero = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { torneoId, arqueroId } = req.params;

      // Validar que el torneo existe
      const torneo = await Torneo.findByPk(torneoId);
      if (!torneo) {
        res.status(404).json({ error: 'Torneo no encontrado' });
        return;
      }

      // No permitir desinscripción si el torneo ya finalizó o está cancelado
      if (torneo.estado === EstadoTorneo.CERRADO ) {
        res.status(400).json({ error: 'No se puede desinscribir de un torneo finalizado o cancelado' });
        return;
      }

      // Buscar la participación
      const participacion = await Participacion.findOne({
        where: { arqueroId, torneoId }
      });

      if (!participacion) {
        res.status(404).json({ error: 'Participación no encontrada' });
        return;
      }

      // Eliminar la participación
      await participacion.destroy();

      res.status(200).json({
        message: 'Desinscripción exitosa'
      });

    } catch (error) {
      console.error('Error al desinscribir arquero:', error);
      res.status(500).json({ error: 'Error al desinscribir el arquero' });
    }
  };

  // Obtener todas las participaciones de un torneo
  static obtenerParticipacionesPorTorneo = async (req: Request, res: Response): Promise<void> => {
    try {
      const { torneoId } = req.params;

      const participaciones = await Participacion.findAll({
        where: { torneoId },
        include: [
          {
            model: Arquero,
            attributes: ['id', 'nombre', 'apellido', 'tipoArco', 'categoriaGeneral', 'sexo']
          },
          {
            model: CategoriaModalidad,
            as: 'categoriaEspecifica',
            attributes: ['id', 'nombre', 'categoriaGeneral', 'requiereSexo', 'distancia']
          }
        ],
        order: [
          ['categoriaEspecificaId', 'ASC'],
          ['posicionFinal', 'ASC']
        ]
      });

      res.status(200).json({
        total: participaciones.length,
        participaciones
      });

    } catch (error) {
      console.error('Error al obtener participaciones:', error);
      res.status(500).json({ error: 'Error al obtener las participaciones' });
    }
  };

  // Cargar resultados del torneo (solo admins)
  static cargarResultados = async (req: AuthRequest, res: Response): Promise<void> => {
    try {

      const { puntajes } = req.body;
        if (!Array.isArray(puntajes) || puntajes.length === 0) {
        res.status(400).json({ error: 'Se requiere un array de puntajes' });
        return;
      }
      const torneoId = req.params.torneoId;

      const resultados = [];
      
      for (const puntaje of puntajes) {
        const { 
          id,
          puntajeClasificacion, 
          posicionClasificacion, 
          posicionFinal, 
          medalla,
          esMejorClasificacion,
          puntosExtra 
        } = puntaje;
        console.log(puntaje);

        const participacion = await Participacion.findByPk(id);
  
        if (!participacion) {
          res.status(404).json({ error: 'Participación no encontrada' });
          continue;
        }
  
        // Actualizar los datos de resultados
        await participacion.update({
          puntajeClasificacion: puntajeClasificacion ?? participacion.puntajeClasificacion,
          posicionClasificacion: posicionClasificacion ?? participacion.posicionClasificacion,
          posicionFinal: posicionFinal ?? participacion.posicionFinal,
          medalla: medalla ?? participacion.medalla,
          esMejorClasificacion: esMejorClasificacion ?? participacion.esMejorClasificacion,
          puntosExtra: puntosExtra ?? participacion.puntosExtra
        });
  
        // Calcular puntos automáticamente
        await ParticipacionController.calcularPuntosCopa(participacion);
      }
      // const { participacionId } = req.params;


      res.status(200).json({
        message: 'Resultados cargados exitosamente',
        resultados
      });

    } catch (error) {
      console.error('Error al cargar resultados:', error);
      res.status(500).json({ error: 'Error al cargar los resultados' });
    }
  };

  // Calcular puntos de la Copa CARPO automáticamente
  static calcularPuntosCopa = async (participacion: Participacion): Promise<void> => {
    let puntosBase = 1; // 1 punto por participar

    // Sumar puntos por medalla
    if (participacion.medalla === Medalla.ORO) {
      puntosBase += 3;
    } else if (participacion.medalla === Medalla.PLATA) {
      puntosBase += 2;
    } else if (participacion.medalla === Medalla.BRONCE) {
      puntosBase += 1;
    }

    // Sumar punto extra por mejor clasificación
    if (participacion.esMejorClasificacion) {
      puntosBase += 1;
    }

    // Calcular puntos totales (base + extra manual del admin)
    const puntosTotal = puntosBase + (participacion.puntosExtra || 0);

    // Actualizar en la BD
    await participacion.update({
      puntosBase,
      puntosTotal
    });
  };

  // Obtener participaciones de un arquero
  static obtenerParticipacionesPorArquero = async (req: Request, res: Response): Promise<void> => {
    try {
      const { arqueroId } = req.params;

      const participaciones = await Participacion.findAll({
        where: { arqueroId },
        include: [
          {
            model: Torneo,
            attributes: ['id', 'nombre', 'modalidad', 'fechaInicio', 'esCopaCARPO', 'anio']
          },
          {
            model: CategoriaModalidad,
            as: 'categoriaEspecifica',
            attributes: ['id', 'nombre', 'categoriaGeneral']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.status(200).json({
        total: participaciones.length,
        participaciones
      });

    } catch (error) {
      console.error('Error al obtener participaciones del arquero:', error);
      res.status(500).json({ error: 'Error al obtener las participaciones' });
    }
  };
}


// TODO 
// testear el patch
// testear la carga de resultados
// testear las participaciones por torneo
// testear las participaciones por arquero
// testear el calculo de puntos de la copa carpo