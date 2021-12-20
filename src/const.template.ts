import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";

export let ZERO_BI = BigInt.fromI32(0);
export let ONE_BI = BigInt.fromI32(1);
export let ZERO_BD = BigDecimal.fromString('0');
export let ONE_BD = BigDecimal.fromString('1');
export let BI_18 = BigInt.fromI32(18);

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000';
export const FACTORY_ADDRESS = "{{ factory_address }}{{^factory_address}}0x0000000000000000000000000000000000000000{{/factory_address}}";

export const WETH_ADDRESS = "{{ weth_address }}{{^weth_address}}0x0000000000000000000000000000000000000000{{/weth_address}}";
export const USDT_ADDRESS = "{{ usdt_address }}{{^usdt_address}}0x0000000000000000000000000000000000000000{{/usdt_address}}";
export const USDC_ADDRESS = "{{ usdc_address }}{{^usdc_address}}0x0000000000000000000000000000000000000000{{/usdc_address}}";
export const DAI_ADDRESS = "{{ dai_address }}{{^dai_address}}0x0000000000000000000000000000000000000000{{/dai_address}}";


export const USDC_WETH_PAIR = "{{ usdc_weth_pair }}{{^usdc_weth_pair}}0x0000000000000000000000000000000000000000{{/usdc_weth_pair}}";
export const DAI_WETH_PAIR = "{{ dai_weth_pair }}{{^dai_weth_pair}}0x0000000000000000000000000000000000000000{{/dai_weth_pair}}";
export const USDT_WETH_PAIR = "{{ usdt_weth_pair }}{{^usdt_weth_pair}}0x0000000000000000000000000000000000000000{{/usdt_weth_pair}}";

export const MASTER_ADDRESS = "{{ master_address }}{{^master_address}}0x0000000000000000000000000000000000000000{{/master_address}}";
export const VAULT_ADDRESS = "{{ vault_address }}{{^vault_address}}0x0000000000000000000000000000000000000000{{/vault_address}}";


export let WHITELIST: string[] = "{{ whitelist }}".split(",");

// minimum liquidity required to count towards tracked volume for pairs with small # of Lps
export let MINIMUM_USD_THRESHOLD_NEW_PAIRS = BigDecimal.fromString('{{ minimum_usd_threshold_new_pairs }}{{^minimum_usd_threshold_new_pairs}}3000{{/minimum_usd_threshold_new_pairs}}'); 
// minimum liquidity for price to get tracked
export let MINIMUM_LIQUIDITY_THRESHOLD_NATIVE = BigDecimal.fromString('{{ MINIMUM_LIQUIDITY_THRESHOLD_NATIVE }}');