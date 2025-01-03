import { QueryCache, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchMoaaSheetsData } from "../modules/fetchSheetsData";
import { useMemo, useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { LinearProgress, Typography } from "@mui/material";

const MoaaResultTables = ({ workshopId }) => {
  const queryClient = useQueryClient();
  console.log("result table", workshopId);
  // const [isPending, isError, data, isRefetching] =
  //   useFetchSheetsData(workshopId);

  const queryResult = useQuery({
    queryKey: ["tableData", workshopId],
    queryFn: () => fetchMoaaSheetsData(workshopId),
    initialData: () => {
      // Use a todo from the 'todos' query as the initial data for this todo query
      const state = queryClient.getQueryData(["tableData"]);
      console.log(state);
      if (state && Date.now() - state.dataUpdatedAt <= 10 * 1000) {
        // return the individual todo
        return state.data.find((d) => d.id === workshopId);
      }
      // Otherwise, return undefined and let it fetch from a hard loading state!
    },
    initialDataUpdatedAt: () =>
      queryClient.getQueryState(["tableData"])?.dataUpdatedAt,
    staleTime: 10 * 1000,
  });

  const { data, isPending, isSuccess, status, isError, error } = queryResult;

  if (isSuccess) {
    return data.map((worksheet, index) => {
      return (
        <Table
          key={index}
          queryResult={queryResult}
          worksheetData={worksheet.data}
          worksheetName={worksheet.worksheet}
          isVirtualize={
            worksheet.data?.length > 50 ||
            Object.keys(worksheet.data[0]).length > 12
          }
        />
      );
    });
  } else if (isError) {
    return <div>{error}</div>;
  } else {
    return (
      <div>
        <Typography>Status: {status}</Typography>
        <LinearProgress />
      </div>
    );
  }
};

const Table = ({ queryResult, worksheetData, worksheetName, isVirtualize }) => {
  const { isPending, isError, error, isLoading, isRefetching } = queryResult;

  const columns = useMemo(
    () =>
      worksheetData.length
        ? Object.keys(worksheetData[0]).map((columnId) => ({
            header: columnId,
            accessorKey: columnId,
          }))
        : [],
    [worksheetData]
  );

  const table = useMaterialReactTable({
    columns,
    data: worksheetData,
    enableGrouping: true,
    initialState: { density: "compact" },
    enablePagination: false,
    muiTableContainerProps: { sx: { maxHeight: "400px", zIndex: 0 } },
    muiTopToolbarProps: { sx: { zIndex: 0 } },
    enableStickyHeader: true,
    enableStickyFooter: true,
    enableRowVirtualization: isVirtualize,
    renderTopToolbarCustomActions: () => {
      return <Typography variant="h5">{worksheetName}</Typography>;
    },
    state: {
      isLoading: isPending,
      showProgressBars: isRefetching,
      showAlertBanner: isError,
    },
  });

  return (
    <div key={worksheetName}>
      <MaterialReactTable table={table} />
    </div>
  );
};
export default MoaaResultTables;
