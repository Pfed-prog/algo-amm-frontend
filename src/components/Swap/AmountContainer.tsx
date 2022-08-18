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
          data={["Yes", "No"]}
          label=""
          placeholder={coin?.token === "Yes" ? "Yes" : "Select a Token"}
          onChange={(e) => setCoin({ ...coin, token: e })}
          radius="xl"
          mx="lg"
          disabled={coin?.token === "USDC"}
        />
      </Group>
    </Paper>
  );
};

export default AmountContainer;
