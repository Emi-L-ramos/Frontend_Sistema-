// src/App.jsx

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import LoginPage from "./pages/Login/LoginPage";
import Dashboard from "./pages/dashboard/dashboard";
import MatriculaPage from "./pages/matricula/MatriculaPage";
import RecibosPage from "./pages/recibos/RecibosPage";
import UsuariosPage from "./pages/admin/UsuariosPage";
import ProtectedRoute from "./components/ProtectedRoute";
import PerfilEstudiante from "./pages/perfil_studiante/perfil_estudiante";
import PlanEstudioForm from "./pages/plan_studio/PlanEstudioForm";
import VerPlanEstudio from "./pages/plan_studio/VerPlanEstudio";
import ExamenTeoricoPage from "./pages/examen_teorico/ExamenTeoricoPage";
import ExamenTeoricoEstudiante from "./pages/examen_teorico/ExamenTeoricoEstudiante";
import InstructoresPage from "./pages/instructores/InstructoresPage";

import "./App.css";

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />

                    <Route
                        path="/"
                        element={<Navigate to="/dashboard" replace />}
                    />

                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/dashboard/matricula"
                        element={
                            <ProtectedRoute rolesPermitidos={["admin"]}>
                                <MatriculaPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/dashboard/examen-teorico"
                        element={
                            <ProtectedRoute rolesPermitidos={["admin"]}>
                                <ExamenTeoricoPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/dashboard/recibos"
                        element={
                            <ProtectedRoute rolesPermitidos={["admin"]}>
                                <RecibosPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/dashboard/perfiles"
                        element={
                            <ProtectedRoute>
                                <PerfilEstudiante />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/dashboard/usuarios"
                        element={
                            <ProtectedRoute rolesPermitidos={["admin"]}>
                                <UsuariosPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/dashboard/plan-estudio"
                        element={
                            <ProtectedRoute rolesPermitidos={["admin"]}>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/dashboard/plan-estudio/editar/:id"
                        element={
                            <ProtectedRoute rolesPermitidos={["admin"]}>
                                <PlanEstudioForm />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/dashboard/mi-examen-teorico"
                        element={
                            <ProtectedRoute rolesPermitidos={["estudiante"]}>
                                <ExamenTeoricoEstudiante />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/dashboard/plan-estudio/ver"
                        element={
                            <ProtectedRoute rolesPermitidos={["admin"]}>
                                <VerPlanEstudio />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/dashboard/plan-estudio/nuevo"
                        element={
                            <ProtectedRoute rolesPermitidos={["admin"]}>
                                <PlanEstudioForm />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/dashboard/instructores"
                        element={
                            <ProtectedRoute rolesPermitidos={["admin"]}>
                                <InstructoresPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
