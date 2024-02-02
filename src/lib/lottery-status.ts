import { PROVIDER_URL, SC_ADDRESS } from '../../env';
import { scStatus } from '../types/sc';
import { stringToHex } from './hex';

export async function verifyScStatus(): Promise<scStatus> {
  const lotteryNameHex = stringToHex("Test1");

  const body = JSON.stringify({
    scAddress: SC_ADDRESS,
    funcName: "status",
    args: [lotteryNameHex],
  });

  const res = await fetch("https://node" + PROVIDER_URL + "/vm/int", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  const data = await res.json() as unknown as scStatus;

  return data
}
