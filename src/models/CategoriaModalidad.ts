import {
  Table,
  Column,
  Model,
  DataType,
  Default,
  AllowNull
} from 'sequelize-typescript';
import { ModalidadTorneo } from './Torneo';
import { CategoriaGeneral } from './Arquero';

@Table({
  tableName: 'categorias_modalidades',
  timestamps: true
})
export class CategoriaModalidad extends Model {
  @Column({
    type: DataType.ENUM(...Object.values(ModalidadTorneo)),
    allowNull: false
  })
  declare modalidad: ModalidadTorneo;

  @Column({
    type: DataType.STRING(100),
    allowNull: false
  })
  declare nombre: string;

  // Nueva columna: para mapear a ESCUELA o SENIOR en el ranking anual
  @Column({
    type: DataType.ENUM(...Object.values(CategoriaGeneral)),
    allowNull: false
  })
  declare categoriaGeneral: CategoriaGeneral;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false
  })
  declare requiereSexo: boolean;

  @AllowNull(true)
  @Column({
    type: DataType.INTEGER
  })
  declare distancia: number | null;

  @AllowNull(true)
  @Column({
    type: DataType.STRING(255)
  })
  declare descripcion: string | null;

  @AllowNull(true)
  @Column({
    type: DataType.INTEGER
  })
  declare edadMinima: number | null;

  @AllowNull(true)
  @Column({
    type: DataType.INTEGER
  })
  declare edadMaxima: number | null;
}