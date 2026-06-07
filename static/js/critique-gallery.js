// Put your own image files in static/images and set these paths, e.g.
// "./static/images/critique-initial.jpg".
const INITIAL_PLAN_IMAGE_SRC = "";

const CRITIQUE_CASES = {
  sidewalk: {
    path: "M 170 238 C 170 206, 170 179, 170 150 C 170 132, 184 122, 206 120",
    // Optional: use a different refined image for this selected critique.
    refinedImageSrc: ""
  },
  curb: {
    path: "M 166 238 C 166 210, 156 191, 144 172 C 134 156, 138 142, 158 132 C 176 122, 192 120, 206 120",
    refinedImageSrc: ""
  },
  corridor: {
    path: "M 170 238 C 170 204, 170 176, 176 154 C 182 136, 194 125, 216 120",
    refinedImageSrc: ""
  }
};

function setPlanImage(figure, imageSrc) {
  const image = figure ? figure.querySelector(".plan-image") : null;
  const src = imageSrc ? imageSrc.trim() : "";

  if (!figure || !image) return;

  figure.classList.remove("has-image");
  image.removeAttribute("src");

  if (!src) return;

  image.onload = () => figure.classList.add("has-image");
  image.onerror = () => figure.classList.remove("has-image");
  image.src = src;
}

function initCritiqueGallery() {
  const gallery = document.getElementById("critiqueGallery");
  if (!gallery) return;

  const buttons = Array.from(gallery.querySelectorAll(".reasoning-card"));
  const refinedPath = document.getElementById("refinedPlanPath");
  const thinking = document.getElementById("refinedThinking");
  const initialFigure = document.getElementById("initialPlanFigure");
  const refinedFigure = document.getElementById("refinedPlanFigure");

  if (!buttons.length || !refinedPath || !thinking || !initialFigure || !refinedFigure) return;

  setPlanImage(initialFigure, INITIAL_PLAN_IMAGE_SRC);

  const selectCritique = (key, showThinking = true) => {
    const selected = CRITIQUE_CASES[key];
    if (!selected) return;

    buttons.forEach((button) => {
      const isActive = button.dataset.critique === key;
      button.classList.toggle("is-selected", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    if (showThinking) {
      thinking.classList.add("is-visible");
      refinedPath.classList.add("is-muted");
      window.setTimeout(() => {
        refinedPath.setAttribute("d", selected.path);
        setPlanImage(refinedFigure, selected.refinedImageSrc);
        refinedPath.classList.remove("is-muted");
        thinking.classList.remove("is-visible");
      }, 260);
    } else {
      refinedPath.setAttribute("d", selected.path);
      setPlanImage(refinedFigure, selected.refinedImageSrc);
    }
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => selectCritique(button.dataset.critique));
  });

  selectCritique("sidewalk", false);
}

document.addEventListener("DOMContentLoaded", initCritiqueGallery);
