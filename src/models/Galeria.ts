import {
  Table,
  Column,
  Model,
  DataType,
  AllowNull
} from 'sequelize-typescript';

@Table({
  tableName: 'galerias',
  timestamps: true
})
export class Galeria extends Model {
  @Column({
    type: DataType.STRING(150),
    allowNull: false
  })
  declare titulo: string;

  @AllowNull(true)
  @Column({
    type: DataType.TEXT
  })
  declare descripcion: string | null;

  @Column({
    type: DataType.STRING(500),
    allowNull: false
  })
  declare link: string;
}
