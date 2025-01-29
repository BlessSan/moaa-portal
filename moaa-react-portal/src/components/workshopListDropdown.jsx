import { useQuery } from "@tanstack/react-query";
import Select from "react-select";
import { fetchMoaaWorkshopsList } from "../modules/fetchSheetsData";
import { Typography } from "@mui/material";

const WorkshopListDropdown = ({ workshopId, handleDropdownSelect }) => {
  const initialOption = [
    {
      value: "",
      label: "Get all aggregate data",
    },
  ];

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

  return (
    <>
      <Select
        isLoading={isLoading}
        options={[...initialOption, ...data]}
        onChange={handleDropdownSelect}
        styles={{
          control: (baseStyles, state) => ({
            ...baseStyles,
            borderColor: isError ? "red" : baseStyles.borderColor,
          }),
          menu: (baseStyles, state) => ({
            ...baseStyles,
            zIndex: 10,
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
