// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

/* ──────────── Open-Zeppelin imports ──────────── */
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";

/* ──────────── Local interfaces ──────────── */
import "./interfaces/IIdentityRegistry.sol";
import "./interfaces/IModularCompliance.sol";
import "./interfaces/IToken.sol";

/**
 * @title OwnmaliAsset
 * @notice ERC-3643 compliant token with deterministic storage slot
 * @dev   Storage lives at `uint256(keccak256("ownmali.storage.v1")) - 1`
 */
contract OwnmaliAsset is
    Initializable,
    UUPSUpgradeable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    IToken
{
    using Address for address;

    /* -------------------- CONSTANTS -------------------- */
    bytes32 public constant MINTER_ROLE      = keccak256("MINTER_ROLE");
    bytes32 public constant ASSET_ADMIN_ROLE = keccak256("ASSET_ADMIN_ROLE");

    /* ---------------- EIP-7201 STORAGE ----------------- */
    /// @custom:storage-location erc7201:ownmali.storage.v1
    struct Storage {
        string  name;
        string  symbol;
        uint8   decimals;
        uint256 _totalSupply;
        uint256 maxSupply;
        uint256 tokenPrice;
        address assetOwner;
        address factory;
        address orderManager;
        address dao;
        address financialLedger;
        address assetManager;
        bytes32 spvId;
        bytes32 assetId;
        bytes32 metadataCID;
        uint256 dividendPct;
        bool    isActive;
        address onchainID;
        IIdentityRegistry identityRegistry;
        IModularCompliance compliance;
        mapping(address => uint256) balances;
        mapping(address => mapping(address => uint256)) allowances;
        mapping(address => bool) frozen;
        mapping(address => uint256) frozenTokens;
        string  _version;
    }

    /* ------------- Storage-slot helper --------------- */
    uint256 private constant STORAGE_SLOT_UINT = uint256(keccak256("ownmali.storage.v1")) - 1;

  function _getStorage() private pure returns (Storage storage $) {
    bytes32 slot = bytes32(STORAGE_SLOT_UINT);
    assembly ("memory-safe") { $.slot := slot }
}

    /* ---------------- INIT STRUCT -------------------- */
    struct AssetInitData {
        string  name;
        string  symbol;
        uint8   decimals;
        uint256 maxSupply;
        uint256 tokenPrice;
        address assetOwner;
        address factory;
        address orderManager;
        address dao;
        address financialLedger;
        address assetManager;
        bytes32 spvId;
        bytes32 assetId;
        bytes32 metadataCID;
        uint256 dividendPct;
        bool    isActive;
        address identityRegistry;
        address compliance;
    }

    /* ----------------- EVENTS ------------------------- */
    // Events are inherited from IOwnmaliAsset
event AssetInitialized(address indexed assetOwner, bytes32 indexed assetId);
event TokensMinted(address indexed to, uint256 amount, bytes32 referenceId);
event TokensBurned(address indexed from, uint256 amount, bytes32 referenceId);
    /* --------------- INITIALIZER --------------------- */
    function initialize(bytes calldata initData) external initializer {
        AssetInitData memory d = abi.decode(initData, (AssetInitData));

        /* ---- Validation ---- */
        require(bytes(d.name).length   > 0,  "Invalid name");
        require(bytes(d.symbol).length > 0,  "Invalid symbol");
        require(d.assetOwner  != address(0), "Invalid assetOwner");
        require(d.factory     != address(0), "Invalid factory");
        require(d.orderManager!= address(0), "Invalid orderManager");
        require(d.dao         != address(0), "Invalid dao");
        require(d.financialLedger != address(0), "Invalid financialLedger");
        require(d.assetManager    != address(0), "Invalid assetManager");
        require(d.identityRegistry!= address(0), "Invalid identityRegistry");
        require(d.compliance      != address(0), "Invalid compliance");
        require(d.spvId != bytes32(0), "Invalid spvId");
        require(d.assetId != bytes32(0), "Invalid assetId");
        require(d.metadataCID != bytes32(0), "Invalid metadataCID");

        /* ---- Store data ---- */
        Storage storage $ = _getStorage();
        $.name        = d.name;
        $.symbol      = d.symbol;
        $.decimals    = d.decimals;
        $.maxSupply   = d.maxSupply;
        $.tokenPrice  = d.tokenPrice;
        $.assetOwner  = d.assetOwner;
        $.factory     = d.factory;
        $.orderManager= d.orderManager;
        $.dao         = d.dao;
        $.financialLedger = d.financialLedger;
        $.assetManager    = d.assetManager;
        $.spvId       = d.spvId;
        $.assetId     = d.assetId;
        $.metadataCID = d.metadataCID;
        $.dividendPct = d.dividendPct;
        $.isActive    = d.isActive;
        $.identityRegistry = IIdentityRegistry(d.identityRegistry);
        $.compliance       = IModularCompliance(d.compliance);
        $._version = "1.0.0";

        /* ---- Roles ---- */
        __AccessControl_init();
        __Pausable_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ASSET_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);

        emit AssetInitialized(msg.sender, $.assetId);
    }

    /* --------------- View Functions (IToken) --------------- */
    function name() external view override returns (string memory)    { return _getStorage().name; }
    function symbol() external view override returns (string memory)  { return _getStorage().symbol; }
    function decimals() external view override returns (uint8)        { return _getStorage().decimals; }
    function onchainID() external view override returns (address)     { return _getStorage().onchainID; }
    function identityRegistry() external view override returns (IIdentityRegistry) { return _getStorage().identityRegistry; }
    function compliance() external view override returns (IModularCompliance)      { return _getStorage().compliance; }

    /* --------------- ERC20 / IToken Core ------------------- */
    function paused() public view override(PausableUpgradeable, IToken) returns (bool) { return super.paused(); }
    function totalSupply() public view returns (uint256) { return _getStorage()._totalSupply; }
    function balanceOf(address account) public view returns (uint256) { return _getStorage().balances[account]; }
    function allowance(address owner, address spender) public view returns (uint256) { return _getStorage().allowances[owner][spender]; }

    function approve(address spender, uint256 amount) public whenNotPaused returns (bool) {
        Storage storage $ = _getStorage();
        $.allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transfer(address to, uint256 amount) public whenNotPaused returns (bool) {
        return transferFrom(msg.sender, to, amount);
    }

    function transferFrom(address from, address to, uint256 amount)
        public
        whenNotPaused
        returns (bool)
    {
        Storage storage $ = _getStorage();
        require(!$.frozen[from] && !$.frozen[to], "Account frozen");
        require($.identityRegistry.isVerified(from) && $.identityRegistry.isVerified(to), "KYC not verified");
        require($.compliance.canTransfer(from, to, amount), "Transfer not compliant");

        if (msg.sender != from) {
            uint256 allowed = $.allowances[from][msg.sender];
            require(allowed >= amount, "Insufficient allowance");
            $.allowances[from][msg.sender] = allowed - amount;
        }
        _transfer(from, to, amount);
        return true;
    }

    /* --------------- IToken Batch Helpers ------------------- */
    function mint(address to, uint256 amount) external override(IToken) onlyRole(MINTER_ROLE) whenNotPaused {
        _mint(to, amount);
    }

    function burn(address user, uint256 amount) external override(IToken) onlyRole(MINTER_ROLE) whenNotPaused {
        _burn(user, amount);
    }

    function batchMint(address[] calldata toList, uint256[] calldata amounts)
        external
        override(IToken)
        onlyRole(MINTER_ROLE)
        whenNotPaused
    {
        require(toList.length == amounts.length, "Length mismatch");
        for (uint256 i = 0; i < toList.length; ++i) {
            _mint(toList[i], amounts[i]);
        }
    }

    function batchBurn(address[] calldata users, uint256[] calldata amounts)
        external
        override(IToken)
        onlyRole(MINTER_ROLE)
        whenNotPaused
    {
        require(users.length == amounts.length, "Length mismatch");
        for (uint256 i = 0; i < users.length; ++i) {
            _burn(users[i], amounts[i]);
        }
    }

    function setAddressFrozen(address user, bool freeze) external override(IToken) onlyRole(ASSET_ADMIN_ROLE) {
        _getStorage().frozen[user] = freeze;
    }

    function batchSetAddressFrozen(address[] calldata users, bool[] calldata freeze)
        external
        override(IToken)
        onlyRole(ASSET_ADMIN_ROLE)
    {
        require(users.length == freeze.length, "Length mismatch");
        Storage storage $ = _getStorage();
        for (uint256 i = 0; i < users.length; ++i) {
            $.frozen[users[i]] = freeze[i];
        }
    }

    function freezePartialTokens(address user, uint256 amount) external onlyRole(ASSET_ADMIN_ROLE) {
        Storage storage $ = _getStorage();
        require($.balances[user] >= amount, "Insufficient balance");
        $.frozenTokens[user] += amount;
    }

    function unfreezePartialTokens(address user, uint256 amount) external onlyRole(ASSET_ADMIN_ROLE) {
        Storage storage $ = _getStorage();
        require($.frozenTokens[user] >= amount, "Insufficient frozen");
        $.frozenTokens[user] -= amount;
    }

    function batchFreezePartialTokens(address[] calldata users, uint256[] calldata amounts)
        external
        onlyRole(ASSET_ADMIN_ROLE)
    {
        require(users.length == amounts.length, "Length mismatch");
        Storage storage $ = _getStorage();
        for (uint256 i = 0; i < users.length; ++i) {
            require($.balances[users[i]] >= amounts[i], "Insufficient balance");
            $.frozenTokens[users[i]] += amounts[i];
        }
    }

    function batchUnfreezePartialTokens(address[] calldata users, uint256[] calldata amounts)
        external
        onlyRole(ASSET_ADMIN_ROLE)
    {
        require(users.length == amounts.length, "Length mismatch");
        Storage storage $ = _getStorage();
        for (uint256 i = 0; i < users.length; ++i) {
            require($.frozenTokens[users[i]] >= amounts[i], "Insufficient frozen");
            $.frozenTokens[users[i]] -= amounts[i];
        }
    }

    function isFrozen(address user) external view override(IToken) returns (bool) {
        return _getStorage().frozen[user];
    }

    function getFrozenTokens(address user) external view override(IToken) returns (uint256) {
        return _getStorage().frozenTokens[user];
    }

    function forcedTransfer(address from, address to, uint256 amount)
        external
        override(IToken)
        onlyRole(ASSET_ADMIN_ROLE)
        whenNotPaused
        returns (bool)
    {
        _transfer(from, to, amount);
        return true;
    }

    function batchForcedTransfer(address[] calldata fromList, address[] calldata toList, uint256[] calldata amounts)
        external
        override(IToken)
        onlyRole(ASSET_ADMIN_ROLE)
        whenNotPaused
    {
        require(
            fromList.length == toList.length && fromList.length == amounts.length,
            "Length mismatch"
        );
        for (uint256 i = 0; i < fromList.length; ++i) {
            _transfer(fromList[i], toList[i], amounts[i]);
        }
    }

    function batchTransfer(address[] calldata toList, uint256[] calldata amounts)
        external
        override(IToken)
        whenNotPaused
    {
        require(toList.length == amounts.length, "Length mismatch");
        for (uint256 i = 0; i < toList.length; ++i) {
            transfer(toList[i], amounts[i]);
        }
    }

    /* --------------- ADMIN SETTERS --------------- */
    function setIdentityRegistry(address registry) external override(IToken) onlyRole(ASSET_ADMIN_ROLE) {
        require(registry != address(0), "Invalid registry");
        _getStorage().identityRegistry = IIdentityRegistry(registry);
    }

    function setCompliance(address complianceAddr) external override(IToken) onlyRole(ASSET_ADMIN_ROLE) {
        require(complianceAddr != address(0), "Invalid compliance");
        _getStorage().compliance = IModularCompliance(complianceAddr);
    }

    function setName(string calldata newName) external override(IToken) onlyRole(ASSET_ADMIN_ROLE) {
        require(bytes(newName).length > 0, "Invalid name");
        _getStorage().name = newName;
    }

    function setSymbol(string calldata newSymbol) external override(IToken) onlyRole(ASSET_ADMIN_ROLE) {
        require(bytes(newSymbol).length > 0, "Invalid symbol");
        _getStorage().symbol = newSymbol;
    }

    function setOnchainID(address onchainID_) external override(IToken) onlyRole(ASSET_ADMIN_ROLE) {
        _getStorage().onchainID = onchainID_;
    }

    function recoveryAddress(
        address lost,
        address recovered,
        address /*investorOnchainID*/
    ) external override(IToken) onlyRole(ASSET_ADMIN_ROLE) whenNotPaused returns (bool) {
        Storage storage $ = _getStorage();
        uint256 bal = $.balances[lost];
        require(bal > 0, "Nothing to recover");
        require(!$.frozen[recovered], "Recovered frozen");
        require($.identityRegistry.isVerified(recovered), "KYC not verified");

        $.balances[lost] = 0;
        $.balances[recovered] += bal;
        emit Transfer(lost, recovered, bal);
        return true;
    }

    function tokenPrice() external view returns (uint256) {
        return _getStorage().tokenPrice;
    }

    function maxSupply() external view returns (uint256) {
        return _getStorage().maxSupply;
    }

    function lockPeriod() external pure returns (uint256) {
        return 0; // Default no lock period
    }

    function dividendPct() external view returns (uint256) {
        return _getStorage().dividendPct;
    }

    function lockedBalanceOf(address account) external view returns (uint256) {
        return _getStorage().frozenTokens[account];
    }

    function unlockableBalanceOf(address account) external pure returns (uint256) {
        return 0; // Simplified implementation
    }

    function setAssetContracts(
        address _orderManager,
        address _dao,
        address _financialLedger,
        address _assetManager
    ) external onlyRole(ASSET_ADMIN_ROLE) {
        Storage storage $ = _getStorage();
        $.orderManager = _orderManager;
        $.dao = _dao;
        $.financialLedger = _financialLedger;
        $.assetManager = _assetManager;
    }

    function lockTokens(address account, uint256 amount) external onlyRole(ASSET_ADMIN_ROLE) {
        Storage storage $ = _getStorage();
        require($.balances[account] >= amount, "Insufficient balance");
        $.frozenTokens[account] += amount;
    }

    function unlockTokens(address account, uint256 amount) external onlyRole(ASSET_ADMIN_ROLE) {
        Storage storage $ = _getStorage();
        require($.frozenTokens[account] >= amount, "Insufficient locked tokens");
        $.frozenTokens[account] -= amount;
    }

    function mint(address to, uint256 amount, bytes32 referenceId) external onlyRole(MINTER_ROLE) {
        _mint(to, amount);
        emit TokensMinted(to, amount, referenceId);
    }

    function burn(address from, uint256 amount, bytes32 referenceId) external onlyRole(MINTER_ROLE) {
        _burn(from, amount);
        emit TokensBurned(from, amount, referenceId);
    }

    function version() external view returns (string memory) {
        return _getStorage()._version;
    }

    /* ------------- INTERNAL HELPERS ------------- */
    function _mint(address to, uint256 amount) private {
        Storage storage $ = _getStorage();
        require($._totalSupply + amount <= $.maxSupply, "Exceeds maxSupply");
        $._totalSupply += amount;
        $.balances[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function _burn(address user, uint256 amount) private {
        Storage storage $ = _getStorage();
        require($.balances[user] >= amount, "Insufficient balance");
        $._totalSupply -= amount;
        $.balances[user] -= amount;
        emit Transfer(user, address(0), amount);
    }

    function _transfer(address from, address to, uint256 amount) private {
        Storage storage $ = _getStorage();
        require($.balances[from] >= amount, "Insufficient balance");
        $.balances[from] -= amount;
        $.balances[to]   += amount;
        emit Transfer(from, to, amount);
    }

    /* ------------- UUPS UPGRADER ------------- */
    function _authorizeUpgrade(address newImpl)
        internal
        view
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(newImpl.code.length > 0, "Not a contract");
    }
}