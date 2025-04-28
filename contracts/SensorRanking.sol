// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract SensorRanking {
    struct Sensor {
        string sensorId;
        int totalWeight;
    }

    Sensor[] public sensors;
    mapping(string => uint) public sensorIndex;
    uint public centralWeightPool = 50000;

    constructor() {}

    // New Batch Insert Function
    function batchAddSensorReadings(
        string[] memory sensorIds,
        int[] memory temperatures,
        int[] memory tdsValues,
        int[] memory turbidities,
        int[] memory waterLevels,
        int[] memory phValues
    ) public {
        require(
            sensorIds.length == temperatures.length &&
            temperatures.length == tdsValues.length &&
            tdsValues.length == turbidities.length &&
            turbidities.length == waterLevels.length &&
            waterLevels.length == phValues.length,
            "Array lengths must match"
        );

        for (uint i = 0; i < sensorIds.length; i++) {
            int weight = calculateWeight(
                temperatures[i],
                tdsValues[i],
                turbidities[i],
                waterLevels[i],
                phValues[i]
            );

            if (sensorIndex[sensorIds[i]] > 0) {
                sensors[sensorIndex[sensorIds[i]] - 1].totalWeight += weight;
            } else {
                sensors.push(Sensor(sensorIds[i], weight));
                sensorIndex[sensorIds[i]] = sensors.length;
            }

            if (weight > 0) {
                centralWeightPool -= uint(weight);
            } else {
                centralWeightPool += uint(-weight);
            }
        }
    }

    // New Weight Calculation Logic
    function calculateWeight(
        int temperature,
        int tds,
        int turbidity,
        int waterLevel,
        int ph
    ) private pure returns (int) {
        int weight = 0;

        // Temperature: 20°C - 30°C ideal
        if (temperature >= 20 && temperature <= 30) {
            weight += 50;
        } else {
            weight -= 30;
        }

        // TDS: 300 ppm - 500 ppm ideal
        if (tds >= 300 && tds <= 500) {
            weight += 40;
        } else {
            weight -= 20;
        }

        // Turbidity: 0 - 5 NTU ideal
        if (turbidity >= 0 && turbidity <= 5) {
            weight += 30;
        } else {
            weight -= 20;
        }

        // Water Level: 50 cm - 100 cm ideal
        if (waterLevel >= 50 && waterLevel <= 100) {
            weight += 60;
        } else {
            weight -= 40;
        }

        // pH: 6 - 8 ideal
        if (ph >= 6 && ph <= 8) {
            weight += 70;
        } else {
            weight -= 50;
        }

        return weight;
    }

    // Sort sensors based on totalWeight (High to Low)
    function sortSensors() public {
        uint n = sensors.length;
        for (uint i = 0; i < n; i++) {
            for (uint j = 0; j < n - i - 1; j++) {
                if (sensors[j].totalWeight < sensors[j + 1].totalWeight) {
                    Sensor memory temp = sensors[j];
                    sensors[j] = sensors[j + 1];
                    sensors[j + 1] = temp;
                }
            }
        }
    }

    // Get total number of sensors
    function getSensorCount() public view returns (uint) {
        return sensors.length;
    }

    // Get specific sensor details
    function getSensor(uint index) public view returns (string memory, int) {
        return (sensors[index].sensorId, sensors[index].totalWeight);
    }

    // Get all sorted sensor IDs
    function getSortedSensors() public view returns (string[] memory) {
        string[] memory sensorIds = new string[](sensors.length);
        for (uint i = 0; i < sensors.length; i++) {
            sensorIds[i] = sensors[i].sensorId;
        }
        return sensorIds;
    }

    // Get remaining central pool weight
    function getCentralWeightPool() public view returns (uint) {
        return centralWeightPool;
    }
}
