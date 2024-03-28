export const LOTTERY_NAME = "SCLotteryDemo";
export const LOTTERY_PRICE = 10;
export const TOTAL_TICKETS = 800;
export const LOTTERY_TOKEN = "KLV";
export const PRECISION = 10 ** 6;
export const LOTTERY_DURATION_MINUTES = 60; // 1 hour
export const LOTTERY_FUNCTIONS = {
  start: "createLotteryPool",
  buy: "buy_ticket",
  end: "determine_winner",
  status: "status",
  info: "getLotteryInfo",
  winnersInfo: "getWinnersInfo",
};
