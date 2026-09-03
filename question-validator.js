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
      const expected = Number(match[1]);
      const denominator = Number(match[2]);
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
      const validationEvent = harmonicEvent.validationPitches
        ? {
            treble: harmonicEvent.validationPitches,
            bass: harmonicEvent.bassPitch ? [harmonicEvent.bassPitch] : [],
          }
        : noteEvent;
      const result = renderer.validateChordIdentification(
        validationEvent,
        harmonicEvent.chordSymbol
      );
      if (!result.valid) {
        errors.push(
          `${question.id}: displayed pitches do not fully support ${harmonicEvent.chordSymbol}`
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

  function validateSatb(question, errors) {
    if (question.category !== "satb") return;
    question.score.measures.flatMap((measure) => measure.events).forEach(
      (event, eventIndex) => {
        if (!event.voices) {
          errors.push(`${question.id}: SATB event ${eventIndex + 1} lacks named voices`);
          return;
        }
        const values = SATB_NAMES.map((name) => event.voices[name]);
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

  function validate(questions, options = {}) {
    const errors = [];
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
      validateSatb(question, errors);

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
    [2021, 2022, 2023, 2024].forEach((year) => {
      const count = references.filter((question) => question.source.year === year).length;
      if (count < 1 || count > 2) {
        errors.push(`${year}: expected one or two reference templates, found ${count}`);
      }
    });

    const cTurnaround = questions.find(
      (question) => question.id === "jazz-c-turnaround"
    );
    const c6Event = cTurnaround?.score.measures.at(-1)?.events.at(-1);
    const c6Result = c6Event
      ? renderer.validateChordIdentification(c6Event, "C6")
      : { valid: false };
    if (!c6Result.valid) {
      errors.push("jazz-c-turnaround: final voicing must support C6 (C–E–G–A)");
    }

    const report = {
      valid: errors.length === 0,
      errors,
      total: questions.length,
      categoryCounts,
      referenceCount: references.length,
      referenceLabels: references.map(sourceLabel),
      legacyCount: questions.filter((question) => question.score.chords).length,
    };
    if (!report.valid && options.throwOnError) {
      throw new Error(`Question-bank validation failed:\n${errors.join("\n")}`);
    }
    return report;
  }

  const report = validate(window.CadenceData.questions, { throwOnError: true });
  window.CadenceQuestionValidator = Object.freeze({ validate, report });
})();
