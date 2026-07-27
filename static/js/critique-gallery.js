const SCENARIOS = {
  signs: {
    initialImageSrc: "./static/images/critique_refine_plans/foresight%20sign/image_og.webp",
    critiques: [
      {
        key: "sign_arrow",
        text: "<fix>steer left toward the building entrance with the orange awning</fix>",
        refinedImageSrc: "./static/images/critique_refine_plans/foresight%20sign/image_1.webp"
      },
      {
        key: "sign_avoid",
        text: "<fix>steer left away from the bushes to get to the entrance</fix>",
        refinedImageSrc: "./static/images/critique_refine_plans/foresight%20sign/image_2.webp"
      },
      {
        key: "sign_align",
        text: "<fix>steer right to look at the sign in the middle</fix>",
        refinedImageSrc: "./static/images/critique_refine_plans/foresight%20sign/image_3.webp"
      }
    ]
  },
  detours: {
    initialImageSrc: "./static/images/critique_refine_plans/foresight%20detour/image.webp",
    critiques: [
      {
        key: "detour_block",
        text: "<fix>steer right toward the building entrance</fix>",
        refinedImageSrc: "./static/images/critique_refine_plans/foresight%20detour/image%20(1).webp"
      },
      {
        key: "detour_opening",
        text: "<fix>make a sharp right to avoid the cones</fix>",
        refinedImageSrc: "./static/images/critique_refine_plans/foresight%20detour/image%20(2).webp"
      },
      {
        key: "detour_clearance",
        text: "<fix>go left and straight close to the cones</fix>",
        refinedImageSrc: "./static/images/critique_refine_plans/foresight%20detour/image%20(3).webp"
      }
    ]
  },
  structural: {
    initialImageSrc: "./static/images/critique_refine_plans/foresight%20struct/image.webp",
    critiques: [
      {
        key: "structure_sidewalk",
        text: "<fix>steer left toward the walkway entrance near the handrails</fix>",
        refinedImageSrc: "./static/images/critique_refine_plans/foresight%20struct/image%20(1).webp"
      },
      {
        key: "structure_curb",
        text: "<fix>steer right to avoid the handrails</fix>",
        refinedImageSrc: "./static/images/critique_refine_plans/foresight%20struct/image%20(2).webp"
      },
      {
        key: "structure_corridor",
        text: "<fix>steer left up the steps then make a sharp right turn</fix>",
        refinedImageSrc: "./static/images/critique_refine_plans/foresight%20struct/image%20(3).webp"
      }
    ]
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

function updateCritiqueButtons(buttons, critiques) {
  buttons.forEach((button, index) => {
    const critique = critiques[index];
    if (!critique) {
      button.hidden = true;
      return;
    }

    button.hidden = false;
    button.dataset.critiqueIndex = String(index);
    button.textContent = critique.text;
  });
}

function initCritiqueGallery() {
  const gallery = document.getElementById("critiqueGallery");
  if (!gallery) return;

  const scenarioInputs = Array.from(document.querySelectorAll("input[name='critiqueScenario']"));
  const buttons = Array.from(gallery.querySelectorAll(".reasoning-card"));
  const thinking = document.getElementById("refinedThinking");
  const initialFigure = document.getElementById("initialPlanFigure");
  const refinedFigure = document.getElementById("refinedPlanFigure");

  if (!scenarioInputs.length || !buttons.length || !thinking || !initialFigure || !refinedFigure) {
    return;
  }

  let activeScenarioKey = scenarioInputs.find((input) => input.checked)?.value || "signs";

  const selectCritique = (index, showThinking = true) => {
    const scenario = SCENARIOS[activeScenarioKey];
    const selected = scenario ? scenario.critiques[index] : null;
    if (!selected) return;

    buttons.forEach((button, buttonIndex) => {
      const isActive = buttonIndex === index;
      button.classList.toggle("is-selected", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    if (showThinking) {
      thinking.classList.add("is-visible");
      window.setTimeout(() => {
        setPlanImage(refinedFigure, selected.refinedImageSrc);
        thinking.classList.remove("is-visible");
      }, 260);
    } else {
      setPlanImage(refinedFigure, selected.refinedImageSrc);
    }
  };

  const selectScenario = (key) => {
    const scenario = SCENARIOS[key];
    if (!scenario) return;

    activeScenarioKey = key;
    setPlanImage(initialFigure, scenario.initialImageSrc);
    updateCritiqueButtons(buttons, scenario.critiques);
    selectCritique(0, false);
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      selectCritique(Number(button.dataset.critiqueIndex || 0));
    });
  });

  scenarioInputs.forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) selectScenario(input.value);
    });
  });

  selectScenario(activeScenarioKey);
}

document.addEventListener("DOMContentLoaded", initCritiqueGallery);
