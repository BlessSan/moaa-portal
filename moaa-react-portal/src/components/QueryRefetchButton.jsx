import { useQueryClient } from "@tanstack/react-query";
import ReplayIcon from "@mui/icons-material/Replay";
import IconButton from "@mui/material/IconButton";
import Fab from "@mui/material/Fab";
import Box from "@mui/material/Box";

function QueryRefetchButton({ queryKey }) {
  const queryClient = useQueryClient();

  const handleRefetch = () => {
    // Refetch all queries
    queryClient.refetchQueries(queryKey);
  };

  return (
    <Box sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 10 }}>
      <Fab onClick={handleRefetch}>
        <ReplayIcon />
      </Fab>
    </Box>
  );
}

export default QueryRefetchButton;
