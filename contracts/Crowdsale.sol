pragma solidity ^0.4.24;

import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";

import "./MintableToken.sol";
import  "./Whitelist.sol";

contract Crowdsale is Ownable {
    using SafeMath for uint256;

    // The token being sold
    ERC20 public tokenContract; 
    
    // The contract to check beneficiaries' address against
    Whitelist public whitelistContract; 

    address public wallet;
    
    // change in wei
    uint256 public rate_one;
    uint256 public rate_two;
    uint256 public rate_three;
    
    uint256 public weiRaised;
    
    uint256 public constant openingTime = 1530256151;  // venerdì, 29 giugno 2018 09:09:11 GMT+02:00
    uint256 public constant closingTime = 1530343554;  // sabato, 30 giugno 2018 09:25:54 GMT+02:00
    
    bool public isFinalized = false;

    modifier onlyWhileOpen {
        require(now >= openingTime && now <= closingTime);
        require(!isFinalized);
        _;
    }
  
  /**
   * Event for token purchase logging
   * @param purchaser who paid for the tokens
   * @param beneficiary who got the tokens
   * @param value weis paid for purchase
   * @param amount amount of tokens purchased
   */
    event TokenPurchase(
        address indexed purchaser,
        address indexed beneficiary,
        uint256 value,
        uint256 amount
    );
    
    event Finalized();
    event WhitelistAssigned(address indexed owner, address newWhitelist);

    /**
    * @param _rate_one Number of token units a buyer gets per wei in the first Crowdsale phase
    * @param _rate_two Number of token units a buyer gets per wei in the second Crowdsale phase
    * @param _rate_three Number of token units a buyer gets per wei in the third Crowdsale phase
    * @param _wallet Address where collected funds will be forwarded to
    * @param _tokenContract Address of the token being sold
    */
    constructor(uint256 _rate_one, uint256 _rate_two, uint256 _rate_three, address _wallet, ERC20 _tokenContract) public {
        require(_rate_one > 0);
        require(_rate_two > 0);
        require(_rate_three > 0);
        require(_wallet != address(0));
        require(_tokenContract != address(0));

        rate_one = _rate_one;
        rate_two = _rate_two;
        rate_three = _rate_three;
        wallet = _wallet;
        tokenContract = _tokenContract;
    }

  // -----------------------------------------
  // Crowdsale external interface
  // -----------------------------------------
  
    function setWhitelistContract(Whitelist _whitelistContract) external onlyOwner {
        whitelistContract = _whitelistContract;
        emit WhitelistAssigned(msg.sender, _whitelistContract);
    }
 
    /**
    * work. Calls the contract's finalization function.
    */
    function finalize() onlyOwner external {
        require(!isFinalized);
        
        isFinalized = true;
        emit Finalized();
        
    }
    
    /**
    * @dev fallback function ***DO NOT OVERRIDE***
    */
    function () external payable {
        buyTokens(msg.sender);
    }

    /**
    * @dev low level token purchase ***DO NOT OVERRIDE***
    * @param _beneficiary Address performing the token purchase
    * Main function that checks all conditions and then mints 
    * tokens and transfers the ETH to our wallet
    */
    function buyTokens(address _beneficiary) public payable {
        
        // get wei amount 
        uint256 weiAmount = msg.value;
        
        // checks if there are enough ether and beneficiary is whitelisted
        _preValidatePurchase(_beneficiary, weiAmount);

        // calculate token amount to be created
        uint256 tokens = _getTokenAmount(weiAmount);

        // update state
        weiRaised = weiRaised.add(weiAmount);
        
        // execute the transaction 
        _processPurchase(_beneficiary, tokens);
        
        emit TokenPurchase(
            msg.sender,
            _beneficiary,
            weiAmount,
            tokens
        );
        
        // transfer founds to our wallet
        _forwardFunds();
    }

    // -----------------------------------------
    // Internal interface (extensible)
    // -----------------------------------------

    /**
    * @dev Validation of an incoming purchase. Use require statements to revert state when conditions are not met. Use super to concatenate validations.
    * @param _beneficiary Address performing the token purchase
    * @param _weiAmount Value in wei involved in the purchase
    */
    function _preValidatePurchase(
        address _beneficiary,
        uint256 _weiAmount
    )
        internal view onlyWhileOpen
    {
        require(_beneficiary != address(0));
        require(_weiAmount != 0);
        require(whitelistContract.isWhitelisted(_beneficiary)); // call a function from white contract
    }

    /**
    * @dev Overrides delivery by minting tokens upon purchase.
    * @dev Token ownership should be transferred to Crowdsale for minting.
    * @param _beneficiary Token purchaser
    * @param _tokenAmount Number of tokens to be minted
    */
    function _deliverTokens(
        address _beneficiary,
        uint256 _tokenAmount
    )
        internal
    {
        require(MintableToken(tokenContract).mint(_beneficiary, _tokenAmount));
    }

    /**
    * @dev Executed when a purchase has been validated and is ready to be executed. Not necessarily emits/sends tokens.
    * @param _beneficiary Address receiving the tokens
    * @param _tokenAmount Number of tokens to be purchased
    */
    function _processPurchase(
        address _beneficiary,
        uint256 _tokenAmount
    )
        internal
    {
        _deliverTokens(_beneficiary, _tokenAmount);
    }

    /**
    * @dev Override to extend the way in which ether is converted to tokens.
    * @param _weiAmount Value in wei to be converted into tokens
    * @return Number of tokens that can be purchased with the specified _weiAmount
    */
    function _getTokenAmount(uint256 _weiAmount)
        internal view returns (uint256)
    {
        if (now < (openingTime + 10 minutes)) { 
            return _weiAmount.mul(rate_one); 
        } else if (now < (openingTime + 15 minutes)) { 
            return _weiAmount.mul(rate_two);
        } else {
            return _weiAmount.mul(rate_three);
        }
    }

    /**
    * @dev Determines how ETH is stored/forwarded on purchases.
    */
    function _forwardFunds() internal {
        wallet.transfer(msg.value);
    }
}