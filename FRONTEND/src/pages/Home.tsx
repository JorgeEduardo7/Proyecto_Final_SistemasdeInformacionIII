export default function Home() {
  return (
    <div className="dashboard-welcome fade-in">
      <h2>Bienvenido al Sistema de Gestión de Flotas</h2>
      <p>
        Administra tu flota de transporte de manera eficiente. 
        Selecciona un módulo del menú lateral para comenzar.
      </p>
      
      <div className="welcome-features">
        <div className="feature-card">
          <h3 style={{fontSize: '2rem', marginBottom: '0.5rem'}}>👥</h3>
          <h4 style={{fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem'}}>Usuarios</h4>
          <p style={{fontSize: '0.875rem', margin: 0}}>Gestiona usuarios y permisos</p>
        </div>
        
        <div className="feature-card">
          <h3 style={{fontSize: '2rem', marginBottom: '0.5rem'}}>🚐</h3>
          <h4 style={{fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem'}}>Unidades</h4>
          <p style={{fontSize: '0.875rem', margin: 0}}>Control de vehículos</p>
        </div>
        
        <div className="feature-card">
          <h3 style={{fontSize: '2rem', marginBottom: '0.5rem'}}>🗺️</h3>
          <h4 style={{fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem'}}>Rutas</h4>
          <p style={{fontSize: '0.875rem', margin: 0}}>Optimiza tus rutas</p>
        </div>
      </div>
    </div>
  );
}