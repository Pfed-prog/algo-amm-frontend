import MyAlgo from "@randlabs/myalgo-connect";

const myAlgoWallet = new MyAlgo();

export const connectToMyAlgo = async (set: Function, setAddress: Function) => {
  const accounts = await myAlgoWallet.connect();
  const addresses = accounts.map((account) => account.address);

  set(addresses);
  setAddress(0);
};
