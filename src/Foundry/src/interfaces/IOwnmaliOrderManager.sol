// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

/// @title IOwnmaliOrderManager
/// @notice Interface for OwnmaliOrderManager contract handling token purchase orders
interface IOwnmaliOrderManager {
    /*//////////////////////////////////////////////////////////////
                                ENUMS & STRUCTS
    //////////////////////////////////////////////////////////////*/
    
    /// @notice Order status enum
    enum OrderStatus {
        Pending,    // Order created but not yet processed
        Completed,  // Order successfully completed
        Cancelled   // Order cancelled by admin or user
    }
    
    /// @notice Order details structure
    struct Order {
        address investor;          // Investor's address
        uint256 amount;            // Amount of tokens to purchase
        OrderStatus status;        // Current order status
        uint256 createdAt;         // Timestamp when order was created
    }

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/
    
    /// @notice Emitted when the order manager is initialized
    /// @param assetToken The address of the asset token
    /// @param admin The admin address
    event OrderManagerInitialized(address indexed assetToken, address indexed admin);

    /// @notice Emitted when a new order is created
    /// @param orderId The ID of the created order
    /// @param investor The address of the investor placing the order
    /// @param amount The amount of tokens to purchase
    event OrderCreated(uint256 indexed orderId, address indexed investor, uint256 amount);

    /// @notice Emitted when an order is cancelled
    /// @param orderId The ID of the cancelled order
    /// @param investor The investor's address
    event OrderCancelled(uint256 indexed orderId, address indexed investor);

    /// @notice Emitted when an order is completed
    /// @param orderId The ID of the completed order
    /// @param investor The investor's address
    /// @param amount The amount of tokens purchased
    event OrderCompleted(uint256 indexed orderId, address indexed investor, uint256 amount);

    /*//////////////////////////////////////////////////////////////
                            INITIALIZATION
    //////////////////////////////////////////////////////////////*/
    
    /// @notice Initializes the order manager contract
    /// @param _assetToken The asset token contract address
    /// @param admin The initial admin address
    function initialize(
        address _assetToken,
        address admin
    ) external;

    /*//////////////////////////////////////////////////////////////
                            ORDER MANAGEMENT
    //////////////////////////////////////////////////////////////*/
    
    /// @notice Creates a new order for token purchase
    /// @param investor The investor's address
    /// @param amount The amount of tokens to purchase
    /// @return orderId The ID of the created order
    function createOrder(
        address investor,
        uint256 amount
    ) external returns (uint256 orderId);
    
    /// @notice Cancels an existing order
    /// @param orderId The ID of the order to cancel
    function cancelOrder(uint256 orderId) external;
    
    /// @notice Completes an existing order
    /// @param orderId The ID of the order to complete
    function completeOrder(uint256 orderId) external;
    
    /*//////////////////////////////////////////////////////////////
                            VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    
    /// @notice Gets order details by ID
    /// @param orderId The ID of the order
    /// @return investor The investor's address
    /// @return amount The amount of tokens to purchase
    /// @return status The current order status
    /// @return createdAt The timestamp when the order was created
    function getOrder(uint256 orderId) external view returns (
        address investor,
        uint256 amount,
        OrderStatus status,
        uint256 createdAt
    );

    /// @notice Grants a role to an account
    /// @param role The role to grant
    /// @param account The account to grant the role to
    function grantRole(bytes32 role, address account) external;
}
