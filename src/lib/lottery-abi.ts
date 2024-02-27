export const LOTTERY_INFO_FIELD_NAME = "LotteryInfo";

export const generalInfoAbiString = JSON.stringify({
  types: {
    [LOTTERY_INFO_FIELD_NAME]: {
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

export const WINNER_INFO_FIELD_NAME = "WinnerInfo";

export const winnerInfoAbiString = JSON.stringify({
  types: {
    [WINNER_INFO_FIELD_NAME]: {
      type: "struct",
      fields: [
        {
          name: "drawn_ticket_number",
          type: "u32",
        },
        {
          name: "winner_address",
          type: "Address",
        },
        {
          name: "prize",
          type: "BigUint",
        },
      ],
    },
  },
});
