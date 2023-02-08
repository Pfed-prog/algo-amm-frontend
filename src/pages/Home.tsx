import { Paper, Text, Box } from "@mantine/core";
import { Link } from "react-router-dom";
import { AMMs } from "../contracts";

const PoolsPage = () => {
  return (
    <>
      <Box
        mx="auto"
        sx={{
          maxWidth: 1500,
          gap: 20,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 5fr))",
          gridTemplateRows: "masonry",
        }}
      >
        {Object.entries(AMMs).map(([index, item]) => {
          return (
            <Paper
              component="div"
              withBorder
              radius="lg"
              shadow="md"
              p="md"
              sx={{ cursor: "pointer" }}
              key={index}
            >
              <Text
                align="center"
                mt="sm"
                lineClamp={1}
                size="xl"
                variant="link"
                component={Link}
                to={`/market/${item.appId}`}
              >
                {item.question}
              </Text>
            </Paper>
          );
        })}
      </Box>
    </>
  );
};

export default PoolsPage;
