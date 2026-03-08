const video = document.getElementById("bgVideo");
const popupOverlay = document.getElementById("popupOverlay");
const yesButton = document.getElementById("yesButton");
const noButton = document.getElementById("noButton");
const playCountValue = document.getElementById("playCountValue");

const COUNTER_NAMESPACE = "thegoysarebackin.town";
const COUNTER_ACTION = "view";
const COUNTER_KEY = "goysrback-plays";

let loopCountArmed = true;

function setCount(value) {
  playCountValue.textContent = String(value ?? 0);
}

function waitForCounterApi(timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    const check = () => {
      if (window.counterApi) {
        resolve(window.counterApi);
        return;
      }

      if (Date.now() - start >= timeoutMs) {
        reject(new Error("CounterAPI library did not load in time."));
        return;
      }

      window.setTimeout(check, 100);
    };

    check();
  });
}

async function readCount() {
  try {
    const counterApi = await waitForCounterApi();

    counterApi.read(
      COUNTER_KEY,
      COUNTER_ACTION,
      COUNTER_NAMESPACE,
      {},
      function (err, res) {
        if (err) {
          console.warn("Counter read failed:", err);
          playCountValue.textContent = "—";
          return;
        }

        setCount(res && res.value);
      }
    );
  } catch (error) {
    console.warn("CounterAPI unavailable:", error);
    playCountValue.textContent = "—";
  }
}

async function incrementCount() {
  try {
    const counterApi = await waitForCounterApi();

    counterApi.increment(
      COUNTER_KEY,
      COUNTER_ACTION,
      COUNTER_NAMESPACE,
      {},
      function (err, res) {
        if (err) {
          console.warn("Counter increment failed:", err);
          return;
        }

        setCount(res && res.value);
      }
    );
  } catch (error) {
    console.warn("CounterAPI unavailable:", error);
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
