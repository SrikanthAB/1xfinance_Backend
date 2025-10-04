// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

/**
 * @title  OwnmaliValidation
 * @notice Common validation helpers used across the Ownmali protocol
 * @dev    Library → pure functions only, no state
 */
library OwnmaliValidation {
    /* ---------------- ERRORS ---------------- */
    error ZeroAddress(string parameter);
    error InvalidStringLength(string parameter, uint256 maxLength);
    error InvalidParameter(string parameter);
    error InvalidAmount(string parameter);

    /* ---------------- FUNCTIONS ------------- */

    /// @dev Validates `addr` is not zero.
    function validateAddress(address addr, string memory paramName) internal pure {
        if (addr == address(0)) revert ZeroAddress(paramName);
    }

    /// @dev Validates non-empty string with max length.
    function validateStringLength(
        string memory str,
        uint256 maxLength,
        string memory paramName
    ) internal pure {
        unchecked {
            uint256 len = bytes(str).length;
            if (len == 0 || len > maxLength)
                revert InvalidStringLength(paramName, maxLength);
        }
    }

    /// @dev Validates non-zero bytes32.
    function validateBytes32(bytes32 value, string memory paramName) internal pure {
        if (value == bytes32(0)) revert InvalidParameter(paramName);
    }

    /// @dev Validates non-zero uint256.
    function validateAmount(uint256 value, string memory paramName) internal pure {
        if (value == 0) revert InvalidAmount(paramName);
    }
}