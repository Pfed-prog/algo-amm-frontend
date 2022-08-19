import { Paper, Stack, Button } from "@mantine/core";
import { useEffect } from "react";

import { useStore, useResponse } from "../../store/store";
import { connectToMyAlgo } from "../../utils/connectWallet";
import {
  setupAmm,
  OptInPool,
  queryGlobalConfig,
} from "../../services/transactions";

const Config = () => {
  const setResponse = useResponse((state) => state.setResponse);

  const selectedAddress = useStore((state) => state.selectedAddress);
  const yesToken = useStore((state) => state.yesToken);
  const noToken = useStore((state) => state.noToken);
  const poolToken = useStore((state) => state.poolToken);

  const setYesToken = useStore((state) => state.setYesToken);
  const setNoToken = useStore((state) => state.setNoToken);
  const setPoolToken = useStore((state) => state.setPoolToken);
  const setAddresses = useStore((state) => state.setAddresses);
  const selectAddress = useStore((state) => state.selectAddress);

  useEffect(() => {
    queryGlobalConfig(setYesToken, setNoToken, setPoolToken);
  }, []);

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
                if (selectedAddress)
                  return setupAmm(selectedAddress, setResponse);
              }}
              m={4}
              radius="xl"
            >
              Start AMM
            </Button>
            <Button
              onClick={() => {
                if (selectedAddress)
                  return OptInPool(
                    selectedAddress,
                    yesToken,
                    noToken,
                    poolToken,
                    setResponse
                  );
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
