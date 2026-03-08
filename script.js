const video = document.getElementById("bgVideo");
const popupOverlay = document.getElementById("popupOverlay");
const yesButton = document.getElementById("yesButton");
const noButton = document.getElementById("noButton");
const playCountValue = document.getElementById("playCountValue");

let localPlayCount = Number(localStorage.getItem("localPlayCount") || "0");

function updateCounter() {
  playCountValue.textContent = String(localPlayCount);
  localStorage.setItem("localPlayCount", String(localPlayCount));
}

async function startVideo() {
  video.pause();
  video.currentTime = 0;
  video.muted = false;
  video.defaultMuted = false;
  video.volume = 1.0;
  await video.play();
}

yesButton.addEventListener("click", async () => {
  popupOverlay.classList.add("hidden");

  try {
    localPlayCount += 1;
    updateCounter();
    await startVideo();
  } catch (error) {
    console.error("Video playback failed:", error);
    alert("Playback was blocked. Click Yes again or refresh and try again.");
    popupOverlay.classList.remove("hidden");
  }
});

noButton.addEventListener("click", () => {
  window.location.href = "https://www.adl.org";
});

video.addEventListener("ended", () => {
  localPlayCount += 1;
  updateCounter();
});

updateCounter();
