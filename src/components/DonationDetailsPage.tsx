import { Box, Button, Container, createTheme, CssBaseline, ThemeProvider, Typography } from "@mui/material";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/DonationDetailsPage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationDot,
  faUsers,
  faCalendar,
} from "@fortawesome/free-solid-svg-icons";
import { lightBlue } from "@mui/material/colors";

interface CampaignProps {
  id: string;
  title: string;
  description: string;
  stateName: string;
  streetName: string;
  event_type: string;
  numberOfDonations: number;
  cause: string;
  campaignImage: string;
  eventDate: Date;
}
interface CampaignCardProps {
  email?: string;
  campaign?: CampaignProps; // Ensure this matches the prop structure
}
const theme = createTheme({
  typography: {
    fontFamily: "Georgia",
  },
});
export default function DonationDetailsPage({
  email,
  campaign,
}: CampaignCardProps) {
  const navigate = useNavigate();

  const handleNavigate = (campaign: CampaignProps) => {
    navigate("/confirmdonation", {
      state: { email: email, campaign: campaign },
    });
  };
  if (!campaign) {
    return <div>No campaign details available.</div>; // Fallback UI
  }
  const s3Url =
    "https://dds-campaign-images.s3.us-east-1.amazonaws.com/" +
    campaign.campaignImage;
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>
    <Box display="flex" flexDirection="column" p={2}>
      <Container className="detailsContainer">
        {/* Title and Description at the top center */}
        <Box textAlign="center" mb={4}>
          <Typography
            variant="h4"
            component="h4"
            fontWeight={"bold"}
            gutterBottom
          >
            {campaign.title}
          </Typography>
        </Box>

        <Box
          display="flex"
          flexDirection={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "center", md: "flex-start" }}
        >
          <Box
            marginTop={"-20px"}
            flex={{ xs: "none", md: 1 }}
            mr={{ md: 3 }}
            mb={{ xs: 3, md: 0 }}
          >
            <img
              src={s3Url}
              alt="Image Unavailable!"
              id="campaignImage"
              style={{ width: "100%", height: "300px", borderRadius: "8px" }}
            />
            <Box display="flex" flexDirection="column" gap={2}>
              <Box display="flex" alignItems="center">
                <FontAwesomeIcon
                  icon={faLocationDot}
                  style={{ color: "#1976d2", marginRight: "8px" }}
                />
                <Typography variant="h6" color="text.secondary">
                  {campaign.streetName}, {campaign.stateName}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center">
                <FontAwesomeIcon
                  icon={faUsers}
                  style={{ color: "#1976d2", marginRight: "8px" }}
                />
                <Typography variant="h6" color="text.secondary">
                  {campaign.numberOfDonations} Donations
                </Typography>
              </Box>

              <Box display="flex" alignItems="center">
                <FontAwesomeIcon
                  icon={faCalendar}
                  style={{ color: "#1976d2", marginRight: "8px" }}
                />
                <Typography variant="h6" color="text.secondary">
                  {campaign.eventDate.toString().split(" ")[0]}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Right - Details */}
          <Box
            flex={2}
            marginLeft={"100px"}
            marginTop={"0px"}
            // sx={{ maxHeight: "400px", overflowY: "auto" }}
          >
            <Box
              // flex={2}
              marginLeft={"100px"}
              marginTop={"0px"}
              sx={{ maxHeight: "400px", overflowY: "auto" }}
            >
              <Typography
                variant="h6"
                color="text.secondary"
                id="campaignDesc"
                textAlign={"left"}
                paragraph
              >
                {campaign.description}
              </Typography>
            </Box>
            <Button
              size="small"
              color="primary"
              onClick={() => handleNavigate(campaign)}
              sx={{
                marginTop: "20px",
                border: "0px solid grey",
                padding: "20px 300px 20px 300px",
                fontSize: "32px",
                borderRadius: "50px",
                maxWidth: "100%",
              }}
            >
              Donate
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
    </ThemeProvider>
  );
}
