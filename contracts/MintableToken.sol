pragma solidity 0.4.24;

import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";

/**
 * @title Mintable token
 * @dev Simple ERC20 Token example, with mintable token creation
 * @dev Issue: * https://github.com/OpenZeppelin/openzeppelin-solidity/issues/120
 * Based on code by TokenMarketNet: https://github.com/TokenMarketNet/ico/blob/master/contracts/MintableToken.sol
 * BASED ON OPENZEPPELIN-SOLIDITY MINTABLE TOKEN WITH CHANGES IN ORDER TO SET 2 MINTERS:
 * * the contract deployer (owner)
 * * the crowdsale contract
 */
contract MintableToken is StandardToken, Ownable {
   
    event Mint(address indexed to, uint256 amount);
    event MintFinished();
    event MinterAssigned(address indexed owner, address newMinter);

    bool public mintingFinished = false;

    modifier canMint() {
        require(!mintingFinished);
        _;
    }
    address public crowdsale;
    
    // we have two minters the crowdsale contract and the token deployer(owner)
    modifier hasMintPermission() {
        require(msg.sender == crowdsale || msg.sender == owner);
        _;
    }

    function setCrowdsale(address _crowdsaleContract) external onlyOwner {
        crowdsale = _crowdsaleContract;
        emit MinterAssigned(msg.sender, _crowdsaleContract);
    }

  /**
   * @dev Function to mint tokens
   * @param _to The address that will receive the minted tokens.
   * @param _amount The amount of tokens to mint.
   * @return A boolean that indicates if the operation was successful.
   */
    function mint(
        address _to,
        uint256 _amount
    )
        public
        hasMintPermission
        canMint  
        returns (bool)
    { 
        require(balances[_to].add(_amount) > balances[_to]); // Guard against overflow
        totalSupply_ = totalSupply_.add(_amount);
        balances[_to] = balances[_to].add(_amount);
        emit Mint(_to, _amount);
        emit Transfer(address(0), _to, _amount);
        return true;
    }

  /**
   * @dev Function to stop minting new tokens.
   * @return True if the operation was successful.
   */
    function finishMinting() public hasMintPermission canMint returns (bool) {
        mintingFinished = true;
        emit MintFinished();
        return true;
    }
}