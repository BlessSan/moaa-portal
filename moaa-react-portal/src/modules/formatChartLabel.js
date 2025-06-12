export const formatChartLabel = (
  name,
  isWorkshopTable,
  worksheetName,
  workshopName
) => {
  const aggregateString = "ALL MOAA TAKERS";
  const aggregateLabel = "Aggregate";

  if (!isWorkshopTable) {
    return aggregateString;
  }
  //if label from api is "Aggregate" change to formatted aggregate label
  if (name === aggregateLabel) {
    return `${worksheetName.toUpperCase()} - ${aggregateString}`;
  } else {
    // TODO: format workshop name. Now its NAME - DATE, format to NAME
    return `${worksheetName.toUpperCase()} - ${workshopName.toUpperCase()}`;
  }
};
