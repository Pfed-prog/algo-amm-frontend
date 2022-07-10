import { Paper, Stack, Button } from "@mantine/core";
import { useState } from "react";
import { ArrowDown } from "tabler-icons-react";
import AmountContainer from "./AmountContainer";
import { Coin } from "./types/pair";

const Swap = () => {
  const [coin_1, setCoin_1] = useState<Coin>();
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
        <AmountContainer />
        <Button mx="auto" radius="xl" variant="outline">
          <ArrowDown />
        </Button>
        <AmountContainer />
      </Stack>
      <Button>{}</Button>
    </Paper>
  );
};

export default Swap;
