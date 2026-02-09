"use strict";

const { createLocalTracks } = require("twilio-video");

/**
 * Store currently active local tracks (audio and video)
 * We need to keep track of these so we can stop them when switching devices
 */
const localTracks = {
  audio: null,
  video: null,
};

/**
 * Start capturing media from the given input device
 * This creates a new LocalTrack and renders it for preview
 * @param {string} kind - 'audio' or 'video'
 * @param {string} deviceId - the input device ID
 * @param {Function} render - callback function to render the track
 * @returns {Promise<void>} Promise that resolves when successful
 */
async function applyInputDevice(kind, deviceId, render) {
  // Create a new LocalTrack from the given Device ID
  // This starts capturing from the selected microphone or camera
  const [track] = await createLocalTracks({ [kind]: { deviceId } });

  // Stop the previous LocalTrack, if present
  // This releases the previous device
  if (localTracks[kind]) {
    localTracks[kind].stop();
  }

  // Store and render the current LocalTrack
  localTracks[kind] = track;
  render(track);
}

/**
 * Get the list of input devices of a given kind
 * @param {string} kind - 'audio' | 'video'
 * @returns {Promise<MediaDeviceInfo[]>} the list of media devices
 */
async function getInputDevices(kind) {
  // Enumerate all media devices
  const devices = await navigator.mediaDevices.enumerateDevices();
  // Filter to only audio or video input devices
  return devices.filter((device) => device.kind === `${kind}input`);
}

/**
 * Select the input device for the given media kind
 * Shows a modal with device options and live preview
 * @param {string} kind - 'audio' or 'video'
 * @param {HTMLElement} modal - the Bootstrap modal element for selecting the media input
 * @param {Function} render - callback function to render the track preview
 * @returns {Promise<string>} the device ID of the selected media input
 */
async function selectMedia(kind, modal, render) {
  // Get references to modal elements
  const applyButton = modal.querySelector("button");
  const inputDevicesSelect = modal.querySelector("select");

  // Function to apply the currently selected device
  const setDevice = () =>
    applyInputDevice(kind, inputDevicesSelect.value, render);

  // Get the list of available media input devices
  let devices = await getInputDevices(kind);

  // Apply the default media input device (first one in the list)
  await applyInputDevice(kind, devices[0].deviceId, render);

  // If all device IDs and/or labels are empty, that means they were
  // enumerated before the user granted media permissions.
  // After permission is granted, enumerate again to get the actual labels.
  if (devices.every(({ deviceId, label }) => !deviceId || !label)) {
    devices = await getInputDevices(kind);
  }

  // Populate the dropdown with the list of available media input devices
  inputDevicesSelect.innerHTML = devices
    .map(({ deviceId, label }) => {
      return `<option value="${deviceId}">${label}</option>`;
    })
    .join("");

  return new Promise((resolve) => {
    /**
     * Handler for when the modal is shown
     * Set up event listeners for device selection and apply button
     */
    function onShow() {
      modal.removeEventListener("shown.bs.modal", onShow);

      // When the user selects a different media input device, apply it
      inputDevicesSelect.addEventListener("change", setDevice);

      // When the user clicks the "Apply" button, close the modal
      function onApply() {
        inputDevicesSelect.removeEventListener("change", setDevice);
        applyButton.removeEventListener("click", onApply);
        // Close the modal using Bootstrap's jQuery API
        window.$(modal).modal("hide");
      }
      applyButton.addEventListener("click", onApply);
    }
    modal.addEventListener("shown.bs.modal", onShow);

    /**
     * Handler for when the modal is hidden
     * Save the selected device and clean up
     */
    function onHide() {
      modal.removeEventListener("hidden.bs.modal", onHide);

      // Stop the LocalTrack to release the device
      if (localTracks[kind]) {
        localTracks[kind].stop();
        localTracks[kind] = null;
      }

      // Save the selected device ID to localStorage for next time
      const deviceId = inputDevicesSelect.value;
      localStorage.setItem(`${kind}DeviceId`, deviceId);

      // Resolve the Promise with the saved device ID
      resolve(deviceId);
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

module.exports = selectMedia;
