// components/AddPatientDialog.jsx
import React, { useState, useEffect } from "react";
import Select from "react-select";
import { OPTIONS } from "../utils/constants";
import { X, Save, Loader2, AlertCircle } from "lucide-react";
import {
  STORAGE_KEYS,
  saveToLocalStorage,
  getFromLocalStorage,
} from "../utils/localStorage";
import { format } from "date-fns";

const AddPatientDialog = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  existingPatients = [],
}) => {
  const [formData, setFormData] = useState(() => {
    return getFromLocalStorage(STORAGE_KEYS.FORM_DATA, initialData);
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [selectedExistingPatient, setSelectedExistingPatient] = useState(null);

  // Transform existing patients for react-select
  const existingPatientOptions = existingPatients.map((patient) => ({
    value: patient,
    label: `${patient.Nom} ${patient.Prenom} (${patient["N° PIECE ID"]}) (${patient["DATE DE NAISSANCE"]})`,
  }));

  useEffect(() => {
    if (isOpen) {
      const savedDraft = getFromLocalStorage(STORAGE_KEYS.FORM_DATA);
      if (savedDraft && Object.keys(savedDraft).length > 0) {
        const useDraft = window.confirm(
          "Un brouillon a été trouvé. Voulez-vous continuer avec ce brouillon ?"
        );
        if (useDraft) {
          setFormData(savedDraft);
          setIsDirty(true);
        } else {
          localStorage.removeItem(STORAGE_KEYS.FORM_DATA);
          setFormData(initialData);
          setIsDirty(false);
          setSelectedExistingPatient(null);
        }
      } else {
        setFormData(initialData);
        setIsDirty(false);
        setSelectedExistingPatient(null);
      }
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    if (isDirty && isOpen) {
      const timeoutId = setTimeout(() => {
        saveToLocalStorage(STORAGE_KEYS.FORM_DATA, formData);
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [formData, isDirty, isOpen]);

  const handleExistingPatientSelect = (selectedOption) => {
    if (selectedOption) {
      const existingPatient = selectedOption.value;
      setSelectedExistingPatient(selectedOption);

      // Prefill patient information, keeping current consultation date
      const updatedFormData = {
        ...formData,
        Nom: existingPatient.Nom,
        Prenom: existingPatient.Prenom,
        "DATE DE NAISSANCE": existingPatient["DATE DE NAISSANCE"],
        "N° PIECE ID": existingPatient["N° PIECE ID"],
        Sexe: existingPatient.Sexe || formData.Sexe,
        "TYPE DE PIECE ID":
          existingPatient["TYPE DE PIECE ID"] || formData["TYPE DE PIECE ID"],
        "COMPAGNIE D'ASSURANCE":
          existingPatient["COMPAGNIE D'ASSURANCE"] ||
          formData["COMPAGNIE D'ASSURANCE"],
        ADRESSE: existingPatient.ADRESSE || formData.ADRESSE,
        TELEPHONE: existingPatient.TELEPHONE || formData.TELEPHONE,
      };

      setFormData(updatedFormData);
      setIsDirty(true);
    } else {
      setSelectedExistingPatient(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.Nom?.trim()) newErrors.Nom = "Le nom est requis";
    if (!formData.Prenom?.trim()) newErrors.Prenom = "Le prénom est requis";
    if (!formData.Sexe) newErrors.Sexe = "Le sexe est requis";
    if (!formData["DATE DE NAISSANCE"])
      newErrors["DATE DE NAISSANCE"] = "La date de naissance est requise";
    if (!formData["DATE DE CONSULTATION"])
      newErrors["DATE DE CONSULTATION"] = "La date de consultation est requise";
    if (!formData["TYPE DE PIECE ID"])
      newErrors["TYPE DE PIECE ID"] = "Le type de pièce d'identité est requis";
    if (!formData["N° PIECE ID"]?.trim())
      newErrors["N° PIECE ID"] = "Le numéro de pièce d'identité est requis";
    if (!formData["COMPAGNIE D'ASSURANCE"])
      newErrors["COMPAGNIE D'ASSURANCE"] =
        "La compagnie d'assurance est requise";

    if (
      formData.TELEPHONE &&
      !/^\+?\d{8,}$/.test(formData.TELEPHONE.replace(/\s/g, ""))
    ) {
      newErrors.TELEPHONE = "Le numéro de téléphone n'est pas valide";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onSubmit(formData);
      localStorage.removeItem(STORAGE_KEYS.FORM_DATA);
      setIsDirty(false);
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors((prev) => ({
        ...prev,
        submit: "Une erreur est survenue lors de l'enregistrement",
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (isDirty) {
      const shouldSave = window.confirm(
        "Voulez-vous sauvegarder votre progression comme brouillon?"
      );
      if (shouldSave) {
        saveToLocalStorage(STORAGE_KEYS.FORM_DATA, formData);
      } else {
        localStorage.removeItem(STORAGE_KEYS.FORM_DATA);
      }
    }
    onClose();
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start overflow-y-auto py-8">
      <div className="bg-white rounded-lg w-full max-w-4xl m-4 relative">
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center rounded-t-lg z-10">
          <h2 className="text-2xl font-semibold text-gray-800">
            {formData["N° IPP"]
              ? `Patient #${formData["N° IPP"]}`
              : "Nouveau Patient"}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Fermer"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Existing Patient Selection */}
          <section>
            <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">
              Sélection de Patient Existant
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patients Existants
                </label>
                <Select
                  options={existingPatientOptions}
                  value={selectedExistingPatient}
                  onChange={handleExistingPatientSelect}
                  isClearable
                  placeholder="Sélectionner un patient existant"
                />
              </div>
            </div>
          </section>

          {/* Error Summary */}
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-red-700 font-medium">
                  Veuillez corriger les erreurs suivantes:
                </p>
              </div>
              <ul className="mt-2 list-disc list-inside text-sm text-red-600">
                {Object.values(errors).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Patient Basic Information */}
          <section>
            <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">
              Informations du Patient
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de Consultation *
                </label>
                <input
                  type="date"
                  value={formData["DATE DE CONSULTATION"]}
                  onChange={(e) =>
                    handleInputChange("DATE DE CONSULTATION", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                    errors["DATE DE CONSULTATION"]
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  required
                />
                {errors["DATE DE CONSULTATION"] && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors["DATE DE CONSULTATION"]}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  N° IPP
                </label>
                <input
                  type="text"
                  value={formData["N° IPP"]}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  value={formData.Nom}
                  onChange={(e) => handleInputChange("Nom", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                    errors.Nom ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                />
                {errors.Nom && (
                  <p className="mt-1 text-sm text-red-500">{errors.Nom}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom *
                </label>
                <input
                  type="text"
                  value={formData.Prenom}
                  onChange={(e) => handleInputChange("Prenom", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                    errors.Prenom ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                />
                {errors.Prenom && (
                  <p className="mt-1 text-sm text-red-500">{errors.Prenom}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sexe *
                </label>
                <Select
                  options={OPTIONS.Sexe}
                  value={OPTIONS.Sexe.find(
                    (opt) => opt.value === formData.Sexe
                  )}
                  onChange={(option) => handleInputChange("Sexe", option.value)}
                  className={
                    errors.Sexe ? "border border-red-500 rounded-md" : ""
                  }
                  required
                />
                {errors.Sexe && (
                  <p className="mt-1 text-sm text-red-500">{errors.Sexe}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de Naissance *
                </label>
                <input
                  type="date"
                  value={formData["DATE DE NAISSANCE"]}
                  onChange={(e) =>
                    handleInputChange("DATE DE NAISSANCE", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                    errors["DATE DE NAISSANCE"]
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  required
                />
                {errors["DATE DE NAISSANCE"] && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors["DATE DE NAISSANCE"]}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* ID and Civil Status */}
          <section>
            <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">
              Identification & Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de Pièce ID *
                </label>
                <Select
                  options={OPTIONS["TYPE DE PIECE ID"]}
                  value={OPTIONS["TYPE DE PIECE ID"].find(
                    (opt) => opt.value === formData["TYPE DE PIECE ID"]
                  )}
                  onChange={(option) =>
                    handleInputChange("TYPE DE PIECE ID", option.value)
                  }
                  className={
                    errors["TYPE DE PIECE ID"]
                      ? "border border-red-500 rounded-md"
                      : ""
                  }
                  required
                />
                {errors["TYPE DE PIECE ID"] && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors["TYPE DE PIECE ID"]}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  N° Pièce ID *
                </label>
                <input
                  type="text"
                  value={formData["N° PIECE ID"]}
                  onChange={(e) =>
                    handleInputChange("N° PIECE ID", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                    errors["N° PIECE ID"] ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors["N° PIECE ID"] && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors["N° PIECE ID"]}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  État Civil
                </label>
                <Select
                  options={OPTIONS["E - CIVIL"]}
                  value={OPTIONS["E - CIVIL"].find(
                    (opt) => opt.value === formData["E - CIVIL"]
                  )}
                  onChange={(option) =>
                    handleInputChange("E - CIVIL", option.value)
                  }
                  isClearable
                  placeholder="Sélectionner l'état civil"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Compagnie d'Assurance *
                </label>
                <Select
                  options={OPTIONS["COMPAGNIE D'ASSURANCE"]}
                  value={OPTIONS["COMPAGNIE D'ASSURANCE"].find(
                    (opt) => opt.value === formData["COMPAGNIE D'ASSURANCE"]
                  )}
                  onChange={(option) =>
                    handleInputChange("COMPAGNIE D'ASSURANCE", option.value)
                  }
                  className={
                    errors["COMPAGNIE D'ASSURANCE"]
                      ? "border border-red-500 rounded-md"
                      : ""
                  }
                  required
                />
                {errors["COMPAGNIE D'ASSURANCE"] && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors["COMPAGNIE D'ASSURANCE"]}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">
              Information de Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                <textarea
                  value={formData.ADRESSE}
                  onChange={(e) => handleInputChange("ADRESSE", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.TELEPHONE}
                  onChange={(e) =>
                    handleInputChange("TELEPHONE", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                    errors.TELEPHONE ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="+212 XXXXXXXXX"
                />
                {errors.TELEPHONE && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.TELEPHONE}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Parent Information */}
          <section>
            <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">
              Information du Parent
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du Parent
                </label>
                <input
                  type="text"
                  value={formData.PARENT_NOM}
                  onChange={(e) =>
                    handleInputChange("PARENT_NOM", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom du Parent
                </label>
                <input
                  type="text"
                  value={formData.PARENT_PRENOM}
                  onChange={(e) =>
                    handleInputChange("PARENT_PRENOM", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CIN du Parent
                </label>
                <input
                  type="text"
                  value={formData.PARENT_CIN}
                  onChange={(e) =>
                    handleInputChange("PARENT_CIN", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </section>

          {/* Appointment Details */}
          <section>
            <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">
              Détails du Rendez-vous
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Agenda
                </label>
                <Select
                  options={OPTIONS.AGENDA}
                  value={OPTIONS.AGENDA.find(
                    (opt) => opt.value === formData.AGENDA
                  )}
                  onChange={(option) =>
                    handleInputChange("AGENDA", option.value)
                  }
                  placeholder="Sélectionner le type de consultation"
                  isClearable
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Activité
                </label>
                <Select
                  options={OPTIONS.ACTIVITE}
                  value={OPTIONS.ACTIVITE.find(
                    (opt) => opt.value === formData.ACTIVITE
                  )}
                  onChange={(option) =>
                    handleInputChange("ACTIVITE", option.value)
                  }
                  placeholder="Sélectionner l'activité"
                  isClearable
                />
              </div>
            </div>
          </section>

          {/* Form Actions */}
          <div className="sticky bottom-0 bg-white px-6 py-4 border-t mt-8 -mx-6 -mb-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
              disabled={loading}
            >
              <X className="h-4 w-4" />
              <span>Annuler</span>
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:bg-blue-300"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{loading ? "Enregistrement..." : "Enregistrer"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPatientDialog;
