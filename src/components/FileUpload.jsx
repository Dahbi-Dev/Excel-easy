/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useRef } from "react";
import { Loader2, Upload, FileText, Check, X } from "lucide-react";
import * as XLSX from "xlsx";

const FileUpload = ({ setData, setOriginalData, setIsTableLoading }) => {
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [uploadStatus, setUploadStatus] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setIsTableLoading(true);
    setFileName(file.name);
    setUploadStatus(null);

    try {
      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const workbook = XLSX.read(event.target.result, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(sheet, {
            header: 1,
            raw: false,
            dateNF: "dd/mm/yyyy",
          });

          // Skip empty rows and get headers from the first row
          const headers = json[0];
          const dataRows = json
            .slice(1)
            .filter((row) => row.some((cell) => cell));

          const formattedData = dataRows.map((row, idx) => ({
            "DATE DE CONSULTATION": row[0] || "",
            "N° IPP": row[1] || (idx + 1).toString(),
            Nom: row[2] || "",
            Prenom: row[3] || "",
            Sexe: row[4] || "",
            "DATE DE NAISSANCE": row[5] || "",
            "TYPE DE PIECE ID": row[6] || "",
            "N° PIECE ID": row[7] || "",
            "E - CIVIL": row[8] || "",
            "COMPAGNIE D'ASSURANCE": row[9] || "",
            ADRESSE: row[10] || "",
            TELEPHONE: row[11] || "",
            PARENT_NOM: row[12] || "",
            PARENT_PRENOM: row[13] || "",
            PARENT_CIN: row[14] || "",
            AGENDA: row[15] || "",
            ACTIVITE: row[16] || "",
          }));

          setData(formattedData);
          setOriginalData(formattedData);
          setUploadStatus("success");
        } catch (error) {
          console.error("Error processing file:", error);
          setUploadStatus("error");
        } finally {
          setIsTableLoading(false);
        }
      };

      reader.onerror = () => {
        setUploadStatus("error");
        setIsTableLoading(false);
      };

      reader.readAsBinaryString(file);
    } catch (error) {
      console.error("Error reading file:", error);
      setUploadStatus("error");
      setIsTableLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFileName("");
    setUploadStatus(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="mb-8">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
            {loading ? (
              <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
            ) : uploadStatus === "success" ? (
              <Check className="h-6 w-6 text-green-600" />
            ) : uploadStatus === "error" ? (
              <X className="h-6 w-6 text-red-600" />
            ) : (
              <Upload className="h-6 w-6 text-blue-600" />
            )}
          </div>

          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">
              Import Patient Data
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {loading
                ? "Processing file..."
                : "Upload your Excel file to import patient records"}
            </p>
          </div>

          {fileName && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <FileText className="h-4 w-4" />
              <span>{fileName}</span>
            </div>
          )}

          <div className="flex gap-4">
            <label className="relative">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".xlsx,.xls"
                className="hidden"
                disabled={loading}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className={`px-4 py-2 rounded-md text-white transition-colors flex items-center space-x-2
                  ${
                    loading
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
              >
                {loading && <Loader2 className="animate-spin h-4 w-4" />}
                <span>{loading ? "Uploading..." : "Select File"}</span>
              </button>
            </label>

            {(fileName || uploadStatus) && (
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Reset
              </button>
            )}
          </div>

          {uploadStatus === "error" && (
            <div className="text-sm text-red-600 flex items-center space-x-1">
              <X className="h-4 w-4" />
              <span>Error processing file. Please try again.</span>
            </div>
          )}

          {uploadStatus === "success" && (
            <div className="text-sm text-green-600 flex items-center space-x-1">
              <Check className="h-4 w-4" />
              <span>File uploaded successfully!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
