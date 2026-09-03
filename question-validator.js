(function () {
  "use strict";

  const renderer = window.CadenceScoreRenderer;
  const SATB_NAMES = ["soprano", "alto", "tenor", "bass"];
  const EXPECTED_COUNTS = {
    analysis: 6,
    modulation: 6,
    satb: 4,
    piano: 4,
    jazz: 6,
    features: 6,
  };

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

  function validateNonHarmonicNotes(question, errors) {
    (question.score.nonHarmonicNotes || []).forEach((note) => {
      const parsedChord = renderer.parseChordSymbol(note.chordSymbol);
      const chordPitchClasses = new Set(
        parsedChord.intervals.map(
          (interval) => (parsedChord.rootPitchClass + interval) % 12
        )
      );
      const notePitchClass = renderer.pitchClass(renderer.parsePitch(note.pitch));
      if (chordPitchClasses.has(notePitchClass)) {
        errors.push(
          `${question.id}: ${note.pitch} is labelled ${note.type} but belongs to ${note.chordSymbol}`
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
    if (question.sourceType !== "nzqa-reference") return;
    const spec = question.sourceSpec;
    if (!spec || typeof spec !== "object") {
      sourceFidelityErrors.push(`${question.id}: missing expected-source specification`);
      return;
    }

    const compareList = (field, actual) => {
      if (!Array.isArray(spec[field])) return;
      if (JSON.stringify(actual) !== JSON.stringify(spec[field])) {
        sourceFidelityErrors.push(
          `${question.id}: source ${field} mismatch; expected ${JSON.stringify(spec[field])}, found ${JSON.stringify(actual)}`
        );
      }
    };

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
      "sectionRanges",
      (question.score.brackets || []).map((section) => ({
        label: section.label,
        key: section.key,
        start: section.start,
        end: section.end,
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
        (event) => event.analysisBox !== false && !event.questionLabel
      ).length;
      if (answerPositions !== spec.answerPositions) {
        sourceFidelityErrors.push(
          `${question.id}: source answerPositions mismatch; expected ${spec.answerPositions}, found ${answerPositions}`
        );
      }
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
  }

  function validate(questions, options = {}) {
    const errors = [];
    const sourceFidelityErrors = [];
    const reviewWarnings = [];
    const ids = new Set();
    const signatures = new Map();
    const categoryCounts = Object.fromEntries(
      Object.keys(EXPECTED_COUNTS).map((category) => [category, 0])
    );

    questions.forEach((question) => {
      if (ids.has(question.id)) errors.push(`${question.id}: duplicate id`);
      ids.add(question.id);
      if (!(question.category in categoryCounts)) {
        errors.push(`${question.id}: unknown category ${question.category}`);
      } else {
        categoryCounts[question.category] += 1;
      }
      if (!["nzqa-reference", "original-practice"].includes(question.sourceType)) {
        errors.push(`${question.id}: missing sourceType`);
      }
      if (!question.source?.title || !question.source?.acknowledgement) {
        errors.push(`${question.id}: incomplete source metadata`);
      }
      if (question.sourceType === "nzqa-reference") {
        ["year", "question", "part", "extract", "creator", "location"].forEach(
          (field) => {
            if (!question.source[field]) {
              errors.push(`${question.id}: reference source missing ${field}`);
            }
          }
        );
      }
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
      } catch (error) {
        errors.push(`${question.id}: ${error.message}`);
        return;
      }
      validateChordEvents(question, normalized, harmonicEvents, errors);
      validateRomanRoots(question, harmonicEvents, errors);
      validateNonHarmonicNotes(question, errors);
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

    Object.entries(EXPECTED_COUNTS).forEach(([category, expected]) => {
      if (categoryCounts[category] !== expected) {
        errors.push(
          `${category}: expected ${expected} questions, found ${categoryCounts[category]}`
        );
      }
    });

    const references = questions.filter(
      (question) => question.sourceType === "nzqa-reference"
    );
    if (references.length !== 8) {
      errors.push(`references: expected 8 templates, found ${references.length}`);
    }
    [2021, 2022, 2023, 2024].forEach((year) => {
      const count = references.filter((question) => question.source.year === year).length;
      if (count < 1) {
        errors.push(`${year}: expected at least one reference template, found ${count}`);
      }
    });

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

    const allErrors = [...errors, ...sourceFidelityErrors];
    const report = {
      valid: allErrors.length === 0,
      errors: allErrors,
      musicTheoryErrors: errors,
      sourceFidelityErrors,
      total: questions.length,
      categoryCounts,
      referenceCount: references.length,
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
