const video = document.getElementById("bgVideo");
const popupOverlay = document.getElementById("popupOverlay");
const yesButton = document.getElementById("yesButton");
const noButton = document.getElementById("noButton");
const playCountValue = document.getElementById("playCountValue");

const COUNTER_NS = "thegoysarebackin.town";
const COUNTER_ACTION = "view";
const COUNTER_KEY = "goysrback-plays";

let loopCountArmed = true;
let jsonpRequestId = 0;

function setCount(value) {
  playCountValue.textContent = String(value ?? 0);
}

function jsonpCounterRequest(increment = false) {
  return new Promise((resolve, reject) => {
    jsonpRequestId += 1;

    const callbackName = `counterApiJsonpCallback_${Date.now()}_${jsonpRequestId}`;
    const script = document.createElement("script");
    const readOnly = increment ? "false" : "true";

    window[callbackName] = function (response) {
      cleanup();

      if (!response || typeof response.value === "undefined") {
        reject(new Error("CounterAPI returned an invalid response."));
        return;
      }

      resolve(response);
    };

    function cleanup() {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }

      try {
        delete window[callbackName];
      } catch (error) {
        window[callbackName] = undefined;
      }
    }

    script.onerror = function () {
      cleanup();
      reject(new Error("CounterAPI JSONP request failed."));
    };

    script.src =
      `https://counterapi.com/api/${encodeURIComponent(COUNTER_NS)}` +
      `/${encodeURIComponent(COUNTER_ACTION)}` +
      `/${encodeURIComponent(COUNTER_KEY)}` +
      `?readOnly=${readOnly}&callback=${encodeURIComponent(callbackName)}`;

    document.body.appendChild(script);

    window.setTimeout(() => {
      if (window[callbackName]) {
        cleanup();
        reject(new Error("CounterAPI JSONP request timed out."));
      }
    }, 8000);
  });
}

async function readCount() {
  try {
    const response = await jsonpCounterRequest(false);
    setCount(response.value);
  } catch (error) {
    console.warn("Counter read failed:", error);
    setCount("—");
  }
}

async function incrementCount() {
  try {
    const response = await jsonpCounterRequest(true);
    setCount(response.value);
  } catch (error) {
    console.warn("Counter increment failed:", error);
  }
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

readCount();
window.setInterval(readCount, 7000);
