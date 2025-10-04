// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

/// @title IOwnmaliFactory
/// @notice Interface for OwnmaliFactory contract that manages deployment of SPVs and associated contracts
/// @dev This interface defines the functions, events, and errors for the OwnmaliFactory contract
interface IOwnmaliFactory {
    /*//////////////////////////////////////////////////////////////
                                STRUCTS
    //////////////////////////////////////////////////////////////*/
    
    /// @notice Information about a template
    /// @param template The address of the template contract
    /// @param version The version number of the template
    /// @param lastUpdated The timestamp when the template was last updated
    /// @param isPaused Whether the template is currently paused
    struct TemplateInfo {
        address template;
        uint256 version;
        uint48 lastUpdated;
        bool isPaused;
    }
    
    /// @notice A pending template update
    /// @param newTemplate The address of the new template
    /// @param scheduledTime The timestamp when the update is scheduled to take effect
    struct PendingUpdate {
        address newTemplate;
        uint48 scheduledTime;
    }

    /// @notice Parameters for creating a new SPV
    /// @param spvId The unique identifier for the SPV
    /// @param name The name of the SPV
    /// @param kycStatus The initial KYC compliance status
    /// @param countryCode The country code where the SPV is based
    /// @param metadataCID IPFS CID for SPV metadata
    /// @param owner The address of the SPV owner
    struct SPVParams {
        bytes32 spvId;
        string name;
        bool kycStatus;
        string countryCode;
        bytes32 metadataCID;
        address owner;
    }

    /// @notice Core parameters for an asset
    /// @param assetId The unique identifier for the asset
    /// @param name The name of the asset
    /// @param symbol The symbol of the asset token
    /// @param metadataCID IPFS CID for asset metadata
    /// @param legalMetadataCID IPFS CID for legal documents
    /// @param assetType The type of the asset
    /// @param chainId The blockchain network ID where the asset exists
    struct AssetCoreParams {
        bytes32 assetId;
        string name;
        string symbol;
        bytes32 metadataCID;
        bytes32 legalMetadataCID;
        bytes32 assetType;
        uint16 chainId;
    }

    /// @notice Configuration parameters for an asset
    /// @param maxSupply Maximum token supply
    /// @param tokenPrice Price per token in the smallest unit
    /// @param cancelDelay Delay before an order can be cancelled
    /// @param dividendPct Percentage of profits distributed as dividends
    /// @param premintAmount Number of tokens to premint to the owner
    /// @param minInvestment Minimum investment amount
    /// @param maxInvestment Maximum investment amount
    /// @param isRealEstate Whether this is a real estate asset
    /// @param votingPeriodSeconds Duration of the voting period in seconds
    /// @param minVotingTokens Minimum tokens required to create a proposal
    /// @param approvalThresholdPct Percentage of votes required to approve a proposal
    struct AssetConfigParams {
        uint256 maxSupply;
        uint256 tokenPrice;
        uint256 cancelDelay;
        uint256 dividendPct;
        uint256 premintAmount;
        uint256 minInvestment;
        uint256 maxInvestment;
        bool isRealEstate;
        uint48 votingPeriodSeconds;
        uint256 minVotingTokens;
        uint256 approvalThresholdPct;
    }

    /// @notice Addresses of all contract templates
    /// @param assetTemplate Address of the standard asset template
    /// @param realEstateAssetTemplate Address of the real estate asset template
    /// @param assetManagerTemplate Address of the asset manager template
    /// @param orderManagerTemplate Address of the order manager template
    /// @param financialLedgerTemplate Address of the financial ledger template
    /// @param daoTemplate Address of the DAO template
    /// @param spvTemplate Address of the SPV template
    struct TemplateAddresses {
        address assetTemplate;
        address realEstateAssetTemplate;
        address assetManagerTemplate;
        address orderManagerTemplate;
        address financialLedgerTemplate;
        address daoTemplate;
        address spvTemplate;
    }

    /// @notice All deployed contracts for an SPV
    /// @param spvContract Address of the SPV contract
    /// @param assetContract Address of the asset contract
    /// @param assetManager Address of the asset manager contract
    /// @param orderManager Address of the order manager contract
    /// @param financialLedger Address of the financial ledger contract
    /// @param dao Address of the DAO contract
    struct Deployment {
        address spvContract;
        address assetContract;
        address assetManager;
        address orderManager;
        address financialLedger;
        address dao;
    }

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/
    
    /// @notice Emitted when a new SPV is created
    /// @param spvId The ID of the SPV
    /// @param spvContract The address of the deployed SPV contract
    /// @param assetContract The address of the deployed asset contract
    /// @param assetManager The address of the deployed asset manager
    /// @param orderManager The address of the deployed order manager
    /// @param financialLedger The address of the deployed financial ledger
    /// @param dao The address of the deployed DAO
    /// @param name The name of the SPV
    /// @param kycStatus The KYC status of the SPV
    /// @param countryCode The country code of the SPV
    /// @param metadataCID The metadata CID for the SPV
    /// @param owner The owner of the SPV
    event SPVCreated(
        bytes32 indexed spvId,
        address indexed spvContract,
        address assetContract,
        address assetManager,
        address orderManager,
        address financialLedger,
        address dao,
        string name,
        bool kycStatus,
        string countryCode,
        bytes32 metadataCID,
        address owner
    );
    
    /// @notice Emitted when a template is updated
    /// @param templateType The type of template being updated
    /// @param oldTemplate The address of the old template
    /// @param newTemplate The address of the new template
    /// @param version The new version number
    event TemplateUpdated(string indexed templateType, address oldTemplate, address newTemplate, uint256 version);
    
    /// @notice Emitted when a template update is scheduled
    /// @param templateType The type of template being updated
    /// @param newTemplate The address of the new template
    /// @param scheduledTime The timestamp when the update will take effect
    event TemplateUpdateScheduled(string indexed templateType, address newTemplate, uint48 scheduledTime);
    
    /// @notice Emitted when a scheduled template update is cancelled
    /// @param templateType The type of template whose update was cancelled
    event TemplateUpdateCancelled(string indexed templateType);
    
    /// @notice Emitted when a template's pause status changes
    /// @param templateType The type of template
    /// @param isPaused The new pause status
    event TemplatePauseStatusChanged(string indexed templateType, bool isPaused);
    
    /// @notice Emitted when the registry contract is updated
    /// @param oldRegistry The address of the old registry
    /// @param newRegistry The address of the new registry
    event RegistryUpdated(address indexed oldRegistry, address indexed newRegistry);
    
    /// @notice Emitted when the identity registry contract is updated
    /// @param oldRegistry The address of the old identity registry
    /// @param newRegistry The address of the new identity registry
    event IdentityRegistryUpdated(address indexed oldRegistry, address indexed newRegistry);
    
    /// @notice Emitted when the compliance contract is updated
    /// @param oldCompliance The address of the old compliance contract
    /// @param newCompliance The address of the new compliance contract
    event ComplianceUpdated(address indexed oldCompliance, address indexed newCompliance);
    
    /// @notice Emitted when tokens are withdrawn in an emergency
    /// @param token The address of the token being withdrawn
    /// @param to The address receiving the tokens
    /// @param amount The amount of tokens withdrawn
    event EmergencyWithdraw(address indexed token, address indexed to, uint256 amount);

    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/
    
    /// @notice Reverts when an invalid contract interface is detected
    /// @param contractName The name of the contract with invalid interface
    error InvalidContractInterface(string contractName);
    
    /// @notice Reverts when the update delay has not passed
    error UpdateDelayNotPassed();
    
    /// @notice Reverts when an update is already scheduled for a template
    /// @param templateType The type of template with a pending update
    error UpdateAlreadyScheduled(string templateType);
    
    /// @notice Reverts when there is no pending update for a template
    /// @param templateType The type of template with no pending update
    error NoPendingUpdate(string templateType);
    
    /// @notice Reverts when an SPV with the same ID already exists
    /// @param spvId The ID of the existing SPV
    error SPVAlreadyExists(bytes32 spvId);
    
    /// @notice Reverts when an asset with the same ID already exists
    /// @param assetId The ID of the existing asset
    error AssetAlreadyExists(bytes32 assetId);
    
    /// @notice Reverts when a required template is not set
    /// @param templateType The type of template that is not set
    error TemplateNotSet(string templateType);
    
    /// @notice Reverts when trying to pause an already paused template
    /// @param templateType The type of template that is already paused
    error TemplateAlreadyPaused(string templateType);
    
    /// @notice Reverts when trying to unpause a template that is not paused
    /// @param templateType The type of template that is not paused
    error TemplateNotPaused(string templateType);
    
    /// @notice Reverts when an invalid template type is provided
    /// @param templateType The invalid template type
    error InvalidTemplateType(string templateType);

    /*//////////////////////////////////////////////////////////////
                                CONSTANTS
    //////////////////////////////////////////////////////////////*/
    
    /// @notice Minimum delay before a template update can be applied
    /// @return The minimum delay in seconds
    function MIN_TEMPLATE_UPDATE_DELAY() external view returns (uint48);
    
    /// @notice Role identifier for administrators
    /// @return The role identifier for administrators
    function ADMIN_ROLE() external view returns (bytes32);
    
    /// @notice Role identifier for SPV creators
    /// @return The role identifier for SPV creators
    function SPV_CREATOR_ROLE() external view returns (bytes32);
    
    /// @notice Role identifier for template managers
    /// @return The role identifier for template managers
    function TEMPLATE_MANAGER_ROLE() external view returns (bytes32);
    
    /// @notice Current version of the factory contract
    /// @return The version string
    function VERSION() external view returns (string memory);

    /*//////////////////////////////////////////////////////////////
                                STATE VARIABLES
    //////////////////////////////////////////////////////////////*/
    
    /// @notice Gets the registry contract address
    /// @return The address of the registry contract
    function registryContract() external view returns (address);
    
    /// @notice Gets the identity registry contract address
    /// @return The address of the identity registry contract
    function identityRegistry() external view returns (address);
    
    /// @notice Gets the compliance contract address
    /// @return The address of the compliance contract
    function compliance() external view returns (address);

    /*//////////////////////////////////////////////////////////////
                                FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    
    /// @notice Initializes the factory contract
    /// @param registryAddressInit The address of the registry contract
    /// @param adminAddressInit The address of the initial admin
    /// @param identityRegistryAddressInit The address of the identity registry
    /// @param complianceAddressInit The address of the compliance contract
    function initialize(
        address registryAddressInit,
        address adminAddressInit,
        address identityRegistryAddressInit,
        address complianceAddressInit
    ) external;
    
    /// @notice Creates a new SPV with all associated contracts
    /// @param spvParams Parameters for the SPV
    /// @param assetCore Core parameters for the asset
    /// @param assetConfig Configuration parameters for the asset
    /// @return deployment The addresses of all deployed contracts
    function createSPV(
        SPVParams calldata spvParams,
        AssetCoreParams calldata assetCore,
        AssetConfigParams calldata assetConfig
    ) external returns (Deployment memory deployment);
    
    /// @notice Schedules a template update with a time delay
    /// @param templateType The type of template to update
    /// @param newTemplate The address of the new template
    function scheduleTemplateUpdate(string calldata templateType, address newTemplate) external;
    
    /// @notice Applies a scheduled template update
    /// @param templateType The type of template to update
    function applyTemplateUpdate(string calldata templateType) external;
    
    /// @notice Cancels a scheduled template update
    /// @param templateType The type of template to cancel the update for
    function cancelTemplateUpdate(string calldata templateType) external;
    
    /// @notice Pauses a template to prevent new deployments
    /// @param templateType The type of template to pause
    function pauseTemplate(string calldata templateType) external;
    
    /// @notice Unpauses a template to allow new deployments
    /// @param templateType The type of template to unpause
    function unpauseTemplate(string calldata templateType) external;
    
    /// @notice Updates the registry contract address
    /// @param newRegistry The address of the new registry contract
    function updateRegistry(address newRegistry) external;
    
    /// @notice Updates the identity registry contract address
    /// @param newIdentityRegistry The address of the new identity registry
    function updateIdentityRegistry(address newIdentityRegistry) external;
    
    /// @notice Updates the compliance contract address
    /// @param newCompliance The address of the new compliance contract
    function updateCompliance(address newCompliance) external;
    
    /// @notice Emergency function to withdraw tokens sent to the contract
    /// @param token The address of the token to withdraw
    /// @param to The address to send the tokens to
    /// @param amount The amount of tokens to withdraw
    function emergencyWithdraw(address token, address to, uint256 amount) external;
    
    /// @notice Gets information about a template
    /// @param templateType The type of template to get information for
    /// @return info The template information
    function getTemplateInfo(string calldata templateType) external view returns (TemplateInfo memory info);
    
    /// @notice Gets all template addresses
    /// @return addresses Struct containing all template addresses
    function getAllTemplateAddresses() external view returns (TemplateAddresses memory addresses);
    
    /// @notice Gets all deployed contracts for an SPV
    /// @param spvId The ID of the SPV
    /// @return deployment Struct containing all contract addresses for the SPV
    function getSPVDeployment(bytes32 spvId) external view returns (Deployment memory deployment);
}
