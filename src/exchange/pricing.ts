/* eslint-disable prefer-const */
import { BigDecimal, Address } from "@graphprotocol/graph-ts/index";
import { log } from "@graphprotocol/graph-ts";
import { Pair, Token, Bundle } from "../../generated/schema";
import { factoryContract } from "./utils";
import { ADDRESS_ZERO, MINIMUM_LIQUIDITY_THRESHOLD_NATIVE, ONE_BD, WHITELIST, ZERO_BD, WETH_ADDRESS, USDC_WETH_PAIR, USDT_WETH_PAIR, USDT_ADDRESS, USDC_ADDRESS } from "../const";

// const WETH_ADDRESS = "0xd0a1e359811322d97991e03f863a0c30c2cf029c";  // TODO change to actual WBNB address at prod
// const USDC_WETH_PAIR = "0x94afbb71b09b493211bd05235f865fd3d8c038ed"; // created block 
// const USDT_WETH_PAIR = "0xf01b05bf78fb351e2b001f0ef9902a31e79039ad"; // created block 

export function getBnbPriceInUSD(): BigDecimal {
  // fetch bnb prices for each stablecoin; DEPENDS ON THE PAIR ORDER
  // let usdtPair = Pair.load(USDT_WETH_PAIR); // usdt is token0
  // let busdPair = Pair.load(USDC_WETH_PAIR); // busd is token0

  // if (busdPair !== null && usdtPair !== null) {
  //   let totalLiquidityBNB = busdPair.reserve1.plus(usdtPair.reserve1);
  //   if (totalLiquidityBNB.notEqual(ZERO_BD)) {
  //     let busdWeight = busdPair.reserve1.div(totalLiquidityBNB);
  //     let usdtWeight = usdtPair.reserve1.div(totalLiquidityBNB);
  //     return busdPair.token0Price.times(busdWeight).plus(usdtPair.token0Price.times(usdtWeight));
  //   } else {
  //     return ZERO_BD;
  //   }
  // } else if (busdPair !== null) {
  //   return busdPair.token0Price;
  // } else if (usdtPair !== null) {
  //   return usdtPair.token0Price;
  // } else {
  //   return ZERO_BD;
  // }

  let usdcPair = Pair.load(USDC_WETH_PAIR);
  let usdtPair = Pair.load(USDT_WETH_PAIR);

  if (usdtPair !== null) {
    if (USDT_ADDRESS == Token.load(usdtPair.token0)!.id){
      return usdtPair.token0Price
    }
    else {
      return usdtPair.token1Price
    }
  } else if (usdcPair !== null) {
    if (USDC_ADDRESS == Token.load(usdcPair.token0)!.id){
      return usdcPair.token0Price
    }
    else {
      return usdcPair.token1Price
    }
  } else {
    return ZERO_BD
  }
}


/**
 * Search through graph to find derived BNB per token.
 * @todo update to be derived BNB (add stablecoin estimates)
 **/
export function findBnbPerToken(token: Token): BigDecimal {
  log.warning("Token name {}, address {}", [token.name, token.id])
  if (token.id == WETH_ADDRESS) {
    log.warning("WETH derivedBNB = 1; {}", [token.id])
    return ONE_BD;
  }
  // loop through whitelist and check if paired with any
  for (let i = 0; i < WHITELIST.length; ++i) {
    let pairAddress = factoryContract.getPair(Address.fromString(token.id), Address.fromString(WHITELIST[i]));
    if (pairAddress.toHex() != ADDRESS_ZERO) {
      log.warning("Pair address {}", [pairAddress.toHex()])
      let pair = Pair.load(pairAddress.toHex())!;
      if (pair.token0 == token.id && pair.reserveBNB.gt(MINIMUM_LIQUIDITY_THRESHOLD_NATIVE)) {
        let token1 = Token.load(pair.token1)!;
        return pair.token1Price.times(token1.derivedBNB as BigDecimal); // return token1 per our token * BNB per token 1
      }
      if (pair.token1 == token.id && pair.reserveBNB.gt(MINIMUM_LIQUIDITY_THRESHOLD_NATIVE)) {
        let token0 = Token.load(pair.token0)!;
        return pair.token0Price.times(token0.derivedBNB as BigDecimal); // return token0 per our token * BNB per token 0
      }
    }
  }
  return ZERO_BD; // nothing was found return 0
}

/**
 * Accepts tokens and amounts, return tracked amount based on token whitelist
 * If one token on whitelist, return amount in that token converted to USD.
 * If both are, return average of two amounts
 * If neither is, return 0
 */
export function getTrackedVolumeUSD(
  bundle: Bundle,
  tokenAmount0: BigDecimal,
  token0: Token,
  tokenAmount1: BigDecimal,
  token1: Token
): BigDecimal {
  let price0 = (token0.derivedBNB as BigDecimal).times(bundle.bnbPrice);
  let price1 = (token1.derivedBNB as BigDecimal).times(bundle.bnbPrice);

  // TODO
  // if less than 5 LPs, require high minimum reserve amount or return 0
  // if (pair.liquidityProviderCount.lt(BigInt.fromI32(5))) {
  //   let reserve0USD = pair.reserve0.times(price0)
  //   let reserve1USD = pair.reserve1.times(price1)
  //   if (WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
  //     if (reserve0USD.plus(reserve1USD).lt(MINIMUM_USD_THRESHOLD_NEW_PAIRS)) {
  //       return ZERO_BD
  //     }
  //   }
  //   if (WHITELIST.includes(token0.id) && !WHITELIST.includes(token1.id)) {
  //     if (reserve0USD.times(BigDecimal.fromString('2')).lt(MINIMUM_USD_THRESHOLD_NEW_PAIRS)) {
  //       return ZERO_BD
  //     }
  //   }
  //   if (!WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
  //     if (reserve1USD.times(BigDecimal.fromString('2')).lt(MINIMUM_USD_THRESHOLD_NEW_PAIRS)) {
  //       return ZERO_BD
  //     }
  //   }
  // }

  // both are whitelist tokens, take average of both amounts
  if (WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount0.times(price0).plus(tokenAmount1.times(price1)).div(BigDecimal.fromString("2"));
  }

  // take full value of the whitelisted token amount
  if (WHITELIST.includes(token0.id) && !WHITELIST.includes(token1.id)) {
    return tokenAmount0.times(price0);
  }

  // take full value of the whitelisted token amount
  if (!WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount1.times(price1);
  }

  // neither token is on white list, tracked volume is 0
  return ZERO_BD;
}

/**
 * Accepts tokens and amounts, return tracked amount based on token whitelist
 * If one token on whitelist, return amount in that token converted to USD * 2.
 * If both are, return sum of two amounts
 * If neither is, return 0
 */
export function getTrackedLiquidityUSD(
  bundle: Bundle,
  tokenAmount0: BigDecimal,
  token0: Token,
  tokenAmount1: BigDecimal,
  token1: Token
): BigDecimal {
  let price0 = token0.derivedBNB.times(bundle.bnbPrice);
  let price1 = token1.derivedBNB.times(bundle.bnbPrice);

  // both are whitelist tokens, take average of both amounts
  if (WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount0.times(price0).plus(tokenAmount1.times(price1));
  }

  // take double value of the whitelisted token amount
  if (WHITELIST.includes(token0.id) && !WHITELIST.includes(token1.id)) {
    return tokenAmount0.times(price0).times(BigDecimal.fromString("2"));
  }

  // take double value of the whitelisted token amount
  if (!WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount1.times(price1).times(BigDecimal.fromString("2"));
  }

  // neither token is on white list, tracked volume is 0
  return ZERO_BD;
}
