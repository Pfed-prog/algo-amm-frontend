import { Group, NumberInput, Paper, Select } from "@mantine/core";

import { AmountContainerProps } from "../../store/types";

const AmountContainer = ({ coin, setCoin }: AmountContainerProps) => {
  return (
    <Paper radius="xl" shadow="md" withBorder py={10}>
      <Group position="apart" spacing="xs">
        <NumberInput
          min={0}
          defaultValue={0}
          precision={6}
          value={coin?.amount}
          onChange={(e) => setCoin({ ...coin, amount: e })}
          size="xl"
          variant="unstyled"
          pl={10}
        />
        <Select
          data={["USDC"]}
          label=""
          placeholder={coin?.token === "USDC" ? "USDC" : "Select a Token"}
          radius="xl"
          mx="lg"
        />
      </Group>
    </Paper>
  );
};

export default AmountContainer;
