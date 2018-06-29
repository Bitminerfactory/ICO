const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const Token = artifacts.require('BitminerFactoryToken')
const Whitelist = artifacts.require('Whitelist')
const Crowdsale = artifacts.require('Crowdsale')

const RATE_ONE = 100 
const RATE_TWO = 200 
const RATE_THREE = 300 

const DECIMALS = 18
const CONTR = 1 // 1 Eth
const CAP = 1000000000000000000000 // 1000 BMF

// before run this test remember to set crowdsale opening and closing time!!

contract('CROWDSALE: expected crowdsale parameters', async (accounts) => {
    before(async () => {
        tok = await Token.new(CAP)
        crowd = await Crowdsale.new(RATE_ONE, RATE_TWO, RATE_THREE, accounts[4], tok.address)
    })

    it('owner', async () => {
        assert.equal(await crowd.owner(), accounts[0])
    })

    it('whitelist 0x0', async () => {
      assert.equal(await crowd.whitelistContract(), 0x0000000000000000000000000000000000000000)
    })

    it('token contract', async () => {
      assert.equal(await crowd.tokenContract(), tok.address)
    })

    it('first stage rate', async () => {
      assert.equal(await crowd.rate_one.call(), RATE_ONE)
    })

    it('second stage rate', async () => {
      assert.equal(await crowd.rate_two.call(), RATE_TWO)
    })

    it('third stage rate', async () => {
      assert.equal(await crowd.rate_three.call(), RATE_THREE)
    })

    it('token contract', async () => {
      assert.equal(await crowd.weiRaised(), 0)
    })

    it('should not be finalized', async () => {
      assert.isFalse(await crowd.isFinalized(), 'ERR: should not be finalized!')
    })

})

contract('CROWDSALE: setter, ownership and finalization', async (accounts) => {
  
  beforeEach(async () => {
    tok = await Token.new(CAP)
    white = await Whitelist.new()
    crowd = await Crowdsale.new(RATE_ONE,RATE_TWO,RATE_THREE, accounts[5], tok.address)
  })
  
  it('should be able to inject whitelist', async() => {
    await crowd.setWhitelistContract(white.address, {from: accounts[0]})
    assert.equal(await crowd.whitelistContract(), white.address)
  })
 
  it('should not be able to inject whitelist if not owner', async() => {
    await crowd.setWhitelistContract(white.address, {from: accounts[3]}).should.be.rejected;
  })
  
  it('should be able to transfer ownership', async() => {
    await crowd.transferOwnership(accounts[3], {from: accounts[0]})
    assert.equal(await crowd.owner(), accounts[3])
  })
  
  it('should not be able to transfer ownership if not owner', async() => {
    await crowd.transferOwnership(accounts[3], {from: accounts[3]}).should.be.rejected
  })

  it('only owner should finalize', async() => {
    await crowd.finalize({from: accounts[1]}).should.be.rejected
  })

  it('closes crowdsale after finalization', async() => {

    await crowd.finalize({from: accounts[0]})
    await crowd.sendTransaction({from: accounts[1]}).should.be.rejected
  })
})

contract('ICO setters and getters', async (accounts) => {

  beforeEach('setup functions for each test', async () => {
    white = await Whitelist.new()
    tok = await Token.new(CAP)
    crowd = await Crowdsale.new(RATE_ONE,RATE_TWO,RATE_THREE, accounts[5], tok.address)
    await tok.setCrowdsale(crowd.address)
    await crowd.setWhitelistContract(white.address)
  })

  it('should properly set injected contracts', async () => {
    assert.equal(await tok.crowdsale(), crowd.address,'ERR: whitelist not injected!')
    assert.equal(await crowd.whitelistContract(), white.address,'ERR: whitelist not injected!')
  })

  it('should mint only for whitelisted funders', async () => {
  await crowd.sendTransaction({ from: accounts[4], value: CONTR}).should.be.rejected;
  await crowd.sendTransaction({ from: accounts[0], value: CONTR}).should.be.rejected;
  await crowd.sendTransaction({ from: accounts[8], value: CONTR}).should.be.rejected;
  })

  it('should fulfill', async () => {
    await white.whitelist([ accounts[4], accounts[7]])

    await crowd.sendTransaction({ from: accounts[4], value: CONTR }).should.be.fulfilled;
    await crowd.sendTransaction({ from: accounts[7], value: CONTR }).should.be.fulfilled;   
  })
})
