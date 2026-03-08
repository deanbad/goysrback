const video = document.getElementById("bgVideo");
const popupOverlay = document.getElementById("popupOverlay");
const yesButton = document.getElementById("yesButton");
const noButton = document.getElementById("noButton");

yesButton.addEventListener("click", async () => {
  popupOverlay.classList.add("hidden");

  try {
    video.pause();
    video.currentTime = 0;
    video.muted = false;
    video.defaultMuted = false;
    video.volume = 1.0;
    await video.play();
  } catch (error) {
    console.error("Video playback failed:", error);
    alert("Playback or audio was blocked. Try clicking the page again.");
  }
});

noButton.addEventListener("click", () => {
  window.location.href = "https://www.adl.org";
});
