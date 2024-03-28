import { abiDecoder } from "@klever/sdk-web";
import {
  LOTTERY_FUNCTIONS,
  LOTTERY_NAME,
  PROVIDER_URL,
  SC_ADDRESS,
} from "../../env";
import { ScStatus } from "../types/sc";
import { stringToHex } from "./hex";
import {
  LOTTERY_INFO_FIELD_NAME,
  WINNER_INFO_FIELD_NAME,
  generalInfoAbiString,
  winnerInfoAbiString,
} from "./lottery-abi";

async function requestNode(
  funcName: string,
  endopint: "int" | "hex" | "string",
  hasArgs: boolean,
): Promise<any> {
  try {
    const lotteryNameHex = stringToHex(LOTTERY_NAME);

    type BodyObject = {
      scAddress: string;
      funcName: string;
      args: string[];
    };

    const bodyObject: BodyObject = {
      scAddress: SC_ADDRESS,
      funcName,
      args: [],
    };

    hasArgs && bodyObject.args.push(lotteryNameHex);

    const body = JSON.stringify(bodyObject);

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

  const scStatus = await requestNode(LOTTERY_FUNCTIONS.status, "int", true);

  if (!scStatus.data) {
    return scStatus;
  }

  return statusParsed[scStatus.data.data];
}

type LotteryInfo = {
  deadline: bigint;
  max_entries_per_user: number;
  prize_distribution: string;
  prize_pool: bigint;
  ticket_price: bigint;
  tickets_left: number;
  token_identifier: string;
};

export async function getLotteryInfo(): Promise<LotteryInfo> {
  const res = await requestNode(LOTTERY_FUNCTIONS.info, "hex", true);

  if (!res.data) {
    return res;
  }

  const decodedInfos = abiDecoder.decodeStruct(
    res.data.data,
    LOTTERY_INFO_FIELD_NAME,
    generalInfoAbiString,
  ) as LotteryInfo;

  return decodedInfos;
}

export type WinnersInfo = {
  drawn_ticket_number: number;
  prize: bigint;
  winner_address: string;
};

export async function getWinnersInfos(): Promise<WinnersInfo[]> {
  const res = await requestNode(LOTTERY_FUNCTIONS.winnersInfo, "hex", true);

  console.log(res);
  if (!res.data) {
    return res;
  }

  if (res.data.data.length === 0) {
    return [];
  }

  const decodedInfos = abiDecoder.decodeList(
    res.data.data,
    "List<" + WINNER_INFO_FIELD_NAME + ">",
    winnerInfoAbiString,
  ) as WinnersInfo[];
  // decodedInfos.length

  return decodedInfos;
}
