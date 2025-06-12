export const extractPercentage = (value, isRounded) => {
  if (typeof value === "string") {
    // Check if value matches pattern: "number (percentage%)"
    const match = value.match(/^\d+\s*\((\d+(?:\.\d+)?)%\)$/);
    if (match) {
      if (isRounded) {
        const percentage = parseFloat(match[1]);
        return `${Math.round(percentage)}%`;
      } else {
        return `${match[1]}%`;
      }
    }
  }
  return value;
};
