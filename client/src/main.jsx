import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import AdminApp from './admin/AdminApp.jsx';
import './styles.css';

// Sin librería de rutas: /admin muestra el panel, cualquier otra ruta el portfolio público.
const isAdmin = window.location.pathname.replace(/\/+$/, '') === '/admin';

createRoot(document.getElementById('root')).render(isAdmin ? <AdminApp /> : <App />);
