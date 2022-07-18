import { Paper, Stack, Button } from "@mantine/core";
import { useEffect } from "react";
import MyAlgoConnect from "@randlabs/myalgo-connect";
import algosdk from "algosdk";

import { useStore } from "../../store";
import { appId, usdcId, contractAddress } from "../../contracts";
import { connectToMyAlgo } from "../../lib/connectWallet";

const algodServer = "https://testnet-algorand.api.purestake.io/ps2";
const algodPort = "";
const algodToken = {
  "X-API-Key": "megX3xJK3V4p3ajxgjedO3EGhHcb0STgaWGpKUzh",
};

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
  const setYesTokenReserves = useStore((state) => state.setYesTokenReserves);
  const setNoTokenReserves = useStore((state) => state.setNoTokenReserves);

  const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

  useEffect(() => {
    const queryGlobal = async () => {
      const app = await algodClient.getApplicationByID(appId).do();
      for (const [key, value] of Object.entries(
        app["params"]["global-state"]
      )) {
        // @ts-ignore
        if (value["key"] == "eWVzX3Rva2VuX2tleQ==") {
          //yes_token_key
          // @ts-ignore
          setYesToken(value["value"]["uint"]);
        }
        // @ts-ignore
        if (value["key"] == "bm9fdG9rZW5fa2V5") {
          //no_token_key
          // @ts-ignore
          setNoToken(value["value"]["uint"]);
        }
        // @ts-ignore
        if (value["key"] == "cG9vbF90b2tlbl9rZXk=") {
          //pool_token_key
          // @ts-ignore
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
  /*   const OptIn = async () => {
    try {
      const params = await algodClient.getTransactionParams().do();

      const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        suggestedParams: {
          ...params,
        },
        from: selectedAddress,
        to: selectedAddress,
        assetIndex: usdcId,
        amount: 0,
      });

      const myAlgoConnect = new MyAlgoConnect();
      const signedTxn = await myAlgoConnect.signTransaction(txn.toByte());
      const response = await algodClient
        .sendRawTransaction(signedTxn.blob)
        .do();
      let transactionResponse = await algodClient
        .pendingTransactionInformation(response.txId)
        .do();

      console.log(transactionResponse);
      //console.log(response);
    } catch (err) {
      console.error(err);
    }
  };
 */
  /*   const queryGlobal = async () => {
    const app = await algodClient.getApplicationByID(appId).do();
    for (const [key, value] of Object.entries(app["params"]["global-state"])) {
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
      if (value["key"] == "dG9rZW5fZnVuZGluZ19yZXNlcnZlcw==") {
        //token_funding_reserves
        console.log("token_funding_reserves", value["value"]["uint"]);
      }
      if (value["key"] == "bm9fdG9rZW5zX291dHN0YW5kaW5nX2tleQ==") {
        //no_tokens_outstanding_key
        console.log(value, value["value"]["uint"]);
      }
      if (value["key"] == "cmVzdWx0") {
        //result
        console.log(value, value["value"]["uint"]);
      }
      if (value["key"] == "Y3JlYXRvcl9rZXk=") {
        //creator_key
        console.log(value, value["value"]["uint"]);
      }
      if (value["key"] == "cG9vbF9mdW5kaW5nX3Jlc2VydmVz") {
        //pool_funding_reserves
        console.log(value["value"]["uint"]);
      }
      if (value["key"] == "cG9vbF90b2tlbnNfb3V0c3RhbmRpbmdfa2V5") {
        //pool_tokens_outstanding_key
        console.log(value["value"]["uint"]);
      }
      if (value["key"] == "dG9rZW5fZnVuZGluZ19rZXk=") {
        //token_funding_key
        console.log(value["value"]["uint"]);
      }
      if (value["key"] == "bWluX2luY3JlbWVudF9rZXk=") {
        //min_increment_key
        console.log("min_increment_key", value["value"]["uint"]);
      }
    }
  }; */

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
