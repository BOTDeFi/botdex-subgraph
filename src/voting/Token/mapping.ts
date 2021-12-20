import { BigInt, log } from "@graphprotocol/graph-ts";
import { Pool } from "../../../generated/schema";
import { Transfer } from "../../../generated/Token/Token";
import { ADDRESS_ZERO, MASTER_ADDRESS, VAULT_ADDRESS } from "../../const";
import { updateBalance } from "../utils";






export function handleTransfer(
    event: Transfer
): void {
    log.info('New transaction: {}', [
        event.transaction.hash.toHexString(),])
    let address_to = event.params.to.toHexString()
    let address_from = event.params.from.toHexString()
    let value = event.params.value
    let block_number = event.block.number
    let tx_hash = event.transaction.hash.toHexString()
    // if transfer from/to syrop pool pass because 
    // after this transfer balance of bep20 tokens and voting power dont change

    if (
        Pool.load(address_to) 
        || Pool.load(address_from) 
        || VAULT_ADDRESS.toLowerCase() == address_to.toLowerCase() 
        || VAULT_ADDRESS.toLowerCase() == address_from.toLowerCase()
    ){
        return;
    }
    // mint check
    else if (address_from == ADDRESS_ZERO){
        updateBalance(address_to, value, BigInt.zero(), block_number, tx_hash)
    }
    // transfer from Master Pool
    else if ( address_from == MASTER_ADDRESS ){
        updateBalance(address_to, value, value.neg(), block_number, tx_hash)
    }
    // transfer to Master Pool
    else if ( address_to == MASTER_ADDRESS) {
        updateBalance(address_from, value.neg(), value,  block_number, tx_hash)
    }
    // transfer between users
    else {
        updateBalance(address_to, value, BigInt.zero(), block_number, tx_hash + '#' + address_to)
        updateBalance(address_from, value.neg(), BigInt.zero(), block_number, tx_hash + '#' + address_from)
    }

}