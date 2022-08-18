import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppShell, useMantineTheme } from "@mantine/core";

import Sidebar from "./components/Layout/Sidebar";
import Heading from "./components/Layout/Heading";
import NotFoundPage from "./pages/NotFound";
import Pools from "./pages/Pools";
import Swap from "./pages/Swap";
import Config from "./pages/Config";

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
        navbar={<Sidebar />}
        header={<Heading />}
      >
        <Routes>
          <Route path="/" element={<Swap />} />
          <Route path="/swap" element={<Swap />} />
          <Route path="/pools" element={<Pools />} />
          <Route path="/config" element={<Config />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

export default App;
