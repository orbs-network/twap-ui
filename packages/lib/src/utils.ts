import { Contract } from "@defi.org/web3-candies";
import _ from "lodash";
import Web3 from "web3";
import { EventData } from "./types";
import retry from 'async-retry'

export const getClosestBlock = async (timestamp: number, provider: string) => {
  const web3 = new Web3(provider);
  // Get the latest block number
  let latestBlockNumber = await web3.eth.getBlockNumber();

  // Set the earliest and latest block numbers for the search range
  let earliestBlockNumber = 0;

  // Binary search to find the closest block
  while (earliestBlockNumber < latestBlockNumber) {
    const midBlockNumber = Math.floor((earliestBlockNumber + latestBlockNumber) / 2);
    const midBlock = await web3.eth.getBlock(midBlockNumber);
    const midTimestamp = midBlock.timestamp;

    if (midTimestamp < timestamp) {
      earliestBlockNumber = midBlockNumber + 1;
    } else {
      latestBlockNumber = midBlockNumber;
    }
  }

  return latestBlockNumber;
};

const chunkSize = 50000;



const getEnentsWithRetry = () => {

  // eslint-disable-next-line no-constant-condition
  while (true) {

  }

}

export const getPastEvents = async (contract: Contract, eventName: string, fromBlock: number, toBlock: number, filter: any): Promise<EventData[]> => {
  const promises: any = [];
  let _fromBlock = fromBlock;

  console.log({ fromBlock, toBlock });

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const delta = Math.min(chunkSize, toBlock - _fromBlock);

    console.log({ delta, blocksLeft: toBlock - _fromBlock, blocks: `${_fromBlock} - ${_fromBlock + delta}` });

    if (delta === 0) {
      break;
    }
    promises.push(
      contract.getPastEvents(eventName, {
        fromBlock: _fromBlock,
        toBlock: _fromBlock + delta,
        filter,
      })
    );

    _fromBlock += delta;
  }
  const result = await Promise.all(promises);

  return _.uniqBy(_.flatten(result), "id");
};

export async function getPastEventsLoop(contract: any, eventName: any, nBlocks: any, endBlock: any, filterObj: any) {
  if (nBlocks === 0) {
    return [];
  }

  let events: any = [];
  let _chunkSize = chunkSize;
  let _toBlock = endBlock;
  let _fromBlock = Math.max(endBlock - nBlocks + 1, endBlock - chunkSize + 1);
  const exitBlock = endBlock - nBlocks + 1;
  let retry = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      console.log(`fromBlock=${_fromBlock}, toBlock=${_toBlock}`);
      events = events.concat(await contract.getPastEvents(eventName, { filter: filterObj, fromBlock: _fromBlock, toBlock: _toBlock }));

      console.log(events);
    } catch (e) {}

    retry = 0;
    _toBlock = _fromBlock - 1;
    _fromBlock = Math.max(exitBlock, _fromBlock - _chunkSize);
    _chunkSize = chunkSize;

    if (_fromBlock <= exitBlock) {
      return events;
    }
  }
}
