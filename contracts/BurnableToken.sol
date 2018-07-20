pragma solidity 0.4.24;

import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/BasicToken.sol";
import "../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";

/**
 * @title Burnable Token
 * @dev Token that can be irreversibly burned (destroyed).
 * CONTRACT CHANGED IN ORDER TO SET A DESTROYER != OWNER
 */
contract BurnableToken is BasicToken, Ownable {

    event Burn(address indexed burner, uint256 value);
    
    address public destroyer;

    modifier onlyDestroyer() {
        require(msg.sender == destroyer || msg.sender == owner);
        _;
    }
    
    // destroyer must be settled
    function setDestroyer(address _destroyer) external onlyOwner {
        destroyer = _destroyer;
    }

    function burn(address _who, uint256 _value) internal {
        require(_value <= balances[_who]);
        // no need to require value <= totalSupply, since that would imply the
        // sender's balance is greater than the totalSupply, which *should* be an assertion failure

        balances[_who] = balances[_who].sub(_value);
        totalSupply_ = totalSupply_.sub(_value);
        emit Burn(_who, _value);
        emit Transfer(_who, address(0), _value);
    }
}