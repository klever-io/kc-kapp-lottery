"use client";

import { useCallback, useEffect, useState } from "react";
import { Oval } from "react-loader-spinner";
import {
  LOTTERY_PRICE,
  LOTTERY_TOKEN,
  PRECISION,
  TOTAL_TICKETS,
} from "../../../env";
import { getLotteryInfo } from "../../lib/lottery-funcs";
import { ScStatus } from '../../types/sc';

export default function LotteryInfo({
  updateLottoInfos,
  onTimeout,
}: {
  updateLottoInfos: boolean;
    onTimeout: () => void;
}) {
  type ParsedLotteryInfos = Array<{
    title: string;
    value: string;
  }>;

  const [lotteryInfos, setLotteryInfos] = useState<ParsedLotteryInfos>([]);
  const [rawDeadline, setRawDeadline] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

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
      { title: "Total tickets", value: TOTAL_TICKETS.toString() },
      { title: "Tickets left", value: ticketsLeft.toString() },
      { title: "Tickets sold", value: ticketsSold },
      { title: "Ticket price", value: LOTTERY_PRICE + ` ${LOTTERY_TOKEN}` },
      { title: "Prize pool", value: prizePool + ` ${LOTTERY_TOKEN}` },
      { title: "Deadline", value: formatedDeadline },
    ]);
  };

  const updateCountdown = useCallback(() => {
    const now = Date.now() / 1000; // Current timestamp in seconds
    const difference = rawDeadline - now;

    if (difference <= 0) {
      onTimeout();
      setTimeRemaining("00 days 00:00:00");
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
  }, [rawDeadline, onTimeout]);

  useEffect(() => {
    (async () => {
      await fillLotteryInfos();
    })();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      updateCountdown();
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, updateCountdown]);

  useEffect(() => {
    fillLotteryInfos();
  }, [updateLottoInfos]);

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
      <div className="mt-6 mb-2 h-[1px] w-full bg-slate-300" />
      <h3 className="font-bold mb-2">Lottery Infos</h3>
      {lotteryInfos.map(({ title, value }) => (
        <p key={title} className="text-sm block">
          {title}: <span className="font-bold">{value}</span>
        </p>
      ))}
      <p className="text-sm block">
        Time remaining: <span className="font-bold">{timeRemaining}</span>
      </p>
    </>
  );
}
