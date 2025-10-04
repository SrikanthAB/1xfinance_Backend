// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../../src/interfaces/IIdentityRegistry.sol";

contract MockIdentityRegistry {
    mapping(address => bool) public verifiedAddresses;
    
    function registerIdentity(
        address _userAddress,
        address _identity,
        uint16[] calldata _countries
    ) external {
        verifiedAddresses[_userAddress] = true;
    }
    
    function deleteIdentity(address _userAddress) external {
        verifiedAddresses[_userAddress] = false;
    }
    
    function updateIdentity(
        address _userAddress,
        address _identity
    ) external {
        verifiedAddresses[_userAddress] = true;
    }
    
    function updateCountry(
        address _userAddress,
        uint16 _country
    ) external {}
    
    function isVerified(address _userAddress) external view returns (bool) {
        return verifiedAddresses[_userAddress];
    }
    
    function contains(address _wallet) external view returns (bool) {
        return verifiedAddresses[_wallet];
    }
    
    function issuersRegistry() external view returns (address) {
        return address(0);
    }
    
    function topicsRegistry() external view returns (address) {
        return address(0);
    }
    
    function identityStorage() external view returns (address) {
        return address(0);
    }
    
    function investorCountry(address _wallet) external view returns (uint16) {
        return 0;
    }
    
    function setIdentityRegistryStorage(address _identityRegistryStorage) external {}
    
    function setClaimTopicsRegistry(address _claimTopicsRegistry) external {}
    
    function setTrustedIssuersRegistry(address _trustedIssuersRegistry) external {}
    
    function transferOwnershipOnIdentityRegistryContract(address _newOwner) external {}
    
    function identity(address _userAddress) external view returns (address) {
        return address(0);
    }
    
    function batchRegisterIdentity(
        address[] calldata _userAddresses,
        address[] calldata _identities,
        uint16[] calldata _countries
    ) external {}
}