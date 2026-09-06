(function () {
  "use strict";
  const data = window.CadenceData;
  if (!data?.questions) throw new Error("Cadence Lab score consistency requires the question bank first.");

  const REFERENCE_TYPES = new Set(["nzqa-reference", "practice-assessment-reference"]);
  const LOCATION_INTERACTIONS = new Set(["roman-analysis", "jazz-chord-placement"]);
  const copy = (value) => typeof structuredClone === "function"
    ? structuredClone(value) : JSON.parse(JSON.stringify(value));

  function integerRange(first, last) {
    if (!Number.isInteger(first) || !Number.isInteger(last) || last < first) return null;
    return Array.from({ length: last - first + 1 }, (_, index) => first + index);
  }

  function printedRange(question) {
    const value = question.sourceSpec?.printedBars || question.source?.bars || "";
    const match = /^\s*(\d+)\s*[–-]\s*(\d+)\s*$/.exec(String(value));
    return match ? integerRange(Number(match[1]), Number(match[2])) : null;
  }

  function exactReferenceBarNumbers(question) {
    if (!REFERENCE_TYPES.has(question.sourceType) || question.sourceSpec?.transcriptionMode !== "exact") return null;
    const measureCount = question.score?.measures?.length || 0;
    if (!measureCount) return [];
    if (Array.isArray(question.sourceSpec?.printedBarNumbers)) {
      const numbers = [...question.sourceSpec.printedBarNumbers];
      return numbers.length === measureCount ? numbers : null;
    }
    const range = printedRange(question);
    if (!range) return null;
    const pickups = Number(question.sourceSpec?.pickupMeasureCount || 0);
    if (pickups + range.length === measureCount) return [...Array(pickups).fill(null), ...range];
    return range.length === measureCount ? range : null;
  }

  function deriveBarNumbers(question) {
    const count = question.score?.measures?.length || 0;
    if (!count) return [];
    if (Array.isArray(question.score?.barNumbers) && question.score.barNumbers.length === count) return [...question.score.barNumbers];
    const authored = question.score.measures.map((measure) => measure.barNumber);
    if (authored.every((value) => value !== undefined)) return authored;
    return exactReferenceBarNumbers(question) || Array.from({ length: count }, (_, index) => index + 1);
  }

  function locationLabel(question, event) {
    const numbers = question.score?.barNumbers || deriveBarNumbers(question);
    const printedBar = numbers[Number(event?.measure || 1) - 1];
    return `${printedBar == null ? "Pickup" : `Bar ${printedBar}`}, beat ${Number(event?.beat || 1)}`;
  }

  function usesScoreLocationLabels(question) {
    return question.sourceType !== "generated-practice" &&
      LOCATION_INTERACTIONS.has(question.interaction?.type) && Boolean(question.interaction?.slots?.length);
  }

  function applyQuestion(question) {
    if (!question?.score?.measures?.length) return question;
    question.score.barNumbers = deriveBarNumbers(question);
    if (question.score.showBarNumbers === undefined) {
      question.score.showBarNumbers = question.score.measures.length > 1 || usesScoreLocationLabels(question);
    }
    if (usesScoreLocationLabels(question)) {
      question.interaction.slots.forEach((slot) => {
        const event = Number.isInteger(slot.harmonicIndex) ? question.score.harmonicEvents?.[slot.harmonicIndex] : null;
        if (event) slot.label = locationLabel(question, event);
      });
    }
    return question;
  }

  function auditQuestions(questions = data.questions) {
    const errors = [];
    questions.forEach((question) => {
      const count = question.score?.measures?.length || 0;
      if (!count) return;
      if (!Array.isArray(question.score.barNumbers) || question.score.barNumbers.length !== count) {
        errors.push(`${question.id}: score bar-number mapping does not match its measures`);
      }
      if (question.sourceType === "original-practice" && question.source?.adaptedFrom) {
        const expected = Array.from({ length: count }, (_, index) => index + 1);
        if (JSON.stringify(question.score.barNumbers) !== JSON.stringify(expected)) {
          errors.push(`${question.id}: adapted score must use displayed bars 1–${count}`);
        }
        if (question.sourceSpec?.displayedBars !== `1–${count}`) {
          errors.push(`${question.id}: adapted source contract lacks displayed bar range 1–${count}`);
        }
      }
      if (REFERENCE_TYPES.has(question.sourceType) && question.sourceSpec?.transcriptionMode === "exact") {
        const expected = exactReferenceBarNumbers(question);
        if (!expected || JSON.stringify(question.score.barNumbers) !== JSON.stringify(expected)) {
          errors.push(`${question.id}: exact-reference bar numbers differ from the source contract`);
        }
      }
      if (usesScoreLocationLabels(question)) {
        const editable = (question.score.harmonicEvents || []).filter((event) => event.answerRole === "editable" && event.analysisBox !== false);
        if (editable.length !== question.interaction.slots.length) errors.push(`${question.id}: editable score-box and response-slot counts differ`);
        question.interaction.slots.forEach((slot) => {
          const event = Number.isInteger(slot.harmonicIndex) ? question.score.harmonicEvents?.[slot.harmonicIndex] : null;
          if (!event || event.answerRole !== "editable" || event.analysisBox === false) {
            errors.push(`${question.id}: ${slot.id} does not target a visible editable box`);
          } else if (slot.label !== locationLabel(question, event)) {
            errors.push(`${question.id}: ${slot.id} has a stale score-location label`);
          }
        });
      }
    });
    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  data.questions.forEach(applyQuestion);
  const initialAudit = auditQuestions();
  if (!initialAudit.valid) throw new Error(`Score consistency failed:\n${initialAudit.errors.join("\n")}`);
  window.CadenceScoreDisplay = Object.freeze({
    applyQuestion,
    deriveBarNumbers: (question) => copy(deriveBarNumbers(question)),
    exactReferenceBarNumbers: (question) => {
      const result = exactReferenceBarNumbers(question);
      return result ? copy(result) : result;
    },
    locationLabel,
    audit: () => auditQuestions(data.questions),
    initialAudit,
  });
})();
