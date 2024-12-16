// App.jsx
import { useState } from "react";
import FileUpload from "./components/FileUpload";
import Table from "./components/Table";
import SearchBar from "./components/SearchBar";
import ExportButtons from "./components/ExportButtons";
import ScrollButtons from "./components/ScrollButtons";

const App = () => {
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [isTableLoading, setIsTableLoading] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Gestion des Rendez-vous
        </h1>
        <SearchBar data={originalData} setData={setData} />
        <FileUpload
          setData={setData}
          setOriginalData={setOriginalData}
          setIsTableLoading={setIsTableLoading}
        />
        <Table data={data} setData={setData} isLoading={isTableLoading} />
        <ExportButtons data={data} />
        <ScrollButtons />
      </div>
    </div>
  );
};

export default App;
