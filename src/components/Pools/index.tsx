import { Paper, Stack, Button, Group, Badge, Text } from "@mantine/core";
import { useState, useEffect } from "react";
import AmountContainer from "./AmountContainer";
import { connectToMyAlgo } from "../../lib/connectWallet";
import { useStore } from "../../store";
import { appId, usdcId, contractAddress } from "../../contracts";
import { Coin } from "./types/pair";
import MyAlgoConnect from "@randlabs/myalgo-connect";
import algosdk from "algosdk";

const algodServer = "https://testnet-algorand.api.purestake.io/ps2";
const algodPort = "";
const algodToken = {
  "X-API-Key": "megX3xJK3V4p3ajxgjedO3EGhHcb0STgaWGpKUzh",
};

const Pools = () => {
  const [algoCoin, setAlgoCoin] = useState<Coin>({
    token: "USDC",
  });
  const yesToken = useStore((state) => state.yesToken);
  const noToken = useStore((state) => state.noToken);
  const poolToken = useStore((state) => state.poolToken);
  const result = useStore((state) => state.result);
  const poolFundingReserves = useStore((state) => state.poolFundingReserves);
  const poolTokensOutstanding = useStore(
    (state) => state.poolTokensOutstanding
  );
  const selectedAddress = useStore((state) => state.selectedAddress);
  const setAddresses = useStore((state) => state.setAddresses);
  const selectAddress = useStore((state) => state.selectAddress);
  const setYesToken = useStore((state) => state.setYesToken);
  const setNoToken = useStore((state) => state.setNoToken);
  const setPoolToken = useStore((state) => state.setPoolToken);
  const setPoolFundingReserves = useStore(
    (state) => state.setPoolFundingReserves
  );
  const setPoolTokensOutstanding = useStore(
    (state) => state.setPoolTokensOutstanding
  );
  const setResult = useStore((state) => state.setResult);

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
        // @ts-ignore
        if (value["key"] == "cmVzdWx0") {
          // @ts-ignore
          setResult(value["value"]["uint"]);
        }
        // @ts-ignore
        if (value["key"] == "cG9vbF9mdW5kaW5nX3Jlc2VydmVz") {
          // @ts-ignore
          setPoolFundingReserves(value["value"]["uint"]);
        }
        // @ts-ignore
        if (value["key"] == "cG9vbF90b2tlbnNfb3V0c3RhbmRpbmdfa2V5") {
          // @ts-ignore
          setPoolTokensOutstanding(value["value"]["uint"]);
        }
      }
    };
    queryGlobal();
  }, []);

  const supplyAmm = async (usdcAmount: number) => {
    try {
      const params = await algodClient.getTransactionParams().do();

      const enc = new TextEncoder();

      const accounts = undefined;
      const foreignApps = undefined;
      const foreignAssets = [usdcId, noToken, yesToken, poolToken];
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
        [enc.encode("supply")],
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

  const withdrawAmm = async (poolTokenAmount: number) => {
    try {
      const params = await algodClient.getTransactionParams().do();

      const enc = new TextEncoder();

      const accounts = undefined;
      const foreignApps = undefined;
      const foreignAssets = [usdcId, poolToken];
      const closeRemainderTo = undefined;
      const note = undefined;
      const amount = 2000;

      poolTokenAmount = poolTokenAmount * 1000000;

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
        assetIndex: poolToken,
        amount: poolTokenAmount,
        note: note,
      });

      const txn3 = algosdk.makeApplicationNoOpTxn(
        selectedAddress,
        params,
        appId,
        [enc.encode("withdraw")],
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
          <>
            <Badge size="xl" radius="xl" color="gold" component="a">
              Reserves:
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
              USDC: {poolFundingReserves / 1000000}
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
              LP Tokens: {poolTokensOutstanding / 1000000}
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
              Pool USDC Reserves: {poolFundingReserves / 1000000}
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
              LP Tokens Outstanding: {poolTokensOutstanding / 1000000}
            </Text>
          </>
        )}
        <AmountContainer coin={algoCoin} setCoin={setAlgoCoin} />

        {selectedAddress ? (
          <>
            {result > 0 ? (
              <Button
                onClick={() => {
                  if (selectedAddress && algoCoin.amount)
                    return withdrawAmm(algoCoin.amount);
                }}
                m={4}
                radius="xl"
              >
                Withdraw from AMM
                {algoCoin.amount
                  ? (algoCoin.amount * (poolFundingReserves / 1000000)) /
                      (poolTokensOutstanding / 1000000) +
                    "USDC"
                  : ""}
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => {
                    if (selectedAddress && algoCoin.amount)
                      return supplyAmm(algoCoin.amount);
                  }}
                  m={4}
                  radius="xl"
                >
                  Supply to AMM {algoCoin.amount} {algoCoin.token}
                </Button>
                <Button
                  onClick={() => {
                    if (selectedAddress && algoCoin.amount)
                      return withdrawAmm(algoCoin.amount);
                  }}
                  m={4}
                  radius="xl"
                >
                  Withdraw from AMM{" "}
                  {algoCoin.amount && poolTokensOutstanding
                    ? (algoCoin?.amount * (poolFundingReserves / 1000000)) /
                        (poolTokensOutstanding / 1000000) +
                      " USDC"
                    : ""}
                </Button>
              </>
            )}
          </>
        ) : (
          <Button
            onClick={() => {
              if (!selectedAddress)
                return connectToMyAlgo(setAddresses, selectAddress);
            }}
            m={4}
            radius="xl"
          >
            Connect to wallet
          </Button>
        )}
      </Stack>
    </Paper>
  );
};

export default Pools;
