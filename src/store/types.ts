export type Coin = {
  token: string;
  amount?: number;
};

export type Pair = {
  token_1: Coin;
  token_2: Coin;
};

export interface AmountContainerProps {
  coin?: Coin;
  setCoin: Function;
}

export interface GlobalStateIndices {
  indices: Array<string>;
}
