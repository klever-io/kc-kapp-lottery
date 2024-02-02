"use client";

import { ReactNode } from "react";
import { LOTTERY_TOKEN } from '../../../env';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <main className="w-screen h-screen flex items-center justify-center">
      <div className="p-4 border border-slate-300 rounded-md shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-bold text-lg">Start New Lottery</h1>
            <h3 className="text-sm">
              The last lottery deadline has ended. Below you can determine the
              winner of the last lottery and then start a new one using some of
              your {LOTTERY_TOKEN}.
            </h3>
          </div>
        </div>

        <div className="mt-2 mb-6 h-[1px] w-full bg-slate-300" />
        {children}
      </div>
    </main>
  );
}
