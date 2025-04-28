
module.exports = {
  networks: {
    development: {
      host: "127.0.0.1", // Localhost for Ganache
      port: 7545, // Default Ganache port
      network_id: "*", // Match any network ID
    },
  },

  // Configure compilers
  compilers: {
    solc: {
      version: "0.8.19", // Use Solidity version 0.8.19
    },
  },

  // Truffle DB is disabled by default
  db: {
    enabled: false,
  },
};
