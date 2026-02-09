"use strict";

// Get AudioContext (with webkit prefix for Safari)
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = AudioContext ? new AudioContext() : null;

/**
 * Calculate the root mean square (RMS) of the given array
 * RMS is a statistical measure of the magnitude of a varying quantity
 * Used here to measure audio level
 * @param {Array} samples - Array of audio sample values
 * @returns {number} the RMS value
 */
function rootMeanSquare(samples) {
  const sumSq = samples.reduce((sumSq, sample) => sumSq + sample * sample, 0);
  return Math.sqrt(sumSq / samples.length);
}

/**
 * Poll the microphone's input level and call a callback with the level
 * This creates an audio analyzer that monitors microphone input in real-time
 * @param {AudioTrack} audioTrack - the AudioTrack representing the microphone
 * @param {number} maxLevel - the calculated level should be in the range [0 - maxLevel]
 * @param {Function} onLevel - called when the input level changes
 */
module.exports = audioContext
  ? function micLevel(audioTrack, maxLevel, onLevel) {
      // Resume the audio context (required by browser autoplay policies)
      audioContext.resume().then(() => {
        let rafID; // Animation frame ID for cleanup

        /**
         * Initialize the audio analyzer
         * Creates an analyser node and connects it to the audio track
         */
        const initializeAnalyser = () => {
          // Create an analyser node to get frequency data
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 1024; // Number of samples for FFT
          analyser.smoothingTimeConstant = 0.5; // Smooth out rapid changes

          // Convert the audio track to a MediaStream
          const stream = new MediaStream([audioTrack.mediaStreamTrack]);
          const audioSource = audioContext.createMediaStreamSource(stream);
          const samples = new Uint8Array(analyser.frequencyBinCount);

          // Connect the audio source to the analyser
          audioSource.connect(analyser);

          // Start animating the level indicator
          startAnimation(analyser, samples);
        };

        // Initialize the analyser
        initializeAnalyser();

        // If the audio track is restarted (e.g., on mobile after backgrounding),
        // reinitialize the analyser
        audioTrack.on("started", initializeAnalyser);

        let level = null; // Track previous level to avoid unnecessary updates

        /**
         * Animation loop to continuously check audio level
         * @param {AnalyserNode} analyser - The audio analyser node
         * @param {Uint8Array} samples - Array to store frequency data
         */
        function startAnimation(analyser, samples) {
          // Cancel any previous animation frame
          window.cancelAnimationFrame(rafID);

          rafID = requestAnimationFrame(function checkLevel() {
            // Get the current frequency data from the microphone
            analyser.getByteFrequencyData(samples);

            // Calculate the RMS (average volume level)
            const rms = rootMeanSquare(samples);

            // Convert to logarithmic scale (matches human perception of volume)
            const log2Rms = rms && Math.log2(rms);

            // Scale to the desired range (0 to maxLevel)
            const newLevel = Math.ceil((maxLevel * log2Rms) / 8);

            // Only call the callback if level has changed
            if (level !== newLevel) {
              level = newLevel;
              onLevel(level);
            }

            // Continue the animation loop
            // If the track has ended, reset level to 0
            rafID = requestAnimationFrame(
              audioTrack.mediaStreamTrack.readyState === "ended"
                ? () => onLevel(0)
                : checkLevel,
            );
          });
        }
      });
    }
  : function notSupported() {
      // AudioContext not supported, do nothing
      // This is for older browsers that don't support Web Audio API
    };
