import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { AuthProvider } from "./contexts/AuthContext";
import AppRoutes from "./routes";
import theme from "./theme";
import { useTokenRefresh } from "./hooks/useTokenRefresh";

function App() {
  const TokenRefresher = () => {
    useTokenRefresh();
    return null;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <TokenRefresher />
          <AppRoutes />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
