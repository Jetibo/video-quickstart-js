"use strict";

/**
 * Add URL parameters to the web app URL
 * This allows sharing the room via URL
 * @param {Object} params - the parameters to add (e.g., { roomName: 'MyRoom' })
 */
function addUrlParams(params) {
  // Combine existing URL params with new ones
  const combinedParams = Object.assign(getUrlParams(), params);

  // Serialize parameters into URL query string format
  const serializedParams = Object.entries(combinedParams)
    .map(([name, value]) => `${name}=${encodeURIComponent(value)}`)
    .join("&");

  // Update the browser URL without reloading the page
  history.pushState(null, "", `${location.pathname}?${serializedParams}`);
}

/**
 * Generate an object map of URL parameters
 * Parses the query string into a JavaScript object
 * @returns {Object} Object with parameter names as keys
 */
function getUrlParams() {
  // Get the query string part of the URL (everything after ?)
  const serializedParams = location.search.split("?")[1];

  // Split into name-value pairs
  const nvpairs = serializedParams ? serializedParams.split("&") : [];

  // Convert to object { paramName: paramValue }
  return nvpairs.reduce((params, nvpair) => {
    const [name, value] = nvpair.split("=");
    params[name] = decodeURIComponent(value);
    return params;
  }, {});
}

/**
 * Detect if the web app is running on a mobile browser
 * This is important because mobile browsers have different behavior
 * (e.g., camera stops when app is backgrounded)
 * @type {boolean}
 */
const isMobile = (() => {
  if (
    typeof navigator === "undefined" ||
    typeof navigator.userAgent !== "string"
  ) {
    return false;
  }
  // Check user agent string for mobile indicators
  return /Mobile/.test(navigator.userAgent);
})();

module.exports = {
  addUrlParams,
  getUrlParams,
  isMobile,
};
