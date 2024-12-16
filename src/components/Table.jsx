/* eslint-disable react/prop-types */
import { useState } from "react";
import Select from "react-select";
import { OPTIONS } from "../utils/constants";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import ScrollButtons from "./ScrollButtons";

// eslint-disable-next-line no-unused-vars
const Table = ({ data, setData, isLoading }) => {
  const [editingRow, setEditingRow] = useState(null);
  const [loading, setLoading] = useState({
    edit: false,
    save: false,
    delete: false,
    addRow: false,
    addColumn: false,
  });

  // Function to format date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch {
      return dateString;
    }
  };

  const handleAddRow = async () => {
    setLoading((prev) => ({ ...prev, addRow: true }));
    try {
      const newRow = {
        "DATE DE CONSULTATION": new Date().toISOString().split("T")[0],
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
      };
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call
      setData([...data, newRow]);
    } finally {
      setLoading((prev) => ({ ...prev, addRow: false }));
    }
  };

  const handleAddColumn = async () => {
    setLoading((prev) => ({ ...prev, addColumn: true }));
    try {
      const columnName = prompt("Enter new column name:");
      if (columnName) {
        const newData = data.map((row) => ({
          ...row,
          [columnName]: "",
        }));
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call
        setData(newData);
      }
    } finally {
      setLoading((prev) => ({ ...prev, addColumn: false }));
    }
  };

  const handleEdit = async (rowIndex) => {
    setLoading((prev) => ({ ...prev, edit: true }));
    try {
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call
      setEditingRow(rowIndex);
    } finally {
      setLoading((prev) => ({ ...prev, edit: false }));
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleSave = async (rowIndex) => {
    setLoading((prev) => ({ ...prev, save: true }));
    try {
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call
      setEditingRow(null);
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  const handleDelete = async (rowIndex) => {
    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call
      const newData = data.filter((_, index) => index !== rowIndex);
      setData(newData);
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  return (
    <div className="relative">
      {data.length === 0 ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-600">Loading table data...</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Table Data</h2>
            <div className="flex space-x-4">
              <button
                onClick={handleAddColumn}
                disabled={loading.addColumn}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-300 flex items-center space-x-2"
              >
                {loading.addColumn ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : null}
                <span>Add Column</span>
              </button>
              <button
                onClick={handleAddRow}
                disabled={loading.addRow}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-green-300 flex items-center space-x-2"
              >
                {loading.addRow ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : null}
                <span>Add Row</span>
              </button>
            </div>
          </div>

          <div className="overflow-hidden border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {data[0] &&
                    Object.keys(data[0]).map((header, index) => (
                      <th
                        key={index}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0"
                      >
                        {header}
                      </th>
                    ))}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((row, rowIndex) => (
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
                              className="w-full"
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
                              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          )
                        ) : (
                          <span className="text-gray-900">
                            {key.includes("DATE") ? formatDate(value) : value}
                          </span>
                        )}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        {editingRow === rowIndex ? (
                          <button
                            onClick={() => handleSave(rowIndex)}
                            disabled={loading.save}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
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
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
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
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
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
      )}
      <ScrollButtons />
    </div>
  );
};

export default Table;
