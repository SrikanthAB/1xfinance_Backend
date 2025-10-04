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
import "./interfaces/IOwnmaliDAO.sol";
import "./interfaces/IOwnmaliSPV.sol";
import "./interfaces/IOwnmaliAsset.sol";

// Custom errors
error InvalidParameter(string param);
error InvalidProposal(uint256 proposalId);
error VotingPeriodEnded(uint256 proposalId);
error InsufficientTokens(address voter, uint256 required);
error ProposalAlreadyExecuted(uint256 proposalId);

// Events
event DAOInitialized(
    address indexed spvContract,
    address indexed admin,
    uint48 votingPeriodSeconds,
    uint256 minVotingTokens,
    uint256 approvalThresholdPct
);

event ProposalCreated(
    uint256 indexed proposalId,
    address indexed proposer,
    bytes proposalData
);

event Voted(
    uint256 indexed proposalId,
    address indexed voter,
    bool support,
    uint256 votingPower
);

event ProposalExecuted(uint256 indexed proposalId);

/**
 * @title OwnmaliDAO
 * @notice Governance for SPVs via proposals & voting
 * @dev   Uses EIP-7201 storage slot for upgrade safety
 */
contract OwnmaliDAO is
    Initializable,
    UUPSUpgradeable,
    AccessControlUpgradeable,
    PausableUpgradeable
{
    using Address for address;
    using OwnmaliValidation  for *;

    /* ---------------- CONSTANTS ---------------- */
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");
    bytes32 public constant VOTER_ROLE    = keccak256("VOTER_ROLE");

    /* ---------- STORAGE SLOT (EIP-7201) -------- */
    /// @custom:storage-location erc7201:ownmali.dao.v1
    struct Proposal {
        address proposer;
        bytes   proposalData;
        uint48  startTime;
        uint48  endTime;
        uint256 votesFor;
        uint256 votesAgainst;
        bool    executed;
        bool    active;
    }
    struct Storage {
        address spvContract;
        uint48  votingPeriodSeconds;
        uint256 minVotingTokens;
        uint256 approvalThresholdPct;
        uint256 proposalCounter;
        mapping(uint256 => Proposal) proposals;
    }

    uint256 private constant STORAGE_SLOT =
        uint256(keccak256("ownmali.dao.v1")) - 1;

function _getStorage() private pure returns (Storage storage s) {
    bytes32 slot = bytes32(STORAGE_SLOT);
    assembly {
        s.slot := slot
    }
}
   

    /* ------------- INITIALIZER ----------------- */
    function initialize(
        address _spvContract,
        address admin,
        uint48  _votingPeriodSeconds,
        uint256 _minVotingTokens,
        uint256 _approvalThresholdPct
    ) external initializer {
        _spvContract.validateAddress("spvContract");
        admin.validateAddress("admin");
        _votingPeriodSeconds.validateAmount("votingPeriodSeconds");
        _minVotingTokens.validateAmount("minVotingTokens");
        if (_approvalThresholdPct > 100) revert InvalidParameter("approvalThresholdPct");

        __AccessControl_init();
        __Pausable_init();
        __UUPSUpgradeable_init();

        Storage storage $ = _getStorage();
        $.spvContract         = _spvContract;
        $.votingPeriodSeconds = _votingPeriodSeconds;
        $.minVotingTokens     = _minVotingTokens;
        $.approvalThresholdPct= _approvalThresholdPct;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PROPOSER_ROLE, msg.sender);
        _grantRole(VOTER_ROLE, msg.sender);

        emit DAOInitialized(_spvContract, admin, _votingPeriodSeconds, _minVotingTokens, _approvalThresholdPct);
    }

    /* --------------- EXTERNAL ------------------ */
    function propose(bytes calldata proposalData)
        external
        onlyRole(PROPOSER_ROLE)
        whenNotPaused
    {
        Storage storage $ = _getStorage();
        uint256 id = ++$.proposalCounter;

        $.proposals[id] = Proposal({
            proposer    : msg.sender,
            proposalData: proposalData,
            startTime   : uint48(block.timestamp),
            endTime     : uint48(block.timestamp) + $.votingPeriodSeconds,
            votesFor    : 0,
            votesAgainst: 0,
            executed    : false,
            active      : true
        });

        emit ProposalCreated(id, msg.sender, proposalData);
    }

    function vote(uint256 proposalId, bool support)
        external
        onlyRole(VOTER_ROLE)
        whenNotPaused
    {
        Storage storage $ = _getStorage();
        Proposal storage p = $.proposals[proposalId];

        if (!p.active) revert InvalidProposal(proposalId);
        if (block.timestamp > p.endTime) revert VotingPeriodEnded(proposalId);

        IOwnmaliSPV  spv   = IOwnmaliSPV($.spvContract);
        IOwnmaliAsset token = IOwnmaliAsset(spv.getSPVDetails().assetTokenContract);
        uint256 voterBalance = token.balanceOf(msg.sender);
        if (voterBalance < $.minVotingTokens) revert InsufficientTokens(msg.sender, $.minVotingTokens);

        if (support) {
            p.votesFor += voterBalance;
        } else {
            p.votesAgainst += voterBalance;
        }

        emit Voted(proposalId, msg.sender, support, voterBalance);
    }

    function executeProposal(uint256 proposalId)
        external
        onlyRole(PROPOSER_ROLE)
        whenNotPaused
    {
        Storage storage $ = _getStorage();
        Proposal storage p = $.proposals[proposalId];

        if (!p.active) revert InvalidProposal(proposalId);
        if (block.timestamp <= p.endTime) revert VotingPeriodEnded(proposalId);
        if (p.executed) revert ProposalAlreadyExecuted(proposalId);

        uint256 totalVotes = p.votesFor + p.votesAgainst;
        bool approved = totalVotes > 0 &&
                        (p.votesFor * 100) / totalVotes >= $.approvalThresholdPct;

        if (approved) {
            p.executed = true;
            emit ProposalExecuted(proposalId);
        }
        p.active = false;
    }

    /* ------------- VIEW FUNCTIONS -------------- */
    function spvContract() external view returns (address) {
        return _getStorage().spvContract;
    }

    function votingPeriodSeconds() external view returns (uint48) {
        return _getStorage().votingPeriodSeconds;
    }

    function minVotingTokens() external view returns (uint256) {
        return _getStorage().minVotingTokens;
    }

    function approvalThresholdPct() external view returns (uint256) {
        return _getStorage().approvalThresholdPct;
    }

    function proposalCounter() external view returns (uint256) {
        return _getStorage().proposalCounter;
    }

    // Return type exactly matches IOwnmaliDAO
    function proposals(uint256 id) external view returns (
        address proposer,
        bytes memory proposalData,
        uint48 startTime,
        uint48 endTime,
        uint256 votesFor,
        uint256 votesAgainst,
        bool executed,
        bool active
    ) {
        Proposal memory p = _getStorage().proposals[id];
        return (
            p.proposer,
            p.proposalData,
            p.startTime,
            p.endTime,
            p.votesFor,
            p.votesAgainst,
            p.executed,
            p.active
        );
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