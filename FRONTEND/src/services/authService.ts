// src/services/authService.ts
import axios from 'axios';

const API_URL = 'https://localhost:7163/api';

export interface User {
  usuarioId: string;
  nombre: string;
  email: string;
  rolId: string;
  rolNombre?: string;
  estado: string;
}

export interface AuthResponse {
  token: string;
  usuario: User;
}

// Función de login principal
export const login = async (email: string, contrasena: string): Promise<AuthResponse> => {
  console.log(`🔐 Intentando login para: ${email}`);
  
  try {
    // Intentar con endpoint específico de login primero
    const credentials = { email, contrasena };
    console.log(`🌐 Intentando con endpoint: ${API_URL}/auth/login`);
    
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    console.log("📡 Respuesta del endpoint auth/login:", response.data);
    
    if (response.data.success && response.data.user) {
      const userData = response.data.user;
      // Transformar la respuesta al formato que espera LoginPage
      const authResponse: AuthResponse = {
        token: response.data.token || 'authenticated',
        usuario: {
          usuarioId: userData.usuarioId || userData.id,
          nombre: userData.nombre || userData.nonbre, // Manejar ambos casos
          email: userData.email,
          rolId: userData.rolId || userData.rolld, // Manejar ambos casos
          rolNombre: userData.rolNombre,
          estado: userData.estado
        }
      };
      
      console.log("✅ Login exitoso con endpoint auth/login");
      return authResponse;
    } else {
      throw new Error(response.data.message || 'Error en el login');
    }
    
  } catch (error: any) {
    console.warn('❌ Error con endpoint auth/login:', error.message);
    console.log('🔄 Intentando método alternativo...');
    
    // Si falla, intentar con método alternativo
    return await loginAlternativo(email, contrasena);
  }
};

// Login alternativo usando el endpoint de usuarios
const loginAlternativo = async (email: string, contrasena: string): Promise<AuthResponse> => {
  try {
    console.log(`🔍 Buscando usuario en la base de datos...`);
    
    // Obtener todos los usuarios
    const response = await axios.get(`${API_URL}/usuarios`);
    console.log(`👥 Usuarios encontrados:`, response.data);
    
    const usuarios = Array.isArray(response.data) ? response.data : [];
    
    // Buscar usuario con email y contraseña coincidente
    const usuario = usuarios.find((u: any) => {
      const emailMatch = u.email === email;
      const passwordMatch = u.contrasena === contrasena;
      console.log(`🔍 Comparando: ${u.email} === ${email} -> ${emailMatch}`);
      console.log(`🔍 Comparando contraseña: ${passwordMatch}`);
      return emailMatch && passwordMatch;
    });
    
    if (!usuario) {
      console.log('❌ No se encontró usuario con esas credenciales');
      throw new Error('Credenciales incorrectas');
    }
    
    console.log('✅ Usuario encontrado:', usuario);
    
    // Verificar que el usuario esté activo
    if (usuario.estado !== 'Activo') {
      throw new Error('Usuario inactivo. Contacta al administrador.');
    }
    
    // Obtener información del rol
    let rolNombre = 'Administrador';
    let rolId = usuario.rolId || usuario.rolld; // Manejar ambos campos
    
    try {
      const rolesResponse = await axios.get(`${API_URL}/roles`);
      const roles = Array.isArray(rolesResponse.data) ? rolesResponse.data : [];
      const rol = roles.find((r: any) => 
        r.rolId === rolId || r.id === rolId || r.rolId === usuario.rolld || r.id === usuario.rolld
      );
      rolNombre = rol?.nombre || 'Administrador';
      console.log(`🎯 Rol del usuario: ${rolNombre}`);
    } catch (error) {
      console.warn('⚠️ No se pudieron obtener los roles, usando valor por defecto');
    }
    
    // Verificar que sea administrador
    const esAdmin = rolNombre.toLowerCase().includes('admin') || 
                   rolId?.toString().toLowerCase().includes('admin') ||
                   usuario.rolId?.toString().includes('1') || // Asumiendo que 1 es admin
                   usuario.rolld?.toString().includes('1');
    
    if (!esAdmin) {
      throw new Error('No tienes permisos de administrador. Solo usuarios administradores pueden acceder.');
    }
    
    // Crear respuesta en el formato esperado - MANEJANDO CAMPOS MAL ESCRITOS
    const authResponse: AuthResponse = {
      token: 'authenticated',
      usuario: {
        usuarioId: usuario.usuarioId || usuario.id,
        nombre: usuario.nombre || usuario.nonbre, // Manejar campo mal escrito
        email: usuario.email,
        rolId: usuario.rolId || usuario.rolld, // Manejar campo mal escrito
        rolNombre: rolNombre,
        estado: usuario.estado
      }
    };
    
    console.log('✅ Login alternativo exitoso');
    console.log('📊 Datos del usuario procesados:', authResponse.usuario);
    return authResponse;
    
  } catch (error: any) {
    console.error('❌ Error en login alternativo:', error);
    throw new Error(error.message || 'Error al iniciar sesión. Verifica tu conexión.');
  }
};

// Resto de las funciones permanecen igual...
export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  localStorage.removeItem('user');
};

export const getCurrentUser = (): User | null => {
  const usuarioStr = localStorage.getItem('usuario');
  if (usuarioStr) {
    try {
      return JSON.parse(usuarioStr);
    } catch (error) {
      console.error('Error parseando usuario:', error);
    }
  }
  
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parseando user:', error);
    }
  }
  
  return null;
};

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  const user = getCurrentUser();
  console.log(`🔍 Verificando autenticación - Token: ${!!token}, Usuario: ${!!user}`);
  return !!token && !!user;
};

export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  const esAdmin = user?.rolNombre?.toLowerCase().includes('admin') || false;
  console.log(`🔍 Verificando admin: ${esAdmin}`);
  return esAdmin;
};