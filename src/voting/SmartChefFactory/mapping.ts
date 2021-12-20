import { log } from "@graphprotocol/graph-ts"
import {
  NewSmartRefinerContract,
} from "../../../generated/SmartChefFactory/SmartChefFactory"

import { Pool } from "../../../generated/schema"

export function handleNewSmartRefinerContract(
  event: NewSmartRefinerContract
): void {

  log.info('New pool: {} at  {}', [
    event.transaction.hash.toHexString(),
    event.block.number.toString()])

  let newPool = new Pool(event.params.smartRefiner.toHexString())
  newPool.save()
}