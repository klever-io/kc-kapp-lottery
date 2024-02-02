import { web } from "@klever/sdk-web";

const transactionsProcessed = async (
  txs: Promise<any>[],
  tries = 10
): Promise<any[]> => {
  const res = await Promise.all(txs);

  const hashes: string[] = [];
  res.forEach((tx) => {
    hashes.push(...tx.data.txsHashes);
  });

  const processedRequest: Promise<any>[] = hashes.map(
    async (hash) => {
      const array = Array.from({ length: tries }, (_, i) => i);
      let error = "";

      for (const i of array) {
        const fetchPromise = fetch(`${web.getProvider().api}/transaction/${hash}`);

        const result = await fetchPromise;
        const data = await result.json();

        if (data && !data.error) {
          return data.data;
        } else if (data.error) {
          error = data;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      throw error;
    }
  );

  return await Promise.all(processedRequest);
};

export { transactionsProcessed };
