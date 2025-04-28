/* eslint-disable no-unused-vars */
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import Papa from "papaparse";
import CsvUploader from "./CsvUploader"; // Import the new component
import SensorRanking from "./contracts/SensorRanking.json"; // ABI

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [sensorCount, setSensorCount] = useState(0);
  const [sensors, setSensors] = useState([]);
  const [centralPool, setCentralPool] = useState(0);

  useEffect(() => {
    const loadBlockchainData = async () => {
      if (!window.ethereum) {
        alert("MetaMask not detected");
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const signer = await provider.getSigner();
      setProvider(provider);
      setAccount(await signer.getAddress());

      const contractAddress = SensorRanking.networks[5777].address;
      const contractInstance = new ethers.Contract(
        contractAddress,
        SensorRanking.abi,
        signer
      );
      setContract(contractInstance);

      loadSensors(contractInstance);
    };
    loadBlockchainData();
  }, []);

  const loadSensors = async (contractInstance) => {
    const count = await contractInstance.getSensorCount();
    setSensorCount(count);

    let sensorData = [];
    for (let i = 0; i < count; i++) {
      const [id, weight] = await contractInstance.getSensor(i);
      sensorData.push({ id, weight: weight });
    }
    setSensors(sensorData);

    const pool = await contractInstance.getCentralWeightPool();
    setCentralPool(pool);
  };

  const handleCsvUpload = async (parsedCsvData) => {
    if (!contract) return;

    for (const row of parsedCsvData) {
      const sensorId = row.sensorId;
      const moisture = parseInt(row.moisture);
      const ph = parseInt(row.ph);

      if (sensorId && !isNaN(moisture) && !isNaN(ph)) {
        try {
          const tx = await contract.addSensorReading(sensorId, moisture, ph);
          await tx.wait();
          console.log(`Sensor ${sensorId} added successfully.`);
        } catch (error) {
          console.error(`Failed to add sensor ${sensorId}:`, error);
        }
      } else {
        console.warn("Invalid row skipped:", row);
      }
    }

    alert("CSV Upload Complete!");
    loadSensors(contract);
  };

  return (
    <div className="p-6 flex flex-col gap-10">
      {/* Top Section */}
      <div className="flex flex-wrap gap-10">
        {/* Account Info */}
        <div className="w-full md:w-1/3 bg-gray-100 p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold mb-2">Connected Account:</h2>
          <p className="text-gray-700 mb-2 break-words">{account}</p>

          <h3 className="text-lg font-semibold mb-2">Central Weight Pool:</h3>
          <p className="text-gray-700 mb-2">{centralPool.toString()}</p>

          <h3 className="text-lg font-semibold mb-2">Total Sensors:</h3>
          <p className="text-gray-700 mb-4">{sensorCount}</p>

          <button
            onClick={() => loadSensors(contract)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Reload Sensors
          </button>
        </div>

        {/* CSV Uploader */}
        <div className="w-full md:w-1/3">
          <CsvUploader onUploadComplete={handleCsvUpload} />
        </div>
      </div>

      {/* Bottom Section */}
      <div>
        <h4 className="text-lg font-semibold mb-2">Sensor Rankings</h4>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 shadow-lg">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-4 py-2">#</th>
                <th className="border border-gray-300 px-4 py-2">Sensor ID</th>
                <th className="border border-gray-300 px-4 py-2">Weight</th>
              </tr>
            </thead>
            <tbody>
              {sensors.map((sensor, index) => (
                <tr key={index} className="hover:bg-gray-100">
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {index + 1}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {sensor.id}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {sensor.weight.toString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
