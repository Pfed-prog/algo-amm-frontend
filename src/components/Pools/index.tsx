import { Paper, Stack, Button } from "@mantine/core";
import { useState } from "react";
import { connectToMyAlgo } from "../../lib/connectWallet";
import { useStore } from "../../store";

import MyAlgoConnect from "@randlabs/myalgo-connect";
import algosdk from "algosdk";

const algodServer = "https://testnet-algorand.api.purestake.io/ps2";
const algodPort = "";
const algodToken = {
  "X-API-Key": "megX3xJK3V4p3ajxgjedO3EGhHcb0STgaWGpKUzh",
};

const assetId = 10458941;
const appId = 99469003;
const Contract = "LULYN25HTMQ4JUCBQKSU7P2T7YWCNXMBLBQBPE7BKK2OSXJSZY4BMKDCIE";

const Pools = () => {
  const setAddresses = useStore((state) => state.setAddresses);
  const selectAddress = useStore((state) => state.selectAddress);
  const selectedAddress = useStore((state) => state.selectedAddress);

  const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);
  const OptIn = async () => {
    try {
      const params = await algodClient.getTransactionParams().do();

      const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        suggestedParams: {
          ...params,
        },
        from: selectedAddress,
        to: selectedAddress,
        assetIndex: 10458941,
        amount: 0,
      });

      const myAlgoConnect = new MyAlgoConnect();
      const signedTxn = await myAlgoConnect.signTransaction(txn.toByte());
      const response = await algodClient
        .sendRawTransaction(signedTxn.blob)
        .do();
      console.log(response);
    } catch (err) {
      console.error(err);
    }
  };

  const setupAmm = async () => {
    try {
      const params = await algodClient.getTransactionParams().do();

      const enc = new TextEncoder();

      const accounts = undefined;
      const foreignApps = undefined;
      const foreignAssets = [assetId];
      const closeRemainderTo = undefined;
      const revocationTarget = undefined;
      const note = undefined;
      const amount = 1000000;

      const txn1 = algosdk.makePaymentTxnWithSuggestedParams(
        selectedAddress,
        Contract,
        amount,
        closeRemainderTo,
        note,
        params
      );
      /*       const txn1 = algosdk.makeAssetTransferTxnWithSuggestedParams(
        selectedAddress,
        Contract,
        closeRemainderTo,
        revocationTarget,
        +amount,
        note,
        assetId,
        params
      ); */

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
      console.log(response);
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
        <Button
          onClick={() => {
            if (selectedAddress) return OptIn();
            if (!selectedAddress)
              return connectToMyAlgo(setAddresses, selectAddress);
          }}
          m={4}
          radius="xl"
        >
          {selectedAddress ? "Opt In to USDC" : "Connect to wallet"}
        </Button>

        <Button
          onClick={() => {
            if (selectedAddress) return setupAmm();
            if (!selectedAddress)
              return connectToMyAlgo(setAddresses, selectAddress);
          }}
          m={4}
          radius="xl"
        >
          {selectedAddress ? "SetUp AMM" : "Connect to wallet"}
        </Button>
      </Stack>
    </Paper>
  );
};

export default Pools;
