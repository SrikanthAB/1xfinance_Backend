// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts/utils/Address.sol";

/**
 * @title OwnmaliRegistry
 * @notice Central registry for SPVs and assets in the Ownmali ecosystem
 * @dev Uses UUPS proxy pattern for upgradeability and AccessControl for role management
 */
contract OwnmaliRegistry is
    Initializable,
    UUPSUpgradeable,
    AccessControlUpgradeable,
    PausableUpgradeable
{
    using Address for address;

    /*//////////////////////////////////////////////////////////////
                               CONSTANTS
    //////////////////////////////////////////////////////////////*/
    bytes32 public constant REGISTRY_ADMIN_ROLE = keccak256("REGISTRY_ADMIN_ROLE");
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");

    /*//////////////////////////////////////////////////////////////
                               STRUCTS
    //////////////////////////////////////////////////////////////*/
    struct SPVContracts {
        address spvContract;
        address assetContract;
        address orderManager;
        address financialLedger;
        address dao;
        address assetManager;
    }

    struct SPVInfo {
        string name;
        bool isKycCompliant;
        string countryCode;
        bytes32 metadataCID;
        address owner;
        bool isActive;
    }

    struct Asset {
        address assetAddress;
        address orderManager;
        address financialLedger;
        address dao;
        address assetManager;
        string name;
        bytes32 assetType;
        bytes32 metadataCID;
        bool isActive;
    }

    /*//////////////////////////////////////////////////////////////
                               STORAGE
    //////////////////////////////////////////////////////////////*/
    // SPV mappings
    mapping(bytes32 => SPVContracts) private _spvContracts;
    mapping(bytes32 => SPVInfo) private _spvInfo;
    
    // Asset mapping
    mapping(bytes32 => Asset) private _assets;
    
    // SPV to assets mapping
    mapping(bytes32 => bytes32[]) private _spvAssets;
    
    // Version info
    string private _version;
    
    // Storage gap for future upgrades
    uint256[50] private __gap;

    /*//////////////////////////////////////////////////////////////
                               EVENTS
    //////////////////////////////////////////////////////////////*/
    event SPVRegistered(
        bytes32 indexed spvId,
        address indexed spvContract,
        address indexed assetContract,
        address orderManager,
        address financialLedger,
        address dao,
        address assetManager
    );

    event SPVAdditionalInfo(
        bytes32 indexed spvId,
        bytes32 metadataCID,
        address owner
    );

    event AssetRegistered(
        bytes32 indexed spvId,
        bytes32 indexed assetId,
        address indexed assetAddress,
        address orderManager,
        address financialLedger,
        address dao,
        address assetManager
    );

    event AssetAdditionalInfo(
        bytes32 indexed assetId,
        bytes32 metadataCID
    );

    event SPVStatusUpdated(bytes32 indexed spvId, bool indexed isActive);
    event AssetStatusUpdated(bytes32 indexed assetId, bool indexed isActive);
    event SPVContractUpdated(bytes32 indexed spvId, string indexed contractType, address indexed newAddress);
    event AssetContractUpdated(bytes32 indexed assetId, string indexed contractType, address indexed newAddress);

    /*//////////////////////////////////////////////////////////////
                         CUSTOM ERRORS
    //////////////////////////////////////////////////////////////*/
    error InvalidAddress();
    error InvalidStringLength();
    error InvalidCountryCode();
    error InvalidMetadataCID();
    error InvalidAssetType();
    error InvalidOrDuplicateSPV();
    error InvalidOrDuplicateAsset();
    error SPVNotFound(bytes32 id);
    error AssetNotFound(bytes32 id);
    error SPVNotActive(bytes32 id);
    error AssetNotActive(bytes32 id);
    error InvalidContractType();

    /*//////////////////////////////////////////////////////////////
                         MODIFIERS
    //////////////////////////////////////////////////////////////*/
    modifier onlyAdmin() {
        require(hasRole(REGISTRY_ADMIN_ROLE, msg.sender), "OwnmaliRegistry: caller is not admin");
        _;
    }

    modifier onlyRegistrar() {
        require(
            hasRole(REGISTRY_ADMIN_ROLE, msg.sender) || 
            hasRole(REGISTRAR_ROLE, msg.sender), 
            "OwnmaliRegistry: caller is not registrar"
        );
        _;
    }

    modifier spvExists(bytes32 spvId) {
        if (_spvContracts[spvId].spvContract == address(0)) revert SPVNotFound(spvId);
        _;
    }

    modifier spvActive(bytes32 spvId) {
        if (!_spvInfo[spvId].isActive) revert SPVNotActive(spvId);
        _;
    }

    modifier assetExists(bytes32 assetId) {
        if (_assets[assetId].assetAddress == address(0)) revert AssetNotFound(assetId);
        _;
    }

    modifier assetActive(bytes32 assetId) {
        if (!_assets[assetId].isActive) revert AssetNotActive(assetId);
        _;
    }

    /*//////////////////////////////////////////////////////////////
                         INITIALIZER
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Initializes the registry contract
     */
    function initialize() external initializer {
        __Pausable_init();
        __UUPSUpgradeable_init();
        __AccessControl_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(REGISTRY_ADMIN_ROLE, msg.sender);
        _setRoleAdmin(REGISTRY_ADMIN_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(REGISTRAR_ROLE, REGISTRY_ADMIN_ROLE);
        
        _version = "1.0.0";
    }

    /*//////////////////////////////////////////////////////////////
                         EXTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    /**
     * @notice Registers a new SPV
     * @param spvId Unique identifier for the SPV
     * @param spvData Encoded SPV data to avoid stack too deep errors
     */
    function registerSPV(bytes32 spvId, bytes calldata spvData) 
        external 
        onlyRegistrar 
        whenNotPaused 
    {
        // Extract SPV data in batches to avoid stack too deep
        (
            string memory name,
            bool kycStatus,
            string memory countryCode,
            bytes32 metadataCID,
            address owner
        ) = _extractSPVBasicInfo(spvData);

        (
            address spvContract,
            address assetContract,
            address orderManager,
            address financialLedger,
            address dao,
            address assetManager
        ) = _extractSPVContractAddresses(spvData);

        // Validate SPV data
        _validateSPVRegistration(
            spvId,
            name,
            countryCode,
            metadataCID,
            owner,
            spvContract,
            assetContract,
            orderManager,
            financialLedger,
            dao,
            assetManager
        );

        // Store SPV data
        _storeSPVData(
            spvId,
            name,
            kycStatus,
            countryCode,
            metadataCID,
            owner,
            spvContract,
            assetContract,
            orderManager,
            financialLedger,
            dao,
            assetManager
        );
    }

    /**
     * @notice Registers a new asset
     * @param spvId The ID of the SPV
     * @param assetId Unique identifier for the asset
     * @param assetData Encoded asset data to avoid stack too deep errors
     */
    function registerAsset(bytes32 spvId, bytes32 assetId, bytes calldata assetData) 
        external 
        onlyRegistrar 
        whenNotPaused 
        spvExists(spvId)
        spvActive(spvId)
    {
        // Extract asset data
        (
            string memory name,
            bytes32 assetType,
            address assetAddress,
            address orderManager,
            address financialLedger,
            address dao,
            address assetManager,
            bytes32 metadataCID
        ) = abi.decode(assetData, (
            string, bytes32, address, address, address, address, address, bytes32
        ));

        // Validate asset data
        _validateAssetRegistration(
            assetId,
            name,
            assetType,
            assetAddress,
            orderManager,
            financialLedger,
            dao,
            assetManager,
            metadataCID
        );

        // Store asset data
        _storeAssetData(
            spvId,
            assetId,
            name,
            assetType,
            assetAddress,
            orderManager,
            financialLedger,
            dao,
            assetManager,
            metadataCID
        );
    }

    /**
     * @notice Updates the status of an SPV
     * @param spvId The ID of the SPV
     * @param isActive The new status
     */
    function updateSPVStatus(bytes32 spvId, bool isActive) 
        external 
        onlyAdmin 
        whenNotPaused 
        spvExists(spvId) 
    {
        _spvInfo[spvId].isActive = isActive;
        emit SPVStatusUpdated(spvId, isActive);
    }

    /**
     * @notice Updates the status of an asset
     * @param assetId The ID of the asset
     * @param isActive The new status
     */
    function updateAssetStatus(bytes32 assetId, bool isActive) 
        external 
        onlyAdmin 
        whenNotPaused 
        assetExists(assetId) 
    {
        _assets[assetId].isActive = isActive;
        emit AssetStatusUpdated(assetId, isActive);
    }

    /**
     * @notice Updates an SPV contract address
     * @param spvId The ID of the SPV
     * @param contractType The type of contract to update
     * @param newAddress The new contract address
     */
    function updateSPVContract(
        bytes32 spvId, 
        string calldata contractType, 
        address newAddress
    ) 
        external 
        onlyAdmin 
        whenNotPaused 
        spvExists(spvId) 
    {
        if (newAddress == address(0)) revert InvalidAddress();
        
        SPVContracts storage spvContracts = _spvContracts[spvId];
        bytes32 typeHash = keccak256(bytes(contractType));
        
        if (typeHash == keccak256("spvContract")) {
            spvContracts.spvContract = newAddress;
        } else if (typeHash == keccak256("assetContract")) {
            spvContracts.assetContract = newAddress;
        } else if (typeHash == keccak256("orderManager")) {
            spvContracts.orderManager = newAddress;
        } else if (typeHash == keccak256("financialLedger")) {
            spvContracts.financialLedger = newAddress;
        } else if (typeHash == keccak256("dao")) {
            spvContracts.dao = newAddress;
        } else if (typeHash == keccak256("assetManager")) {
            spvContracts.assetManager = newAddress;
        } else {
            revert InvalidContractType();
        }
        
        emit SPVContractUpdated(spvId, contractType, newAddress);
    }

    /**
     * @notice Updates an asset contract address
     * @param assetId The ID of the asset
     * @param contractType The type of contract to update
     * @param newAddress The new contract address
     */
    function updateAssetContract(
        bytes32 assetId, 
        string calldata contractType, 
        address newAddress
    ) 
        external 
        onlyAdmin 
        whenNotPaused 
        assetExists(assetId) 
    {
        if (newAddress == address(0)) revert InvalidAddress();
        
        Asset storage asset = _assets[assetId];
        bytes32 typeHash = keccak256(bytes(contractType));
        
        if (typeHash == keccak256("assetAddress")) {
            asset.assetAddress = newAddress;
        } else if (typeHash == keccak256("orderManager")) {
            asset.orderManager = newAddress;
        } else if (typeHash == keccak256("financialLedger")) {
            asset.financialLedger = newAddress;
        } else if (typeHash == keccak256("dao")) {
            asset.dao = newAddress;
        } else if (typeHash == keccak256("assetManager")) {
            asset.assetManager = newAddress;
        } else {
            revert InvalidContractType();
        }
        
        emit AssetContractUpdated(assetId, contractType, newAddress);
    }

    /**
     * @notice Pauses the registry
     */
    function pause() external onlyAdmin {
        _pause();
    }

    /**
     * @notice Unpauses the registry
     */
    function unpause() external onlyAdmin {
        _unpause();
    }

    /*//////////////////////////////////////////////////////////////
                         VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Gets asset details
     * @param assetId The ID of the asset
     * @return The asset details
     */
    function getAsset(bytes32 assetId) 
        external 
        view 
        assetExists(assetId) 
        returns (Asset memory) 
    {
        return _assets[assetId];
    }

    /**
     * @notice Checks if an asset exists
     * @param assetId The ID of the asset
     * @return bool True if the asset exists
     */
    function hasAsset(bytes32 assetId) external view returns (bool) {
        return _assets[assetId].assetAddress != address(0);
    }

    /**
     * @notice Checks if an SPV exists
     * @param spvId The ID of the SPV
     * @return bool True if the SPV exists
     */
    function hasSPV(bytes32 spvId) external view returns (bool) {
        return _spvContracts[spvId].spvContract != address(0);
    }

    /**
     * @notice Struct containing all SPV data
     */
    struct SPVData {
        address spvContract;
        address assetContract;
        address orderManager;
        address financialLedger;
        address dao;
        address assetManager;
        string name;
        bool isKycCompliant;
        string countryCode;
        bytes32 metadataCID;
        address owner;
        bool isActive;
    }

    /**
     * @notice Gets all SPV data including contract addresses and metadata
     * @param spvId The ID of the SPV
     * @return SPVData struct containing all SPV information
     */
    function getSPV(bytes32 spvId) 
        external 
        view 
        spvExists(spvId) 
        returns (SPVData memory) 
    {
        SPVContracts memory contracts = _spvContracts[spvId];
        SPVInfo memory info = _spvInfo[spvId];
        
        return SPVData({
            spvContract: contracts.spvContract,
            assetContract: contracts.assetContract,
            orderManager: contracts.orderManager,
            financialLedger: contracts.financialLedger,
            dao: contracts.dao,
            assetManager: contracts.assetManager,
            name: info.name,
            isKycCompliant: info.isKycCompliant,
            countryCode: info.countryCode,
            metadataCID: info.metadataCID,
            owner: info.owner,
            isActive: info.isActive
        });
    }

    /**
     * @notice Gets all assets for an SPV
     * @param spvId The ID of the SPV
     * @return assetIds Array of asset IDs
     */
    function getSPVAssets(bytes32 spvId) 
        external 
        view 
        spvExists(spvId) 
        returns (bytes32[] memory) 
    {
        return _spvAssets[spvId];
    }

    /**
     * @notice Gets the version of the contract
     * @return The version string
     */
    function version() external view returns (string memory) {
        return _version;
    }

    /*//////////////////////////////////////////////////////////////
                         INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    /**
     * @dev Extracts basic SPV info from encoded data
     */
    function _extractSPVBasicInfo(bytes calldata spvData)
        private
        pure
        returns (
            string memory name,
            bool kycStatus,
            string memory countryCode,
            bytes32 metadataCID,
            address owner
        )
    {
        (name, kycStatus, countryCode, metadataCID, owner,,,,,, ) = abi.decode(
            spvData, 
            (string, bool, string, bytes32, address, address, address, address, address, address, address)
        );
    }

    /**
     * @dev Extracts SPV contract addresses from encoded data
     */
    function _extractSPVContractAddresses(bytes calldata spvData)
        private
        pure
        returns (
            address spvContract,
            address assetContract,
            address orderManager,
            address financialLedger,
            address dao,
            address assetManager
        )
    {
        (,,,,, spvContract, assetContract, orderManager, financialLedger, dao, assetManager) = abi.decode(
            spvData, 
            (string, bool, string, bytes32, address, address, address, address, address, address, address)
        );
    }

    /**
     * @dev Stores SPV data in storage and emits events
     */
    function _storeSPVData(
        bytes32 spvId,
        string memory name,
        bool kycStatus,
        string memory countryCode,
        bytes32 metadataCID,
        address owner,
        address spvContract,
        address assetContract,
        address orderManager,
        address financialLedger,
        address dao,
        address assetManager
    ) private {
        // Initialize SPV storage
        SPVContracts storage spvContracts = _spvContracts[spvId];
        SPVInfo storage spvInfo = _spvInfo[spvId];

        // Store contract addresses
        spvContracts.spvContract = spvContract;
        spvContracts.assetContract = assetContract;
        spvContracts.orderManager = orderManager;
        spvContracts.financialLedger = financialLedger;
        spvContracts.dao = dao;
        spvContracts.assetManager = assetManager;

        // Store SPV info
        spvInfo.name = name;
        spvInfo.isKycCompliant = kycStatus;
        spvInfo.countryCode = countryCode;
        spvInfo.metadataCID = metadataCID;
        spvInfo.owner = owner;
        spvInfo.isActive = true;

        // Emit events
        emit SPVRegistered(
            spvId,
            spvContract,
            assetContract,
            orderManager,
            financialLedger,
            dao,
            assetManager
        );

        emit SPVAdditionalInfo(
            spvId,
            metadataCID,
            owner
        );
    }

    /**
     * @dev Stores asset data in storage and emits events
     */
    function _storeAssetData(
        bytes32 spvId,
        bytes32 assetId,
        string memory name,
        bytes32 assetType,
        address assetAddress,
        address orderManager,
        address financialLedger,
        address dao,
        address assetManager,
        bytes32 metadataCID
    ) private {
        // Initialize asset storage
        Asset storage asset = _assets[assetId];

        // Store asset data
        asset.assetAddress = assetAddress;
        asset.orderManager = orderManager;
        asset.financialLedger = financialLedger;
        asset.dao = dao;
        asset.assetManager = assetManager;
        asset.name = name;
        asset.assetType = assetType;
        asset.metadataCID = metadataCID;
        asset.isActive = true;

        // Add asset to SPV's assets
        _spvAssets[spvId].push(assetId);

        // Emit events
        emit AssetRegistered(
            spvId,
            assetId,
            assetAddress,
            orderManager,
            financialLedger,
            dao,
            assetManager
        );

        emit AssetAdditionalInfo(
            assetId,
            metadataCID
        );
    }

    /**
     * @notice Validates SPV registration data
     */
    function _validateSPVRegistration(
        bytes32 spvId,
        string memory name,
        string memory countryCode,
        bytes32 metadataCID,
        address owner,
        address spvContract,
        address assetContract,
        address orderManager,
        address financialLedger,
        address dao,
        address assetManager
    ) private view {
        // Check SPV ID and duplicates
        if (spvId == bytes32(0) || _spvContracts[spvId].spvContract != address(0)) 
            revert InvalidOrDuplicateSPV();
            
        // Validate name
        if (bytes(name).length == 0 || bytes(name).length > 100) 
            revert InvalidStringLength();
            
        // Validate country code
        if (bytes(countryCode).length != 2) 
            revert InvalidCountryCode();
            
        // Validate metadata CID
        if (metadataCID == bytes32(0)) 
            revert InvalidMetadataCID();
            
        // Validate addresses
        if (
            owner == address(0) ||
            spvContract == address(0) ||
            assetContract == address(0) ||
            orderManager == address(0) ||
            financialLedger == address(0) ||
            dao == address(0) ||
            assetManager == address(0)
        ) revert InvalidAddress();
    }

    /**
     * @notice Validates asset registration data
     */
    function _validateAssetRegistration(
        bytes32 assetId,
        string memory name,
        bytes32 assetType,
        address assetAddress,
        address orderManager,
        address financialLedger,
        address dao,
        address assetManager,
        bytes32 metadataCID
    ) private view {
        // Check asset ID and duplicates
        if (assetId == bytes32(0) || _assets[assetId].assetAddress != address(0)) 
            revert InvalidOrDuplicateAsset();
            
        // Validate name
        if (bytes(name).length == 0 || bytes(name).length > 100) 
            revert InvalidStringLength();
            
        // Validate asset type
        if (assetType == bytes32(0)) 
            revert InvalidAssetType();
            
        // Validate metadata CID
        if (metadataCID == bytes32(0)) 
            revert InvalidMetadataCID();
            
        // Validate addresses
        if (
            assetAddress == address(0) ||
            orderManager == address(0) ||
            financialLedger == address(0) ||
            dao == address(0) ||
            assetManager == address(0)
        ) revert InvalidAddress();
    }

    /*//////////////////////////////////////////////////////////////
                         UUPS UPGRADE
    //////////////////////////////////////////////////////////////*/
    /**
     * @notice Authorizes an upgrade
     * @param newImplementation The new implementation address
     */
    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
    {}
}