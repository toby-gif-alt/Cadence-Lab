(function () {
  "use strict";

  const { questions: questionBank } = window.CadenceData;
  const categoryNames = {
    ...window.CadenceData.categories,
    "chord-identification": "Chord identification",
  };
  const sourceTypeNames = {
    ...window.CadenceData.sourceTypes,
    "generated-practice": "Generated practice",
  };
  const scoreRenderer = window.CadenceScoreRenderer;
  const structuredModel = window.CadenceStructuredAnswer;
  const chordGenerator = window.CadenceChordGenerator;
  const PlaybackEngine = window.CadencePlayback.PlaybackEngine;

  let currentQuestion = null;
  let structuredAnswer = null;
  let submissionSnapshot = null;
  let submitted = false;
  let selectedPlaybackMode = null;
  let activePlaybackScore = null;
  let activePlaybackMode = null;
  let setNumber = 0;
  let lastQuestionId = null;
  let renderedWidth = 0;
  let resizeFrame = null;

  const categorySelect = document.querySelector("#category");
  const sourceSelect = document.querySelector("#source-type");
  const answerPanel = document.querySelector("#answer-panel");
  const revealButton = document.querySelector("#reveal-answer");
  const scoreElement = document.querySelector("#score");
  const modelScoreElement = document.querySelector("#model-score");
  const paperCompletionPanel = document.querySelector("#paper-completion-panel");
  const structuredPanel = document.querySelector("#structured-response-panel");
  const structuredControls = document.querySelector("#structured-controls");
  const structuredBuilder = document.querySelector("#structured-builder");
  const questionPlaybackCursor = document.querySelector("#playback-cursor");
  const modelPlaybackCursor = document.querySelector("#model-playback-cursor");
  const playbackStatus = document.querySelector("#playback-status");
  const playPauseButton = document.querySelector("#play-pause");
  const playback = new PlaybackEngine({
    onProgress: updatePlaybackCursor,
    onStateChange: updateTransportState,
  });

  function copy(value) {
    return typeof structuredClone === "function"
      ? structuredClone(value)
      : JSON.parse(JSON.stringify(value));
  }

  function escapeText(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function chooseQuestion() {
    const category = categorySelect.value;
    const sourceType = sourceSelect.value;
    if (category === "chord-identification" || sourceType === "generated-practice") {
      categorySelect.value = "chord-identification";
      sourceSelect.value = "generated-practice";
      const seed = `set-${Date.now()}-${setNumber + 1}`;
      return chordGenerator.create(seed);
    }
    let pool = questionBank.filter(
      (question) =>
        (category === "mixed" || question.category === category) &&
        (sourceType === "mixed" || question.sourceType === sourceType)
    );
    if (!pool.length) {
      categorySelect.value = "mixed";
      pool = questionBank.filter(
        (question) => sourceType === "mixed" || question.sourceType === sourceType
      );
    }
    let candidates = pool.filter((question) => question.id !== lastQuestionId);
    if (!candidates.length) candidates = pool;
    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    lastQuestionId = picked.id;
    return picked;
  }

  function sourceDescription(question) {
    const source = question.source;
    if (question.sourceType === "nzqa-reference") {
      return `${source.year} ${source.question} ${source.part}, ${source.extract} · ${source.creator}, “${source.title}” · ${source.location}.`;
    }
    if (question.sourceType === "generated-practice") {
      return `Generated Cadence Lab practice · ${question.variantId}.`;
    }
    return "Original Cadence Lab practice material.";
  }

  function visibleTasks(question) {
    return ["A", "M", "E"].flatMap((level) => question.tasks[level] || []);
  }

  function scoreLayout(question) {
    if (question.score.layout) return question.score.layout;
    if (question.category === "satb") return "satb";
    if (question.category === "piano") return "piano";
    return "grand";
  }

  function isPaperCompletion(question = currentQuestion) {
    return question?.interaction?.type === "paper-completion";
  }

  function isStructuredInteraction(question = currentQuestion) {
    return Boolean(
      question?.interaction &&
      structuredModel.TYPES.includes(question.interaction.type)
    );
  }

  function currentQuestionScore() {
    if (isStructuredInteraction()) {
      return structuredModel.scoreWithResponses(currentQuestion, structuredAnswer);
    }
    return currentQuestion.score;
  }

  function stopPlayback() {
    playback.stop();
    activePlaybackScore = null;
    activePlaybackMode = null;
    questionPlaybackCursor.hidden = true;
    modelPlaybackCursor.hidden = true;
  }

  function renderScores(force = false, options = {}) {
    if (!currentQuestion) return;
    if (options.stopAudio !== false) stopPlayback();
    const measuredWidth = options.width ||
      scoreElement.getBoundingClientRect().width ||
      document.querySelector(".score-frame").getBoundingClientRect().width ||
      900;
    if (!force && Math.abs(measuredWidth - renderedWidth) < 36) return;

    const layout = scoreLayout(currentQuestion);
    const result = scoreRenderer.render(scoreElement, currentQuestionScore(), {
      layout,
      showAnswer: false,
      width: measuredWidth,
    });
    if (submitted) {
      scoreRenderer.render(modelScoreElement, currentQuestion.score, {
        layout,
        showAnswer: true,
        width: result.width,
      });
    } else {
      modelScoreElement.replaceChildren();
      modelScoreElement.removeAttribute("aria-label");
      modelScoreElement.classList.remove("notation-score");
    }
    renderedWidth = result.width;
  }

  function resetQuestionState(question) {
    stopPlayback();
    currentQuestion = question;
    lastQuestionId = question.id;
    submitted = false;
    submissionSnapshot = null;
    structuredAnswer = isStructuredInteraction(question) ? structuredModel.create(question) : null;
    selectedPlaybackMode = isPaperCompletion(question) ? "question" : null;
    activePlaybackScore = null;
    activePlaybackMode = null;
    renderedWidth = 0;
  }

  function renderQuestion(question = chooseQuestion()) {
    resetQuestionState(question);
    setNumber += 1;
    document.querySelector("#question-family").textContent = question.family;
    document.querySelector("#question-title").textContent = question.studentTitle;
    document.querySelector("#question-context").textContent = question.studentContext;
    const sourceChip = document.querySelector("#source-chip");
    sourceChip.textContent = sourceTypeNames[question.sourceType];
    sourceChip.className = `source-chip source-${question.sourceType}`;
    document.querySelector("#variant-chip").textContent = question.variantId ||
      `Practice set ${String(setNumber).padStart(2, "0")}`;
    document.querySelector("#source-attribution").textContent = sourceDescription(question);
    document.querySelector("#task-list").innerHTML = visibleTasks(question)
      .map((task) => `<li>${escapeText(task)}</li>`)
      .join("");

    document.querySelector("#answer-heading").textContent = "";
    document.querySelector("#answer-copy").replaceChildren();
    document.querySelector("#criteria-grid").replaceChildren();
    document.querySelector("#result-badge").textContent = "Not assessed";
    document.querySelector("#result-badge").className = "result-badge";
    document.querySelector("#judgement-note").textContent =
      "Submit before comparing your work with the assessment guide.";

    answerPanel.hidden = true;
    document.querySelector("#model-score-wrap").hidden = true;
    document.querySelector("#print-model").hidden = true;
    revealButton.disabled = false;
    revealButton.innerHTML = isPaperCompletion(question)
      ? '<span aria-hidden="true">◉</span> I’ve finished — show model'
      : '<span aria-hidden="true">◉</span> Submit &amp; reveal';
    buildPaperCompletion(question);
    buildStructuredResponse(question);
    renderScores(true);
    updatePlaybackPermissions();
  }

  function buildCriteria(question) {
    const grid = document.querySelector("#criteria-grid");
    if (isPaperCompletion(question)) {
      document.querySelector(".self-assess .eyebrow").textContent = "Paper self-check";
      document.querySelector(".self-assess h3").textContent =
        "Compare your written completion with the model";
      grid.innerHTML = question.interaction.selfCheck.map((text, criterionIndex) => `
        <label class="criterion paper-criterion">
          <input type="checkbox" data-criterion="${criterionIndex}" />
          <span>${escapeText(text)}</span>
        </label>
      `).join("");
      grid.querySelectorAll("input").forEach((input) =>
        input.addEventListener("change", updateResult)
      );
      updateResult();
      return;
    }
    document.querySelector(".self-assess .eyebrow").textContent = "Assessment guide";
    document.querySelector(".self-assess h3").textContent =
      "Which evidence is present in your answer?";
    const rows = [];
    ["A", "M", "E"].forEach((level) => {
      question.criteria[level].forEach((text, criterionIndex) => {
        rows.push(`
          <label class="criterion">
            <input type="checkbox" data-level="${level}" data-criterion="${criterionIndex}" />
            <span class="level-tag level-${level}">${level}</span>
            <span>${escapeText(text)}</span>
          </label>
        `);
      });
    });
    grid.innerHTML = rows.join("");
    grid.querySelectorAll("input").forEach((input) =>
      input.addEventListener("change", updateResult)
    );
    updateResult();
  }

  function updateResult() {
    const inputs = [...document.querySelectorAll("#criteria-grid input")];
    if (isPaperCompletion()) {
      const checked = inputs.filter((input) => input.checked).length;
      const badge = document.querySelector("#result-badge");
      badge.textContent = `${checked} of ${inputs.length} checked`;
      badge.className = "result-badge";
      document.querySelector("#judgement-note").textContent =
        "Use this checklist while comparing your written work with the model. Cadence Lab is not grading the notation on your paper.";
      return;
    }
    const present = new Set(inputs.map((input) => input.dataset.level));
    const complete = (level) => {
      const group = inputs.filter((input) => input.dataset.level === level);
      return group.length > 0 && group.every((input) => input.checked);
    };
    let result = "Not yet secure";
    let className = "";
    let note = "Tick only the statements you can support from your written work.";
    if (complete("A")) {
      result = "Likely Achievement";
      className = "achieved";
      note = "Your isolated harmonic evidence is secure. Check the Merit statements to see whether it forms a convincing sequence.";
    }
    if (complete("A") && present.has("M") && complete("M")) {
      result = "Likely Merit";
      className = "merit";
      note = "Your consecutive analysis or realisation is secure. Excellence requires the extended response to remain convincing.";
    }
    if (complete("A") && complete("M") && complete("E")) {
      result = "Likely Excellence";
      className = "excellence";
      note = "Your checklist supports an extended, convincing response. Compare the details once more before accepting the judgement.";
    }
    const badge = document.querySelector("#result-badge");
    badge.textContent = result;
    badge.className = `result-badge ${className}`.trim();
    document.querySelector("#judgement-note").textContent = note;
  }

  function commitStructured(next, message, options = {}) {
    structuredAnswer = next;
    document.querySelector("#structured-status").textContent = message || "Response updated.";
    buildStructuredResponse(currentQuestion);
    if (options.renderScore !== false) {
      renderedWidth = 0;
      renderScores(true);
    }
  }

  function advanceStructured(next, slots, completedMessage) {
    const advanced = structuredModel.advanceToNextUnanswered(
      next,
      slots.map((slot) => slot.id)
    );
    const complete = Object.values(advanced.slots).every(Boolean);
    return {
      state: advanced,
      message: complete ? (completedMessage || "All analysis positions completed.") : null,
    };
  }

  function optionMarkup(options, selected, placeholder = "Choose…") {
    return [
      `<option value="">${escapeText(placeholder)}</option>`,
      ...options.map((option) =>
        `<option value="${escapeText(option)}"${option === selected ? " selected" : ""}>${escapeText(option)}</option>`
      ),
    ].join("");
  }

  function keyValue(label) {
    const match = /^(.*) (major|minor)$/.exec(String(label || ""));
    return match ? { root: match[1], mode: match[2] } : null;
  }

  function romanInversionChoices(extent) {
    return extent === "seventh" ? ["root", "b", "c", "d"] : ["root", "b", "c"];
  }

  function romanBuilderRow(index, value = {}, optional = false) {
    const key = value.key ? structuredModel.formatKey(value.key) : "";
    const quality = value.quality || "major";
    const extent = quality === "half-diminished"
      ? "seventh"
      : value.extent === "seventh" ? "seventh" : "triad";
    const extentChoices = quality === "half-diminished" ? ["seventh"] : ["triad", "seventh"];
    const inversionChoices = romanInversionChoices(extent);
    const inversion = inversionChoices.includes(value.inversion) ? value.inversion : "root";
    return `
      <div class="builder-row" data-analysis-index="${index}">
        <label>${optional ? "Pivot / second key" : "Key label"}
          <select data-part="key">${optionMarkup(currentQuestion.interaction.keyChoices, key, optional ? "No second analysis" : "No key prefix")}</select>
        </label>
        <label>Accidental
          <select data-part="accidental">${optionMarkup(["♯", "♭"], value.accidental === "#" ? "♯" : value.accidental === "b" ? "♭" : "", "None")}</select>
        </label>
        <label>Degree
          <select data-part="degree">${optionMarkup(["I", "II", "III", "IV", "V", "VI", "VII"], value.degree || (optional ? "" : "I"), optional ? "No second analysis" : "Degree")}</select>
        </label>
        <label>Quality / case
          <select data-part="quality">${optionMarkup(["major", "minor", "diminished", "half-diminished", "augmented"], quality, "Quality")}</select>
        </label>
        <label>Chord
          <select data-part="extent"${quality === "half-diminished" ? " disabled" : ""}>${optionMarkup(extentChoices, extent, "Chord size")}</select>
        </label>
        <label>Inversion
          <select data-part="inversion">${optionMarkup(inversionChoices, inversion, "Inversion")}</select>
        </label>
        <label>Secondary to
          <select data-part="secondaryOf">${optionMarkup(["I", "II", "III", "IV", "V", "VI", "VII"], value.secondaryOf || "", "None")}</select>
        </label>
        <label>Suspension
          <select data-part="suspension">${optionMarkup(["♯3", "sus⁴", "sus⁴–♯3", "sus⁴–V♯3", "4–3"], value.suspension || "", "None")}</select>
        </label>
      </div>`;
  }

  function buildRomanControls(interaction) {
    const slots = interaction.slots;
    structuredControls.innerHTML = `
      <div class="structured-slot-grid">
        ${slots.map((slot) => {
          const value = structuredAnswer.slots[slot.id];
          const label = structuredModel.formatValue(value, interaction.type);
          return `<button type="button" class="structured-slot${slot.id === structuredAnswer.activeSlotId ? " is-active" : ""}" data-slot-id="${slot.id}">
            <small>${escapeText(slot.label)}</small><strong>${escapeText(label || "Enter analysis")}</strong>
          </button>`;
        }).join("")}
      </div>`;
    structuredControls.querySelectorAll("[data-slot-id]").forEach((button) => {
      button.addEventListener("click", () => {
        structuredAnswer = structuredModel.setActiveSlot(structuredAnswer, button.dataset.slotId);
        buildStructuredResponse(currentQuestion);
      });
    });
    const slot = slots.find((candidate) => candidate.id === structuredAnswer.activeSlotId) || slots[0];
    if (!slot) {
      structuredBuilder.hidden = true;
      return;
    }
    const current = structuredAnswer.slots[slot.id] || {};
    const analyses = current.analyses || [];
    structuredBuilder.hidden = false;
    structuredBuilder.innerHTML = `
      <p class="builder-preview">${escapeText(structuredModel.formatValue(current, interaction.type) || "Build a Roman-numeral answer")}</p>
      ${romanBuilderRow(0, analyses[0] || {})}
      ${slot.allowDualAnalysis ? `<details${analyses[1] ? " open" : ""}>
        <summary>Add a second / pivot analysis</summary>
        ${romanBuilderRow(1, analyses[1] || {}, true)}
      </details>` : ""}
      <div class="builder-actions">
        <button type="button" class="button button-primary" data-save-roman>Place analysis</button>
        <button type="button" class="button button-ghost" data-clear-slot>Clear</button>
      </div>`;
    structuredBuilder.querySelectorAll("[data-analysis-index]").forEach((row) => {
      const qualitySelect = row.querySelector('[data-part="quality"]');
      const extentSelect = row.querySelector('[data-part="extent"]');
      const syncInversions = () => {
        const inversionSelect = row.querySelector('[data-part="inversion"]');
        const choices = romanInversionChoices(extentSelect.value);
        const selected = choices.includes(inversionSelect.value) ? inversionSelect.value : "root";
        inversionSelect.innerHTML = optionMarkup(choices, selected, "Inversion");
      };
      const syncQualityAndExtent = () => {
        const halfDiminished = qualitySelect.value === "half-diminished";
        const priorExtent = extentSelect.value;
        const choices = halfDiminished ? ["seventh"] : ["triad", "seventh"];
        const selected = halfDiminished
          ? "seventh"
          : choices.includes(priorExtent) ? priorExtent : "triad";
        extentSelect.innerHTML = optionMarkup(choices, selected, "Chord size");
        extentSelect.disabled = halfDiminished;
        syncInversions();
      };
      extentSelect.addEventListener("change", syncInversions);
      qualitySelect.addEventListener("change", syncQualityAndExtent);
      syncQualityAndExtent();
    });
    structuredBuilder.querySelector("[data-save-roman]").addEventListener("click", () => {
      const analysesValue = [...structuredBuilder.querySelectorAll("[data-analysis-index]")]
        .map((row) => {
          const read = (part) => row.querySelector(`[data-part="${part}"]`).value;
          const degree = read("degree");
          if (!degree) return null;
          const accidentalValue = read("accidental");
          return {
            key: keyValue(read("key")),
            accidental: accidentalValue === "♯" ? "#" : accidentalValue === "♭" ? "b" : "",
            degree,
            quality: read("quality"),
            extent: read("extent"),
            inversion: read("inversion"),
            secondaryOf: read("secondaryOf"),
            suspension: read("suspension"),
          };
        })
        .filter(Boolean);
      const placed = structuredModel.setSlot(
        structuredAnswer,
        slot.id,
        { analyses: analysesValue }
      );
      const result = advanceStructured(placed, slots, "All analysis positions completed.");
      commitStructured(result.state, result.message || `Analysis placed at ${slot.label}.`);
    });
    structuredBuilder.querySelector("[data-clear-slot]").addEventListener("click", () =>
      commitStructured(structuredModel.setSlot(structuredAnswer, slot.id, null), "Analysis cleared.")
    );
  }

  function buildJazzControls(interaction) {
    const usedTokenIds = new Set(
      Object.values(structuredAnswer.slots).map((value) => value?.tokenId).filter(Boolean)
    );
    const extensionChoices = {
      major: ["triad", "6", "maj7", "maj9"],
      minor: ["triad", "6", "7", "9"],
      dominant: ["7", "9", "11", "13"],
      diminished: ["triad", "7"],
      "half-diminished": ["7"],
      suspended: ["sus2", "sus4"],
    };
    const roots = ["C", "C♯", "D♭", "D", "D♯", "E♭", "E", "E♯", "F", "F♯", "G♭", "G", "G♯", "A♭", "A", "A♯", "B♭", "B"];
    structuredControls.innerHTML = `
      <div class="structured-slot-grid">
        ${interaction.slots.map((slot) => {
          const value = structuredAnswer.slots[slot.id];
          const label = structuredModel.formatValue(value, interaction.type);
          return `<div class="structured-slot${slot.id === structuredAnswer.activeSlotId ? " is-active" : ""}" data-slot-id="${slot.id}" tabindex="0" role="button" draggable="${Boolean(value?.tokenId)}">
            <small>${escapeText(slot.label)}</small><strong>${escapeText(label || "Place chord")}</strong>
            ${value ? '<div class="slot-actions"><button type="button" data-return-slot>Return to bank</button></div>' : ""}
          </div>`;
        }).join("")}
      </div>
      <details class="hint-bank"${structuredAnswer.hintBankVisible ? " open" : ""}>
        <summary>Need a hint? Show chord choices</summary>
        <div class="chord-bank" aria-label="Shuffled chord choices">
          ${structuredAnswer.bank.map((token) => `<button type="button" class="chord-token" draggable="true" data-token-id="${token.id}"${usedTokenIds.has(token.id) ? " disabled" : ""}>${escapeText(token.label)}</button>`).join("")}
        </div>
      </details>
      <div class="builder-actions"><button type="button" class="button button-ghost" data-reset-structured>Reset placements</button></div>`;
    structuredBuilder.hidden = false;
    structuredBuilder.innerHTML = `
      <p class="builder-preview" data-jazz-preview>Build the chord symbol</p>
      <div class="builder-row">
        <label>Root<select data-chord-root>${optionMarkup(["C", "D", "E", "F", "G", "A", "B"], "", "Root")}</select></label>
        <label>Accidental<select data-chord-root-accidental>${optionMarkup(["♯", "♭"], "", "Natural")}</select></label>
        <label>Quality<select data-chord-quality>${optionMarkup(["major", "minor", "dominant", "diminished", "half-diminished", "suspended"], "major", "Quality")}</select></label>
        <label>Extension<select data-chord-extension>${optionMarkup(extensionChoices.major, "triad", "Extension")}</select></label>
        <label>Alteration<select data-chord-alteration>${optionMarkup([], "", "None")}</select></label>
        <label>Addition<select data-chord-addition>${optionMarkup(["add9"], "", "None")}</select></label>
        <label>Suspension<select data-chord-suspension>${optionMarkup([], "", "None")}</select></label>
        <label>Slash bass<select data-chord-bass>${optionMarkup(roots, "", "Root position")}</select></label>
        <button type="button" class="button button-primary" data-place-built>Place chord</button>
      </div>`;
    const activate = (slotId) => {
      structuredAnswer = structuredModel.setActiveSlot(structuredAnswer, slotId);
      buildStructuredResponse(currentQuestion);
    };
    structuredControls.querySelectorAll("[data-slot-id]").forEach((element) => {
      element.addEventListener("click", (event) => {
        if (event.target.closest("[data-return-slot]")) {
          commitStructured(structuredModel.returnToken(structuredAnswer, element.dataset.slotId), "Chord returned to the bank.");
        } else {
          activate(element.dataset.slotId);
        }
      });
      element.addEventListener("dragover", (event) => event.preventDefault());
      element.addEventListener("drop", (event) => {
        event.preventDefault();
        const tokenId = event.dataTransfer.getData("text/cadence-chord");
        if (tokenId) {
          const placed = structuredModel.placeToken(structuredAnswer, element.dataset.slotId, tokenId);
          const result = advanceStructured(placed, interaction.slots, "All chord positions completed.");
          commitStructured(result.state, result.message || "Chord placed.");
        }
      });
      element.addEventListener("dragstart", (event) => {
        const tokenId = structuredAnswer.slots[element.dataset.slotId]?.tokenId;
        if (tokenId) event.dataTransfer.setData("text/cadence-chord", tokenId);
      });
    });
    structuredControls.querySelectorAll("[data-token-id]").forEach((button) => {
      button.addEventListener("click", () => {
        const slotId = structuredAnswer.activeSlotId || interaction.slots.find(
          (slot) => !structuredAnswer.slots[slot.id]
        )?.id;
        if (!slotId) return;
        const placed = structuredModel.placeToken(structuredAnswer, slotId, button.dataset.tokenId);
        const result = advanceStructured(placed, interaction.slots, "All chord positions completed.");
        commitStructured(result.state, result.message || "Chord placed.");
      });
      button.addEventListener("dragstart", (event) =>
        event.dataTransfer.setData("text/cadence-chord", button.dataset.tokenId)
      );
    });
    structuredControls.querySelector("[data-reset-structured]").addEventListener("click", () =>
      commitStructured(structuredModel.reset(structuredAnswer), "Placements reset.")
    );
    structuredControls.querySelector(".hint-bank").addEventListener("toggle", (event) => {
      if (submitted) return;
      structuredAnswer = structuredModel.setHintBankVisible(structuredAnswer, event.currentTarget.open);
    });
    const activeSlotDisplayStyle = () => {
      const activeSlot = interaction.slots.find((candidate) =>
        candidate.id === structuredAnswer.activeSlotId
      );
      return (activeSlot?.acceptedAnswers || []).some((answer) =>
        /m7\(♭5\)/.test(typeof answer === "string" ? answer : answer.label)
      ) ? "parenthetical-flat-five" : "";
    };
    const updateJazzPreview = () => {
      const rootLetter = structuredBuilder.querySelector("[data-chord-root]").value;
      const chord = {
        root: rootLetter
          ? `${rootLetter}${structuredBuilder.querySelector("[data-chord-root-accidental]").value}`
          : "",
        quality: structuredBuilder.querySelector("[data-chord-quality]").value,
        extension: structuredBuilder.querySelector("[data-chord-extension]").value,
        alteration: structuredBuilder.querySelector("[data-chord-alteration]").value,
        addition: structuredBuilder.querySelector("[data-chord-addition]").value,
        suspension: structuredBuilder.querySelector("[data-chord-suspension]").value,
        bass: structuredBuilder.querySelector("[data-chord-bass]").value,
        displayStyle: activeSlotDisplayStyle(),
      };
      structuredBuilder.querySelector("[data-jazz-preview]").textContent =
        structuredModel.formatJazzChord(chord) || "Build the chord symbol";
    };
    const syncJazzParts = () => {
      const quality = structuredBuilder.querySelector("[data-chord-quality]").value;
      const extensionSelect = structuredBuilder.querySelector("[data-chord-extension]");
      const alterationSelect = structuredBuilder.querySelector("[data-chord-alteration]");
      const additionSelect = structuredBuilder.querySelector("[data-chord-addition]");
      const suspensionSelect = structuredBuilder.querySelector("[data-chord-suspension]");
      const choices = extensionChoices[quality] || ["triad"];
      const extension = choices.includes(extensionSelect.value)
        ? extensionSelect.value
        : choices[0];
      extensionSelect.innerHTML = optionMarkup(choices, extension, "Extension");
      const suspensionChoices = quality === "dominant" && extension === "7" ? ["sus4"] : [];
      const suspension = suspensionChoices.includes(suspensionSelect.value)
        ? suspensionSelect.value
        : "";
      suspensionSelect.innerHTML = optionMarkup(suspensionChoices, suspension, "None");
      suspensionSelect.disabled = suspensionChoices.length === 0;
      const alterationChoices = quality !== "dominant" || suspension
        ? []
        : extension === "7"
          ? ["b9", "#9", "#11"]
          : extension === "13" ? ["b9"] : [];
      const alteration = alterationChoices.includes(alterationSelect.value)
        ? alterationSelect.value
        : "";
      alterationSelect.innerHTML = optionMarkup(alterationChoices, alteration, "None");
      alterationSelect.disabled = alterationChoices.length === 0;
      const additionChoices = quality === "major"
        ? extension === "triad" ? ["add9"] : extension === "6" ? ["6(add9)"] : []
        : quality === "minor"
          ? extension === "triad" ? ["add9"] : extension === "9" ? ["maj7", "add6"] : []
          : [];
      const addition = additionChoices.includes(additionSelect.value)
        ? additionSelect.value
        : "";
      additionSelect.innerHTML = optionMarkup(additionChoices, addition, "None");
      additionSelect.disabled = additionChoices.length === 0;
      updateJazzPreview();
    };
    structuredBuilder.querySelectorAll("select").forEach((select) => {
      select.addEventListener("change", () => {
        if (select.hasAttribute("data-chord-alteration") && select.value) {
          structuredBuilder.querySelector("[data-chord-suspension]").value = "";
        }
        if (select.hasAttribute("data-chord-suspension") && select.value) {
          structuredBuilder.querySelector("[data-chord-alteration]").value = "";
        }
        if (select.hasAttribute("data-chord-quality") ||
            select.hasAttribute("data-chord-extension") ||
            select.hasAttribute("data-chord-suspension")) {
          syncJazzParts();
        } else {
          updateJazzPreview();
        }
      });
    });
    syncJazzParts();
    structuredBuilder.querySelector("[data-place-built]").addEventListener("click", () => {
      const root = structuredBuilder.querySelector("[data-chord-root]").value;
      if (!root || !structuredAnswer.activeSlotId) return;
      const chord = structuredModel.sanitizeJazzChord({
        root: `${root}${structuredBuilder.querySelector("[data-chord-root-accidental]").value}`,
        quality: structuredBuilder.querySelector("[data-chord-quality]").value,
        extension: structuredBuilder.querySelector("[data-chord-extension]").value,
        alteration: structuredBuilder.querySelector("[data-chord-alteration]").value,
        addition: structuredBuilder.querySelector("[data-chord-addition]").value,
        suspension: structuredBuilder.querySelector("[data-chord-suspension]").value,
        bass: structuredBuilder.querySelector("[data-chord-bass]").value,
        displayStyle: activeSlotDisplayStyle(),
      });
      const placed = structuredModel.setSlot(
        structuredAnswer,
        structuredAnswer.activeSlotId,
        { chord, source: "builder" }
      );
      const result = advanceStructured(placed, interaction.slots, "All chord positions completed.");
      commitStructured(result.state, result.message || "Built chord placed.");
    });
  }

  function buildFieldControls(interaction) {
    const choicesFor = (field) => {
      if (field.kind === "key") return interaction.keyChoices;
      if (field.kind === "relationship") return interaction.relationshipChoices;
      return field.choices || interaction.classificationChoices || interaction.choices || [];
    };
    structuredControls.innerHTML = `
      <div class="structured-field-grid">
        ${(interaction.fields || []).map((field) => {
          const selected = structuredModel.formatValue(structuredAnswer.fields[field.id], interaction.type);
          return `<div class="structured-field"><label for="field-${field.id}">${escapeText(field.label)}</label>
            <select id="field-${field.id}" data-field-id="${field.id}">${optionMarkup(choicesFor(field), selected)}</select></div>`;
        }).join("")}
      </div>
      ${interaction.evidencePrompt ? `<label class="evidence-wrap">${escapeText(interaction.evidencePrompt)}<textarea class="evidence-field" data-evidence>${escapeText(structuredAnswer.evidence)}</textarea></label>` : ""}`;
    structuredBuilder.hidden = true;
    structuredControls.querySelectorAll("[data-field-id]").forEach((select) => {
      select.addEventListener("change", () => commitStructured(
        structuredModel.setField(structuredAnswer, select.dataset.fieldId, select.value ? { label: select.value } : null),
        "Response updated.",
        { renderScore: false }
      ));
    });
    structuredControls.querySelector("[data-evidence]")?.addEventListener("change", (event) =>
      commitStructured(structuredModel.setEvidence(structuredAnswer, event.target.value), "Evidence saved.", { renderScore: false })
    );
  }

  function buildStructuredResponse(question) {
    const active = isStructuredInteraction(question);
    structuredPanel.hidden = !active;
    if (!active) {
      structuredControls.replaceChildren();
      structuredBuilder.replaceChildren();
      return;
    }
    structuredPanel.querySelectorAll("button, select, textarea").forEach((control) => {
      control.disabled = submitted;
    });
    if (question.interaction.type === "roman-analysis") {
      buildRomanControls(question.interaction);
    } else if (question.interaction.type === "jazz-chord-placement") {
      buildJazzControls(question.interaction);
      if (question.interaction.fields?.length) {
        const supplementary = document.createElement("div");
        supplementary.className = "structured-field-grid";
        supplementary.innerHTML = question.interaction.fields.map((field) => {
          const selected = structuredModel.formatValue(structuredAnswer.fields[field.id], question.interaction.type);
          const choices = field.choices || question.interaction.classificationChoices || [];
          return `<div class="structured-field"><label for="field-${field.id}">${escapeText(field.label)}</label><select id="field-${field.id}" data-field-id="${field.id}">${optionMarkup(choices, selected)}</select></div>`;
        }).join("");
        structuredControls.appendChild(supplementary);
        supplementary.querySelectorAll("[data-field-id]").forEach((select) =>
          select.addEventListener("change", () => commitStructured(
            structuredModel.setField(structuredAnswer, select.dataset.fieldId, select.value ? { label: select.value } : null),
            "Classification updated.",
            { renderScore: false }
          ))
        );
      }
    } else {
      buildFieldControls(question.interaction);
    }
    structuredPanel.querySelectorAll("button, select, textarea").forEach((control) => {
      control.disabled = submitted || control.disabled;
    });
  }

  function buildPaperCompletion(question) {
    const active = isPaperCompletion(question);
    paperCompletionPanel.hidden = !active;
    if (!active) {
      document.querySelector("#paper-completion-instruction").textContent = "";
      return;
    }
    document.querySelector("#paper-completion-instruction").textContent =
      question.interaction.completionType === "satb"
        ? "Complete this harmony on paper or on a printed copy of the score."
        : "Complete this piano part on paper or on a printed copy of the score.";
  }

  function handleStructuredScoreActivation(event) {
    if (!currentQuestion?.interaction || submitted || !isStructuredInteraction()) return;
    const answerBox = event.target.closest?.(".analysis-box-group.analysis-box-editable");
    if (answerBox?.dataset.answerSlotId) {
      structuredAnswer = structuredModel.setActiveSlot(
        structuredAnswer,
        answerBox.dataset.answerSlotId
      );
      buildStructuredResponse(currentQuestion);
      structuredPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  function playbackPermissions() {
    const paper = isPaperCompletion();
    return {
      student: false,
      question: paper || submitted,
      context: false,
      model: paper && submitted,
    };
  }

  function updatePlaybackPermissions() {
    const permissions = playbackPermissions();
    document.querySelectorAll("[data-playback-mode]").forEach((button) => {
      if (button.dataset.playbackMode === "question") {
        button.textContent = isPaperCompletion() ? "Hear supplied passage" : "Play the score";
      }
      const allowed = permissions[button.dataset.playbackMode];
      button.disabled = !allowed;
      button.hidden = isPaperCompletion()
        ? !["question", "model"].includes(button.dataset.playbackMode) ||
          (button.dataset.playbackMode === "model" && !submitted)
        : button.dataset.playbackMode !== "question" || !submitted;
      button.classList.toggle("is-active", button.dataset.playbackMode === selectedPlaybackMode && allowed);
      button.setAttribute("aria-pressed", String(button.dataset.playbackMode === selectedPlaybackMode && allowed));
    });
    if (!permissions[selectedPlaybackMode]) {
      selectedPlaybackMode = permissions.question ? "question" : null;
    }
    document.querySelectorAll("[data-playback-mode]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.playbackMode === selectedPlaybackMode);
      button.setAttribute("aria-pressed", String(button.dataset.playbackMode === selectedPlaybackMode));
    });
    const canPlay = Boolean(selectedPlaybackMode && permissions[selectedPlaybackMode]);
    playPauseButton.disabled = !canPlay;
    document.querySelector("#stop-playback").disabled = !canPlay;
    document.querySelector("#playback-lock-message").textContent = submitted
      ? isPaperCompletion()
        ? "Compare the supplied passage with the separate model answer."
        : "Score playback is unlocked."
      : isPaperCompletion()
        ? "Only the notes printed in the question will sound."
        : "Available after you submit your answer.";
    if (!isPaperCompletion() && !submitted) {
      playbackStatus.textContent = "Printed-score playback is locked until submission.";
    } else if (isPaperCompletion() && !submitted) {
      playbackStatus.textContent = "Ready to hear the visibly supplied passage.";
    }
  }

  function tempoValue() {
    const input = document.querySelector("#tempo");
    const tempo = Math.min(160, Math.max(40, Number(input.value) || 88));
    input.value = String(tempo);
    return tempo;
  }

  function playbackScore(mode) {
    if (isPaperCompletion() && mode === "question") {
      return window.CadencePlayback.questionOnlyScore(currentQuestion.score);
    }
    return copy(currentQuestion.score);
  }

  function startPlayback() {
    if (!selectedPlaybackMode || !playbackPermissions()[selectedPlaybackMode]) return;
    activePlaybackScore = playbackScore(selectedPlaybackMode);
    activePlaybackMode = selectedPlaybackMode;
    const startMeasure = 1;
    const timeline = playback.play(activePlaybackScore, {
      tempo: tempoValue(),
      startMeasure,
    });
    playbackStatus.textContent = timeline.notes.length
      ? `${selectedPlaybackMode === "model" ? "Playing model answer" : isPaperCompletion() ? "Playing supplied passage" : "Playing score"} from bar 1.`
      : "There are no notes in this playback selection.";
    if (!timeline.notes.length) stopPlayback();
  }

  function updateTransportState(state) {
    playPauseButton.textContent = state === "playing" ? "❚❚ Play / Pause" : "▶ Play / Pause";
    if (state === "stopped" && currentQuestion) playbackStatus.textContent = "Playback stopped.";
  }

  function updatePlaybackCursor(progress) {
    const useModel = activePlaybackMode === "model";
    const playbackCursor = useModel ? modelPlaybackCursor : questionPlaybackCursor;
    const inactiveCursor = useModel ? questionPlaybackCursor : modelPlaybackCursor;
    inactiveCursor.hidden = true;
    if (progress.beat == null || !currentQuestion) {
      playbackCursor.hidden = true;
      return;
    }
    const visualTarget = useModel ? modelScoreElement : scoreElement;
    const frame = useModel
      ? document.querySelector("#model-score-wrap")
      : document.querySelector(".score-frame");
    const map = visualTarget._cadenceHitMap;
    const svg = visualTarget.querySelector("svg");
    if (!map || !svg) return;
    const starts = progress.timeline.measureStarts;
    let measureIndex = starts.findLastIndex((start) => start <= progress.beat + 0.001);
    if (measureIndex < 0) measureIndex = 0;
    const geometry = map.measures.find((measure) => measure.measure === measureIndex + 1);
    if (!geometry) return;
    const measureStart = starts[measureIndex];
    const nextStart = starts[measureIndex + 1] ?? progress.timeline.totalBeats;
    const fraction = Math.min(1, Math.max(0, (progress.beat - measureStart) / Math.max(0.001, nextStart - measureStart)));
    const svgRect = svg.getBoundingClientRect();
    const frameRect = frame.getBoundingClientRect();
    const scaleX = svgRect.width / map.width;
    const scaleY = svgRect.height / map.height;
    playbackCursor.style.left = `${svgRect.left - frameRect.left + (geometry.x + (geometry.endX - geometry.x) * fraction) * scaleX}px`;
    playbackCursor.style.top = `${svgRect.top - frameRect.top + (geometry.topY - 14) * scaleY}px`;
    const bottom = geometry.bottomY == null ? geometry.topY + 58 : geometry.bottomY + 52;
    playbackCursor.style.height = `${(bottom - geometry.topY + 14) * scaleY}px`;
    playbackCursor.dataset.measure = String(measureIndex + 1);
    playbackCursor.dataset.beat = String(progress.beat - measureStart + 1);
    playbackCursor.dataset.system = String(geometry.system);
    if (visualTarget.dataset.playbackSystem !== String(geometry.system)) {
      visualTarget.dataset.playbackSystem = String(geometry.system);
      const systemMarker = svg.querySelector(`[data-system-index="${geometry.system}"]`);
      (systemMarker || visualTarget).scrollIntoView?.({ behavior: "smooth", block: "nearest" });
    }
    playbackCursor.hidden = false;
  }

  function submitAndReveal(options = {}) {
    if (submitted || !currentQuestion) return false;
    const confirmed = options.skipConfirmation || window.confirm(
      isPaperCompletion()
        ? "Finished your paper completion? Show one possible model answer?"
        : "Submit your answer and unlock the model and score playback?"
    );
    if (!confirmed) return false;
    stopPlayback();
    submissionSnapshot = copy(structuredAnswer);
    if (structuredAnswer) {
      structuredAnswer = structuredModel.setSubmitted(structuredAnswer);
      submissionSnapshot = copy(structuredAnswer);
    }
    submitted = true;
    document.querySelector("#answer-heading").textContent = currentQuestion.answerHeading;
    document.querySelector("#answer-copy").innerHTML = currentQuestion.answer
      .map((line) => `<p>${line}</p>`)
      .join("");
    buildCriteria(currentQuestion);
    answerPanel.hidden = false;
    buildStudentComparison();
    document.querySelector("#model-score-wrap").hidden = false;
    document.querySelector("#print-model").hidden = !isPaperCompletion();
    revealButton.disabled = true;
    revealButton.innerHTML = isPaperCompletion()
      ? '<span aria-hidden="true">✓</span> Model shown'
      : '<span aria-hidden="true">✓</span> Answer submitted';
    renderedWidth = 0;
    renderScores(true);
    buildStructuredResponse(currentQuestion);
    selectedPlaybackMode = isPaperCompletion() ? "model" : "question";
    updatePlaybackPermissions();
    if (!options.noScroll) {
      answerPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    return true;
  }

  function buildStudentComparison() {
    const panel = document.querySelector("#student-comparison");
    if (!isStructuredInteraction() || !submissionSnapshot) {
      panel.hidden = true;
      panel.replaceChildren();
      return;
    }
    const comparison = structuredModel.comparison(currentQuestion, submissionSnapshot);
    const items = [...comparison.slots, ...comparison.fields];
    const generated = currentQuestion.sourceType === "generated-practice";
    panel.hidden = false;
    panel.innerHTML = `
      <h4>Your response beside the model</h4>
      <p>${generated ? "These labels compare your entry with the intended harmonic identity, including any deliberately declared alternative analysis." : "These labels only compare your structured entry with the authored accepted answer; they are not automated NCEA grading."}</p>
      <div class="comparison-grid">
        ${items.map((item) => `<div class="comparison-item" data-status="${item.status}">
          <small>${escapeText(item.label)} · ${item.status === "matches" ? (generated ? (item.acceptedCount > 1 ? "matches accepted analysis" : "matches intended analysis") : "matches model") : item.status === "different" ? (generated ? (item.acceptedCount > 1 ? "not among accepted analyses" : "different from intended analysis") : "different from model") : "unanswered"}</small>
          <strong>${escapeText(item.response || "—")}</strong>
          <span>${generated ? (item.acceptedCount > 1 ? "Accepted analyses" : "Intended analysis") : "Model"}: ${escapeText(item.model || "—")}</span>
        </div>`).join("")}
      </div>
      ${comparison.evidence ? `<div class="comparison-item"><small>Your written evidence</small><strong>${escapeText(comparison.evidence)}</strong></div>` : ""}`;
  }

  function printCurrent(mode) {
    if (!currentQuestion || (mode === "model" && (!submitted || !isPaperCompletion()))) {
      return false;
    }
    const orientation = isPaperCompletion()
      ? currentQuestion.interaction.printOrientation
      : "portrait";
    document.body.dataset.printMode = mode;
    document.body.dataset.printOrientation = orientation;
    try {
      renderedWidth = 0;
      renderScores(true, {
        stopAudio: false,
        width: orientation === "landscape" ? 1040 : 720,
      });
      window.print();
    } finally {
      delete document.body.dataset.printMode;
      delete document.body.dataset.printOrientation;
      renderedWidth = 0;
      renderScores(true, { stopAudio: false });
    }
    return true;
  }

  function showQuestionById(questionId) {
    const question = questionBank.find((candidate) => candidate.id === questionId);
    if (!question) throw new Error(`Unknown question: ${questionId}`);
    categorySelect.value = question.category;
    sourceSelect.value = question.sourceType;
    renderQuestion(question);
  }

  function showGeneratedQuestion(seed) {
    categorySelect.value = "chord-identification";
    sourceSelect.value = "generated-practice";
    renderQuestion(chordGenerator.create(seed));
  }

  function showGeneratedVariant(variantId) {
    categorySelect.value = "chord-identification";
    sourceSelect.value = "generated-practice";
    renderQuestion(chordGenerator.createFromVariantId(variantId));
  }

  document.querySelector("#new-question").addEventListener("click", () => renderQuestion());
  categorySelect.addEventListener("change", () => {
    if (categorySelect.value === "chord-identification") sourceSelect.value = "generated-practice";
    else if (sourceSelect.value === "generated-practice") sourceSelect.value = "mixed";
    renderQuestion();
  });
  sourceSelect.addEventListener("change", () => {
    if (sourceSelect.value === "generated-practice") categorySelect.value = "chord-identification";
    else if (categorySelect.value === "chord-identification") categorySelect.value = "mixed";
    renderQuestion();
  });
  revealButton.addEventListener("click", () => submitAndReveal());
  document.querySelector("#print-question").addEventListener("click", () => printCurrent("question"));
  document.querySelector("#print-model").addEventListener("click", () => printCurrent("model"));
  scoreElement.addEventListener("click", handleStructuredScoreActivation);
  scoreElement.addEventListener("keydown", (event) => {
    if (!["Enter", " "].includes(event.key)) return;
    if (!event.target.closest?.(".analysis-box-group.analysis-box-editable")) return;
    event.preventDefault();
    handleStructuredScoreActivation(event);
  });

  document.querySelectorAll("[data-playback-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.disabled) return;
      stopPlayback();
      selectedPlaybackMode = button.dataset.playbackMode;
      updatePlaybackPermissions();
      playbackStatus.textContent = `${button.textContent.trim()} selected.`;
    });
  });
  playPauseButton.addEventListener("click", () => {
    if (playback.state === "playing") {
      playback.pause();
      playbackStatus.textContent = "Playback paused.";
    } else if (playback.state === "paused" && activePlaybackMode === selectedPlaybackMode) {
      playback.resume(activePlaybackScore, { tempo: tempoValue() });
    } else {
      startPlayback();
    }
  });
  document.querySelector("#stop-playback").addEventListener("click", stopPlayback);
  document.querySelector("#tempo").addEventListener("change", () => {
    tempoValue();
    if (playback.state !== "stopped") stopPlayback();
  });

  if ("ResizeObserver" in window) {
    new ResizeObserver(() => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => renderScores());
    }).observe(scoreElement);
  }

  window.CadenceLab = Object.freeze({
    categoryNames,
    sourceTypeNames,
    questions: questionBank,
    rendererVersion: scoreRenderer.version,
    validationReport: window.CadenceQuestionValidator.report,
    showQuestion: showQuestionById,
    showGeneratedQuestion,
    showGeneratedVariant,
    submit: submitAndReveal,
    print: printCurrent,
    stopPlayback,
    getCurrentQuestion: () => currentQuestion,
    getStructuredAnswer: () => copy(structuredAnswer),
    getSubmissionSnapshot: () => copy(submissionSnapshot),
    getPlaybackPermissions: () => copy(playbackPermissions()),
    isSubmitted: () => submitted,
  });

  const requestedParameters = new URLSearchParams(window.location.search);
  const requestedVariantId = requestedParameters.get("variant");
  const requestedQuestionId = requestedParameters.get("question");
  const requestedQuestion = questionBank.find((question) => question.id === requestedQuestionId);
  if (requestedVariantId) {
    categorySelect.value = "chord-identification";
    sourceSelect.value = "generated-practice";
  } else if (requestedQuestion) {
    categorySelect.value = requestedQuestion.category;
    sourceSelect.value = requestedQuestion.sourceType;
  }
  try {
    renderQuestion(requestedVariantId
      ? chordGenerator.createFromVariantId(requestedVariantId)
      : requestedQuestion || undefined);
  } catch (error) {
    console.warn(error);
    renderQuestion(requestedQuestion || undefined);
  }
})();
