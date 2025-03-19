export const generateColors = (count) => {
  const predefinedColors = [
    "rgba(255, 99, 132, 0.6)", // Red
    "rgba(54, 162, 235, 0.6)", // Blue
    "rgba(255, 206, 86, 0.6)", // Yellow
    "rgba(75, 192, 192, 0.6)", // Green
    "rgba(153, 102, 255, 0.6)", // Purple
    "rgba(255, 159, 64, 0.6)", // Orange
    "rgba(199, 199, 199, 0.6)", // Gray
    "rgba(83, 102, 255, 0.6)", // Indigo
    "rgba(255, 99, 255, 0.6)", // Pink
    "rgba(99, 255, 132, 0.6)", // Mint
  ];

  // Repeat colors if there are more data points than predefined colors
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(predefinedColors[i % predefinedColors.length]);
  }

  return colors;
};
