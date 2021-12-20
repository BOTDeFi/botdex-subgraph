/* eslint-disable prefer-const */
import { log, BigInt, BigDecimal, Address, ethereum } from "@graphprotocol/graph-ts";
import { BEP20 } from "../../../generated/Factory/BEP20";
import { BEP20SymbolBytes } from "../../../generated/Factory/BEP20SymbolBytes";
import { BEP20NameBytes } from "../../../generated/Factory/BEP20NameBytes";
import { Factory as FactoryContract } from "../../../generated/templates/Pair/Factory";
import { Bundle, LiquidityPosition, LiquidityPositionSnapshot, Pair, Token, Transaction, User } from "../../../generated/schema";
import { Burn, Mint } from "../../../generated/templates/Pair/Pair";
import { FACTORY_ADDRESS, ONE_BI, ZERO_BD, ZERO_BI } from "../../const";


export let factoryContract = FactoryContract.bind(Address.fromString(FACTORY_ADDRESS));

export function exponentToBigDecimal(decimals: BigInt): BigDecimal {
  let bd = BigDecimal.fromString("1");
  for (let i = ZERO_BI; i.lt(decimals as BigInt); i = i.plus(ONE_BI)) {
    bd = bd.times(BigDecimal.fromString("10"));
  }
  return bd;
}

export function convertTokenToDecimal(tokenAmount: BigInt, exchangeDecimals: BigInt): BigDecimal {
  if (exchangeDecimals == ZERO_BI) {
    return tokenAmount.toBigDecimal();
  }
  return tokenAmount.toBigDecimal().div(exponentToBigDecimal(exchangeDecimals));
}

export function isNullBnbValue(value: string): boolean {
  return value == "0x0000000000000000000000000000000000000000000000000000000000000001";
}

export function fetchTokenSymbol(tokenAddress: Address): string {
  let contract = BEP20.bind(tokenAddress);
  let contractSymbolBytes = BEP20SymbolBytes.bind(tokenAddress);

  let symbolValue = "unknown";
  let symbolResult = contract.try_symbol();
  if (symbolResult.reverted) {
    let symbolResultBytes = contractSymbolBytes.try_symbol();
    if (!symbolResultBytes.reverted) {
      if (!isNullBnbValue(symbolResultBytes.value.toHex())) {
        symbolValue = symbolResultBytes.value.toString();
      }
    }
  } else {
    symbolValue = symbolResult.value;
  }
  return symbolValue;
}

export function fetchTokenName(tokenAddress: Address): string {
  let contract = BEP20.bind(tokenAddress);
  let contractNameBytes = BEP20NameBytes.bind(tokenAddress);

  let nameValue = "unknown";
  let nameResult = contract.try_name();
  if (nameResult.reverted) {
    let nameResultBytes = contractNameBytes.try_name();
    if (!nameResultBytes.reverted) {
      if (!isNullBnbValue(nameResultBytes.value.toHex())) {
        nameValue = nameResultBytes.value.toString();
      }
    }
  } else {
    nameValue = nameResult.value;
  }
  return nameValue;
}

export function fetchTokenDecimals(tokenAddress: Address): BigInt {
  let contract = BEP20.bind(tokenAddress);
  let decimalValue = ZERO_BI
  let decimalResult = contract.try_decimals();
  if (!decimalResult.reverted) {
    decimalValue = BigInt.fromI32(decimalResult.value);
  }
  return decimalValue;
}

export function fetchTokenTotalSupply(tokenAddress: Address): BigInt {
  let contract = BEP20.bind(tokenAddress)
  let totalSupplyValue = ZERO_BI
  let totalSupplyResult = contract.try_totalSupply()
  if (!totalSupplyResult.reverted) {
    totalSupplyValue = totalSupplyResult.value
  }
  return totalSupplyValue
}

export function createLiquidityPosition(exchange: Address, user: Address): LiquidityPosition {
  let id = exchange
    .toHexString()
    .concat('-')
    .concat(user.toHexString())
  let liquidityTokenBalance = LiquidityPosition.load(id)
  if (liquidityTokenBalance === null) {
    let pair = Pair.load(exchange.toHexString())!
    pair.liquidityProviderCount = pair.liquidityProviderCount.plus(ONE_BI)
    liquidityTokenBalance = new LiquidityPosition(id)
    liquidityTokenBalance.liquidityTokenBalance = ZERO_BD
    liquidityTokenBalance.pair = exchange.toHexString()
    liquidityTokenBalance.user = user.toHexString()
    liquidityTokenBalance.save()
    pair.save()
  }
  if (liquidityTokenBalance === null) log.error('LiquidityTokenBalance is null', [id])
  return liquidityTokenBalance as LiquidityPosition
}

export function createUser(address: Address): void {
  let user = User.load(address.toHexString())
  if (user === null) {
    user = new User(address.toHexString())
    user.usdSwapped = ZERO_BD
    user.save()
  }
}

export function createLiquiditySnapshot(position: LiquidityPosition, event: ethereum.Event, mintOrBurn: boolean = false): void {
  let timestamp = event.block.timestamp.toI32()
  let bundle = Bundle.load('1')!
  let pair = Pair.load(position.pair)!
  let token0 = Token.load(pair.token0)!
  let token1 = Token.load(pair.token1)!

  // create new snapshot
  let snapshot = new LiquidityPositionSnapshot(position.id.concat(timestamp.toString()))
  snapshot.liquidityPosition = position.id
  snapshot.timestamp = timestamp
  snapshot.block = event.block.number.toI32()
  snapshot.user = position.user
  snapshot.pair = position.pair
  snapshot.token0PriceUSD = token0.derivedBNB.times(bundle.bnbPrice)
  snapshot.token1PriceUSD = token1.derivedBNB.times(bundle.bnbPrice)
  snapshot.reserve0 = pair.reserve0
  snapshot.reserve1 = pair.reserve1
  snapshot.reserveUSD = pair.reserveUSD
  snapshot.liquidityTokenTotalSupply = pair.totalSupply
  snapshot.liquidityTokenBalance = position.liquidityTokenBalance
  snapshot.liquidityPosition = position.id
  snapshot.mintOrBurn = mintOrBurn
  snapshot.transaction = mintOrBurn ? event.transaction.hash.toHex() : null

  snapshot.save()
  position.save()
}