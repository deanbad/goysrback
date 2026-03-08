const video = document.getElementById("bgVideo");
const popupOverlay = document.getElementById("popupOverlay");
const yesButton = document.getElementById("yesButton");
const noButton = document.getElementById("noButton");
const playCounter = document.getElementById("playCounter");
const playCountValue = document.getElementById("playCountValue");

const CONSENT_KEY = "goy-video-consent";
const COUNTER_ENDPOINT_BASE = ""; 
/*
  Set this to your counter API base later, for example:
  const COUNTER_ENDPOINT_BASE = "https://your-counter-api.example.com/counter";

  Expected API behavior:
  GET  /counter                  -> { "count": 123 }
  POST /counter/visit           -> { "count": 124 }
  POST /counter/play-complete   -> { "count": 125 }
*/

let playbackStarted = false;

function showCounter() {
  playCounter.classList.remove("hidden");
}

function hidePopup() {
  popupOverlay.classList.add("hidden");
}

function updateCounterText(count) {
  if (typeof count === "number" && Number.isFinite(count)) {
    playCountValue.textContent = String(count);
  }
}

async function fetchCurrentCount() {
  if (!COUNTER_ENDPOINT_BASE) {
    return;
  }

  try {
    const response = await fetch(COUNTER_ENDPOINT_BASE, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch count: ${response.status}`);
    }

    const data = await response.json();
    updateCounterText(data.count);
  } catch (error) {
    console.error("Failed to fetch current counter value:", error);
  }
}

async function incrementCounter(eventType) {
  if (!COUNTER_ENDPOINT_BASE) {
    return;
  }

  try {
    const response = await fetch(`${COUNTER_ENDPOINT_BASE}/${eventType}`, {
      method: "POST",
      headers: {
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to increment counter: ${response.status}`);
    }

    const data = await response.json();
    updateCounterText(data.count);
  } catch (error) {
    console.error(`Failed to increment counter for ${eventType}:`, error);
  }
}

async function startPlayback() {
  try {
    video.pause();
    video.currentTime = 0;
    video.muted = false;
    video.defaultMuted = false;
    video.volume = 1.0;
    await video.play();

    if (!playbackStarted) {
      playbackStarted = true;
      await incrementCounter("visit");
    }
  } catch (error) {
    console.error("Video playback failed:", error);
    alert("Playback or audio was blocked. Click the page and try again.");
  }
}

async function acceptAndPlay() {
  localStorage.setItem(CONSENT_KEY, "yes");
  hidePopup();
  showCounter();
  await startPlayback();
}

function rejectAndRedirect() {
  localStorage.setItem(CONSENT_KEY, "no");
  window.location.href = "https://www.adl.org";
}

async function init() {
  await fetchCurrentCount();

  const storedConsent = localStorage.getItem(CONSENT_KEY);

  if (storedConsent === "yes") {
    hidePopup();
    showCounter();
    await startPlayback();
    return;
  }

  if (storedConsent === "no") {
    rejectAndRedirect();
    return;
  }

  showCounter();
}

yesButton.addEventListener("click", async () => {
  await acceptAndPlay();
});

noButton.addEventListener("click", () => {
  rejectAndRedirect();
});

video.addEventListener("ended", async () => {
  await incrementCounter("play-complete");
});

init();
