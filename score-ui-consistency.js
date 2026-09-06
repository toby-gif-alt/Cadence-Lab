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

  function copy(value) {
    return typeof structuredClone === "function"
      ? structuredClone(value)
      : JSON.parse(JSON.stringify(value));
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
    return Number.isInteger(numeric) ? String(numeric) : String(numeric);
  }

  function locationLabel(question, harmonicEvent) {
    const numbers = question.score?.barNumbers || deriveBarNumbers(question);
    const internalMeasure = Number(harmonicEvent?.measure || 1);
    const printedBar = numbers[internalMeasure - 1];
    const barLabel = printedBar == null ? "Pickup" : `Bar ${printedBar}`;
    return `${barLabel}, beat ${formatBeat(harmonicEvent?.beat || 1)}`;
  }

  function applyQuestion(question) {
    if (!question?.score?.measures?.length) return question;
    const numbers = deriveBarNumbers(question);
    question.score.barNumbers = numbers;
    const hasLocationSlots =
      LOCATION_INTERACTIONS.has(question.interaction?.type) &&
      Boolean(question.interaction?.slots?.length);
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

      if (LOCATION_INTERACTIONS.has(question.interaction?.type)) {
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
    });
    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

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

  function strengthenEditableBoxes(target) {
    target.querySelectorAll(
      ".analysis-box-group.analysis-box-editable"
    ).forEach((group) => {
      const rect = group.querySelector(".analysis-box");
      if (!rect) return;
      const blank = !group.querySelector(".analysis-box-label");
      group.dataset.blankEditable = String(blank);
      rect.style.fill = blank ? "#eef6ff" : "#eff6ff";
      rect.style.stroke = "#2563eb";
      rect.style.strokeWidth = blank ? "2" : "1.8";
      rect.style.strokeDasharray = blank ? "5 3" : "none";
    });
    target.dataset.editableAnalysisBoxCount = String(
      target.querySelectorAll(".analysis-box-group.analysis-box-editable").length
    );
    target.dataset.blankEditableAnalysisBoxCount = String(
      target.querySelectorAll(
        '.analysis-box-group.analysis-box-editable[data-blank-editable="true"]'
      ).length
    );
  }

  const wrappedRenderer = Object.freeze({
    ...baseRenderer,
    __scoreDisplayConsistency: true,
    render(target, score, options = {}) {
      const result = baseRenderer.render(target, score, options);
      decorateBarNumbers(target, score);
      strengthenEditableBoxes(target);
      return result;
    },
  });
  window.CadenceScoreRenderer = wrappedRenderer;

  function scoreLayout(question) {
    if (question.score?.layout) return question.score.layout;
    if (question.category === "satb") return "satb";
    if (question.category === "piano") return "piano";
    return "grand";
  }

  function startRevealSynchronizer() {
    const lab = window.CadenceLab;
    const scoreElement = document.querySelector("#score");
    const modelWrap = document.querySelector("#model-score-wrap");
    const modelScore = document.querySelector("#model-score");
    const answerPanel = document.querySelector("#answer-panel");
    if (!lab || !scoreElement || !modelWrap || !modelScore || !answerPanel) return;

    let synchronizing = false;
    const sync = () => {
      if (synchronizing) return;
      const question = lab.getCurrentQuestion?.();
      if (!question) return;
      applyQuestion(question);
      const submitted = lab.isSubmitted?.() === true;
      const paperCompletion = question.interaction?.type === "paper-completion";
      const printingQuestion = document.body.dataset.printMode === "question";

      if (!submitted || paperCompletion || printingQuestion) return;

      modelWrap.hidden = true;
      if (modelScore.childNodes.length) modelScore.replaceChildren();
      if (scoreElement.dataset.scoreMode === "model") return;

      synchronizing = true;
      try {
        const width = scoreElement.getBoundingClientRect().width ||
          document.querySelector(".score-frame")?.getBoundingClientRect().width ||
          900;
        window.CadenceScoreRenderer.render(scoreElement, question.score, {
          layout: scoreLayout(question),
          showAnswer: true,
          width,
        });
      } finally {
        synchronizing = false;
      }
    };

    const observer = new MutationObserver(() => queueMicrotask(sync));
    observer.observe(scoreElement, {
      childList: true,
      attributes: true,
      attributeFilter: ["data-score-mode"],
    });
    observer.observe(modelWrap, {
      attributes: true,
      attributeFilter: ["hidden"],
    });
    observer.observe(answerPanel, {
      attributes: true,
      attributeFilter: ["hidden"],
    });
    window.addEventListener("afterprint", () => queueMicrotask(sync));
    queueMicrotask(sync);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startRevealSynchronizer, { once: true });
  } else {
    queueMicrotask(startRevealSynchronizer);
  }

  window.CadenceScoreDisplay = Object.freeze({
    applyQuestion,
    deriveBarNumbers: (question) => copy(deriveBarNumbers(question)),
    exactReferenceBarNumbers: (question) => {
      const result = exactReferenceBarNumbers(question);
      return result ? copy(result) : result;
    },
    locationLabel,
    audit: () => auditQuestions(data.questions),
    initialAudit: displayAudit,
  });
})();
