// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import "./Deploy.s.sol";

contract DeployAmoy is Deploy {
    // Override the run function to add Amoy-specific deployment logic
    function run() public override {
        // Set up Amoy testnet parameters
        uint256 deployerPrivateKey = vm.envUint("AMOY_PRIVATE_KEY");
        string memory rpcUrl = vm.envString("AMOY_RPC_URL");
        
        // Set up the RPC URL for the Amoy testnet
        vm.createSelectFork(rpcUrl);
        
        console.log("Deploying to Amoy testnet...");
        console.log("RPC URL:", rpcUrl);
        
        // Call the parent contract's run function with the Amoy private key
        super.run();
    }
}
