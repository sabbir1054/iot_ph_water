import { ethers } from "ethers";
import Papa from "papaparse";
import { useState } from "react";
import SensorRanking from "./contracts/SensorRanking.json";

function UploadCsvSensor({ provider, account }) {
  const [csvData, setCsvData] = useState([]);
  const [uploading, setUploading] = useState(false);
  const contractAddress = SensorRanking.networks[5777].address;
  console.log(contractAddress);
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvData(results.data);
        console.log("Parsed CSV data:", results.data);
      },
    });
  };

  const handleUpload = async () => {
    if (!provider || !account || csvData.length === 0) {
      alert("Missing provider, account, or no data loaded!");
      return;
    }

    try {
      const signer = await provider.getSigner();
      const contractAddress = SensorRanking.networks[5777].address;
      console.log(contractAddress);

      const contract = new ethers.Contract(
        contractAddress,
        SensorRanking.abi,
        signer
      );

      // Prepare batch data arrays
      const sensorIds = [];
      const temperatures = [];
      const tdsValues = [];
      const turbidities = [];
      const waterLevels = [];
      const phValues = [];
      csvData.forEach((row) => {
        if (
          row.sensorId !== undefined &&
          row.temperature !== undefined &&
          row.tds !== undefined &&
          row.turbidity !== undefined &&
          row.waterLevel !== undefined &&
          row.ph !== undefined
        ) {
          sensorIds.push(row.sensorId);
          temperatures.push(Number(row.temperature));
          tdsValues.push(Number(row.tds));
          turbidities.push(Number(row.turbidity));
          waterLevels.push(Number(row.waterLevel));
          phValues.push(Number(row.ph));
        }
      });

      setUploading(true);

      // 🔥 Single batch transaction
      console.log({
        sensorIds,
        temperatures,
        tdsValues,
        turbidities,
        waterLevels,
        phValues,
      });
      const tx = await contract.batchAddSensorReadings(
        sensorIds,
        temperatures,
        tdsValues,
        turbidities,
        waterLevels,
        phValues
      );

      await tx.wait();
      alert("All sensor data uploaded in one batch successfully!");
    } catch (error) {
      console.log(error);
      alert("Error uploading sensor data!");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-lg w-1/2">
      <h2 className="text-xl font-bold mb-4">
        Upload Sensor CSV (Batch Upload)
      </h2>

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
