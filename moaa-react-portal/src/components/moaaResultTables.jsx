import { useQuery } from "@tanstack/react-query";
import { fetchMoaaSheetsData } from "../modules/fetchSheetsData";
import { useEffect, useMemo, useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import {
  Box,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Tooltip,
  Typography,
  Alert,
} from "@mui/material";
import QueryRefetchButton from "./QueryRefetchButton";
import Charts from "./Charts";

const MoaaResultTables = ({ workshopId, isPartner = false }) => {
  // const [isPending, isError, data, isRefetching] =
  //   useFetchSheetsData(workshopId);

  const queryResult = useQuery({
    queryKey: ["tableData", workshopId, isPartner],
    queryFn: () => fetchMoaaSheetsData(workshopId, isPartner),
  });

  const { data, isPending, isSuccess, status, isError, error } = queryResult;

  if (isSuccess) {
    return (
      <>
        <QueryRefetchButton queryKey={["tableData", workshopId, isPartner]} />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "30px", // Creates uniform spacing between children
          }}
        >
          {data.map((worksheet, index) => {
            return (
              <div key={worksheet.worksheet}>
                <Table
                  queryResult={queryResult}
                  isWorkshopTable={worksheet.isWorkshopTable}
                  worksheetData={worksheet.data}
                  worksheetStats={worksheet.columnsSummaryData}
                  worksheetType={worksheet.type}
                  worksheetName={worksheet.worksheet}
                />
                {worksheet.chartData && (
                  <Charts chartData={worksheet.chartData} />
                )}
              </div>
            );
          })}
        </Box>
      </>
    );
  } else if (isError) {
    return (
      <>
        <QueryRefetchButton queryKey={["tableData", workshopId, isPartner]} />
        <Alert severity="error">{error.message}</Alert>
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
  if (worksheetData.length === 0) {
    return (
      <TableNoDataError key={worksheetName} worksheetName={worksheetName} />
    );
  }

  const { isPending, isError, error, isLoading, isRefetching, refetch } =
    queryResult;

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
    enableRowPinning: isWorkshopTable ? (row) => row.id === "0" : undefined,
    rowPinningDisplayMode: isWorkshopTable ? "select-top" : undefined,
    initialState: {
      density: "compact",
    },
    enablePagination: false,
    muiTableContainerProps: { sx: { maxHeight: "500px" } },
    enableStickyHeader: true,
    enableStickyFooter: true,
    enableBottomToolbar: false,
    enableGrouping: false,
    enableRowVirtualization: isVirtualize,
    enableToolbarInternalActions: isStatic,
    enableKeyboardShortcuts: isStatic,
    enableColumnActions: false,
    enableColumnFilters: false,
    enableSorting: false,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    renderTopToolbarCustomActions: () => (
      <Tooltip arrow title="Refresh Data">
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Typography align="center" variant="subtitle1">
            {worksheetName}
          </Typography>
        </div>
      </Tooltip>
    ),
    muiTopToolbarProps: {
      sx: {
        backgroundColor: "#213555",
        color: "#ffffff", // Makes text white
        "& .MuiIconButton-root": {
          // For toolbar icons
          color: "#ffffff",
        },
        "& .MuiTypography-root": {
          // For typography elements
          color: "#ffffff",
        },
      },
    },
    // Add header row styling
    muiTableHeadProps: {
      sx: {
        "& .MuiTableRow-root": {
          backgroundColor: "#213555",
        },
        opacity: "1",
      },
    },
    muiTableHeadCellProps: {
      sx: {
        fontSize: "0.8rem",
        lineHeight: "1.0",
        color: "#ffffff",
        minHeight: "48px", // Minimum height for consistency
        height: "auto",
        display: "flex",
        alignItems: "center",
        // Make the content container take full height
        "& .Mui-TableHeadCell-Content": {
          height: "100%",
        },
        "& .Mui-TableHeadCell-ResizeHandle-Wrapper": {
          height: "100%",
        },
        "& .MuiDivider-root": {
          borderColor: "#ffffff",
          opacity: 0.5,
          height: "100%",
        },
      },
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
        alignContent: "center",
        justifyContent: "center",
      },
    },
    muiTableFooterCellProps: {
      sx: {
        alignContent: "center",
        justifyContent: "center",
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
