import { BalanceHistory, User } from "../../generated/schema";
import { BigInt, log, Value } from "@graphprotocol/graph-ts";

export function createBalanceHistory(
    user: User, 
    block_number: BigInt, 
    tx_hash: string
): void{
    log.info('function {}', ['createBalanceHistory'])
    let balanceHistory = new BalanceHistory(tx_hash);

    balanceHistory.Bep20Balance = user.Bep20Balance;
    balanceHistory.MasterBalance = user.MasterBalance;
    balanceHistory.TotalBalance = user.TotalBalance;
    balanceHistory.BlockNumber = block_number;
    balanceHistory.set("User", Value.fromString(user.id))
    balanceHistory.save();
    log.info('balanceHistory saved: {}, {}', [
        user.id,
        balanceHistory.TotalBalance.toString(),
      ])
}


export function updateBalance(
    user_address: string, 
    bep20Value: BigInt,
    masterValue: BigInt, 
    block_number: BigInt,
    tx_hash: string, 
): void {
    log.info('function {}', ['updateBalance'])
    let user = User.load(user_address)

    if ( user == null ) {
        user = new User(user_address)
    }
    
    user.Bep20Balance = user.Bep20Balance + bep20Value;

    // MasterBalance might be less than 0, because we cant get exact 
    // quantity of user's rewards on Master Pool
    if (user.MasterBalance + masterValue < BigInt.zero()){
        user.MasterBalance = BigInt.zero()
    }
    else {
        user.MasterBalance = user.MasterBalance + masterValue;
    }
    
    user.TotalBalance = user.TotalBalance + (bep20Value + masterValue);

    user.save()
    createBalanceHistory(user, block_number, tx_hash);
}