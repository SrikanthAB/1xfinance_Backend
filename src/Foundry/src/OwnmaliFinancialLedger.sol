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
import "./interfaces/IOwnmaliFinancialLedger.sol";

/**
 * @title OwnmaliFinancialLedger
 * @notice Tracks financial transactions for SPVs / assets
 * @dev   Deterministic storage slot (keccak256("ownmali.ledger.v1") - 1)
 */
contract OwnmaliFinancialLedger is
    Initializable,
    UUPSUpgradeable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    IOwnmaliFinancialLedger
{
    using Address for address;
    using OwnmaliValidation  for *;

    /* ---------------- CONSTANTS ---------------- */
    bytes32 public constant LEDGER_ADMIN_ROLE = keccak256("LEDGER_ADMIN_ROLE");

    /* ---------- STORAGE SLOT (EIP-7201) -------- */
    /// @custom:storage-location erc7201:ownmali.ledger.v1
    struct Storage {
        uint256 transactionCounter;
        mapping(uint256 => Transaction) transactions;
        mapping(uint256 => bytes32)   transactionReferences; // txId → refId
        mapping(bytes32 => uint256[]) transactionsByReference; // refId → txIds
    }

    uint256 private constant STORAGE_SLOT =
        uint256(keccak256("ownmali.ledger.v1")) - 1;

    function _getStorage() private pure returns (Storage storage $) {
        bytes32 slot = bytes32(STORAGE_SLOT);
        assembly ("memory-safe") { $.slot := slot }
    }

    /* ---------------- ERRORS ------------------- */
    error InvalidContractInterface(string contractName);

    /* ------------- INITIALIZER ----------------- */
    function initialize(address admin) external initializer {
        admin.validateAddress("admin");

        __AccessControl_init();
        __Pausable_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(LEDGER_ADMIN_ROLE, msg.sender);

        emit LedgerInitialized(msg.sender);
    }

    /* ------------- EXTERNAL -------------------- */
    function recordTransaction(
        address from,
        address to,
        uint256 amount,
        bytes32 transactionType,
        bytes32 metadataCID,
        bytes32 referenceId
    )
        external
        override
        onlyRole(LEDGER_ADMIN_ROLE)
        whenNotPaused
        returns (uint256 transactionId)
    {
        if (from != address(0)) from.validateAddress("from");
        to.validateAddress("to");
        transactionType.validateBytes32("transactionType");
        metadataCID.validateBytes32("metadataCID");

        Storage storage $ = _getStorage();
        transactionId = ++$.transactionCounter;

        $.transactions[transactionId] = Transaction({
            from       : from,
            to         : to,
            amount     : amount,
            transactionType : transactionType,
            metadataCID     : metadataCID,
            timestamp  : uint48(block.timestamp)
        });

        if (referenceId != bytes32(0)) {
            $.transactionReferences[transactionId] = referenceId;
            $.transactionsByReference[referenceId].push(transactionId);
        }

        emit TransactionRecorded(
            transactionId,
            from,
            to,
            amount,
            transactionType,
            metadataCID,
            referenceId
        );
    }

    function recordBatchTransactions(
        Transaction[] calldata transactions_,
        bytes32 referenceId
    )
        external
        override
        onlyRole(LEDGER_ADMIN_ROLE)
        whenNotPaused
        returns (uint256[] memory transactionIds)
    {
        uint256 len = transactions_.length;
        require(len > 0 && len <= 100, "Length 1-100");
        if (referenceId != bytes32(0)) referenceId.validateBytes32("referenceId");

        Storage storage $ = _getStorage();
        transactionIds = new uint256[](len);

        for (uint256 i = 0; i < len; ++i) {
            Transaction calldata t = transactions_[i];
            if (t.from != address(0)) t.from.validateAddress("from");
            t.to.validateAddress("to");
            t.transactionType.validateBytes32("transactionType");
            t.metadataCID.validateBytes32("metadataCID");

            uint256 txId = ++$.transactionCounter;
            $.transactions[txId] = Transaction({
                from       : t.from,
                to         : t.to,
                amount     : t.amount,
                transactionType : t.transactionType,
                metadataCID     : t.metadataCID,
                timestamp  : uint48(block.timestamp)
            });

            if (referenceId != bytes32(0)) {
                $.transactionReferences[txId] = referenceId;
                $.transactionsByReference[referenceId].push(txId);
            }

            transactionIds[i] = txId;

            emit TransactionRecorded(
                txId,
                t.from,
                t.to,
                t.amount,
                t.transactionType,
                t.metadataCID,
                referenceId
            );
        }

        emit BatchTransactionsRecorded(transactionIds, referenceId);
    }

   function reverseTransaction(
    uint256 transactionId,
    string calldata reason,
    bytes32 metadataCID
)
    external
    override
    onlyRole(LEDGER_ADMIN_ROLE)
    whenNotPaused
    returns (uint256 reversalTxId)
{
    require(transactionId > 0 && transactionId <= _getStorage().transactionCounter, "Invalid id");
    Transaction storage original = _getStorage().transactions[transactionId];

    // inline the same logic as recordTransaction
    Storage storage $ = _getStorage();
    reversalTxId = ++$.transactionCounter;

    $.transactions[reversalTxId] = Transaction({
        from       : original.to,
        to         : original.from,
        amount     : original.amount,
        transactionType : keccak256("REVERSAL"),
        metadataCID     : metadataCID,
        timestamp  : uint48(block.timestamp)
    });

    emit TransactionRecorded(
        reversalTxId,
        original.to,
        original.from,
        original.amount,
        keccak256("REVERSAL"),
        metadataCID,
        bytes32(0)
    );

    emit TransactionReversed(transactionId, reversalTxId, reason);
}

    /* ------------- VIEW ------------------------ */
    function getTransaction(uint256 transactionId)
        external
        view
        override
        returns (
            address from,
            address to,
            uint256 amount,
            bytes32 transactionType,
            bytes32 metadataCID,
            uint48 timestamp
        )
    {
        Transaction storage t = _getStorage().transactions[transactionId];
        require(t.to != address(0), "Invalid id");
        return (t.from, t.to, t.amount, t.transactionType, t.metadataCID, t.timestamp);
    }

    function getTransactionsByType(
        bytes32 transactionType,
        uint256 offset,
        uint256 limit
    )
        external
        view
        override
        returns (uint256[] memory ids, Transaction[] memory txns)
    {
        require(limit > 0 && limit <= 100, "Limit 1-100");
        Storage storage $ = _getStorage();
        uint256 total = $.transactionCounter;
        uint256 count = 0;

        // first pass – count matches
        for (uint256 i = 1; i <= total; ++i) {
            if ($.transactions[i].transactionType == transactionType) ++count;
        }

        if (offset >= count) return (new uint256[](0), new Transaction[](0));
        uint256 resultCount = count - offset > limit ? limit : count - offset;

        ids = new uint256[](resultCount);
        txns = new Transaction[](resultCount);

        uint256 found = 0;
        uint256 add   = 0;
        for (uint256 i = 1; i <= total && add < resultCount; ++i) {
            Transaction storage t = $.transactions[i];
            if (t.transactionType == transactionType) {
                if (found >= offset) {
                    ids[add]   = i;
                    txns[add]  = t;
                    ++add;
                }
                ++found;
            }
        }
    }

    function getTransactionsByReference(bytes32 referenceId)
        external
        view
        override
        returns (uint256[] memory ids, Transaction[] memory txns)
    {
        require(referenceId != bytes32(0), "Invalid ref");
        Storage storage $ = _getStorage();
        ids = $.transactionsByReference[referenceId];
        txns = new Transaction[](ids.length);
        for (uint256 i = 0; i < ids.length; ++i) {
            txns[i] = $.transactions[ids[i]];
        }
    }

    /* ------------- PAUSE / UNPAUSE ------------- */
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

    /* ------------- GAP SLOTS -------------- */
    uint256[50] private __gap;
}