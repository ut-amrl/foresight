// Put your own image files in static/images and set these paths, e.g.
// initialImageSrc: "./static/images/signs-initial.jpg".
const SCENARIOS = {
  signs: {
    initialImageSrc: "",
    initialPath: "M 168 238 C 168 205, 158 184, 141 164 C 128 149, 126 137, 124 128",
    critiques: [
      {
        key: "sign_arrow",
        text: "<fix> follow the sign cue before committing to the hallway branch <fix>",
        path: "M 170 238 C 170 205, 172 178, 184 152 C 196 128, 213 118, 238 112",
        refinedImageSrc: ""
      },
      {
        key: "sign_avoid",
        text: "<fix> avoid the visually direct path; the posted sign points to the right <fix>",
        path: "M 166 238 C 166 206, 160 180, 170 158 C 184 128, 214 116, 244 110",
        refinedImageSrc: ""
      },
      {
        key: "sign_align",
        text: "<fix> turn after the sign, then align with the signed corridor <fix>",
        path: "M 170 238 C 171 207, 173 180, 181 160 C 193 132, 214 118, 236 113",
        refinedImageSrc: ""
      }
    ]
  },
  detours: {
    initialImageSrc: "",
    initialPath: "M 176 238 C 176 205, 176 176, 178 148 C 180 130, 190 120, 206 116",
    critiques: [
      {
        key: "detour_block",
        text: "<fix> the direct route is blocked; route around the obstacle before turning back <fix>",
        path: "M 162 238 C 136 214, 128 186, 142 164 C 158 138, 193 136, 228 120",
        refinedImageSrc: ""
      },
      {
        key: "detour_opening",
        text: "<fix> use the open passage on the left, then rejoin the goal corridor <fix>",
        path: "M 164 238 C 136 216, 120 190, 132 166 C 148 136, 196 130, 236 118",
        refinedImageSrc: ""
      },
      {
        key: "detour_clearance",
        text: "<fix> keep extra clearance from the barrier while passing the detour <fix>",
        path: "M 154 238 C 126 210, 120 180, 138 158 C 160 132, 198 134, 232 116",
        refinedImageSrc: ""
      }
    ]
  },
  structural: {
    initialImageSrc: "",
    initialPath: "M 168 238 C 168 205, 158 184, 141 164 C 128 149, 126 137, 124 128",
    critiques: [
      {
        key: "structure_sidewalk",
        text: "<fix> steer right toward the sidewalk path near the tree <fix>",
        path: "M 170 238 C 170 206, 170 179, 170 150 C 170 132, 184 122, 206 120",
        refinedImageSrc: ""
      },
      {
        key: "structure_curb",
        text: "<fix> avoid drifting left toward the curb; keep the plan on the sidewalk <fix>",
        path: "M 166 238 C 166 210, 156 191, 144 172 C 134 156, 138 142, 158 132 C 176 122, 192 120, 206 120",
        refinedImageSrc: ""
      },
      {
        key: "structure_corridor",
        text: "<fix> continue straight, then align with the open walkway corridor <fix>",
        path: "M 170 238 C 170 204, 170 176, 176 154 C 182 136, 194 125, 216 120",
        refinedImageSrc: ""
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
  const initialPath = document.getElementById("initialPlanPath");
  const refinedPath = document.getElementById("refinedPlanPath");
  const thinking = document.getElementById("refinedThinking");
  const initialFigure = document.getElementById("initialPlanFigure");
  const refinedFigure = document.getElementById("refinedPlanFigure");

  if (!scenarioInputs.length || !buttons.length || !initialPath || !refinedPath || !thinking || !initialFigure || !refinedFigure) {
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

  const selectScenario = (key) => {
    const scenario = SCENARIOS[key];
    if (!scenario) return;

    activeScenarioKey = key;
    initialPath.setAttribute("d", scenario.initialPath);
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
