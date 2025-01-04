import { useQuery } from "@tanstack/react-query";
import { fetchMoaaSheetsData } from "../modules/fetchSheetsData";
import { useMemo } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { LinearProgress, Paper, Typography } from "@mui/material";

const MoaaResultTables = ({ workshopId }) => {
  // const [isPending, isError, data, isRefetching] =
  //   useFetchSheetsData(workshopId);

  const queryResult = useQuery({
    queryKey: ["tableData", workshopId],
    queryFn: () => fetchMoaaSheetsData(workshopId),
  });

  const { data, isPending, isSuccess, status, isError, error } = queryResult;

  if (isSuccess) {
    return data.map((worksheet, index) => {
      if (worksheet.data.length > 0) {
        return (
          <Table
            key={worksheet.worksheet}
            queryResult={queryResult}
            worksheetData={worksheet.data}
            worksheetName={worksheet.worksheet}
          />
        );
      } else {
        return (
          <TableNoDataError key={index} worksheetName={worksheet.worksheet} />
        );
      }
    });
  } else if (isError) {
    console.log(error);
    return (
      <>
        <Typography color="error">{error.message}</Typography>
        {error?.response?.data?.message ? (
          <Typography variant="caption" color="warning">
            details: {error?.response?.data?.message}
          </Typography>
        ) : null}
      </>
    );
  } else {
    return (
      <div>
        <Typography color="info">Status: {status}</Typography>
        <LinearProgress />
      </div>
    );
  }
};

const Table = ({ queryResult, worksheetData, worksheetName }) => {
  const { isPending, isError, error, isLoading, isRefetching } = queryResult;

  const isVirtualize =
    worksheetData.length > 50 || Object.keys(worksheetData[0]).length > 12;

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

const TableNoDataError = ({ worksheetName }) => {
  return (
    <Paper
      square={false}
      sx={{
        p: 2,
      }}
    >
      <Typography color="error">No data from {worksheetName}</Typography>
    </Paper>
  );
};

export default MoaaResultTables;
