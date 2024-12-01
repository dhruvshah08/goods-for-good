import React, { useState } from "react";
import { TextField, Button, Container, Typography, Box, createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import { useNavigate } from "react-router-dom";
const theme = createTheme({
  typography: {
    fontFamily: "Georgia",
  },
});
function LoginPage() {
  // State variables for email, password, and logged-in username
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/home", { state: { email: email } });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>
    <Container
      maxWidth="md"
      style={{
        marginTop: "150px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography
        variant="h2"
        component="h2"
        color="primary"
        fontWeight={"bold"}
        gutterBottom
      >
        Goods for Good
      </Typography>
      <Typography
        variant="h6"
        component="h6"
        color="textSecondary"
        textAlign="center"
        mb={3}
      >
        Reducing Distance to Donations
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 4,
          marginTop:"25px",
          boxShadow: 3,
          borderRadius: 2,
          bgcolor: "white",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <Typography variant="h5" component="h2" fontFamily={"Roboto"} gutterBottom>
          Login
        </Typography>
        
       
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          label="Password"
          variant="outlined"
          fullWidth
          margin="normal"
          type="password"
          value={password}
         
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleLogin}
          fullWidth
          sx={{
            marginTop: 2,
            borderRadius: "25px",
            textTransform: "none",
            fontWeight: "bold",
            fontSize: "16px",
            padding: 1,
          }}
        >
          Login
        </Button>
        
      </Box>
    </Container>
    </ThemeProvider>
  );
  
}

export default LoginPage;
