import { useQuery } from "@tanstack/react-query";
import Select from "react-select";
import { fetchMoaaWorkshopsList } from "../modules/fetchSheetsData";
import { Typography } from "@mui/material";

const WorkshopListDropdown = ({ workshopId, handleDropdownSelect }) => {
  const {
    isPending,
    isError,
    data = [],
    error,
    isLoading,
    isRefetching,
    status,
  } = useQuery({
    queryKey: ["workshopList"],
    queryFn: fetchMoaaWorkshopsList,
  });

  console.log("status", status);

  const options = data.map((workshop) => ({
    value: workshop,
    label: workshop,
  }));

  return (
    <>
      <Select
        isLoading={isLoading}
        options={options}
        onChange={handleDropdownSelect}
        styles={{
          control: (baseStyles, state) => ({
            ...baseStyles,
            borderColor: isError ? "red" : baseStyles.borderColor,
          }),
        }}
      />
      {isError ? (
        <Typography overline color="error">
          {error.message}
        </Typography>
      ) : null}
    </>
  );
};

export default WorkshopListDropdown;
