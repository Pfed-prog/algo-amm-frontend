import { Paper, Stack, Button } from "@mantine/core";
import { useState } from "react";
import { connectToMyAlgo } from "../../lib/connectWallet";
import { useStore } from "../../store";
import AmountContainer from "./AmountContainer";
import { Coin } from "./types/pair";
import MyAlgoConnect from "@randlabs/myalgo-connect";
import algosdk from "algosdk";

const algodServer = "https://testnet-algorand.api.purestake.io/ps2";
const algodPort = "";
const algodToken = {
  "X-API-Key": "megX3xJK3V4p3ajxgjedO3EGhHcb0STgaWGpKUzh",
};

const Swap = () => {
  const setAddresses = useStore((state) => state.setAddresses);
  const selectAddress = useStore((state) => state.selectAddress);
  const selectedAddress = useStore((state) => state.selectedAddress);
  const [algoCoin, setAlgoCoin] = useState<Coin>({
    token: "ALGO",
  });
  const [coin_2, setCoin_2] = useState<Coin>();

  const OptIn = async () => {
    try {
      const algodClient = new algosdk.Algodv2(
        algodToken,
        algodServer,
        algodPort
      );

      const params = await algodClient.getTransactionParams().do();

      /*       const txn = algosdk.makeApplicationOptInTxnFromObject({
        suggestedParams: {
          ...params,
          fee: 1000,
          flatFee: true,
        },
        from: selectedAddress,
        appIndex: 14241387,
        //note: note,
      }); */
      const txn1 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        suggestedParams: {
          ...params,
        },
        from: selectedAddress,
        to: selectedAddress,
        assetIndex: 99351348,
        amount: 0,
      });
      const txn2 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        suggestedParams: {
          ...params,
        },
        from: selectedAddress,
        to: selectedAddress,
        assetIndex: 99351352,
        amount: 0,
      });
      const txn3 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        suggestedParams: {
          ...params,
        },
        from: selectedAddress,
        to: selectedAddress,
        assetIndex: 99351350,
        amount: 0,
      });
      const txnsArray = [txn1, txn2, txn3];
      const groupID = algosdk.computeGroupID(txnsArray);
      for (let i = 0; i < 2; i++) txnsArray[i].group = groupID;

      const myAlgoConnect = new MyAlgoConnect();
      const signedTxns = await myAlgoConnect.signTransaction(
        txnsArray.map((txn) => txn.toByte())
      );

      console.log(signedTxns);
    } catch (err) {
      console.error(err);
    }
  };

  //TODO: Add swap logic
  return (
    <Paper
      mx="auto"
      sx={{ maxWidth: 800 }}
      p="md"
      radius="xl"
      withBorder
      shadow="xl"
    >
      <Stack>
        <AmountContainer coin={algoCoin} setCoin={setAlgoCoin} />
        <AmountContainer coin={coin_2} setCoin={setCoin_2} />
        <Button
          onClick={() => {
            if (!selectedAddress)
              return connectToMyAlgo(setAddresses, selectAddress);
          }}
          m={4}
          radius="xl"
        >
          {selectedAddress ? "Swap" : "Connect to wallet"}
        </Button>
        <Button
          onClick={() => {
            if (selectedAddress) return OptIn();
          }}
          m={4}
          radius="xl"
        >
          {selectedAddress ? "Opt In" : "Connect to wallet"}
        </Button>
      </Stack>
    </Paper>
  );
};

export default Swap;
