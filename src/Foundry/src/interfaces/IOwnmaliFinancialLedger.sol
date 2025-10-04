// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

/// @title IOwnmaliFinancialLedger
/// @notice Interface for OwnmaliFinancialLedger contract
/// @dev This interface defines the functions and events for tracking financial transactions
interface IOwnmaliFinancialLedger {
    /*//////////////////////////////////////////////////////////////
                                STRUCTS
    //////////////////////////////////////////////////////////////*/
    
    /// @notice Struct representing a financial transaction
    struct Transaction {
        address from;           // Sender's address (address(0) for mints)
        address to;             // Recipient's address
        uint256 amount;         // Transaction amount
        bytes32 transactionType; // Type of transaction
        bytes32 metadataCID;    // IPFS CID for additional metadata
        uint48 timestamp;       // Transaction timestamp
    }

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/
    
    /// @notice Emitted when a new transaction is recorded
    /// @param transactionId The ID of the transaction
    /// @param from The sender's address
    /// @param to The recipient's address
    /// @param amount The transaction amount
    /// @param transactionType The type of transaction
    /// @param metadataCID The metadata CID for additional information
    /// @param referenceId An optional reference ID for the transaction
    event TransactionRecorded(
        uint256 indexed transactionId,
        address indexed from,
        address indexed to,
        uint256 amount,
        bytes32 transactionType,
        bytes32 metadataCID,
        bytes32 referenceId
    );
    
    /// @notice Emitted when multiple transactions are recorded in a batch
    /// @param transactionIds The array of transaction IDs
    /// @param referenceId The reference ID for the batch
    event BatchTransactionsRecorded(
        uint256[] transactionIds,
        bytes32 referenceId
    );
    
    /// @notice Emitted when the ledger is initialized
    /// @param admin The address of the initial admin
    event LedgerInitialized(address admin);
    
    /// @notice Emitted when a transaction is reversed
    /// @param originalTxId The ID of the original transaction
    /// @param reversalTxId The ID of the reversal transaction
    /// @param reason The reason for the reversal
    event TransactionReversed(
        uint256 indexed originalTxId,
        uint256 indexed reversalTxId,
        string reason
    );

    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/
    
    /// @notice Reverts when an invalid address is provided
    /// @param paramName The name of the invalid parameter
    error InvalidAddress(string paramName);
    
    /// @notice Reverts when an invalid bytes32 value is provided
    /// @param paramName The name of the invalid parameter
    error InvalidBytes32(string paramName);

    /*//////////////////////////////////////////////////////////////
                          STATE-CHANGING FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    
    /// @notice Initializes the financial ledger contract
    /// @param admin The address that will have the default admin role
    function initialize(address admin) external;
    
    /// @notice Records a new financial transaction
    /// @param from The sender's address (address(0) for mints)
    /// @param to The recipient's address
    /// @param amount The transaction amount
    /// @param transactionType Type of transaction (use keccak256 hashes)
    /// @param metadataCID The metadata CID for additional information
    /// @param referenceId An optional reference ID for the transaction
    /// @return transactionId The ID of the recorded transaction
    function recordTransaction(
        address from,
        address to,
        uint256 amount,
        bytes32 transactionType,
        bytes32 metadataCID,
        bytes32 referenceId
    ) external returns (uint256 transactionId);
    
    /// @notice Records multiple transactions in a single batch
    /// @param transactions_ Array of transaction parameters
    /// @param referenceId An optional reference ID for the batch
    /// @return transactionIds Array of recorded transaction IDs
    function recordBatchTransactions(
        Transaction[] calldata transactions_,
        bytes32 referenceId
    ) external returns (uint256[] memory transactionIds);
    
    /// @notice Reverses a previously recorded transaction
    /// @param transactionId The ID of the transaction to reverse
    /// @param reason The reason for the reversal
    /// @param metadataCID Additional metadata for the reversal
    /// @return reversalTxId The ID of the reversal transaction
    function reverseTransaction(
        uint256 transactionId,
        string calldata reason,
        bytes32 metadataCID
    ) external returns (uint256 reversalTxId);

    /// @notice Pauses the contract
    function pause() external;

    /// @notice Unpauses the contract
    function unpause() external;
    
    /*//////////////////////////////////////////////////////////////
                            VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    
    
    /// @notice Gets transaction details by ID
    /// @param transactionId The ID of the transaction
    /// @return from The sender's address
    /// @return to The recipient's address
    /// @return amount The transaction amount
    /// @return transactionType The type of transaction
    /// @return metadataCID The metadata CID for additional information
    /// @return timestamp The transaction timestamp
    function getTransaction(uint256 transactionId) external view returns (
        address from,
        address to,
        uint256 amount,
        bytes32 transactionType,
        bytes32 metadataCID,
        uint48 timestamp
    );
    
    /// @notice Gets all transactions of a specific type
    /// @param transactionType The type of transactions to query
    /// @param offset The starting index for pagination
    /// @param limit The maximum number of transactions to return (max 100)
    /// @return An array of transaction IDs and their details
    function getTransactionsByType(
        bytes32 transactionType,
        uint256 offset,
        uint256 limit
    ) external view returns (uint256[] memory, Transaction[] memory);
    
    /// @notice Gets all transactions with a specific reference ID
    /// @param referenceId The reference ID to query
    /// @return An array of transaction IDs and their details
    function getTransactionsByReference(bytes32 referenceId) 
        external 
        view 
        returns (uint256[] memory, Transaction[] memory);

}
