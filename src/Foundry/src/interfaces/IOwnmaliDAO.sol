// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

/// @title IOwnmaliDAO
/// @notice Interface for OwnmaliDAO contract handling SPV governance
interface IOwnmaliDAO {
    /// @notice Struct representing a governance proposal
    struct Proposal {
        address proposer;
        bytes proposalData;
        uint48 startTime;
        uint48 endTime;
        uint256 votesFor;
        uint256 votesAgainst;
        bool executed;
        bool active;
    }
    
    /// @notice Mapping of proposal ID to Proposal
    function proposals(uint256) external view returns (
        address proposer,
        bytes memory proposalData,
        uint48 startTime,
        uint48 endTime,
        uint256 votesFor,
        uint256 votesAgainst,
        bool executed,
        bool active
    );
    
    /// @notice The SPV contract address
    function spvContract() external view returns (address);
    
    /// @notice The voting period in seconds
    function votingPeriodSeconds() external view returns (uint48);
    
    /// @notice The minimum number of tokens required to vote
    function minVotingTokens() external view returns (uint256);
    
    /// @notice The approval threshold percentage
    function approvalThresholdPct() external view returns (uint256);
    
    /// @notice The current proposal counter
    function proposalCounter() external view returns (uint256);
    /// @notice Initializes the DAO contract
    /// @param _spvContract The SPV contract address
    /// @param admin The initial admin address
    /// @param _votingPeriodSeconds The voting period duration in seconds
    /// @param _minVotingTokens The minimum number of tokens required to vote
    /// @param _approvalThresholdPct The percentage threshold required for proposal approval
    function initialize(
        address _spvContract,
        address admin,
        uint48 _votingPeriodSeconds,
        uint256 _minVotingTokens,
        uint256 _approvalThresholdPct
    ) external;

    /// @notice Creates a new governance proposal
    /// @param proposalData The proposal execution data (encoded)
    function propose(bytes calldata proposalData) external;

    /// @notice Casts a vote on an active proposal
    /// @param proposalId The ID of the proposal
    /// @param support True if supporting the proposal, false otherwise
    function vote(uint256 proposalId, bool support) external;

    /// @notice Executes a proposal if voting passed the approval threshold
    /// @param proposalId The ID of the proposal to execute
    function executeProposal(uint256 proposalId) external;

    /// @notice Emitted when the DAO is initialized
    event DAOInitialized(
        address spvContract,
        address admin,
        uint48 votingPeriodSeconds,
        uint256 minVotingTokens,
        uint256 approvalThresholdPct
    );

    /// @notice Emitted when a new proposal is created
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        bytes proposalData
    );

    /// @notice Emitted when a vote is cast
    event Voted(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 weight
    );

    /// @notice Emitted when a proposal is successfully executed
    event ProposalExecuted(uint256 indexed proposalId);

    /// @notice Reverts if the proposal ID is invalid
    error InvalidProposal(uint256 proposalId);

    /// @notice Reverts if voting period has ended
    error VotingPeriodEnded(uint256 proposalId);

    /// @notice Reverts if voter does not hold the minimum tokens
    error InsufficientTokens(address voter, uint256 required);

    /// @notice Reverts if proposal is already executed
    error ProposalAlreadyExecuted(uint256 proposalId);

    /// @notice Reverts if any parameter is invalid (e.g., approval threshold)
    error InvalidParameter(string parameterName);
}
