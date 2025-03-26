import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
/**
 * Custom HTML Legend component
 */
const HTMLLegend = ({ labels, colors }) => {
  return (
    <Box
      sx={{
        overflowY: "auto", // Vertical scrolling
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start", // Not center - allows proper scrolling
        height: "100%", // Takes full height of parent
        width: "100%", // Use full width of parent
        boxSizing: "border-box",
        padding: "8px 4px",
      }}
    >
      {labels.map((label, index) => (
        <Box
          key={index}
          sx={{
            display: "flex",
            alignItems: "center",
            marginBottom: "4px",
            width: "100%", // Full width
          }}
        >
          <Box
            sx={{
              width: "12px",
              height: "12px",
              backgroundColor: colors[index],
              border: `1px solid ${colors[index].replace("0.6", "1")}`,
              borderRadius: "2px",
              marginRight: "8px",
              flexShrink: 0,
            }}
          />
          <Typography
            variant="legendText"
            sx={{
              width: "100%", // Allow text to take remaining space
            }}
          >
            {label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default HTMLLegend;
