import { Navigate } from 'react-router-dom';

// NotesPage now redirects to the DashboardPage via App.tsx routing
const NotesPage = () => <Navigate to="/notes" replace />;

export default NotesPage;
