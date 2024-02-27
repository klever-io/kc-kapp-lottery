"use client";

import { Button } from "@/components/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts";
import { web } from "@klever/sdk-web";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Oval } from "react-loader-spinner";
import { PROVIDER_URL } from "../../env";

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

      web.setProvider({
        node: "https://node." + PROVIDER_URL,
        api: "https://api." + PROVIDER_URL,
      });

      setAddress(address);

      router.push("/lottery");
    } catch (error) {
      toast({
        variant: "destructive",
        title: String(error),
      });
    }
    setLoading(false);
  }

  return (
    <main className="flex items-center justify-center">
      <form
        onSubmit={onSubmit}
        className="bg-gradient-to-r from-[--begin-gradient]
       to-[--end-gradient] p-4 border border-[--border-color] rounded-md w-[--boxes-width]"
      >
        <div>
          <h1 className="font-bold text-lg">Lottery Smart Contract</h1>
          <h3 className="text-sm">Sign in with extension</h3>
        </div>
        <div className="mt-2 mb-6 h-[1px] w-full bg-slate-300" />

        <Button disabled={loading} type="submit">
          {loading ? (
            <Oval
              visible={true}
              height="16"
              width="16"
              color="#fff"
              secondaryColor="#fff"
              ariaLabel="oval-loading"
            />
          ) : (
            "Sign in"
          )}
        </Button>
      </form>
    </main>
  );
}
