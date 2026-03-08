const video = document.getElementById("bgVideo");
const popupOverlay = document.getElementById("popupOverlay");
const yesButton = document.getElementById("yesButton");
const noButton = document.getElementById("noButton");

yesButton.addEventListener("click", async () => {
  popupOverlay.classList.add("hidden");
  video.muted = false;
  video.volume = 1.0;

  try {
    await video.play();
  } catch (error) {
    console.error("Video playback failed:", error);
    alert("Your browser blocked playback. Try clicking the page again.");
  }
});

noButton.addEventListener("click", () => {
  window.location.href = "https://www.adl.org";
});
