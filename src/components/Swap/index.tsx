import { Paper, Stack, Button } from "@mantine/core";
import { useEffect, useState } from "react";
import { connectToMyAlgo } from "../../lib/connectWallet";
import { useStore } from "../../store";
import { appId, usdcId, contractAddress } from "../../contracts";
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
  const yesToken = useStore((state) => state.yesToken);
  const noToken = useStore((state) => state.noToken);
  const poolToken = useStore((state) => state.poolToken);
  const yesTokenReserves = useStore((state) => state.yesTokenReserves);
  const noTokenReserves = useStore((state) => state.noTokenReserves);
  const selectedAddress = useStore((state) => state.selectedAddress);
  const setAddresses = useStore((state) => state.setAddresses);
  const selectAddress = useStore((state) => state.selectAddress);
  const setYesToken = useStore((state) => state.setYesToken);
  const setNoToken = useStore((state) => state.setNoToken);
  const setPoolToken = useStore((state) => state.setPoolToken);
  const setYesTokenReserves = useStore((state) => state.setYesTokenReserves);
  const setNoTokenReserves = useStore((state) => state.setNoTokenReserves);

  const [coin_2, setCoin_2] = useState<Coin>({
    token: "Yes",
  });

  const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

  useEffect(() => {
    console.log(123);
    const queryGlobal = async () => {
      const app = await algodClient.getApplicationByID(appId).do();
      for (const [key, value] of Object.entries(
        app["params"]["global-state"]
      )) {
        if (value["key"] == "eWVzX3Rva2VuX2tleQ==") {
          //yes_token_key
          setYesToken(value["value"]["uint"]);
          console.log("Yes_token_key", value["value"]["uint"]);
        }
        if (value["key"] == "bm9fdG9rZW5fa2V5") {
          //no_token_key
          setNoToken(value["value"]["uint"]);
          console.log("No_token_key", value["value"]["uint"]);
        }
        if (value["key"] == "cG9vbF90b2tlbl9rZXk=") {
          //pool_token_key
          setPoolToken(value["value"]["uint"]);
          console.log("Pool_token_key", value["value"]["uint"]);
        }
        if (value["key"] == "eWVzX3Rva2Vuc19yZXNlcnZlcw==") {
          //yes_token_reserves
          setYesTokenReserves(value["value"]["uint"]);
          console.log("yes_token_reserves", value["value"]["uint"]);
        }
        if (value["key"] == "bm9fdG9rZW5zX3Jlc2VydmVz") {
          //no_tokens_reserves
          setNoTokenReserves(value["value"]["uint"]);
          console.log("no_token_reserves", value["value"]["uint"]);
        }
      }
    };
    queryGlobal();
  }, []);

  const swap = async (usdcAmount: number, tokenName: string) => {
    try {
      var choice = "";
      if (tokenName == "Yes") {
        choice = "buy_yes";
      }
      if (tokenName == "No") {
        choice = "buy_no";
      }

      const params = await algodClient.getTransactionParams().do();

      const enc = new TextEncoder();

      const accounts = undefined;
      const foreignApps = undefined;
      const foreignAssets = [usdcId, poolToken, yesToken, noToken];
      const closeRemainderTo = undefined;
      const note = undefined;
      const amount = 2000;

      usdcAmount = usdcAmount * 1000000;
      //console.log(choice);

      const txn1 = algosdk.makePaymentTxnWithSuggestedParams(
        selectedAddress,
        contractAddress,
        amount,
        closeRemainderTo,
        note,
        params
      );

      const txn2 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        suggestedParams: {
          ...params,
        },
        from: selectedAddress,
        to: contractAddress,
        assetIndex: usdcId,
        amount: usdcAmount,
        note: note,
      });

      const txn3 = algosdk.makeApplicationNoOpTxn(
        selectedAddress,
        params,
        appId,
        [enc.encode("swap"), enc.encode(choice)],
        accounts,
        foreignApps,
        foreignAssets
      );

      const txnsArray = [txn1, txn2, txn3];
      const groupID = algosdk.computeGroupID(txnsArray);
      for (let i = 0; i < 3; i++) txnsArray[i].group = groupID;

      const myAlgoConnect = new MyAlgoConnect();
      const signedTxns = await myAlgoConnect.signTransaction(
        txnsArray.map((txn) => txn.toByte())
      );
      const response = await algodClient
        .sendRawTransaction(signedTxns.map((tx) => tx.blob))
        .do();

      console.log("https://testnet.algoexplorer.io/tx/" + response["txId"]);
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
        <h1>
          YRs: {yesTokenReserves / 1000000}; NRs: {noTokenReserves / 1000000}
        </h1>
        <AmountContainer coin={coin_2} setCoin={setCoin_2} />
        <Button
          onClick={() => {
            if (!selectedAddress)
              return connectToMyAlgo(setAddresses, selectAddress);
            if (selectedAddress && coin_2?.amount)
              return swap(coin_2?.amount, coin_2?.token);
          }}
          m={4}
          radius="xl"
        >
          {selectedAddress ? "Swap" : "Connect to wallet"}
        </Button>
      </Stack>
    </Paper>
  );
};

export default Swap;
