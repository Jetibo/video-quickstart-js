"use strict";

const { isSupported } = require("twilio-video");
const { isMobile } = require("./browser");
const joinRoom = require("./joinroom");
const micLevel = require("./miclevel");
const selectMedia = require("./selectmedia");
const selectRoom = require("./selectroom");
const showError = require("./showerror");

/**
 * Get references to modal elements from the DOM
 * These are Bootstrap modals that show different UI stages
 */
const modals = document.getElementById("modals");
const selectMicModal = modals.querySelector("#select-mic");
const selectCameraModal = modals.querySelector("#select-camera");
const showErrorModal = modals.querySelector("#show-error");
const joinRoomModal = modals.querySelector("#join-room");

/**
 * ConnectOptions specify settings for connecting to a Twilio Video Room.
 * These options configure quality, bandwidth, and room behavior.
 */
const connectOptions = {
  // Bandwidth profile helps optimize video quality based on network conditions
  // Only available in Small Group or Group Rooms (not Peer-to-Peer)
  // Set "Room Type" to "Group" or "Small Group" in Twilio Console:
  // https://www.twilio.com/console/video/configure
  bandwidthProfile: {
    video: {
      dominantSpeakerPriority: "high", // Prioritize the active speaker's video
      mode: "collaboration", // Optimized for video conferences (vs presentation mode)
      clientTrackSwitchOffControl: "auto", // Automatically manage track switching
      contentPreferencesMode: "auto", // Automatically adjust content preferences
    },
  },

  // Enable dominant speaker detection (person talking most gets highlighted)
  // Available only in Small Group or Group Rooms
  dominantSpeaker: true,

  // Limit audio bitrate to 16kbps (reduces bandwidth, fine for voice)
  // Comment this line if you are playing music as it needs higher bitrate
  maxAudioBitrate: 16000,

  // Use VP8 codec with simulcast for adaptive video quality
  // Simulcast enables the server to adapt video quality per participant
  // based on their bandwidth. Only works in Small Group or Group Rooms.
  preferredVideoCodecs: [{ codec: "VP8", simulcast: true }],

  // Request 720p video at 24 frames per second from the camera
  video: { height: 720, frameRate: 24, width: 1280 },
};

/**
 * On mobile devices, limit incoming video bitrate to 2.5 Mbps
 * This prevents excessive data usage and improves performance on cellular
 */
if (isMobile) {
  connectOptions.bandwidthProfile.video.maxSubscriptionBitrate = 2500000;
}

/**
 * Store selected device IDs (microphone and camera)
 * On mobile, we always prompt for device selection because other apps
 * might have reserved the devices even if user previously granted permission
 */
const deviceIds = {
  audio: isMobile ? null : localStorage.getItem("audioDeviceId"),
  video: isMobile ? null : localStorage.getItem("videoDeviceId"),
};

/**
 * Main flow: Select room name and username, then join the room
 * This function handles the room selection and joining process
 * @param {Error|null} error - Error from previous attempt, if any
 */
async function selectAndJoinRoom(error = null) {
  // Show the room selection modal and wait for user input
  const formData = await selectRoom(joinRoomModal, error);

  if (!formData) {
    // User clicked "Change Microphone and Camera" button
    // Reset device selections and start the device selection flow again
    deviceIds.audio = null;
    deviceIds.video = null;
    return selectMicrophone();
  }

  const { identity, roomName } = formData;

  try {
    // Request an access token from our server
    // The server generates a token that authenticates this user to join the room
    const response = await fetch(`/token?identity=${identity}`);
    const token = await response.text();

    // Configure which microphone to use (exact device match)
    connectOptions.audio = { deviceId: { exact: deviceIds.audio } };

    // Set the room name to join
    connectOptions.name = roomName;

    // Configure which camera to use (exact device match)
    connectOptions.video.deviceId = { exact: deviceIds.video };

    // Join the room with our configuration
    await joinRoom(token, connectOptions);

    // After leaving the room, show the room selection modal again
    return selectAndJoinRoom();
  } catch (error) {
    // If something went wrong (network error, room error, etc.),
    // show the error and let user try again
    return selectAndJoinRoom(error);
  }
}

/**
 * Prompt user to select their camera
 * Shows a live preview of the selected camera
 */
async function selectCamera() {
  if (deviceIds.video === null) {
    try {
      // Show camera selection modal with video preview
      // The callback attaches the video track to the preview element
      deviceIds.video = await selectMedia(
        "video",
        selectCameraModal,
        (videoTrack) => {
          const video = selectCameraModal.querySelector("video");
          videoTrack.attach(video);
        },
      );
    } catch (error) {
      // Handle errors like permission denied, device not found, etc.
      showError(showErrorModal, error);
      return;
    }
  }
  // After camera selection, move to room selection
  return selectAndJoinRoom();
}

/**
 * Prompt user to select their microphone
 * Shows a visual level indicator for the selected microphone
 */
async function selectMicrophone() {
  if (deviceIds.audio === null) {
    try {
      // Show microphone selection modal with audio level indicator
      // The callback updates the level indicator based on audio input
      deviceIds.audio = await selectMedia(
        "audio",
        selectMicModal,
        (audioTrack) => {
          const levelIndicator = selectMicModal.querySelector("svg rect");
          const maxLevel = Number(levelIndicator.getAttribute("height"));

          // Update the level indicator as audio levels change
          micLevel(audioTrack, maxLevel, (level) => {
            levelIndicator.setAttribute("y", maxLevel - level);
          });
        },
      );
    } catch (error) {
      // Handle errors like permission denied, device not found, etc.
      showError(showErrorModal, error);
      return;
    }
  }
  // After microphone selection, move to camera selection
  return selectCamera();
}

/**
 * Initialize the application when the page loads
 * Check if browser is supported by twilio-video.js, then start the flow
 */
window.addEventListener("load", () => {
  if (isSupported) {
    // Browser is supported, start with microphone selection
    selectMicrophone();
  } else {
    // Browser is not supported, show error message
    showError(showErrorModal, new Error("This browser is not supported."));
  }
});
