(function () {
  "use strict";

  const renderer = window.CadenceScoreRenderer;
  const keyRelationships = window.CadenceKeyRelationships;
  const SATB_NAMES = ["soprano", "alto", "tenor", "bass"];
  const CATEGORIES = ["analysis", "modulation", "satb", "piano", "jazz", "features"];
  const INTERACTION_TYPES = new Set([
    "roman-analysis",
    "key-modulation",
    "jazz-chord-placement",
    "feature-analysis",
    "contextual-analysis",
    "paper-completion",
  ]);

  function pitchNumber(value) {
    const parsed = renderer.parsePitch(value);
    return (parsed.octave + 1) * 12 + renderer.pitchClass(parsed);
  }

  function sourceLabel(question) {
    if (question.sourceType === "nzqa-reference") {
      return `${question.source.year} ${question.source.question} ${question.source.part}`;
    }
    return question.source?.title || question.id;
  }

  function validateStudentPresentation(question, errors) {
    ["internalTitle", "studentTitle", "studentContext"].forEach((field) => {
      if (!question[field] || typeof question[field] !== "string") {
        errors.push(`${question.id}: missing ${field}`);
      }
    });
    if (!question.score.studentCaption) {
      errors.push(`${question.id}: missing score.studentCaption`);
    }
    if (!Array.isArray(question.hiddenConceptTerms)) {
      errors.push(`${question.id}: hiddenConceptTerms must be an array`);
      return;
    }
    const studentFacingText = [
      question.studentTitle,
      question.studentContext,
      question.score.studentCaption,
      ...Object.values(question.tasks || {}).flat(),
    ].join(" ").toLocaleLowerCase("en-NZ");
    question.hiddenConceptTerms.forEach((term) => {
      if (!term || typeof term !== "string") {
        errors.push(`${question.id}: hiddenConceptTerms contains an invalid value`);
      } else if (studentFacingText.includes(term.toLocaleLowerCase("en-NZ"))) {
        errors.push(
          `${question.id}: student-facing presentation exposes hidden concept term “${term}”`
        );
      }
    });
  }

  function validateInteraction(question, errors) {
    const interaction = question.interaction;
    if (question.score.completion && !interaction) {
      errors.push(`${question.id}: completion score lacks interaction metadata`);
      return;
    }
    if (!interaction) return;
    if (!INTERACTION_TYPES.has(interaction.type)) {
      errors.push(`${question.id}: unsupported interaction type ${interaction.type}`);
      return;
    }
    if (interaction.type === "paper-completion") {
      if (!["satb", "piano"].includes(question.category)) {
        errors.push(`${question.id}: paper completion is only valid for SATB or piano`);
      }
      if (interaction.completionType !== question.category) {
        errors.push(`${question.id}: paper completion type must match its category`);
      }
      if (!question.score.completion) {
        errors.push(`${question.id}: paper completion requires a completion score`);
      }
      if (!interaction.completionRequirements ||
          typeof interaction.completionRequirements !== "object") {
        errors.push(`${question.id}: paper completion lacks semantic requirements`);
      }
      if (!Array.isArray(interaction.selfCheck) || !interaction.selfCheck.length ||
          interaction.selfCheck.some((item) => typeof item !== "string" || !item.trim())) {
        errors.push(`${question.id}: paper completion lacks a question-aware self-check`);
      }
      if (!["portrait", "landscape"].includes(interaction.printOrientation)) {
        errors.push(`${question.id}: paper completion has an invalid print orientation`);
      }
      if (interaction.editableRegions) {
        errors.push(`${question.id}: paper completion must not declare browser-editable regions`);
      }
      return;
    }
    const expectedType = {
      analysis: "roman-analysis",
      modulation: "key-modulation",
      jazz: "jazz-chord-placement",
      features: "feature-analysis",
    }[question.category];
    if (interaction.type !== expectedType && interaction.type !== "contextual-analysis") {
      errors.push(`${question.id}: ${question.category} requires ${expectedType}`);
    }
    const slots = interaction.slots || [];
    const fields = interaction.fields || [];
    const identifiers = [...slots, ...fields].map((item) => item.id);
    if (new Set(identifiers).size !== identifiers.length) {
      errors.push(`${question.id}: interaction answer identifiers must be one-to-one`);
    }
    [...slots, ...fields].forEach((item) => {
      if (!item.id || !item.label || !Array.isArray(item.acceptedAnswers) ||
          !item.acceptedAnswers.length) {
        errors.push(`${question.id}: structured response item lacks an id, label or acceptedAnswers`);
      }
    });
    if (interaction.type === "roman-analysis") {
      slots.forEach((slot) => {
        if (typeof slot.allowDualAnalysis !== "boolean") {
          errors.push(`${question.id}: Roman slot ${slot.id} lacks an explicit allowDualAnalysis flag`);
        }
      });
    }
    fields.filter((field) => field.kind === "classification").forEach((field) => {
      if (!Array.isArray(field.choices) || !field.choices.length) {
        errors.push(`${question.id}: classification field ${field.id} lacks field-specific choices`);
        return;
      }
      const choices = new Set(field.choices);
      if (field.acceptedAnswers.some((answer) => !choices.has(answer.label))) {
        errors.push(`${question.id}: classification field ${field.id} omits an accepted answer from its choices`);
      }
    });
    (interaction.unorderedFieldGroups || []).forEach((group) => {
      const fieldIds = group.fieldIds || [];
      const acceptedSets = group.acceptedSets || [];
      if (!group.id || !group.label || fieldIds.length < 2 ||
          new Set(fieldIds).size !== fieldIds.length ||
          fieldIds.some((fieldId) => !fields.some((field) => field.id === fieldId)) ||
          !acceptedSets.length || acceptedSets.some((set) => set.length !== fieldIds.length)) {
        errors.push(`${question.id}: unordered response group ${group.id || "unknown"} is invalid`);
      }
    });
    if (interaction.type === "jazz-chord-placement") {
      const bankLabels = (interaction.bank || []).map((token) => token.label);
      const requiredLabels = slots.map((slot) => slot.acceptedAnswers[0]?.label);
      const count = (items, value) => items.filter((item) => item === value).length;
      [...new Set(requiredLabels)].forEach((label) => {
        if (count(bankLabels, label) !== count(requiredLabels, label)) {
          errors.push(`${question.id}: chord bank multiplicity for ${label} does not match editable answers`);
        }
      });
      const accepted = new Set(slots.flatMap((slot) =>
        slot.acceptedAnswers.map((answer) => answer.label)
      ));
      const distractors = bankLabels.filter((label) => !requiredLabels.includes(label));
      if (!distractors.length || distractors.some((label) => accepted.has(label))) {
        errors.push(`${question.id}: chord bank needs controlled, non-answer distractors`);
      }
    }
  }

  function validateHarmonicAnswerRoles(question, errors) {
    const harmonicEvents = question.score.harmonicEvents || [];
    harmonicEvents.forEach((event, index) => {
      if (!["supplied", "editable", "none"].includes(event.answerRole)) {
        errors.push(`${question.id}: harmonic event ${index + 1} lacks an explicit answerRole`);
      }
      if (event.answerRole === "supplied" && !event.questionLabel) {
        errors.push(`${question.id}: supplied harmonic event ${index + 1} lacks a visible label`);
      }
      if (event.answerRole === "editable" && !event.answerSlotId) {
        errors.push(`${question.id}: editable harmonic event ${index + 1} lacks an answerSlotId`);
      }
      if (event.answerRole !== "editable" && event.answerSlotId) {
        errors.push(`${question.id}: non-editable harmonic event ${index + 1} has an answerSlotId`);
      }
    });
    const eventSlotIds = harmonicEvents
      .filter((event) => event.answerRole === "editable")
      .map((event) => event.answerSlotId);
    const interactionSlotIds = ["roman-analysis", "jazz-chord-placement"].includes(
      question.interaction?.type
    )
      ? question.interaction.slots.map((slot) => slot.id)
      : [];
    if (JSON.stringify(eventSlotIds) !== JSON.stringify(interactionSlotIds)) {
      errors.push(`${question.id}: editable harmonic events and response slots are not one-to-one`);
    }
  }

  function normalizeKeyContextText(value) {
    return String(value || "")
      .replaceAll("#", "♯")
      .replace(/[‐‑–—-]/g, " ")
      .replaceAll(/\s+/g, " ")
      .trim()
      .toLocaleLowerCase("en-NZ");
  }

  function validateKeySemantics(question, harmonicEvents, errors) {
    const authoredKeyLabels = [
      question.homeKey,
      ...(question.keyRegions || []).map((region) => region.localKey),
      ...(question.sourceSpec?.keyCentres || []),
      ...harmonicEvents.map((event) => event.localKey),
    ].filter(Boolean);
    authoredKeyLabels.forEach((label) => {
      try {
        const formatted = keyRelationships.formatKey(label);
        if (formatted !== label) {
          errors.push(`${question.id}: key spelling ${label} must be stored semantically as ${formatted}`);
        }
      } catch (error) {
        errors.push(`${question.id}: ${error.message}`);
      }
    });

    if (question.category !== "modulation") return;
    if (!question.homeKey || !Array.isArray(question.keyRegions) ||
        !question.keyRegions.length) {
      errors.push(`${question.id}: modulation task lacks semantic homeKey/keyRegions data`);
      return;
    }
    const homeKey = keyRelationships.formatKey(question.homeKey);
    const promptNamesHome = normalizeKeyContextText(question.studentContext)
      .includes(normalizeKeyContextText(homeKey));
    const homeKeyIsAsked = (question.interaction.fields || []).some(
      (field) => field.kind === "home-key"
    );
    if (!promptNamesHome && !homeKeyIsAsked) {
      errors.push(
        `${question.id}: relationship task marks against ${homeKey} without supplying or asking for that home key`
      );
    }
    if (question.interaction.homeKey !== homeKey) {
      errors.push(`${question.id}: interaction home key does not match ${homeKey}`);
    }

    question.keyRegions.forEach((region) => {
      const localKey = keyRelationships.formatKey(region.localKey);
      const relationship = keyRelationships.relationshipBetween(homeKey, localKey);
      if (!relationship.acceptedLabels.length) {
        errors.push(`${question.id}: ${homeKey} → ${localKey} is not a supported diatonic key relationship`);
        return;
      }
      if (!relationship.acceptedLabels.includes(region.modelRelationship)) {
        errors.push(
          `${question.id}: ${region.modelRelationship} is invalid for ${homeKey} → ${localKey}`
        );
      }
      const keyField = question.interaction.fields.find(
        (field) => field.id === `${region.section.toLowerCase()}-key`
      );
      const relationshipField = question.interaction.fields.find(
        (field) => field.id === `${region.section.toLowerCase()}-relationship`
      );
      if (!keyField || !relationshipField) {
        errors.push(`${question.id}: region ${region.section} lacks key/relationship response fields`);
        return;
      }
      if (JSON.stringify(keyField.acceptedAnswers.map((answer) => answer.label)) !==
          JSON.stringify([localKey])) {
        errors.push(`${question.id}: region ${region.section} key answer must preserve ${localKey}`);
      }
      const acceptedLabels = relationshipField.acceptedAnswers.map(
        (answer) => answer.label
      );
      if (acceptedLabels.some((label) => !relationship.acceptedLabels.includes(label))) {
        errors.push(`${question.id}: region ${region.section} accepts an invalid relationship to ${homeKey}`);
      }
      const visibleChoices = relationshipField.choices || [];
      const visibleCorrectChoices = visibleChoices.filter((label) =>
        relationship.acceptedLabels.includes(label)
      );
      if (visibleChoices.length < 4 || visibleChoices.length > 6) {
        errors.push(`${question.id}: region ${region.section} relationship choices must contain 4–6 options`);
      }
      if (new Set(visibleChoices).size !== visibleChoices.length) {
        errors.push(`${question.id}: region ${region.section} relationship choices contain duplicates`);
      }
      if (!visibleChoices.includes(region.modelRelationship) ||
          visibleCorrectChoices.length !== 1 ||
          visibleCorrectChoices[0] !== region.modelRelationship) {
        errors.push(`${question.id}: region ${region.section} must show exactly one preferred relationship answer`);
      }
      if (visibleChoices.some((label) =>
        /^(?:I|II|III|IV|V|VI|VII|i|ii|iii|iv|v|vi|vii)$/.test(label) ||
        /\/[ ]*(?:I|II|III|IV|V|VI|VII|i|ii|iii|iv|v|vi|vii)$/.test(label)
      )) {
        errors.push(`${question.id}: region ${region.section} mixes Roman degrees into learner relationship choices`);
      }
      if (region.relationshipChoices &&
          JSON.stringify(visibleChoices) !== JSON.stringify(region.relationshipChoices)) {
        errors.push(`${question.id}: region ${region.section} does not preserve its authored relationship choices`);
      }
      if (relationshipField.homeKey !== homeKey ||
          relationshipField.localKey !== localKey ||
          relationshipField.modelRelationship !== region.modelRelationship ||
          relationshipField.semanticRelationship?.canonical !== relationship.canonical ||
          relationshipField.semanticRelationship?.degree !== relationship.degree) {
        errors.push(`${question.id}: region ${region.section} semantic relationship metadata is inconsistent`);
      }
    });
  }

  function validateMeasureDurations(question, errors) {
    let activeTime = question.score.timeSignature || "4/4";
    question.score.measures.forEach((measure, measureIndex) => {
      if (measure.timeSignature) activeTime = measure.timeSignature;
      const match = /^(\d+)\/(\d+)$/.exec(activeTime);
      if (!match) {
        errors.push(`${question.id}: invalid time signature ${activeTime}`);
        return;
      }
      const expected = measure.expectedBeats || Number(match[1]);
      const denominator = Number(match[2]);
      if (measure.voices) {
        [
          ["voices", measure.voices, true],
          ["questionVoices", measure.questionVoices, false],
        ].forEach(([sourceName, streams, requireAll]) => {
          if (!streams) return;
          SATB_NAMES.forEach((voiceName) => {
            const stream = streams[voiceName];
            if (!stream) {
              if (requireAll) {
                errors.push(
                  `${question.id}: measure ${measureIndex + 1} ${sourceName} lacks ${voiceName}`
                );
              }
              return;
            }
            const actual = stream.reduce(
              (sum, event) =>
                sum + renderer.durationInBeats(event.duration || "q", denominator),
              0
            );
            if (Math.abs(actual - expected) > 0.001) {
              errors.push(
                `${question.id}: measure ${measureIndex + 1} ${sourceName}.${voiceName} contains ${actual} beats in ${activeTime}; expected ${expected}`
              );
            }
          });
        });
        return;
      }
      const actual = measure.events.reduce(
        (sum, event) =>
          sum + renderer.durationInBeats(event.duration || "q", denominator),
        0
      );
      if (Math.abs(actual - expected) > 0.001) {
        errors.push(
          `${question.id}: measure ${measureIndex + 1} contains ${actual} beats in ${activeTime}`
        );
      }
    });
  }

  function validateChordEvents(question, normalized, harmonicEvents, errors) {
    const noteEvents = new Map(
      normalized.measures
        .flatMap((measure) => measure.events)
        .map((event) => [event._index, event])
    );
    harmonicEvents.forEach((harmonicEvent) => {
      if (!harmonicEvent.chordSymbol || harmonicEvent.validateChord === false) {
        return;
      }
      const noteEvent = noteEvents.get(harmonicEvent._index);
      if (harmonicEvent.validationPitches) {
        const displayedPitches = SATB_NAMES.flatMap((voiceName) => {
          const value = noteEvent?.voices?.[voiceName];
          return value == null ? [] : Array.isArray(value) ? value : [value];
        }).concat(noteEvent?.treble || [], noteEvent?.bass || []);
        const displayedPitchClasses = new Set(
          displayedPitches.map((pitch) =>
            renderer.pitchClass(renderer.parsePitch(pitch))
          )
        );
        const inventedValidationPitch = harmonicEvent.validationPitches.find(
          (pitch) =>
            !displayedPitchClasses.has(
              renderer.pitchClass(renderer.parsePitch(pitch))
            )
        );
        if (inventedValidationPitch) {
          errors.push(
            `${question.id}: validation pitch ${inventedValidationPitch} is not displayed at measure ${harmonicEvent.measure}, beat ${harmonicEvent.beat}`
          );
        }
        if (harmonicEvent.bassPitch) {
          const displayedBass = noteEvent?.voices?.bass ?? noteEvent?.bass?.[0];
          if (
            !displayedBass ||
            renderer.pitchClass(renderer.parsePitch(displayedBass)) !==
              renderer.pitchClass(renderer.parsePitch(harmonicEvent.bassPitch))
          ) {
            errors.push(
              `${question.id}: validation bass ${harmonicEvent.bassPitch} is not displayed at measure ${harmonicEvent.measure}, beat ${harmonicEvent.beat}`
            );
          }
        }
      }
      const validationEvent = harmonicEvent.validationPitches
        ? {
            treble: harmonicEvent.validationPitches,
            bass: harmonicEvent.bassPitch ? [harmonicEvent.bassPitch] : [],
            omittedChordIntervals: harmonicEvent.omittedChordIntervals,
          }
        : noteEvent;
      const result = renderer.validateChordIdentification(
        validationEvent,
        harmonicEvent.chordSymbol
      );
      if (!result.valid) {
        errors.push(
          `${question.id}: displayed pitches at measure ${harmonicEvent.measure}, beat ${harmonicEvent.beat ?? "?"} do not fully support ${harmonicEvent.chordSymbol} (pitch classes: ${result.actualPitchClasses.join(", ")})`
        );
      }
      if (harmonicEvent.resolution?.chordSymbol) {
        const resolutionEvent = noteEvents.get(harmonicEvent._resolutionIndex);
        const resolutionResult = renderer.validateChordIdentification(
          resolutionEvent,
          harmonicEvent.resolution.chordSymbol
        );
        if (!resolutionResult.valid) {
          errors.push(
            `${question.id}: displayed pitches at measure ${harmonicEvent.measure}, beat ${harmonicEvent.resolution.beat} do not fully support the internal ${harmonicEvent.resolution.chordSymbol} resolution (pitch classes: ${resolutionResult.actualPitchClasses.join(", ")})`
          );
        }
      }
    });
  }

  function validateRomanRoots(question, harmonicEvents, errors) {
    const majorScale = [0, 2, 4, 5, 7, 9, 11];
    const minorScale = [0, 2, 3, 5, 7, 8, 11];
    const degrees = { i: 0, ii: 1, iii: 2, iv: 3, v: 4, vi: 5, vii: 6 };
    harmonicEvents.forEach((event) => {
      if (!event.localKey || !event.romanNumeral || !event.chordSymbol) return;
      if (event.romanNumeral.includes("/")) return;
      const keyMatch = /^([A-Ga-g])([#b♯♭]?)[ ]+(major|minor)$/i.exec(
        event.localKey
      );
      const romanMatch = /^([#b♯♭]?)([ivIV]+)/.exec(event.romanNumeral);
      if (!keyMatch || !romanMatch) return;
      const tonic = renderer.pitchClass(
        renderer.parsePitch(`${keyMatch[1]}${keyMatch[2]}4`)
      );
      const degree = degrees[romanMatch[2].toLowerCase()];
      if (degree == null) return;
      const alteration = ["#", "♯"].includes(romanMatch[1])
        ? 1
        : ["b", "♭"].includes(romanMatch[1])
          ? -1
          : 0;
      const scale = keyMatch[3].toLowerCase() === "minor" ? minorScale : majorScale;
      const expectedRoot = (tonic + scale[degree] + alteration + 12) % 12;
      const actualRoot = renderer.parseChordSymbol(event.chordSymbol).rootPitchClass;
      if (expectedRoot !== actualRoot) {
        errors.push(
          `${question.id}: ${event.romanNumeral} in ${event.localKey} conflicts with ${event.chordSymbol}`
        );
      }
    });
  }

  function chordPitchClasses(symbol) {
    const parsedChord = renderer.parseChordSymbol(symbol);
    return new Set(
      parsedChord.intervals.map(
        (interval) => (parsedChord.rootPitchClass + interval) % 12
      )
    );
  }

  function isStep(first, second) {
    const distance = Math.abs(pitchNumber(second) - pitchNumber(first));
    return distance === 1 || distance === 2;
  }

  function melodicContext(question, normalized, note) {
    const measure = normalized.measures[note.measure - 1];
    const targetEvent = measure?.events[note.event];
    if (!measure || !targetEvent) {
      return { manual: "the referenced event does not exist" };
    }
    if (measure.voiceStreams) {
      if (!note.voice || !SATB_NAMES.includes(note.voice)) {
        return {
          manual:
            "independent SATB data needs an explicit voice before melodic classification can be checked",
        };
      }
      const stream = measure.voiceStreams[note.voice];
      const index = stream.findIndex(
        (event) =>
          event._anchorIndex === targetEvent._index &&
          event.pitch === note.pitch
      );
      if (index < 0) {
        return { manual: `${note.pitch} is not an onset in ${note.voice}` };
      }
      const previous = stream[index - 1];
      const current = stream[index];
      const next = stream[index + 1];
      if (
        !previous?.pitch || previous.rest ||
        !current?.pitch || current.rest ||
        !next?.pitch || next.rest
      ) {
        return { manual: "the voice lacks pitched notes on both sides" };
      }
      return {
        previousPitch: previous.pitch,
        currentPitch: current.pitch,
        nextPitch: next.pitch,
        beat: current._beat,
        timeSignature: measure.effectiveTimeSignature,
      };
    }

    if (!note.staff || !["treble", "bass"].includes(note.staff)) {
      return {
        manual:
          "the score does not identify which staff carries the melodic line",
      };
    }
    const events = measure.events;
    const previous = events[note.event - 1];
    const next = events[note.event + 1];
    const previousPitches = previous?.[note.staff] || [];
    const currentPitches = targetEvent[note.staff] || [];
    const nextPitches = next?.[note.staff] || [];
    if (
      previousPitches.length !== 1 ||
      currentPitches.length !== 1 ||
      nextPitches.length !== 1
    ) {
      return {
        manual:
          "adjacent events do not define one unambiguous melodic pitch on the selected staff",
      };
    }
    if (currentPitches[0] !== note.pitch) {
      return { manual: `${note.pitch} is not the selected melodic pitch` };
    }
    return {
      previousPitch: previousPitches[0],
      currentPitch: currentPitches[0],
      nextPitch: nextPitches[0],
      beat: targetEvent._beat,
      timeSignature: measure.effectiveTimeSignature,
    };
  }

  function isMetricAccent(beat, timeSignature) {
    if (!timeSignature || !Number.isFinite(beat)) return null;
    const roundedBeat = Math.round(beat);
    if (Math.abs(beat - roundedBeat) > 0.001) return false;
    if (timeSignature.numerator >= 6 && timeSignature.numerator % 3 === 0) {
      return [1, 4, 7, 10].includes(roundedBeat);
    }
    if (timeSignature.numerator === 4) return [1, 3].includes(roundedBeat);
    return roundedBeat === 1;
  }

  function validateNonHarmonicContext(note, context) {
    const type = String(note.type || "").toLowerCase();
    const chordTones = chordPitchClasses(note.chordSymbol);
    const previousChordTone = chordTones.has(
      renderer.pitchClass(renderer.parsePitch(context.previousPitch))
    );
    const nextChordTone = chordTones.has(
      renderer.pitchClass(renderer.parsePitch(context.nextPitch))
    );
    const approachIsStep = isStep(context.previousPitch, context.currentPitch);
    const departureIsStep = isStep(context.currentPitch, context.nextPitch);
    const approach = pitchNumber(context.currentPitch) -
      pitchNumber(context.previousPitch);
    const departure = pitchNumber(context.nextPitch) -
      pitchNumber(context.currentPitch);
    const sameDirection = Math.sign(approach) === Math.sign(departure);
    const returnsToSamePitch =
      pitchNumber(context.previousPitch) === pitchNumber(context.nextPitch);

    if (type.includes("accented passing")) {
      const metricAccent = isMetricAccent(context.beat, context.timeSignature);
      if (metricAccent == null) {
        return { manual: "explicit metrical placement is unavailable" };
      }
      return {
        valid:
          approachIsStep && departureIsStep && previousChordTone &&
          nextChordTone && !returnsToSamePitch && sameDirection && metricAccent,
        expectation:
          "an accented passing note approached and left by step in one direction between different chord tones on an accented beat",
      };
    }
    if (type.includes("passing")) {
      return {
        valid:
          approachIsStep && departureIsStep && previousChordTone &&
          nextChordTone && !returnsToSamePitch && sameDirection,
        expectation:
          "a passing note approached and left by step in one direction between different chord tones",
      };
    }
    if (type.includes("auxiliary") || type.includes("neighbour") ||
        type.includes("neighbor")) {
      return {
        valid:
          approachIsStep && departureIsStep && previousChordTone &&
          nextChordTone && returnsToSamePitch,
        expectation:
          "an auxiliary or neighbour note that leaves a chord tone by step and returns to the same chord tone",
      };
    }
    if (type.includes("appoggiatura")) {
      return {
        valid:
          Math.abs(approach) > 2 && departureIsStep && nextChordTone,
        expectation:
          "an appoggiatura approached by leap and resolved by step to a chord tone",
      };
    }
    if (type.includes("suspension")) {
      if (!note.preparedChordSymbol) {
        return {
          manual:
            "suspension validation needs preparedChordSymbol for the preceding harmony",
        };
      }
      const preparedTones = chordPitchClasses(note.preparedChordSymbol);
      const preparedAsChordTone = preparedTones.has(
        renderer.pitchClass(renderer.parsePitch(context.currentPitch))
      );
      return {
        valid:
          preparedAsChordTone &&
          pitchNumber(context.previousPitch) === pitchNumber(context.currentPitch) &&
          departureIsStep && nextChordTone && departure < 0,
        expectation:
          "a prepared chord tone held or repeated into a new harmony and resolved down by step",
      };
    }
    return { manual: `unsupported non-harmonic-note type ${note.type}` };
  }

  function validateNonHarmonicNotes(
    question,
    normalized,
    errors,
    reviewWarnings
  ) {
    (question.score.nonHarmonicNotes || []).forEach((note) => {
      const activeChordPitchClasses = chordPitchClasses(note.chordSymbol);
      const notePitchClass = renderer.pitchClass(renderer.parsePitch(note.pitch));
      if (activeChordPitchClasses.has(notePitchClass)) {
        errors.push(
          `${question.id}: ${note.pitch} is labelled ${note.type} but belongs to ${note.chordSymbol}`
        );
        return;
      }
      const context = melodicContext(question, normalized, note);
      if (context.manual) {
        reviewWarnings.push({
          questionId: question.id,
          category: question.category,
          code: "nonharmonic-context-manual-review",
          message: `Manual review: ${note.pitch} labelled ${note.type} — ${context.manual}.`,
        });
        return;
      }
      const classification = validateNonHarmonicContext(note, context);
      if (classification.manual) {
        reviewWarnings.push({
          questionId: question.id,
          category: question.category,
          code: "nonharmonic-context-manual-review",
          message: `Manual review: ${note.pitch} labelled ${note.type} — ${classification.manual}.`,
        });
      } else if (!classification.valid) {
        errors.push(
          `${question.id}: ${context.previousPitch}–${context.currentPitch}–${context.nextPitch} does not support ${note.type}; expected ${classification.expectation}`
        );
      }
    });
  }

  function validateSatb(question, normalized, errors) {
    if (question.category !== "satb") return;
    normalized.measures.flatMap((measure) => measure.events).forEach(
      (event, eventIndex) => {
        if (!event.voices) {
          errors.push(`${question.id}: SATB event ${eventIndex + 1} lacks named voices`);
          return;
        }
        const values = SATB_NAMES.map((name) => event.voices[name]);
        if (event._independentSatb && values.some((value) => value == null)) {
          return;
        }
        if (values.some((value) => typeof value !== "string")) {
          errors.push(`${question.id}: SATB event ${eventIndex + 1} is not four-part`);
          return;
        }
        const [soprano, alto, tenor, bass] = values.map(pitchNumber);
        if (!(soprano >= alto && alto > tenor && tenor >= bass)) {
          errors.push(`${question.id}: voice crossing at SATB event ${eventIndex + 1}`);
        }
      }
    );
  }

  function reviewTexture(question, normalized, harmonicEvents) {
    if (
      question.sourceType !== "original-practice" ||
      !["analysis", "jazz"].includes(question.category)
    ) {
      return null;
    }

    const events = normalized.measures.flatMap((measure) => measure.events);
    const harmonicIndices = new Set(harmonicEvents.map((event) => event._index));
    const anchorEvents = events.filter((event) => harmonicIndices.has(event._index));
    const allAnchorsAreBlockChords =
      anchorEvents.length > 0 &&
      anchorEvents.every((event) => {
        const namedVoiceCount = event.voices
          ? SATB_NAMES.filter((name) => event.voices[name]).length
          : 0;
        return namedVoiceCount >= 3 ||
          ((event.treble || []).length >= 2 && (event.bass || []).length >= 1);
      });
    const oneDurationOnly =
      new Set(events.map((event) => event.duration || "q")).size === 1;
    const noteAndHarmonyCountsMatch = events.length === harmonicEvents.length;
    const hasRests = events.some(
      (event) =>
        event.trebleRest ||
        event.bassRest ||
        event.rest ||
        (event.voiceRests || []).length
    );
    const hasSubdivision = events.some((event) =>
      ["8", "8d", "16"].includes(event.duration)
    );
    const hasTies = (question.score.ties || []).length > 0;
    const hasIndependentMotion = events.some(
      (event) =>
        !harmonicIndices.has(event._index) &&
        ((event.treble || []).length ||
          (event.bass || []).length ||
          event.voices)
    );
    const noSurfaceDetail =
      !hasRests && !hasSubdivision && !hasTies && !hasIndependentMotion;

    if (
      allAnchorsAreBlockChords &&
      oneDurationOnly &&
      noteAndHarmonyCountsMatch &&
      noSurfaceDetail
    ) {
      return {
        questionId: question.id,
        category: question.category,
        code: "worksheet-like-texture",
        message:
          "Manual review: the original analysis/jazz score is only equal-duration simultaneous block chords, with no independent rhythmic or melodic surface.",
      };
    }
    return null;
  }

  function validateSourceFidelity(
    question,
    normalized,
    harmonicEvents,
    sourceFidelityErrors
  ) {
    if (!["nzqa-reference", "practice-assessment-reference"].includes(question.sourceType)) return;
    const spec = question.sourceSpec;
    if (!spec || typeof spec !== "object") {
      sourceFidelityErrors.push(`${question.id}: missing expected-source specification`);
      return;
    }
    if (spec.transcriptionMode !== "exact") {
      sourceFidelityErrors.push(
        `${question.id}: reference transcriptionMode must be exact`
      );
    }
    const approximationLanguage =
      /\b(?:representative|selected regions?|simplified|reduced|adapted|approximation)\b/i;
    const referenceDescription = JSON.stringify({
      source: question.source,
      sourceSpec: spec,
      title: question.title,
      context: question.context,
      caption: question.score.caption,
    });
    if (approximationLanguage.test(referenceDescription)) {
      sourceFidelityErrors.push(
        `${question.id}: an exact reference cannot be described as representative, selected, simplified, reduced, adapted or an approximation`
      );
    }
    [["year", question.source.year], ["provider", question.source.provider],
      ["question", question.source.question], ["part", question.source.part],
      ["bars", question.source.bars]].forEach(([field, actual]) => {
      if (spec[field] !== undefined && spec[field] !== actual) {
        sourceFidelityErrors.push(`${question.id}: source ${field} mismatch; expected ${JSON.stringify(spec[field])}, found ${JSON.stringify(actual)}`);
      }
    });

    const compareList = (field, actual) => {
      if (!Array.isArray(spec[field])) return;
      if (JSON.stringify(actual) !== JSON.stringify(spec[field])) {
        sourceFidelityErrors.push(
          `${question.id}: source ${field} mismatch; expected ${JSON.stringify(spec[field])}, found ${JSON.stringify(actual)}`
        );
      }
    };

    if (!spec.printedBars || spec.printedBars !== question.source.bars) {
      sourceFidelityErrors.push(
        `${question.id}: printedBars must exactly match the source bar range`
      );
    }
    if (!Number.isInteger(spec.printedMeasureCount)) {
      sourceFidelityErrors.push(`${question.id}: exact reference lacks printedMeasureCount`);
    } else if (question.score.measures.length !== spec.printedMeasureCount) {
      sourceFidelityErrors.push(
        `${question.id}: printedMeasureCount mismatch; expected ${spec.printedMeasureCount}, found ${question.score.measures.length}`
      );
    }
    const numberedRange = /^(\d+)\s*[–-]\s*(\d+)$/.exec(spec.printedBars || "");
    if (numberedRange && Number.isInteger(spec.printedMeasureCount)) {
      const [, first, last] = numberedRange.map(Number);
      const expectedPrintedCount = last - first + 1 +
        (spec.pickupMeasureCount || 0) + (spec.extraPartialMeasureCount || 0);
      if (last < first || expectedPrintedCount !== spec.printedMeasureCount) {
        sourceFidelityErrors.push(
          `${question.id}: printed bar range and explicit pickup/partial metadata do not account for ${spec.printedMeasureCount} displayed measures`
        );
      }
    }
    if (!spec.staffLayout || spec.staffLayout !== question.score.layout) {
      sourceFidelityErrors.push(
        `${question.id}: staffLayout mismatch; expected ${spec.staffLayout || "an explicit layout"}, found ${question.score.layout}`
      );
    }

    const durationSignature = (events) =>
      (events || []).map((event) => event.duration || "q").join(" ");
    if (spec.staffLayout === "satb") {
      compareList("voiceNames", SATB_NAMES);
      if (!Array.isArray(spec.voiceNames) ||
          !Array.isArray(spec.perMeasureVoiceEventCounts) ||
          !Array.isArray(spec.measureRhythmSignatures)) {
        sourceFidelityErrors.push(
          `${question.id}: exact SATB reference lacks source-derived voice/event/rhythm signatures`
        );
      }
      compareList(
        "perMeasureVoiceEventCounts",
        question.score.measures.map((measure) => Object.fromEntries(
          SATB_NAMES.map((voiceName) => [voiceName, (measure.voices?.[voiceName] || []).length])
        ))
      );
      compareList(
        "measureRhythmSignatures",
        question.score.measures.map((measure) => Object.fromEntries(
          SATB_NAMES.map((voiceName) => [
            voiceName,
            durationSignature(measure.voices?.[voiceName]),
          ])
        ))
      );
      compareList(
        "questionVoiceEventCounts",
        question.score.measures.map((measure) => Object.fromEntries(
          SATB_NAMES.map((voiceName) => [
            voiceName,
            (measure.questionVoices?.[voiceName] || []).length,
          ])
        ))
      );
    } else {
      if (!Array.isArray(spec.perMeasureEventCounts) ||
          !Array.isArray(spec.measureRhythmSignatures)) {
        sourceFidelityErrors.push(
          `${question.id}: exact ${spec.staffLayout || "staff"} reference lacks source-derived event/rhythm signatures`
        );
      }
      compareList(
        "perMeasureEventCounts",
        question.score.measures.map((measure) => (measure.events || []).length)
      );
      compareList(
        "measureRhythmSignatures",
        question.score.measures.map((measure) => durationSignature(measure.events))
      );
    }

    compareList(
      "chordSymbols",
      harmonicEvents
        .map((event) =>
          question.category === "jazz"
            ? event.modelLabel || event.chordSymbol
            : event.chordSymbol
        )
        .filter(Boolean)
    );
    compareList(
      "romanNumerals",
      harmonicEvents.map((event) => event.romanNumeral).filter(Boolean)
    );
    compareList(
      "suppliedLabels",
      harmonicEvents.map((event) => event.questionLabel).filter(Boolean)
    );
    compareList(
      "sections",
      (question.score.brackets || []).map((section) => section.label)
    );
    compareList(
      "noteAnnotationLabels",
      (question.score.noteAnnotations || []).map(
        (annotation) => annotation.label
      )
    );
    compareList(
      "noteAnnotations",
      (question.score.noteAnnotations || []).map((annotation) => ({
        measure: annotation.measure,
        beat: annotation.beat,
        staff: annotation.staff,
        pitch: annotation.pitch,
        label: annotation.label,
      }))
    );
    compareList(
      "sectionRanges",
      (question.score.brackets || []).map((section) => ({
        label: section.label,
        key: section.key,
        start: section.start,
        end: section.end,
      }))
    );
    compareList(
      "harmonicSpans",
      harmonicEvents
        .filter((event) => event.resolution)
        .map((event) => ({
          measure: event.measure,
          beat: event.beat,
          label: event.questionLabel,
          chordSymbol: event.chordSymbol,
          resolutionBeat: event.resolution.beat,
          resolutionChordSymbol: event.resolution.chordSymbol,
        }))
    );

    const eventKeyCentres = [
      ...new Set(harmonicEvents.map((event) => event.localKey).filter(Boolean)),
    ];
    const bracketKeyCentres = (question.score.brackets || [])
      .map((section) => section.key)
      .filter(Boolean);
    compareList(
      "keyCentres",
      eventKeyCentres.length
        ? eventKeyCentres
        : bracketKeyCentres.length
          ? bracketKeyCentres
          : question.score.sourceKeyCentres || []
    );
    compareList(
      "keyRelationships",
      (question.keyRegions || []).map((region) => ({
        section: region.section,
        homeKey: question.homeKey,
        localKey: region.localKey,
        acceptedLabels: region.acceptedRelationshipLabels || [],
      }))
    );

    if (
      Number.isInteger(spec.analysisPositions) &&
      harmonicEvents.length !== spec.analysisPositions
    ) {
      sourceFidelityErrors.push(
        `${question.id}: source analysisPositions mismatch; expected ${spec.analysisPositions}, found ${harmonicEvents.length}`
      );
    }
    if (Number.isInteger(spec.answerPositions)) {
      const answerPositions = harmonicEvents.filter(
        (event) => event.answerRole === "editable"
      ).length;
      if (answerPositions !== spec.answerPositions) {
        sourceFidelityErrors.push(
          `${question.id}: source answerPositions mismatch; expected ${spec.answerPositions}, found ${answerPositions}`
        );
      }
    }
    if (
      Number.isInteger(spec.expectedChordCount) &&
      harmonicEvents.length &&
      harmonicEvents.length !== spec.expectedChordCount
    ) {
      sourceFidelityErrors.push(
        `${question.id}: source expectedChordCount mismatch; expected ${spec.expectedChordCount}, found ${harmonicEvents.length}`
      );
    }
    if (Number.isInteger(spec.pivotCount)) {
      const pivotDestinations = new Set(
        harmonicEvents.flatMap((event) => {
          const label = String(event.romanNumeral || event.modelLabel || "");
          const destination = /\/\s*([^:/]+):/.exec(label)?.[1]?.trim();
          return destination ? [destination] : [];
        })
      );
      const pivotCount = pivotDestinations.size;
      if (pivotCount !== spec.pivotCount) {
        sourceFidelityErrors.push(
          `${question.id}: source pivotCount mismatch; expected ${spec.pivotCount}, found ${pivotCount}`
        );
      }
    }
    if (spec.expectedCompletionType &&
        question.interaction?.completionType !== spec.expectedCompletionType) {
      sourceFidelityErrors.push(
        `${question.id}: source completion type must remain ${spec.expectedCompletionType}`
      );
    }
    if (Number.isInteger(spec.requiredPassingNotes) &&
        question.interaction?.completionRequirements?.minimumPassingNotes !==
          spec.requiredPassingNotes) {
      sourceFidelityErrors.push(
        `${question.id}: source requires ${spec.requiredPassingNotes} passing notes`
      );
    }
    if (spec.requiredSuspension === true &&
        question.interaction?.completionRequirements?.requiredSuspension !== true &&
        !question.interaction?.completionRequirements?.suspension) {
      sourceFidelityErrors.push(
        `${question.id}: source requires an explicit suspension contract`
      );
    }
    if (Array.isArray(spec.nonHarmonicMarkers)) {
      const acceptedMarkers = new Set(
        (question.interaction?.fields || [])
          .filter((field) => field.kind === "classification")
          .flatMap((field) => field.acceptedAnswers || [])
          .map((answer) => answer.label)
      );
      spec.nonHarmonicMarkers.forEach((marker) => {
        if (!acceptedMarkers.has(marker)) {
          sourceFidelityErrors.push(
            `${question.id}: source non-harmonic marker ${marker} is not represented in the response contract`
          );
        }
      });
    }
    if (
      Number.isInteger(spec.measureCount) &&
      question.score.measures.length !== spec.measureCount
    ) {
      sourceFidelityErrors.push(
        `${question.id}: source measureCount mismatch; expected ${spec.measureCount}, found ${question.score.measures.length}`
      );
    }
    if (spec.bassPedal) {
      const bassPitches = harmonicEvents
        .map((locator) =>
          question.score.measures[locator.measure - 1]?.events?.[locator.event]
            ?.bass?.[0]
        )
        .filter(Boolean)
        .map((pitch) => renderer.parsePitch(pitch).letter.toUpperCase());
      if (!bassPitches.length || bassPitches.some((pitch) => pitch !== spec.bassPedal)) {
        sourceFidelityErrors.push(
          `${question.id}: source bass pedal must remain ${spec.bassPedal}`
        );
      }
    }
    if (Array.isArray(spec.requiredPitchSpellings)) {
      const authoredPitches = new Set(
        question.score.measures.flatMap((measure) => {
          if (measure.voices) {
            return SATB_NAMES.flatMap((voiceName) =>
              (measure.voices[voiceName] || [])
                .map((event) => event.pitch)
                .filter(Boolean)
            );
          }
          return (measure.events || []).flatMap((event) => [
            ...(event.treble || []),
            ...(event.bass || []),
          ]);
        })
      );
      spec.requiredPitchSpellings.forEach((pitch) => {
        if (!authoredPitches.has(pitch)) {
          sourceFidelityErrors.push(
            `${question.id}: source requires exact pitch spelling ${pitch}`
          );
        }
      });
    }
    if (spec.independentSatb) {
      const independentMeasures = normalized.measures.filter(
        (measure) => measure.voiceStreams
      );
      const allMeasuresIndependent =
        independentMeasures.length === normalized.measures.length &&
        independentMeasures.every((measure) =>
          SATB_NAMES.every(
            (voiceName) => measure.voiceStreams[voiceName]?.length
          )
        );
      const hasIndependentRhythm = independentMeasures.some((measure) => {
        const signatures = SATB_NAMES.map((voiceName) =>
          measure.voiceStreams[voiceName]
            .map((event) => event.duration)
            .join(" ")
        );
        return new Set(signatures).size > 1;
      });
      if (!allMeasuresIndependent || !hasIndependentRhythm) {
        sourceFidelityErrors.push(
          `${question.id}: source requires four complete, independently rhythmic SATB streams`
        );
      }
    }
    if (spec.completionContract) {
      const contract = spec.completionContract;
      if (Number.isInteger(contract.suppliedMeasure)) {
        const suppliedMeasure = question.score.measures[contract.suppliedMeasure - 1];
        if (
          !suppliedMeasure ||
          JSON.stringify(suppliedMeasure.voices) !==
            JSON.stringify(suppliedMeasure.questionVoices)
        ) {
          sourceFidelityErrors.push(
            `${question.id}: source completion contract requires measure ${contract.suppliedMeasure} to remain fully supplied`
          );
        }
      }

      const targetMeasures = (contract.targetMeasures || []).map(
        (measureNumber) => ({
          measureNumber,
          measure: question.score.measures[measureNumber - 1],
        })
      );
      const modelTargetsAreComplete = targetMeasures.every(({ measure }) =>
        question.category === "satb"
          ? measure?.voices && SATB_NAMES.every((voiceName) =>
              measure.voices[voiceName]?.some((event) => event.pitch || event.pitches?.length)
            )
          : measure?.events?.some((event) =>
              (event.treble || []).length && (event.bass || []).length
            )
      );
      if (!modelTargetsAreComplete) {
        sourceFidelityErrors.push(
          `${question.id}: source completion contract requires complete model notation in the target region`
        );
      }

      if (contract.blankTargetVoices) {
        const targetsAreBlank = targetMeasures.every(({ measure }) =>
          measure?.questionVoices &&
          SATB_NAMES.every(
            (voiceName) =>
              Array.isArray(measure.questionVoices[voiceName]) &&
              measure.questionVoices[voiceName].every(
                (event) => !event.pitch && !event.pitches?.length
              )
          )
        );
        if (!targetsAreBlank) {
          sourceFidelityErrors.push(
            `${question.id}: source completion contract leaks model voice pitches into the target region`
          );
        }
      }

      const harmonicIndications = harmonicEvents.filter(
        (event) => event.questionLabel
      ).length;
      if (Number.isInteger(contract.harmonicIndications) &&
          harmonicIndications !== contract.harmonicIndications) {
        sourceFidelityErrors.push(
          `${question.id}: source completion contract requires ${contract.harmonicIndications} supplied harmonic indications, found ${harmonicIndications}`
        );
      }
      if (Number.isInteger(contract.totalChordMoments) &&
          harmonicEvents.length !== contract.totalChordMoments) {
        sourceFidelityErrors.push(
          `${question.id}: source completion contract requires ${contract.totalChordMoments} total chord moments, found ${harmonicEvents.length}`
        );
      }
      if (Number.isInteger(contract.suppliedChordMoments) &&
          harmonicIndications !== contract.suppliedChordMoments) {
        sourceFidelityErrors.push(
          `${question.id}: source completion contract requires ${contract.suppliedChordMoments} supplied chord moments, found ${harmonicIndications}`
        );
      }
      const learnerChosenChordMoments = harmonicEvents.filter(
        (event) => event.analysisBox !== false && !event.questionLabel
      ).length;
      if (Number.isInteger(contract.learnerChosenChordMoments) &&
          learnerChosenChordMoments !== contract.learnerChosenChordMoments) {
        sourceFidelityErrors.push(
          `${question.id}: source completion contract requires ${contract.learnerChosenChordMoments} learner-choice chord boxes, found ${learnerChosenChordMoments}`
        );
      }

      const targetNumbers = new Set(contract.targetMeasures || []);
      const realisedChordMoments = harmonicEvents
        .filter((event) => targetNumbers.has(event.measure))
        .reduce((count, event) => count + 1 + (event.resolution ? 1 : 0), 0);
      if (realisedChordMoments !== contract.chordsToRealise) {
        sourceFidelityErrors.push(
          `${question.id}: source completion contract requires ${contract.chordsToRealise} chords to realise, found ${realisedChordMoments}`
        );
      }
    }
  }

  function validate(questions, options = {}) {
    const errors = [];
    const sourceFidelityErrors = [];
    const spoilerAuditErrors = [];
    const reviewWarnings = [];
    const ids = new Set();
    const signatures = new Map();
    const categoryCounts = Object.fromEntries(
      CATEGORIES.map((category) => [category, 0])
    );

    questions.forEach((question) => {
      if (ids.has(question.id)) errors.push(`${question.id}: duplicate id`);
      ids.add(question.id);
      if (!(question.category in categoryCounts)) {
        errors.push(`${question.id}: unknown category ${question.category}`);
      } else {
        categoryCounts[question.category] += 1;
      }
      if (!["nzqa-reference", "practice-assessment-reference", "original-practice"].includes(question.sourceType)) {
        errors.push(`${question.id}: missing sourceType`);
      }
      if (!question.source?.title || !question.source?.acknowledgement) {
        errors.push(`${question.id}: incomplete source metadata`);
      }
      if (["nzqa-reference", "practice-assessment-reference"].includes(question.sourceType)) {
        ["provider", "year", "question", "part", "extract", "creator", "location", "sourceKind"].forEach(
          (field) => {
            if (!question.source[field]) {
              errors.push(`${question.id}: reference source missing ${field}`);
            }
          }
        );
      }
      validateStudentPresentation(question, spoilerAuditErrors);
      validateInteraction(question, errors);
      validateHarmonicAnswerRoles(question, errors);
      if (!Array.isArray(question.score.measures) || !question.score.measures.length) {
        errors.push(`${question.id}: legacy or empty score data`);
        return;
      }
      if (!Array.isArray(question.score.harmonicEvents)) {
        errors.push(`${question.id}: missing harmonicEvents array`);
        return;
      }

      validateMeasureDurations(question, errors);
      let normalized;
      let harmonicEvents;
      try {
        normalized = renderer.normalizeMeasures(question.score);
        harmonicEvents = renderer.normalizeHarmonicEvents(question.score, normalized);
        renderer.normalizeNoteAnnotations(question.score, normalized);
      } catch (error) {
        errors.push(`${question.id}: ${error.message}`);
        return;
      }
      validateChordEvents(question, normalized, harmonicEvents, errors);
      validateRomanRoots(question, harmonicEvents, errors);
      validateKeySemantics(question, harmonicEvents, errors);
      validateNonHarmonicNotes(question, normalized, errors, reviewWarnings);
      validateSatb(question, normalized, errors);
      validateSourceFidelity(
        question,
        normalized,
        harmonicEvents,
        sourceFidelityErrors
      );
      const textureWarning = reviewTexture(question, normalized, harmonicEvents);
      if (textureWarning) reviewWarnings.push(textureWarning);

      const signature = JSON.stringify(question.score.measures);
      if (signatures.has(signature)) {
        errors.push(
          `${question.id}: notation duplicates ${signatures.get(signature)}`
        );
      } else {
        signatures.set(signature, question.id);
      }

    });

    const references = questions.filter(
      (question) => question.sourceType === "nzqa-reference"
    );
    if (!references.length) {
      errors.push("references: expected at least one exact NZQA reference");
    }

    const cTurnaround = questions.find(
      (question) => question.id === "jazz-c-turnaround"
    );
    const c6Locator = cTurnaround?.score.harmonicEvents.find(
      (event) => event.chordSymbol === "C6"
    );
    const c6Event = c6Locator
      ? cTurnaround.score.measures[c6Locator.measure - 1]?.events[c6Locator.event]
      : null;
    const c6Result = c6Event
      ? renderer.validateChordIdentification(c6Event, "C6")
      : { valid: false };
    if (!c6Result.valid) {
      errors.push("jazz-c-turnaround: final voicing must support C6 (C–E–G–A)");
    }

    const allErrors = [...errors, ...sourceFidelityErrors, ...spoilerAuditErrors];
    const report = {
      valid: allErrors.length === 0,
      errors: allErrors,
      musicTheoryErrors: errors,
      sourceFidelityErrors,
      spoilerAuditErrors,
      total: questions.length,
      categoryCounts,
      referenceCount: references.length,
      practiceReferenceCount: questions.filter(
        (question) => question.sourceType === "practice-assessment-reference"
      ).length,
      referenceLabels: references.map(sourceLabel),
      legacyCount: questions.filter((question) => question.score.chords).length,
      reviewWarnings,
    };
    if (!report.valid && options.throwOnError) {
      throw new Error(`Question-bank validation failed:\n${allErrors.join("\n")}`);
    }
    return report;
  }

  const report = validate(window.CadenceData.questions, { throwOnError: true });
  window.CadenceQuestionValidator = Object.freeze({ validate, report });
})();
