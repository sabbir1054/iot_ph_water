import { ethers } from "ethers";
import Papa from "papaparse";
import { useState } from "react";
import SensorRanking from "./contracts/SensorRanking.json";

function UploadCsvSensor({ provider, account }) {
  const [csvData, setCsvData] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvData(results.data);
      },
    });
  };

  const handleUpload = async () => {
    if (!provider || !account || csvData.length === 0) {
      alert("Missing provider, account, or CSV data!");
      return;
    }

    try {
      const signer = await provider.getSigner();
      const contractAddress = SensorRanking.networks[5777].address;

      const contract = new ethers.Contract(
        contractAddress,
        SensorRanking.abi,
        signer
      );

      // Prepare data arrays from CSV
      const sensorIds = [];
      const temps = [];
      const salinity = [];
      const ph = [];
      const nh4 = [];
      const doValue = [];
      const ca = [];

      csvData.forEach((row) => {
        sensorIds.push(row.SensorID.toString());
        temps.push(Math.round(parseFloat(row.Temp)));
        salinity.push(Math.round(parseFloat(row.Salinity)));
        ph.push(Math.round(parseFloat(row.PH) * 10));
        nh4.push(Math.round(parseFloat(row.NH4) * 10));
        doValue.push(Math.round(parseFloat(row.DO) * 10 + 50));
        ca.push(Math.round(parseFloat(row.CA)));
      });

      setUploading(true);

      // Call the batch upload function
      console.log(doValue.slice(0, 5));

      const tx = await contract.batchAddSensorReadings(
        sensorIds,
        temps,
        salinity,
        ph,
        nh4,
        doValue,
        ca
      );

      await tx.wait();
      alert("Sensor data uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading sensor data: " + error.message);
    } finally {
      setUploading(false);
    }
  };
  // csvData.forEach((row) => console.log(row));
  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Upload Sensor CSV (Batch)</h2>

      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="mb-4"
      />

      {csvData.length > 0 && (
        <div className="mb-4">
          <p className="text-gray-700">
            Loaded {csvData.length} sensor entries.
          </p>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            {uploading ? "Uploading..." : "Start Batch Upload"}
          </button>
        </div>
      )}
    </div>
  );
}

export default UploadCsvSensor;
