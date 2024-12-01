import { Grid } from "@mui/material";
import * as React from "react";
import CampaignCard from "./CampaignCard";

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

interface CampaignListProps {
  email?: string;
  campaigns: CampaignProps[];
}
export default function ListingCampaigns({
  email,
  campaigns,
}: CampaignListProps) {
  return (
    <Grid
      container
      spacing={3}
      justifyContent="center"
      sx={{ mt: 4, marginTop: "-10px", marginBottom: "20px" }}
      className="campaignContainer"
    >
      {campaigns.length === 0 ? (
        <Grid item xs={12}>
          <h1>No campaigns found</h1>
        </Grid>
      ) : (
        campaigns.map((campaign, index) => (
          <Grid item xs={12} key={index}>
            <CampaignCard email={email} campaign={campaign} key={index} />
          </Grid>
        ))
      )}
    </Grid>
  );
}
