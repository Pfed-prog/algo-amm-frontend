import {
  Header,
  MediaQuery,
  Burger,
  useMantineTheme,
  Text,
  Group,
} from "@mantine/core";
import { Link } from "react-router-dom";

import { useStore } from "../../store/store";
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

          <Text
            sx={{ fontFamily: "Expletus Sans" }}
            variant="link"
            component={Link}
            size="xl"
            weight={700}
            to={"/"}
          >
            Algo AMM
          </Text>
        </Group>

        <AccountButton />
      </div>
    </Header>
  );
};

export default Heading;
