import { Paper, Stack, Button } from "@mantine/core";
import { useEffect } from "react";
import MyAlgoConnect from "@randlabs/myalgo-connect";
import algosdk from "algosdk";

import { useStore } from "../../store/store";
import { appId, usdcId, contractAddress } from "../../contracts";
import { connectToMyAlgo } from "../../utils/connectWallet";
import { connectAlgod } from "../../utils/connectAlgod";
import { GlobalStateIndeces } from "../../store/types";

const Config = () => {
  const selectedAddress = useStore((state) => state.selectedAddress);
  const yesToken = useStore((state) => state.yesToken);
  const noToken = useStore((state) => state.noToken);
  const poolToken = useStore((state) => state.poolToken);

  const setYesToken = useStore((state) => state.setYesToken);
  const setNoToken = useStore((state) => state.setNoToken);
  const setPoolToken = useStore((state) => state.setPoolToken);
  const setAddresses = useStore((state) => state.setAddresses);
  const selectAddress = useStore((state) => state.selectAddress);

  const algodClient = connectAlgod();

  useEffect(() => {
    const queryGlobal = async () => {
      const app = await algodClient.getApplicationByID(appId).do();

      for (const [key, value] of Object.entries(
        app["params"]["global-state"] as GlobalStateIndeces
      )) {
        if (value["key"] == "eWVzX3Rva2VuX2tleQ==") {
          //yes_token_key
          setYesToken(value["value"]["uint"]);
        }

        if (value["key"] == "bm9fdG9rZW5fa2V5") {
          //no_token_key
          setNoToken(value["value"]["uint"]);
        }

        if (value["key"] == "cG9vbF90b2tlbl9rZXk=") {
          //pool_token_key
          setPoolToken(value["value"]["uint"]);
        }
      }
    };
    queryGlobal();
  }, []);

  const setupAmm = async () => {
    try {
      const params = await algodClient.getTransactionParams().do();

      const enc = new TextEncoder();

      const accounts = undefined;
      const foreignApps = undefined;
      const foreignAssets = [usdcId];
      const closeRemainderTo = undefined;
      const note = undefined;
      const amount = 510000;

      const txn1 = algosdk.makePaymentTxnWithSuggestedParams(
        selectedAddress,
        contractAddress,
        amount,
        closeRemainderTo,
        note,
        params
      );

      const txn2 = algosdk.makeApplicationNoOpTxn(
        selectedAddress,
        params,
        appId,
        [enc.encode("setup")],
        accounts,
        foreignApps,
        foreignAssets
      );

      const txnsArray = [txn1, txn2];
      const groupID = algosdk.computeGroupID(txnsArray);
      for (let i = 0; i < 2; i++) txnsArray[i].group = groupID;

      const myAlgoConnect = new MyAlgoConnect();
      const signedTxns = await myAlgoConnect.signTransaction(
        txnsArray.map((txn) => txn.toByte())
      );
      const response = await algodClient
        .sendRawTransaction(signedTxns.map((tx) => tx.blob))
        .do();

      console.log(response["txId"]);
    } catch (err) {
      console.error(err);
    }
  };

  const OptInPool = async () => {
    try {
      const params = await algodClient.getTransactionParams().do();

      const txn1 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        amount: 0,
        from: selectedAddress,
        suggestedParams: {
          ...params,
        },
        to: selectedAddress,
        assetIndex: yesToken,
      });

      const txn2 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        amount: 0,
        from: selectedAddress,
        suggestedParams: {
          ...params,
        },
        to: selectedAddress,
        assetIndex: noToken,
      });

      const txn3 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        amount: 0,
        from: selectedAddress,
        suggestedParams: {
          ...params,
        },
        to: selectedAddress,
        assetIndex: poolToken,
      });

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

      console.log(response["txId"]);
    } catch (err) {
      console.error(err);
    }
  };

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
        {selectedAddress ? (
          <>
            <Button
              onClick={() => {
                if (selectedAddress) return setupAmm();
              }}
              m={4}
              radius="xl"
            >
              Start AMM
            </Button>
            <Button
              onClick={() => {
                if (selectedAddress) return OptInPool();
              }}
              m={4}
              radius="xl"
            >
              Opt In to Pool assets
            </Button>
          </>
        ) : (
          <Button
            onClick={() => {
              return connectToMyAlgo(setAddresses, selectAddress);
            }}
            m={4}
            radius="xl"
          >
            {selectedAddress ? "Swap" : "Connect to wallet"}
          </Button>
        )}
      </Stack>
    </Paper>
  );
};

export default Config;
