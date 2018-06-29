var Token = artifacts.require('BitminerFactoryToken');
var Crowdsale = artifacts.require('Crowdsale');
var Whitelist = artifacts.require('Whitelist');

var safeMath = artifacts.require('../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol');


module.exports = function (deployer, network, accounts) {
  
  const rate_one = 2
  const rate_two = 3
  const rate_three = 2
  const cap = 100000000000000000000 // 100 BMF
  deployer.deploy(safeMath);
  deployer.link(safeMath, [Token, Crowdsale]);
  deployer.deploy(Whitelist)
    .then(() => {
      return deployer.deploy(Token, cap);
    })
    .then(() => {
      return deployer.deploy(Crowdsale, rate_one, rate_two, rate_three, accounts[5], Token.address);
    })
    .then(async () => {
      var t = await Token.deployed();
      await t.setCrowdsale(Crowdsale.address)
    })
    .then(async () => {
      var c = await Crowdsale.deployed();
      await c.setWhitelistContract(Whitelist.address)
    })

}
