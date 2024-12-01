import { createTheme, CssBaseline, Stack, ThemeProvider } from "@mui/material";
import React, { useEffect, useState } from "react";
import CampaignCard from "./CampaignCard";
import FilteringView from "./FilteringView";
import ListingCampaigns from "./ListingCampaigns";
class Campaign {
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

  constructor(
    id: string,
    title: string,
    description: string,
    stateName: string,
    streetName: string,
    event_type: string,
    numberOfDonations: number,
    cause: string,
    campaignImage: string,
    eventDate: Date
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.stateName = stateName;
    this.streetName = streetName;
    this.event_type = event_type;
    this.numberOfDonations = numberOfDonations;
    this.cause = cause;
    this.campaignImage = campaignImage;
    this.eventDate = eventDate;
  }
}

interface HomePageProps {
  email?: string;
}

const theme = createTheme({
  typography: {
    fontFamily: "Georgia",
  },
});
export default function HomePage({ email }: HomePageProps) {
  const [listOfCampaigns, setListOfCampaigns] = useState<Campaign[]>([]);
  const [filteredListOfCampaigns, setFilteredListOfCampaigns] = useState<
    Campaign[]
  >([]);
  const [cause, setCause] = React.useState("All Causes");
  const [query, setQuery] = React.useState("");

  useEffect(() => {
    fetch("http://localhost:5000/campaigns") // Update with your Flask server's URL
      .then((response) => {
        if (!response.ok) {
          console.log(response);
          throw new Error("Failed to fetch campaigns");
        }
        return response.json();
      })
      .then((data) => {
        const campaigns = data.map(
          (campaignData: any) =>
            new Campaign(
              campaignData.campaign_id,
              campaignData.title,
              campaignData.description,
              campaignData.state,
              campaignData.street_name,
              campaignData.event_type,
              campaignData.donations.length,
              campaignData.cause,
              campaignData.image_url,
              campaignData.event_date
            )
        );
        setListOfCampaigns(campaigns);
        setFilteredListOfCampaigns(listOfCampaigns);
      })
      .catch((error) => {
        console.log(error.message);
      });
  }, []);
  useEffect(() => {
    if (query == "") {
      setFilteredListOfCampaigns(listOfCampaigns);
    } else {
      fetch(
        `http://localhost:5000/campaigns/search?query=${encodeURIComponent(
          query
        )}`
      )
        .then((response) => {
          if (!response.ok) {
            console.log(response);
            throw new Error("Failed to fetch campaigns");
          }
          return response.json();
        })
        .then((data) => {
          const filteredCampaigns = data.map(
            (campaignData: any) =>
              new Campaign(
                campaignData.campaign_id,
                campaignData.title,
                campaignData.description,
                campaignData.state,
                campaignData.street_name,
                campaignData.event_type,
                campaignData.donations.length,
                campaignData.cause,
                campaignData.image_url,
                campaignData.event_date
              )
          );
          setFilteredListOfCampaigns(filteredCampaigns);
        })
        .catch((error) => {
          console.log(error.message);
        });
    }
  }, [listOfCampaigns, query]);

  useEffect(() => {
    if (cause == "All Causes") {
      setFilteredListOfCampaigns(listOfCampaigns);
    } else {
      fetch("http://localhost:5000/campaigns/causes/" + cause)
        .then((response) => {
          if (!response.ok) {
            console.log(response);
            throw new Error("Failed to fetch campaigns");
          }
          return response.json();
        })
        .then((data) => {
          const filteredCampaigns = data.map(
            (campaignData: any) =>
              new Campaign(
                campaignData.campaign_id,
                campaignData.title,
                campaignData.description,
                campaignData.state,
                campaignData.street_name,
                campaignData.event_type,
                campaignData.donations.length,
                campaignData.cause,
                campaignData.image_url,
                campaignData.event_date
              )
          );
          setFilteredListOfCampaigns(filteredCampaigns);
        })
        .catch((error) => {
          console.log(error.message);
        });
    }
  }, [listOfCampaigns, cause]);

  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <FilteringView
          email={email}
          selectedCause={cause}
          setSelectedCause={setCause}
          query={query}
          setQuery={setQuery}
        />

        <ListingCampaigns email={email} campaigns={filteredListOfCampaigns} />
      </ThemeProvider>
    </>
  );
}
