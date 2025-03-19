import React, { useEffect, useState } from "react";
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
import { Chart } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { generateColors } from "../modules/generateColors";
import Grid from "@mui/material/Grid2";

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
 * chartData from api will be an object with the following structure:
 * {
 *   type: "pie" | "bar",
 *   data: [{
 *     labels: ["label1", "label2", "label3"],
 *     datasets: [
 *       {
 *         label: "dataset1",
 *         data: [1, 2, 3],
 *       },
 *       {
 *         label: "dataset2",
 *         data: [4, 5, 6],
 *       }
 *     ]
 *   }]
 * }
 */
const Charts = ({ chartData, chartLabel }) => {
  if (chartData.data) {
    return chartData.data.map((chartDataset, index) => {
      return (
        <MOAAChart
          key={index}
          type={chartData.type}
          data={chartDataset}
          chartLabel={chartLabel}
        />
      );
    });
  }
};

const MOAAChart = ({ type, data, chartLabel }) => {
  const [chartData, setChartData] = useState(null);

  console.log(chartData);

  useEffect(() => {
    const labels = data.labels;
    const datasets = data.datasets.map((dataset) => ({
      label: dataset.label,
      data: dataset.data,
      backgroundColor: generateColors(dataset.data.length),
      borderColor: generateColors(dataset.data.length).map((color) =>
        color.replace("0.6", "1")
      ),
      borderWidth: 1,
    }));

    setChartData({
      labels: labels,
      datasets: datasets,
    });
  }, [data]);

  // display label value as value of the data for tables (e.g. the already-formatted values such as x (y%) or $x)
  const dataLabels = {
    display: true,
    formatter: (value, context) => {
      if (value === 0) {
        return "";
      }

      const label = context.chart.data.labels[context.dataIndex];
      if (context.dataset.label.toLowerCase() === "aggregate") {
        return chartLabel.aggregate[label];
      } else {
        return chartLabel.filtered[label];
      }
    },
    borderRadius: 3,
    font: {
      weight: "bold",
    },
  };

  const defaultOptions = {
    plugins: {
      legend: {
        display: true,
        position: "bottom",
      },
      title: {
        display: true,
        text: "",
      },
      datalabels: dataLabels,
    },
    scales: {},
  };

  const options = (datasetLabel, type) => {
    const specificOptions = {
      pie: {
        plugins: {
          ...defaultOptions.plugins,
          title: {
            display: true,
            text: datasetLabel,
          },
        },
        maintainAspectRatio: true, // Allow the chart to control its own aspect ratio
        responsive: true,
      },
      bar: {
        plugins: {
          ...defaultOptions.plugins,
          title: {
            display: true,
            text: datasetLabel,
          },
          legend: {
            display: true,
            position: "right",
            labels: {
              generateLabels: (chart) => {
                console.log(chart);
                return chart.data.labels.map((label, index) => ({
                  text: label,
                  strokeStyle: chart.data.datasets[0].borderColor[index],
                  fillStyle: chart.data.datasets[0].backgroundColor[index],
                }));
              },
            },
          },
        },
        scales: {
          x: {
            ticks: {
              display: false,
            },
          },
          y: {
            ticks: {
              callback: (value, index, values) => {
                console.log([value, index, values]);
                return value;
              },
            },
          },
        },
      },
    };

    return {
      ...defaultOptions,
      ...specificOptions[type],
    };
  };

  const gridSize = type === "pie" ? { xs: 12, sm: 6 } : { xs: 12 };
  const containerStyle =
    type === "pie"
      ? { position: "relative", height: "50vh", width: "100%" }
      : { position: "relative", height: "100%", width: "100%" };

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
            key={index}
            sx={{ display: "flex", justifyContent: "center" }}
          >
            {/* <div className="chart-container" style={containerStyle}> */}
            <Chart
              type={type}
              data={{ labels: chartData.labels, datasets: [dataset] }}
              options={options(dataset.label, type)}
            />
            {/* </div> */}
          </Grid>
        ))}
      </Grid>
    )
  );
};

export default Charts;
