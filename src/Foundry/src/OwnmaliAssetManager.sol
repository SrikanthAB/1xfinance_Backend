// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

/* ──────────── Open-Zeppelin imports ──────────── */
import {Initializable}            from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable}          from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {PausableUpgradeable}      from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

/* ──────────── Local contracts / interfaces ──────────── */
import "./OwnmaliValidation.sol";
import "./interfaces/IOwnmaliAssetManager.sol";
import "./interfaces/IOwnmaliAsset.sol";

/**
 * @title OwnmaliAssetManager
 * @notice Manages token operations for SPVs with deterministic storage slot
 * @dev   Uses EIP-7201 (`keccak("ownmali.manager.v1") - 1`)
 */
contract OwnmaliAssetManager is
    Initializable,
    UUPSUpgradeable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    IOwnmaliAssetManager
{
    using Address for address;
    using OwnmaliValidation for *;

    /* ---------------- CONSTANTS ---------------- */
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    /* -------------- STORAGE SLOT --------------- */
    /// @custom:storage-location erc7201:ownmali.manager.v1
    struct Storage {
        address spvContract;
        bytes32 spvId;
        bytes32 assetId;
        address assetOwner;
        address assetToken;
    }

    uint256 private constant STORAGE_SLOT =
        uint256(keccak256("ownmali.manager.v1")) - 1;

    function _getStorage() private pure returns (Storage storage $) {
        bytes32 slot = bytes32(STORAGE_SLOT);
        assembly ("memory-safe") { $.slot := slot }
    }

  

    /* ---------------- INITIALIZER -------------- */
    function initialize(
        address admin,
        address _spvContract,
        bytes32 _spvId,
        bytes32 _assetId,
        address _assetOwner,
        address _assetToken
    ) external override initializer {
        admin.validateAddress("admin");
        _spvContract.validateAddress("spvContract");
        _spvId.validateBytes32("spvId");
        _assetId.validateBytes32("assetId");
        _assetOwner.validateAddress("assetOwner");
        _assetToken.validateAddress("assetToken");
        if (_assetToken.code.length == 0) revert InvalidContractInterface("assetToken");

        __AccessControl_init();
        __Pausable_init();
        __UUPSUpgradeable_init();

        Storage storage $ = _getStorage();
        $.spvContract = _spvContract;
        $.spvId       = _spvId;
        $.assetId     = _assetId;
        $.assetOwner  = _assetOwner;
        $.assetToken  = _assetToken;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MANAGER_ROLE, msg.sender);

        emit AssetManagerInitialized(_spvContract, _spvId, _assetId, _assetOwner, _assetToken);
    }

    /* --------------- EXTERNAL FUNCTIONS --------------- */
    function transferTokens(address from, address to, uint256 amount)
        external
        override
        onlyRole(MANAGER_ROLE)
        whenNotPaused
    {
        from.validateAddress("from");
        to.validateAddress("to");
        amount.validateAmount("amount");

        IOwnmaliAsset(_getStorage().assetToken).transferFrom(from, to, amount);
        emit TokensTransferred(from, to, amount);
    }

    /// @inheritdoc IOwnmaliAssetManager
    function pause() external override onlyRole(MANAGER_ROLE) {
        _pause();
    }

    /// @inheritdoc IOwnmaliAssetManager
    function unpause() external override onlyRole(MANAGER_ROLE) {
        _unpause();
    }

    /* ------------- UUPS AUTHORIZER -------------- */
    function _authorizeUpgrade(address newImpl)
        internal
        view
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        if (newImpl.code.length == 0) revert("Not a contract");
    }

    /* ------------- VIEW HELPERS -------------- */
    function spvContract() external view returns (address) {
        return _getStorage().spvContract;
    }

    function spvId() external view returns (bytes32) {
        return _getStorage().spvId;
    }

    function assetId() external view returns (bytes32) {
        return _getStorage().assetId;
    }

    function assetOwner() external view returns (address) {
        return _getStorage().assetOwner;
    }

    function assetToken() external view returns (address) {
        return _getStorage().assetToken;
    }
}