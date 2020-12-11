
import {JobAdded, JobRemoved, KeeperBonded, RemoveJob, Transfer} from '../generated/Keep3rV1/Keep3rV1'
import {Keeper, Job, User } from '../generated/schema'
import {Address, BigDecimal, BigInt, log} from "@graphprotocol/graph-ts";





export function handleTransfer(event: Transfer): void {
  let day = (event.block.timestamp / BigInt.fromI32(60 * 60 * 24))

  let userFrom = User.load(event.params.from.toHex())
  if (userFrom == null) {
    userFrom = newUser(event.params.from.toHex(), event.params.from.toHex());
  }
  userFrom.balance = userFrom.balance - event.params.amount
  userFrom.transactionCount = userFrom.transactionCount + 1
  userFrom.save()

  let userTo = User.load(event.params.to.toHex())
  if (userTo == null) {
    userTo = newUser(event.params.to.toHex(), event.params.to.toHex());

    // UserCounter
    let userCounter = UserCounter.load('singleton')
    if (userCounter == null) {
      userCounter = new UserCounter('singleton')
      userCounter.count = 1
    } else {
      userCounter.count = userCounter.count + 1
    }
    userCounter.save()
    userCounter.id = day.toString()
    userCounter.save()
  }
  userTo.balance = userTo.balance + event.params.amount
  userTo.transactionCount = userTo.transactionCount + 1
  userTo.save()

  // Transfer counter total and historical
  let transferCounter = TransferCounter.load('singleton')
  if (transferCounter == null) {
    transferCounter = new TransferCounter('singleton')
    transferCounter.count = 0
    transferCounter.totalTransferred = BigInt.fromI32(0)
  }
  transferCounter.count = transferCounter.count + 1
  transferCounter.totalTransferred = transferCounter.totalTransferred + event.params.amount
  transferCounter.save()
  transferCounter.id = day.toString()
  transferCounter.save()
}

function newUser(id: string, address: string): User {
  let user = new User(id);
  user.address = address
  user.balance = BigInt.fromI32(0)
  user.transactionCount = 0
  return user
}
