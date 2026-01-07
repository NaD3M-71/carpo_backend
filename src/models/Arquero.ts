import {
  Table,
  Column,
  Model,
  DataType,
  AllowNull,
  Default,
  Unique
} from 'sequelize-typescript';

// Enums para los tipos de datos especiales
export enum TipoArco {
  RECURVO = 'RECURVO',
  COMPUESTO = 'COMPUESTO',
  LONGBOW = 'LONGBOW',
  TRADICIONAL = 'TRADICIONAL',
  RASO = 'RASO'
}

export enum Lateralidad {
  DIESTRO = 'DIESTRO',
  ZURDO = 'ZURDO'
}

export enum CategoriaGeneral {
  ESCUELA = 'ESCUELA',
  SENIOR = 'SENIOR'
}

export enum Sexo {
  MASCULINO = 'MASCULINO',
  FEMENINO = 'FEMENINO',
  OTRO = 'OTRO'
}

export enum EdadCategoria {
  INFANTIL = 'INFANTIL',
  SUB15 = 'SUB15',
  SUB18 = 'SUB18',
  SUB21 = 'SUB21',
  SENIOR = 'SENIOR',
}

export enum Rol {
  ADMIN = 'ADMIN',
  SUPERADMIN = 'SUPERADMIN',
  USER = 'USER'
}

@Table({
  tableName: 'arqueros',
  timestamps: true
})
export class Arquero extends Model {
  @Column({
    type: DataType.STRING(100),
    allowNull: false
  })
  declare nombre: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false
  })
  declare apellido: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  declare dni: number;

  @Unique
  @Column({
    type: DataType.STRING(255),
    allowNull: false
  })
  declare email: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false
  })
  declare password: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false
  })
  declare telefono: string | null;

  @AllowNull(true)
  @Column({
    type: DataType.STRING(255)
  })
  declare direccion: string | null;

  @AllowNull(true)
  @Column({
    type: DataType.DATEONLY
  })
  declare fechaNacimiento: Date | null;

  @Column({
    type: DataType.ENUM(...Object.values(TipoArco)),
    allowNull: false
  })
  declare tipoArco: TipoArco;

  @Column({
    type: DataType.ENUM(...Object.values(Lateralidad)),
    allowNull: false
  })
  declare lateralidad: Lateralidad;

  @Column({
    type: DataType.ENUM(...Object.values(CategoriaGeneral)),
    allowNull: false
  })
  declare categoriaGeneral: CategoriaGeneral;

  @Column({
    type: DataType.ENUM(...Object.values(Sexo)),
    allowNull: false
  })
  declare sexo: Sexo;

  @AllowNull(true)
  @Column({
    type: DataType.ENUM(...Object.values(EdadCategoria))
  })
  declare edadCategoria: EdadCategoria | null;

  @AllowNull(true)
  @Column({
    type: DataType.DATEONLY
  })
  declare ultimaCuotaFecha: Date | null;

  @AllowNull(true)
  @Column({
    type: DataType.DECIMAL(10, 2)
  })
  declare ultimaCuotaMonto: number | null;

  @AllowNull(true)
  @Column({
    type: DataType.STRING(500)
  })
  declare fotoUrl: string | null;

  @AllowNull(true)
  @Column({
    type: DataType.TEXT
  })
  declare bio: string | null;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false
  })
  declare isActive: boolean;

  @Default(Rol.USER)
  @Column({
    type: DataType.ENUM(...Object.values(Rol)),
    allowNull: false
  })
  declare rol: Rol;
}