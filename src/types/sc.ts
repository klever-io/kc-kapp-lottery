export type ScInfo = {
  data: {
    data: string;
  };
  error: string;
  code: string;
};

export type ScStatus = "ENDED" | "ACTIVE" | "PENDING" | "ERROR" | "FETCHING";
