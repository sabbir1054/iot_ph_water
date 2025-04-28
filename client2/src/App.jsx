/* eslint-disable no-unused-vars */
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import SensorRanking from "./contracts/SensorRanking.json"; // Import ABI

function App() {
  /* const [account, setAccount] = useState(
    "0x15FaA0012d4E83A2cb9864C12350D379d2D44dB3"
  ); */
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [sensorCount, setSensorCount] = useState(0);
  const [sensors, setSensors] = useState([]);
  const [centralPool, setCentralPool] = useState(0);
  const [sensorId, setSensorId] = useState("");
  const [moisture, setMoisture] = useState("");
  const [ph, setPh] = useState("");

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
      console.log("ssss", SensorRanking.networks[5777].address);

      // const contractAddress = "0x471b344338c41EB3A03AD87D9b1b48A1618a86b3";
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
    console.log("fdfsd", sensorData);

    const pool = await contractInstance.getCentralWeightPool();

    setCentralPool(pool);
  };

  const addSensorReading = async () => {
    if (!contract) return;
    const tx = await contract.addSensorReading(
      sensorId,
      parseInt(moisture),
      parseInt(ph)
    );
    await tx.wait();
    alert("Sensor data added!");
    loadSensors(contract);
  };

  return (
    <div className="p-6 flex gap-10">
      {/* Left Section: Details & Input Form */}
      <div className="w-1/3 bg-gray-100 p-6 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold mb-2">Connected Account:</h2>
        <p className="text-gray-700 mb-2">{account}</p>

        <h3 className="text-lg font-semibold mb-2">Central Weight Pool:</h3>
        <p className="text-gray-700 mb-2">{centralPool}</p>

        <h3 className="text-lg font-semibold mb-2">Total Sensors:</h3>
        <p className="text-gray-700 mb-4">{sensorCount}</p>

        <button
          onClick={() => loadSensors(contract)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Load Sensors
        </button>

        <h4 className="text-lg font-semibold mt-6">Add Sensor Data</h4>
        <div className="flex flex-col gap-3 mt-2">
          <input
            type="text"
            placeholder="Sensor ID"
            className="border p-2 rounded"
            onChange={(e) => setSensorId(e.target.value)}
          />
          <input
            type="number"
            placeholder="Moisture"
            className="border p-2 rounded"
            onChange={(e) => setMoisture(e.target.value)}
          />
          <input
            type="number"
            placeholder="pH"
            className="border p-2 rounded"
            onChange={(e) => setPh(e.target.value)}
          />
          <button
            onClick={addSensorReading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Submit
          </button>
        </div>
      </div>

      {/* Right Section: Sensor Rankings */}
      <div className="w-2/3">
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
                    {sensor.weight}
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
