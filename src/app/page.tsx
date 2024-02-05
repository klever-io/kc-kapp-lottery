"use client";

import { Button } from "@/components/button";
import { useToast } from "@/components/ui/use-toast";
import { signMessage } from "@/config";
import { useAuth } from "@/contexts/auth-context";
import { web } from "@klever/sdk-web";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Oval } from "react-loader-spinner";
import { PROVIDER_URL } from "../../env";
import { verifyScStatus } from "../lib/lottery-status";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { setAddress } = useAuth();
  const router = useRouter();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      if (typeof window === "undefined" || !window.kleverWeb) {
        throw Error("Klever Extension not found");
      }

      await window.kleverWeb.initialize();
      const address = window.kleverWeb.getWalletAddress();
      if (!address) {
        throw Error("Cannot retrieve wallet address");
      }

      await window.kleverWeb.signMessage(signMessage);

      web.setProvider({
        node: "https://node" + PROVIDER_URL,
        api: "https://api" + PROVIDER_URL,
      });

      setAddress(address);

      const status = await verifyScStatus();
      if (status !== null) {
        switch (status.data.data) {
          case "0":
            router.push("/start");
            break;
          case "2":
            router.push("/end");
            break;
          default:
            router.push("/lottery");
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: String(error),
      });
    }
    setLoading(false);
  }

  return (
    <main className="w-screen h-screen flex items-center justify-center">
      {loading ? (
        <Oval
          visible={true}
          height="80"
          width="80"
          color="#e7e8e9"
          secondaryColor="#334155"
          ariaLabel="oval-loading"
          wrapperStyle={{}}
          wrapperClass=""
        />
      ) : (
        <form
          onSubmit={onSubmit}
          className="max-w-xs p-4 border border-slate-300 rounded-md shadow-sm"
        >
          <div>
            <h1 className="font-bold text-lg">Lottery Smart Contract</h1>
            <h3 className="text-sm">Sign in with extension</h3>
          </div>
          <div className="mt-2 mb-6 h-[1px] w-full bg-slate-300" />

          <Button disabled={loading} type="submit">
            Sign in
          </Button>
        </form>
      )}
    </main>
  );
}
