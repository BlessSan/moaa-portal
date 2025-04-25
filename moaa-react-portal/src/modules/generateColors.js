// Predefined colors array
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

/**
 * Gets the maximum number of CSS chart color variables defined
 * @returns {number} The number of CSS color variables found
 */
const getMaxCssColorVariables = () => {
  // Check how many CSS variables are defined
  let maxVars = 0;
  try {
    let i = 1;
    while (true) {
      const cssColor = getComputedStyle(document.documentElement)
        .getPropertyValue(`--chart-color-${i}`)
        .trim();

      if (!cssColor || cssColor === "") {
        break; // Stop at the first undefined variable
      }
      maxVars = i;
      i++;

      // Safety check - don't check beyond a reasonable number
      if (i > 100) break;
    }
  } catch (e) {
    console.warn("Error checking CSS variables", e);
  }

  return maxVars;
};

/**
 * Generates background colors for charts, checking for CSS variables first
 * @param {number} count - Number of colors to generate
 * @returns {string[]} Array of color strings
 */
export const generateColors = (count) => {
  // Check how many CSS color variables are defined
  const maxCssVars = getMaxCssColorVariables();
  const totalColorPool = Math.max(maxCssVars, predefinedColors.length);

  // Function to get color by index, handling cycling for both CSS and fallback colors
  const getColorByIndex = (index) => {
    // Calculate the actual index to use after cycling
    const cycledIndex = index % totalColorPool;
    const cssVarIndex = cycledIndex + 1; // CSS variables are 1-based

    try {
      // Try to get CSS variable (if within defined range)
      if (cycledIndex < maxCssVars) {
        const cssColor = getComputedStyle(document.documentElement)
          .getPropertyValue(`--chart-color-${cssVarIndex}`)
          .trim();

        if (cssColor && cssColor !== "") {
          return cssColor;
        }
      }
    } catch (e) {
      console.warn(
        "Error accessing CSS variables, falling back to defaults",
        e
      );
    }

    // Fall back to predefined colors (always cycles)
    return predefinedColors[cycledIndex % predefinedColors.length];
  };

  // Create array of colors based on count
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(getColorByIndex(i));
  }

  return colors;
};

/**
 * Generates border colors by setting the opacity of background colors to 1
 * @param {string[]} backgroundColors - Array of background colors
 * @returns {string[]} Array of border colors
 */
export const generateBorderColors = (backgroundColors) => {
  return backgroundColors.map((color) => {
    // Handle RGBA format
    if (color.startsWith("rgba")) {
      return color.replace(
        /rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/,
        "rgba($1, $2, $3, 1)"
      );
    }
    // Handle RGB format (already fully opaque)
    else if (color.startsWith("rgb(")) {
      return color;
    }
    // Handle hex with alpha (#RRGGBBAA)
    else if (color.startsWith("#") && color.length === 9) {
      return color.substring(0, 7); // Remove alpha component
    }
    // Handle other formats - just return as is
    return color;
  });
};
