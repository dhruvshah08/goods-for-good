import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CardActionArea from "@mui/material/CardActionArea";
import CardActions from "@mui/material/CardActions";
import { useNavigate } from "react-router-dom";
import { Grid } from "@mui/material";

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
  campaign: CampaignProps; // Ensure this matches the prop structure
}

export default function CampaignCard({ email, campaign }: CampaignCardProps) {
  const navigate = useNavigate();

  const handleNavigate = (campaign: CampaignProps) => {
    navigate("/donationdetails", {
      state: { email: email, campaign: campaign },
    });
  };

  const s3Url =
    "https://dds-campaign-images.s3.us-east-1.amazonaws.com/" +
    campaign.campaignImage;
  // console.log(s3Url);

  return (
    <Grid
      item
      xs={12}
      sm={12}
      sx={{ display: "flex", justifyContent: "center" }}
    >
      <Card sx={{ width: "100%", maxWidth: 500, boxShadow: 3 }}>
        <CardActionArea>
          <img
            src={s3Url}
            alt="Campaign"
            height="200"
            style={{ objectFit: "cover", width: "100%" }}
          />
          <CardContent>
            <Typography
              gutterBottom
              variant="h6"
              component="div"
              fontWeight="bold"
            >
              {campaign.title}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                maxHeight: "100px", // Adjust the max height as needed
                overflow: "hidden",
                textOverflow: "ellipsis", // Optional: Adds ellipsis if the content overflows
              }}
            >
              {campaign.description}
            </Typography>
          </CardContent>
        </CardActionArea>
        <CardActions sx={{ justifyContent: "flex-end" }}>
          <Button
            size="small"
            color="primary"
            onClick={() => handleNavigate(campaign)}
            sx={{
              fontSize: '1rem',  // Increase the font size
              fontWeight: 'bold'   // Make the text bold
            }}
          >
            Donate
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );
}
