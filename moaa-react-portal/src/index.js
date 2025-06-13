import { createRoot } from "react-dom/client";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MoaaResultTables from "./components/moaaResultTables";
import {
  WorkshopListDropdown,
  PartnerListDropdown,
} from "./components/workshopListDropdown";
import { Grid2 } from "@mui/material";
import {
  createTheme,
  responsiveFontSizes,
  ThemeProvider,
} from "@mui/material/styles";

let theme = createTheme();
theme = responsiveFontSizes(theme);
theme.typography.legendText = {
  fontSize: "0.7rem", // Minimum size for smallest screens
  fontWeight: 4000,
  "@media (min-width:480px)": {
    fontSize: "0.7rem",
    fontWeight: 600,
  },
  "@media (min-width:600px)": {
    fontSize: "0.75rem",
    fontWeight: 600,
  },
  [theme.breakpoints.up("md")]: {
    fontSize: "0.8rem",
    fontWeight: 600,
  },
  [theme.breakpoints.up("lg")]: {
    fontSize: "0.9rem",
    fontWeight: 600,
  },
};
const queryClient = new QueryClient();

function App() {
  const [workshopOption, setWorkshopOption] = useState(null);
  const [partnerOption, setPartnerOption] = useState(null);

  const handleWorkshopDropdownSelect = (value) => {
    setWorkshopOption(value);
    setPartnerOption(null);
  };

  const handlePartnerDropdownSelect = (value) => {
    setPartnerOption(value);
    setWorkshopOption(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <div className="moaa_webapp_container">
          <Grid2
            container
            spacing={1}
            direction="row"
            sx={{ paddingBottom: "30px" }}
          >
            <Grid2 size="grow">
              <WorkshopListDropdown
                handleDropdownSelect={(value) =>
                  handleWorkshopDropdownSelect(value)
                }
                workshopOption={workshopOption}
              />
            </Grid2>
            <Grid2 size="grow">
              <PartnerListDropdown
                handleDropdownSelect={(value) =>
                  handlePartnerDropdownSelect(value)
                }
                partnerOption={partnerOption}
              />
            </Grid2>
          </Grid2>
          <div className="moaa_webapp_table_container">
            {workshopOption?.value ||
            workshopOption?.value.length === 0 ||
            partnerOption?.value ? (
              <MoaaResultTables
                workshopId={workshopOption?.value ?? partnerOption?.value}
              />
            ) : null}
          </div>
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function PartnerPortal() {
  const search = window.location.search;

  // Parse the query parameters
  const queryParams = new URLSearchParams(search);

  const id = queryParams.get("id");

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <MoaaResultTables workshopId={id} isPartner />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function AggregateDataPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <MoaaResultTables workshopId={null} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

// const container = document.querySelector("#react-portal-root");
// const shadowContainer = container.attachShadow({ mode: "open" });
// const shadowRootElement = document.createElement("div");
// shadowContainer.appendChild(shadowRootElement);

// const cache = createCache({
//   key: "css",
//   prepend: true,
//   container: shadowContainer,
// });

// const shadowTheme = createTheme({
//   components: {
//     MuiPopover: {
//       defaultProps: {
//         container: shadowRootElement,
//       },
//     },
//     MuiPopper: {
//       defaultProps: {
//         container: shadowRootElement,
//       },
//     },
//     MuiModal: {
//       defaultProps: {
//         container: shadowRootElement,
//       },
//     },
//   },
// });

// createRoot(shadowRootElement).render(
//   <CacheProvider value={cache}>
//     <ThemeProvider theme={shadowTheme}>
//       <App />
//     </ThemeProvider>
//   </CacheProvider>
// );

const workshopPortalRootDiv = document.getElementById(USER.react_root_id);

const partnerPortalRootDiv = document.getElementById(
  USER.react_partner_root_id
);

const aggregateDataPageRootDiv = document.getElementById(
  USER.react_aggregate_root_id
);

if (workshopPortalRootDiv) {
  const root = createRoot(workshopPortalRootDiv);
  root.render(<App />);
} else if (partnerPortalRootDiv) {
  const partnerPortalRoot = createRoot(partnerPortalRootDiv);
  partnerPortalRoot.render(<PartnerPortal />);
} else {
  const aggregateDataPageRoot = createRoot(aggregateDataPageRootDiv);
  aggregateDataPageRoot.render(<AggregateDataPage />);
}
