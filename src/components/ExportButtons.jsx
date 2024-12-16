/* eslint-disable react/prop-types */
// components/ExportButtons.jsx
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

const ExportButtons = ({ data }) => {
  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, "data.xlsx");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF('landscape');
    const headers = Object.keys(data[0] || {});
    let yPos = 10;
    
    doc.setFontSize(8);
    data.forEach((row, index) => {
      if (index === 0) {
        headers.forEach((header, i) => {
          doc.text(header, 10 + (i * 15), yPos);
        });
        yPos += 10;
      }
      
      headers.forEach((header, i) => {
        doc.text(String(row[header]), 10 + (i * 15), yPos);
      });
      yPos += 5;
      
      if (yPos >= 200) {
        doc.addPage();
        yPos = 10;
      }
    });
    
    doc.save("data.pdf");
  };

  return (
    <div className="flex gap-4">
      <button
        onClick={handleExportExcel}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Export Excel
      </button>
      <button
        onClick={handleExportPDF}
        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
      >
        Export PDF
      </button>
    </div>
  );
};

export default ExportButtons;