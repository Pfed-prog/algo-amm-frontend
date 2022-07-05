import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppShell, Navbar, Header } from "@mantine/core";
import HomePage from "./pages/Home";
import NotFoundPage from "./pages/NotFound";
function App() {
  return (
    <BrowserRouter>
      <AppShell
        padding="md"
        header={
          <Header height={60} p="xs">
            {/* Header content */}
          </Header>
        }
        styles={(theme) => ({
          main: {
            backgroundColor:
              theme.colorScheme === "dark"
                ? theme.colors.dark[8]
                : theme.colors.gray[0],
          },
        })}
      >
        <div style={{ flexGrow: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </AppShell>
    </BrowserRouter>
  );
}

export default App;
