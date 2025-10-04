// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

/// @title IOwnmaliSPV
/// @notice Interface for OwnmaliSPV contract that manages SPV data and KYC compliance
interface IOwnmaliSPV  {
    /*//////////////////////////////////////////////////////////////
                                STRUCTS
    //////////////////////////////////////////////////////////////*/
    
    /// @notice Struct containing initialization parameters for the SPV
    struct InitParams {
        string spvName;                 // Name of the SPV
        bool isKycCompliant;            // Initial KYC compliance status
        string countryCode;             // Country code where SPV is registered
        bytes32 metadataCID;            // IPFS CID for SPV metadata
        address registryContract;        // Address of the registry contract
        address assetTokenContract;      // Address of the asset token contract
        address financialLedger;         // Address of the financial ledger
        address orderManager;            // Address of the order manager
        address dao;                     // Address of the DAO
        address assetManager;            // Address of the asset manager
    }
    
    /// @notice Struct containing SPV configuration parameters
    struct SPVConfig {
        string name;                    // SPV name
        string legalName;               // Legal name of the SPV
        string registrationNumber;      // Business registration number
        string jurisdiction;            // Legal jurisdiction
        string taxId;                   // Tax identification number
        bytes32 metadataCID;            // IPFS CID for additional metadata
        bool isActive;                  // Whether the SPV is active
        uint256 minInvestment;          // Minimum investment amount
        uint256 maxInvestment;          // Maximum investment amount
        uint256 maxInvestors;           // Maximum number of investors
        uint256 lockupPeriod;           // Token lockup period in seconds
    }

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/
    
    /// @notice Emitted when core SPV configuration is set
    /// @param spvName Name of the SPV
    /// @param isKycCompliant Whether the SPV is KYC compliant
    /// @param countryCode Country code of the SPV
    /// @param metadataCID IPFS CID for SPV metadata
    /// @param registryContract Address of the registry contract
    /// @param assetTokenContract Address of the asset token contract
    event SPVCoreConfigured(
        string indexed spvName,
        bool indexed isKycCompliant,
        string indexed countryCode,
        bytes32 metadataCID,
        address registryContract,
        address assetTokenContract
    );
    
    /// @notice Emitted when SPV contract addresses are configured
    /// @param financialLedger Address of the financial ledger
    /// @param orderManager Address of the order manager
    /// @param dao Address of the DAO
    /// @param assetManager Address of the asset manager
    event SPVContractsConfigured(
        address indexed financialLedger,
        address indexed orderManager,
        address indexed dao,
        address assetManager
    );
    
    /// @notice Emitted when an investor's KYC status is updated
    /// @param investor The address of the investor
    /// @param status The new KYC status
    event KycStatusUpdated(address indexed investor, bool indexed status);

    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/
    
    /// @notice Reverts when an invalid address is provided
    /// @param param The name of the parameter that is invalid
    error InvalidAddress(string param);
    
    /// @notice Reverts when an invalid contract address is provided
    /// @param param The name of the parameter that is invalid
    error InvalidContract(string param);
    
    /// @notice Reverts when a string parameter is invalid
    /// @param param The name of the parameter that is invalid
    /// @param max The maximum allowed length
    error InvalidStringLength(string param, uint256 max);
    
    /// @notice Reverts when array lengths don't match for batch operations
    /// @param length1 Length of the first array
    /// @param length2 Length of the second array
    error ArrayLengthMismatch(uint256 length1, uint256 length2);

    /*//////////////////////////////////////////////////////////////
                                FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    
    /// @notice Initializes the SPV contract
    /// @param params The initialization parameters
    function initialize(InitParams calldata params) external;
    
    ////////////////////////////////////////////////////////////
    // KYC Management
    ////////////////////////////////////////////////////////////
    
    /// @notice Updates KYC status for an investor
    /// @param investor Address of the investor
    /// @param newKycStatus New KYC status
    function updateKycStatus(address investor, bool newKycStatus) external;
    
    ////////////////////////////////////////////////////////////
    // Batch Operations
    ////////////////////////////////////////////////////////////
    
    /// @notice Updates KYC status for multiple investors in a single transaction
    /// @param investors Array of investor addresses
    /// @param newKycStatuses Array of new KYC statuses (must match length of investors array)
    function batchUpdateKycStatus(
        address[] calldata investors,
        bool[] calldata newKycStatuses
    ) external;
    
    ////////////////////////////////////////////////////////////
    // View Functions
    ////////////////////////////////////////////////////////////
    
    /// @notice Checks if an address is KYC verified
    /// @param investor The address to check
    /// @return bool True if the address is KYC verified, false otherwise
    function isKycVerified(address investor) external view returns (bool);
    
    /// @notice Checks if an address is KYC verified and has the INVESTOR_ROLE
    /// @param investor The address to check
    /// @return bool True if the address is both an investor and KYC verified
    function isVerifiedInvestor(address investor) external view returns (bool);
    
    /// @notice Checks KYC status for multiple addresses in a single call
    /// @param investors Array of addresses to check
    /// @return statuses Array of KYC statuses corresponding to the input addresses
    function batchIsKycVerified(address[] calldata investors) external view returns (bool[] memory);
    
    /// @notice Returns the total count of KYC-verified investors
    /// @return count The number of KYC-verified investors
    function getKycVerifiedCount() external view returns (uint256);
    
    /// @notice Returns a paginated list of KYC-verified investors
    /// @param cursor The starting index for pagination
    /// @param limit The maximum number of items to return
    /// @return investors Array of KYC-verified investor addresses
    /// @return nextCursor The next cursor to use for pagination
    function getKycVerifiedInvestors(
        uint256 cursor,
        uint256 limit
    ) external view returns (address[] memory investors, uint256 nextCursor);
    
    /// @notice Returns all KYC-verified investors (use with caution for large numbers of investors)
    /// @return Array of KYC-verified investor addresses
    function getAllKycVerifiedInvestors() external view returns (address[] memory);
    
    /// @notice Returns SPV configuration details
    /// @return InitParams struct containing all configuration data
    function getSPVDetails() external view returns (InitParams memory);
    
    // Role constants that should be accessible
    function SPV_ADMIN_ROLE() external view returns (bytes32);
    function INVESTOR_ROLE() external view returns (bytes32);
    
    // State variables that should be accessible
    function spvName() external view returns (string memory);
    function countryCode() external view returns (string memory);
    function metadataCID() external view returns (bytes32);
    function registryContract() external view returns (address);
    function assetTokenContract() external view returns (address);
    function financialLedger() external view returns (address);
    function orderManager() external view returns (address);
    function dao() external view returns (address);
    function assetManager() external view returns (address);
    function isKycCompliant() external view returns (bool);
    function kycStatus(address) external view returns (bool);
    
    /// @notice Gets the contract address for a specific type
    /// @param contractType The type of contract (e.g., 'assetToken', 'financialLedger')
    /// @return The contract address
    function getContractAddress(string calldata contractType) 
        external 
        view 
        returns (address);
}