pragma solidity ^0.4.24;

import '../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol';

// This contract holds a mapping of known funders with
// a boolean flag for whitelist status
contract Whitelist is Ownable {
    
    address public whitelister;

    struct Beneficiary {
        bool whitelisted;
    }

    mapping(address => Beneficiary) private beneficiaries;

    event Whitelisted(address[] funders);
    
    modifier onlyWhitelister {
        require(msg.sender == whitelister);
        _;
    }
    
    // set the whitelister == msg.sender on contract creation
    constructor() public {
        whitelister = msg.sender;
    }

    function setNewWhitelister(address new_whitelister) external onlyOwner {
        whitelister = new_whitelister;
    }

    // Adds funders to the whitelist in batches.
    function whitelist(address[] funders) external onlyWhitelister {
        for (uint i = 0; i < funders.length; i++) {
            beneficiaries[funders[i]].whitelisted = true;
        }
        emit Whitelisted(funders);
    }

    // Removes funders from the whitelist in batches.
    function unwhitelist(address[] funders) external onlyWhitelister {
        for (uint i = 0; i < funders.length; i++) {
            beneficiaries[funders[i]].whitelisted = false;
        }
    }

    // Used in Crowdsale to check if funder is allowed
    function isWhitelisted(address funder) external view returns (bool) {
        return beneficiaries[funder].whitelisted;
    }
}