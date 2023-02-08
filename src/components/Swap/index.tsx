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

import AmountContainer from "./AmountContainer";
import { connectToMyAlgo } from "../../utils/connectWallet";
import { swap, redeem, queryGlobalSwap } from "../../services/transactions";
import { useStore, useResponse } from "../../store/store";
import { Coin } from "../../store/types";

const Swap = (contractAddress: string, appId: number) => {
  const response = useResponse((state) => state.response);
  const setResponse = useResponse((state) => state.setResponse);

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
    queryGlobalSwap(
      appId,
      setYesToken,
      setNoToken,
      setPoolToken,
      setYesTokenReserves,
      setNoTokenReserves,
      setTokenFundingReserves,
      setPoolFundingReserves,
      setResult
    );
  }, [response]);

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
              ) : null}
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
                  return swap(
                    contractAddress,
                    appId,
                    coin_2?.amount,
                    coin_2?.token,
                    poolToken,
                    yesToken,
                    noToken,
                    selectedAddress,
                    setResponse
                  );
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
            ) : null}
          </>
        ) : (
          <Button
            onClick={() => {
              if (!selectedAddress)
                return connectToMyAlgo(setAddresses, selectAddress);
              if (selectedAddress && coin_2?.amount)
                return redeem(
                  contractAddress,
                  appId,
                  coin_2?.amount,
                  coin_2?.token,
                  yesToken,
                  noToken,
                  selectedAddress,
                  setResponse
                );
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
