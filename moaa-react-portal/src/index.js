import { createRoot } from "react-dom/client";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MoaaResultTables from "./components/moaaResultTables";
import WorkshopListDropdown from "./components/workshopListDropdown";

const queryClient = new QueryClient();

function App() {
  const [workshopId, setWorkshopId] = useState(null);

  const handleDropdownSelect = (value) => {
    console.log("onchange", value);
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

const root = createRoot(document.getElementById(USER.react_root_id));
root.render(<App />);
