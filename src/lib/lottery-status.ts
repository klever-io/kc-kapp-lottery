import { PROVIDER_URL, SC_ADDRESS } from "../../env";
import { ScInfo, ScStatus } from "../types/sc";
import { stringToHex } from "./hex";

export async function verifyScStatus(): Promise<ScStatus> {
  try {
    const statusParsed: { [statusDigit: string]: ScStatus } = {
      "0": "ENDED",
      "1": "ACTIVE",
      "2": "PENDING",
    };

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

    if (!res.ok) {
      return "ERROR";
    }

    const data = (await res.json()) as unknown as ScInfo;

    return statusParsed[data.data.data];
  } catch (error) {
    console.error("Error verifying SC status", error);
    return "ERROR";
  }
}
