# Bitminer Factory ICO contracts
This repository holds the smart contracts that constitute the on-chain part of Bitminer Factory ICO. The 'BMF' token, an ERC-20 token on Ethereum acts as a mining contract between token holders and Bitminer Factory.

1. **Crowdsale:** a limited time period contract that accepts purchase requests for 'BMF' tokens and handles those requests, according to the supply available.
2. **BitminerFactoryToken:** an ERC20 contract that mints 'BMF' tokens during the sale period and can destroy tokens in the later phase, during Bitminer Factory BuyBack operations.
3. **Whitelist:** basically a mapping of addresses to a whitelist flag. It stores the addresses of buyers that have previously registered themselves through the [Bitminer Factory Portal](https://bitminerfactoryico.io/it/) and are allowed to participate in the Crowdsale phase.
4. **BurnableToken:** a token that can be irreversibly burned (destroyed). Based on OpenZeppelin-Solidity with some changes in order to set a destroyer that could differ from owner.
5. **MintableToken:** the 'BMF' token inherits from MintableToken and BurnableToken with some changes in order to add a batches of beneficiaries. Minters could only be the crowdsale (to be settled) and the deployer of the contract(owner).


## Context
Bitminer Factory will be selling its 'BMF' tokens at three different prices and with a fixed cap in the form of an ERC20 token that acts as mining contract between token holders and Bitminer Factory. A set of coordinated Ethereum contracts manage the supply and purchase of these tokens over the sale period. Further details can be found in [Bitminer Factory Withepaper](https://bitminerfactoryico.io/doc/BM_Whitepaper_EN.pdf).

## Design Principles
1. We take a strategy of splitting the contracts as small logical units as possible and to re-use as much code as we can that has been written and tested by others.
2. We inject contract addresses after creation to keep the ability to update a single contract and have the remaining ones changed to talk to the new one.
3. All our contracts are based on the zeppelin-solidity library.  In some cases, where we needed to make modifications, we copy-pasted the zeppelin code and then made minor changes.
4. We use SafeMath for all mathematical functions.
5. All code is checked by truffle tests.
6. The contracts have roles that allow certain actions (i.e. minter) that are usually updatable by the owner.

## ICO Structure and Mechanics
Up to 100 million BMF with nominal value of 1$ per BMF are offered to
potential Token Holders through this ICO - Initial Contract Offering. 

BMF have been offered at 20% discount to nominal value from 25/5/18 to 20/6/18, and at 18% discount to nominal value from 20/6/18 to 20/7/18 in in a Private-Sale. 

The following discounts will apply afterwards during the ICO period: 

1. 12% from 20/7/18 to 8/8/18;
2. 6% from 8/8/18 to 20/9/18; 
3. 0% until Hard Cap is reached. 

As our Mining Farm is a scalable project, Soft-Cap is set at $0.5M and Hard Cap is set at $100m. If Soft-Cap is not met, all Mining Contracts will be cancelled and payments returned to Token Holders. 
If Hard Cap is met, the ICO - Initial Contract Offering - will be closed. ICO will be closed anyway on 30/9/18.

Further details can be found in section 4 of the [Bitminer Factory Withepaper](https://bitminerfactoryico.io/doc/BM_Whitepaper_EN.pdf).

## Install, testing and deploy:
This project uses the [Truffle Framework](http://truffleframework.com/).

- Install truffle

```npm install -g truffle```

- Choose an ethereum client ([Ganache](http://truffleframework.com/ganache/) recommended)

- Clone the repository

```git clone https://github.com/Bitminerfactory/ICO.git```

- Change parameters in contracts code:

=================================================================================
                     BEFORE DEPLOYING CROWDSALE CONTRACT

    Be sure to set right start and end time variables (UNIX timestamps):

    .openingTime = 1520416800;  // Wednesday, March 7, 2018 11:00:00 AM GMT+01:00
    .closingTime = 1520445600;  // Wednesday, March 7, 2018 7:00:00 PM GMT+01:00
    
=================================================================================

- install node_modules 

 ```npm install```

## Running the tests

- Start [Ganache](http://truffleframework.com/ganache/) and leave it running.

- Compile and deploy:

```truffle compile && truffle migrate```

- Run tests 

```truffle test```
