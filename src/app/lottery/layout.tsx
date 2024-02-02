import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {

  return (
    <main className="w-screen h-screen flex items-center justify-center">
      <div className="p-4 border border-slate-300 rounded-md shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-bold text-lg">Ticket Office</h1>
            <h3 className="text-sm">
              Buy a ticket and have fun!
            </h3>
          </div>
        </div>

        <div className="mt-2 mb-6 h-[1px] w-full bg-slate-300" />
        {children}
      </div>
    </main>
  );
}
