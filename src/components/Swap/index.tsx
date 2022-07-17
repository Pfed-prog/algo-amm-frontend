import { Paper, Stack, Button, Group, Badge } from "@mantine/core";
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
  const tokenFundingReserves = useStore((state) => state.tokenFundingReserves);
  const result = useStore((state) => state.result);
  const selectedAddress = useStore((state) => state.selectedAddress);
  const setAddresses = useStore((state) => state.setAddresses);
  const selectAddress = useStore((state) => state.selectAddress);
  const setYesToken = useStore((state) => state.setYesToken);
  const setNoToken = useStore((state) => state.setNoToken);
  const setPoolToken = useStore((state) => state.setPoolToken);

  const setYesTokenReserves = useStore((state) => state.setYesTokenReserves);
  const setNoTokenReserves = useStore((state) => state.setNoTokenReserves);
  const setTokenFundingReserves = useStore(
    (state) => state.setTokenFundingReserves
  );
  const setResult = useStore((state) => state.setResult);

  const [coin_2, setCoin_2] = useState<Coin>({
    token: "Yes",
  });

  const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

  const amountOut = (
    reservesIn: number,
    reservesA: number,
    reservesB: number
  ) => {
    const reservesOut = (reservesIn * reservesA) / (reservesIn + reservesB);
    return reservesOut;
  };

  const whoWon = () => {
    if (result == yesToken) {
      return "Yes";
    }
    if (result == noToken) {
      return "No";
    }
  };

  useEffect(() => {
    const queryGlobal = async () => {
      const app = await algodClient.getApplicationByID(appId).do();
      for (const [key, value] of Object.entries(
        app["params"]["global-state"]
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
        if (value["key"] == "eWVzX3Rva2Vuc19yZXNlcnZlcw==") {
          //yes_token_reserves
          setYesTokenReserves(value["value"]["uint"]);
        }
        if (value["key"] == "bm9fdG9rZW5zX3Jlc2VydmVz") {
          //no_tokens_reserves
          setNoTokenReserves(value["value"]["uint"]);
        }
        if (value["key"] == "dG9rZW5fZnVuZGluZ19yZXNlcnZlcw==") {
          setTokenFundingReserves(value["value"]["uint"]);
        }
        if (value["key"] == "cmVzdWx0") {
          setResult(value["value"]["uint"]);
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

  const redeem = async (tokenAmount: number, tokenName: string) => {
    try {
      console.log(12);
      let tokenId = 0;
      if (tokenName == "Yes") {
        tokenId = yesToken;
      }
      if (tokenName == "No") {
        tokenId = noToken;
      }

      const params = await algodClient.getTransactionParams().do();

      const enc = new TextEncoder();

      const accounts = undefined;
      const foreignApps = undefined;
      const foreignAssets = [usdcId, tokenId];
      const closeRemainderTo = undefined;
      const note = undefined;
      const amount = 2000;

      tokenAmount = tokenAmount * 1000000;

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
        assetIndex: tokenId,
        amount: tokenAmount,
        note: note,
      });

      const txn3 = algosdk.makeApplicationNoOpTxn(
        selectedAddress,
        params,
        appId,
        [enc.encode("redeem")],
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
        {result > 0 ? (
          <Group>
            <Badge
              size="xl"
              radius="xl"
              color="teal"
              component="a"
              sx={{ paddingLeft: 13 }}
            >
              <h3> Winner: {whoWon()}</h3>
            </Badge>
            <Badge
              size="lg"
              radius="xl"
              variant="gradient"
              component="a"
              sx={{ paddingRight: 13 }}
            >
              <h3>
                Funding left to withdraw: {tokenFundingReserves / 1000000}
              </h3>
            </Badge>
          </Group>
        ) : (
          <Group>
            <Badge size="xl" radius="xl" color="teal" sx={{ paddingLeft: 13 }}>
              <h3>
                Yes Reserves: {yesTokenReserves / 1000000}; No Reserves
                {noTokenReserves / 1000000}
              </h3>
            </Badge>
            <Badge variant="outline" sx={{ paddingLeft: 3 }}>
              Funding left to withdraw: {tokenFundingReserves / 1000000}
            </Badge>
          </Group>
        )}

        <AmountContainer coin={coin_2} setCoin={setCoin_2} />
        {result == 0 ? (
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
        ) : (
          ""
        )}
        {selectedAddress && result > 0 ? (
          <Button
            onClick={() => {
              if (!selectedAddress)
                return connectToMyAlgo(setAddresses, selectAddress);
              if (selectedAddress && coin_2?.amount)
                return redeem(coin_2?.amount, coin_2?.token);
            }}
            m={4}
            radius="xl"
          >
            Redeem
          </Button>
        ) : (
          ""
        )}
      </Stack>
    </Paper>
  );
};

export default Swap;
