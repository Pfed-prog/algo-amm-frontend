import { Paper, Stack, Button } from "@mantine/core";
import { useState } from "react";
import { ArrowDown } from "tabler-icons-react";
import { connectToMyAlgo } from "../../lib/connectWallet";
import { useStore } from "../../store";
import AmountContainer from "./AmountContainer";
import { Coin } from "./types/pair";

const Swap = () => {
  const setAddresses = useStore((state) => state.setAddresses);
  const selectAddress = useStore((state) => state.selectAddress);
  const selectedAddress = useStore((state) => state.selectedAddress);
  const [algoCoin, setAlgoCoin] = useState<Coin>({
    token: "ALGO",
  });
  const [coin_2, setCoin_2] = useState<Coin>();
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
      </Stack>
    </Paper>
  );
};

export default Swap;
