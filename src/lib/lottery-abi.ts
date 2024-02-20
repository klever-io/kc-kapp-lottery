export const nameOfFieldTypes = "LotteryInfo";

export const abiString = JSON.stringify({
  types: {
    [nameOfFieldTypes]: {
      type: "struct",
      fields: [
        {
          name: "token_identifier",
          type: "TokenIdentifier",
        },
        {
          name: "ticket_price",
          type: "BigUint",
        },
        {
          name: "tickets_left",
          type: "u32",
        },
        {
          name: "deadline",
          type: "u64",
        },
        {
          name: "max_entries_per_user",
          type: "u32",
        },
        {
          name: "prize_distribution",
          type: "bytes",
        },
        {
          name: "prize_pool",
          type: "BigUint",
        },
      ],
    },
  },
});
