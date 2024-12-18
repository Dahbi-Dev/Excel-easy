// components/ExportButtons.jsx
import { useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Loader2, FileText, FileDown } from "lucide-react";

const ExportButtons = ({ data }) => {
  const [loading, setLoading] = useState({
    excel: false,
    pdf: false,
  });

  const handleExportExcel = async () => {
    setLoading((prev) => ({ ...prev, excel: true }));
    try {
      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();

      // Format the data for Excel
      const formattedData = data.map((row) => ({
        "DATE DE CONSULTATION": row["DATE DE CONSULTATION"],
        "N° IPP": row["N° IPP"],
        NOM: row["Nom"],
        PRENOM: row["Prenom"],
        SEXE: row["Sexe"],
        "DATE DE NAISSANCE": row["DATE DE NAISSANCE"],
        "TYPE DE PIECE ID": row["TYPE DE PIECE ID"],
        "N° PIECE ID": row["N° PIECE ID"],
        "E - CIVIL": row["E - CIVIL"],
        "COMPAGNIE D'ASSURANCE": row["COMPAGNIE D'ASSURANCE"],
        ADRESSE: row["ADRESSE"],
        TELEPHONE: row["TELEPHONE"],
        PARENT_NOM: row["PARENT_NOM"],
        PARENT_PRENOM: row["PARENT_PRENOM"],
        PARENT_CIN: row["PARENT_CIN"],
        AGENDA: row["AGENDA"],
        ACTIVITE: row["ACTIVITE"],
      }));

      // Create the worksheet
      const worksheet = XLSX.utils.json_to_sheet(formattedData);

      // Set column widths
      const columnWidths = [
        { wch: 15 }, // DATE DE CONSULTATION
        { wch: 8 }, // N° IPP
        { wch: 15 }, // NOM
        { wch: 15 }, // PRENOM
        { wch: 10 }, // SEXE
        { wch: 15 }, // DATE DE NAISSANCE
        { wch: 15 }, // TYPE DE PIECE ID
        { wch: 15 }, // N° PIECE ID
        { wch: 12 }, // E - CIVIL
        { wch: 20 }, // COMPAGNIE D'ASSURANCE
        { wch: 30 }, // ADRESSE
        { wch: 15 }, // TELEPHONE
        { wch: 15 }, // PARENT_NOM
        { wch: 15 }, // PARENT_PRENOM
        { wch: 15 }, // PARENT_CIN
        { wch: 25 }, // AGENDA
        { wch: 15 }, // ACTIVITE
      ];
      worksheet["!cols"] = columnWidths;

      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Patients");

      // Write the workbook and trigger download
      XLSX.writeFile(workbook, "liste_patients.xlsx");
    } finally {
      setLoading((prev) => ({ ...prev, excel: false }));
    }
  };

  const handleExportPDF = async () => {
    setLoading((prev) => ({ ...prev, pdf: true }));
    try {
      // Create PDF document in landscape mode
      const doc = new jsPDF("l", "mm", "a4");

      // Set up the table headers
      const headers = [
        [
          "DATE DE CONSULTATION",
          "N° IPP",
          "NOM",
          "PRENOM",
          "SEXE",
          "DATE DE NAISSANCE",
          "TYPE DE PIECE ID",
          "N° PIECE ID",
          "E - CIVIL",
          "COMPAGNIE D'ASSURANCE",
          "ADRESSE",
          "TELEPHONE",
          "NOM",
          "PRENOM",
          "CIN",
          "AGENDA",
          "ACTIVITE",
        ],
      ];

      // Format the data for the table
      const tableData = data.map((row) => [
        row["DATE DE CONSULTATION"],
        row["N° IPP"],
        row["Nom"],
        row["Prenom"],
        row["Sexe"],
        row["DATE DE NAISSANCE"],
        row["TYPE DE PIECE ID"],
        row["N° PIECE ID"],
        row["E - CIVIL"],
        row["COMPAGNIE D'ASSURANCE"],
        row["ADRESSE"],
        row["TELEPHONE"],
        row["PARENT_NOM"],
        row["PARENT_PRENOM"],
        row["PARENT_CIN"],
        row["AGENDA"],
        row["ACTIVITE"],
      ]);

      // Add title to the PDF
      doc.setFontSize(16);
      doc.text("Liste des Patients", 14, 15);

      // Create the table
      autoTable(doc, {
        head: headers,
        body: tableData,
        startY: 20,
        styles: {
          fontSize: 7,
          cellPadding: 1,
        },
        columnStyles: {
          0: { cellWidth: 20 }, // DATE DE CONSULTATION
          1: { cellWidth: 10 }, // N° IPP
          2: { cellWidth: 15 }, // NOM
          3: { cellWidth: 15 }, // PRENOM
          4: { cellWidth: 10 }, // SEXE
          5: { cellWidth: 15 }, // DATE DE NAISSANCE
          6: { cellWidth: 15 }, // TYPE DE PIECE ID
          7: { cellWidth: 15 }, // N° PIECE ID
          8: { cellWidth: 12 }, // E - CIVIL
          9: { cellWidth: 20 }, // COMPAGNIE D'ASSURANCE
          10: { cellWidth: 25 }, // ADRESSE
          11: { cellWidth: 15 }, // TELEPHONE
          12: { cellWidth: 15 }, // PARENT_NOM
          13: { cellWidth: 15 }, // PARENT_PRENOM
          14: { cellWidth: 15 }, // PARENT_CIN
          15: { cellWidth: 20 }, // AGENDA
          16: { cellWidth: 15 }, // ACTIVITE
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontSize: 8,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
      });

      // Save the PDF
      doc.save("liste_patients.pdf");
    } finally {
      setLoading((prev) => ({ ...prev, pdf: false }));
    }
  };

  return (
    <div className="flex gap-4 mt-6">
      <button
        onClick={handleExportExcel}
        disabled={loading.excel || !data.length}
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:bg-green-300"
      >
        {loading.excel ? (
          <Loader2 className="animate-spin h-4 w-4" />
        ) : (
          <FileText className="h-4 w-4" />
        )}
        <span>Export Excel</span>
      </button>
      <button
        onClick={handleExportPDF}
        disabled={loading.pdf || !data.length}
        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center space-x-2 disabled:bg-purple-300"
      >
        {loading.pdf ? (
          <Loader2 className="animate-spin h-4 w-4" />
        ) : (
          <FileDown className="h-4 w-4" />
        )}
        <span>Export PDF</span>
      </button>
    </div>
  );
};

export default ExportButtons;
