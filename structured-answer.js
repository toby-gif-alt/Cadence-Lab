(function () {
  "use strict";

  const TYPES = new Set([
    "roman-analysis",
    "key-modulation",
    "jazz-chord-placement",
    "feature-analysis",
  ]);

  function copy(value) {
    return typeof structuredClone === "function"
      ? structuredClone(value)
      : JSON.parse(JSON.stringify(value));
  }

  function deterministicShuffle(items, seedText) {
    let seed = [...String(seedText || "cadence-lab")].reduce(
      (value, character) => (value * 31 + character.charCodeAt(0)) >>> 0,
      2166136261
    );
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const target = seed % (index + 1);
      [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
    }
    return shuffled;
  }

  function create(question) {
    const interaction = question?.interaction;
    if (!interaction || !TYPES.has(interaction.type)) return null;
    const slots = Object.fromEntries(
      (interaction.slots || []).map((slot) => [slot.id, null])
    );
    const fields = Object.fromEntries(
      (interaction.fields || []).map((field) => [field.id, null])
    );
    const slotConstraints = Object.fromEntries(
      (interaction.slots || []).map((slot) => [slot.id, {
        allowDualAnalysis: slot.allowDualAnalysis === true,
      }])
    );
    const bank = interaction.type === "jazz-chord-placement"
      ? deterministicShuffle(
          (interaction.bank || []).map((token, index) => ({
            id: token.id || `${question.id}-token-${index + 1}`,
            label: token.label,
            homeIndex: index,
          })),
          interaction.seed || question.id
        )
      : [];
    return {
      questionId: question.id,
      type: interaction.type,
      slots,
      slotConstraints,
      fields,
      evidence: "",
      bank,
      hintBankVisible: false,
      activeSlotId: interaction.slots?.[0]?.id || null,
      submitted: false,
      revision: 0,
    };
  }

  function assertEditable(state) {
    if (!state || state.submitted) {
      throw new Error("This response is locked after submission.");
    }
  }

  function setSlot(state, slotId, value) {
    assertEditable(state);
    if (!Object.hasOwn(state.slots, slotId)) {
      throw new Error(`Unknown answer position: ${slotId}`);
    }
    const next = copy(state);
    next.slots[slotId] = value
      ? state.type === "roman-analysis"
        ? sanitizeRomanValue(value, next.slotConstraints?.[slotId])
        : copy(value)
      : null;
    next.activeSlotId = slotId;
    next.revision += 1;
    return next;
  }

  function sanitizeRomanAnalysis(value) {
    const next = copy(value || {});
    const extent = next.quality === "half-diminished"
      ? "seventh"
      : next.extent === "seventh" ? "seventh" : "triad";
    const validInversions = extent === "seventh"
      ? ["root", "b", "c", "d"]
      : ["root", "b", "c"];
    next.extent = extent;
    next.inversion = validInversions.includes(next.inversion) ? next.inversion : "root";
    return next;
  }

  function sanitizeRomanValue(value, constraints = {}) {
    const next = copy(value || {});
    if (Array.isArray(next.analyses)) {
      next.analyses = next.analyses
        .slice(0, constraints.allowDualAnalysis === true ? 2 : 1)
        .map(sanitizeRomanAnalysis);
      return next;
    }
    return sanitizeRomanAnalysis(next);
  }

  function setActiveSlot(state, slotId) {
    if (!state || !Object.hasOwn(state.slots, slotId)) return state;
    const next = copy(state);
    next.activeSlotId = slotId;
    return next;
  }

  function advanceToNextUnanswered(state, orderedSlotIds) {
    const ids = (orderedSlotIds || Object.keys(state?.slots || {})).filter(
      (slotId) => Object.hasOwn(state.slots, slotId)
    );
    if (!ids.length) return state;
    const activeIndex = Math.max(0, ids.indexOf(state.activeSlotId));
    const nextId = [
      ...ids.slice(activeIndex + 1),
      ...ids.slice(0, activeIndex),
    ].find((slotId) => !state.slots[slotId]);
    if (!nextId) return state;
    return setActiveSlot(state, nextId);
  }

  function setField(state, fieldId, value) {
    assertEditable(state);
    if (!Object.hasOwn(state.fields, fieldId)) {
      throw new Error(`Unknown response field: ${fieldId}`);
    }
    const next = copy(state);
    next.fields[fieldId] = value ? copy(value) : null;
    next.revision += 1;
    return next;
  }

  function setEvidence(state, value) {
    assertEditable(state);
    const next = copy(state);
    next.evidence = String(value || "");
    next.revision += 1;
    return next;
  }

  function tokenInSlot(state, slotId) {
    const value = state.slots[slotId];
    return value?.tokenId
      ? state.bank.find((token) => token.id === value.tokenId) || null
      : null;
  }

  function placeToken(state, slotId, tokenId) {
    assertEditable(state);
    const token = state.bank.find((candidate) => candidate.id === tokenId);
    if (!token) throw new Error("That chord token is not in this question.");
    const next = copy(state);
    const occupiedSlot = Object.keys(next.slots).find(
      (candidate) => next.slots[candidate]?.tokenId === tokenId
    );
    const displaced = next.slots[slotId];
    if (occupiedSlot && occupiedSlot !== slotId) {
      next.slots[occupiedSlot] = displaced || null;
    }
    next.slots[slotId] = { tokenId, label: token.label, source: "bank" };
    next.activeSlotId = slotId;
    next.revision += 1;
    return next;
  }

  function returnToken(state, slotId) {
    return setSlot(state, slotId, null);
  }

  function reset(state) {
    assertEditable(state);
    const next = copy(state);
    Object.keys(next.slots).forEach((slotId) => { next.slots[slotId] = null; });
    Object.keys(next.fields).forEach((fieldId) => { next.fields[fieldId] = null; });
    next.evidence = "";
    next.activeSlotId = Object.keys(next.slots)[0] || null;
    next.revision += 1;
    return next;
  }

  function setHintBankVisible(state, visible) {
    assertEditable(state);
    const next = copy(state);
    next.hintBankVisible = Boolean(visible);
    return next;
  }

  function formatKey(value) {
    if (!value) return "";
    const root = String(value.root || "").replaceAll("#", "♯").replaceAll("b", "♭");
    return root && value.mode ? `${root} ${value.mode}` : root;
  }

  function compactKey(value) {
    const full = formatKey(value);
    const match = /^(.+?) (major|minor)$/.exec(full);
    if (!match) return full;
    return match[2] === "minor" ? match[1].toLowerCase() : match[1];
  }

  function superscriptSeventh(value) {
    return value === "seventh" ? "⁷" : "";
  }

  function formatRomanAnalysis(value) {
    if (!value) return "";
    const analysis = sanitizeRomanAnalysis(value);
    const accidental = analysis.accidental === "#" ? "♯" : analysis.accidental === "b" ? "♭" : "";
    let degree = String(analysis.degree || "I").toUpperCase();
    const quality = analysis.quality || "major";
    if (["minor", "diminished", "half-diminished"].includes(quality)) {
      degree = degree.toLowerCase();
    }
    const qualityMark = quality === "diminished"
      ? "°"
      : quality === "half-diminished"
        ? "ø"
        : quality === "augmented"
          ? "+"
          : "";
    const inversion = analysis.inversion && analysis.inversion !== "root"
      ? analysis.inversion
      : "";
    const suspension = analysis.suspension && analysis.suspension !== "none"
      ? analysis.suspension === "♯3" ? "♯3" : ` ${analysis.suspension}`
      : "";
    const secondary = analysis.secondaryOf ? `/${analysis.secondaryOf}` : "";
    const prefix = analysis.key ? `${compactKey(analysis.key)}: ` : "";
    return `${prefix}${accidental}${degree}${qualityMark}${superscriptSeventh(analysis.extent)}${inversion}${secondary}${suspension}`;
  }

  const JAZZ_FORMULAS = Object.freeze([
    "major", "minor", "sixth", "minor-sixth", "dominant-seventh",
    "major-seventh", "minor-seventh", "dominant-ninth", "major-ninth",
    "minor-ninth", "dominant-eleventh", "dominant-thirteenth",
    "dominant-flat-nine", "dominant-sharp-nine", "dominant-sharp-eleven",
    "thirteenth-flat-nine", "add-nine", "minor-add-nine", "six-add-nine",
    "minor-ninth-major-seventh", "minor-nine-add-six", "dominant-seven-sus-four",
    "suspended-two", "suspended-four", "diminished", "diminished-seventh",
    "half-diminished",
  ]);

  const JAZZ_FORMULA_PARTS = Object.freeze({
    major: { quality: "major", extension: "triad", alteration: "", addition: "" },
    minor: { quality: "minor", extension: "triad", alteration: "", addition: "" },
    sixth: { quality: "major", extension: "6", alteration: "", addition: "" },
    "minor-sixth": { quality: "minor", extension: "6", alteration: "", addition: "" },
    "dominant-seventh": { quality: "dominant", extension: "7", alteration: "", addition: "" },
    "major-seventh": { quality: "major", extension: "maj7", alteration: "", addition: "" },
    "minor-seventh": { quality: "minor", extension: "7", alteration: "", addition: "" },
    "dominant-ninth": { quality: "dominant", extension: "9", alteration: "", addition: "" },
    "major-ninth": { quality: "major", extension: "maj9", alteration: "", addition: "" },
    "minor-ninth": { quality: "minor", extension: "9", alteration: "", addition: "" },
    "dominant-eleventh": { quality: "dominant", extension: "11", alteration: "", addition: "" },
    "dominant-thirteenth": { quality: "dominant", extension: "13", alteration: "", addition: "" },
    "dominant-flat-nine": { quality: "dominant", extension: "7", alteration: "b9", addition: "" },
    "dominant-sharp-nine": { quality: "dominant", extension: "7", alteration: "#9", addition: "" },
    "dominant-sharp-eleven": { quality: "dominant", extension: "7", alteration: "#11", addition: "" },
    "thirteenth-flat-nine": { quality: "dominant", extension: "13", alteration: "b9", addition: "" },
    "add-nine": { quality: "major", extension: "triad", alteration: "", addition: "add9" },
    "minor-add-nine": { quality: "minor", extension: "triad", alteration: "", addition: "add9" },
    "six-add-nine": { quality: "major", extension: "6", alteration: "", addition: "6(add9)" },
    "minor-ninth-major-seventh": { quality: "minor", extension: "9", alteration: "", addition: "maj7" },
    "minor-nine-add-six": { quality: "minor", extension: "9", alteration: "", addition: "add6" },
    "dominant-seven-sus-four": { quality: "dominant", extension: "7", alteration: "", addition: "", suspension: "sus4" },
    "suspended-two": { quality: "suspended", extension: "sus2", alteration: "", addition: "" },
    "suspended-four": { quality: "suspended", extension: "sus4", alteration: "", addition: "" },
    diminished: { quality: "diminished", extension: "triad", alteration: "", addition: "" },
    "diminished-seventh": { quality: "diminished", extension: "7", alteration: "", addition: "" },
    "half-diminished": { quality: "half-diminished", extension: "7", alteration: "b5", addition: "" },
  });

  function jazzFormulaFromParts(value) {
    const quality = value.quality || "major";
    const extension = String(value.extension || "triad");
    const alteration = String(value.alteration || "");
    const addition = String(value.addition || "");
    const suspension = String(value.suspension || "");
    if (quality === "half-diminished") return "half-diminished";
    if (quality === "diminished") return extension === "7" ? "diminished-seventh" : "diminished";
    if (quality === "suspended") return extension === "sus2" ? "suspended-two" : "suspended-four";
    if (quality === "minor") {
      if (extension === "9" && addition === "maj7") return "minor-ninth-major-seventh";
      if (extension === "9" && addition === "add6") return "minor-nine-add-six";
      if (extension === "triad" && addition === "add9") return "minor-add-nine";
      return { "6": "minor-sixth", "7": "minor-seventh", "9": "minor-ninth" }[extension] || "minor";
    }
    if (quality === "dominant") {
      if (extension === "7" && suspension === "sus4") return "dominant-seven-sus-four";
      if (extension === "13" && alteration === "b9") return "thirteenth-flat-nine";
      if (alteration === "b9") return "dominant-flat-nine";
      if (alteration === "#9") return "dominant-sharp-nine";
      if (alteration === "#11") return "dominant-sharp-eleven";
      return { 9: "dominant-ninth", 11: "dominant-eleventh", 13: "dominant-thirteenth" }[extension] || "dominant-seventh";
    }
    if (addition === "6(add9)") return "six-add-nine";
    if (addition === "add9") return "add-nine";
    return { 6: "sixth", maj7: "major-seventh", maj9: "major-ninth" }[extension] || "major";
  }

  function semanticJazzChord(root, formula, bass = "", metadata = {}) {
    const safeFormula = JAZZ_FORMULAS.includes(formula) ? formula : "major";
    const chord = {
      root,
      suspension: "",
      ...copy(JAZZ_FORMULA_PARTS[safeFormula]),
      bass,
      formula: safeFormula,
    };
    if (metadata.displayStyle) chord.displayStyle = metadata.displayStyle;
    return chord;
  }

  function sanitizeJazzChord(value) {
    const next = copy(value || {});
    next.root = String(next.root || "");
    next.bass = String(next.bass || "");
    const formula = JAZZ_FORMULAS.includes(next.formula)
      ? next.formula
      : jazzFormulaFromParts(next);
    return semanticJazzChord(next.root, formula, next.bass, next);
  }

  function formatJazzChord(value) {
    const chord = sanitizeJazzChord(value);
    if (!chord.root) return "";
    const suffix = {
      major: "",
      minor: "m",
      sixth: "6",
      "minor-sixth": "m6",
      "dominant-seventh": "7",
      "major-seventh": "maj7",
      "minor-seventh": "m7",
      "dominant-ninth": "9",
      "major-ninth": "maj9",
      "minor-ninth": "m9",
      "dominant-eleventh": "11",
      "dominant-thirteenth": "13",
      "dominant-flat-nine": "7♭9",
      "dominant-sharp-nine": "7♯9",
      "dominant-sharp-eleven": "7♯11",
      "thirteenth-flat-nine": "13♭9",
      "add-nine": "add9",
      "minor-add-nine": "m(add9)",
      "six-add-nine": "6(add9)",
      "minor-ninth-major-seventh": "m9(maj7)",
      "minor-nine-add-six": "m9(add6)",
      "dominant-seven-sus-four": "7sus4",
      "suspended-two": "sus2",
      "suspended-four": "sus4",
      diminished: "dim",
      "diminished-seventh": "dim7",
      "half-diminished": chord.displayStyle === "parenthetical-flat-five" ? "m7(♭5)" : "m7♭5",
    }[chord.formula];
    return `${chord.root}${suffix}${chord.bass ? `/${chord.bass}` : ""}`;
  }

  function parseJazzChordSymbol(value) {
    const symbol = String(value || "")
      .trim()
      .replaceAll("#", "♯")
      .replaceAll("b", "♭");
    const [main, bass = ""] = symbol.split("/");
    const rootMatch = main.match(/^([A-G](?:♯|♭)?)(.*)$/);
    if (!rootMatch || !/^([A-G](?:♯|♭)?)?$/.test(bass)) return null;
    const [, root, suffix] = rootMatch;
    const formula = {
      "": "major",
      m: "minor",
      6: "sixth",
      m6: "minor-sixth",
      7: "dominant-seventh",
      maj7: "major-seventh",
      m7: "minor-seventh",
      9: "dominant-ninth",
      maj9: "major-ninth",
      m9: "minor-ninth",
      11: "dominant-eleventh",
      13: "dominant-thirteenth",
      "7♭9": "dominant-flat-nine",
      "7♯9": "dominant-sharp-nine",
      "7♯11": "dominant-sharp-eleven",
      "13♭9": "thirteenth-flat-nine",
      add9: "add-nine",
      "m(add9)": "minor-add-nine",
      "6(add9)": "six-add-nine",
      "m9(maj7)": "minor-ninth-major-seventh",
      "m9(add6)": "minor-nine-add-six",
      "7sus4": "dominant-seven-sus-four",
      sus2: "suspended-two",
      sus4: "suspended-four",
      dim: "diminished",
      dim7: "diminished-seventh",
      "m7♭5": "half-diminished",
      "m7(♭5)": "half-diminished",
    }[suffix];
    if (!formula) return null;
    return semanticJazzChord(root, formula, bass, {
      displayStyle: suffix === "m7(♭5)" ? "parenthetical-flat-five" : "",
    });
  }

  function formatValue(value, type) {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (value.label) return value.label;
    if (type === "roman-analysis") {
      const analyses = value.analyses || [value];
      return analyses.map(formatRomanAnalysis).filter(Boolean).join(" / ");
    }
    if (type === "jazz-chord-placement" && value.chord) {
      return formatJazzChord(value.chord);
    }
    if (value.key) return formatKey(value.key);
    return String(value.value || "");
  }

  function normalize(value) {
    return String(value || "")
      .trim()
      .replaceAll("#", "♯")
      .replaceAll("b", "♭")
      .replaceAll("(", "")
      .replaceAll(")", "")
      .replaceAll(/\s+/g, " ")
      .toLocaleLowerCase("en-NZ");
  }

  function acceptedLabels(item) {
    return (item.acceptedAnswers || [])
      .map((answer) => typeof answer === "string" ? answer : answer.label)
      .filter(Boolean);
  }

  function compareItem(item, value, type) {
    if (!value || !formatValue(value, type)) return "unanswered";
    const response = normalize(formatValue(value, type));
    return acceptedLabels(item).some((answer) => normalize(answer) === response)
      ? "matches"
      : "different";
  }

  function comparison(question, state) {
    const interaction = question.interaction;
    const groupedFieldIds = new Set(
      (interaction.unorderedFieldGroups || []).flatMap((group) => group.fieldIds || [])
    );
    const ordinaryFields = (interaction.fields || [])
      .filter((field) => !groupedFieldIds.has(field.id))
      .map((field) => ({
        id: field.id,
        label: field.label,
        response: formatValue(state?.fields?.[field.id], interaction.type),
        model: acceptedLabels(field).join(" or "),
        status: compareItem(field, state?.fields?.[field.id], interaction.type),
      }));
    const groupedFields = (interaction.unorderedFieldGroups || []).map((group) => {
      const responses = group.fieldIds.map((fieldId) =>
        formatValue(state?.fields?.[fieldId], interaction.type)
      );
      const normalizedResponses = responses.filter(Boolean).map(normalize).sort();
      const acceptedSet = (group.acceptedSets || []).find((set) =>
        JSON.stringify(set.map(normalize).sort()) === JSON.stringify(normalizedResponses)
      );
      return {
        id: group.id,
        label: group.label,
        response: responses.filter(Boolean).join(" + "),
        model: (group.acceptedSets?.[0] || []).join(" + "),
        status: responses.some((response) => !response)
          ? "unanswered"
          : acceptedSet
            ? "matches"
            : "different",
      };
    });
    return {
      slots: (interaction.slots || []).map((slot) => ({
        id: slot.id,
        label: slot.label,
        response: formatValue(state?.slots?.[slot.id], interaction.type),
        model: acceptedLabels(slot).join(" or "),
        status: compareItem(slot, state?.slots?.[slot.id], interaction.type),
      })),
      fields: [...ordinaryFields, ...groupedFields],
      evidence: state?.evidence || "",
    };
  }

  function scoreWithResponses(question, state) {
    const score = copy(question.score);
    score.harmonicEvents = (score.harmonicEvents || []).map((event) => {
      if (event.answerRole !== "editable" || !event.answerSlotId) return event;
      return {
        ...event,
        questionLabel: formatValue(state?.slots?.[event.answerSlotId], state?.type),
      };
    });
    return score;
  }

  function setSubmitted(state) {
    if (!state) return null;
    const next = copy(state);
    next.submitted = true;
    next.activeSlotId = null;
    next.revision += 1;
    return next;
  }

  window.CadenceStructuredAnswer = Object.freeze({
    TYPES: Object.freeze([...TYPES]),
    create,
    setSlot,
    setActiveSlot,
    advanceToNextUnanswered,
    setField,
    setEvidence,
    placeToken,
    returnToken,
    tokenInSlot,
    reset,
    setHintBankVisible,
    formatKey,
    formatRomanAnalysis,
    sanitizeJazzChord,
    semanticJazzChord,
    formatJazzChord,
    parseJazzChordSymbol,
    JAZZ_FORMULAS,
    sanitizeRomanValue,
    formatValue,
    comparison,
    scoreWithResponses,
    setSubmitted,
    deterministicShuffle,
  });
})();
