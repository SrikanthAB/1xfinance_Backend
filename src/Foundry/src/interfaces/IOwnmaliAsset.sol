// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

interface IOwnmaliAsset {

    /*//////////////////////////////////////////////////////////////
                                STRUCTS
    //////////////////////////////////////////////////////////////*/

    /// @notice Struct to encapsulate token configuration during initialization
    struct TokenConfig {
        string name;
        string symbol;
        uint8 decimals;
        uint256 maxSupply;
        uint256 tokenPrice;
        address assetOwner;
        address factory;
        address orderManager;
        address dao;
        address financialLedger;
        address assetManager;
        bytes32 spvId;
        bytes32 assetId;
        bytes32 metadataCID;
        uint256 dividendPct;
        uint256 minInvestment;
        uint256 maxInvestment;
        uint256 lockPeriod;
        bool isActive;
    }
    
    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    /// @notice Emitted when the asset is initialized
    event AssetInitialized(
        string name,
        string symbol,
        bytes32 spvId,
        bytes32 assetId,
        bytes32 metadataCID,
        address assetOwner
    );

    /// @notice Emitted when tokens are locked
    event TokensLocked(address indexed account, uint256 amount);

    /// @notice Emitted when tokens are unlocked
    event TokensUnlocked(address indexed account, uint256 amount);
    
    /// @notice Emitted when tokens are minted
    event TokensMinted(
        address indexed to, 
        uint256 amount, 
        bytes32 indexed referenceId
    );
    
    /// @notice Emitted when tokens are burned
    event TokensBurned(
        address indexed from, 
        uint256 amount, 
        bytes32 indexed referenceId
    );
    
    /// @notice Emitted when token transfer is executed
    event TokenTransfer(
        address indexed from,
        address indexed to,
        uint256 amount,
        bytes32 indexed referenceId,
        uint256 timestamp
    );
    
    /// @notice Emitted when investment parameters are updated
    event InvestmentParamsUpdated(
        uint256 minInvestment,
        uint256 maxInvestment,
        uint256 tokenPrice,
        uint256 lockPeriod
    );

    /// @notice Emitted when related contracts are updated
    event AssetContractsUpdated(
        address orderManager,
        address dao,
        address financialLedger,
        address assetManager
    );

    /*//////////////////////////////////////////////////////////////
                            STATE-CHANGING FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Initializes the asset token contract
    /// @param initData Encoded TokenConfig struct
    function initialize(bytes calldata initData) external;

    /// @notice Sets related contract addresses
    /// @param _orderManager The order manager address
    /// @param _dao The DAO address
    /// @param _financialLedger The financial ledger address
    /// @param _assetManager The asset manager address
    function setAssetContracts(
        address _orderManager,
        address _dao,
        address _financialLedger,
        address _assetManager
    ) external;

    /// @notice Locks tokens for an account
    /// @param account The account to lock tokens for
    /// @param amount The amount of tokens to lock
    function lockTokens(address account, uint256 amount) external;

    /// @notice Unlocks tokens for an account
    /// @param account The account to unlock tokens for
    /// @param amount The amount of tokens to unlock
    function unlockTokens(address account, uint256 amount) external;
    
    /// @notice Transfers tokens from one address to another
    /// @param from The address to transfer tokens from
    /// @param to The address to transfer tokens to
    /// @param amount The amount of tokens to transfer
    /// @return A boolean indicating whether the transfer was successful
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    
    /// @notice Mints new tokens to an address
    /// @param to The address that will receive the minted tokens
    /// @param amount The amount of tokens to mint
    /// @param referenceId A unique identifier for the mint operation
    function mint(address to, uint256 amount, bytes32 referenceId) external;
    
    /// @notice Burns tokens from an address
    /// @param from The address to burn tokens from
    /// @param amount The amount of tokens to burn
    /// @param referenceId A unique identifier for the burn operation
    function burn(address from, uint256 amount, bytes32 referenceId) external;
    
    /*//////////////////////////////////////////////////////////////
                            VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    
    /// @notice Returns the balance of tokens for a given account
    /// @param account The address to query the balance for
    /// @return The number of tokens owned by the account
    function balanceOf(address account) external view returns (uint256);
    
    /// @notice Returns the minimum investment amount for this asset
    /// @return The minimum investment amount in wei
    function minInvestment() external view returns (uint256);
    
    /// @notice Returns the maximum investment amount for this asset
    /// @return The maximum investment amount in wei
    function maxInvestment() external view returns (uint256);
    
    /// @notice Returns the current token price
    /// @return The price per token in wei
    function tokenPrice() external view returns (uint256);
    
    /// @notice Returns the lock period for tokens
    /// @return The lock period in seconds
    function lockPeriod() external view returns (uint256);
    
    /// @notice Returns the dividend percentage
    /// @return The dividend percentage (basis points, e.g., 500 = 5%)
    function dividendPct() external view returns (uint256);
    
    /// @notice Returns the maximum supply of tokens
    /// @return The maximum token supply
    function maxSupply() external view returns (uint256);
    
    /// @notice Returns the total supply of tokens
    /// @return The total token supply
    function totalSupply() external view returns (uint256);
    
    /// @notice Returns the locked balance of an account
    /// @param account The address to query
    /// @return The amount of locked tokens
    function lockedBalanceOf(address account) external view returns (uint256);
    
    /// @notice Returns the unlockable balance of an account
    /// @param account The address to query
    /// @return The amount of tokens that can be unlocked
    function unlockableBalanceOf(address account) external view returns (uint256);
    
    /// @notice Grants a role to an account
    /// @param role The role to grant
    /// @param account The account to grant the role to
    function grantRole(bytes32 role, address account) external;
}
