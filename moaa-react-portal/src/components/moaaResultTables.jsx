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
