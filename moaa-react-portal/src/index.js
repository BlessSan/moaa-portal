import { createRoot } from "react-dom/client";
import { useEffect, useState, useMemo } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import axios from "axios";

const queryClient = new QueryClient();

// TODO: may have to handle id
//* https://tanstack.com/query/latest/docs/framework/react/guides/query-functions
const fetchMoaaSheetsData = async () => {
  //* body will be {data:[]}
  const url =
    "https://moaa-portal-test.local/wp-json/moaa-sheets/v1/getWorkshopResults";
  try {
    const response = await axios.get(url, {
      // eslint-disable-next-line no-undef
      //TODO: map dropdown value to params
      params: { workshop_id: "dropdown value" },
      headers: { "X-WP-nonce": USER.nonce },
    });
    console.log(response);
    const resultData = JSON.parse(response.data);
    return resultData.data;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const fetchMoaaWorkshopsList = async () => {
  const url =
    "https://moaa-portal-test.local/wp-json/moaa-sheets/v1/getWorkshopsList";
  try {
    const response = await axios.get(url, {
      // eslint-disable-next-line no-undef
      headers: { "X-WP-nonce": USER.nonce },
    });
    console.log(response);
    const resultData = JSON.parse(response.data);
    return resultData.data;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const WorkshopListDropdown = () => {
  useEffect(() => {
    fetchMoaaWorkshopsList();
  }, []);

  return <div>dropdown</div>;
};

function MoaaResultTable() {
  //const { isPending, isError, data, error }
  const {
    isPending,
    isError,
    data = [],
    error,
    isLoading,
    isRefetching,
  } = useQuery({
    queryKey: ["tableData"],
    queryFn: fetchMoaaSheetsData,
    enabled: workshopId,
  });

  const columns = useMemo(
    () => [
      { accessorKey: "email", header: "Email", enableGrouping: false },
      { accessorKey: "assessmentResult", header: "Assessment Result" },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: data,
    enableGrouping: true,
    state: {
      isLoading: isPending,
      showProgressBars: isRefetching,
      showAlertBanner: isError,
    },
  });

  return <MaterialReactTable table={table} />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WorkshopListDropdown />
      <MoaaResultTable />
    </QueryClientProvider>
  );
}

const root = createRoot(document.getElementById("react-portal-root"));
root.render(<App />);
