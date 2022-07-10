import { Group, NumberInput, Paper, Select } from "@mantine/core";
import { Coin } from "./types/pair";

interface AmountContainerProps {
  coin?: Coin;
  setCoin: Function;
}
const AmountContainer = ({ coin, setCoin }: AmountContainerProps) => {
  return (
    <Paper radius="xl" shadow="md" withBorder py={10}>
      <Group position="apart" spacing="xs">
        <NumberInput
          min={0}
          placeholder="0.0"
          value={coin?.amount}
          onChange={(e) => setCoin({ amount: e, ...coin })}
          size="xl"
          hideControls
          variant="unstyled"
          pl={10}
        />
        <Select
          data={["ETH", "BTC", "ALGO"]}
          label=""
          placeholder={coin?.token === "ALGO" ? "ALGO" : "Select a Token"}
          radius="xl"
          mx="lg"
          disabled={coin?.token === "ALGO"}
        />
      </Group>
    </Paper>
  );
};

export default AmountContainer;
