// src/App.jsx - CORREGIDO
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./pages/login/LoginPage";  // ✅ Cambiar Login a login
import Dashboard from "./pages/dashboard/Dashboard";
import MatriculaPage from "./pages/matricula/MatriculaPage";
import RecibosPage from "./pages/recibos/RecibosPage";
import UsuariosPage from "./pages/admin/UsuariosPage";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/" element={<Navigate to="/login" />} />
                    
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />
                    
                    <Route path="/dashboard/matricula" element={
                        <ProtectedRoute rolesPermitidos={['admin', 'secretaria']}>
                            <MatriculaPage />
                        </ProtectedRoute>
                    } />
                    
                    <Route path="/dashboard/recibos" element={
                        <ProtectedRoute rolesPermitidos={['admin', 'secretaria', 'cajero']}>
                            <RecibosPage />
                        </ProtectedRoute>
                    } />
                    
                    <Route path="/dashboard/usuarios" element={
                        <ProtectedRoute rolesPermitidos={['admin']}>
                            <UsuariosPage />
                        </ProtectedRoute>
                    } />
                    
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;