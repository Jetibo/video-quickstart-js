"use strict";

const { addUrlParams, getUrlParams } = require("./browser");
const getUserFriendlyError = require("./userfriendlyerror");

/**
 * Select your Room name and identity (screen name)
 * Shows a modal where user enters room name and username
 * @param {HTMLElement} modal - Bootstrap modal element for selecting room and identity
 * @param {Error|null} error - Error from the previous Room session, if any
 * @returns {Promise<Object|null>} Object with { identity, roomName } or null if user wants to change devices
 */
function selectRoom(modal, error) {
  // Get references to modal elements
  const alert = modal.querySelector("div.alert");
  const changeMediaButton = modal.querySelector("button.btn-dark");
  const identityInput = modal.querySelector("#screen-name");
  const joinButton = modal.querySelector("button.btn-primary");
  const roomNameInput = modal.querySelector("#room-name");

  // If Room name is provided as a URL parameter, pre-populate the field
  const { roomName } = getUrlParams();
  if (roomName) {
    roomNameInput.value = roomName;
  }

  // If any previously saved user name exists, pre-populate the field
  const identity = localStorage.getItem("userName");
  if (identity) {
    identityInput.value = identity;
  }

  // Display error message if there was one
  if (error) {
    alert.innerHTML = `<h5>${error.name}${error.message ? `: ${error.message}` : ""}</h5>${getUserFriendlyError(error)}`;
    alert.style.display = "";
  } else {
    alert.style.display = "none";
  }

  return new Promise((resolve) => {
    /**
     * Handler for when the modal is shown
     * Set up button click handlers
     */
    function onShow() {
      modal.removeEventListener("shown.bs.modal", onShow);

      // Handle "Change Microphone and Camera" button
      function onChangeMedia() {
        changeMediaButton.removeEventListener("click", onChangeMedia);
        // Close the modal using Bootstrap's jQuery API
        window.$(modal).modal("hide");
        // Resolve with null to signal we want to change devices
        resolve(null);
      }
      changeMediaButton.addEventListener("click", onChangeMedia);

      // Handle "Join" button
      function onJoin() {
        const identity = identityInput.value;
        const roomName = roomNameInput.value;

        // Only proceed if both fields are filled
        if (identity && roomName) {
          // Append the Room name to the web application URL
          // This allows sharing the room via URL
          addUrlParams({ roomName });

          // Save the user name for next time
          localStorage.setItem("userName", identity);

          joinButton.removeEventListener("click", onJoin);
          // Close the modal using Bootstrap's jQuery API
          window.$(modal).modal("hide");
        }
      }
      joinButton.addEventListener("click", onJoin);
    }
    modal.addEventListener("shown.bs.modal", onShow);

    /**
     * Handler for when the modal is hidden
     * Resolve with the entered values
     */
    function onHide() {
      modal.removeEventListener("hidden.bs.modal", onHide);
      const identity = identityInput.value;
      const roomName = roomNameInput.value;
      // Resolve with the form data
      resolve({ identity, roomName });
    }
    modal.addEventListener("hidden.bs.modal", onHide);

    // Show the modal using Bootstrap's jQuery API
    window.$(modal).modal({
      backdrop: "static", // Don't close on backdrop click
      focus: true, // Focus the modal
      keyboard: false, // Don't close on ESC key
      show: true, // Show the modal immediately
    });
  });
}

module.exports = selectRoom;
