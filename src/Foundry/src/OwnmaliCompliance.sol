// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

contract MockCompliance {
    mapping(address => bool) public allowedAddresses;
    
    function addTokenAgent(address _agentAddress) external {
        allowedAddresses[_agentAddress] = true;
    }
    
    function removeTokenAgent(address _agentAddress) external {
        allowedAddresses[_agentAddress] = false;
    }
    
    function isTokenAgent(address _agentAddress) external view returns (bool) {
        return allowedAddresses[_agentAddress];
    }
    
    function isTokenBound(address _token) external pure returns (bool) {
        return true;
    }
    
    function bindToken(address _token) external {}
    
    function unbindToken(address _token) external {}
    
    function addModule(address _module) external {}
    
    function removeModule(address _module) external {}
    
    function callModuleFunction(bytes calldata callData) external pure returns (bytes memory) {
        return "";
    }
    
    function canTransfer(
        address _from,
        address _to,
        uint256 _amount
    ) external pure returns (bool) {
        return true;
    }
    
    function transferred(
        address _from,
        address _to,
        uint256 _amount
    ) external {}
    
    function created(address _to, uint256 _amount) external {}
    
    function destroyed(address _from, uint256 _amount) external {}
    
    function paused(address _token) external {}
    
    function unpaused(address _token) external {}
    
    function getModules() external pure returns (address[] memory) {
        return new address[](0);
    }
    
    function transferOwnershipOnComplianceContract(address _newOwner) external {}
    
    function complianceCheck(
        address _from,
        address _to,
        uint256 _value
    ) external  pure returns (bool) {
        return true;
    }
    
    function batchComplianceCheck(
        address[] calldata _from,
        address[] calldata _to,
        uint256[] calldata _amount
    ) external pure returns (bool[] memory) {
        bool[] memory results = new bool[](_from.length);
        for (uint i = 0; i < _from.length; i++) {
            results[i] = true;
        }
        return results;
    }
    
    function moduleCheck(
        address _from,
        address _to,
        uint256 _value,
        address _token
    ) external pure returns (bool) {
        return true;
    }
}