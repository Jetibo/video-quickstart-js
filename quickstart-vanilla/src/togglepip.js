"use strict";

/**
 * Toggle Picture-in-Picture mode for the video room
 * Creates a floating window with the video content
 * @param {string} selector - CSS selector for the content to show in PiP (e.g., '#room')
 */
async function togglePip(selector) {
  // If PiP window is already open, close it
  if (documentPictureInPicture.window) {
    documentPictureInPicture.window.close();
    return;
  }

  // Get the content element to show in PiP
  const content = document.querySelector(selector);
  const parent = content.parentElement; // Save parent to restore later

  // Request a new Picture-in-Picture window
  const pipWindow = await documentPictureInPicture.requestWindow();

  // Copy all styles from the main window to the PiP window
  // This ensures the video looks the same in PiP
  [...document.styleSheets].forEach((styleSheet) => {
    const cssRules = [...styleSheet.cssRules]
      .map((rule) => rule.cssText)
      .join("");
    const style = document.createElement("style");
    style.textContent = cssRules;
    pipWindow.document.head.appendChild(style);
  });

  // Move the content into the PiP window
  pipWindow.document.body.append(content);

  /**
   * When the PiP window closes, move the content back to its original location
   * This ensures the video continues in the main window
   */
  pipWindow.addEventListener("pagehide", (event) => {
    const content = event.target.querySelector(selector);
    parent.append(content);
  });
}

module.exports = togglePip;
