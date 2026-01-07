import {
  Table,
  Column,
  Model,
  DataType,
  Default,
  AllowNull
} from 'sequelize-typescript';

export enum ModalidadTorneo {
  TRES_D = '3D',
  AIRE_LIBRE = 'AIRE_LIBRE',
  MULTI_TARGET = 'MULTI_TARGET',
  SALA = 'SALA',
  CAMPO = 'CAMPO'
}

export enum EstadoTorneo {
  ABIERTO = 'ABIERTO',           
  CERRADO = 'CERRADO'
}

@Table({
  tableName: 'torneos',
  timestamps: true
})
export class Torneo extends Model {
  @Column({
    type: DataType.STRING(150),
    allowNull: false
  })
  declare nombre: string;

  @AllowNull(true)
  @Column({
    type: DataType.TEXT
  })
  declare descripcion: string | null;

  @Column({
    type: DataType.ENUM(...Object.values(ModalidadTorneo)),
    allowNull: false
  })
  declare modalidad: ModalidadTorneo;

  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  declare fechaInicio: Date;

  @AllowNull(true)
  @Column({
    type: DataType.DATE
  })
  declare fechaFin: Date | null;

  @AllowNull(true)
  @Column({
    type: DataType.DATE
  })
  declare fechaLimiteInscripcion: Date | null;

  @AllowNull(true)
  @Column({
    type: DataType.STRING(255)
  })
  declare lugar: string | null;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false
  })
  declare esCopaCARPO: boolean;

  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  declare anio: number;

  @Default(EstadoTorneo.ABIERTO)
  @Column({
    type: DataType.ENUM(...Object.values(EstadoTorneo)),
    allowNull: false
  })
  declare estado: EstadoTorneo;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false
  })
  declare activo: boolean;
}