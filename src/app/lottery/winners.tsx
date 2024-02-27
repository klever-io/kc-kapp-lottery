"use client";

import { ChevronLeftCircle, ChevronRightCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { LOTTERY_TOKEN, PRECISION } from "../../../env";
import Address from "../../components/address";
import Box from "../../components/box";
import { useScStatus } from "../../contexts";
import { WinnersInfo, getWinnersInfos } from "../../lib/lottery-funcs";

export default function Winners() {
  const [winners, setWinners] = useState<WinnersInfo[]>([]);
  const [currentItem, setCurrentItem] = useState(0);
  const { scStatus } = useScStatus();

  useEffect(() => {
    getWinnersInfos().then((winners) => {
      setWinners(winners.reverse());
    });
  }, []);

  useEffect(() => {
    if (scStatus === "ENDED") {
      getWinnersInfos().then((winners) => {
        setWinners(winners.reverse());
      });
    }
  }, [scStatus]);

  const nextItem = () => {
    setCurrentItem((prev) => (prev + 1) % winners.length);
  };

  const prevItem = () => {
    setCurrentItem((prev) => (prev - 1 + winners.length) % winners.length);
  };

  return winners.length === 0 ? (
    <></>
  ) : (
    <Box>
      <section className="overflow-hidden relative" style={{ width: "100%" }}>
        <button
          onClick={prevItem}
          className="absolute top-[73%] -translate-y-1/2 left-0 z-50"
        >
          <ChevronLeftCircle />
        </button>
        <h3 className="text-lg font-bold px-10 sm:px-14">
          Check-out the winners of previous lotteries!
        </h3>
        <div className="mt-2 mb-6 h-[1px] w-full bg-slate-300" />
        <div
          className="flex transition ease-out duration-300"
          style={{
            transform: `translateX(-${(currentItem * 100) / winners.length}%)`,
            width: `${winners.length * 100}%`,
          }}
        >
          {winners.map(
            ({ winner_address, prize, drawn_ticket_number }, index) => (
              <ul
                key={index}
                style={{
                  width: `${100 / winners.length}%`,
                }}
                className="px-10 sm:px-14"
              >
                <li>
                  <Address prefix="Address" address={winner_address} />
                </li>
                <li>
                  Prize:{" "}
                  <span className="font-bold">
                    {`${(Number(prize) / PRECISION).toString()} ${LOTTERY_TOKEN}`}
                  </span>
                </li>
                <li>
                  Drawn ticket number:{" "}
                  <span className="font-bold">{drawn_ticket_number}</span>
                </li>
              </ul>
            ),
          )}
        </div>

        <button
          onClick={nextItem}
          className="absolute top-[73%] -translate-y-1/2 right-0 z-50"
        >
          <ChevronRightCircle />
        </button>
      </section>
    </Box>
  );
}
