const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const Token = artifacts.require('Token')
const Crowdsale = artifacts.require('Crowdsale')

const DECIMALS = 18
const CAP = 1000000000000000000000 // 1000 BMF

  contract('TOKEN: expected token parameters', async (accounts) => {
    before(async () => {
        token = await Token.new(CAP)
    })

    it('symbol', async () => {
      assert.equal(await token.symbol(),'BMF')
    })

    it('name', async () => {
      assert.equal(await token.name(),'Bitminer Factory Token')
    })

    it('decimals', async () => {
      assert.equal(await token.decimals(), DECIMALS)
    })
    
    it('total_supply', async () => {
      assert.equal(await token.totalSupply(), 0)
    })

    it('minting opened', async () => {
      assert.isFalse(await token.mintingFinished(), 'ERR: should be able to mint!')
    })

    it('owner', async () => {
      assert.equal(await token.owner(), accounts[0], 'ERR: should be owner!')
    })

    it('destroyer 0x0', async () => {
      assert.equal(await token.destroyer(),  0x0000000000000000000000000000000000000000, 'ERR: destroyer should be 0x0!')
    })

    it('crowdsale 0x0', async () => {
      assert.equal(await token.crowdsale(),  0x0000000000000000000000000000000000000000, 'ERR: crowdsale(minter) should be 0x0!')
    })
  })


 contract('TOKEN: expected calls and basic ERC20 functions', async (accounts) => {
      
    before( async () => {
      tok = await Token.new(CAP)
      await tok.multipleTransfer([ accounts[1], accounts[2] ], [ 200 * (10 ** DECIMALS), 400 * (10 ** DECIMALS) ])
     
    })

    it('allowances of all accounts are zero', async () => {
      const first = await tok.allowance.call(accounts[0], accounts[1])
      const second = await tok.allowance.call(accounts[0], accounts[2])
   
      assert.equal(first.toNumber(), 0,'ERR: allowance should be 0!')
      assert.equal(second.toNumber(), 0,'ERR: allowance should be 0!')

    })

      it('should verify accounts balances', async () => {
        const first = await tok.balanceOf.call(accounts[1])
        const second = await tok.balanceOf.call(accounts[2])
        
        assert.equal(first, 200 * (10 ** DECIMALS),'ERR: balance should be 200!')
        assert.equal(second, 400 * (10 ** DECIMALS),'ERR: balance should be 400!')
      })

      it('total_supply should be updated', async () => {
        assert.equal(await tok.totalSupply(), 600 * (10 ** DECIMALS))
      })
     
      it('should be able to transfer', async() => {
        await tok.transfer(accounts[3], 150 * (10 ** DECIMALS), {from: accounts[1]})
        const first = await tok.balanceOf.call(accounts[1])
        
        assert.equal(first.toNumber(), 50 * (10 ** DECIMALS))
      })
    
      it('should not be able to transfer more than balance', async() => {
        await tok.transfer(accounts[3], 201 * (10 ** DECIMALS), {from: accounts[1]}).should.be.rejected;
      })
  })

  contract('TOKEN: Address injected functions', async (accounts) => {

    before(async () => {
      tok = await Token.new(CAP)
      crowd = await Crowdsale.new(400, 800, 1200, accounts[5], tok.address) // crowdsale changes automatically to wei
    })
   
    it('should be able to inject crowdsale', async() => {
      await tok.setCrowdsale(crowd.address, {from: accounts[0]})
      assert.equal(await token.crowdsale(), crowd.address,'ERR: should set the crowdsale!')
    })
   
    it('should not be able to inject crowdsale if not owner', async() => {
      await tok.setCrowdsale(crowd.address, {from: accounts[3]}).should.be.rejected;
    })

    it('should be able to transfer ownership', async() => {
      await tok.transferOwnership(accounts[7], {from: accounts[0]})
      assert.equal(await tok.owner(), accounts[7])
    })
    
    it('should not be able to transfer ownership if not owner', async() => {
      await tok.transferOwnership(accounts[7], {from: accounts[3]}).should.be.rejected
    })

    it('should be able to inject destroyer', async() => {
      await tok.setDestroyer(accounts[5], {from: accounts[7]})
      assert.equal(await token.destroyer(), accounts[5],'ERR: should set the destroyer!')
    })
   
    it('should not be able to inject destroyer if not owner', async() => {
      await tok.setDestroyer(accounts[5], {from: accounts[0]}).should.be.rejected;
    }) 
   
    it('should be able to renounce ownership', async() => {
      await tok.renounceOwnership({from: accounts[7]})
      assert.equal(await token.owner(), 0x0000000000000000000000000000000000000000)
    }) 
  })

  
  contract('TOKEN: Mint functions', async (accounts) => {

    beforeEach(async () => {
      tok = await Token.new(CAP)
    })

    it('should fulfill multiple (batch x8) mint transfer', async () => {
      await tok.multipleTransfer(
        [
          accounts[1],
          accounts[2],
          accounts[3],
          accounts[4],
          accounts[6],
          accounts[7],
          accounts[8],
          accounts[9]
        ],[
          1000 * (10 ** DECIMALS),
          2000 * (10 ** DECIMALS),
          3000 * (10 ** DECIMALS),
          4000 * (10 ** DECIMALS),
          6000 * (10 ** DECIMALS),
          7000 * (10 ** DECIMALS),
          8000 * (10 ** DECIMALS),
          9000 * (10 ** DECIMALS)
        ]
      )
      await tok.totalSupply().then(function(response) {
        web3.fromWei(response.toNumber(), "ether").should.be.equal('40000')
      })
      // random check
      assert.equal(await tok.balanceOf.call(accounts[1]),1000 * (10 ** DECIMALS))
      assert.equal(await tok.balanceOf.call(accounts[4]),4000 * (10 ** DECIMALS))
      assert.equal(await tok.balanceOf.call(accounts[9]),9000 * (10 ** DECIMALS))
    })
   
    it('should fulfill simple mint transfer', async() => { 
      await tok.mint(accounts[8], 8000 * (10 ** DECIMALS), {from: accounts[0]} )
      const balance = await tok.balanceOf(accounts[8])
      balance.should.be.bignumber.equal(8000 * (10 ** DECIMALS))
    })
  }) 

   contract('TOKEN: Burn tokens and close minting', async (accounts) => {
    
    beforeEach(async () => {
      tok = await Token.new(CAP)
      await tok.mint(accounts[2], 8000 * (10 ** DECIMALS), {from: accounts[0]} )
    })
    it('should not be able to close minting', async() => {
      await tok.finishMinting({from: accounts[3]}).should.be.rejected
    })

    it('should be able to close minting', async() => {
      await tok.finishMinting({from: accounts[0]})
      const finished = await tok.mintingFinished()
      finished.should.be.true
    }) 

    it('should be able to burn tokens', async() => {
      await tok.burnFrom(accounts[2], 4000 * (10 ** DECIMALS),{from: accounts[0]})
      const balance = await tok.balanceOf(accounts[2])
      balance.should.be.bignumber.equal(4000 * (10 ** DECIMALS))
    })
  })