import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  PieController,
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import merge from "lodash/merge";
import { Chart } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import {
  generateColors,
  generateBorderColors,
} from "../modules/generateColors";
import { extractPercentage } from "../modules/extractPercentage";
import Grid from "@mui/material/Grid2";
import Box from "@mui/material/Box";
import HTMLLegend from "./CustomLegend";
import Stack from "@mui/material/Stack";
import { Typography } from "@mui/material";

ChartJS.register(
  PieController,
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
  ChartDataLabels
);

/**
 * Main Charts component that handles multiple chart datasets
 */
const Charts = ({ chartData }) => {
  if (chartData.data) {
    return (
      <Stack spacing={1} sx={{ paddingTop: "30px" }}>
        {chartData.title && (
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6">{chartData.title}</Typography>
          </Box>
        )}
        <Box>
          {chartData.data.map((chartDataset, index) => (
            <MOAAChart
              key={`moaaChart-${index}`}
              type={chartData.type}
              data={chartDataset}
            />
          ))}
        </Box>
      </Stack>
    );
  }
  return null;
};

const MOAAChart = ({ type, data }) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const labels = data.labels;
    const dataLength = data.datasets[0]?.data?.length || 0;

    // Get both background and border colors
    const backgroundColors = generateColors(dataLength);
    const borderColors = generateBorderColors(backgroundColors);

    const datasets = data.datasets.map((dataset) => ({
      label: dataset.label,
      data: dataset.data,
      customLabels: dataset.customLabels,
      backgroundColor: backgroundColors,
      borderColor: borderColors,
      barThickness: "flex",
      borderWidth: 1,
    }));

    setChartData({
      labels: labels,
      datasets: datasets,
    });
  }, [data]);

  // Display label value as value of the data for tables
  const dataLabels = {
    display: "auto",
    formatter: (value, context) => {
      if (value === 0) {
        return "";
      }

      const datasetIndex = context.datasetIndex;
      const index = context.dataIndex;
      const isRounded = type === "bar";
      //TODO: Make font size larger on pie label
      //TODO: Check if chart is pie -> keep decimal, if bar -> round to nearest integer
      const label = extractPercentage(
        context.chart.data.datasets[datasetIndex].customLabels[index],
        isRounded
      );
      return label;
    },
    font: function (context) {
      var avgSize = Math.round(
        (context.chart.height + context.chart.width) / 2
      );
      var size = Math.round(avgSize / 32);
      size = size > 14 ? 14 : size; // setting max limit to 12
      return {
        size: size,
        weight: "bold",
      };
    },
    borderRadius: 3,
  };

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: type === "pie", // Only show built-in legend for pie charts
        position: "bottom",
      },
      title: {
        display: true,
        text: "",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const chartGroup = context.dataset.label;
            const datasetIndex = context.datasetIndex;
            const index = context.dataIndex;
            const displayValue =
              context.chart.data.datasets[datasetIndex].customLabels[index];

            return `${chartGroup}: ${displayValue}`;
          },
        },
      },
      datalabels: dataLabels,
    },
  };

  const options = (datasetLabel, type) => {
    const specificOptions = {
      pie: {
        plugins: {
          title: {
            display: true,
            text: datasetLabel,
          },
        },
      },
      bar: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: datasetLabel,
          },
        },
        scales: {
          x: {
            ticks: {
              display: false,
            },
          },
        },
      },
    };

    return merge({}, defaultOptions, specificOptions[type]);
  };

  const gridSize = type === "pie" ? { xs: 12, sm: 6 } : { xs: 12 };

  return (
    chartData && (
      <Grid
        container
        spacing={2}
        sx={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {chartData.datasets.map((dataset, index) => (
          <Grid
            size={gridSize}
            key={`chartData-${index}`}
            sx={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            {/* Chart container with horizontal overflow */}
            <Box
              sx={{
                width: "100%",
                overflowX: "auto",
                overflowY: "hidden",
              }}
            >
              {/* Chart and legend container */}
              <Box
                sx={{
                  display: "flex",
                  minWidth: type === "bar" ? "min(400px, 90%)" : "100%",
                  width: "100%",
                  maxWidth: "1200px", // Prevent excessive stretching
                  marginLeft: "auto", // Center the chart if container is wider
                  marginRight: "auto", // Center the chart if container is wider
                  height: {
                    xs: "250px", // Mobile
                    sm: "300px", // Tablet
                    md: "400px", // Desktop
                    lg: "450px", // Large desktop
                  },
                }}
              >
                {/* Chart container */}
                <Box
                  sx={{
                    flex:
                      type === "bar"
                        ? {
                            xs: "1 1 80%", // On small screens: basis 80%
                            md: "1 1 75%", // On medium screens: basis 75%
                            lg: "1 1 70%", // On large screens: basis 70%
                          }
                        : "1 1 100%",
                    position: "relative",
                    display: "flex",
                    justifyContent: type !== "bar" ? "center" : "flex-start",
                    minHeight: "100%", // Ensures it takes full height of parent
                  }}
                >
                  <Chart
                    type={type}
                    data={{ labels: chartData.labels, datasets: [dataset] }}
                    options={options(dataset.label, type)}
                  />
                </Box>

                {/* HTML Legend for bar charts */}
                {type === "bar" && (
                  <Box
                    sx={{
                      flex: {
                        xs: "1 1 20%", // On small screens: basis 20%
                        md: "1 1 25%", // On medium screens: basis 25%
                        lg: "1 1 30%", // On large screens: basis 30%
                      },
                      marginLeft: "16px",
                      display: "flex",
                      flexDirection: "column",
                      minWidth: "200px", // Ensure legend has enough space
                    }}
                  >
                    <HTMLLegend
                      labels={chartData.labels}
                      colors={dataset.backgroundColor}
                    />
                  </Box>
                )}
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    )
  );
};

export default Charts;
