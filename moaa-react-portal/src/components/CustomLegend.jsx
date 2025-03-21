import { Box, Typography } from "@mui/material";

/**
 * Custom HTML Legend component
 */
const HTMLLegend = ({ labels, colors }) => {
  return (
    <Box
      sx={{
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "center",
      }}
    >
      {labels.map((label, index) => (
        <Box
          key={index}
          sx={{
            display: "flex",
            alignItems: "center",
            marginBottom: "4px",
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
          <Typography variant="body2" sx={{ fontSize: "11px" }}>
            {label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default HTMLLegend;
