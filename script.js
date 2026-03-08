const video = document.getElementById("bgVideo");
const popupOverlay = document.getElementById("popupOverlay");
const yesButton = document.getElementById("yesButton");
const noButton = document.getElementById("noButton");
const playCountValue = document.getElementById("playCountValue");

const COUNTER_NS = "thegoysarebackin.town";
const COUNTER_ACTION = "view";
const COUNTER_KEY = "goysrback-plays";

let loopCountArmed = true;

async function fetchCount(increment = false) {
  try {
    const url = `https://counterapi.com/api/${encodeURIComponent(COUNTER_NS)}/${encodeURIComponent(COUNTER_ACTION)}/${encodeURIComponent(COUNTER_KEY)}?readOnly=${increment ? "false" : "true"}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Counter request failed with status ${response.status}`);
    }

    const data = await response.json();
    playCountValue.textContent = String(data.value ?? 0);
  } catch (error) {
    console.warn("Counter fetch failed:", error);
    playCountValue.textContent = "—";
  }
}

async function incrementCount() {
  await fetchCount(true);
}

async function startVideoWithAudio() {
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
    await startVideoWithAudio();
    loopCountArmed = true;
    await incrementCount();
  } catch (error) {
    console.error("Video playback failed:", error);
    popupOverlay.classList.remove("hidden");
    alert("Playback was blocked. Click Yes again.");
  }
});

noButton.addEventListener("click", () => {
  window.location.href = "https://www.adl.org";
});

video.addEventListener("timeupdate", async () => {
  if (!Number.isFinite(video.duration) || video.duration <= 0) {
    return;
  }

  const timeRemaining = video.duration - video.currentTime;

  if (timeRemaining <= 0.35 && loopCountArmed) {
    loopCountArmed = false;
    await incrementCount();
    return;
  }

  if (video.currentTime < 1) {
    loopCountArmed = true;
  }
});

fetchCount();
