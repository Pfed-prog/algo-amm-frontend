import {
  Header,
  MediaQuery,
  Burger,
  useMantineTheme,
  Title,
  Group,
} from "@mantine/core";
import { useStore } from "../../store";
import AccountButton from "../AccountButton";

const Heading = () => {
  const theme = useMantineTheme();
  const toggleOpen = useStore((state) => state.toggleOpen);
  const opened = useStore((state) => state.open);
  return (
    <Header height={70} p="md">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: "100%",
          justifyContent: "space-between",
        }}
      >
        <Group>
          <MediaQuery largerThan="sm" styles={{ display: "none" }}>
            <Burger
              opened={opened}
              onClick={() => toggleOpen()}
              size="sm"
              color={theme.colors.gray[6]}
              mr="xl"
            />
          </MediaQuery>

          <Title sx={{ fontFamily: "Expletus Sans" }}>Algo AMM</Title>
        </Group>

        <AccountButton />
      </div>
    </Header>
  );
};

export default Heading;
