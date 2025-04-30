// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SensorRanking {
    uint public centralWeightPool;

    struct SensorReading {
        string sensorId;
        int temp;
        int salinity;
        int ph;
        int nh4;
        int doValue;
        int ca;
    }

    SensorReading[] public readings;
    mapping(string => int) public sensorWeights;

    event SensorReadingAdded(
        string indexed sensorId,
        int temp,
        int salinity,
        int ph,
        int nh4,
        int doValue,
        int ca
    );

    constructor() {
        centralWeightPool = 100000;
    }

    function batchAddSensorReadings(
        string[] memory sensorIds,
        int[] memory temp,
        int[] memory salinity,
        int[] memory ph,
        int[] memory nh4,
        int[] memory doValue,
        int[] memory ca
    ) public {
        require(
            sensorIds.length == temp.length &&
            sensorIds.length == salinity.length &&
            sensorIds.length == ph.length &&
            sensorIds.length == nh4.length &&
            sensorIds.length == doValue.length &&
            sensorIds.length == ca.length,
            "Array lengths must match."
        );

        for (uint i = 0; i < sensorIds.length; i++) {
            readings.push(SensorReading({
                sensorId: sensorIds[i],
                temp: temp[i],
                salinity: salinity[i],
                ph: ph[i],
                nh4: nh4[i],
                doValue: doValue[i],
                ca: ca[i]
            }));

            emit SensorReadingAdded(
                sensorIds[i],
                temp[i],
                salinity[i],
                ph[i],
                nh4[i],
                doValue[i],
                ca[i]
            );

            int weight = calculateWeight(
                temp[i],
                salinity[i],
                ph[i],
                nh4[i],
                doValue[i],
                ca[i]
            );

            sensorWeights[sensorIds[i]] += weight;

            if (weight > 0) {
                require(centralWeightPool >= uint(weight), "Not enough weight in pool to subtract.");
                centralWeightPool -= uint(weight);
            } else {
                centralWeightPool += uint(-weight);
            }
        }
    }

    function calculateWeight(
        int temp,
        int salinity,
        int ph,
        int nh4,
        int doValue,
        int ca
    ) internal pure returns (int) {
        int weight = 0;

        // Temperature: ideal 20-30°C
        weight += (temp >= 20 && temp <= 30) ? int(100) : int(-100);

        // Salinity: ideal 0-35 ppt
        weight += (salinity >= 0 && salinity <= 35) ? int(80) : int(-80);

        // pH: ideal 6.5-8.5 (stored as *10, so compare with 65–85)
        weight += (ph >= 65 && ph <= 85) ? int(50) : int(-50);

        // NH4 (ammonia): ideal < 1 ppm (stored as *10, so compare with 0–10)
        weight += (nh4 >= 0 && nh4 <= 10) ? int(40) : int(-40);

        // DO (Dissolved Oxygen): ideal > 5 ppm (stored as *10; 50+)
        weight += (doValue >= 50) ? int(70) : int(-70);

        // Calcium: ideal 20-100 ppm
        weight += (ca >= 20 && ca <= 100) ? int(60) : int(-60);

        return weight;
    }

    function getReadingsCount() public view returns (uint) {
        return readings.length;
    }

    function getReading(uint index) public view returns (SensorReading memory) {
        require(index < readings.length, "Index out of bounds.");
        return readings[index];
    }

    function addToCentralWeightPool(uint amount) public {
        centralWeightPool += amount;
    }

    function getAllSensorWeights() public view returns (string[] memory ids, int[] memory weights) {
        uint total = 0;
        string[] memory tempIds = new string[](readings.length);

        for (uint i = 0; i < readings.length; i++) {
            string memory id = readings[i].sensorId;
            bool exists = false;
            for (uint j = 0; j < total; j++) {
                if (keccak256(abi.encodePacked(tempIds[j])) == keccak256(abi.encodePacked(id))) {
                    exists = true;
                    break;
                }
            }
            if (!exists) {
                tempIds[total] = id;
                total++;
            }
        }

        ids = new string[](total);
        weights = new int[](total);

        for (uint i = 0; i < total; i++) {
            ids[i] = tempIds[i];
            weights[i] = sensorWeights[tempIds[i]];
        }
    }

    function getRankedSensors() public view returns (string[] memory ids, int[] memory weights) {
        (string[] memory sensorIds, int[] memory sensorWeightsArr) = getAllSensorWeights();

        // Bubble Sort (simple and gas-expensive, but okay for small sets)
        for (uint i = 0; i < sensorIds.length; i++) {
            for (uint j = 0; j < sensorIds.length - 1; j++) {
                if (sensorWeightsArr[j] < sensorWeightsArr[j + 1]) {
                    // Swap weights
                    int tempW = sensorWeightsArr[j];
                    sensorWeightsArr[j] = sensorWeightsArr[j + 1];
                    sensorWeightsArr[j + 1] = tempW;

                    // Swap IDs
                    string memory tempId = sensorIds[j];
                    sensorIds[j] = sensorIds[j + 1];
                    sensorIds[j + 1] = tempId;
                }
            }
        }

        return (sensorIds, sensorWeightsArr);
    }
}
