import { ethers } from "ethers";
import { useEffect, useState } from "react";
import SensorRanking from "./contracts/SensorRanking.json"; // ABI
import UploadCsvSensor from "./CsvUploader";

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [sensors, setSensors] = useState([]);
  const [centralPool, setCentralPool] = useState(0);
  const [loading, setLoading] = useState(true);

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
    try {
      setLoading(true);

      // Get ranked sensor data from the contract
      const [ids, weights] = await contractInstance.getRankedSensors();
      const sensorData = [];
      for (let i = 0; i < ids.length; i++) {
        sensorData.push({
          id: ids[i],
          weight: parseFloat(weights[i].toString()),
        });
      }
      setSensors(sensorData);

      const pool = await contractInstance.getCentralWeightPool();
      setCentralPool(pool.toString());
    } catch (error) {
      console.error("Error loading sensors:", error);
    } finally {
      setLoading(false);
    }
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
          <p className="text-gray-700 mb-2">{centralPool}</p>

          <button
            onClick={() => loadSensors(contract)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Reload Sensors
          </button>
        </div>

        {/* CSV Uploader */}
        <div className="w-full md:w-1/3">
          <UploadCsvSensor provider={provider} account={account} />
        </div>
      </div>

      {/* Bottom Section */}
      <div>
        <h4 className="text-lg font-semibold mb-4">Sensor Rankings</h4>

        {loading ? (
          <p className="text-center text-gray-500">Loading sensors...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 shadow-lg">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 px-4 py-2">Rank</th>
                  <th className="border border-gray-300 px-4 py-2">
                    Sensor ID
                  </th>
                  <th className="border border-gray-300 px-4 py-2">Weight</th>
                </tr>
              </thead>
              <tbody>
                {sensors.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-4">
                      No sensors found.
                    </td>
                  </tr>
                ) : (
                  sensors.map((sensor, index) => (
                    <tr key={index} className="hover:bg-gray-100">
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {index + 1}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {sensor.id}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {sensor.weight}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
