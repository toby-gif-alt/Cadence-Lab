(function () {
  "use strict";

  const {
    questions: questionBank,
    categories: categoryNames,
    sourceTypes: sourceTypeNames,
  } = window.CadenceData;
  const scoreRenderer = window.CadenceScoreRenderer;
  const answerModel = window.CadenceStudentAnswer;
  const PlaybackEngine = window.CadencePlayback.PlaybackEngine;
  const levelOrder = { achievement: 1, merit: 2, excellence: 3 };
  const levelNames = {
    achievement: "Achievement",
    merit: "Merit",
    excellence: "Excellence",
  };
  const voiceLabels = {
    soprano: "Soprano",
    alto: "Alto",
    tenor: "Tenor",
    bass: "Bass",
    treble: "Treble",
  };

  let currentQuestion = null;
  let studentAnswer = null;
  let answerHistory = null;
  let submissionSnapshot = null;
  let submitted = false;
  let selectedVoice = null;
  let selectedDuration = "q";
  let dotted = false;
  let restMode = false;
  let selectedAccidental = "";
  let selectedForPitchMove = false;
  let selectedPlaybackMode = null;
  let activePlaybackScore = null;
  let activePlaybackMode = null;
  let setNumber = 0;
  let lastQuestionId = null;
  let renderedWidth = 0;
  let resizeFrame = null;

  const categorySelect = document.querySelector("#category");
  const sourceSelect = document.querySelector("#source-type");
  const difficultySelect = document.querySelector("#difficulty");
  const answerPanel = document.querySelector("#answer-panel");
  const revealButton = document.querySelector("#reveal-answer");
  const scoreElement = document.querySelector("#score");
  const modelScoreElement = document.querySelector("#model-score");
  const editorPanel = document.querySelector("#editor-panel");
  const editorStatus = document.querySelector("#editor-status");
  const playbackCursor = document.querySelector("#playback-cursor");
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
    return "Original Cadence Lab practice material.";
  }

  function visibleTasks(question, difficulty) {
    const maximumLevel = levelOrder[difficulty];
    return ["A", "M", "E"].flatMap((level, index) =>
      index + 1 <= maximumLevel ? question.tasks[level] : []
    );
  }

  function scoreLayout(question) {
    if (question.score.layout) return question.score.layout;
    if (question.category === "satb") return "satb";
    if (question.category === "piano") return "piano";
    return "grand";
  }

  function answerHasNotes() {
    return Boolean(
      studentAnswer?.measures.some((measure) =>
        Object.values(measure.voices).some((stream) => stream.length)
      )
    );
  }

  function currentStudentScore() {
    return currentQuestion.interaction
      ? answerModel.composeScore(currentQuestion, studentAnswer)
      : currentQuestion.score;
  }

  function stopPlayback() {
    playback.stop();
    activePlaybackScore = null;
    activePlaybackMode = null;
    playbackCursor.hidden = true;
  }

  function renderScores(force = false, options = {}) {
    if (!currentQuestion) return;
    if (options.stopAudio !== false) stopPlayback();
    const measuredWidth =
      scoreElement.getBoundingClientRect().width ||
      document.querySelector(".score-frame").getBoundingClientRect().width ||
      900;
    if (!force && Math.abs(measuredWidth - renderedWidth) < 36) return;

    const layout = scoreLayout(currentQuestion);
    const result = scoreRenderer.render(scoreElement, currentStudentScore(), {
      layout,
      showAnswer: false,
      width: measuredWidth,
    });
    scoreElement.classList.toggle("is-editable-score", Boolean(currentQuestion.interaction && !submitted));
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
    markSelectedNote();
  }

  function resetQuestionState(question) {
    stopPlayback();
    currentQuestion = question;
    lastQuestionId = question.id;
    submitted = false;
    submissionSnapshot = null;
    studentAnswer = answerModel.create(question);
    answerHistory = studentAnswer ? new answerModel.History(studentAnswer) : null;
    selectedVoice = question.interaction
      ? question.interaction.editableRegions[0].voices[0]
      : null;
    selectedDuration = "q";
    dotted = false;
    restMode = false;
    selectedAccidental = "";
    selectedForPitchMove = false;
    selectedPlaybackMode = question.interaction ? "student" : null;
    activePlaybackScore = null;
    activePlaybackMode = null;
    renderedWidth = 0;
  }

  function renderQuestion(question = chooseQuestion()) {
    resetQuestionState(question);
    setNumber += 1;
    const difficulty = difficultySelect.value;
    const difficultyName = levelNames[difficulty];

    document.querySelector("#question-family").textContent = question.family;
    document.querySelector("#question-title").textContent = question.studentTitle;
    document.querySelector("#question-context").textContent = question.studentContext;
    document.querySelector("#difficulty-chip").textContent = `Target: ${difficultyName}`;
    const sourceChip = document.querySelector("#source-chip");
    sourceChip.textContent = sourceTypeNames[question.sourceType];
    sourceChip.className = `source-chip source-${question.sourceType}`;
    document.querySelector("#variant-chip").textContent =
      `Practice set ${String(setNumber).padStart(2, "0")}`;
    document.querySelector("#source-attribution").textContent = sourceDescription(question);
    document.querySelector("#task-list").innerHTML = visibleTasks(question, difficulty)
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
    revealButton.disabled = false;
    revealButton.innerHTML = '<span aria-hidden="true">◉</span> Submit &amp; reveal';
    buildEditor(question);
    buildStartBars(question);
    renderScores(true);
    updatePlaybackPermissions();
  }

  function buildCriteria(question, difficulty) {
    const maximumLevel = levelOrder[difficulty];
    const grid = document.querySelector("#criteria-grid");
    const rows = [];
    ["A", "M", "E"].forEach((level, index) => {
      if (index + 1 > maximumLevel) return;
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

  function buildEditor(question) {
    const interactive = Boolean(question.interaction);
    editorPanel.hidden = !interactive;
    editorStatus.textContent = "";
    if (!interactive) return;
    const voices = [...new Set(
      question.interaction.editableRegions.flatMap((region) => region.voices)
    )];
    document.querySelector("#voice-controls").innerHTML = voices
      .map((voice) =>
        `<button type="button" data-voice="${voice}" aria-pressed="${voice === selectedVoice}">${voiceLabels[voice]}</button>`
      )
      .join("");
    document.querySelectorAll("#voice-controls [data-voice]").forEach((button) => {
      button.addEventListener("click", () => {
        selectedVoice = button.dataset.voice;
        selectedForPitchMove = false;
        updateEditorControls();
      });
    });
    updateEditorControls();
  }

  function currentDuration() {
    return dotted && ["h", "q", "8"].includes(selectedDuration)
      ? `${selectedDuration}d`
      : selectedDuration;
  }

  function updateEditorControls() {
    if (!currentQuestion?.interaction) return;
    document.querySelectorAll("#editor-panel button, #editor-panel input").forEach((control) => {
      control.disabled = submitted;
    });
    document.querySelectorAll("#voice-controls [data-voice]").forEach((button) => {
      const active = button.dataset.voice === selectedVoice;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
      button.disabled = submitted;
    });
    document.querySelectorAll("#duration-controls [data-duration]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.duration === selectedDuration);
      button.disabled = submitted;
    });
    document.querySelectorAll(".accidental-tool").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.accidental === selectedAccidental);
      button.disabled = submitted;
    });
    const dotButton = document.querySelector("#dot-toggle");
    dotButton.classList.toggle("is-active", dotted);
    dotButton.setAttribute("aria-pressed", String(dotted));
    dotButton.disabled = submitted || !["h", "q", "8"].includes(selectedDuration);
    const restButton = document.querySelector("#rest-toggle");
    restButton.classList.toggle("is-active", restMode);
    restButton.setAttribute("aria-pressed", String(restMode));
    document.querySelector("#undo-edit").disabled = submitted || !answerHistory?.past.length;
    document.querySelector("#redo-edit").disabled = submitted || !answerHistory?.future.length;
    const cursor = studentAnswer?.cursors[selectedVoice];
    document.querySelector("#editor-position").textContent = cursor
      ? `${voiceLabels[selectedVoice]} • bar ${cursor.measure}, beat ${formatBeat(cursor.beat)}`
      : "Select a voice and tap the stave.";
  }

  function formatBeat(value) {
    return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)));
  }

  function setEditorStatus(message, isError = false) {
    editorStatus.textContent = message;
    editorStatus.classList.toggle("is-error", isError);
  }

  function commitAnswer(next, message) {
    studentAnswer = answerHistory.commit(next);
    setEditorStatus(message || "Your notation has been updated.");
    renderedWidth = 0;
    renderScores(true);
    updateEditorControls();
    updatePlaybackPermissions();
  }

  function handleAnswerError(error) {
    setEditorStatus(error.message || String(error), true);
  }

  function activeMeasureGeometry(svgPoint) {
    const map = scoreElement._cadenceHitMap;
    if (!map) return null;
    const containing = map.measures.filter(
      (measure) => svgPoint.x >= measure.x - 8 && svgPoint.x <= measure.endX + 8
    );
    if (!containing.length) return null;
    const staff = ["soprano", "alto", "treble"].includes(selectedVoice)
      ? "treble"
      : "bass";
    return containing
      .map((measure) => {
        const y = staff === "treble" ? measure.topY : measure.bottomY;
        return { measure, staff, distance: y == null ? Infinity : Math.abs(svgPoint.y - (y + 20)) };
      })
      .sort((a, b) => a.distance - b.distance)[0];
  }

  function svgPointFromEvent(event) {
    const svg = scoreElement.querySelector("svg");
    if (!svg) return null;
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    return point.matrixTransform(svg.getScreenCTM().inverse());
  }

  function priorEventsForCursor(voice, measure) {
    return studentAnswer?.measures[measure - 1]?.voices[voice] || [];
  }

  function handleScorePointer(event) {
    if (!currentQuestion?.interaction || submitted) return;
    const studentNode = event.target.closest?.(".student-note");
    if (studentNode?.dataset.editorNoteId) {
      studentAnswer = answerModel.select(studentAnswer, studentNode.dataset.editorNoteId);
      answerHistory.present = copy(studentAnswer);
      selectedForPitchMove = true;
      setEditorStatus("Selected your note. Tap a new stave position or use the tools to edit it.");
      markSelectedNote();
      updateEditorControls();
      return;
    }
    if (event.target.closest?.(".locked-note")) {
      setEditorStatus("That notation was supplied with the question and is locked.", true);
      return;
    }
    const point = svgPointFromEvent(event);
    const hit = point && activeMeasureGeometry(point);
    if (!hit || hit.distance > 46) {
      setEditorStatus("Tap on the stave for the selected voice or staff.", true);
      return;
    }
    if (!answerModel.isEditable(currentQuestion, hit.measure.measure, selectedVoice)) {
      setEditorStatus(`Bar ${hit.measure.measure} is supplied and locked for ${voiceLabels[selectedVoice]}.`, true);
      return;
    }
    const spacing = hit.staff === "treble" ? hit.measure.topSpacing : hit.measure.bottomSpacing;
    const topY = hit.staff === "treble" ? hit.measure.topY : hit.measure.bottomY;
    const stepsFromTopLine = Math.round((point.y - topY) / (spacing / 2));
    const pitch = answerModel.spellPitchAtStaffPosition({
      staff: hit.staff,
      stepsFromTopLine,
      accidental: selectedAccidental,
      keySignature: hit.measure.keySignature,
      priorEvents: priorEventsForCursor(selectedVoice, hit.measure.measure),
    });
    try {
      const addToChord = document.querySelector("#add-to-chord").checked;
      if (selectedForPitchMove && !restMode && !addToChord) {
        selectedForPitchMove = false;
        commitAnswer(
          answerModel.updateSelected(studentAnswer, currentQuestion, {
            pitches: [pitch],
          }),
          `Selected note moved to ${pitch}.`
        );
        if (document.querySelector("#audition-entry").checked) {
          playback.auditionPitch(pitch);
        }
        return;
      }
      const cursor = studentAnswer.cursors[selectedVoice];
      if (cursor.measure !== hit.measure.measure) {
        studentAnswer = copy(studentAnswer);
        studentAnswer.cursors[selectedVoice] = {
          measure: hit.measure.measure,
          beat: answerModel.usedBeats(
            studentAnswer.measures[hit.measure.measure - 1].voices[selectedVoice] || []
          ) + 1,
        };
        answerHistory.present = copy(studentAnswer);
      }
      const next = answerModel.insert(studentAnswer, currentQuestion, {
        voice: selectedVoice,
        pitches: restMode ? [] : [pitch],
        duration: currentDuration(),
        rest: restMode,
        addToChord,
      });
      selectedForPitchMove = false;
      commitAnswer(next, restMode ? "Rest entered." : `${pitch} entered.`);
      if (!restMode && document.querySelector("#audition-entry").checked) {
        playback.auditionPitch(pitch);
      }
    } catch (error) {
      handleAnswerError(error);
    }
  }

  function markSelectedNote() {
    scoreElement.querySelectorAll(".student-note").forEach((note) => {
      note.classList.toggle(
        "is-selected",
        note.dataset.editorNoteId === studentAnswer?.selectedId
      );
    });
  }

  function editSelected(changes, message) {
    try {
      commitAnswer(
        answerModel.updateSelected(studentAnswer, currentQuestion, changes),
        message
      );
    } catch (error) {
      handleAnswerError(error);
    }
  }

  function buildStartBars(question) {
    document.querySelector("#start-bar").innerHTML = question.score.measures
      .map((_, index) => `<option value="${index + 1}">Bar ${index + 1}</option>`)
      .join("");
  }

  function playbackPermissions() {
    return {
      student: Boolean(currentQuestion?.interaction),
      question: submitted,
      context: Boolean(submitted && currentQuestion?.interaction),
      model: submitted,
    };
  }

  function updatePlaybackPermissions() {
    const permissions = playbackPermissions();
    document.querySelectorAll("[data-playback-mode]").forEach((button) => {
      const allowed = permissions[button.dataset.playbackMode];
      button.disabled = !allowed;
      button.classList.toggle("is-active", button.dataset.playbackMode === selectedPlaybackMode && allowed);
      button.setAttribute("aria-pressed", String(button.dataset.playbackMode === selectedPlaybackMode && allowed));
    });
    if (!permissions[selectedPlaybackMode]) {
      selectedPlaybackMode = submitted ? "question" : permissions.student ? "student" : null;
    }
    document.querySelectorAll("[data-playback-mode]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.playbackMode === selectedPlaybackMode);
      button.setAttribute("aria-pressed", String(button.dataset.playbackMode === selectedPlaybackMode));
    });
    const canPlay = Boolean(
      selectedPlaybackMode &&
      permissions[selectedPlaybackMode] &&
      (selectedPlaybackMode !== "student" || answerHasNotes())
    );
    [playPauseButton, document.querySelector("#play-start"), document.querySelector("#play-selection")]
      .forEach((button) => { button.disabled = !canPlay; });
    document.querySelector("#stop-playback").disabled = !canPlay;
    document.querySelector("#playback-lock-message").textContent = submitted
      ? "Question, context and model playback are unlocked."
      : "Available after you submit your answer.";
    if (!currentQuestion?.interaction && !submitted) {
      playbackStatus.textContent = "Printed-score playback is locked until submission.";
    } else if (currentQuestion?.interaction && !answerHasNotes() && !submitted) {
      playbackStatus.textContent = "Enter a note to enable Hear my work.";
    }
  }

  function tempoValue() {
    const input = document.querySelector("#tempo");
    const tempo = Math.min(160, Math.max(40, Number(input.value) || 88));
    input.value = String(tempo);
    return tempo;
  }

  function playbackScore(mode) {
    return answerModel.scoreForPlayback(currentQuestion, submissionSnapshot || studentAnswer, mode);
  }

  function startPlayback(fromSelectedBar = false) {
    if (!selectedPlaybackMode || !playbackPermissions()[selectedPlaybackMode]) return;
    activePlaybackScore = playbackScore(selectedPlaybackMode);
    activePlaybackMode = selectedPlaybackMode;
    const startMeasure = fromSelectedBar
      ? Number(document.querySelector("#start-bar").value || 1)
      : 1;
    const timeline = playback.play(activePlaybackScore, {
      tempo: tempoValue(),
      startMeasure,
    });
    playbackStatus.textContent = timeline.notes.length
      ? `Playing ${selectedPlaybackMode === "student" ? "your work" : selectedPlaybackMode} from bar ${startMeasure}.`
      : "There are no notes in this playback selection.";
    if (!timeline.notes.length) stopPlayback();
  }

  function updateTransportState(state) {
    playPauseButton.textContent = state === "playing" ? "❚❚ Play / Pause" : "▶ Play / Pause";
    if (state === "stopped" && currentQuestion) playbackStatus.textContent = "Playback stopped.";
  }

  function updatePlaybackCursor(progress) {
    if (progress.beat == null || !currentQuestion) {
      playbackCursor.hidden = true;
      return;
    }
    const map = scoreElement._cadenceHitMap;
    const svg = scoreElement.querySelector("svg");
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
    const frameRect = document.querySelector(".score-frame").getBoundingClientRect();
    const scaleX = svgRect.width / map.width;
    const scaleY = svgRect.height / map.height;
    playbackCursor.style.left = `${svgRect.left - frameRect.left + (geometry.x + (geometry.endX - geometry.x) * fraction) * scaleX}px`;
    playbackCursor.style.top = `${svgRect.top - frameRect.top + (geometry.topY - 14) * scaleY}px`;
    const bottom = geometry.bottomY == null ? geometry.topY + 58 : geometry.bottomY + 52;
    playbackCursor.style.height = `${(bottom - geometry.topY + 14) * scaleY}px`;
    playbackCursor.hidden = false;
  }

  function submitAndReveal(options = {}) {
    if (submitted || !currentQuestion) return false;
    const confirmed = options.skipConfirmation || window.confirm(
      "Submit your answer and unlock the model and score playback?"
    );
    if (!confirmed) return false;
    stopPlayback();
    submissionSnapshot = studentAnswer ? copy(studentAnswer) : null;
    if (studentAnswer) {
      studentAnswer = answerModel.setSubmitted(studentAnswer);
      submissionSnapshot = copy(studentAnswer);
      answerHistory.present = copy(studentAnswer);
    }
    submitted = true;
    document.querySelector("#answer-heading").textContent = currentQuestion.answerHeading;
    document.querySelector("#answer-copy").innerHTML = currentQuestion.answer
      .map((line) => `<p>${line}</p>`)
      .join("");
    buildCriteria(currentQuestion, difficultySelect.value);
    answerPanel.hidden = false;
    document.querySelector("#model-score-wrap").hidden = false;
    revealButton.disabled = true;
    revealButton.innerHTML = '<span aria-hidden="true">✓</span> Answer submitted';
    renderedWidth = 0;
    renderScores(true);
    updateEditorControls();
    selectedPlaybackMode = currentQuestion.interaction && answerHasNotes()
      ? "context"
      : "question";
    updatePlaybackPermissions();
    if (!options.noScroll) {
      answerPanel.scrollIntoView({ behavior: "smooth", block: "start" });
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

  document.querySelector("#new-question").addEventListener("click", () => renderQuestion());
  categorySelect.addEventListener("change", () => renderQuestion());
  sourceSelect.addEventListener("change", () => renderQuestion());
  difficultySelect.addEventListener("change", () => renderQuestion(currentQuestion || chooseQuestion()));
  revealButton.addEventListener("click", () => submitAndReveal());
  document.querySelector("#print-question").addEventListener("click", () => window.print());
  scoreElement.addEventListener("pointerdown", handleScorePointer);

  document.querySelectorAll("#duration-controls [data-duration]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedDuration = button.dataset.duration;
      if (!["h", "q", "8"].includes(selectedDuration)) dotted = false;
      if (studentAnswer?.selectedId) {
        editSelected({ duration: currentDuration() }, "Duration updated.");
      }
      updateEditorControls();
    });
  });
  document.querySelector("#dot-toggle").addEventListener("click", () => {
    dotted = !dotted;
    if (studentAnswer?.selectedId) {
      editSelected({ duration: currentDuration() }, "Dot updated.");
    }
    updateEditorControls();
  });
  document.querySelector("#rest-toggle").addEventListener("click", () => {
    restMode = !restMode;
    if (studentAnswer?.selectedId) {
      editSelected({ rest: restMode }, restMode ? "Converted to a rest." : "Converted to a note.");
    }
    updateEditorControls();
  });
  document.querySelectorAll(".accidental-tool").forEach((button) => {
    button.addEventListener("click", () => {
      selectedAccidental = button.dataset.accidental;
      if (studentAnswer?.selectedId) {
        try {
          commitAnswer(
            answerModel.applyAccidental(studentAnswer, currentQuestion, selectedAccidental),
            "Accidental updated."
          );
        } catch (error) {
          handleAnswerError(error);
        }
      }
      updateEditorControls();
    });
  });
  document.querySelector("#tie-note").addEventListener("click", () => {
    try {
      commitAnswer(answerModel.toggleTie(studentAnswer, currentQuestion), "Tie updated.");
    } catch (error) {
      handleAnswerError(error);
    }
  });
  document.querySelector("#delete-note").addEventListener("click", () => {
    try {
      selectedForPitchMove = false;
      commitAnswer(answerModel.deleteSelected(studentAnswer, currentQuestion), "Selected note deleted.");
    } catch (error) {
      handleAnswerError(error);
    }
  });
  document.querySelector("#undo-edit").addEventListener("click", () => {
    selectedForPitchMove = false;
    studentAnswer = answerHistory.undo();
    setEditorStatus("Undid the last notation change.");
    renderedWidth = 0;
    renderScores(true);
    updateEditorControls();
    updatePlaybackPermissions();
  });
  document.querySelector("#redo-edit").addEventListener("click", () => {
    selectedForPitchMove = false;
    studentAnswer = answerHistory.redo();
    setEditorStatus("Redid the notation change.");
    renderedWidth = 0;
    renderScores(true);
    updateEditorControls();
    updatePlaybackPermissions();
  });
  document.addEventListener("keydown", (event) => {
    if (!currentQuestion?.interaction || submitted || !(event.metaKey || event.ctrlKey)) return;
    if (event.key.toLowerCase() !== "z") return;
    event.preventDefault();
    selectedForPitchMove = false;
    const next = event.shiftKey ? answerHistory.redo() : answerHistory.undo();
    studentAnswer = next;
    renderedWidth = 0;
    renderScores(true);
    updateEditorControls();
    updatePlaybackPermissions();
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
      startPlayback(true);
    }
  });
  document.querySelector("#stop-playback").addEventListener("click", stopPlayback);
  document.querySelector("#play-start").addEventListener("click", () => startPlayback(false));
  document.querySelector("#play-selection").addEventListener("click", () => startPlayback(true));
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
    submit: submitAndReveal,
    stopPlayback,
    getCurrentQuestion: () => currentQuestion,
    getStudentAnswer: () => copy(studentAnswer),
    getSubmissionSnapshot: () => copy(submissionSnapshot),
    getPlaybackPermissions: () => copy(playbackPermissions()),
    isSubmitted: () => submitted,
  });

  const requestedQuestionId = new URLSearchParams(window.location.search).get("question");
  const requestedQuestion = questionBank.find((question) => question.id === requestedQuestionId);
  if (requestedQuestion) {
    categorySelect.value = requestedQuestion.category;
    sourceSelect.value = requestedQuestion.sourceType;
  }
  renderQuestion(requestedQuestion || undefined);
})();
