import {
  Paper,
  Stack,
  Button,
  Group,
  Badge,
  Text,
  Center,
} from "@mantine/core";
import { useEffect, useState } from "react";
import MyAlgoConnect from "@randlabs/myalgo-connect";
import algosdk from "algosdk";

import { connectToMyAlgo } from "../../utils/connectWallet";
import { connectAlgod } from "../../utils/connectAlgod";
import { useStore } from "../../store/store";
import { Coin, GlobalStateIndeces } from "../../store/types";
import { appId, usdcId, contractAddress } from "../../contracts";
import AmountContainer from "./AmountContainer";

const Swap = () => {
  const [response, setResponse] = useState();
  const yesToken = useStore((state) => state.yesToken);
  const noToken = useStore((state) => state.noToken);
  const poolToken = useStore((state) => state.poolToken);
  const yesTokenReserves = useStore((state) => state.yesTokenReserves);
  const noTokenReserves = useStore((state) => state.noTokenReserves);
  const tokenFundingReserves = useStore((state) => state.tokenFundingReserves);
  const poolFundingReserves = useStore((state) => state.poolFundingReserves);
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
  const setPoolFundingReserves = useStore(
    (state) => state.setPoolFundingReserves
  );

  const setResult = useStore((state) => state.setResult);

  const [coin_2, setCoin_2] = useState<Coin>({
    token: "Yes",
  });

  const algodClient = connectAlgod();

  const amountOut = (reservesIn: number, tokenName: string) => {
    if (tokenName == "Yes") {
      const reservesA = yesTokenReserves / 1000000;
      const reservesB = noTokenReserves / 1000000;
      const reservesOut = (reservesIn * reservesA) / (reservesIn + reservesB);
      return reservesOut.toFixed(6);
    }
    if (tokenName == "No") {
      const reservesA = noTokenReserves / 1000000;
      const reservesB = yesTokenReserves / 1000000;
      const reservesOut = (reservesIn * reservesA) / (reservesIn + reservesB);
      return reservesOut.toFixed(6);
    }
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
        app["params"]["global-state"] as GlobalStateIndeces
      )) {
        console.log(123);

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

        if (value["key"] == "cG9vbF9mdW5kaW5nX3Jlc2VydmVz") {
          setPoolFundingReserves(value["value"]["uint"]);
        }

        if (value["key"] == "cmVzdWx0") {
          setResult(value["value"]["uint"]);
        }
      }
    };
    queryGlobal();
  }, [response]);

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

      setResponse(response);

      console.log("https://testnet.algoexplorer.io/tx/" + response["txId"]);
    } catch (err) {
      console.error(err);
    }
  };

  const redeem = async (tokenAmount: number, tokenName: string) => {
    try {
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
      setResponse(response);

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
          <>
            <Badge size="xl" radius="xl" color="teal">
              <h3> Winner: {whoWon()}</h3>
            </Badge>

            <Text
              component="span"
              align="center"
              variant="gradient"
              gradient={{ from: "indigo", to: "cyan", deg: 45 }}
              size="xl"
              weight={700}
              style={{ fontFamily: "Greycliff CF, sans-serif" }}
            >
              USDC left to withdraw:{" "}
              {(tokenFundingReserves / 1000000).toFixed(6)}
            </Text>

            <Text
              component="span"
              align="center"
              variant="gradient"
              gradient={{ from: "indigo", to: "cyan", deg: 45 }}
              size="xl"
              weight={700}
              style={{ fontFamily: "Greycliff CF, sans-serif" }}
            >
              {whoWon()} left to withdraw:{" "}
              {(tokenFundingReserves / 1000000 / 2).toFixed(6)}
            </Text>
          </>
        ) : (
          <>
            <Text
              component="span"
              align="center"
              variant="gradient"
              gradient={{ from: "indigo", to: "cyan", deg: 45 }}
              size="xl"
              weight={700}
              style={{ fontFamily: "Greycliff CF, sans-serif" }}
            >
              Token Funding Reserves:{" "}
              {(tokenFundingReserves / 1000000).toFixed(6)} USDC
            </Text>
            <Text
              component="span"
              align="center"
              variant="gradient"
              gradient={{ from: "indigo", to: "cyan", deg: 45 }}
              size="xl"
              weight={700}
              style={{ fontFamily: "Greycliff CF, sans-serif" }}
            >
              Pool Funding Reserves:{" "}
              {(poolFundingReserves / 1000000).toFixed(6)} USDC
            </Text>
            <Group position="center">
              <Badge size="xl" radius="xl" color="teal">
                Yes Reserves: {(yesTokenReserves / 1000000).toFixed(6)}
              </Badge>
              <Badge size="xl" radius="xl" color="teal">
                No Reserves: {(noTokenReserves / 1000000).toFixed(6)}
              </Badge>
            </Group>
            <Center>
              {noTokenReserves ? (
                <Badge size="xl" radius="xl" color="indigo" variant="light">
                  Odds:{" "}
                  {(
                    (noTokenReserves / (yesTokenReserves + noTokenReserves)) *
                    100
                  ).toFixed(2)}{" "}
                  % Yes
                </Badge>
              ) : (
                ""
              )}
            </Center>
          </>
        )}

        <AmountContainer coin={coin_2} setCoin={setCoin_2} />
        {result == 0 ? (
          <>
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

            {coin_2.amount ? (
              <Text
                component="span"
                align="center"
                variant="gradient"
                gradient={{ from: "indigo", to: "cyan", deg: 45 }}
                size="xl"
                weight={700}
                style={{ fontFamily: "Greycliff CF, sans-serif" }}
              >
                {amountOut(coin_2.amount, coin_2.token)}
              </Text>
            ) : (
              ""
            )}
          </>
        ) : (
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
            {selectedAddress ? "Redeem" : "Connect to wallet"}
          </Button>
        )}
      </Stack>
    </Paper>
  );
};

export default Swap;
