pragma solidity 0.4.24;

import "../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract Whitelist is Ownable {
    
    address public whitelister;

    mapping(address => bool) private inWhitelist;

    event Whitelisted(address[] funders);
    
    modifier onlyWhitelister {
        require(msg.sender == whitelister);
        _;
    }
    
    // set the whitelister == msg.sender on contract creation
    constructor() public {
        whitelister = msg.sender;
    }

    function setNewWhitelister(address newWhitelister) external onlyOwner {
        whitelister = newWhitelister;
    }

    // Adds funders to the whitelist in batches.
    function whitelist(address[] funders) external onlyWhitelister {
        for (uint i = 0; i < funders.length; i++) {
            inWhitelist[funders[i]] = true;
        }
        emit Whitelisted(funders);
    }

    // Removes funders from the whitelist in batches.
    function unwhitelist(address[] funders) external onlyWhitelister {
        for (uint i = 0; i < funders.length; i++) {
            inWhitelist[funders[i]] = false;
        }
    }

    // Used in Crowdsale to check if funder is allowed
    function isWhitelisted(address funder) external view returns (bool) {
        return inWhitelist[funder];
    }
}