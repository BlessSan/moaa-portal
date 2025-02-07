import { useQuery } from "@tanstack/react-query";
import Select from "react-select";
import {
  fetchMoaaPartnersList,
  fetchMoaaWorkshopsList,
} from "../modules/fetchSheetsData";
import { Typography } from "@mui/material";

export const WorkshopListDropdown = ({
  workshopOption,
  handleDropdownSelect,
}) => {
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
        value={workshopOption}
        placeholder="Select Workshop Id"
        noOptionsMessage={() => <div>No Workshop Id Recorded</div>}
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

export const PartnerListDropdown = ({
  partnerOption,
  handleDropdownSelect,
}) => {
  const {
    isPending,
    isError,
    data = [],
    error,
    isLoading,
    isRefetching,
    status,
  } = useQuery({
    queryKey: ["partnersList"],
    queryFn: fetchMoaaPartnersList,
  });

  return (
    <>
      <Select
        isLoading={isLoading}
        options={data}
        onChange={handleDropdownSelect}
        value={partnerOption}
        placeholder="Select Partner Id"
        noOptionsMessage={() => <div>No Partner Id Recorded</div>}
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
