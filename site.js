const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const header = document.querySelector(".site-header");
const chapterLinks = Array.from(document.querySelectorAll(".site-nav a"));
const chapters = chapterLinks.map(link => document.querySelector(link.hash));

function updateChapter() {
  const readingLine = header.offsetHeight + 96;
  const current = chapters.findLastIndex(chapter => chapter.getBoundingClientRect().top <= readingLine);

  chapterLinks.forEach((link, index) => {
    if (index === current) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

let chapterUpdate;
function scheduleChapterUpdate() {
  if (chapterUpdate) return;
  chapterUpdate = requestAnimationFrame(() => {
    chapterUpdate = null;
    updateChapter();
  });
}

window.addEventListener("scroll", scheduleChapterUpdate, { passive: true });
window.addEventListener("resize", scheduleChapterUpdate);
updateChapter();

function observeVisibility(element, onChange) {
  const observer = new IntersectionObserver(([entry]) => {
    onChange(entry.isIntersecting && entry.intersectionRatio >= 0.25);
  }, { threshold: 0.25 });
  observer.observe(element);
}

function wireComparison(comparison) {
  const videos = Array.from(comparison.querySelectorAll("video"));
  const options = Array.from(comparison.querySelectorAll(".comparison-options button"));
  const playback = comparison.querySelector("[data-playback]");
  const timecode = comparison.querySelector("[data-timecode]");
  const message = comparison.querySelector(".video-message");

  let selected = 0;
  let shouldPlay = !motionPreference.matches;

  function updateControls() {
    const video = videos[selected];
    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    const progress = duration ? Math.min(video.currentTime / duration, 1) : 0;
    const seconds = Math.floor(video.currentTime);
    options[selected].style.setProperty("--progress", progress);
    playback.toggleAttribute("data-playing", !video.paused);
    playback.setAttribute("aria-label", video.paused ? "播放" : "暂停");
    timecode.textContent = [
      Math.floor(seconds / 60),
      String(seconds % 60).padStart(2, "0")
    ].join(":");
  }

  function showError() {
    message.textContent = "视频加载失败。请切换视频或点击播放重试。";
    message.hidden = false;
  }

  function playSelected() {
    const video = videos[selected];
    message.hidden = true;
    if (video.error) video.load();
    video.play().catch(error => {
      if (videos[selected] !== video || error.name === "AbortError") return;
      if (error.name !== "NotAllowedError") showError();
      updateControls();
    });
  }

  options.forEach((option, index) => {
    option.addEventListener("click", () => {
      const previous = videos[selected];
      const next = videos[index];

      if (next !== previous) {
        previous.pause();
        options[selected].setAttribute("aria-pressed", "false");
        selected = index;
        comparison.dataset.active = String(index);
        const sameMoment = previous.currentTime;
        next.currentTime = Number.isFinite(next.duration)
          ? Math.min(sameMoment, Math.max(0, next.duration - 0.05))
          : sameMoment;
        option.setAttribute("aria-pressed", "true");
      }

      shouldPlay = true;
      playSelected();
      updateControls();
    });
  });

  playback.addEventListener("click", () => {
    const video = videos[selected];
    shouldPlay = video.paused;
    if (shouldPlay) {
      playSelected();
    } else {
      video.pause();
    }
    updateControls();
  });

  videos.forEach(video => {
    ["loadedmetadata", "timeupdate", "play", "pause", "seeked", "error"].forEach(event => {
      video.addEventListener(event, () => {
        if (video !== videos[selected]) return;
        if (event === "error") showError();
        updateControls();
      });
    });
  });

  observeVisibility(comparison, visible => {
    if (visible && shouldPlay) {
      playSelected();
    } else if (!visible) {
      videos[selected].pause();
    }
  });
}

document.querySelectorAll("[data-comparison]").forEach(wireComparison);
document.querySelectorAll("[data-loop]").forEach(video => {
  observeVisibility(video, visible => {
    if (visible && !motionPreference.matches) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  });
});
