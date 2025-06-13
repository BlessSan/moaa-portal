/**
 * Label formatting for bar and pie chart
 *
 * Formats chart label to be:
 * [worksheetName] - YOUR GROUP (if its for aggregate chart)
 * [worksheetName] - ALL MOAA TAKERS (if its for non aggreagate)
 * @param {*} label - label given from api in datasets[].label either aggregate or the workshopID
 * @param {*} worksheetName - The worksheet name
 * @param {*} datasetIndex - index of the dataset inside the data array
 * @returns String
 */
export const formatChartLabel = (label, worksheetName, datasetIndex) => {
  const aggregateString = "ALL MOAA TAKERS";
  const integratorChangeRequiredWorksheet = "Integrator Change Required";
  const integratorChangeRequiredChartSecondDatasetLabel =
    "VISIONARY & INTEGRATOR";
  const aggregateLabel = "Aggregate";
  worksheetName = worksheetName.replace(/^Aggregate\s+/, "");
  if (
    worksheetName === integratorChangeRequiredWorksheet &&
    datasetIndex === 1
  ) {
    worksheetName = integratorChangeRequiredChartSecondDatasetLabel;
  }
  //if label from api is "Aggregate" change to formatted aggregate label
  if (label === aggregateLabel) {
    return `${worksheetName.toUpperCase()} - ${aggregateString}`;
  } else {
    return `${worksheetName.toUpperCase()} - YOUR GROUP`;
  }
};
