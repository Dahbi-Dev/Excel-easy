/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
// components/Table.jsx
import { useState, useEffect, useMemo } from "react";
import Select from "react-select";
import { OPTIONS } from "../utils/constants";
import { Loader2, Plus, Users, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { format, parse } from "date-fns";
import ScrollButtons from "./ScrollButtons";
import {
  STORAGE_KEYS,
  saveToLocalStorage,
  getFromLocalStorage,
} from "../utils/localStorage";

const Table = ({ data, setData, isLoading, onAddNew }) => {
  const [editingRow, setEditingRow] = useState(null);
  const [loading, setLoading] = useState({
    edit: false,
    save: false,
    delete: false,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Pagination logic
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  }, [data, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const formatDate = (value) => {
    if (!value) return "";
    try {
      if (typeof value === "number") {
        const excelDate = new Date((value - 25569) * 86400 * 1000);
        return format(excelDate, "dd/MM/yyyy");
      }
      if (typeof value === "string") {
        const formats = ["yyyy-MM-dd", "dd/MM/yyyy", "MM/dd/yyyy"];
        for (const dateFormat of formats) {
          try {
            const parsedDate = parse(value, dateFormat, new Date());
            return format(parsedDate, "dd/MM/yyyy");
          } catch {
            continue;
          }
        }
      }
      return format(new Date(value), "dd/MM/yyyy");
    } catch {
      return value;
    }
  };

  const handleEdit = async (rowIndex) => {
    setLoading((prev) => ({ ...prev, edit: true }));
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      // Save current row state before editing
      saveToLocalStorage(STORAGE_KEYS.EDITING_BACKUP, {
        rowIndex,
        data: data[rowIndex],
      });
      setEditingRow(rowIndex);
    } finally {
      setLoading((prev) => ({ ...prev, edit: false }));
    }
  };

  const handleSave = async (rowIndex) => {
    setLoading((prev) => ({ ...prev, save: true }));
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      localStorage.removeItem(STORAGE_KEYS.EDITING_BACKUP);
      setEditingRow(null);
      // Save the entire dataset
      saveToLocalStorage(STORAGE_KEYS.PATIENTS, data);
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  const handleDelete = async (rowIndex) => {
    if (
      !confirm(
        "Are you sure you want to delete this patient record? This action cannot be undone."
      )
    ) {
      return;
    }

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newData = data.filter((_, index) => index !== rowIndex);
      setData(newData);
      saveToLocalStorage(STORAGE_KEYS.PATIENTS, newData);
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  // Pagination handlers
  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  // Items per page options
  const itemsPerPageOptions = [
    { value: 10, label: '10 rows' },
    { value: 25, label: '25 rows' },
    { value: 50, label: '50 rows' },
    { value: data.length, label: 'All rows' }
  ];

  // Recover editing state on page load
  useEffect(() => {
    const backup = getFromLocalStorage(STORAGE_KEYS.EDITING_BACKUP);
    if (backup) {
      const { rowIndex } = backup;
      setEditingRow(rowIndex);
    }
  }, []);

  // Reset to first page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex justify-center items-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600 font-medium">
            Loading patient records...
          </p>
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="min-h-[400px] flex flex-col justify-center items-center bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center space-y-4">
          <Users className="h-12 w-12 text-gray-400 mx-auto" />
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">
              No Patients Yet
            </h3>
            <p className="text-gray-500 max-w-sm">
              Get started by adding your first patient record or import data
              from an Excel file.
            </p>
          </div>
          <button
            onClick={onAddNew}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Your First Patient
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col space-y-4">
      <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden bg-white shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                {data[0] &&
                  Object.keys(data[0]).map((header, index) => (
                    <th
                      key={index}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {Object.entries(row).map(([key, value], colIndex) => (
                    <td
                      key={colIndex}
                      className="px-6 py-4 whitespace-nowrap text-sm"
                    >
                      {editingRow === rowIndex ? (
                        [
                          "Sexe",
                          "TYPE DE PIECE ID",
                          "E - CIVIL",
                          "COMPAGNIE D'ASSURANCE",
                          "AGENDA",
                          "ACTIVITE",
                        ].includes(key) ? (
                          <Select
                            options={OPTIONS[key]}
                            value={{ value, label: value }}
                            onChange={(option) => {
                              const newData = [...data];
                              newData[rowIndex][key] = option.value;
                              setData(newData);
                            }}
                            className="w-full min-w-[100px]"
                          />
                        ) : key.includes("DATE") ? (
                          <input
                            type="date"
                            value={value}
                            onChange={(e) => {
                              const newData = [...data];
                              newData[rowIndex][key] = e.target.value;
                              setData(newData);
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => {
                              const newData = [...data];
                              newData[rowIndex][key] = e.target.value;
                              setData(newData);
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                          />
                        )
                      ) : (
                        <span
                          className={`text-gray-900 ${
                            !value && "text-gray-400 italic"
                          }`}
                        >
                          {key.includes("DATE")
                            ? formatDate(value)
                            : value || "N/A"}
                        </span>
                      )}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-sm sticky right-0 bg-white">
                    <div className="flex gap-4">
                      {editingRow === rowIndex ? (
                        <button
                          onClick={() => handleSave(rowIndex)}
                          disabled={loading.save}
                          className="inline-flex items-center px-3 py-1 rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                        >
                          {loading.save && (
                            <Loader2 className="animate-spin h-4 w-4 mr-1" />
                          )}
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEdit(rowIndex)}
                          disabled={loading.edit}
                          className="inline-flex items-center px-6 py-1 rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                        >
                          {loading.edit && (
                            <Loader2 className="animate-spin h-4 w-4 mr-1" />
                          )}
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(rowIndex)}
                        disabled={loading.delete}
                        className="inline-flex items-center px-3 py-1 rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                      >
                        {loading.delete && (
                          <Loader2 className="animate-spin h-4 w-4 mr-1" />
                        )}
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination and Row Count Controls */}
      <div className="flex justify-between items-center">
        {/* Rows per page selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">Rows per page:</span>
          <Select
            value={{ value: itemsPerPage, label: `${itemsPerPage} rows` }}
            onChange={(selected) => setItemsPerPage(selected.value)}
            options={itemsPerPageOptions}
            className="w-32"
          />
        </div>

        {/* Pagination controls */}
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages} 
            {' '}(Showing {paginatedData.length} of {data.length} records)
          </span>
          <div className="flex space-x-2">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="p-2 bg-gray-200 rounded-md disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="p-2 bg-gray-200 rounded-md disabled:opacity-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Table;