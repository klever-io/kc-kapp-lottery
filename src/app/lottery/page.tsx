"use client";

import { toast } from "@/components/ui/use-toast";
import { ISmartContract, TransactionType, web } from "@klever/sdk-web";
import { Ticket } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  LOTTERY_FUNCTIONS,
  LOTTERY_NAME,
  LOTTERY_PRICE,
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

    if (status !== null && status.data.data === "0") {
      router.push("/start");
    }

    if (status !== null && status.data.data === "2") {
      router.push("/end");
    }
  }, [router]);

  useEffect(() => {
    evalStatus();
  }, [evalStatus]);

  async function buyTicket() {
    try {
      setIsLoading(true);

      const payload: ISmartContract = {
        address: SC_ADDRESS,
        scType: 0,
        callValue: { KLV: LOTTERY_PRICE },
      };

      const txData: string = Buffer.from(
        LOTTERY_FUNCTIONS.buy + `@${stringToHex(LOTTERY_NAME)}`,
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

      setIsLoading(false);

      if (error.length > 0) throw new Error(error);

      const hash = data.txsHashes[0];

      toast({
        title: "You bought a ticket!",
        description: (
          <Link
            target="_blank"
            href={`https://devnet.kleverscan.org/transaction/${hash}?withResults=true`}
          >
            <p className="max-w-xs truncate underline">{hash}</p>
          </Link>
        ),
      });
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
      clickFn={buyTicket}
      spanTxt="Buy lottery ticket"
      icon={<Ticket strokeWidth={1.5} />}
    />
  );
}
