import { Request, Response } from 'express';
import { Arquero } from '../models/Arquero';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt';

export class ArqueroController {
  //CREATE
  static registrarArquero =async (req: Request, res: Response) => {
  try {
    const { password, ...data } = req.body;

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
      const arqueros = await Arquero.findAll({
        attributes: { exclude: ['password'] },
        order: [['createdAt', 'DESC']]
      });

      res.status(200).json({
        total: arqueros.length,
        arqueros
      });

    } catch (error) {
      console.error('Error al obtener arqueros:', error);
      res.status(500).json({ error: 'Error al obtener los arqueros' });
    }
  };

  static getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const arquero = await Arquero.findByPk(id, {
        attributes: { exclude: ['password'] }
      });

      if (!arquero) {
        res.status(404).json({ error: 'Arquero no encontrado' });
        return;
      }

      res.status(200).json({ arquero });

    } catch (error) {
      console.error('Error al obtener arquero:', error);
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
      if (!arquero.nombre) {
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
      const { password: _, ...arqueroSinPassword } = arquero.toJSON();

      res.status(200).json({
        message: 'Login exitoso',
        token,
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
}




