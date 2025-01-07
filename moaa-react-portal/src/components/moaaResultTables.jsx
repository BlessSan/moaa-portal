import { useQuery } from "@tanstack/react-query";
import { fetchMoaaSheetsData } from "../modules/fetchSheetsData";
import { useMemo, useState } from "react";
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
            worksheetStats={worksheet.columnsSummaryData}
            worksheetType={worksheet.type}
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

const Table = ({
  queryResult,
  isWorkshopTable,
  worksheetData,
  worksheetStats,
  worksheetType,
  worksheetName,
}) => {
  const { isPending, isError, error, isLoading, isRefetching } = queryResult;

  const isVirtualize =
    worksheetData.length > 50 || Object.keys(worksheetData[0]).length > 12;

  const columns = useMemo(
    () =>
      worksheetData.length
        ? Object.keys(worksheetData[0]).map((columnId, index) => ({
            header: columnId ? columnId : "no column id",
            accessorKey: columnId ? columnId : "default",
            grow: true,
            //size: isWorkshopTable ? (columnId?.length > 10 ? 300 : 130) : 150,
            size: 150,
            Cell: isWorkshopTable
              ? ({ cell }) => {
                  return (
                    <span
                      style={{
                        color:
                          cell.getValue() === "Aggregate" ? "green" : undefined,
                      }}
                    >
                      {cell.getValue()}
                    </span>
                  );
                }
              : null,
            Footer: isWorkshopTable
              ? () => {
                  if (worksheetStats[columnId] !== undefined) {
                    return (
                      <Stack color="warning.main">
                        <Box>{worksheetStats[columnId]}</Box>
                      </Stack>
                    );
                  }
                  return null;
                }
              : null,
          }))
        : [],
    [worksheetData, worksheetStats, isWorkshopTable]
  );

  const [isStatic, setIsStatic] = useState(
    worksheetType === "dynamic" ? true : false
  );

  const [rowPinning, setRowPinning] = useState({});

  useEffect(() => {
    if (isWorkshopTable) {
      setRowPinning({ top: ["0"], bottom: [] });
    }
  }, [isWorkshopTable]);

  const table = useMaterialReactTable({
    columns,
    data: worksheetData,
    enableRowPinning: isWorkshopTable
      ? (row) => {
          row.id === "0";
        }
      : undefined,
    rowPinningDisplayMode: isWorkshopTable ? "select-top" : undefined,
    initialState: {
      density: "compact",
    },
    enablePagination: false,
    muiTableContainerProps: { sx: { maxHeight: "400px", zIndex: 0 } },
    muiTopToolbarProps: { sx: { zIndex: 0 } },
    enableStickyHeader: true,
    enableStickyFooter: true,
    enableGrouping: false,
    enableRowVirtualization: isVirtualize,
    enableToolbarInternalActions: isStatic,
    enableKeyboardShortcuts: isStatic,
    enableColumnActions: false,
    enableColumnFilters: false,
    enableSorting: false,
    enableColumnResizing: true,
    columnResizeMode: "onEnd",
    renderTopToolbarCustomActions: () => {
      return <Typography variant="h5">{worksheetName}</Typography>;
    },
    muiTableBodyProps: {
      sx: {
        //stripe the rows, make odd rows a darker color
        "& tr:nth-of-type(odd) > td": {
          backgroundColor: "#E8E8E8",
        },
      },
    },
    muiTableBodyCellProps: {
      sx: {
        borderRight: "2px solid #e0e0e0", //add a border between columns
      },
    },
    state: {
      isLoading: isPending,
      showProgressBars: isRefetching,
      showAlertBanner: isError,
      rowPinning,
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
