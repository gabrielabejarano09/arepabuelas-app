import { useEffect, useState } from 'react';
import axios from 'axios';
import './UsersPage.css';

interface User {
  id: number;
  name: string;
  email: string;
  status: 'PENDING' | 'ACTIVE';
}

const UsersPage = () => {
  // CAMBIO: Dos estados separados para cada lista de usuarios
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const backendUrl = 'http://localhost:4000';

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        // CAMBIO: Hacemos dos peticiones a la API en paralelo
        const pendingResponse = axios.get(`${backendUrl}/api/users/pending`, { headers });
        const activeResponse = axios.get(`${backendUrl}/api/users/active`, { headers });

        // Esperamos a que ambas peticiones terminen
        const [pendingResult, activeResult] = await Promise.all([pendingResponse, activeResponse]);

        setPendingUsers(pendingResult.data);
        setActiveUsers(activeResult.data);
        
      } catch (err) {
        setError('No se pudieron cargar los usuarios.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // CAMBIO: La función de aprobación ahora se llama 'handleApprove' y usa la nueva ruta
  const handleApproveUser = async (userToApprove: User) => {
    try {
      const token = localStorage.getItem('token');
      // Llama al endpoint PATCH con la ruta correcta: /:id/approve
      await axios.patch(`${backendUrl}/api/users/${userToApprove.id}/approve`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Actualiza el estado local para mover al usuario de la lista de pendientes a la de activos
      setPendingUsers(current => current.filter(u => u.id !== userToApprove.id));
      setActiveUsers(current => [...current, { ...userToApprove, status: 'ACTIVE' }]);

    } catch (err) {
      alert('Error al aprobar el usuario.');
      console.error(err);
    }
  };
  
  // La parte del renderizado (JSX) puede permanecer casi igual
  if (loading) return <p>Cargando usuarios...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div className="users-page">
      <h1>Usuarios</h1>

      <div className="user-section">
        <h2>Pendientes de Aprobación</h2>
        {pendingUsers.length > 0 ? (
          <div className="user-grid">
            {pendingUsers.map(user => (
              <div key={user.id} className="user-card pending">
                <div className="user-info">
                  <strong className="user-name">{user.name}</strong>
                  <span className="user-email">{user.email}</span>
                </div>
                <button className="confirm-btn" onClick={() => handleApproveUser(user)}>
                  Aprobar
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>No hay usuarios pendientes de aprobación.</p>
        )}
      </div>

      <div className="user-section">
        <h2>Usuarios Activos</h2>
        {activeUsers.length > 0 ? (
          <div className="user-grid">
            {activeUsers.map(user => (
              <div key={user.id} className="user-card">
                <div className="user-info">
                  <strong className="user-name">{user.name}</strong>
                  <span className="user-email">{user.email}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No hay usuarios activos.</p>
        )}
      </div>
    </div>
  );
};

export default UsersPage;