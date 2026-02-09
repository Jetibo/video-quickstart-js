"use strict";

const { connect, createLocalVideoTrack, Logger } = require("twilio-video");
const { isMobile } = require("./browser");
const togglePip = require("./togglepip");

/**
 * Get references to DOM elements
 * These are the main UI components for the video chat interface
 */
const togglePipButton = document.getElementById("pip");
const leaveButton = document.getElementById("leave-room");
const roomElement = document.getElementById("room");
const activeParticipantContainer = roomElement.querySelector(
  "#active-participant .participant.main",
);
const activeVideoElement = activeParticipantContainer.querySelector("video");
const participantsContainer = roomElement.querySelector("#participants");

/**
 * Track which participant is currently shown in the main video area
 * This can be the local participant, the dominant speaker, or a pinned participant
 */
let activeParticipant = null;

/**
 * Track whether user has manually selected (pinned) a participant
 * When pinned, the active participant won't change even if someone else speaks
 */
let isActiveParticipantPinned = false;

// Hide picture-in-picture button if not supported by browser
if (!("documentPictureInPicture" in window)) {
  togglePipButton.style.display = "none";
}

/**
 * Display a participant's video in the main video area
 * This updates both the main video display and the thumbnail highlights
 * @param {Participant} participant - The participant to make active
 */
function setActiveParticipant(participant) {
  // If there's already an active participant, clean them up first
  if (activeParticipant) {
    const previousContainer = participantsContainer.querySelector(
      `#${activeParticipant.sid}`,
    );
    previousContainer.classList.remove("active", "pinned");

    // Remove their video from the main display
    const previousTrack = Array.from(activeParticipant.videoTracks.values())[0]
      ?.track;
    if (previousTrack) {
      previousTrack.detach(activeVideoElement);
      activeVideoElement.style.opacity = "0";
    }
  }

  // Set the new active participant
  activeParticipant = participant;
  const { identity, sid } = participant;
  const participantContainer = participantsContainer.querySelector(`#${sid}`);

  // Add visual indicators to show which participant is active
  participantContainer.classList.add("active");
  if (isActiveParticipantPinned) {
    participantContainer.classList.add("pinned");
  }

  // Show their video in the main display
  const track = Array.from(participant.videoTracks.values())[0]?.track;
  if (track) {
    track.attach(activeVideoElement);
    activeVideoElement.style.opacity = "";
  }

  // Update the identity label above the main video
  activeParticipantContainer.setAttribute("data-identity", identity);
}

/**
 * Set the active participant to the dominant speaker or local participant
 * The dominant speaker is determined by Twilio based on audio levels
 * Falls back to local participant if no one is speaking
 * @param {Room} room - The current room
 */
function setCurrentActiveParticipant(room) {
  const { dominantSpeaker, localParticipant } = room;
  setActiveParticipant(dominantSpeaker || localParticipant);
}

/**
 * Create a DOM container for a participant's video and audio
 * This creates the thumbnail view in the sidebar
 * @param {Participant} participant - The participant to set up
 * @param {Room} room - The room they joined
 */
function setupParticipantContainer(participant, room) {
  const { identity, sid } = participant;

  // Create container div with participant info
  const container = document.createElement("div");
  container.className = "participant";
  container.setAttribute("data-identity", identity);
  container.id = sid;

  // Create audio element (muted for local participant to prevent echo)
  const audio = document.createElement("audio");
  audio.autoplay = true;
  if (participant === room.localParticipant) {
    audio.muted = true; // Prevent hearing yourself
  }
  audio.style.opacity = "0"; // Audio elements are invisible

  // Create video element for thumbnail
  const video = document.createElement("video");
  video.autoplay = true;
  video.muted = true; // Thumbnails are always muted
  video.playsInline = true; // Important for mobile browsers
  video.style.opacity = "0"; // Hide until track is attached

  container.appendChild(audio);
  container.appendChild(video);

  /**
   * Click handler to pin/unpin a participant
   * Pinning keeps them as the active participant even when someone else speaks
   */
  container.addEventListener("click", () => {
    if (activeParticipant === participant && isActiveParticipantPinned) {
      // Unpin: let the dominant speaker algorithm take over again
      setVideoPriority(participant, null);
      isActiveParticipantPinned = false;
      setCurrentActiveParticipant(room);
    } else {
      // Pin this participant as the active one
      if (isActiveParticipantPinned) {
        // Clear priority from previously pinned participant
        setVideoPriority(activeParticipant, null);
      }
      // Request high priority for this participant's video
      setVideoPriority(participant, "high");
      isActiveParticipantPinned = true;
      setActiveParticipant(participant);
    }
  });

  // Add the participant's container to the sidebar
  participantsContainer.appendChild(container);
}

/**
 * Set video priority for a remote participant
 * Higher priority videos get better quality in bandwidth-constrained situations
 * This only works in Group Rooms (not Peer-to-Peer)
 * @param {RemoteParticipant} participant - The participant
 * @param {string|null} priority - 'low', 'standard', 'high', or null
 */
function setVideoPriority(participant, priority) {
  participant.videoTracks.forEach((publication) => {
    const track = publication.track;
    if (track && track.setPriority) {
      track.setPriority(priority);
    }
  });
}

/**
 * Attach a media track (audio or video) to the DOM
 * This makes the track visible/audible by connecting it to an HTML element
 * @param {Track} track - Audio or video track to display
 * @param {Participant} participant - The participant publishing the track
 */
function attachTrack(track, participant) {
  // Find the appropriate media element in the participant's thumbnail
  const container = participantsContainer.querySelector(`#${participant.sid}`);
  const mediaElement = container.querySelector(track.kind);

  // Make it visible and attach the track
  mediaElement.style.opacity = "";
  track.attach(mediaElement);

  // If it's a video track from the active participant, show it in main view too
  if (track.kind === "video" && participant === activeParticipant) {
    track.attach(activeVideoElement);
    activeVideoElement.style.opacity = "";
  }
}

/**
 * Remove a media track from the DOM
 * This is called when a track is unpublished or the participant disconnects
 * @param {Track} track - The track to detach
 * @param {Participant} participant - The participant who published it
 */
function detachTrack(track, participant) {
  // Remove from thumbnail view
  const container = participantsContainer.querySelector(`#${participant.sid}`);
  const mediaElement = container.querySelector(track.kind);
  mediaElement.style.opacity = "0";
  track.detach(mediaElement);
  mediaElement.srcObject = null; // Clean up the stream

  // Remove from main view if this was the active participant
  if (track.kind === "video" && participant === activeParticipant) {
    track.detach(activeVideoElement);
    activeVideoElement.srcObject = null;
    activeVideoElement.style.opacity = "0";
  }
}

/**
 * Handle a participant joining the room
 * Set up their UI and subscribe to their media tracks
 * @param {Participant} participant - The participant who joined
 * @param {Room} room - The room they joined
 */
function participantConnected(participant, room) {
  // Create their UI container (thumbnail in sidebar)
  setupParticipantContainer(participant, room);

  // Handle tracks they're already publishing
  participant.tracks.forEach((publication) => {
    trackPublished(publication, participant);
  });

  // Handle tracks they publish later (e.g., if they enable camera later)
  participant.on("trackPublished", (publication) => {
    trackPublished(publication, participant);
  });
}

/**
 * Handle a participant leaving the room
 * Clean up their UI elements
 * @param {Participant} participant - The participant who left
 * @param {Room} room - The room they left
 */
function participantDisconnected(participant, room) {
  // If the leaving participant was pinned, unpin them
  if (activeParticipant === participant && isActiveParticipantPinned) {
    isActiveParticipantPinned = false;
    setCurrentActiveParticipant(room);
  }

  // Remove their UI container from the sidebar
  const container = participantsContainer.querySelector(`#${participant.sid}`);
  if (container) {
    container.remove();
  }
}

/**
 * Handle a published track (audio or video)
 * Attach it to the UI when subscription completes
 * @param {TrackPublication} publication - The track publication
 * @param {Participant} participant - The publishing participant
 */
function trackPublished(publication, participant) {
  // If already subscribed, attach immediately
  if (publication.track) {
    attachTrack(publication.track, participant);
  }

  // Attach when subscription completes (for remote participants)
  publication.on("subscribed", (track) => {
    attachTrack(track, participant);
  });

  // Detach when unsubscribed (e.g., participant disabled their camera)
  publication.on("unsubscribed", (track) => {
    detachTrack(track, participant);
  });
}

/**
 * Main function to join a Twilio Video room
 * Handles the entire lifecycle of a video session
 * @param {string} token - Access token from server (authenticates the user)
 * @param {Object} connectOptions - Configuration options (devices, quality, etc.)
 * @returns {Promise} Resolves when the room is left, rejects on error
 */
async function joinRoom(token, connectOptions) {
  // Enable detailed logging for debugging (comment out for production)
  const logger = Logger.getLogger("twilio-video");
  logger.setLevel("debug");

  // Connect to the room using the token and options
  const room = await connect(token, connectOptions);

  // Save reference to our local video track (we'll need it for mobile handling)
  let localVideoTrack = Array.from(
    room.localParticipant.videoTracks.values(),
  )[0].track;

  // Make room available in browser console for debugging
  window.room = room;

  // Set up UI for local participant (ourselves)
  participantConnected(room.localParticipant, room);

  // Set up UI for participants already in the room
  room.participants.forEach((participant) => {
    participantConnected(participant, room);
  });

  // Handle new participants joining
  room.on("participantConnected", (participant) => {
    participantConnected(participant, room);
  });

  // Handle participants leaving
  room.on("participantDisconnected", (participant) => {
    participantDisconnected(participant, room);
  });

  // Set initial active participant (usually ourselves at first)
  setCurrentActiveParticipant(room);

  /**
   * Update active participant when dominant speaker changes
   * Only if user hasn't manually pinned someone
   */
  room.on("dominantSpeakerChanged", () => {
    if (!isActiveParticipantPinned) {
      setCurrentActiveParticipant(room);
    }
  });

  // Set up picture-in-picture button
  const togglePipHandler = () => togglePip("#room");
  togglePipButton.addEventListener("click", togglePipHandler);

  // Set up leave button
  function handleLeave() {
    leaveButton.removeEventListener("click", handleLeave);
    togglePipButton.removeEventListener("click", togglePipHandler);
    room.disconnect();
  }
  leaveButton.addEventListener("click", handleLeave);

  // Return a promise that resolves when we leave the room
  return new Promise((resolve, reject) => {
    // Leave room when page is closed or refreshed
    window.onbeforeunload = () => {
      room.disconnect();
    };

    /**
     * Mobile-specific handling
     * Mobile browsers need special handling for backgrounding
     */
    if (isMobile) {
      // iOS Safari doesn't fire beforeunload, use pagehide instead
      window.onpagehide = () => {
        room.disconnect();
      };

      /**
       * Handle app backgrounding on mobile
       * When app goes to background, we can't capture video anymore
       * When it comes back to foreground, we need to restart video capture
       */
      document.onvisibilitychange = async () => {
        if (document.visibilityState === "hidden") {
          // App backgrounded: stop and unpublish video to free the camera
          localVideoTrack.stop();
          room.localParticipant.unpublishTrack(localVideoTrack);
        } else {
          // App foregrounded: create and publish new video track
          localVideoTrack = await createLocalVideoTrack(connectOptions.video);
          await room.localParticipant.publishTrack(localVideoTrack);
        }
      };
    }

    /**
     * Handle room disconnect
     * This fires when we leave intentionally or are disconnected unexpectedly
     */
    room.once("disconnected", (room, error) => {
      // Clean up event handlers to prevent memory leaks
      window.onbeforeunload = null;
      if (isMobile) {
        window.onpagehide = null;
        document.onvisibilitychange = null;
      }

      // Stop our video track to release the camera
      localVideoTrack.stop();

      // Clean up UI for all participants
      participantDisconnected(room.localParticipant, room);
      room.participants.forEach((participant) => {
        participantDisconnected(participant, room);
      });

      // Clear main video element
      activeVideoElement.srcObject = null;

      // Clean up debug reference
      window.room = null;

      // Resolve or reject the promise based on how we disconnected
      if (error) {
        reject(error); // Something went wrong (network error, kicked out, etc.)
      } else {
        resolve(); // Normal disconnect (user clicked Leave Room)
      }
    });
  });
}

module.exports = joinRoom;
