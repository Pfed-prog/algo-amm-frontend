export const usdcId = 10458941;

interface AMM {
  appId: number;
  contractAddress: string;
  question: string;
}

type AMMnumber = number;

export const AMMs: Record<AMMnumber, AMM> = {
  105639497: {
    appId: 105639497,
    contractAddress:
      "C5MTTIWVABNVG22TPGYETHVYVZCUD75F5SXOZR5A5L7CLQ6QHKWWTLKTSI",
    question: "First Pool",
  },
};
