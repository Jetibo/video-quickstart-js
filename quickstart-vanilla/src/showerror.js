"use strict";

const getUserFriendlyError = require("./userfriendlyerror");

/**
 * Show an error message in a modal
 * This is used when something goes wrong (permissions denied, device not found, etc.)
 * @param {HTMLElement} modal - Bootstrap modal element for showing the error
 * @param {Error} error - Error to be shown
 */
function showError(modal, error) {
  // Get references to modal elements
  const alert = modal.querySelector("div.alert");
  const errorLabel = modal.querySelector("#show-error-label");

  // Set the error title (error name and message)
  errorLabel.textContent = `${error.name}${error.message ? `: ${error.message}` : ""}`;

  // Add the user-friendly error explanation to the alert
  alert.innerHTML = getUserFriendlyError(error);

  // Show the modal using Bootstrap's jQuery API
  window.$(modal).modal({
    backdrop: "static", // Don't close on backdrop click
    focus: true, // Focus the modal
    keyboard: false, // Don't close on ESC key
    show: true, // Show the modal immediately
  });
}

module.exports = showError;
