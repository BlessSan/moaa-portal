import { createRoot } from "react-dom/client";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MoaaResultTables from "./components/moaaResultTables";
import WorkshopListDropdown from "./components/workshopListDropdown";

const queryClient = new QueryClient();

function App() {
  const [workshopId, setWorkshopId] = useState(null);

  const handleDropdownSelect = (value) => {
    setWorkshopId(value.value);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="moaa_webapp_container">
        <WorkshopListDropdown
          handleDropdownSelect={(value) => handleDropdownSelect(value)}
          workshopId={workshopId}
        />
        <div className="moaa_webapp_table_container">
          {workshopId || workshopId?.length === 0 ? (
            <MoaaResultTables workshopId={workshopId} />
          ) : null}
        </div>
      </div>
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
      <MoaaResultTables workshopId={id} isPartner />
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

const PartnerPortalRootDiv = document.getElementById(
  USER.react_partner_root_id
);

if (workshopPortalRootDiv) {
  const root = createRoot(workshopPortalRootDiv);
  root.render(<App />);
} else {
  const partnerPortalRoot = createRoot(PartnerPortalRootDiv);
  partnerPortalRoot.render(<PartnerPortal />);
}
