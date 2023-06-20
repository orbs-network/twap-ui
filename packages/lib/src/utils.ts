import { Contract } from "@defi.org/web3-candies";
import Web3 from "web3";
interface BlockInfo {
  time: number;
  number: number;
}

export async function getCurrentBlockInfo(web3: Web3): Promise<BlockInfo> {
  const block = await web3.eth.getBlock("latest");
  return { time: Number(block.timestamp) - 13, number: block.number - 1 }; // one block back to avoid provider jitter
}
const maxPace = 4000000;

export async function readEvents(contract: Contract, event: string, web3: Web3, startBlock: number, endBlock: number, pace: number, filter: any) {
  try {
    const options = { filter, fromBlock: startBlock, toBlock: endBlock };
    return await contract.getPastEvents(event, options);
  } catch (e) {
    pace = Math.round(pace * 0.9);
    if (pace <= 100) {
      throw new Error(`looking for events slowed down below ${pace} - fail`);
    }
    if (typeof endBlock === "string") {
      const block = await getCurrentBlockInfo(web3);
      endBlock = block.number;
    }
    console.log("\x1b[36m%s\x1b[0m", `read events slowing down to ${pace}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: any = [];
    for (let i = startBlock; i < endBlock; i += pace) {
      const currentEnd = i + pace > endBlock ? endBlock : i + pace;
      results.push(...(await readEvents(contract, event, web3, i, currentEnd, pace, filter)));
      pace = maxPace;
    }
    console.log("\x1b[36m%s\x1b[0m", `read events slowing down ended`);
    return results;
  }
}
