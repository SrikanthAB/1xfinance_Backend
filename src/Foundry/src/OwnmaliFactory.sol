// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

/* ──────────── Open-Zeppelin imports ──────────── */
import {Initializable}            from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable}          from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {PausableUpgradeable}      from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Address as AddressUpgradeable} from "@openzeppelin/contracts/utils/Address.sol";
import {Clones}                   from "@openzeppelin/contracts/proxy/Clones.sol";
import {OwnmaliOrderManager} from "./OwnmaliOrderManager.sol";

/* ──────────── Local imports ──────────── */
import "./OwnmaliValidation.sol";
import "./interfaces/IOwnmaliRegistry.sol";
import "./interfaces/IOwnmaliSPV.sol";
import "./interfaces/IOwnmaliAsset.sol";
import "./interfaces/IOwnmaliOrderManager.sol";
import "./interfaces/IOwnmaliFinancialLedger.sol";
import "./interfaces/IOwnmaliDAO.sol";
import "./interfaces/IOwnmaliAssetManager.sol";


/**
 * @title OwnmaliFactory
 * @notice Factory for deploying SPV + asset bundles
 * @dev   Deterministic storage slot (keccak256("ownmali.factory.v1") - 1)
 */
contract OwnmaliFactory is
    Initializable,
    UUPSUpgradeable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable
{
    using SafeERC20 for IERC20;
    using AddressUpgradeable   for address;
    using OwnmaliValidation    for address; // Import the validation library

    /* ---------------- CONSTANTS ---------------- */
    bytes32 public constant ADMIN_ROLE          = keccak256("ADMIN_ROLE");
    bytes32 public constant SPV_CREATOR_ROLE    = keccak256("SPV_CREATOR_ROLE");
    bytes32 public constant TEMPLATE_MANAGER_ROLE = keccak256("TEMPLATE_MANAGER_ROLE");
    uint48  public constant MIN_TEMPLATE_UPDATE_DELAY = 1 days;
    string  public constant VERSION = "1.1.0";

    /* ---------- STORAGE SLOT (EIP-7201) -------- */
    /// @custom:storage-location erc7201:ownmali.factory.v1
    struct Storage {
        address registryContract;
        address identityRegistry;
        address compliance;
        mapping(string => TemplateInfo) templateInfo;
        mapping(string => PendingUpdate) pendingUpdates;
        mapping(string => address) templates;
    }

    uint256 private constant STORAGE_SLOT =
        uint256(keccak256("ownmali.factory.v1")) - 1;

    function _getStorage() private pure returns (Storage storage $) {
        bytes32 slot = bytes32(STORAGE_SLOT);
        assembly ("memory-safe") { $.slot := slot }
    }

    /* --------------- ERRORS -------------------- */
    error InvalidContractInterface(string);
    error UpdateDelayNotPassed();
    error UpdateAlreadyScheduled();
    error NoPendingUpdate();
    error SPVAlreadyExists();
    error AssetAlreadyExists();
    error TemplateNotSet();
    error TemplatePaused();
    error TemplateAlreadyPaused();
    error TemplateNotPaused();
    error InvalidTemplateType();
    error Unauthorized();

    /* --------------- EVENTS -------------------- */
    event SPVCreated(
        bytes32 indexed spvId,
        address indexed spvContract,
        address assetContract,
        address assetManager
    );
    event SPVAdditionalContracts(
        bytes32 indexed spvId,
        address indexed spvContract,
        address orderManager,
        address financialLedger,
        address dao
    );
    event TemplateUpdated(
        string indexed templateType,
        address oldTemplate,
        address newTemplate,
        uint256 version
    );
    event TemplateUpdateScheduled(
        string indexed templateType,
        address newTemplate,
        uint48 scheduledTime
    );
    event TemplateUpdateCancelled(string indexed templateType);
    event TemplatePauseStatusChanged(string indexed templateType, bool isPaused);
    event ContractsRegistered(
        bytes32 indexed spvId,
        bytes32 indexed assetId,
        address spvContract,
        address assetContract
    );
    event RegistryUpdated(address indexed oldRegistry, address indexed newRegistry);
    event IdentityRegistryUpdated(address indexed oldRegistry, address indexed newRegistry);
    event ComplianceUpdated(address indexed oldCompliance, address indexed newCompliance);
    event EmergencyPauseUpdated(bool isPaused);
    event EmergencyWithdraw(address indexed token, address indexed to, uint256 amount);

    /* ------------- INIT STRUCTS ---------------- */
    struct TemplateInfo {
        address template;
        uint256 version;
        uint48  lastUpdated;
        bool    isPaused;
    }

    struct PendingUpdate {
        address newTemplate;
        uint48  scheduledTime;
    }

    struct SPVParams {
        bytes32 spvId;
        string  name;
        bool    kycStatus;
        string  countryCode;
        bytes32 metadataCID;
        address owner;
    }

    struct AssetCoreParams {
        bytes32 assetId;
        string  name;
        string  symbol;
        bytes32 metadataCID;
        bytes32 legalMetadataCID;
        bytes32 assetType;
        uint16  chainId;
    }

    struct AssetConfigParams {
        uint256 maxSupply;
        uint256 tokenPrice;
        uint256 cancelDelay;
        uint256 dividendPct;
        uint256 premintAmount;
        uint256 minInvestment;
        uint256 maxInvestment;
        bool    isRealEstate;
        uint48  votingPeriodSeconds;
        uint256 minVotingTokens;
        uint256 approvalThresholdPct;
    }

    struct Deployment {
        address spvContract;
        address assetContract;
        address assetManager;
        address orderManager;
        address financialLedger;
        address dao;
    }

    struct TemplateAddresses {
        address assetTemplate;
        address realEstateAssetTemplate;
        address assetManagerTemplate;
        address orderManagerTemplate;
        address financialLedgerTemplate;
        address daoTemplate;
        address spvTemplate;
    }

    struct SPVRegistrationParams {
        bytes32 spvId;
        string name;
        bool kycStatus;
        string countryCode;
        bytes32 metadataCID;
        address owner;
        address spvContract;
        address assetContract;
        address orderManager;
        address financialLedger;
        address dao;
        address assetManager;
    }

    struct AssetRegistrationParams {
        bytes32 spvId;
        bytes32 assetId;
        string name;
        bytes32 assetType;
        address assetContract;
        address orderManager;
        address financialLedger;
        address dao;
        address assetManager;
        bytes32 metadataCID;
    }

    /* ------------- INITIALIZER ----------------- */
    function initialize(
        address registry_,
        address admin_,
        address identityRegistry_,
        address compliance_
    ) external initializer {
        OwnmaliValidation.validateAddress(registry_, "registry");
        OwnmaliValidation.validateAddress(admin_, "admin");
        OwnmaliValidation.validateAddress(identityRegistry_, "identityRegistry");
        OwnmaliValidation.validateAddress(compliance_, "compliance");

        __UUPSUpgradeable_init();
        __AccessControl_init();
        __Pausable_init();
        __ReentrancyGuard_init();

        Storage storage $ = _getStorage();
        $.registryContract   = registry_;
        $.identityRegistry   = identityRegistry_;
        $.compliance         = compliance_;

        _grantRole(DEFAULT_ADMIN_ROLE, admin_);
        _grantRole(ADMIN_ROLE, admin_);
        _grantRole(SPV_CREATOR_ROLE, admin_);
        _grantRole(TEMPLATE_MANAGER_ROLE, admin_);

        _setRoleAdmin(SPV_CREATOR_ROLE, ADMIN_ROLE);
        _setRoleAdmin(TEMPLATE_MANAGER_ROLE, ADMIN_ROLE);
    }


    /* ------------- CORE FUNCTION --------------- */
    function createSPVAndAsset(
        SPVParams calldata spv,
        AssetCoreParams calldata core,
        AssetConfigParams calldata cfg
    )
        external
        onlyRole(SPV_CREATOR_ROLE)
        whenNotPaused
        nonReentrant
        returns (Deployment memory)
    {
        _validateInputs(spv, core, cfg);
        _checkExisting(spv.spvId, core.assetId);

        Deployment memory d = _deployContracts(cfg.isRealEstate);
        _initializeAll(d, spv, core, cfg);
        _registerAll(d, spv, core);

        emit SPVCreated(spv.spvId, d.spvContract, d.assetContract, d.assetManager);
        emit SPVAdditionalContracts(spv.spvId, d.spvContract, d.orderManager, d.financialLedger, d.dao);

        return d;
    }

    /* ------------- TEMPLATE ADMIN -------------- */
    function setTemplate(string calldata tType, address tpl)
        external
        onlyRole(TEMPLATE_MANAGER_ROLE)
        whenNotPaused
    {
        _validateTemplateType(tType);
        OwnmaliValidation.validateAddress(tpl, "template");
        require(tpl.code.length > 0, "Invalid contract");

        Storage storage $ = _getStorage();
        address old = $.templates[tType];
        TemplateInfo storage info = $.templateInfo[tType];
        info.template   = tpl;
        info.version   += 1;
        info.lastUpdated = uint48(block.timestamp);
        info.isPaused    = false;
        $.templates[tType] = tpl;

        emit TemplateUpdated(tType, old, tpl, info.version);
    }

    /* ------------- PAUSE ----------------------- */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
        emit EmergencyPauseUpdated(true);
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
        emit EmergencyPauseUpdated(false);
    }

    /* ------------- UUPS UPGRADER --------------- */
    function _authorizeUpgrade(address newImpl)
        internal
        view
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(newImpl.code.length > 0, "Not a contract");
    }

    /* ------------- INTERNAL -------------------- */
    function _validateInputs(
        SPVParams calldata spv,
        AssetCoreParams calldata core,
        AssetConfigParams calldata cfg
    ) internal pure {
        OwnmaliValidation.validateBytes32(spv.spvId, "spvId");
        OwnmaliValidation.validateBytes32(core.assetId, "assetId");

        bytes memory spvNameBytes = bytes(spv.name);
        require(spvNameBytes.length > 0 && spvNameBytes.length <= 100, "Invalid name length");
        require(bytes(spv.countryCode).length == 2, "Invalid countryCode length");
        OwnmaliValidation.validateBytes32(spv.metadataCID, "metadataCID");
        OwnmaliValidation.validateAddress(spv.owner, "owner");

        bytes memory coreNameBytes = bytes(core.name);
        require(coreNameBytes.length > 0 && coreNameBytes.length <= 100, "Invalid asset name length");
        require(bytes(core.symbol).length > 0 && bytes(core.symbol).length <= 10, "Invalid symbol length");
        OwnmaliValidation.validateBytes32(core.metadataCID, "metadataCID");
        OwnmaliValidation.validateBytes32(core.legalMetadataCID, "legalMetadataCID");
        OwnmaliValidation.validateBytes32(core.assetType, "assetType");
        require(core.chainId > 0, "Invalid chainId");

        require(cfg.maxSupply > 0, "Invalid maxSupply");
        require(cfg.tokenPrice > 0, "Invalid tokenPrice");
        require(cfg.minInvestment <= cfg.maxInvestment, "Invalid investment range");
        require(cfg.approvalThresholdPct <= 100, "Invalid approval threshold");
        require(cfg.dividendPct <= 100, "Invalid dividend percentage");
    }

    function _checkExisting(bytes32 spvId, bytes32 assetId) internal view {
        IOwnmaliRegistry registry = IOwnmaliRegistry(_getStorage().registryContract);
        require(!registry.hasSPV(spvId), "SPV already exists");
        require(!registry.hasAsset(assetId), "Asset already exists");
    }

    function _deployContracts(bool isRealEstate) internal returns (Deployment memory) {
        string memory assetType = isRealEstate ? "realEstateAsset" : "asset";
        _checkTemplateAvailability(assetType);
        _checkTemplateAvailability("assetManager");
        _checkTemplateAvailability("orderManager");
        _checkTemplateAvailability("financialLedger");
        _checkTemplateAvailability("dao");
        _checkTemplateAvailability("spv");

        address spvContract = Clones.clone(_getStorage().templates["spv"]);
        address assetContract = Clones.clone(_getStorage().templates[assetType]);
        address assetManager = Clones.clone(_getStorage().templates["assetManager"]);
        address orderManager = Clones.clone(_getStorage().templates["orderManager"]);
        address financialLedger = Clones.clone(_getStorage().templates["financialLedger"]);
        address dao = Clones.clone(_getStorage().templates["dao"]);

        return Deployment(spvContract, assetContract, assetManager, orderManager, financialLedger, dao);
    }

    function _initializeAll(
        Deployment memory d,
        SPVParams calldata spv,
        AssetCoreParams calldata core,
        AssetConfigParams calldata cfg
    ) internal {
        IOwnmaliSPV(d.spvContract).initialize(IOwnmaliSPV.InitParams({
            spvName: spv.name,
            isKycCompliant: spv.kycStatus,
            countryCode: spv.countryCode,
            metadataCID: spv.metadataCID,
            registryContract: _getStorage().registryContract,
            assetTokenContract: d.assetContract,
            financialLedger: d.financialLedger,
            orderManager: d.orderManager,
            dao: d.dao,
            assetManager: d.assetManager
        }));

        IOwnmaliAsset(d.assetContract).initialize(abi.encode(IOwnmaliAsset.TokenConfig({
              name: core.name,
    symbol: core.symbol,
    decimals: 18,
    maxSupply: cfg.maxSupply,
    tokenPrice: cfg.tokenPrice,
    assetOwner: spv.owner,
    factory: address(this),
    orderManager: d.orderManager,
    dao: d.dao,
    financialLedger: d.financialLedger,
    assetManager: d.assetManager,
    spvId: spv.spvId,
    assetId: core.assetId,
    metadataCID: core.metadataCID,
    dividendPct: cfg.dividendPct,
    minInvestment: 0,  // Add default value
    maxInvestment: type(uint256).max,  // Add default value
    lockPeriod: 0,  // Add default value
    isActive: true
        })));

        IOwnmaliAssetManager(d.assetManager).initialize(
            spv.owner, d.spvContract, spv.spvId, core.assetId, spv.owner, d.assetContract
        );

        IOwnmaliOrderManager(d.orderManager).initialize(d.assetContract, spv.owner);
        // Grant ORDER_ADMIN_ROLE to SPV owner
        IOwnmaliOrderManager(d.orderManager).grantRole(
            keccak256("ORDER_ADMIN_ROLE"),
            spv.owner
        );
        // Grant MINTER_ROLE to order manager on asset token
        IOwnmaliAsset(d.assetContract).grantRole(
            keccak256("MINTER_ROLE"),
            d.orderManager
        );
        IOwnmaliFinancialLedger(d.financialLedger).initialize(spv.owner);
        IOwnmaliDAO(d.dao).initialize(
            d.spvContract, spv.owner, cfg.votingPeriodSeconds, cfg.minVotingTokens, cfg.approvalThresholdPct
        );
    }

    function _registerAll(
        Deployment memory d,
        SPVParams calldata spv,
        AssetCoreParams calldata core
    ) internal {
        IOwnmaliRegistry registry = IOwnmaliRegistry(_getStorage().registryContract);

        SPVRegistrationParams memory spvParams = SPVRegistrationParams({
            spvId: spv.spvId,
            name: spv.name,
            kycStatus: spv.kycStatus,
            countryCode: spv.countryCode,
            metadataCID: spv.metadataCID,
            owner: spv.owner,
            spvContract: d.spvContract,
            assetContract: d.assetContract,
            orderManager: d.orderManager,
            financialLedger: d.financialLedger,
            dao: d.dao,
            assetManager: d.assetManager
        });

        bytes memory spvData = abi.encode(
            spvParams.name,
            spvParams.kycStatus,
            spvParams.countryCode,
            spvParams.metadataCID,
            spvParams.owner,
            spvParams.spvContract,
            spvParams.assetContract,
            spvParams.orderManager,
            spvParams.financialLedger,
            spvParams.dao,
            spvParams.assetManager
        );
        registry.registerSPV(spvParams.spvId, spvData);

        AssetRegistrationParams memory assetParams = AssetRegistrationParams({
            spvId: spv.spvId,
            assetId: core.assetId,
            name: core.name,
            assetType: core.assetType,
            assetContract: d.assetContract,
            orderManager: d.orderManager,
            financialLedger: d.financialLedger,
            dao: d.dao,
            assetManager: d.assetManager,
            metadataCID: core.metadataCID
        });

        bytes memory assetData = abi.encode(
            assetParams.name,
            assetParams.assetType,
            assetParams.assetContract,
            assetParams.orderManager,
            assetParams.financialLedger,
            assetParams.dao,
            assetParams.assetManager,
            assetParams.metadataCID
        );
        registry.registerAsset(assetParams.spvId, assetParams.assetId, assetData);

        emit ContractsRegistered(spv.spvId, core.assetId, d.spvContract, d.assetContract);
    }

    function _checkTemplateAvailability(string memory templateType) internal view {
        Storage storage $ = _getStorage();
        require($.templates[templateType] != address(0), "Template not set");
        require(!$.templateInfo[templateType].isPaused, "Template paused");
        require($.templates[templateType].code.length > 0, "Invalid contract");
    }

    /* ------------- VIEW FUNCTIONS -------------- */
    function getTemplates() external view returns (TemplateAddresses memory) {
        Storage storage $ = _getStorage();
        return TemplateAddresses({
            assetTemplate: $.templates["asset"],
            realEstateAssetTemplate: $.templates["realEstateAsset"],
            assetManagerTemplate: $.templates["assetManager"],
            orderManagerTemplate: $.templates["orderManager"],
            financialLedgerTemplate: $.templates["financialLedger"],
            daoTemplate: $.templates["dao"],
            spvTemplate: $.templates["spv"]
        });
    }

    /* ------------- ADMIN FUNCTIONS ------------- */
    function updateRegistry(address newRegistry) external onlyRole(ADMIN_ROLE) whenNotPaused {
        OwnmaliValidation.validateAddress(newRegistry, "newRegistry");
        Storage storage $ = _getStorage();
        address oldRegistry = $.registryContract;
        $.registryContract = newRegistry;
        emit RegistryUpdated(oldRegistry, newRegistry);
    }

    function updateIdentityRegistry(address newIdentityRegistry) external onlyRole(ADMIN_ROLE) whenNotPaused {
        OwnmaliValidation.validateAddress(newIdentityRegistry, "newIdentityRegistry");
        Storage storage $ = _getStorage();
        address oldIdentityRegistry = $.identityRegistry;
        $.identityRegistry = newIdentityRegistry;
        emit IdentityRegistryUpdated(oldIdentityRegistry, newIdentityRegistry);
    }

    function updateCompliance(address newCompliance) external onlyRole(ADMIN_ROLE) whenNotPaused {
        OwnmaliValidation.validateAddress(newCompliance, "newCompliance");
        Storage storage $ = _getStorage();
        address oldCompliance = $.compliance;
        $.compliance = newCompliance;
        emit ComplianceUpdated(oldCompliance, newCompliance);
    }

    function emergencyPause() external onlyRole(ADMIN_ROLE) {
        _pause();
        emit EmergencyPauseUpdated(true);
    }

    function emergencyUnpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
        emit EmergencyPauseUpdated(false);
    }

    function emergencyWithdraw(
        address token,
        address to,
        uint256 amount
    ) external onlyRole(ADMIN_ROLE) nonReentrant {
        OwnmaliValidation.validateAddress(to, "to");
        if (token == address(0)) {
            uint256 balance = address(this).balance;
            if (amount == 0 || amount > balance) amount = balance;
            OwnmaliValidation.validateAmount(amount, "amount");
            AddressUpgradeable.sendValue(payable(to), amount);
        } else {
            uint256 balance = IERC20(token).balanceOf(address(this));
            if (amount == 0 || amount > balance) amount = balance;
            OwnmaliValidation.validateAmount(amount, "amount");
            IERC20(token).safeTransfer(to, amount);
        }
        emit EmergencyWithdraw(token, to, amount);
    }

    /* ------------- TEMPLATE ADMIN FUNCTIONS ------------- */
    function scheduleTemplateUpdate(string calldata templateType, address newTemplateAddress)
        external
        onlyRole(TEMPLATE_MANAGER_ROLE)
        whenNotPaused
    {
        _validateTemplateType(templateType);
        OwnmaliValidation.validateAddress(newTemplateAddress, "newTemplateAddress");
        require(newTemplateAddress.code.length > 0, "Invalid contract");
        require(_getStorage().pendingUpdates[templateType].scheduledTime == 0, "Update already scheduled");

        uint48 scheduledTime = uint48(block.timestamp + MIN_TEMPLATE_UPDATE_DELAY);
        _getStorage().pendingUpdates[templateType] = PendingUpdate(newTemplateAddress, scheduledTime);
        emit TemplateUpdateScheduled(templateType, newTemplateAddress, scheduledTime);
    }

    function executeTemplateUpdate(string calldata templateType)
        external
        onlyRole(TEMPLATE_MANAGER_ROLE)
        whenNotPaused
    {
        PendingUpdate storage update = _getStorage().pendingUpdates[templateType];
        require(update.scheduledTime != 0, "No pending update");
        require(block.timestamp >= update.scheduledTime, "Delay not passed");

        Storage storage $ = _getStorage();
        address oldTemplate = $.templates[templateType];
        TemplateInfo storage info = $.templateInfo[templateType];
        info.template = update.newTemplate;
        unchecked { info.version++; }
        info.lastUpdated = uint48(block.timestamp);
        info.isPaused = false;
        $.templates[templateType] = update.newTemplate;
        delete $.pendingUpdates[templateType];

        emit TemplateUpdated(templateType, oldTemplate, update.newTemplate, info.version);
    }

    function cancelTemplateUpdate(string calldata templateType)
        external
        onlyRole(TEMPLATE_MANAGER_ROLE)
        whenNotPaused
    {
        require(_getStorage().pendingUpdates[templateType].scheduledTime != 0, "No pending update");
        delete _getStorage().pendingUpdates[templateType];
        emit TemplateUpdateCancelled(templateType);
    }

    function pauseTemplate(string calldata templateType)
        external
        onlyRole(ADMIN_ROLE)
        whenNotPaused
    {
        _validateTemplateType(templateType);
        TemplateInfo storage info = _getStorage().templateInfo[templateType];
        require(info.template != address(0), "Template not set");
        require(!info.isPaused, "Template already paused");
        info.isPaused = true;
        emit TemplatePauseStatusChanged(templateType, true);
    }

    function unpauseTemplate(string calldata templateType)
        external
        onlyRole(ADMIN_ROLE)
        whenNotPaused
    {
        _validateTemplateType(templateType);
        TemplateInfo storage info = _getStorage().templateInfo[templateType];
        require(info.template != address(0), "Template not set");
        require(info.isPaused, "Template not paused");
        info.isPaused = false;
        emit TemplatePauseStatusChanged(templateType, false);
    }

    /* ------------- PRIVATE HELPERS ------------- */
    function _validateTemplateType(string calldata templateType) private pure {
        bytes32 h = keccak256(abi.encodePacked(templateType));
        if (
            h == keccak256("asset") ||
            h == keccak256("realEstateAsset") ||
            h == keccak256("assetManager") ||
            h == keccak256("orderManager") ||
            h == keccak256("financialLedger") ||
            h == keccak256("dao") ||
            h == keccak256("spv")
        ) return;
        revert InvalidTemplateType();
    }

    /* ------------- GAP SLOTS -------------- */
    uint256[50] private __gap;
}