import { Request, Response } from 'express';
import { Arquero } from '../models/Arquero';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { Op } from 'sequelize';
import { generateToken } from '../utils/jwt';
import { sendResetPasswordMail } from '../utils/sendResetPasswordMail';
import { AuthRequest } from '../types';
import { sanitizeBioHtml } from '../utils/sanitizeBio';

// Campos "de arquería" seguros para mostrar públicamente, sin datos personales
// (nada de dni, email, telefono, direccion, fechaNacimiento, cuotas, etc.)
const CAMPOS_PUBLICOS_DETALLE = [
  'id',
  'nombre',
  'apellido',
  'tipoArco',
  'lateralidad',
  'categoriaGeneral',
  'sexo',
  'edadCategoria',
  'bio',
  'fotoUrl'
] as const;

const LIMITE_LISTADO = 25;

export class ArqueroController {
  //CREATE
  static registrarArquero =async (req: Request, res: Response) => {
  try {
    const { password, ...data } = req.body;

    if (data.bio !== undefined) {
      data.bio = sanitizeBioHtml(data.bio);
    }

    // Verificar si el email ya existe
    const emailExiste = await Arquero.findOne({ where: { email: data.email } });
    if (emailExiste) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    // Verificar si el DNI ya existe (si se proporcionó)
    if (data.dni) {
      const dniExiste = await Arquero.findOne({ where: { dni: data.dni } });
      if (dniExiste) {
        return res.status(409).json({ error: 'El DNI ya está registrado' });
      }
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el arquero
    const nuevoArquero = await Arquero.create({
      ...data,
      password: hashedPassword
    });

    // Responder sin enviar la contraseña
    const { password: _, ...arqueroSinPassword } = nuevoArquero.toJSON();

    res.status(201).json({
      message: 'Arquero registrado exitosamente',
      arquero: arqueroSinPassword
    });

  } catch (error) {
    console.error('Error al registrar arquero:', error);
    res.status(500).json({ error: 'Error al registrar el arquero' });
  }
  };

  //READ
  static getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const search = (req.query.search as string || '').trim();

      const where = search
        ? {
            [Op.and]: [
              { isActive: true },
              {
                [Op.or]: [
                  { nombre: { [Op.like]: `%${search}%` } },
                  { apellido: { [Op.like]: `%${search}%` } }
                ]
              }
            ]
          }
        : { isActive: true };

      const { rows: arqueros, count: total } = await Arquero.findAndCountAll({
        where,
        attributes: ['id', 'nombre', 'apellido'],
        order: [['apellido', 'ASC'], ['nombre', 'ASC']],
        limit: LIMITE_LISTADO,
        offset: (page - 1) * LIMITE_LISTADO
      });

      res.status(200).json({
        total,
        page,
        totalPages: Math.max(1, Math.ceil(total / LIMITE_LISTADO)),
        arqueros
      });

    } catch (error) {
      console.error('Error al obtener arqueros:', error);
      res.status(500).json({ error: 'Error al obtener los arqueros' });
    }
  };

  // Vista pública de un arquero: solo datos de arquería y bio, nunca datos
  // personales. Es la misma para cualquiera que la consulte, esté o no logueado.
  static getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const arquero = await Arquero.findByPk(id, {
        attributes: [...CAMPOS_PUBLICOS_DETALLE, 'isActive']
      });

      if (!arquero || !arquero.isActive) {
        res.status(404).json({ error: 'Arquero no encontrado' });
        return;
      }

      const datosCompletos = arquero.toJSON() as Record<string, unknown>;
      const arqueroPublico: Record<string, unknown> = {};
      for (const campo of CAMPOS_PUBLICOS_DETALLE) {
        arqueroPublico[campo] = datosCompletos[campo];
      }

      res.status(200).json({ arquero: arqueroPublico });

    } catch (error) {
      console.error('Error al obtener arquero:', error);
      res.status(500).json({ error: 'Error al obtener el arquero' });
    }
  };

  // Vista completa de un arquero, solo para ADMIN/SUPERADMIN (botón
  // "Ver información completa" en el frontend). No filtra por isActive:
  // el admin también necesita ver socios dados de baja.
  static getByIdCompleto = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const arquero = await Arquero.findByPk(id, {
        attributes: { exclude: ['password', 'token', 'tokenExpiration'] }
      });

      if (!arquero) {
        res.status(404).json({ error: 'Arquero no encontrado' });
        return;
      }

      res.status(200).json({ arquero });

    } catch (error) {
      console.error('Error al obtener el detalle completo del arquero:', error);
      res.status(500).json({ error: 'Error al obtener el arquero' });
    }
  };

  // UPDATE
  static updateArquero = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { password, email, dni, ...data } = req.body;

    const arquero = await Arquero.findByPk(id);

    if (!arquero) {
      res.status(404).json({ error: 'Arquero no encontrado' });
      return;
    }

    // Verificar si el email ya existe en otro usuario
    if (email && email !== arquero.email) {
      const emailExiste = await Arquero.findOne({ 
        where: { email } 
      });
      if (emailExiste && emailExiste.id !== arquero.id) {
        res.status(409).json({ error: 'El email ya está registrado' });
        return;
      }
    }

    // Verificar si el DNI ya existe en otro usuario
    if (dni && dni !== arquero.dni) {
      const dniExiste = await Arquero.findOne({ 
        where: { dni } 
      });
      if (dniExiste && dniExiste.id !== arquero.id) {
        res.status(409).json({ error: 'El DNI ya está registrado' });
        return;
      }
    }

    // Preparar datos para actualizar
    const datosActualizados: any = { ...data };

    if (datosActualizados.bio !== undefined) {
      datosActualizados.bio = sanitizeBioHtml(datosActualizados.bio);
    }

    if (email) datosActualizados.email = email;
    if (dni) datosActualizados.dni = dni;

    // Si se proporciona una nueva contraseña, hashearla
    if (password) {
      datosActualizados.password = await bcrypt.hash(password, 10);
    }

    // Actualizar el arquero
    await arquero.update(datosActualizados);

    // Responder sin enviar la contraseña
    const { password: _, ...arqueroSinPassword } = arquero.toJSON();

    res.status(200).json({
      message: 'Arquero actualizado exitosamente',
      arquero: arqueroSinPassword
    });

  } catch (error) {
    console.error('Error al actualizar arquero:', error);
    res.status(500).json({ error: 'Error al actualizar el arquero' });
  }
};

  // DELETE
  static deleteArquero = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const arquero = await Arquero.findByPk(id);

      if (!arquero) {
        res.status(404).json({ error: 'Arquero no encontrado' });
        return;
      }

      await arquero.destroy();

      res.status(200).json({
        message: 'Arquero eliminado exitosamente'
      });

    } catch (error) {
      console.error('Error al eliminar arquero:', error);
      res.status(500).json({ error: 'Error al eliminar el arquero' });
    }
  };

  // Login
  static login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Buscar el arquero por email
      const arquero = await Arquero.findOne({ where: { email } });

      if (!arquero) {
        res.status(401).json({ error: 'Credenciales inválidas' });
        return;
      }

      // Verificar si el arquero está activo
      if (!arquero.isActive) {
        res.status(403).json({ error: 'Cuenta desactivada. Contacta al administrador' });
        return;
      }

      // Verificar la contraseña
      const passwordValida = await bcrypt.compare(password, arquero.password);

      if (!passwordValida) {
        res.status(401).json({ error: 'Credenciales inválidas' });
        return;
      }

      // Generar token JWT
      const token = generateToken({
        id: arquero.id,
        email: arquero.email,
        rol: arquero.rol
      });

      // Responder con el token y datos del usuario (sin password)

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 3 // 3 días
      });

      res.status(200).json({
        message: 'Login exitoso',
        //arquero: arqueroSinPassword
         usuario: {
          id: arquero.id,
          nombre: arquero.nombre,
          email: arquero.email,
          rol: arquero.rol
        }
      });

    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ error: 'Error al iniciar sesión' });
    }
  };

  // Usuario autenticado
static me = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    const arquero = await Arquero.findByPk(req.user.id);

    if (!arquero) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.status(200).json({
      id: arquero.id,
      nombre: arquero.nombre,
      apellido: arquero.apellido,
      email: arquero.email,
      rol: arquero.rol,
      tipoArco: arquero.tipoArco,
      lateralidad: arquero.lateralidad,
      categoriaGeneral: arquero.categoriaGeneral,
      sexo: arquero.sexo,
      bio: arquero.bio,
      telefono: arquero.telefono,
      direccion: arquero.direccion,
      fechaNacimiento: arquero.fechaNacimiento
    });

  } catch (error) {
    console.error('Error en /me:', error);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
};

  // Actualizar el propio perfil (usuario autenticado)
  static updateMe = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const arquero = await Arquero.findByPk(req.user.id);

      if (!arquero) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      // Solo se permite editar datos personales, de contacto y de perfil de arquero.
      // email, dni, password, rol, isActive y las cuotas se administran por otras vías.
      const camposPermitidos = [
        'nombre',
        'apellido',
        'bio',
        'tipoArco',
        'lateralidad',
        'categoriaGeneral',
        'sexo',
        'telefono',
        'direccion',
        'fechaNacimiento'
      ] as const;

      const datosActualizados: Partial<Record<typeof camposPermitidos[number], unknown>> = {};
      for (const campo of camposPermitidos) {
        if (req.body[campo] !== undefined) {
          datosActualizados[campo] = req.body[campo];
        }
      }

      if (datosActualizados.bio !== undefined) {
        datosActualizados.bio = sanitizeBioHtml(datosActualizados.bio);
      }

      await arquero.update(datosActualizados);

      const { password: _, token: __, tokenExpiration: ___, ...arqueroSinDatosSensibles } = arquero.toJSON();

      res.status(200).json({
        message: 'Perfil actualizado exitosamente',
        arquero: arqueroSinDatosSensibles
      });

    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      res.status(500).json({ error: 'Error al actualizar el perfil' });
    }
  };

  // Logout
  static logout = async (_req: Request, res: Response): Promise<void> => {
    try {
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })

      res.status(200).json({
        message: 'Logout exitoso'
      })
    } catch (error) {
      console.error('Error en logout:', error)
      res.status(500).json({ error: 'Error al cerrar sesión' })
    }
  }

  // recuperar contraseña
  static recuperarPassword = async (req: Request, res: Response)=>{
    try {
      const { email } = req.body as { email?: string };
      if (!email) {
        return res.status(400).json({ message: 'Email requerido' });
      }

      const arquero = await Arquero.findOne({ where: {email}});
      if (!arquero) {
        return res.status(200).json({ message: `Si el email "${email}" existe, recibiras las instrucciones por ese medio para recuperar tu contraseña` });
      }

      // generar token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      // expiracion del token
      const tokenExpiration = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

      // guardar token en la bd
      arquero.token = hashedToken;
      arquero.tokenExpiration = tokenExpiration;
      await arquero.save();

      // link de recuperacion
      const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

      try {
        await sendResetPasswordMail({
          to: arquero.email,
          resetLink,
        });
      } catch (mailError) {
        console.error('Error enviando mail:', mailError);
        // opcional: limpiar token si falla el mail
        arquero.token = null;
        arquero.tokenExpiration = null;
        await arquero.save();
      }

      res.status(200).json({ message: `Si el email "${email}" existe, recibiras las instrucciones por ese medio para recuperar tu contraseña` });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // restablecer contraseña
  static restablecerPassword = async (req: Request, res: Response)=>{
    try {
      const { token } = req.params as { token?: string };
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
      const { newPassword} = req.body as {  newPassword?: string };
      if (!token || !newPassword) {
        return res.status(400).json({ message: 'Token y nueva contraseña son requeridos' });
      }

      const arquero = await Arquero.findOne({
        where: {
          token: hashedToken,
          tokenExpiration: { [Op.gt]: new Date() }
        }
      });
      if (!arquero) {
        return res.status(400).json({ message: 'Token inválsido o expirado' });
      }

      arquero.password = await bcrypt.hash(newPassword, 10);
      arquero.token = null;
      arquero.tokenExpiration = null;
      await arquero.save();
      res.status(200).json({ message: 'Contraseña restablecida exitosamente' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

}  




