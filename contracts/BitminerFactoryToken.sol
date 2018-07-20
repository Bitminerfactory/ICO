pragma solidity 0.4.24;

import "./MintableToken.sol";
import "./BurnableToken.sol";

contract BitminerFactoryToken is MintableToken, BurnableToken {
  
    using SafeMath for uint256;
    
    // NOT IN CAPITALIZED SNAKE_CASE TO BE RECONIZED FROM METAMASK
    string public constant name = "Bitminer Factory Token";
    string public constant symbol = "BMF";
    uint8 public constant decimals = 18;
    
    uint256 public cap;
    
    mapping (address => uint256) amount;
    
    event MultiplePurchase(address indexed purchaser);
    
    constructor(uint256 _cap) public {
        require(_cap > 0);
        cap = _cap;
    }

    function burnFrom(address _from, uint256 _value) external onlyDestroyer {
        require(balances[_from] >= _value && _value > 0);
        
        burn(_from, _value);
    }

    function mint(
        address _to,
        uint256 _amount
    )  
    public
    returns (bool)
    {
        require(totalSupply_.add(_amount) <= cap);

        return super.mint(_to, _amount);
    }
    
    // EACH INVESTOR MUST FIGURE IN THE '_TO' ARRAY ONLY ONE TIME
    function multipleTransfer(address[] _to, uint256[] _amount) public hasMintPermission canMint {
        require(_to.length == _amount.length);

        _multiSet(_to, _amount); // map beneficiaries 
        _multiMint(_to);
        
        emit MultiplePurchase(msg.sender);
    }
    
    // INTERNAL INTERFACE
    
    // add to beneficiary mapping in batches
    function _multiSet(address[] _to, uint256[] _amount) internal {
        for (uint i = 0; i < _to.length; i++) {
            amount[_to[i]] = _amount[i];
        }
    }
    
    // add to beneficiary mapping in batches
    function _multiMint(address[] _to) internal {
        for(uint i = 0; i < _to.length; i++) {
            mint(_to[i], amount[_to[i]]);
        }
    }
}