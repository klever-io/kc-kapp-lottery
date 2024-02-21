import { abiDecoder } from '@klever/sdk-web';
import {
  LOTTERY_FUNCTIONS,
  LOTTERY_NAME,
  PROVIDER_URL,
  SC_ADDRESS,
} from "../../env";
import { ScStatus } from "../types/sc";
import { stringToHex } from "./hex";
import { abiString, nameOfFieldTypes } from './lottery-abi';

async function requestNode(
  funcName: string,
  endopint: "int" | "hex" | "string",
): Promise<any> {
  try {
    const lotteryNameHex = stringToHex(LOTTERY_NAME);

    const body = JSON.stringify({
      scAddress: SC_ADDRESS,
      funcName,
      args: [lotteryNameHex],
    });

    const res = await fetch(
      "https://node." + PROVIDER_URL + "/vm/" + endopint,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      },
    );

    const data = await res.json();

    return data;
  } catch (error) {
    console.error("Error requesting node", error);
    return error;
  }
}

export async function verifyScStatus(): Promise<ScStatus> {
  const statusParsed: { [statusDigit: string]: ScStatus } = {
    "0": "ENDED",
    "1": "ACTIVE",
    "2": "PENDING",
  };

  const scStatus = await requestNode(LOTTERY_FUNCTIONS.status, "int");

  if (!scStatus.data) {
    return scStatus;
  }

  return statusParsed[scStatus.data.data];
}

export async function getLotteryInfo(): Promise<any> {
  const res = await requestNode(LOTTERY_FUNCTIONS.info, "hex");

  if (!res.data) {
    return res;
  }

  const decodedInfos = abiDecoder.decodeStruct(
    res.data.data,
    nameOfFieldTypes,
    abiString,
  );

  return decodedInfos;
}
