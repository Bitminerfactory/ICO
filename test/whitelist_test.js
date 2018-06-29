const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const Whitelist = artifacts.require('Whitelist')

contract('WHITELIST: expected whitelist parameters', async (accounts) => {
    before(async () => {
        white = await Whitelist.new()
    })

    it('owner', async () => {
        assert.equal(await white.owner(), accounts[0])
    })
    it('whitelister must be the owner on creation', async () => {
        assert.equal(await white.whitelister(),  accounts[0])
    })
})

contract('WHITELIST: setters and ownership', async (accounts) => {
    beforeEach(async () => {
        white = await Whitelist.new()
    })
    it('should be able to transfer ownership', async() => {
        await white.transferOwnership(accounts[3], {from: accounts[0]})
        assert.equal(await white.owner(), accounts[3])
      })
      
    it('should not be able to transfer ownership if not owner', async() => {
        await white.transferOwnership(accounts[3], {from: accounts[3]}).should.be.rejected
    })

    it('should be able to set a new whitelister', async() => {
        await white.setNewWhitelister(accounts[6], {from: accounts[0]})
        assert.equal(await white.whitelister(), accounts[6],'ERR: should set the crowdsale!')
      })
     
    it('should not be able to  set a new whitelister if not owner', async() => {
        await white.setNewWhitelister(accounts[6], {from: accounts[3]}).should.be.rejected;
    })
})


contract('WHITELIST: whitelist/unwhitelist', async (accounts) => {
    beforeEach(async () => {
        white = await Whitelist.new()
    })
    it('should whitelist in batch (x 8)',async () => {
        await white.whitelist(
            [
              accounts[1],
              accounts[2],
              accounts[3],
              accounts[4],
              accounts[6],
              accounts[7],
              accounts[8],
              accounts[9]
            ])
        // random check
        assert.isTrue(await white.isWhitelisted.call(accounts[3]))
        assert.isTrue(await white.isWhitelisted.call(accounts[9]))
        assert.isTrue(await white.isWhitelisted.call(accounts[6]))
    })
    it('should unwhitelist in batch (x 5)', async() => {
            await white.unwhitelist(
                [
                  accounts[1],
                  accounts[2],
                  accounts[3],
                  accounts[4],
                  accounts[6],
                ])
            // random check
            assert.isFalse(await white.isWhitelisted.call(accounts[1]))
            assert.isFalse(await white.isWhitelisted.call(accounts[4]))
            assert.isFalse(await white.isWhitelisted.call(accounts[6]))
    })

})

