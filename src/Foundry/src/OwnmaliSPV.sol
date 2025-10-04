// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

/* ──────────── Open-Zeppelin imports (upgrade-safe) ──────────── */
import {Initializable}            from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable}          from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {PausableUpgradeable}      from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {Address}                  from "@openzeppelin/contracts/utils/Address.sol";

/* ──────────── Local imports ──────────── */
import "./OwnmaliValidation.sol";
import "./interfaces/IOwnmaliFinancialLedger.sol";

/**
 * @title OwnmaliSPV
 * @notice SPV for asset tokenization, KYC & investor roles
 * @dev   Deterministic storage slot (keccak256("ownmali.spv.v1") - 1)
 */
contract OwnmaliSPV is
    Initializable,
    UUPSUpgradeable,
    PausableUpgradeable,
    AccessControlUpgradeable
{
    using Address for address;
    using OwnmaliValidation for *;

    /* ---------------- CONSTANTS ---------------- */
    bytes32 public constant SPV_ADMIN_ROLE = keccak256("SPV_ADMIN_ROLE");
    bytes32 public constant INVESTOR_ROLE  = keccak256("INVESTOR_ROLE");

    /* ---------- STORAGE SLOT (EIP-7201) -------- */
    /// @custom:storage-location erc7201:ownmali.spv.v1
    struct Storage {
        string  spvName;
        string  countryCode;
        bytes32 metadataCID;
        address registryContract;
        address assetTokenContract;
        address financialLedger;
        address orderManager;
        address dao;
        address assetManager;
        bool    isKycCompliant;
        mapping(address => bool) kycStatus;
        mapping(bytes32 => uint256) roleMemberCount;
        mapping(bytes32 => address[]) roleMembers; // Added to track role members
    }

    uint256 private constant STORAGE_SLOT =
        uint256(keccak256("ownmali.spv.v1")) - 1;

    function _getStorage() private pure returns (Storage storage $) {
        bytes32 slot = bytes32(STORAGE_SLOT);
        assembly ("memory-safe") { $.slot := slot }
    }

    /* ---------------- EVENTS ------------------- */
    event SPVCoreConfigured(
        string  indexed spvName,
        bool    indexed isKycCompliant,
        string  indexed countryCode,
        bytes32 metadataCID,
        address registryContract,
        address assetTokenContract
    );

    event SPVContractsConfigured(
        address indexed financialLedger,
        address indexed orderManager,
        address indexed dao,
        address assetManager
    );

    event KycStatusUpdated(address indexed investor, bool indexed status);

    /* ---------------- ERRORS ------------------- */
    error InvalidAddress(string param);
    error InvalidContract(string param);
    error InvalidStringLength(string param, uint256 max);
    error ArrayLengthMismatch(uint256 length1, uint256 length2);
    error IndexOutOfBounds(bytes32 role, uint256 index);

    /* ------------- INIT STRUCT ----------------- */
    struct InitParams {
        string  spvName;
        bool    isKycCompliant;
        string  countryCode;
        bytes32 metadataCID;
        address registryContract;
        address assetTokenContract;
        address financialLedger;
        address orderManager;
        address dao;
        address assetManager;
    }

    /* ------------- INITIALIZER ----------------- */
    function initialize(InitParams calldata params) external initializer {
        /* validation */
        require(bytes(params.spvName).length > 0 && bytes(params.spvName).length <= 100, "Invalid spvName");
        require(bytes(params.countryCode).length == 2, "Invalid countryCode");
        require(params.metadataCID != bytes32(0), "Invalid metadataCID");
      
        __Pausable_init();
        __UUPSUpgradeable_init();
        __AccessControl_init();

        Storage storage $ = _getStorage();
        $.spvName          = params.spvName;
        $.countryCode      = params.countryCode;
        $.metadataCID      = params.metadataCID;
        $.registryContract = params.registryContract;
        $.assetTokenContract = params.assetTokenContract;
        $.financialLedger    = params.financialLedger;
        $.orderManager       = params.orderManager;
        $.dao                = params.dao;
        $.assetManager       = params.assetManager;
        $.isKycCompliant     = params.isKycCompliant;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(SPV_ADMIN_ROLE, msg.sender);
        $.roleMemberCount[DEFAULT_ADMIN_ROLE] = 1;
        $.roleMemberCount[SPV_ADMIN_ROLE] = 1;
        $.roleMembers[DEFAULT_ADMIN_ROLE].push(msg.sender);
        $.roleMembers[SPV_ADMIN_ROLE].push(msg.sender);

        emit SPVCoreConfigured(
            params.spvName,
            params.isKycCompliant,
            params.countryCode,
            params.metadataCID,
            params.registryContract,
            params.assetTokenContract
        );

        emit SPVContractsConfigured(
            params.financialLedger,
            params.orderManager,
            params.dao,
            params.assetManager
        );
    }

    /* ------------- KYC MANAGEMENT -------------- */
    function updateKycStatus(address investor, bool newKycStatus)
        external
        whenNotPaused
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(investor != address(0), "Invalid investor");

        Storage storage $ = _getStorage();
        $.kycStatus[investor] = newKycStatus;
        if (newKycStatus) {
            if (!hasRole(INVESTOR_ROLE, investor)) {
                _grantRole(INVESTOR_ROLE, investor);
                $.roleMemberCount[INVESTOR_ROLE] += 1;
                $.roleMembers[INVESTOR_ROLE].push(investor);
            }
        } else {
            if (hasRole(INVESTOR_ROLE, investor)) {
                _revokeRole(INVESTOR_ROLE, investor);
                $.roleMemberCount[INVESTOR_ROLE] -= 1;
                // Remove investor from roleMembers array
                for (uint256 i = 0; i < $.roleMembers[INVESTOR_ROLE].length; ++i) {
                    if ($.roleMembers[INVESTOR_ROLE][i] == investor) {
                        $.roleMembers[INVESTOR_ROLE][i] = $.roleMembers[INVESTOR_ROLE][$.roleMembers[INVESTOR_ROLE].length - 1];
                        $.roleMembers[INVESTOR_ROLE].pop();
                        break;
                    }
                }
            }
        }

        IOwnmaliFinancialLedger($.financialLedger).recordTransaction(
            address(0),
            investor,
            0,
            keccak256("KYC_UPDATE"),
            $.metadataCID,
            keccak256(abi.encodePacked("KYC_UPDATE_", investor, block.timestamp))
        );

        emit KycStatusUpdated(investor, newKycStatus);
    }

    function batchUpdateKycStatus(
        address[] calldata investors,
        bool[] calldata newKycStatuses
    ) external whenNotPaused onlyRole(SPV_ADMIN_ROLE) {
        require(investors.length == newKycStatuses.length, "Length mismatch");

        Storage storage $ = _getStorage();
        for (uint256 i = 0; i < investors.length; ++i) {
            address investor = investors[i];
            require(investor != address(0), "Invalid investor");

            bool newStatus = newKycStatuses[i];
            if ($.kycStatus[investor] != newStatus) {
                $.kycStatus[investor] = newStatus;
                if (newStatus) {
                    if (!hasRole(INVESTOR_ROLE, investor)) {
                        _grantRole(INVESTOR_ROLE, investor);
                        $.roleMemberCount[INVESTOR_ROLE] += 1;
                        $.roleMembers[INVESTOR_ROLE].push(investor);
                    }
                } else {
                    if (hasRole(INVESTOR_ROLE, investor)) {
                        _revokeRole(INVESTOR_ROLE, investor);
                        $.roleMemberCount[INVESTOR_ROLE] -= 1;
                        // Remove investor from roleMembers array
                        for (uint256 j = 0; j < $.roleMembers[INVESTOR_ROLE].length; ++j) {
                            if ($.roleMembers[INVESTOR_ROLE][j] == investor) {
                                $.roleMembers[INVESTOR_ROLE][j] = $.roleMembers[INVESTOR_ROLE][$.roleMembers[INVESTOR_ROLE].length - 1];
                                $.roleMembers[INVESTOR_ROLE].pop();
                                break;
                            }
                        }
                    }
                }

                IOwnmaliFinancialLedger($.financialLedger).recordTransaction(
                    address(0),
                    investor,
                    0,
                    keccak256("KYC_BATCH"),
                    $.metadataCID,
                    keccak256(abi.encodePacked("KYC_BATCH_", investor, block.timestamp, i))
                );

                emit KycStatusUpdated(investor, newStatus);
            }
        }
    }

    /* ------------- ROLE MANAGEMENT -------------- */
    function getRoleMemberCount(bytes32 role) public view returns (uint256) {
        return _getStorage().roleMemberCount[role];
    }

    function getRoleMember(bytes32 role, uint256 index) public view returns (address) {
        Storage storage $ = _getStorage();
        if (index >= $.roleMembers[role].length) {
            revert IndexOutOfBounds(role, index);
        }
        return $.roleMembers[role][index];
    }

    /* ------------- VIEW FUNCTIONS -------------- */
    function isKycVerified(address investor) external view returns (bool) {
        return _getStorage().kycStatus[investor];
    }

    function isVerifiedInvestor(address investor) external view returns (bool) {
        return hasRole(INVESTOR_ROLE, investor) && _getStorage().kycStatus[investor];
    }

    function batchIsKycVerified(address[] calldata investors)
        external
        view
        returns (bool[] memory)
    {
        bool[] memory res = new bool[](investors.length);
        Storage storage $ = _getStorage();
        for (uint256 i = 0; i < investors.length; ++i) {
            res[i] = $.kycStatus[investors[i]];
        }
        return res;
    }

    function getKycVerifiedCount() external view returns (uint256) {
        uint256 total = getRoleMemberCount(INVESTOR_ROLE);
        uint256 count = 0;
        Storage storage $ = _getStorage();
        for (uint256 i = 0; i < total; ++i) {
            if ($.kycStatus[getRoleMember(INVESTOR_ROLE, i)]) ++count;
        }
        return count;
    }

    function getKycVerifiedInvestors(uint256 cursor, uint256 limit)
        external
        view
        returns (address[] memory investors, uint256 nextCursor)
    {
        uint256 total = getRoleMemberCount(INVESTOR_ROLE);
        if (cursor >= total) return (new address[](0), 0);
        uint256 end = cursor + limit > total ? total : cursor + limit;

        uint256 verified = 0;
        Storage storage $ = _getStorage();
        for (uint256 i = cursor; i < end; ++i) {
            if ($.kycStatus[getRoleMember(INVESTOR_ROLE, i)]) ++verified;
        }

        address[] memory res = new address[](verified);
        uint256 idx = 0;
        for (uint256 i = cursor; i < end; ++i) {
            address investor = getRoleMember(INVESTOR_ROLE, i);
            if ($.kycStatus[investor]) res[idx++] = investor;
        }
        nextCursor = end >= total ? 0 : end;
        return (res, nextCursor);
    }

    function getAllKycVerifiedInvestors() external view returns (address[] memory) {
        uint256 total = getRoleMemberCount(INVESTOR_ROLE);
        uint256 verified = 0;
        Storage storage $ = _getStorage();

        address[] memory temp = new address[](total);
        for (uint256 i = 0; i < total; ++i) {
            address investor = getRoleMember(INVESTOR_ROLE, i);
            if ($.kycStatus[investor]) temp[verified++] = investor;
        }

        address[] memory res = new address[](verified);
        for (uint256 i = 0; i < verified; ++i) res[i] = temp[i];
        return res;
    }

    function getSPVDetails() external view returns (InitParams memory) {
        Storage storage $ = _getStorage();
        return InitParams({
            spvName: $.spvName,
            isKycCompliant: $.isKycCompliant,
            countryCode: $.countryCode,
            metadataCID: $.metadataCID,
            registryContract: $.registryContract,
            assetTokenContract: $.assetTokenContract,
            financialLedger: $.financialLedger,
            orderManager: $.orderManager,
            dao: $.dao,
            assetManager: $.assetManager
        });
    }

    /* ------------- UUPS UPGRADER -------------- */
    function _authorizeUpgrade(address newImpl)
        internal
        view
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(newImpl.code.length > 0, "Not a contract");
    }

    /* ------------- GAP SLOTS -------------- */
    uint256[48] private __gap; 
    }