import { useState } from "react";
import Papa from "papaparse"; // Install via `npm install papaparse`

function CsvUploader({ onUploadComplete }) {
  const [csvData, setCsvData] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];

    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
          console.log("Parsed CSV:", results.data);
          setCsvData(results.data);
          onUploadComplete(results.data); // send parsed data to parent
        },
      });
    }
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-2">Upload Sensor Data (CSV)</h3>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="p-2 border rounded"
      />
      <p className="text-sm text-gray-600 mt-2">
        CSV format: sensorId, moisture, ph
      </p>
    </div>
  );
}

export default CsvUploader;
