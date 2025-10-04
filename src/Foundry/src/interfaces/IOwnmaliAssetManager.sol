// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

/// @title IOwnmaliAssetManager
/// @notice Interface for Ownmali Asset Manager contract
/// @dev This contract manages token operations for SPVs, including token transfers and ownership management
interface IOwnmaliAssetManager {
    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/
    
    /// @notice Reverts when an invalid contract interface is detected
    /// @param contractName The name of the contract with invalid interface
    error InvalidContractInterface(string contractName);
    
    /// @notice Reverts when a zero address is provided where not allowed
    /// @param paramName The name of the parameter that cannot be zero
    error ZeroAddress(string paramName);
    
    /// @notice Reverts when an invalid amount is provided (e.g., zero)
    error InvalidAmount();
    
    /// @notice Reverts when an unauthorized action is attempted
    error Unauthorized();
    
    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/
    
    /// @notice Emitted when the asset manager is initialized
    /// @param spvContract The address of the SPV contract
    /// @param spvId The ID of the SPV
    /// @param assetId The ID of the asset being managed
    /// @param assetOwner The address of the asset owner
    /// @param assetToken The address of the asset token contract
    event AssetManagerInitialized(
        address indexed spvContract,
        bytes32 indexed spvId,
        bytes32 indexed assetId,
        address assetOwner,
        address assetToken
    );
    
    /// @notice Emitted when tokens are transferred through the manager
    /// @param from The address sending the tokens
    /// @param to The address receiving the tokens
    /// @param amount The amount of tokens transferred
    event TokensTransferred(
        address indexed from,
        address indexed to,
        uint256 amount
    );
    
    /*//////////////////////////////////////////////////////////////
                                STATE VARIABLES
    //////////////////////////////////////////////////////////////*/
    
    /// @notice Returns the SPV contract address
    /// @return The address of the SPV contract
    function spvContract() external view returns (address);
    
    /// @notice Returns the SPV ID
    /// @return The SPV ID as bytes32
    function spvId() external view returns (bytes32);
    
    /// @notice Returns the asset ID
    /// @return The asset ID as bytes32
    function assetId() external view returns (bytes32);
    
    /// @notice Returns the asset owner address
    /// @return The address of the asset owner
    function assetOwner() external view returns (address);
    
    /// @notice Returns the asset token contract address
    /// @return The address of the asset token contract
    function assetToken() external view returns (address);
    
    /*//////////////////////////////////////////////////////////////
                                FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    /// @notice Initializes the asset manager contract
    /// @dev Can only be called once during contract deployment
    /// @param admin The address that will have the default admin role
    /// @param _spvContract The SPV contract address (must be a contract)
    /// @param _spvId The SPV ID (cannot be empty)
    /// @param _assetId The asset ID (cannot be empty)
    /// @param _assetOwner The asset owner address (cannot be zero)
    /// @param _assetToken The asset token contract address (must be a contract)
    /// @custom:emits AssetManagerInitialized on success
    /// @custom:throws InvalidContractInterface if _assetToken is not a contract
    /// @custom:throws ZeroAddress if any address parameter is zero
    function initialize(
        address admin,
        address _spvContract,
        bytes32 _spvId,
        bytes32 _assetId,
        address _assetOwner,
        address _assetToken
    ) external;

    /// @notice Transfers tokens between accounts
    /// @dev Requires MANAGER_ROLE to call
    /// @param from The address sending the tokens (must be a valid address)
    /// @param to The address receiving the tokens (must be a valid address)
    /// @param amount The amount of tokens to transfer (must be greater than zero)
    /// @custom:emits TokensTransferred on success
    /// @custom:throws ZeroAddress if from or to is zero
    /// @custom:throws InvalidAmount if amount is zero
    /// @custom:throws Unauthorized if caller doesn't have MANAGER_ROLE
    function transferTokens(address from, address to, uint256 amount) external;
    
    /// @notice Pauses all token transfers
    /// @dev Only callable by accounts with DEFAULT_ADMIN_ROLE
    function pause() external;
    
    /// @notice Unpauses all token transfers
    /// @dev Only callable by accounts with DEFAULT_ADMIN_ROLE
    function unpause() external;
}
