"use client";

import { toast } from "@/components/ui/use-toast";
import { ISmartContract, TransactionType, web } from "@klever/sdk-web";
import { Dices } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  LOTTERY_FUNCTIONS,
  LOTTERY_NAME,
  LOTTERY_PRICE,
  LOTTERY_TOKEN,
  SC_ADDRESS,
} from "../../../env";
import ButtonBox from "../../components/button-box";
import { useAuth } from "../../contexts/auth-context";
import { stringToHex } from "../../lib/hex";
import { verifyScStatus } from "../../lib/lottery-status";
import { transactionsProcessed } from "../../lib/transaction";

export default function Page() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { address } = useAuth();

  useEffect(() => {
    if (!address) {
      router.push("/");
    }
  }, [address, router]);

  const evalStatus = useCallback(async () => {
    setIsLoading(true);

    const status = await verifyScStatus();

    setIsLoading(false);

    if (status !== null && status.data.data === "1") {
      router.push("/lottery");
    }

    if (status !== null && status.data.data === "2") {
      router.push("/end");
    }
  }, [router]);

  useEffect(() => {
    evalStatus();
  }, [evalStatus]);

  async function startNewLottery() {
    try {
      setIsLoading(true);

      const payload: ISmartContract = {
        address: SC_ADDRESS,
        scType: 0,
      };

      const lotteryDurationSeconds = 300; // 5 minutes
      const timestampSeconds = Math.floor(Date.now() / 1000);
      const deadline = timestampSeconds + lotteryDurationSeconds;

      const hexArgs = `@${stringToHex(LOTTERY_NAME)}@${stringToHex(LOTTERY_TOKEN)}@${LOTTERY_PRICE.toString(16)}@@01${deadline.toString(16).padStart(16, "0").toUpperCase()}@@@`;

      const txData: string = Buffer.from(
        LOTTERY_FUNCTIONS.start + hexArgs,
        "utf8",
      ).toString("base64");

      const unsignedTx = await web.buildTransaction(
        [
          {
            payload,
            type: TransactionType.SmartContract,
          },
        ],
        [txData],
      );

      const signedTx = await web.signTransaction(unsignedTx);

      const broadcastResponse = web.broadcastTransactions([signedTx]);

      await transactionsProcessed([broadcastResponse], 10);

      const { data, error } = await broadcastResponse;

      setIsLoading(true);

      if (error.length > 0) throw new Error(error);

      const hash = data.txsHashes[0];

      toast({
        title: "Lottery started successfully!",
        description: (
          <Link
            target="_blank"
            href={`https://devnet.kleverscan.org/transaction/${hash}?withResults=true`}
          >
            <p className="max-w-xs truncate underline">{hash}</p>
          </Link>
        ),
      });

      router.push("/lottery");
    } catch (error) {
      toast({
        variant: "destructive",
        title: String(error),
      });
    }
  }

  return (
    <ButtonBox
      loading={isLoading}
      clickFn={startNewLottery}
      spanTxt="Start new lottery"
      icon={<Dices strokeWidth={1.5} />}
    />
  );
}
