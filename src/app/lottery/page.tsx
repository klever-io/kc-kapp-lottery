"use client";

import { toast } from "@/components/ui/use-toast";
import { ISmartContract, TransactionType, web } from "@klever/sdk-web";
import { Crown, Dices, Ticket } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { ReactElement, useCallback, useEffect, useState } from "react";
import { Oval } from "react-loader-spinner";
import {
  LOTTERY_FUNCTIONS,
  LOTTERY_NAME,
  LOTTERY_PRICE,
  LOTTERY_TOKEN,
  SC_ADDRESS,
} from "../../../env";
import { Button } from "../../components/button";
import { useAuth } from "../../contexts/auth-context";
import { stringToHex } from "../../lib/hex";
import { verifyScStatus } from "../../lib/lottery-status";
import { transactionsProcessed } from "../../lib/transaction";
import { ScStatus } from "../../types/sc";

export default function Page() {
  type UiParams = {
    h1Text: string;
    h3Text: string;
    spanText: string;
    icon: ReactElement;
  };

  type LotteryActionParams = {
    lotteryFunction: string;
    hexArgs: string;
    toastMessage: string;
    callValue?: { [tokenName: string]: number };
  };

  const [isLoading, setIsLoading] = useState(true);
  const [firstRender, setFirstRender] = useState(true);
  const [lotteryActionParams, setLotteryActionParams] =
    useState<LotteryActionParams>({
      lotteryFunction: "",
      hexArgs: "",
      toastMessage: "",
    });
  const [scStatus, setScStatus] = useState<ScStatus>("FETCHING");
  const [uiParams, setUiParams] = useState<UiParams>({
    h1Text: "",
    h3Text: "",
    spanText: "",
    icon: <></>,
  });
  const router = useRouter();

  const { address } = useAuth();

  useEffect(() => {
    if (!address) {
      router.push("/");
    }
  }, [address, router]);

  const prepareStates = useCallback(
    (status: ScStatus) => {
      switch (status) {
        case "ERROR":
          toast({
            variant: "destructive",
            title: "Error",
            description: "An error occurred while verifying the lottery status",
          });
          router.push("/");
          break;
        case "ENDED":
          const lotteryDurationSeconds = 300; // 5 minutes
          const timestampSeconds = Math.floor(Date.now() / 1000);
          const deadline = timestampSeconds + lotteryDurationSeconds;

          setLotteryActionParams({
            lotteryFunction: LOTTERY_FUNCTIONS.start,
            hexArgs:
              `@${stringToHex(LOTTERY_NAME)}` +
              `@${stringToHex(LOTTERY_TOKEN)}` +
              `@${LOTTERY_PRICE.toString(16)}` +
              `@@01${deadline.toString(16).padStart(16, "0").toUpperCase()}@@@`,
            toastMessage: "Lottery started successfully!",
          });

          setUiParams({
            h1Text: "Lottery not started yet",
            h3Text:
              "Start a new lottery yourself using some of your KLV and have fun playing!",
            spanText: "Start lottery",
            icon: <Dices strokeWidth={1.5} />,
          });
          break;
        case "ACTIVE":
          setLotteryActionParams({
            lotteryFunction: LOTTERY_FUNCTIONS.buy,
            hexArgs: `@${stringToHex(LOTTERY_NAME)}`,
            toastMessage: "You bought a ticket!",
            callValue: { KLV: LOTTERY_PRICE },
          });

          setUiParams({
            h1Text: "Ticket Office",
            h3Text: "Buy a ticket and have fun!",
            spanText: "Buy lottery ticket",
            icon: <Ticket strokeWidth={1.5} />,
          });
          break;
        case "PENDING":
          setLotteryActionParams({
            lotteryFunction: LOTTERY_FUNCTIONS.end,
            hexArgs: `@${stringToHex(LOTTERY_NAME)}`,
            toastMessage: "Lottery ended successfully!",
          });

          setUiParams({
            h1Text: "End the previous Lottery",
            h3Text:
              "The last lottery deadline has ended. Below you can determine the winner of the last lotter using part of your KLV and then start a new one to enjoy the game!",
            spanText: "Determine winner (end lottery)",
            icon: <Crown strokeWidth={1.5} />,
          });
          break;
        default:
          console.error(
            "An error occurred while verifying the lottery status default",
          );
          router.push("/");
          break;
      }
    },
    [router],
  );

  useEffect(() => {
    (async () => {
      const status = await verifyScStatus();
      setScStatus(status);
    })();
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (scStatus === "FETCHING") return;
    prepareStates(scStatus);
  }, [scStatus, prepareStates]);

  useEffect(() => {
    if (uiParams.h1Text.length !== 0) {
      setFirstRender(false);
    }
  }, [uiParams, lotteryActionParams]);

  async function lotteryActions({
    lotteryFunction,
    hexArgs,
    toastMessage,
    callValue,
  }: LotteryActionParams) {
    try {
      setIsLoading(true);

      const comparisonScStatus = await verifyScStatus();

      if (comparisonScStatus !== scStatus) {
        setScStatus(comparisonScStatus);
        setIsLoading(false);
        return;
      }

      const payload: ISmartContract = {
        address: SC_ADDRESS,
        scType: 0,
        callValue,
      };

      const txData: string = Buffer.from(
        lotteryFunction + hexArgs,
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

      const [{ data, error }, freshScStatus] = await Promise.all([
        broadcastResponse,
        verifyScStatus(),
      ]);

      setScStatus(freshScStatus);
      setIsLoading(false);

      if (error.length > 0) throw new Error(error);

      const hash = data.txsHashes[0];

      toast({
        title: toastMessage,
        description: (
          <Link
            target="_blank"
            href={`https://devnet.kleverscan.org/transaction/${hash}`}
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
    <>
      {firstRender ? (
        <Oval
          visible={true}
          height="80"
          width="80"
          color="#fff"
          secondaryColor="#fff"
          ariaLabel="oval-loading"
          wrapperStyle={{}}
          wrapperClass=""
        />
      ) : (
        <main className="flex items-center justify-center">
          <div className="bg-gradient-to-r from-[--begin-gradient] to-[--end-gradient] p-4 border border-[--border-color] rounded-md w-[--boxes-width]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="font-bold text-lg">{uiParams.h1Text}</h1>
                <h3 className="text-sm">{uiParams.h3Text}</h3>
              </div>
            </div>

            <div className="mt-2 mb-6 h-[1px] w-full bg-slate-300" />
            <Button
              type="button"
              disabled={isLoading}
              onClick={() => lotteryActions(lotteryActionParams)}
            >
              {isLoading ? (
                <Oval
                  visible={true}
                  height="16"
                  width="16"
                  color="#fff"
                  secondaryColor="#fff"
                  ariaLabel="oval-loading"
                />
              ) : (
                <>
                  {React.cloneElement(uiParams.icon, {
                    className: "w-5 h-5 pr-1",
                  })}
                  <span>{uiParams.spanText}</span>
                </>
              )}
            </Button>
          </div>
        </main>
      )}
    </>
  );
}
