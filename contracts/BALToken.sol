// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BALToken is ERC20, Ownable {
    mapping(address => bool) private minters;
    event MinterSet(address indexed account, bool allowed);

    constructor() ERC20("BAL Token", "BAL") Ownable(msg.sender) {}

    function setMinter(address account, bool allowed) external onlyOwner {
        minters[account] = allowed;
        emit MinterSet(account, allowed);
    }

    function mint(address to, uint256 amount) external {
        require(minters[msg.sender], "Not authorized");
        _mint(to, amount);
    }
}
