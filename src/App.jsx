// src/App.jsx

import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import LoginPage from "./pages/Login/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";

import "./App.css";

const Dashboard = lazy(() => import("./pages/dashboard/dashboard"));
const MatriculaPage = lazy(() => import("./pages/matricula/MatriculaPage"));
const RecibosPage = lazy(() => import("./pages/recibos/RecibosPage"));
const UsuariosPage = lazy(() => import("./pages/admin/UsuariosPage"));
const PerfilEstudiante = lazy(() => import("./pages/perfil_studiante/perfil_estudiante"));
const PlanEstudioForm = lazy(() => import("./pages/plan_studio/PlanEstudioForm"));
const VerPlanEstudio = lazy(() => import("./pages/plan_studio/VerPlanEstudio"));
const ExamenTeoricoPage = lazy(() => import("./pages/examen_teorico/ExamenTeoricoPage"));
const ExamenTeoricoEstudiante = lazy(() => import("./pages/examen_teorico/ExamenTeoricoEstudiante"));
const InstructoresPage = lazy(() => import("./pages/instructores/InstructoresPage"));
const Configuraciones = lazy(() => import("./pages/dashboard/configuraciones"));

function App() {
    return (
        <AuthProvider>
            <Router>
                <Suspense fallback={<div className="cargando-pagina">Cargando...</div>}>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />

                        <Route
                            path="/"
                            element={<Navigate to="/login" replace />}
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

                        <Route
                            path="/dashboard/configuraciones"
                            element={
                                <ProtectedRoute rolesPermitidos={["admin"]}>
                                    <Configuraciones />
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

                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                </Suspense>
            </Router>
        </AuthProvider>
    );
}

export default App;