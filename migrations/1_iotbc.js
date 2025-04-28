const SensorRanking = artifacts.require("SensorRanking");

module.exports = function (deployer) {
  deployer.deploy(SensorRanking);
};
