(function () {
  "use strict";

  const data = window.CadenceData;
  const baseRenderer = window.CadenceScoreRenderer;
  if (!data?.questions || !baseRenderer?.render) {
    throw new Error(
      "Cadence Lab score display consistency requires the question bank and score renderer first."
    );
  }

  const REFERENCE_TYPES = new Set([
    "nzqa-reference",
    "practice-assessment-reference",
  ]);
  const LOCATION_INTERACTIONS = new Set([
    "roman-analysis",
    "jazz-chord-placement",
  ]);
  const SVG_NS = "http://www.w3.org/2000/svg";
  const VOICES = ["soprano", "alto", "tenor", "bass"];
  const NATURAL_PITCH_CLASSES = Object.freeze({
    C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11,
  });

  function copy(value) {
    return typeof structuredClone === "function"
      ? structuredClone(value)
      : JSON.parse(JSON.stringify(value));
  }

  function questionById(id) {
    return data.questions.find((question) => question.id === id) || null;
  }

  function setModelVoice(questionId, measureIndex, eventIndex, voice, pitch) {
    const question = questionById(questionId);
    const event = question?.score?.measures?.[measureIndex]?.events?.[eventIndex];
    if (!event?.voices || !Object.hasOwn(event.voices, voice)) {
      throw new Error(
        `${questionId}: cannot apply ${voice} model correction at measure ${measureIndex + 1}, event ${eventIndex + 1}`
      );
    }
    event.voices[voice] = pitch;
  }

  function applyOriginalSatbModelCorrections() {
    // F major -> C major: remove the tenor/bass parallel fifth into the
    // fourth chord without changing the supplied soprano or bass.
    setModelVoice("satb-f-c", 0, 3, "tenor", "C4");

    // G-minor model: remove the two tenor/bass parallel-fifth chains while
    // preserving the soprano leading-note resolutions and chord functions.
    setModelVoice("satb-gminor", 1, 1, "tenor", "Bb3");
    setModelVoice("satb-gminor", 2, 0, "tenor", "C4");
    setModelVoice("satb-gminor", 2, 2, "tenor", "Bb3");

    // C major -> A minor: revoice the inner parts so the model contains no
    // consecutive perfect fifths/octaves and the final E7 tendencies resolve
    // literally as described: G# -> A and D -> C.
    setModelVoice("satb-c-aminor", 0, 0, "tenor", "C4");
    setModelVoice("satb-c-aminor", 0, 1, "alto", "C4");
    setModelVoice("satb-c-aminor", 0, 1, "tenor", "A3");
    setModelVoice("satb-c-aminor", 0, 2, "tenor", "D4");
    setModelVoice("satb-c-aminor", 0, 3, "tenor", "C4");
    setModelVoice("satb-c-aminor", 1, 0, "alto", "F4");
    setModelVoice("satb-c-aminor", 1, 0, "tenor", "A3");
    setModelVoice("satb-c-aminor", 1, 1, "alto", "D4");
    setModelVoice("satb-c-aminor", 1, 1, "tenor", "G#3");
    setModelVoice("satb-c-aminor", 2, 0, "alto", "C4");
    setModelVoice("satb-c-aminor", 2, 0, "tenor", "A3");
  }

  function pitchMidi(value) {
    const match = /^([A-G])([#b]?)(-?\d+)$/.exec(String(value || ""));
    if (!match) return null;
    const accidental = match[2] === "#" ? 1 : match[2] === "b" ? -1 : 0;
    return (
      (Number(match[3]) + 1) * 12 +
      NATURAL_PITCH_CLASSES[match[1]] +
      accidental
    );
  }

  function originalSatbParallelErrors(question) {
    if (question.sourceType !== "original-practice" || question.category !== "satb") {
      return [];
    }
    const moments = (question.score?.measures || []).flatMap((measure) =>
      (measure.events || [])
        .filter((event) => event.voices && VOICES.every((voice) => event.voices[voice]))
        .map((event) => ({ ...event.voices }))
    );
    const errors = [];
    for (let index = 1; index < moments.length; index += 1) {
      const previous = moments[index - 1];
      const current = moments[index];
      for (let first = 0; first < VOICES.length; first += 1) {
        for (let second = first + 1; second < VOICES.length; second += 1) {
          const firstVoice = VOICES[first];
          const secondVoice = VOICES[second];
          const previousFirst = pitchMidi(previous[firstVoice]);
          const previousSecond = pitchMidi(previous[secondVoice]);
          const currentFirst = pitchMidi(current[firstVoice]);
          const currentSecond = pitchMidi(current[secondVoice]);
          if ([previousFirst, previousSecond, currentFirst, currentSecond].some(
            (pitch) => !Number.isFinite(pitch)
          )) continue;
          const previousInterval = Math.abs(previousFirst - previousSecond) % 12;
          const currentInterval = Math.abs(currentFirst - currentSecond) % 12;
          const firstMotion = currentFirst - previousFirst;
          const secondMotion = currentSecond - previousSecond;
          const samePerfectClass =
            previousInterval === currentInterval &&
            [0, 7].includes(currentInterval);
          if (samePerfectClass && firstMotion * secondMotion > 0) {
            errors.push(
              `${question.id}: consecutive ${currentInterval === 7 ? "perfect fifths" : "octaves/unisons"} between ${firstVoice} and ${secondVoice} at model moments ${index}–${index + 1}`
            );
          }
        }
      }
    }
    return errors;
  }

  function integerRange(first, last) {
    if (!Number.isInteger(first) || !Number.isInteger(last) || last < first) {
      return null;
    }
    return Array.from({ length: last - first + 1 }, (_, index) => first + index);
  }

  function printedRange(question) {
    const value = question.sourceSpec?.printedBars || question.source?.bars || "";
    const match = /^\s*(\d+)\s*[–-]\s*(\d+)\s*$/.exec(String(value));
    if (!match) return null;
    return integerRange(Number(match[1]), Number(match[2]));
  }

  function exactReferenceBarNumbers(question) {
    if (!REFERENCE_TYPES.has(question.sourceType)) return null;
    if (question.sourceSpec?.transcriptionMode !== "exact") return null;
    const measureCount = question.score?.measures?.length || 0;
    if (!measureCount) return [];

    if (Array.isArray(question.sourceSpec?.printedBarNumbers)) {
      const authored = [...question.sourceSpec.printedBarNumbers];
      return authored.length === measureCount ? authored : null;
    }

    const range = printedRange(question);
    if (!range) return null;
    const pickupCount = Number(question.sourceSpec?.pickupMeasureCount || 0);
    if (pickupCount + range.length === measureCount) {
      return [...Array(pickupCount).fill(null), ...range];
    }
    if (range.length === measureCount) return range;
    return null;
  }

  function deriveBarNumbers(question) {
    const measures = question.score?.measures || [];
    const count = measures.length;
    if (!count) return [];

    if (Array.isArray(question.score?.barNumbers) &&
        question.score.barNumbers.length === count) {
      return [...question.score.barNumbers];
    }

    const measureAuthored = measures.map((measure) => measure.barNumber);
    if (measureAuthored.every((value) => value !== undefined)) {
      return measureAuthored;
    }

    const exactNumbers = exactReferenceBarNumbers(question);
    if (exactNumbers) return exactNumbers;

    return Array.from({ length: count }, (_, index) => index + 1);
  }

  function formatBeat(value) {
    const numeric = Number(value ?? 1);
    if (!Number.isFinite(numeric)) return String(value ?? 1);
    return String(numeric);
  }

  function locationLabel(question, harmonicEvent) {
    const numbers = question.score?.barNumbers || deriveBarNumbers(question);
    const internalMeasure = Number(harmonicEvent?.measure || 1);
    const printedBar = numbers[internalMeasure - 1];
    const barLabel = printedBar == null ? "Pickup" : `Bar ${printedBar}`;
    return `${barLabel}, beat ${formatBeat(harmonicEvent?.beat || 1)}`;
  }

  function usesScoreLocationLabels(question) {
    return question.sourceType !== "generated-practice" &&
      LOCATION_INTERACTIONS.has(question.interaction?.type) &&
      Boolean(question.interaction?.slots?.length);
  }

  function applyQuestion(question) {
    if (!question?.score?.measures?.length) return question;
    const numbers = deriveBarNumbers(question);
    question.score.barNumbers = numbers;
    const hasLocationSlots = usesScoreLocationLabels(question);
    if (question.score.showBarNumbers === undefined) {
      question.score.showBarNumbers = question.score.measures.length > 1 || hasLocationSlots;
    }

    if (hasLocationSlots) {
      question.interaction.slots.forEach((slot) => {
        const event = Number.isInteger(slot.harmonicIndex)
          ? question.score.harmonicEvents?.[slot.harmonicIndex]
          : null;
        if (event) slot.label = locationLabel(question, event);
      });
    }
    return question;
  }

  function auditQuestions(questions = data.questions) {
    const errors = [];
    questions.forEach((question) => {
      if (!question?.score?.measures?.length) return;
      const numbers = question.score.barNumbers;
      if (!Array.isArray(numbers) || numbers.length !== question.score.measures.length) {
        errors.push(`${question.id}: score bar-number mapping does not match the displayed measures`);
        return;
      }

      if (REFERENCE_TYPES.has(question.sourceType) &&
          question.sourceSpec?.transcriptionMode === "exact") {
        const expected = exactReferenceBarNumbers(question);
        if (!expected) {
          errors.push(`${question.id}: exact reference bar numbers cannot be derived from its source contract`);
        } else if (JSON.stringify(numbers) !== JSON.stringify(expected)) {
          errors.push(
            `${question.id}: exact reference bar numbers ${JSON.stringify(numbers)} do not match ${JSON.stringify(expected)}`
          );
        }
      }

      if (usesScoreLocationLabels(question)) {
        (question.interaction.slots || []).forEach((slot) => {
          const event = Number.isInteger(slot.harmonicIndex)
            ? question.score.harmonicEvents?.[slot.harmonicIndex]
            : null;
          if (!event) {
            errors.push(`${question.id}: response slot ${slot.id} has no harmonic location`);
            return;
          }
          if (event.answerRole !== "editable" || event.analysisBox === false) {
            errors.push(`${question.id}: response slot ${slot.id} does not point to a visible editable score box`);
          }
          const expectedLabel = locationLabel(question, event);
          if (slot.label !== expectedLabel) {
            errors.push(
              `${question.id}: response slot ${slot.id} says “${slot.label}” but the score location is “${expectedLabel}”`
            );
          }
        });
      }

      errors.push(...originalSatbParallelErrors(question));
    });
    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  applyOriginalSatbModelCorrections();
  data.questions.forEach(applyQuestion);
  const displayAudit = auditQuestions();
  if (!displayAudit.valid) {
    throw new Error(
      `Score display consistency failed:\n${displayAudit.errors.join("\n")}`
    );
  }

  function createSvgText(attributes, text) {
    const element = document.createElementNS(SVG_NS, "text");
    Object.entries(attributes).forEach(([name, value]) =>
      element.setAttribute(name, String(value))
    );
    element.textContent = String(text);
    return element;
  }

  function decorateBarNumbers(target, score) {
    const svg = target.querySelector(".notation-canvas svg");
    const hitMeasures = target._cadenceHitMap?.measures || [];
    if (!svg || !hitMeasures.length) return;

    svg.querySelector(".score-bar-numbers")?.remove();
    const numbers = Array.isArray(score?.barNumbers) &&
      score.barNumbers.length === hitMeasures.length
      ? score.barNumbers
      : hitMeasures.map((_, index) => index + 1);
    target.dataset.barNumbers = JSON.stringify(numbers);

    const visible = score?.showBarNumbers !== false &&
      (hitMeasures.length > 1 || numbers.some((value) => value != null));
    if (!visible) {
      target.dataset.barNumberCount = "0";
      return;
    }

    const group = document.createElementNS(SVG_NS, "g");
    group.setAttribute("class", "score-bar-numbers");
    group.setAttribute("aria-hidden", "true");
    let count = 0;
    hitMeasures.forEach((measure, index) => {
      const number = numbers[index];
      if (number == null) return;
      const x = Math.max(10, Number(measure.x || 0) - 8);
      const y = Math.max(12, Number(measure.topY || 20) - 7);
      group.appendChild(createSvgText({
        class: "measure-bar-number",
        x,
        y,
        "text-anchor": "middle",
        "font-family": "Georgia, 'Times New Roman', serif",
        "font-size": 10.5,
        "font-weight": 700,
        fill: "#526176",
        "data-internal-measure": measure.measure,
        "data-bar-number": number,
      }, number));
      count += 1;
    });
    svg.appendChild(group);
    target.dataset.barNumberCount = String(count);
  }

  function strengthenEditableBoxes(target, score, options = {}) {
    const groups = [...target.querySelectorAll(
      ".analysis-box-group.analysis-box-editable"
    )];
    target.dataset.editableAnalysisBoxCount = String(groups.length);

    if (options.showAnswer) {
      target.dataset.blankEditableAnalysisBoxCount = "0";
      return;
    }

    const eventBySlot = new Map(
      (score.harmonicEvents || [])
        .filter((event) => event.answerSlotId)
        .map((event) => [event.answerSlotId, event])
    );

    groups.forEach((group) => {
      const rect = group.querySelector(".analysis-box");
      if (!rect) return;
      const blank = !group.querySelector(".analysis-box-label");
      const event = eventBySlot.get(group.dataset.answerSlotId || "");
      const position = event?.labelPosition || score.labelPosition || "bottom";
      group.dataset.blankEditable = String(blank);
      group.dataset.boxPosition = position;

      // The original y-position sat too close to downward bass stems. Keep the
      // same useful boxes, but move only bottom answer-entry boxes clear of the
      // notation. Top jazz/pop boxes stay where they were.
      if (position !== "top") {
        group.setAttribute("transform", "translate(0 18)");
        group.dataset.boxShiftY = "18";
      }

      rect.style.fill = blank ? "#eef6ff" : "#eff6ff";
      rect.style.stroke = "#2563eb";
      rect.style.strokeWidth = blank ? "2" : "1.8";
      rect.style.strokeDasharray = blank ? "5 3" : "none";
    });

    target.dataset.blankEditableAnalysisBoxCount = String(
      groups.filter((group) => group.dataset.blankEditable === "true").length
    );
  }

  const wrappedRenderer = Object.freeze({
    ...baseRenderer,
    __scoreDisplayConsistency: true,
    render(target, score, options = {}) {
      const result = baseRenderer.render(target, score, options);
      decorateBarNumbers(target, score);
      strengthenEditableBoxes(target, score, options);
      return result;
    },
  });
  window.CadenceScoreRenderer = wrappedRenderer;

  function startKeyModulationDuplicateSuppressor() {
    const lab = window.CadenceLab;
    const modelWrap = document.querySelector("#model-score-wrap");
    const answerPanel = document.querySelector("#answer-panel");
    const printModel = document.querySelector("#print-model");
    if (!lab || !modelWrap || !answerPanel) return;

    const suppressDuplicate = () => {
      const question = lab.getCurrentQuestion?.();
      const shouldSuppress =
        lab.isSubmitted?.() === true &&
        question?.interaction?.type === "key-modulation";
      if (!shouldSuppress) return;

      // Key/modulation questions use the same musical extract before and after
      // submission, so a second notation copy adds nothing. Do not touch the
      // main score and do not interfere with Roman/jazz answer re-rendering.
      if (!modelWrap.hidden) modelWrap.hidden = true;
      if (printModel && !printModel.hidden) printModel.hidden = true;
    };

    const observer = new MutationObserver(() => queueMicrotask(suppressDuplicate));
    observer.observe(answerPanel, {
      attributes: true,
      attributeFilter: ["hidden"],
    });
    observer.observe(modelWrap, {
      attributes: true,
      attributeFilter: ["hidden"],
    });
    queueMicrotask(suppressDuplicate);
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      startKeyModulationDuplicateSuppressor,
      { once: true }
    );
  } else {
    queueMicrotask(startKeyModulationDuplicateSuppressor);
  }

  window.CadenceScoreDisplay = Object.freeze({
    applyQuestion,
    deriveBarNumbers: (question) => copy(deriveBarNumbers(question)),
    exactReferenceBarNumbers: (question) => {
      const result = exactReferenceBarNumbers(question);
      return result ? copy(result) : result;
    },
    locationLabel,
    originalSatbParallelErrors,
    audit: () => auditQuestions(data.questions),
    initialAudit: displayAudit,
  });
})();
