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
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  declare arqueroId: number;

  @BelongsTo(() => Arquero)
  declare arquero: Arquero;

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