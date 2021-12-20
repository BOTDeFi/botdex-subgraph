import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";

export let ZERO_BI = BigInt.fromI32(0);
export let ONE_BI = BigInt.fromI32(1);
export let ZERO_BD = BigDecimal.fromString('0');
export let ONE_BD = BigDecimal.fromString('1');
export let BI_18 = BigInt.fromI32(18);

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000';
export const FACTORY_ADDRESS = "0x219864ac21afe9b03386b172cc58334d949cdc88";

export const WETH_ADDRESS = "0xae13d989dac2f0debff460ac112a837c89baa7cd";
export const USDT_ADDRESS = "0xa520feb43893cfa59845cdbbcbddf4f6f991fbb6";
export const USDC_ADDRESS = "0x0000000000000000000000000000000000000000";
export const DAI_ADDRESS = "0x0000000000000000000000000000000000000000";


export const USDC_WETH_PAIR = "0x0000000000000000000000000000000000000000";
export const DAI_WETH_PAIR = "0x0000000000000000000000000000000000000000";
export const USDT_WETH_PAIR = "0x92e999ccb3a368678422e5814abdd177700ccf93";

export const MASTER_ADDRESS = "0x151dd0bd76bfb594a1c43fa8ef37eaa0bd26b5ab";
export const VAULT_ADDRESS = "0xe7824ea63d9ecd72a66d5a3cd7457222ee5a6518";


export let WHITELIST: string[] = "0xae13d989dac2f0debff460ac112a837c89baa7cd,0xa520feb43893cfa59845cdbbcbddf4f6f991fbb6".split(",");

// minimum liquidity required to count towards tracked volume for pairs with small # of Lps
export let MINIMUM_USD_THRESHOLD_NEW_PAIRS = BigDecimal.fromString('1000'); 
// minimum liquidity for price to get tracked
export let MINIMUM_LIQUIDITY_THRESHOLD_NATIVE = BigDecimal.fromString('0');