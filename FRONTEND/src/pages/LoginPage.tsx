// src/pages/LoginPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { login } from "../services/authService";

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    contrasena: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("📝 Datos del formulario:", formData);
    
    if (!formData.email || !formData.contrasena) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor ingresa tu correo y contraseña",
        confirmButtonColor: "#004E89"
      });
      return;
    }

    setLoading(true);
    console.log("🔄 Iniciando proceso de login...");

    try {
      const response = await login(formData.email, formData.contrasena);
      console.log("✅ Respuesta del login:", response);
      
      // Verificar que la respuesta tenga los datos correctos
      if (!response || !response.usuario) {
        throw new Error("Respuesta del servidor inválida");
      }

      // Verificar que el usuario tenga nombre (manejar campo mal escrito)
      if (!response.usuario.nombre) {
        console.warn("⚠️ Campo 'nombre' no encontrado, revisando estructura...");
        console.log("Estructura completa:", response);
      }

      // Guardar datos en localStorage
      localStorage.setItem("token", response.token || "authenticated");
      localStorage.setItem("usuario", JSON.stringify(response.usuario));
      
      console.log("💾 Datos guardados en localStorage:");
      console.log("Token:", localStorage.getItem("token"));
      console.log("Usuario:", localStorage.getItem("usuario"));

      // Verificar autenticación
      const isAuth = localStorage.getItem("token") && localStorage.getItem("usuario");
      console.log("🔐 Usuario autenticado:", isAuth);

      // Mensaje de éxito
      await Swal.fire({
        icon: "success",
        title: "¡Bienvenido!",
        text: `Hola ${response.usuario.nombre || 'Administrador'}`,
        timer: 1500,
        showConfirmButton: false
      });

      console.log("🚀 Navegando al dashboard...");
      // Navegar al dashboard
      navigate("/", { replace: true });
      
    } catch (error: any) {
      console.error("❌ Error en login:", error);
      console.error("Mensaje de error:", error.message);
      
      Swal.fire({
        icon: "error",
        title: "Error de autenticación",
        text: error.message || "Credenciales inválidas o no tienes permisos de administrador",
        confirmButtonColor: "#004E89"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id === "password" ? "contrasena" : id]: value
    }));
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-shape shape-1"></div>
        <div className="login-shape shape-2"></div>
        <div className="login-shape shape-3"></div>
      </div>

      <div className="login-card fade-in">
        <div className="login-header">
          <div className="login-logo">
            <span className="login-icon">🚐</span>
          </div>
          <h1 className="login-title">TRANSPORTES DOÑA CHIO</h1>
          <p className="login-subtitle">Sistema de Gestión de Flotas</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-form-group">
            <label className="login-label" htmlFor="email">
              📧 Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              placeholder="admin123@gmail.com"
              value={formData.email}
              onChange={handleChange}
              className="login-input"
              disabled={loading}
              required
            />
          </div>

          <div className="login-form-group">
            <label className="login-label" htmlFor="password">
              🔒 Contraseña
            </label>
            <input
              id="password"
              type="password"
              placeholder="admin123"
              value={formData.contrasena}
              onChange={handleChange}
              className="login-input"
              disabled={loading}
              required
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="login-spinner"></span>
                Verificando...
              </>
            ) : (
              <>
                <span>🚀</span>
                Iniciar Sesión
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p className="login-footer-text">
            <span className="login-shield">🛡️</span>
            Solo usuarios administradores pueden acceder
          </p>
        </div>
      </div>

      <div className="login-credits">
        <p>Sistema de Monitoreo de Flota © 2025</p>
      </div>

      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
          overflow: hidden;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .login-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }

        .login-shape {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
        }

        .shape-1 {
          width: 300px;
          height: 300px;
          top: -100px;
          left: -100px;
        }

        .shape-2 {
          width: 200px;
          height: 200px;
          bottom: -50px;
          right: -50px;
        }

        .shape-3 {
          width: 150px;
          height: 150px;
          top: 50%;
          right: 10%;
        }

        .login-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 2.5rem;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 420px;
          z-index: 2;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .fade-in {
          animation: fadeIn 0.8s ease-in-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .login-logo {
          margin-bottom: 1rem;
        }

        .login-icon {
          font-size: 3rem;
          display: block;
        }

        .login-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2d3748;
          margin: 0.5rem 0;
        }

        .login-subtitle {
          color: #718096;
          font-size: 0.9rem;
          margin: 0;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .login-form-group {
          display: flex;
          flex-direction: column;
        }

        .login-label {
          font-weight: 600;
          color: #4a5568;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .login-input {
          padding: 0.75rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: white;
        }

        .login-input:focus {
          outline: none;
          border-color: #004E89;
          box-shadow: 0 0 0 3px rgba(0, 78, 137, 0.1);
        }

        .login-input:disabled {
          background-color: #f7fafc;
          cursor: not-allowed;
        }

        .login-button {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #004E89, #0066b2);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          height: 50px;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0, 78, 137, 0.3);
        }

        .login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .login-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .login-footer {
          margin-top: 1.5rem;
          text-align: center;
          padding-top: 1.5rem;
          border-top: 1px solid #e2e8f0;
        }

        .login-footer-text {
          color: #718096;
          font-size: 0.8rem;
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .login-shield {
          font-size: 1rem;
        }

        .login-credits {
          position: absolute;
          bottom: 1rem;
          left: 0;
          width: 100%;
          text-align: center;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.8rem;
          z-index: 2;
        }

        @media (max-width: 480px) {
          .login-card {
            margin: 1rem;
            padding: 2rem;
          }
          
          .login-title {
            font-size: 1.3rem;
          }
        }
      `}</style>
    </div>
  );
}