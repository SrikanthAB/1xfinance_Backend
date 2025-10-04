// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

/* ──────────── Open-Zeppelin imports ──────────── */
import {Initializable}            from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable}          from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {PausableUpgradeable}      from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import {Address}       from "@openzeppelin/contracts/utils/Address.sol";

/* ──────────── Local imports ──────────── */
import "./OwnmaliValidation.sol";
import "./interfaces/IOwnmaliAsset.sol";

/**
 * @title OwnmaliOrderManager
 * @notice Manages token-purchase orders without handling funds / transfers
 * @dev   Uses EIP-7201 storage slot for upgrade safety
 */
contract OwnmaliOrderManager is
    Initializable,
    UUPSUpgradeable,
    AccessControlUpgradeable,
    PausableUpgradeable
{
    using Address for address;
    using OwnmaliValidation  for *;

    /* ---------------- CONSTANTS ---------------- */
    bytes32 public constant ORDER_ADMIN_ROLE = keccak256("ORDER_ADMIN_ROLE");

    /* ---------- STORAGE SLOT (EIP-7201) -------- */
    /// @custom:storage-location erc7201:ownmali.order.v1
    struct Storage {
        address assetToken;
        uint256 orderCounter;
        mapping(uint256 => Order) orders;
    }

    uint256 private constant STORAGE_SLOT =
        uint256(keccak256("ownmali.order.v1")) - 1;

    function _getStorage() private pure returns (Storage storage $) {
        bytes32 slot = bytes32(STORAGE_SLOT);
        assembly ("memory-safe") { $.slot := slot }
    }

    /* ---------------- EVENTS ------------------- */
    event OrderManagerInitialized(address indexed assetToken, address indexed admin);
    event OrderCreated(uint256 indexed orderId, address indexed investor, uint256 amount);
    event OrderCancelled(uint256 indexed orderId, address indexed investor);
    event OrderCompleted(uint256 indexed orderId, address indexed investor, uint256 amount);

    /* ---------------- ERRORS ------------------- */
    error InvalidContractInterface(string contractName);

    /* ---------------- ENUM --------------------- */
    enum OrderStatus { Pending, Completed, Cancelled }

    /* ------------- ORDER STRUCT ---------------- */
    struct Order {
        address investor;
        uint256 amount;
        OrderStatus status;
        uint256 createdAt;
    }

    /* ------------- INITIALIZER ----------------- */
    function initialize(address _assetToken, address admin) external initializer {
        _assetToken.validateAddress("assetToken");
        admin.validateAddress("admin");
       
        __AccessControl_init();
        __Pausable_init();
        __UUPSUpgradeable_init();

        _getStorage().assetToken = _assetToken;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ORDER_ADMIN_ROLE, msg.sender);

        emit OrderManagerInitialized(_assetToken, msg.sender);
    }

    /* ------------- EXTERNAL -------------------- */
    function createOrder(address investor, uint256 amount)
        external
        onlyRole(ORDER_ADMIN_ROLE)
        whenNotPaused
        returns (uint256 orderId)
    {
        investor.validateAddress("investor");
        require(amount > 0, "Amount must be greater than 0");

        Storage storage $ = _getStorage();
        orderId = ++$.orderCounter;

        $.orders[orderId] = Order({
            investor : investor,
            amount   : amount,
            status   : OrderStatus.Pending,
            createdAt: block.timestamp
        });

        emit OrderCreated(orderId, investor, amount);
    }

    function cancelOrder(uint256 orderId)
        external
        onlyRole(ORDER_ADMIN_ROLE)
        whenNotPaused
    {
        Storage storage $ = _getStorage();
        Order storage o = $.orders[orderId];
        require(o.investor != address(0), "Invalid orderId");
        require(o.status == OrderStatus.Pending, "Not pending");

        o.status = OrderStatus.Cancelled;
        emit OrderCancelled(orderId, o.investor);
    }

    function completeOrder(uint256 orderId)
        external
        onlyRole(ORDER_ADMIN_ROLE)
        whenNotPaused
    {
        Storage storage $ = _getStorage();
        Order storage o = $.orders[orderId];
        require(o.investor != address(0), "Invalid orderId");
        require(o.status == OrderStatus.Pending, "Not pending");

        // Mint tokens to the investor
        IOwnmaliAsset token = IOwnmaliAsset(_getStorage().assetToken);
        token.mint(o.investor, o.amount, bytes32(orderId));

        o.status = OrderStatus.Completed;
        emit OrderCompleted(orderId, o.investor, o.amount);
    }

    /* ------------- VIEW ------------------------ */
    function getOrder(uint256 orderId)
        external
        view
        returns (address investor, uint256 amount, OrderStatus status, uint256 createdAt)
    {
        Storage storage $ = _getStorage();
        Order storage o = $.orders[orderId];
        require(o.investor != address(0), "Invalid orderId");
        return (o.investor, o.amount, o.status, o.createdAt);
    }

    /* ------------- PAUSE ----------------------- */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /* ------------- UUPS UPGRADER -------------- */
    function _authorizeUpgrade(address newImpl)
        internal
        view
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        if (newImpl.code.length == 0) revert("Not a contract");
    }

    /* ------------- GAP ------------------------- */
    uint256[50] private __gap;
}