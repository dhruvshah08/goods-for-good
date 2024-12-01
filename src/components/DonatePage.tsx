import {
  Box,
  Button,
  Container,
  CssBaseline,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Modal,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import * as React from "react";
import { ModalDialog } from "@mui/joy";
import { createTheme, styled, ThemeProvider } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import "../styles/DonatePage.css";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import { Css } from "@mui/icons-material";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const stateNames = [
  "Alaska",
  "Alabama",
  "Arkansas",
  "American Samoa",
  "Arizona",
  "California",
  "Colorado",
  "Connecticut",
  "District of Columbia",
  "Delaware",
  "Florida",
  "Federated States of Micronesia",
  "Georgia",
  "Guam",
  "Hawaii",
  "Iowa",
  "Idaho",
  "Illinois",
  "Indiana",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Massachusetts",
  "Maryland",
  "Maine",
  "Marshall Islands",
  "Michigan",
  "Minnesota",
  "Missouri",
  "Northern Mariana Islands",
  "Mississippi",
  "Montana",
  "North Carolina",
  "North Dakota",
  "Nebraska",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "Nevada",
  "New York",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Puerto Rico",
  "Palau",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Virginia",
  "U.S. Virgin Islands",
  "Vermont",
  "Washington",
  "Wisconsin",
  "West Virginia",
  "Wyoming",
];

const categories = ["Clothing", "Electronics", "Furniture", "Toys"];

class Donation {
  id: number;
  category: string;
  donationImage: File | null;

  constructor(id: number, category: string, donationImage: File | null) {
    this.id = id;
    this.category = category;
    this.donationImage = donationImage;
  }
}
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
  campaign?: CampaignProps;
}
const theme1 = createTheme({
  typography: {
    fontFamily: "Georgia",
  },
});
export default function DonatePage({ email, campaign }: CampaignCardProps) {
  const [open, setOpen] = React.useState(false);
  const [category, setCategory] = React.useState(categories[0]);
  const [listOfDonations, setListOfDonations] = React.useState<Donation[]>([]);
  const [state, setState] = React.useState(stateNames[0]);
  const [index, setIndex] = React.useState(1);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [message, setMessage] = React.useState("");

  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalMessage, setModalMessage] = React.useState("");
  const [isSuccess, setIsSuccess] = React.useState(false);

  const navigate = useNavigate();
  const handleStateChange = (event: SelectChangeEvent) => {
    setState(event.target.value);
  };

  const handleChange = (event: SelectChangeEvent) => {
    setCategory(event.target.value);
  };

  const addDonation = (donation: Donation) => {
    setListOfDonations((prevDonations) => [...prevDonations, donation]);
    setSelectedFile(null);
    setCategory(categories[0]);
    console.log(listOfDonations);
  };

  const removeDonation = (id: number) => {
    setListOfDonations((prevDonations) =>
      prevDonations.filter((donation) => donation.id !== id)
    );
  };

  const handleAddDonation = () => {
    const newDonation = new Donation(index, category, selectedFile);
    addDonation(newDonation);
    setOpen(false);
    setIndex((index) => index + 1);
  };
  const confirmDonations = async () => {
    let donationCategories: string[] = [];
    let donationImageUrls: File[] = [];

    listOfDonations.map((donation) => {
      donationCategories.push(donation.category);
      if (donation.donationImage) {
        donationImageUrls.push(donation.donationImage); // Assuming this is a File object
      }
    });
    if (!campaign || !email) {
      return;
    }
    const formData = new FormData();
    formData.append("usps_state", state);
    formData.append("campaign_id", campaign?.id);
    formData.append("email", email);
    formData.append("message", message);
    formData.append("donation_categories", JSON.stringify(donationCategories));

    donationImageUrls.forEach((file, index) => {
      formData.append(`donation_image_${index}`, file);
    });

    try {
      const response = await fetch("http://localhost:5000/add-donation", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setModalMessage(
        "Thank you for your generous donation! Please check your email for the donation's drop location!"
      );
      setIsSuccess(true);
      setModalOpen(true);
      
      console.log("Donation confirmed:", result);
    } catch (error) {
      setModalMessage(
        "Your donation couldn't go through successfully, please try again!"
      );
      setIsSuccess(false);
      setModalOpen(true);
      
      console.error("Error confirming donation:", error);
    }
  };
  const handleClose = () => {
    setModalOpen(false);
    navigate("/home", { state: { email: email } });
  };

  return (
    <Box display="flex" flexDirection="column" p={2}>
      <Container className="confirmationHolder">
        <Typography
          variant="h4"
          component="h4"
          id="title"
          fontFamily={"Georgia"}
          marginTop={"25px"}
        >
          {campaign?.title}
        </Typography>
        <Typography
          variant="h5"
          component="h5"
          id="title"
          fontFamily={"Georgia"}
          marginTop={"25px"}
          textAlign="left"
        >
          Please add your Donations here
        </Typography>
        <ThemeProvider theme={theme1}>
          <CssBaseline />

          {listOfDonations.length > 0 ? (
            <List id="donationsList">
              {listOfDonations.map((donation, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={
                      donation.category + " - " + donation.donationImage?.name
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="remove"
                      onClick={() => removeDonation(donation.id)}
                    >
                      <CloseIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          ) : (
            <></>
          )}
        </ThemeProvider>
        <ThemeProvider theme={theme1}>
          <CssBaseline />
          <Button
            size="small"
            color="primary"
            onClick={() => setOpen(true)}
            id="btnAddMore"
          >
            Add Donation
          </Button>
        </ThemeProvider>

        <Modal open={open} onClose={() => setOpen(false)}>
          <ModalDialog
            aria-labelledby="nested-modal-title"
            aria-describedby="nested-modal-description"
            sx={(theme) => ({
              [theme.breakpoints.only("xs")]: {
                top: "unset",
                bottom: 0,
                left: 0,
                right: 0,
                borderRadius: 0,
                transform: "none",
                maxWidth: "unset",
              },
            })}
          >
            <FormControl sx={{ m: 1, minWidth: 80 }}>
              <InputLabel id="demo-simple-select-autowidth-label">
                Category
              </InputLabel>
              <Select
                labelId="demo-simple-select-autowidth-label"
                id="demo-simple-select-autowidth"
                value={category}
                onChange={handleChange}
                autoWidth
                label="Category"
              >
                {categories.map((category, index) => (
                  <MenuItem key={index} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              component="label"
              role={undefined}
              variant="contained"
              tabIndex={-1}
              startIcon={<CloudUploadIcon />}
            >
              Upload files
              <VisuallyHiddenInput
                type="file"
                onChange={(event) => {
                  const files = event.target.files;
                  if (files && files.length > 0) {
                    setSelectedFile(files[0]);
                  }
                }}
              />
            </Button>

            <Box
              sx={{
                mt: 1,
                display: "flex",
                gap: 1,
                flexDirection: { xs: "column", sm: "row-reverse" },
              }}
            >
              <Button color="primary" onClick={handleAddDonation}>
                Continue
              </Button>
              <Button variant="outlined" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </Box>
          </ModalDialog>
        </Modal>
        <ThemeProvider theme={theme1}>
          <CssBaseline />
          <textarea
            placeholder="Add your message here..."
            rows={3}
            id="sendAMessage"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </ThemeProvider>
        <Box
          id="locationBox"
          display="flex"
          justifyContent="flex-start"
          alignItems="center"
        >
          <Typography
            variant="body1"
            id="locationChoice"
            sx={{ marginRight: 2 }}
            fontFamily={"Georgia"}
          >
            Please select your location
          </Typography>
          <ThemeProvider theme={theme1}>
            <CssBaseline />
            <FormControl sx={{ m: 1, minWidth: 80 }} id="stateSelection">
              <Select
                label="State"
                value={state}
                onChange={handleStateChange}
                labelId="select-state-label"
                id="select-state"
              >
                {stateNames.map((state, index) => (
                  <MenuItem key={index} value={state}>
                    {state}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </ThemeProvider>
        </Box>
        <Modal open={modalOpen} onClose={handleClose}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              border: "2px solid #000",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
            }}
          >
            <Typography
              variant="h6"
              component="h2"
              color={isSuccess ? "green" : "red"}
              gutterBottom
            >
              {isSuccess ? "Success" : "Error"}
            </Typography>
            <Typography>{modalMessage}</Typography>
            <Button
              variant="contained"
              color="secondary"
              sx={{ mt: 2 }}
              onClick={handleClose}
            >
              Close
            </Button>
          </Box>
        </Modal>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <ThemeProvider theme={theme1}>
            <CssBaseline />
            <Button
              color="primary"
              id="btnConfirmDonation"
              onClick={confirmDonations}
              sx={{
                marginTop: "20px",
                border: "0px solid grey",
                padding: "20px 300px 20px 300px",
                fontSize: "32px",
                borderRadius: "50px",
                maxWidth: "100%",
              }}
            >
              Confirm Donations
            </Button>
          </ThemeProvider>
        </Box>
      </Container>
    </Box>
  );

}
