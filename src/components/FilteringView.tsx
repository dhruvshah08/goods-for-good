import {
  Box,
  Button,
  Container,
  Grid,
  Grid2,
  TextField,
  Typography,
} from "@mui/material";
import * as React from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";

const causes = [
  "All Causes",
  "Coastal Flood",
  "Debris Flow",
  "Drought",
  "Dust Storm",
  "Excessive Heat",
  "Flash Flood",
  "Flood",
  "Funnel Cloud",
  "Hail",
  "Heat",
  "Heavy Rain",
  "High Surf",
  "High Wind",
  "Lightning",
  "Marine Hail",
  "Marine Thunderstorm Wind",
  "Marine Tropical Depression",
  "Marine Tropical Storm",
  "Rip Current",
  "Strong Wind",
  "Thunderstorm Wind",
  "Tornado",
  "Tropical Depression",
  "Tropical Storm",
  "Waterspout",
  "Wildfire",
];

interface FilteringViewProps {
  email?: string;
  selectedCause: string;
  setSelectedCause: (cause: string) => void;
  query: string;
  setQuery: (query: string) => void;
}

export default function FilteringView({
  email,
  selectedCause,
  setSelectedCause,
  query,
  setQuery,
}: FilteringViewProps) {
  const handleCauseChange = (event: SelectChangeEvent) => {
    setSelectedCause(event.target.value);
  };

  const [textValue, setTextValue] = React.useState("");
  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTextValue(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    setQuery(textValue);
  };

  return (
    <Container className="filterHolder" maxWidth="md" sx={{ mt: 4 }}>
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
        marginTop={"-20px"}
        mb={3}
      >
        Reducing Distance to Donations
      </Typography>
      <Typography
        variant="h4"
        color="textSecondary"
        component="h4"
        sx={{ mb: 2 }}
      >
        Welcome Back {email}!
      </Typography>

      <Grid
        container
        spacing={3}
        direction="column"
        justifyContent="center"
        marginTop={"20px"}
      >
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth sx={{ mb: 1, width: "55%" }}>
            <InputLabel id="demo-simple-select-autowidth-label">
              Cause
            </InputLabel>
            <Select
              labelId="demo-simple-select-autowidth-label"
              id="demo-simple-select-autowidth"
              value={selectedCause}
              onChange={handleCauseChange}
              label="Cause"
            >
              {causes.map((cause, index) => (
                <MenuItem key={index} value={cause}>
                  {cause}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} direction="row" sm={6} md={4}>
          <TextField
            label="Enter text"
            variant="outlined"
            size="small"
            fullWidth={false}
            value={textValue}
            onChange={handleTextChange}
            sx={{ marginRight: 2, marginBottom: 2, width: "45%" }}
          />
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Submit
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
}
