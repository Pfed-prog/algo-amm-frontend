import { Group, NumberInput, Paper, Select } from "@mantine/core";

const AmountContainer = () => {
  return (
    <Paper radius="xl" shadow="md" withBorder py={10}>
      <Group position="apart" spacing="xs">
        <NumberInput
          min={0}
          placeholder="0.0"
          size="xl"
          hideControls
          variant="unstyled"
          pl={10}
        />
        <Select
          data={["ETH", "BTC", "ALGO"]}
          label=""
          placeholder="Select a Token"
          radius="xl"
          mx="lg"
        />
      </Group>
    </Paper>
  );
};

export default AmountContainer;
