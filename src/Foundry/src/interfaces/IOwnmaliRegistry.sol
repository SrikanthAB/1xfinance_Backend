// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

/// @title IOwnmaliRegistry
/// @notice Interface for OwnmaliRegistry contract that tracks SPVs and assets
interface IOwnmaliRegistry {
    /*//////////////////////////////////////////////////////////////
                                STRUCTS
    //////////////////////////////////////////////////////////////*/
    
    /// @notice Struct representing an SPV in the registry
    struct SPV {
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
    
    /// @notice Struct containing all SPV data
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

    /// @notice Struct representing an asset in the registry
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
                                EVENTS
    //////////////////////////////////////////////////////////////*/
    
    /// @notice Emitted when a new SPV is registered
    event SPVRegistered(
        bytes32 indexed spvId,
        address spvContract,
        address assetContract,
        address orderManager,
        address financialLedger,
        address dao,
        address assetManager,
        string name,
        bool kycStatus,
        string countryCode,
        bytes32 metadataCID,
        address owner
    );
    
    /// @notice Emitted when a new asset is registered
    event AssetRegistered(
        bytes32 indexed spvId,
        bytes32 indexed assetId,
        address assetAddress,
        string name,
        bytes32 assetType,
        bytes32 metadataCID
    );
    
    /// @notice Emitted when an SPV's status is updated
    event SPVStatusUpdated(bytes32 indexed spvId, bool isActive);
    
    /// @notice Emitted when an asset's status is updated
    event AssetStatusUpdated(bytes32 indexed assetId, bool isActive);

    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/
    
    /// @notice Reverts when trying to register an SPV that already exists
    /// @param spvId The ID of the SPV that already exists
    error SPVAlreadyExists(bytes32 spvId);
    
    /// @notice Reverts when trying to register an asset that already exists
    /// @param assetId The ID of the asset that already exists
    error AssetAlreadyExists(bytes32 assetId);
    
    /// @notice Reverts when an SPV is not found
    /// @param spvId The ID of the SPV that was not found
    error SPVNotFound(bytes32 spvId);
    
    /// @notice Reverts when an asset is not found
    /// @param assetId The ID of the asset that was not found
    error AssetNotFound(bytes32 assetId);

    /*//////////////////////////////////////////////////////////////
                                FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    
    /// @notice Registers a new SPV
    /// @param spvId The ID of the SPV to register
    /// @param spvData Encoded SPV data to avoid stack too deep errors
    function registerSPV(bytes32 spvId, bytes calldata spvData) external;

    /// @notice Registers a new asset
    /// @param spvId The ID of the SPV that owns the asset
    /// @param assetId The ID of the asset to register
    /// @param assetData Encoded asset data to avoid stack too deep errors
    function registerAsset(bytes32 spvId, bytes32 assetId, bytes calldata assetData) external;

    /// @notice Retrieves the details of an SPV
    /// @param spvId The ID of the SPV to retrieve
    /// @return SPVData struct containing all SPV information
    function getSPV(bytes32 spvId) external view returns (SPVData memory);
    
    /// @notice Gets all assets for an SPV
    /// @param spvId The ID of the SPV
    /// @return assetIds Array of asset IDs
    function getSPVAssets(bytes32 spvId) external view returns (bytes32[] memory);

    /// @notice Retrieves the details of an asset
    /// @param assetId The ID of the asset to retrieve
    function getAsset(bytes32 assetId) external view returns (Asset memory);

    /// @notice Checks if an SPV exists
    /// @param spvId The ID of the SPV to check
    /// @return bool True if the SPV exists
    function hasSPV(bytes32 spvId) external view returns (bool);

    /// @notice Checks if an asset exists
    /// @param assetId The ID of the asset to check
    /// @return bool True if the asset exists
    function hasAsset(bytes32 assetId) external view returns (bool);

    /// @notice Updates the status of an SPV
    /// @param spvId The ID of the SPV to update
    /// @param isActive The new status of the SPV
    function updateSPVStatus(bytes32 spvId, bool isActive) external;

    /// @notice Updates the status of an asset
    /// @param assetId The ID of the asset to update
    /// @param isActive The new status of the asset
    function updateAssetStatus(bytes32 assetId, bool isActive) external;
}