"use client";

import { useScStatus } from "@/contexts";
import { useCallback, useEffect, useState } from "react";
import { Oval, ProgressBar } from "react-loader-spinner";
import {
  LOTTERY_NAME,
  LOTTERY_PRICE,
  LOTTERY_TOKEN,
  PRECISION,
  TOTAL_TICKETS,
} from "../../../env";
import Address from "../../components/address";
import { getLotteryInfo, verifyScStatus } from "../../lib/lottery-funcs";

type LotteryInfoProp = {
  shouldUpdate: boolean;
};

export default function LotteryInfo({ shouldUpdate }: LotteryInfoProp) {
  type ParsedLotteryInfos = Array<{
    title: string;
    value: string;
  }>;

  const [lotteryInfos, setLotteryInfos] = useState<ParsedLotteryInfos>([]);
  const [rawDeadline, setRawDeadline] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const { setScStatus } = useScStatus();

  const NEARLY_FINISHED =
    "Waiting for the next block to end this lottery. Buy another ticket now!";

  const fillLotteryInfos = async () => {
    const freshLotteryInfos = await getLotteryInfo();

    setRawDeadline(Number(freshLotteryInfos.deadline));

    const deadlineDate = new Date(Number(freshLotteryInfos.deadline) * 1000);
    const year = deadlineDate.getFullYear();
    const month = (deadlineDate.getMonth() + 1).toString().padStart(2, "0");
    const day = deadlineDate.getDate().toString().padStart(2, "0");
    const hours = deadlineDate.getHours().toString().padStart(2, "0");
    const minutes = deadlineDate.getMinutes().toString().padStart(2, "0");
    const seconds = deadlineDate.getSeconds().toString().padStart(2, "0");

    const formatedDeadline = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    const prizePool = (
      Number(freshLotteryInfos.prize_pool) / PRECISION
    ).toString();
    const ticketsLeft = Number(freshLotteryInfos.tickets_left);
    const ticketsSold = (TOTAL_TICKETS - ticketsLeft).toString();

    setLotteryInfos([
      { title: "Lottery name", value: LOTTERY_NAME },
      { title: "Total tickets", value: TOTAL_TICKETS.toString() },
      { title: "Tickets left", value: ticketsLeft.toString() },
      { title: "Tickets sold", value: ticketsSold },
      { title: "Ticket price", value: LOTTERY_PRICE + ` ${LOTTERY_TOKEN}` },
      { title: "Prize pool", value: prizePool + ` ${LOTTERY_TOKEN}` },
      { title: "Deadline", value: formatedDeadline },
    ]);
  };

  const timeDifference = useCallback((): number => {
    const now = Date.now() / 1000; // Current timestamp in seconds
    return rawDeadline - now;
  }, [rawDeadline]);

  const updateCountdown = useCallback(() => {
    const difference = timeDifference();

    if (difference <= 0) {
      setTimeRemaining(NEARLY_FINISHED);
      return;
    }

    const days = Math.floor(difference / (3600 * 24))
      .toString()
      .padStart(2, "0");
    const hours = Math.floor((difference % (3600 * 24)) / 3600)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((difference % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const seconds = Math.floor(difference % 60)
      .toString()
      .padStart(2, "0");

    const formattedTime = `${days} days ${hours}:${minutes}:${seconds}`;

    setTimeRemaining(formattedTime);
  }, [timeDifference]);

  useEffect(() => {
    fillLotteryInfos();
  }, []);

  useEffect(() => {
    fillLotteryInfos();
  }, [shouldUpdate]);

  useEffect(() => {
    const interval = setInterval(() => {
      updateCountdown();
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, updateCountdown]);

  useEffect(() => {
    if (timeRemaining !== NEARLY_FINISHED) {
      return;
    }

    const interval = setInterval(() => {
      (async () => {
        const status = await verifyScStatus();
        status === "PENDING" && setScStatus("PENDING");
      })();
    }, 2000);

    return () => clearInterval(interval);
  }, [timeRemaining, setScStatus]);

  return lotteryInfos.length === 0 ? (
    <Oval
      visible={true}
      height="30"
      width="30"
      color="#fff"
      secondaryColor="#fff"
      ariaLabel="oval-loading"
      wrapperClass="m-auto"
    />
  ) : (
    <>
      <div className="mt-6 mb-2 h-[1px] w-full bg-slate-300 text-5xl" />
      <h3 className="font-bold mb-2 text-lg">Lottery Infos</h3>
      <Address prefix="Lottery address" address={process.env.NEXT_PUBLIC_SC_ADDRESS as string} />
      {lotteryInfos.map(({ title, value }) => (
        <p key={title} className="block">
          {title}: <span className="font-bold">{value}</span>
        </p>
      ))}
      <p className="block">
        Time remaining:{" "}
        {timeRemaining.length === 0 ? (
          <ProgressBar
            visible={true}
            height="20"
            width="40"
            barColor="#fff"
            borderColor="none"
            ariaLabel="progress-bar-loading"
            wrapperClass="inline"
          />
        ) : (
          <span
            className={`font-bold ${timeRemaining === NEARLY_FINISHED && "animate-blinkingText"}`}
          >
            {timeRemaining}
          </span>
        )}
      </p>
    </>
  );
}
