// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import "forge-std/Script.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {IERC1822Proxiable} from "@openzeppelin/contracts/interfaces/draft-IERC1822.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

// Import interfaces instead of implementations where possible
import {IOwnmaliAsset} from "../src/interfaces/IOwnmaliAsset.sol";
import {IOwnmaliAssetManager} from "../src/interfaces/IOwnmaliAssetManager.sol";
import {IOwnmaliDAO} from "../src/interfaces/IOwnmaliDAO.sol";
import {IOwnmaliFinancialLedger} from "../src/interfaces/IOwnmaliFinancialLedger.sol";
import {IOwnmaliOrderManager} from "../src/interfaces/IOwnmaliOrderManager.sol";
import {IOwnmaliSPV} from "../src/interfaces/IOwnmaliSPV.sol";
import {IOwnmaliRegistry} from "../src/interfaces/IOwnmaliRegistry.sol";
import {IOwnmaliFactory} from "../src/interfaces/IOwnmaliFactory.sol";

// Import implementations
import {OwnmaliAsset} from "../src/OwnmaliAsset.sol";
import {OwnmaliAssetManager} from "../src/OwnmaliAssetManager.sol";
import {OwnmaliDAO} from "../src/OwnmaliDAO.sol";
import {OwnmaliFinancialLedger} from "../src/OwnmaliFinancialLedger.sol";
import {OwnmaliOrderManager} from "../src/OwnmaliOrderManager.sol";
import {OwnmaliSPV} from "../src/OwnmaliSPV.sol";
import {OwnmaliRegistry} from "../src/OwnmaliRegistry.sol";
import {OwnmaliFactory} from "../src/OwnmaliFactory.sol";

// Import mocks
import {MockIdentityRegistry} from "../test/mocks/MockIdentityRegistry.sol";
import {MockCompliance} from "../test/mocks/MockCompliance.sol";

contract Deploy is Script {
    event ContractDeployed(string name, address contractAddress);
    
    function run() external {
        uint256 deployerPrivateKey = 0xb5583cc915872fc8a8d2563bcbb5976db91450b2b6c9c9aa3cbe05fc0001869b;
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying contracts with the account:", deployer);
        console.log("Account balance:", deployer.balance);
        
        vm.startBroadcast(deployerPrivateKey);

        // Deploy mock contracts for KYC/Compliance
        console.log("Deploying mock contracts...");
        MockIdentityRegistry mockIdentityRegistry = new MockIdentityRegistry();
        MockCompliance mockCompliance = new MockCompliance();
        
        emit ContractDeployed("MockIdentityRegistry", address(mockIdentityRegistry));
        emit ContractDeployed("MockCompliance", address(mockCompliance));

        // Deploy implementation contracts
        console.log("Deploying implementation contracts...");
        OwnmaliAsset assetTemplate = new OwnmaliAsset();
        OwnmaliAssetManager assetManagerTemplate = new OwnmaliAssetManager();
        OwnmaliDAO daoTemplate = new OwnmaliDAO();
        OwnmaliFinancialLedger financialLedgerTemplate = new OwnmaliFinancialLedger();
        OwnmaliOrderManager orderManagerTemplate = new OwnmaliOrderManager();
        OwnmaliSPV spvTemplate = new OwnmaliSPV();
        OwnmaliRegistry registryImplementation = new OwnmaliRegistry();
        OwnmaliFactory factoryImplementation = new OwnmaliFactory();

        emit ContractDeployed("OwnmaliAsset (Template)", address(assetTemplate));
        emit ContractDeployed("OwnmaliAssetManager (Template)", address(assetManagerTemplate));
        emit ContractDeployed("OwnmaliDAO (Template)", address(daoTemplate));
        emit ContractDeployed("OwnmaliFinancialLedger (Template)", address(financialLedgerTemplate));
        emit ContractDeployed("OwnmaliOrderManager (Template)", address(orderManagerTemplate));
        emit ContractDeployed("OwnmaliSPV (Template)", address(spvTemplate));
        emit ContractDeployed("OwnmaliRegistry (Implementation)", address(registryImplementation));
        emit ContractDeployed("OwnmaliFactory (Implementation)", address(factoryImplementation));

        // No need for ProxyAdmin with UUPS pattern
        // The upgrade functionality is managed by the implementation contract itself

        // Deploy proxies using UUPS pattern
        console.log("Deploying UUPS proxies...");
        
        // Deploy Registry proxy
        bytes memory registryInitData = abi.encodeWithSelector(
            OwnmaliRegistry.initialize.selector
        );
        
        // Deploy ERC1967 proxy pointing to the registry implementation
        ERC1967Proxy registryProxy = new ERC1967Proxy(
            address(registryImplementation),
            registryInitData
        );
        OwnmaliRegistry registry = OwnmaliRegistry(address(registryProxy));
        emit ContractDeployed("OwnmaliRegistry (UUPS Proxy)", address(registry));
        
        // Deploy Factory proxy
        bytes memory factoryInitData = abi.encodeWithSelector(
            OwnmaliFactory.initialize.selector,
            address(registry),
            deployer,
            address(mockIdentityRegistry),
            address(mockCompliance)
        );
        
        // Deploy ERC1967 proxy pointing to the factory implementation
        ERC1967Proxy factoryProxy = new ERC1967Proxy(
            address(factoryImplementation),
            factoryInitData
        );
        OwnmaliFactory factory = OwnmaliFactory(address(factoryProxy));
        emit ContractDeployed("OwnmaliFactory (UUPS Proxy)", address(factory));
        
        // Grant upgrade role to the deployer for both proxies
        UUPSUpgradeable(address(registry)).upgradeToAndCall(
            address(registryImplementation),
            abi.encodeWithSignature("grantRole(bytes32,address)", registry.DEFAULT_ADMIN_ROLE(), deployer)
        );
        
        UUPSUpgradeable(address(factory)).upgradeToAndCall(
            address(factoryImplementation),
            abi.encodeWithSignature("grantRole(bytes32,address)", factory.DEFAULT_ADMIN_ROLE(), deployer)
        );
        
        // Set up factory with templates
        console.log("Setting up factory with templates...");
        factory.setTemplate("spv", address(spvTemplate));
        factory.setTemplate("asset", address(assetTemplate));
        factory.setTemplate("realEstateAsset", address(assetTemplate));
        factory.setTemplate("assetManager", address(assetManagerTemplate));
        factory.setTemplate("orderManager", address(orderManagerTemplate));
        factory.setTemplate("financialLedger", address(financialLedgerTemplate));
        factory.setTemplate("dao", address(daoTemplate));
        
        // Grant necessary roles
        console.log("Setting up roles...");
        registry.grantRole(registry.REGISTRAR_ROLE(), address(factory));
        
        // Grant admin role to the deployer
        factory.grantRole(factory.DEFAULT_ADMIN_ROLE(), deployer);
        
        console.log("\nDeployment completed successfully!");
        console.log("\nDeployed Contracts:");
        console.log("=================");
        console.log("MockIdentityRegistry:", address(mockIdentityRegistry));
        console.log("MockCompliance:", address(mockCompliance));
        console.log("OwnmaliRegistry (Proxy):", address(registry));
        console.log("OwnmaliFactory (Proxy):", address(factory));
        // ProxyAdmin not used with UUPS
        console.log("\nTemplates:");
        console.log("=========");
        console.log("OwnmaliAsset:", address(assetTemplate));
        console.log("OwnmaliAssetManager:", address(assetManagerTemplate));
        console.log("OwnmaliDAO:", address(daoTemplate));
        console.log("OwnmaliFinancialLedger:", address(financialLedgerTemplate));
        console.log("OwnmaliOrderManager:", address(orderManagerTemplate));
        console.log("OwnmaliSPV:", address(spvTemplate));
        
        vm.stopBroadcast();
    }
}