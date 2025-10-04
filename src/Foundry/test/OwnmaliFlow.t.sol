// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import "forge-std/Test.sol";
import "../src/OwnmaliFactory.sol";
import "../src/OwnmaliSPV.sol";
import "../src/OwnmaliAsset.sol";
import "../src/OwnmaliAssetManager.sol";
import "../src/OwnmaliOrderManager.sol";
import "../src/OwnmaliFinancialLedger.sol";
import "../src/OwnmaliDAO.sol";
import "../src/OwnmaliRegistry.sol";
import "../src/interfaces/IOwnmaliRegistry.sol";
import "./mocks/MockIdentityRegistry.sol";
import "./mocks/MockCompliance.sol";
import "../src/interfaces/IIdentityRegistry.sol";
import "../src/interfaces/IModularCompliance.sol";

contract OwnmaliFactoryTest is Test {
    OwnmaliFactory public factory;
    IOwnmaliRegistry public registry;
    address public admin;
    address public spvCreator;
    address public investor;

    // Test data
    bytes32 public constant SPV_ID = keccak256("TEST_SPV");
    bytes32 public constant ASSET_ID = keccak256("TEST_ASSET");
    bytes32 public constant ASSET_TYPE = keccak256("REAL_ESTATE");
    bytes32 public constant METADATA_CID = keccak256("metadata");
    bytes32 public constant LEGAL_METADATA_CID = keccak256("legal_metadata");

    // Contract addresses
    address public assetContract;
    address public assetManager;
    address public orderManager;
    address public financialLedger;
    address public dao;

    function setUp() public {
        // Setup accounts
        admin = makeAddr("admin");
        spvCreator = makeAddr("spvCreator");
        investor = makeAddr("investor");
        vm.deal(investor, 100 ether);

        // Deploy registry and factory
        vm.startPrank(admin);
        OwnmaliRegistry registryImpl = new OwnmaliRegistry();
        registryImpl.initialize();
        registry = IOwnmaliRegistry(address(registryImpl));

        // Deploy mock contracts
        MockIdentityRegistry mockIdentityRegistry = new MockIdentityRegistry();
        MockCompliance mockCompliance = new MockCompliance();

        factory = new OwnmaliFactory();
        factory.initialize(
            address(registry),
            admin,
            address(mockIdentityRegistry),
            address(mockCompliance)
        );

        // Setup templates
        OwnmaliSPV spvTemplate = new OwnmaliSPV();
        OwnmaliAsset assetTemplate = new OwnmaliAsset();
        OwnmaliAssetManager assetManagerTemplate = new OwnmaliAssetManager();
        OwnmaliOrderManager orderManagerTemplate = new OwnmaliOrderManager();
        OwnmaliFinancialLedger financialLedgerTemplate = new OwnmaliFinancialLedger();
        OwnmaliDAO daoTemplate = new OwnmaliDAO();

        factory.setTemplate("spv", address(spvTemplate));
        factory.setTemplate("asset", address(assetTemplate));
        factory.setTemplate("realEstateAsset", address(assetTemplate));
        factory.setTemplate("assetManager", address(assetManagerTemplate));
        factory.setTemplate("orderManager", address(orderManagerTemplate));
        factory.setTemplate("financialLedger", address(financialLedgerTemplate));
        factory.setTemplate("dao", address(daoTemplate));

        // Grant roles
        factory.grantRole(factory.SPV_CREATOR_ROLE(), spvCreator);
        
        // Grant REGISTRAR_ROLE to the factory so it can register SPVs and assets
        registryImpl.grantRole(registryImpl.REGISTRAR_ROLE(), address(factory));
        vm.stopPrank();
    }

    function test_CreateSPVAndAsset() public {
        vm.startPrank(spvCreator);

        // Prepare parameters
        OwnmaliFactory.SPVParams memory spvParams = OwnmaliFactory.SPVParams({
            spvId: SPV_ID,
            name: "Test SPV",
            kycStatus: true,
            countryCode: "US",
            metadataCID: METADATA_CID,
            owner: spvCreator
        });

        OwnmaliFactory.AssetCoreParams memory coreParams = OwnmaliFactory.AssetCoreParams({
            assetId: ASSET_ID,
            name: "Test Asset",
            symbol: "TASSET",
            metadataCID: METADATA_CID,
            legalMetadataCID: LEGAL_METADATA_CID,
            assetType: ASSET_TYPE,
            chainId: uint16(block.chainid)
        });

        OwnmaliFactory.AssetConfigParams memory configParams = OwnmaliFactory.AssetConfigParams({
            maxSupply: 1_000_000,  // 1 million tokens
            tokenPrice: 1e18,       // 1 token = 1 ETH
            cancelDelay: 1 days,
            dividendPct: 5,
            premintAmount: 0,
            minInvestment: 10,      // Minimum 10 tokens
            maxInvestment: 10_000,  // Maximum 10,000 tokens
            isRealEstate: true,
            votingPeriodSeconds: 3 days,
            minVotingTokens: 100,   // 100 tokens for voting
            approvalThresholdPct: 51
        });

        // Create SPV and Asset
        OwnmaliFactory.Deployment memory deployment = factory.createSPVAndAsset(
            spvParams,
            coreParams,
            configParams
        );

        // Verify deployment
        assertTrue(deployment.spvContract != address(0), "SPV not deployed");
        assertTrue(deployment.assetContract != address(0), "Asset not deployed");
        assertTrue(deployment.assetManager != address(0), "Asset Manager not deployed");
        assertTrue(deployment.orderManager != address(0), "Order Manager not deployed");
        assertTrue(deployment.financialLedger != address(0), "Financial Ledger not deployed");
        assertTrue(deployment.dao != address(0), "DAO not deployed");

        vm.stopPrank();
    }

    function test_PlaceOrderAndTransferTokens() public {
        // First create SPV and Asset
        test_CreateSPVAndAsset();
        
        // Get the SPV data from the registry
        IOwnmaliRegistry.SPVData memory spvData = registry.getSPV(SPV_ID);
        
        // Get the deployed contract instances
        IOwnmaliAsset asset = IOwnmaliAsset(spvData.assetContract);
        IOwnmaliOrderManager orderMgr = IOwnmaliOrderManager(spvData.orderManager);
        
        // Store contract addresses in state variables for other tests
        assetContract = spvData.assetContract;
        orderManager = spvData.orderManager;
        financialLedger = spvData.financialLedger;
        dao = spvData.dao;
        assetManager = spvData.assetManager;
        
        // Define order parameters - using token amounts
        uint256 orderTokens = 100; // 100 tokens (meets min investment of 10 tokens)
        
        // Place order as SPV creator on behalf of investor
        vm.startPrank(spvCreator);
        
        // Create an order for the investor
        uint256 orderId = orderMgr.createOrder(investor, orderTokens);
        
        // Verify order is in Pending state
        (address orderInvestor, uint256 amount, IOwnmaliOrderManager.OrderStatus status, ) = 
            orderMgr.getOrder(orderId);
            
        assertEq(orderInvestor, investor, "Order investor mismatch");
        assertEq(amount, orderTokens, "Order amount mismatch");
        assertTrue(status == IOwnmaliOrderManager.OrderStatus.Pending, "Order should be in Pending state");
        
        // Approve order as SPV creator
        vm.stopPrank();
        vm.startPrank(spvCreator);
        
        // Complete the order
        orderMgr.completeOrder(orderId);
        
        // Verify the order is now completed
        (, , status, ) = orderMgr.getOrder(orderId);
        assertTrue(status == IOwnmaliOrderManager.OrderStatus.Completed, "Order should be in Completed state");
        
        // Verify investor's token balance
        uint256 investorBalance = asset.balanceOf(investor);
        assertEq(investorBalance, orderTokens, "Investor token balance mismatch");
        
        vm.stopPrank();

        // Place second order as SPV creator on behalf of investor
        vm.startPrank(spvCreator);
        uint256 secondOrderTokens = 50; // 50 more tokens (meets min investment of 10 tokens)
        
        // Create another order for the investor
        uint256 secondOrderId = IOwnmaliOrderManager(orderManager).createOrder(investor, secondOrderTokens);

        // Complete the second order
        IOwnmaliOrderManager(orderManager).completeOrder(secondOrderId);

        // Verify token transfer for both orders
        uint256 totalTokens = orderTokens + secondOrderTokens;
        assertEq(asset.balanceOf(investor), totalTokens, "Token transfer failed");
        
        vm.stopPrank();
    }
  
   // Test case for OwnmaliAsset Deployment
function test_OwnmaliAssetDeployment() public {
    vm.startPrank(spvCreator);
    
    // Create asset
    OwnmaliAsset asset = new OwnmaliAsset();
    
    // Prepare initialization data
    OwnmaliAsset.AssetInitData memory initData = OwnmaliAsset.AssetInitData({
        name: "Test Asset",
        symbol: "TST",
        decimals: 18,
        maxSupply: 1_000_000 * 10**18, // 1M tokens with 18 decimals
        tokenPrice: 0.01 ether, // 0.01 ETH per token
        assetOwner: spvCreator,
        factory: address(this),
        orderManager: address(0x123), // Mock address, replace with actual in real test
        dao: address(0x124),         // Mock address, replace with actual in real test
        financialLedger: address(0x125), // Mock address, replace with actual in real test
        assetManager: address(0x126),    // Mock address, replace with actual in real test
        spvId: keccak256("test-spv-1"),
        assetId: keccak256("test-asset-1"),
        metadataCID: keccak256("test-metadata-cid"),
        dividendPct: 2000, // 20.00% dividend
        isActive: true,
        identityRegistry: address(0x127), // Mock address
        compliance: address(0x128)      // Mock address
    });
    
    // Initialize with proper data
    asset.initialize(abi.encode(initData));
    
    // Verify asset properties
    assertEq(asset.name(), "Test Asset", "Incorrect asset name");
    assertEq(asset.symbol(), "TST", "Incorrect asset symbol");
    assertEq(asset.decimals(), 18, "Incorrect decimals");
    assertEq(asset.totalSupply(), 0, "Initial supply should be 0");
    
    // Verify roles
    assertTrue(asset.hasRole(asset.DEFAULT_ADMIN_ROLE(), spvCreator), "SPV creator should have admin role");
    assertTrue(asset.hasRole(asset.ASSET_ADMIN_ROLE(), spvCreator), "SPV creator should have asset admin role");
    assertTrue(asset.hasRole(asset.MINTER_ROLE(), spvCreator), "SPV creator should have minter role");
    
    vm.stopPrank();
}
}
