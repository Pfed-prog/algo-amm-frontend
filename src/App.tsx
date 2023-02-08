import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppShell, useMantineTheme } from "@mantine/core";

import Heading from "./components/Layout/Heading";
import Home from "./pages/Home";
import NotFoundPage from "./pages/NotFound";
import Market from "./pages/Market";

function App() {
  const theme = useMantineTheme();
  return (
    <BrowserRouter>
      <AppShell
        styles={{
          main: {
            background:
              theme.colorScheme === "dark"
                ? theme.colors.dark[8]
                : theme.colors.gray[0],
          },
        }}
        navbarOffsetBreakpoint="sm"
        asideOffsetBreakpoint="sm"
        fixed
        header={<Heading />}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/market/:id" element={<Market />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

export default App;
