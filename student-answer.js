(function () {
  "use strict";

  const SATB_VOICES = ["soprano", "alto", "tenor", "bass"];
  const PIANO_STAVES = ["treble", "bass"];
  const DURATION_BEATS = {
    w: 4,
    h: 2,
    q: 1,
    "8": 0.5,
    "16": 0.25,
  };
  const DURATION_FOR_BEATS = new Map([
    [4, "w"],
    [3, "hd"],
    [2, "h"],
    [1.5, "qd"],
    [1, "q"],
    [0.75, "8d"],
    [0.5, "8"],
    [0.25, "16"],
  ]);
  const LETTERS = ["C", "D", "E", "F", "G", "A", "B"];
  const KEY_SIGNATURES = {
    C: 0,
    G: 1,
    D: 2,
    A: 3,
    E: 4,
    B: 5,
    "F#": 6,
    "C#": 7,
    F: -1,
    Bb: -2,
    Eb: -3,
    Ab: -4,
    Db: -5,
    Gb: -6,
    Cb: -7,
    Am: 0,
    Em: 1,
    Bm: 2,
    "F#m": 3,
    "C#m": 4,
    "G#m": 5,
    "D#m": 6,
    "A#m": 7,
    Dm: -1,
    Gm: -2,
    Cm: -3,
    Fm: -4,
    Bbm: -5,
    Ebm: -6,
    Abm: -7,
  };

  class AnswerError extends Error {
    constructor(code, message) {
      super(message);
      this.name = "AnswerError";
      this.code = code;
    }
  }

  function copy(value) {
    return typeof structuredClone === "function"
      ? structuredClone(value)
      : JSON.parse(JSON.stringify(value));
  }

  function normalizeAccidental(value) {
    return String(value || "")
      .replaceAll("♯", "#")
      .replaceAll("♭", "b")
      .replaceAll("♮", "n");
  }

  function durationBeats(duration) {
    const value = String(duration || "q").toLowerCase();
    const base = value.replaceAll("d", "");
    if (!(base in DURATION_BEATS)) {
      throw new AnswerError("invalid-duration", `Unsupported duration: ${duration}`);
    }
    let multiplier = 1;
    let addition = 0.5;
    for (let index = 0; index < (value.match(/d/g) || []).length; index += 1) {
      multiplier += addition;
      addition /= 2;
    }
    return DURATION_BEATS[base] * multiplier;
  }

  function timeSignatureAt(question, measureNumber) {
    let signature = question.score.timeSignature || "4/4";
    for (let index = 0; index < measureNumber; index += 1) {
      signature = question.score.measures[index]?.timeSignature || signature;
    }
    const match = /^(\d+)\/(\d+)$/.exec(signature);
    if (!match) throw new AnswerError("invalid-meter", `Invalid time signature: ${signature}`);
    return { numerator: Number(match[1]), denominator: Number(match[2]), text: signature };
  }

  function measureCapacity(question, measureNumber) {
    return question.score.measures[measureNumber - 1]?.expectedBeats ||
      timeSignatureAt(question, measureNumber).numerator;
  }

  function answerVoices(question) {
    return question.category === "satb" ? SATB_VOICES : PIANO_STAVES;
  }

  function editableMeasures(question, voice) {
    return [...new Set(
      (question.interaction?.editableRegions || [])
        .filter((region) => region.voices.includes(voice))
        .flatMap((region) => region.measures)
    )].sort((a, b) => a - b);
  }

  function isEditable(question, measure, voice) {
    return Boolean(
      question.interaction?.editableRegions?.some(
        (region) =>
          region.measures.includes(measure) && region.voices.includes(voice)
      )
    );
  }

  function create(question) {
    if (!question.interaction) return null;
    const voices = answerVoices(question);
    const cursors = Object.fromEntries(
      voices.map((voice) => {
        const measures = editableMeasures(question, voice);
        return [voice, { measure: measures[0] || 1, beat: 1 }];
      })
    );
    return {
      questionId: question.id,
      measures: question.score.measures.map(() => ({ voices: {} })),
      cursors,
      selectedId: null,
      submitted: false,
      nextId: 1,
      revision: 0,
    };
  }

  function streamFor(state, measure, voice, createMissing = false) {
    const holder = state.measures[measure - 1];
    if (!holder) throw new AnswerError("invalid-measure", `Measure ${measure} does not exist.`);
    if (createMissing && !holder.voices[voice]) holder.voices[voice] = [];
    return holder.voices[voice] || [];
  }

  function eventStarts(stream) {
    let beat = 1;
    return stream.map((event) => {
      const current = { event, beat };
      beat += durationBeats(event.duration);
      return current;
    });
  }

  function usedBeats(stream) {
    return stream.reduce((sum, event) => sum + durationBeats(event.duration), 0);
  }

  function beatLabel(value) {
    return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)));
  }

  function locate(state, noteId) {
    for (let measureIndex = 0; measureIndex < state.measures.length; measureIndex += 1) {
      for (const [voice, stream] of Object.entries(state.measures[measureIndex].voices)) {
        const eventIndex = stream.findIndex((event) => event.id === noteId);
        if (eventIndex >= 0) {
          return {
            measure: measureIndex + 1,
            voice,
            stream,
            eventIndex,
            event: stream[eventIndex],
          };
        }
      }
    }
    return null;
  }

  function withRevision(state) {
    state.revision += 1;
    return state;
  }

  function advanceCursor(state, question, voice, measure, beat) {
    const capacity = measureCapacity(question, measure);
    if (beat <= capacity + 0.001) {
      state.cursors[voice] = { measure, beat };
      return;
    }
    const nextMeasure = editableMeasures(question, voice).find(
      (candidate) => candidate > measure
    );
    state.cursors[voice] = nextMeasure
      ? { measure: nextMeasure, beat: 1 }
      : { measure, beat: capacity + 1 };
  }

  function insert(state, question, details) {
    if (!state || state.submitted) {
      throw new AnswerError("answer-locked", "This answer is locked after submission.");
    }
    const next = copy(state);
    const voice = details.voice;
    const cursor = details.measure
      ? { measure: details.measure, beat: details.beat || 1 }
      : next.cursors[voice];
    if (!cursor || !isEditable(question, cursor.measure, voice)) {
      throw new AnswerError(
        "locked-region",
        `Measure ${cursor?.measure || "?"} is locked for ${voice}.`
      );
    }
    const stream = streamFor(next, cursor.measure, voice, true);
    const duration = String(details.duration || "q");
    const beats = durationBeats(duration);

    if (details.addToChord) {
      const selected = locate(next, next.selectedId);
      const target = selected?.voice === voice && selected.measure === cursor.measure
        ? selected.event
        : stream[stream.length - 1];
      if (!target || target.rest) {
        throw new AnswerError(
          "no-chord-onset",
          "Add to chord needs a selected or immediately preceding pitched note."
        );
      }
      const pitches = details.pitches || [];
      target.pitches = [...new Set([...(target.pitches || []), ...pitches])];
      next.selectedId = target.id;
      return withRevision(next);
    }

    const startBeat = usedBeats(stream) + 1;
    const capacity = measureCapacity(question, cursor.measure);
    const remaining = Math.max(0, capacity - startBeat + 1);
    if (beats > remaining + 0.001) {
      throw new AnswerError(
        "measure-overfill",
        `That note exceeds the remaining ${beatLabel(remaining)} beat${Math.abs(remaining - 1) < 0.001 ? "" : "s"} in this bar.`
      );
    }
    const event = {
      id: `${question.id}-student-${next.nextId++}`,
      pitches: details.rest ? [] : [...new Set(details.pitches || [])],
      duration,
      rest: Boolean(details.rest),
      tieToNext: false,
    };
    if (!event.rest && !event.pitches.length) {
      throw new AnswerError("missing-pitch", "Choose a stave position for the note.");
    }
    stream.push(event);
    next.selectedId = event.id;
    advanceCursor(next, question, voice, cursor.measure, startBeat + beats);
    return withRevision(next);
  }

  function select(state, noteId) {
    if (!locate(state, noteId)) return state;
    const next = copy(state);
    next.selectedId = noteId;
    return next;
  }

  function updateSelected(state, question, changes) {
    if (!state?.selectedId) {
      throw new AnswerError("nothing-selected", "Select one of your notes first.");
    }
    if (state.submitted) {
      throw new AnswerError("answer-locked", "This answer is locked after submission.");
    }
    const next = copy(state);
    const located = locate(next, next.selectedId);
    if (!located || !isEditable(question, located.measure, located.voice)) {
      throw new AnswerError("locked-region", "The supplied notation is locked.");
    }
    const event = located.event;
    if (changes.duration) {
      const replacement = durationBeats(changes.duration);
      const current = durationBeats(event.duration);
      const total = usedBeats(located.stream) - current + replacement;
      const capacity = measureCapacity(question, located.measure);
      if (total > capacity + 0.001) {
        const remaining = Math.max(0, capacity - (total - replacement));
        throw new AnswerError(
          "measure-overfill",
          `That note exceeds the remaining ${beatLabel(remaining)} beat${Math.abs(remaining - 1) < 0.001 ? "" : "s"} in this bar.`
        );
      }
      event.duration = changes.duration;
    }
    if (changes.pitches) {
      event.pitches = [...new Set(changes.pitches)];
      event.rest = false;
    }
    if (changes.rest != null) {
      if (changes.rest && !event.rest) event.savedPitches = event.pitches;
      event.rest = Boolean(changes.rest);
      event.pitches = event.rest ? [] : event.savedPitches || event.pitches || [];
    }
    return withRevision(next);
  }

  function deleteSelected(state, question) {
    if (!state?.selectedId) {
      throw new AnswerError("nothing-selected", "Select one of your notes first.");
    }
    if (state.submitted) {
      throw new AnswerError("answer-locked", "This answer is locked after submission.");
    }
    const next = copy(state);
    const located = locate(next, next.selectedId);
    if (!located || !isEditable(question, located.measure, located.voice)) {
      throw new AnswerError("locked-region", "The supplied notation is locked.");
    }
    located.stream.splice(located.eventIndex, 1);
    const beat = usedBeats(located.stream) + 1;
    next.cursors[located.voice] = { measure: located.measure, beat };
    next.selectedId = null;
    return withRevision(next);
  }

  function toggleTie(state, question) {
    if (!state?.selectedId) {
      throw new AnswerError("nothing-selected", "Select the first note of the tie.");
    }
    const next = copy(state);
    const located = locate(next, next.selectedId);
    if (!located || !isEditable(question, located.measure, located.voice)) {
      throw new AnswerError("locked-region", "The supplied notation is locked.");
    }
    let following = located.stream[located.eventIndex + 1];
    if (!following) {
      for (
        let measure = located.measure + 1;
        measure <= next.measures.length && !following;
        measure += 1
      ) {
        following = streamFor(next, measure, located.voice)[0];
      }
    }
    if (!following) {
      throw new AnswerError("missing-tie-target", "Enter the following note before adding a tie.");
    }
    const commonPitch = located.event.pitches.some((pitch) =>
      following.pitches.includes(pitch)
    );
    if (!commonPitch) {
      throw new AnswerError("invalid-tie", "A tie needs the same pitch in the following note or chord.");
    }
    located.event.tieToNext = !located.event.tieToNext;
    return withRevision(next);
  }

  function applyAccidental(state, question, accidental) {
    if (!state?.selectedId) {
      throw new AnswerError("nothing-selected", "Select one of your notes first.");
    }
    const located = locate(state, state.selectedId);
    if (!located || located.event.rest || !located.event.pitches.length) {
      throw new AnswerError("missing-pitch", "Select a pitched note first.");
    }
    const symbol = normalizeAccidental(accidental);
    const pitches = located.event.pitches.map((pitch) => {
      const match = /^([A-Ga-g])(?:##|bb|#|b|n)?(-?\d+)$/.exec(
        normalizeAccidental(pitch)
      );
      return match ? `${match[1].toUpperCase()}${symbol}${match[2]}` : pitch;
    });
    return updateSelected(state, question, { pitches });
  }

  function setSubmitted(state) {
    if (!state) return null;
    const next = copy(state);
    next.submitted = true;
    next.selectedId = null;
    return withRevision(next);
  }

  class History {
    constructor(initial) {
      this.reset(initial);
    }

    reset(initial) {
      this.present = copy(initial);
      this.past = [];
      this.future = [];
      return this.present;
    }

    commit(next) {
      if (JSON.stringify(next) === JSON.stringify(this.present)) return this.present;
      this.past.push(copy(this.present));
      this.present = copy(next);
      this.future = [];
      return this.present;
    }

    undo() {
      if (!this.past.length || this.present?.submitted) return this.present;
      this.future.push(copy(this.present));
      this.present = this.past.pop();
      return copy(this.present);
    }

    redo() {
      if (!this.future.length || this.present?.submitted) return this.present;
      this.past.push(copy(this.present));
      this.present = this.future.pop();
      return copy(this.present);
    }
  }

  function sourceSatbStreams(measure) {
    if (measure.voices && !measure.events) {
      const source = measure.questionVoices || measure.voices;
      return Object.fromEntries(
        SATB_VOICES.map((voice) => [
          voice,
          (source[voice] || [])
            .filter((event) => event.pitch || event.pitches?.length || event.rest)
            .map((event) => ({ ...copy(event), locked: true })),
        ])
      );
    }
    return Object.fromEntries(
      SATB_VOICES.map((voice) => [
        voice,
        (measure.events || []).flatMap((event) => {
          const source = event.questionVoices || event.voices || {};
          const pitch = source[voice];
          if (!pitch) return [];
          return [{ pitch, duration: event.duration || "q", locked: true }];
        }),
      ])
    );
  }

  function sourcePianoStreams(measure) {
    return Object.fromEntries(
      PIANO_STAVES.map((staff) => {
        const questionField = staff === "treble" ? "qTreble" : "qBass";
        const restField = `${staff}Rest`;
        const events = (measure.events || []).flatMap((event) => {
          const hasQuestionField = Object.hasOwn(event, questionField);
          const pitches = hasQuestionField
            ? event[questionField] || []
            : event[staff] || [];
          const rest = Boolean(event[restField]);
          if (!pitches.length && !rest) return [];
          return [{
            pitches: copy(pitches),
            duration: event[`${staff}Duration`] || event.duration || "q",
            rest,
            locked: true,
          }];
        });
        return [staff, events];
      })
    );
  }

  function emptyPlaceholder(question, measureNumber) {
    const beats = measureCapacity(question, measureNumber);
    return [{ duration: DURATION_FOR_BEATS.get(beats) || "w" }];
  }

  function composeScore(question, state, options = {}) {
    const includeSource = options.includeSource !== false;
    const includeStudent = options.includeStudent !== false;
    const score = copy(question.score);
    score.skipChordValidation = true;
    score.editorMode = options.editorMode !== false;
    score.caption = question.score.caption;
    score.studentCaption = question.score.studentCaption;
    score.measures = question.score.measures.map((measure, measureIndex) => {
      const measureNumber = measureIndex + 1;
      const structural = Object.fromEntries(
        ["expectedBeats", "keySignature", "cancelKeySignature", "timeSignature", "beginBarline", "endBarline", "barline"]
          .filter((key) => measure[key] != null)
          .map((key) => [key, copy(measure[key])])
      );
      if (question.category === "satb") {
        const source = includeSource ? sourceSatbStreams(measure) : {};
        const voices = Object.fromEntries(
          SATB_VOICES.map((voice) => {
            const student = includeStudent
              ? copy(streamFor(state, measureNumber, voice))
              : [];
            const sourceEvents = source[voice] || [];
            const events = student.length
              ? student.map((event) => ({
                  pitch: event.pitches[0] || null,
                  duration: event.duration,
                  rest: event.rest,
                  tieToNext: event.tieToNext,
                  editorNoteId: event.id,
                }))
              : sourceEvents;
            return [voice, events.length ? events : emptyPlaceholder(question, measureNumber)];
          })
        );
        return { ...structural, voices };
      }

      const source = includeSource ? sourcePianoStreams(measure) : {};
      const staffVoices = Object.fromEntries(
        PIANO_STAVES.map((staff) => {
          const sourceEvents = source[staff] || [];
          const studentEvents = includeStudent
            ? copy(streamFor(state, measureNumber, staff)).map((event) => ({
                ...event,
                editorNoteId: event.id,
              }))
            : [];
          return [staff, [
            {
              role: `source-${staff}`,
              stemDirection: staff === "treble" ? "up" : "down",
              events: sourceEvents,
            },
            {
              role: `student-${staff}`,
              stemDirection: staff === "treble" ? "down" : "up",
              events: studentEvents,
            },
          ]];
        })
      );
      return { ...structural, staffVoices };
    });
    return score;
  }

  function questionOnlyScore(question) {
    if (question.interaction) {
      return composeScore(question, create(question), {
        includeSource: true,
        includeStudent: false,
      });
    }
    const score = copy(question.score);
    score.measures = score.measures.map((measure) => {
      if (measure.voices) {
        return {
          ...measure,
          voices: copy(measure.questionVoices || measure.voices),
          questionVoices: undefined,
        };
      }
      return {
        ...measure,
        events: (measure.events || []).map((event) => ({
          ...event,
          treble: Object.hasOwn(event, "qTreble") ? copy(event.qTreble || []) : copy(event.treble || []),
          bass: Object.hasOwn(event, "qBass") ? copy(event.qBass || []) : copy(event.bass || []),
        })),
      };
    });
    return score;
  }

  function scoreForPlayback(question, state, mode) {
    if (mode === "model") return copy(question.score);
    if (mode === "question") return questionOnlyScore(question);
    if (!state) return null;
    if (mode === "student") {
      return composeScore(question, state, {
        includeSource: false,
        includeStudent: true,
      });
    }
    if (mode === "context") return composeScore(question, state);
    throw new AnswerError("invalid-playback-mode", `Unknown playback mode: ${mode}`);
  }

  function keyAccidental(keySignature, letter) {
    const key = normalizeAccidental(keySignature).replace(/\s+/g, "");
    const count = KEY_SIGNATURES[key] || 0;
    if (count > 0 && ["F", "C", "G", "D", "A", "E", "B"].slice(0, count).includes(letter)) {
      return "#";
    }
    if (count < 0 && ["B", "E", "A", "D", "G", "C", "F"].slice(0, -count).includes(letter)) {
      return "b";
    }
    return "";
  }

  function spellPitchAtStaffPosition(details) {
    const baseIndex = details.staff === "bass" ? 26 : 38;
    const diatonicIndex = baseIndex - Math.round(details.stepsFromTopLine || 0);
    const octave = Math.floor(diatonicIndex / 7);
    const letter = LETTERS[((diatonicIndex % 7) + 7) % 7];
    let accidental = normalizeAccidental(details.accidental);
    if (!accidental) {
      const earlier = (details.priorEvents || [])
        .flatMap((event) => event.pitches || [])
        .map((pitch) => /^([A-Ga-g])((?:##|bb|#|b|n)?)(-?\d+)$/.exec(normalizeAccidental(pitch)))
        .filter(Boolean)
        .filter((match) => match[1].toUpperCase() === letter && Number(match[3]) === octave)
        .at(-1);
      accidental = earlier ? earlier[2] : keyAccidental(details.keySignature, letter);
    }
    return `${letter}${accidental}${octave}`;
  }

  window.CadenceStudentAnswer = Object.freeze({
    AnswerError,
    History,
    SATB_VOICES: Object.freeze([...SATB_VOICES]),
    PIANO_STAVES: Object.freeze([...PIANO_STAVES]),
    create,
    insert,
    select,
    updateSelected,
    deleteSelected,
    toggleTie,
    applyAccidental,
    setSubmitted,
    locate,
    isEditable,
    editableMeasures,
    measureCapacity,
    durationBeats,
    usedBeats,
    composeScore,
    questionOnlyScore,
    scoreForPlayback,
    spellPitchAtStaffPosition,
  });
})();
