import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  Default,
  AllowNull
} from 'sequelize-typescript';
import { Arquero, TipoArco, Sexo } from './Arquero';
import { Torneo } from './Torneo';
import { CategoriaModalidad } from './CategoriaModalidad';

export enum Medalla {
  ORO = 'ORO',
  PLATA = 'PLATA',
  BRONCE = 'BRONCE'
}

@Table({
  tableName: 'participaciones',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['arqueroId', 'torneoId']
    }
  ]
})
export class Participacion extends Model {
  @ForeignKey(() => Arquero)
  @AllowNull(true)
  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  declare arqueroId: number | null;

  @BelongsTo(() => Arquero)
  declare arquero: Arquero | null;

  @ForeignKey(() => Torneo)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  declare torneoId: number;

  @BelongsTo(() => Torneo)
  declare torneo: Torneo;

  @ForeignKey(() => CategoriaModalidad)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  declare categoriaEspecificaId: number;

  @BelongsTo(() => CategoriaModalidad)
  declare categoriaEspecifica: CategoriaModalidad;

  @Column({
    type: DataType.ENUM(...Object.values(TipoArco)),
    allowNull: false
  })
  declare tipoArco: TipoArco;

  @Column({
    type: DataType.ENUM(...Object.values(Sexo)),
    allowNull: false
  })
  declare sexo: Sexo;

  // Arqueros invitados (no son socios, no tienen fila en `arqueros`):
  // se guardan directo acá para no duplicar arqueros externos entre torneos.
  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false
  })
  declare esInvitado: boolean;

  @AllowNull(true)
  @Column({
    type: DataType.STRING(100)
  })
  declare invitadoNombre: string | null;

  @AllowNull(true)
  @Column({
    type: DataType.STRING(100)
  })
  declare invitadoApellido: string | null;

  // Datos de clasificación
  @AllowNull(true)
  @Column({
    type: DataType.FLOAT
  })
  declare puntajeClasificacion: number | null;

  @AllowNull(true)
  @Column({
    type: DataType.INTEGER
  })
  declare posicionClasificacion: number | null;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false
  })
  declare esMejorClasificacion: boolean;

  // Resultado final
  @AllowNull(true)
  @Column({
    type: DataType.INTEGER
  })
  declare posicionFinal: number | null;

  @AllowNull(true)
  @Column({
    type: DataType.ENUM(...Object.values(Medalla))
  })
  declare medalla: Medalla | null;

  // Sistema de puntos para Copa CARPO
  @Default(0)
  @Column({
    type: DataType.FLOAT,
    allowNull: false
  })
  declare puntosBase: number;

  @Default(0)
  @Column({
    type: DataType.FLOAT,
    allowNull: false
  })
  declare puntosExtra: number;

  @Default(0)
  @Column({
    type: DataType.FLOAT,
    allowNull: false
  })
  declare puntosTotal: number;
}