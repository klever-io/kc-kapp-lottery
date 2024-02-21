"use client";

import { toast } from "@/components/ui/use-toast";
import { ISmartContract, TransactionType, web } from "@klever/sdk-web";
import { Crown, Dices, Ticket } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { ReactElement, useCallback, useEffect, useState } from "react";
import { Oval } from "react-loader-spinner";
import {
  LOTTERY_DURATION_MINUTES,
  LOTTERY_FUNCTIONS,
  LOTTERY_NAME,
  LOTTERY_PRICE,
  LOTTERY_TOKEN,
  PRECISION,
  SC_ADDRESS,
} from "../../../env";
import { Button } from "../../components/button";
import { useAuth } from "../../contexts/auth-context";
import { stringToHex } from "../../lib/hex";
import { verifyScStatus } from "../../lib/lottery-funcs";
import { transactionsProcessed } from "../../lib/transaction";
import { ScStatus } from "../../types/sc";
import LotteryInfo from "./lottery-info";

export default function Page() {
  const SIXTY_SECONDS = 60;

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
  const [scStatus, setScStatus] = useState<ScStatus>("FETCHING");

  const [uiParams, setUiParams] = useState<UiParams>({
    h1Text: "",
    h3Text: "",
    spanText: "",
    icon: <></>,
  });

  const [lotteryActionParams, setLotteryActionParams] =
    useState<LotteryActionParams>({
      lotteryFunction: "",
      hexArgs: "",
      toastMessage: "",
    });

  const [updateLottoInfos, setUpdateLottoInfos] = useState(false);

  const router = useRouter();

  const { address } = useAuth();

  useEffect(() => {
    if (!address) {
      router.push("/");
    }
  }, [address, router]);

  const updateStates = useCallback(
    (status: ScStatus) => {
      switch (status) {
        case "ENDED":
          const lotteryDurationSeconds = SIXTY_SECONDS * LOTTERY_DURATION_MINUTES;
          const timestampSeconds = Math.floor(Date.now() / 1000);
          const deadline = timestampSeconds + lotteryDurationSeconds;

          setLotteryActionParams({
            lotteryFunction: LOTTERY_FUNCTIONS.start,
            hexArgs:
              `@${stringToHex(LOTTERY_NAME)}` +
              `@${stringToHex(LOTTERY_TOKEN)}` +
              `@${(LOTTERY_PRICE * PRECISION).toString(16)}` +
              `@@01${deadline.toString(16).padStart(16, "0").toUpperCase()}@@@`,
            toastMessage: "Lottery started successfully!",
          });

          setUiParams({
            h1Text: "Lottery not started yet",
            h3Text: `Start a new lottery yourself using some of your ${LOTTERY_TOKEN} and have fun playing!`,
            spanText: "Start lottery",
            icon: <Dices strokeWidth={1.5} />,
          });
          break;
        case "ACTIVE":
          setLotteryActionParams({
            lotteryFunction: LOTTERY_FUNCTIONS.buy,
            hexArgs: `@${stringToHex(LOTTERY_NAME)}`,
            toastMessage: "You bought a ticket!",
            callValue: { [LOTTERY_TOKEN]: LOTTERY_PRICE * PRECISION },
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
            h3Text: `The last lottery deadline has ended. Below you can determine the winner of the last lotter using part of your ${LOTTERY_TOKEN} and then start a new one to enjoy the game!`,
            spanText: "Determine winner (end lottery)",
            icon: <Crown strokeWidth={1.5} />,
          });
          break;
        default:
          toast({
            variant: "destructive",
            title: "Error",
            description: `An error occurred while verifying the lottery infos: ${status}`,
          });
          router.push("/");
          break;
      }
    },
    [router],
  );

  const compareLotteryStatus = async (): Promise<boolean> => {
    const freshStatus = await verifyScStatus();
    const comparison = freshStatus !== scStatus;
    if (comparison) {
      setScStatus(freshStatus);
      setIsLoading(false);
    }
    return comparison;
  };

  async function lotteryActions({
    lotteryFunction,
    hexArgs,
    toastMessage,
    callValue,
  }: LotteryActionParams) {
    try {
      setIsLoading(true);

      const compareStatusResult = await compareLotteryStatus();
      if (compareStatusResult) return;

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

      if (freshScStatus === "ACTIVE") {
        setUpdateLottoInfos(!updateLottoInfos); // Update lottery infos
      }

      if (error.length > 0) throw new Error(error);

      const hash = data.txsHashes[0];

      toast({
        title: toastMessage,
        className: "bg-[#4EBC87]",
        description: (
          <Link
            target="_blank"
            href={`https://testnet.kleverscan.org/transaction/${hash}`}
          >
            <p className="max-w-xs truncate underline">{hash}</p>
          </Link>
        ),
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: String(error),
        className: "bg-[#FF4465]",
      });
    }
  }

  const updateScStatusOnTimeout = () =>  {
    setScStatus("PENDING");
  }

  useEffect(() => {
    (async () => {
      const status = await verifyScStatus();
      setScStatus(status);
    })();
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (scStatus === "FETCHING") return;
    updateStates(scStatus);
  }, [scStatus, updateStates]);

  useEffect(() => {
    if (uiParams.h1Text.length !== 0) {
      setFirstRender(false);
    }
  }, [uiParams, lotteryActionParams]);

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
        />
      ) : (
        <main className="flex items-center justify-center">
          <div
            className="bg-gradient-to-r from-[--begin-gradient]
              to-[--end-gradient] p-4 border border-[--border-color]
              rounded-md w-[--boxes-width]"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="font-bold text-lg">{uiParams.h1Text}</h1>
                <h3 className="text-sm">{uiParams.h3Text}</h3>
              </div>
            </div>

            {scStatus === "ACTIVE" && (
              <LotteryInfo
                updateLottoInfos={updateLottoInfos}
                onTimeout={updateScStatusOnTimeout}
              />
            )}

            <div className="mt-2 mb-6 h-[1px] w-full bg-slate-300" />
            <Button
              type="button"
              disabled={isLoading}
              onClick={async () => lotteryActions(lotteryActionParams)}
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
