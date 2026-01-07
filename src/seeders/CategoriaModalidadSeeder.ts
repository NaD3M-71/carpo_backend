import { CategoriaModalidad } from '../models/CategoriaModalidad';
import { ModalidadTorneo } from '../models/Torneo';
import { CategoriaGeneral } from '../models/Arquero';

interface CategoriaData {
  modalidad: ModalidadTorneo;
  nombre: string;
  categoriaGeneral: CategoriaGeneral;
  requiereSexo: boolean;
  distancia?: number;
  descripcion?: string;
  edadMinima?: number;
  edadMaxima?: number;
}

const categoriasIniciales: CategoriaData[] = [
  // ==================== 3D ====================
  {
    modalidad: ModalidadTorneo.TRES_D,
    nombre: 'ESCUELA',
    categoriaGeneral: CategoriaGeneral.ESCUELA,
    requiereSexo: false,
    descripcion: 'Categoría escuela para tiro 3D'
  },
  {
    modalidad: ModalidadTorneo.TRES_D,
    nombre: 'SENIOR',
    categoriaGeneral: CategoriaGeneral.SENIOR,
    requiereSexo: true,
    descripcion: 'Categoría senior para tiro 3D'
  },
  
  // ==================== CAMPO ====================
  {
    modalidad: ModalidadTorneo.CAMPO,
    nombre: 'ESCUELA_INICIAL',
    categoriaGeneral: CategoriaGeneral.ESCUELA,
    requiereSexo: false,
    descripcion: 'Categoría escuela inicial para tiro de campo'
  },
  {
    modalidad: ModalidadTorneo.CAMPO,
    nombre: 'ESCUELA_AVANZADA',
    categoriaGeneral: CategoriaGeneral.ESCUELA,
    requiereSexo: false,
    descripcion: 'Categoría escuela avanzada para tiro de campo'
  },
  {
    modalidad: ModalidadTorneo.CAMPO,
    nombre: 'SENIOR',
    categoriaGeneral: CategoriaGeneral.SENIOR,
    requiereSexo: true,
    descripcion: 'Categoría senior para tiro de campo'
  },

  // ==================== SALA ====================
  {
    modalidad: ModalidadTorneo.SALA,
    nombre: 'ESCUELA_80',
    categoriaGeneral: CategoriaGeneral.ESCUELA,
    requiereSexo: false,
    distancia: 18,
    descripcion: 'Categoría escuela 80cm para tiro en sala'
  },
  {
    modalidad: ModalidadTorneo.SALA,
    nombre: 'ESCUELA_60',
    categoriaGeneral: CategoriaGeneral.ESCUELA,
    requiereSexo: false,
    distancia: 18,
    descripcion: 'Categoría escuela 60cm para tiro en sala'
  },
  {
    modalidad: ModalidadTorneo.SALA,
    nombre: 'ESCUELA_40',
    categoriaGeneral: CategoriaGeneral.ESCUELA,
    requiereSexo: false,
    distancia: 18,
    descripcion: 'Categoría escuela 40cm para tiro en sala'
  },
  {
    modalidad: ModalidadTorneo.SALA,
    nombre: 'SENIOR',
    categoriaGeneral: CategoriaGeneral.SENIOR,
    requiereSexo: true,
    distancia: 18,
    descripcion: 'Categoría senior para tiro en sala'
  },

  // ==================== AIRE LIBRE ====================
  {
    modalidad: ModalidadTorneo.AIRE_LIBRE,
    nombre: 'ESCUELA_20',
    categoriaGeneral: CategoriaGeneral.ESCUELA,
    requiereSexo: false,
    distancia: 20,
    descripcion: 'Categoría escuela 20m para tiro al aire libre'
  },
  {
    modalidad: ModalidadTorneo.AIRE_LIBRE,
    nombre: 'ESCUELA_30',
    categoriaGeneral: CategoriaGeneral.ESCUELA,
    requiereSexo: false,
    distancia: 30,
    descripcion: 'Categoría escuela 30m para tiro al aire libre'
  },
  {
    modalidad: ModalidadTorneo.AIRE_LIBRE,
    nombre: 'ESCUELA_40',
    categoriaGeneral: CategoriaGeneral.ESCUELA,
    requiereSexo: false,
    distancia: 40,
    descripcion: 'Categoría escuela 40m para tiro al aire libre'
  },
  {
    modalidad: ModalidadTorneo.AIRE_LIBRE,
    nombre: 'ESCUELA_50',
    categoriaGeneral: CategoriaGeneral.ESCUELA,
    requiereSexo: false,
    distancia: 50,
    descripcion: 'Categoría escuela 50m para tiro al aire libre'
  },
  {
    modalidad: ModalidadTorneo.AIRE_LIBRE,
    nombre: 'ESCUELA_60',
    categoriaGeneral: CategoriaGeneral.ESCUELA,
    requiereSexo: false,
    distancia: 60,
    descripcion: 'Categoría escuela 60m para tiro al aire libre'
  },
  {
    modalidad: ModalidadTorneo.AIRE_LIBRE,
    nombre: 'SENIOR',
    categoriaGeneral: CategoriaGeneral.SENIOR,
    requiereSexo: true,
    descripcion: 'Categoría SENIOR para tiro al aire libre'
  },

  // ==================== MULTI TARGET ====================
  {
    modalidad: ModalidadTorneo.MULTI_TARGET,
    nombre: 'ESCUELA',
    categoriaGeneral: CategoriaGeneral.ESCUELA,
    requiereSexo: false,
    descripcion: 'Categoría escuela para tiro Multi Target'
  },
  {
    modalidad: ModalidadTorneo.MULTI_TARGET,
    nombre: 'SENIOR',
    categoriaGeneral: CategoriaGeneral.SENIOR,
    requiereSexo: true,
    descripcion: 'Categoría senior para tiro Multi Target'
  }
];

export const sembrarCategorias = async (): Promise<void> => {
  try {
    console.log('Iniciando seed de categorías modalidades...');
    
    for (const categoria of categoriasIniciales) {
      const [categoriaCreada, created] = await CategoriaModalidad.findOrCreate({
        where: { 
          modalidad: categoria.modalidad,
          nombre: categoria.nombre
        },
        defaults: categoria as any  // ← Cast a any para evitar el error de tipado // crear un type??
      });

      // if (created) {
      //   console.log(`✓ Categoría creada: ${categoria.modalidad} - ${categoria.nombre}`);
      // } else {
      //   console.log(`- Categoría ya existe: ${categoria.modalidad} - ${categoria.nombre}`);
      // }
    }
    
    console.log('Seed de categorías completado exitosamente');
  } catch (error) {
    console.error('Error al sembrar categorías:', error);
    throw error;
  }
};