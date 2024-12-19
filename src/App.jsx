import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
} from "react-router-dom";
import FileUpload from "./components/FileUpload";
import Table from "./components/Table";
import SearchBar from "./components/SearchBar";
import ExportButtons from "./components/ExportButtons";
import ScrollButtons from "./components/ScrollButtons";
import AddPatientDialog from "./components/AddPatientDialog";
import AdminLogin from "./Admin/AdminLogin";
import ProtectedRoute from "./Admin/ProtectedRoute";
import { format } from "date-fns";
import { Plus, Users, LogOut, Monitor, EyeOff } from "lucide-react";
import { OPTIONS } from "./utils/constants";
import {
  STORAGE_KEYS,
  saveToLocalStorage,
  getFromLocalStorage,
} from "./utils/localStorage";
import { SpeedInsights } from "@vercel/speed-insights/react";

// Logout Component
const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Remove authentication status
    localStorage.removeItem("isAdminAuthenticated");
    // Redirect to login page
    navigate("/login");
  }, [navigate]);

  return null;
};

const App = () => {
  const [data, setData] = useState(() =>
    getFromLocalStorage(STORAGE_KEYS.PATIENTS, [])
  );
  const [originalData, setOriginalData] = useState(() =>
    getFromLocalStorage(STORAGE_KEYS.PATIENTS, [])
  );
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.PATIENTS, data);
  }, [data]);

  const handleAddNewPatient = (patientData) => {
    const newPatient = {
      ...patientData,
      "N° IPP": data.length + 1,
      "DATE DE CONSULTATION": format(new Date(), "yyyy-MM-dd"),
    };

    const updatedData = [...data, newPatient];
    setData(updatedData);
    setOriginalData(updatedData);
    setShowAddDialog(false);
    localStorage.removeItem(STORAGE_KEYS.FORM_DATA);
  };

  const getInitialPatientData = () => ({
    "DATE DE CONSULTATION": format(new Date(), "yyyy-MM-dd"),
    "N° IPP": data.length + 1,
    Nom: "",
    Prenom: "",
    Sexe: "",
    "DATE DE NAISSANCE": "",
    "TYPE DE PIECE ID": "",
    "N° PIECE ID": "",
    "E - CIVIL": "",
    "COMPAGNIE D'ASSURANCE": "",
    ADRESSE: "",
    TELEPHONE: "",
    PARENT_NOM: "",
    PARENT_PRENOM: "",
    PARENT_CIN: "",
    AGENDA: "",
    ACTIVITE: "",
  });

  return (
    <div>
      {/* <!-- Visible on mobile, hidden on desktop --> */}
     
<div className="block md:hidden min-h-screen flex items-center justify-center">
  <div className="p-4 bg-gray-100 rounded-lg shadow-sm">
    <div className="flex items-center gap-3 text-gray-600">
      <Monitor className="w-5 h-5" />
      <p className="font-medium">Open Desktop to show</p>
      <EyeOff className="w-4 h-4 ml-auto" />
    </div>
  </div>
</div>
      <div className="hidden md:block">
        <Router>
          <Routes>
            {/* Login Route */}
            <Route path="/login" element={<AdminLogin />} />

            {/* Logout Route */}
            <Route path="/logout" element={<Logout />} />

            {/* Protected Dashboard Route */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-50 p-8">
                    <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-6">
                      {/* Header with Add Patient and Logout Buttons */}
                      <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center space-x-3">
                          <Users className="h-8 w-8 text-blue-600" />
                          <h1 className="text-3xl font-bold text-gray-800">
                            Gestion des Rendez-vous
                          </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => setShowAddDialog(true)}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
                          >
                            <Plus className="h-5 w-5" />
                            <span>Add New Patient</span>
                          </button>
                          <Link
                            to="/logout"
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2"
                          >
                            <LogOut className="h-5 w-5" />
                            <span>Logout</span>
                          </Link>
                        </div>
                      </div>

                      {/* Main Dashboard Content */}
                      <div className="space-y-6">
                        {/* Search Bar */}
                        <SearchBar
                          data={data}
                          setData={setData}
                          originalData={originalData}
                          additionalFilters={{
                            Sexe: OPTIONS.Sexe,
                            "COMPAGNIE D'ASSURANCE":
                              OPTIONS["COMPAGNIE D'ASSURANCE"],
                            AGENDA: OPTIONS.AGENDA,
                          }}
                        />

                        {/* File Upload Section */}
                        <div className="flex items-center justify-between">
                          <h2 className="text-lg font-semibold text-gray-700">
                            Import Data
                          </h2>
                          <FileUpload
                            setData={setData}
                            setOriginalData={setOriginalData}
                            setIsTableLoading={setIsTableLoading}
                          />
                        </div>

                        {/* Patient Table */}
                        <Table
                          data={data}
                          setData={setData}
                          isLoading={isTableLoading}
                          onAddNew={() => setShowAddDialog(true)}
                        />

                        {/* Export Buttons */}
                        <ExportButtons data={data} />
                      </div>

                      {/* Add Patient Dialog */}
                      <AddPatientDialog
                        isOpen={showAddDialog}
                        onClose={() => setShowAddDialog(false)}
                        onSubmit={handleAddNewPatient}
                        initialData={getInitialPatientData()}
                      />

                      {/* Scroll Buttons */}
                      <ScrollButtons />
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />

            {/* Root Route Redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Catch-all Route to Redirect to Login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </div>
      <SpeedInsights />
    </div>
  );
};

export default App;
