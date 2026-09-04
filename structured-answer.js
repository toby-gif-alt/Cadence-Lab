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
      fields,
      evidence: "",
      bank,
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
    next.slots[slotId] = value ? copy(value) : null;
    next.activeSlotId = slotId;
    next.revision += 1;
    return next;
  }

  function setActiveSlot(state, slotId) {
    if (!state || !Object.hasOwn(state.slots, slotId)) return state;
    const next = copy(state);
    next.activeSlotId = slotId;
    return next;
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
    const accidental = value.accidental === "#" ? "♯" : value.accidental === "b" ? "♭" : "";
    let degree = String(value.degree || "I").toUpperCase();
    const quality = value.quality || "major";
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
    const inversion = value.inversion && value.inversion !== "root"
      ? value.inversion
      : "";
    const suspension = value.suspension && value.suspension !== "none"
      ? value.suspension === "♯3" ? "♯3" : ` ${value.suspension}`
      : "";
    const secondary = value.secondaryOf ? `/${value.secondaryOf}` : "";
    const prefix = value.key ? `${compactKey(value.key)}: ` : "";
    return `${prefix}${accidental}${degree}${qualityMark}${superscriptSeventh(value.extent)}${inversion}${secondary}${suspension}`;
  }

  function formatValue(value, type) {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (value.label) return value.label;
    if (type === "roman-analysis") {
      const analyses = value.analyses || [value];
      return analyses.map(formatRomanAnalysis).filter(Boolean).join(" / ");
    }
    if (value.key) return formatKey(value.key);
    return String(value.value || "");
  }

  function normalize(value) {
    return String(value || "")
      .trim()
      .replaceAll("#", "♯")
      .replaceAll("b", "♭")
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
    return {
      slots: (interaction.slots || []).map((slot) => ({
        id: slot.id,
        label: slot.label,
        response: formatValue(state?.slots?.[slot.id], interaction.type),
        model: acceptedLabels(slot)[0] || "",
        status: compareItem(slot, state?.slots?.[slot.id], interaction.type),
      })),
      fields: (interaction.fields || []).map((field) => ({
        id: field.id,
        label: field.label,
        response: formatValue(state?.fields?.[field.id], interaction.type),
        model: acceptedLabels(field)[0] || "",
        status: compareItem(field, state?.fields?.[field.id], interaction.type),
      })),
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
    setField,
    setEvidence,
    placeToken,
    returnToken,
    tokenInSlot,
    reset,
    formatKey,
    formatRomanAnalysis,
    formatValue,
    comparison,
    scoreWithResponses,
    setSubmitted,
    deterministicShuffle,
  });
})();
