// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

/// @title ICompliance
/// @notice Interface for compliance checks and restrictions on token transfers
interface ICompliance {
    event TransferChecked(
        address indexed from,
        address indexed to,
        uint256 amount,
        bool isAllowed
    );
    
    event TransferRestricted(
        address indexed from,
        address indexed to,
        uint256 amount,
        string reason
    );
    
    event ComplianceInitialized(address indexed token);
    event ComplianceRuleUpdated(bytes32 indexed ruleId, bool isActive);
    
    error ZeroAddress();
    error NotAuthorized();
    error InvalidAmount();
    error TransferRestrictedByCompliance(string reason);
    error AlreadyInitialized();
    error InvalidRule();

    /// @notice Checks if a transfer between addresses is allowed
    /// @param from The address sending the tokens
    /// @param to The address receiving the tokens
    /// @param amount The amount of tokens to be transferred
    /// @return bool True if the transfer is allowed, false otherwise
    function canTransfer(
        address from,
        address to,
        uint256 amount
    ) external view returns (bool);

    /// @notice Called after a transfer has been executed to update compliance state
    /// @param from The address that sent the tokens
    /// @param to The address that received the tokens
    /// @param amount The amount of tokens that were transferred
    function transferred(
        address from,
        address to,
        uint256 amount
    ) external;

    /// @notice Called when new tokens are created
    /// @param to The address receiving the new tokens
    /// @param amount The amount of tokens created
    function created(address to, uint256 amount) external;
    
    /// @notice Called when tokens are destroyed
    /// @param from The address whose tokens are being destroyed
    /// @param amount The amount of tokens being destroyed
    function destroyed(address from, uint256 amount) external;
    
    /// @notice Checks if a transferFrom operation is allowed
    /// @param from The address sending the tokens
    /// @param to The address receiving the tokens
    /// @param sender The address executing the transfer
    /// @param amount The amount of tokens to be transferred
    /// @return bool True if the transfer is allowed, false otherwise
    function canTransferFrom(
        address from,
        address to,
        address sender,
        uint256 amount
    ) external view returns (bool);
    
    /// @notice Called after a transferFrom has been executed to update compliance state
    /// @param from The address that sent the tokens
    /// @param to The address that received the tokens
    /// @param sender The address that executed the transfer
    /// @param amount The amount of tokens that were transferred
    function transferFrom(
        address from,
        address to,
        address sender,
        uint256 amount
    ) external;
    
    /// @notice Checks if minting tokens to an address is allowed
    /// @param to The address that will receive the minted tokens
    /// @param amount The amount of tokens to be minted
    /// @param sender The address requesting the mint
    /// @return bool True if minting is allowed, false otherwise
    function canMint(
        address to,
        uint256 amount,
        address sender
    ) external view returns (bool);
    
    /// @notice Called after tokens have been minted to update compliance state
    /// @param to The address that received the minted tokens
    /// @param amount The amount of tokens that were minted
    /// @param sender The address that executed the mint
    function minted(
        address to,
        uint256 amount,
        address sender
    ) external;
    
    function canBurn(
        address from,
        uint256 _amount,
        address _sender
    ) external view returns (bool);
    
    function burned(
        address _from,
        uint256 _amount,
        address _sender
    ) external;
    
    function canWipe(
        address _account,
        uint256 _amount,
        address _sender
    ) external view returns (bool);
    
    function wiped(
        address _account,
        uint256 _amount,
        address _sender
    ) external;
    
    function canPause(
        address _sender
    ) external view returns (bool);
    
    function paused(
        address _sender
    ) external;
    
    function canUnpause(
        address _sender
    ) external view returns (bool);
    
    function unpaused(
        address _sender
    ) external;
}
