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

  function durationBeats(duration, denominator = 4) {
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
    return DURATION_BEATS[base] * multiplier * (denominator / 4);
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

  function keySignatureAt(question, measureNumber) {
    let signature = question.score.keySignature || "C";
    for (let index = 0; index < measureNumber; index += 1) {
      signature = question.score.measures[index]?.keySignature || signature;
    }
    return signature;
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
    if (question.interaction?.type !== "notation-completion") return null;
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

  function eventStarts(stream, denominator = 4) {
    let sequentialBeat = 1;
    return stream
      .map((event, index) => {
        const beat = Number.isFinite(Number(event.beat))
          ? Number(event.beat)
          : sequentialBeat;
        const beats = durationBeats(event.duration, denominator);
        sequentialBeat = Math.max(sequentialBeat, beat + beats);
        return { event, beat, beats, index };
      })
      .sort((first, second) => first.beat - second.beat || first.index - second.index);
  }

  function usedBeats(stream, denominator = 4) {
    return eventStarts(stream, denominator).reduce(
      (furthest, item) => Math.max(furthest, item.beat - 1 + item.beats),
      0
    );
  }

  function durationsForGap(beats, denominator) {
    const values = ["w", "hd", "h", "qd", "q", "8d", "8", "16"];
    const result = [];
    let remaining = beats;
    while (remaining > 0.001) {
      const duration = values.find(
        (candidate) => durationBeats(candidate, denominator) <= remaining + 0.001
      );
      if (!duration) {
        throw new AnswerError(
          "unsupported-gap",
          `Cannot represent a ${beatLabel(beats)}-beat gap in this metre.`
        );
      }
      result.push(duration);
      remaining -= durationBeats(duration, denominator);
    }
    return result;
  }

  function materializeTimedStream(stream, denominator = 4) {
    let cursor = 1;
    const result = [];
    eventStarts(stream, denominator).forEach(({ event, beat, beats }) => {
      const gap = beat - cursor;
      if (gap > 0.001) {
        durationsForGap(gap, denominator).forEach((duration) => {
          result.push({
            duration,
            rest: true,
            generatedGap: true,
          });
        });
      }
      result.push({ ...copy(event), beat });
      cursor = Math.max(cursor, beat + beats);
    });
    return result;
  }

  function durationForExactBeats(beats, denominator) {
    return ["w", "hd", "h", "qd", "q", "8d", "8", "16"].find(
      (duration) => Math.abs(durationBeats(duration, denominator) - beats) < 0.001
    );
  }

  function rangesOverlap(firstStart, firstDuration, secondStart, secondDuration) {
    const firstEnd = firstStart + firstDuration;
    const secondEnd = secondStart + secondDuration;
    return firstStart < secondEnd - 0.001 && secondStart < firstEnd - 0.001;
  }

  function snapBeatAtX(details) {
    const startX = Number(details.startX);
    const endX = Number(details.endX);
    const x = Number(details.x);
    const capacity = Number(details.capacity);
    const denominator = Number(details.denominator || 4);
    if (![startX, endX, x, capacity, denominator].every(Number.isFinite) ||
        endX <= startX || capacity <= 0) {
      throw new AnswerError("invalid-hit-geometry", "The tapped measure geometry is invalid.");
    }
    const eventDuration = durationBeats(details.duration || "q", denominator);
    const grid = Math.min(denominator / 4, eventDuration);
    const fraction = Math.max(0, Math.min(1, (x - startX) / (endX - startX)));
    const rawOffset = fraction * capacity;
    const snappedOffset = Math.round(rawOffset / grid) * grid;
    const latestOffset = Math.max(0, capacity - eventDuration);
    return 1 + Math.min(latestOffset, Math.max(0, snappedOffset));
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
    const existingCursor = next.cursors[voice];
    const cursor = details.measure
      ? {
          measure: details.measure,
          beat: details.beat ??
            (existingCursor?.measure === details.measure ? existingCursor.beat : 1),
        }
      : existingCursor;
    if (!cursor || !isEditable(question, cursor.measure, voice)) {
      throw new AnswerError(
        "locked-region",
        `Measure ${cursor?.measure || "?"} is locked for ${voice}.`
      );
    }
    const stream = streamFor(next, cursor.measure, voice, true);
    const duration = String(details.duration || "q");
    const denominator = timeSignatureAt(question, cursor.measure).denominator;
    const beats = durationBeats(duration, denominator);
    const startBeat = Number(cursor.beat);
    const capacity = measureCapacity(question, cursor.measure);

    if (details.addToChord) {
      const selected = locate(next, next.selectedId);
      const selectedAtTap = selected?.voice === voice &&
        selected.measure === cursor.measure &&
        Math.abs(Number(selected.event.beat || 1) - startBeat) < 0.001;
      const target = selectedAtTap
        ? selected.event
        : eventStarts(stream, denominator).find(
            (item) => Math.abs(item.beat - startBeat) < 0.001
          )?.event;
      if (target && !target.rest) {
        const pitches = details.pitches || [];
        target.pitches = [...new Set([...(target.pitches || []), ...pitches])];
        next.selectedId = target.id;
        return withRevision(next);
      }
      // A one-shot chord-tone action should never strand the learner. If the
      // tapped onset is empty, it becomes an ordinary new note/rest onset.
    }

    const remaining = Math.max(0, capacity - startBeat + 1);
    if (beats > remaining + 0.001) {
      throw new AnswerError(
        "measure-overfill",
        `That note exceeds the remaining ${beatLabel(remaining)} beat${Math.abs(remaining - 1) < 0.001 ? "" : "s"} in this bar.`
      );
    }
    const overlap = eventStarts(stream, denominator).find((item) =>
      rangesOverlap(startBeat, beats, item.beat, item.beats)
    );
    if (overlap) {
      throw new AnswerError(
        "event-overlap",
        `That ${beatLabel(beats)}-beat value overlaps an existing event at beat ${beatLabel(overlap.beat)}.`
      );
    }
    const event = {
      id: `${question.id}-student-${next.nextId++}`,
      pitches: details.rest ? [] : [...new Set(details.pitches || [])],
      duration,
      beat: startBeat,
      rest: Boolean(details.rest),
      tieToNext: false,
    };
    if (!event.rest && !event.pitches.length) {
      throw new AnswerError("missing-pitch", "Choose a stave position for the note.");
    }
    stream.push(event);
    stream.sort((first, second) =>
      Number(first.beat || 1) - Number(second.beat || 1)
    );
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
      const denominator = timeSignatureAt(question, located.measure).denominator;
      const replacement = durationBeats(changes.duration, denominator);
      const startBeat = Number(event.beat || 1);
      const capacity = measureCapacity(question, located.measure);
      if (startBeat + replacement > capacity + 1 + 0.001) {
        const remaining = Math.max(0, capacity - startBeat + 1);
        throw new AnswerError(
          "measure-overfill",
          `That note exceeds the remaining ${beatLabel(remaining)} beat${Math.abs(remaining - 1) < 0.001 ? "" : "s"} in this bar.`
        );
      }
      const overlap = eventStarts(located.stream, denominator).find(
        (item) =>
          item.event.id !== event.id &&
          rangesOverlap(startBeat, replacement, item.beat, item.beats)
      );
      if (overlap) {
        throw new AnswerError(
          "event-overlap",
          `That duration overlaps an existing event at beat ${beatLabel(overlap.beat)}.`
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
    const deletedBeat = Number(located.event.beat || 1);
    located.stream.splice(located.eventIndex, 1);
    next.cursors[located.voice] = { measure: located.measure, beat: deletedBeat };
    next.selectedId = null;
    return withRevision(next);
  }

  function removePitchFromSelected(state, question, pitch) {
    if (!state?.selectedId) {
      throw new AnswerError("nothing-selected", "Select one of your chords first.");
    }
    const located = locate(state, state.selectedId);
    if (!located || located.event.rest || !located.event.pitches?.includes(pitch)) {
      throw new AnswerError("missing-pitch", "That chord tone is not selected.");
    }
    if (located.event.pitches.length === 1) {
      return deleteSelected(state, question);
    }
    return updateSelected(state, question, {
      pitches: located.event.pitches.filter((candidate) => candidate !== pitch),
    });
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
    if (located.event.tieToNext) {
      located.event.tieToNext = false;
      return withRevision(next);
    }
    if (located.event.rest || !located.event.pitches.length) {
      throw new AnswerError("invalid-tie", "A tie must begin on a pitched note.");
    }

    const denominator = timeSignatureAt(question, located.measure).denominator;
    const selected = eventStarts(located.stream, denominator).find(
      (item) => item.event.id === located.event.id
    );
    const endBeat = selected.beat + selected.beats;
    const barlineBeat = measureCapacity(question, located.measure) + 1;
    let following = null;
    if (endBeat < barlineBeat - 0.001) {
      following = eventStarts(located.stream, denominator).find(
        (item) => Math.abs(item.beat - endBeat) < 0.001
      )?.event || null;
    } else if (Math.abs(endBeat - barlineBeat) < 0.001) {
      const nextMeasure = located.measure + 1;
      if (nextMeasure <= next.measures.length) {
        const nextDenominator = timeSignatureAt(question, nextMeasure).denominator;
        following = eventStarts(
          streamFor(next, nextMeasure, located.voice),
          nextDenominator
        ).find((item) => Math.abs(item.beat - 1) < 0.001)?.event || null;
      }
    }
    if (!following || following.rest || !following.pitches?.length) {
      throw new AnswerError(
        "noncontiguous-tie",
        "A tie needs the following pitched event to begin exactly when this note ends."
      );
    }
    const commonPitch = located.event.pitches.some((pitch) =>
      following.pitches.includes(pitch)
    );
    if (!commonPitch) {
      throw new AnswerError("invalid-tie", "A tie needs the same pitch in the following note or chord.");
    }
    located.event.tieToNext = true;
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
    const keySignature = keySignatureAt(question, located.measure);
    const pitches = located.event.pitches.map((pitch) => {
      const match = /^([A-Ga-g])(?:##|bb|#|b|n)?(-?\d+)$/.exec(
        normalizeAccidental(pitch)
      );
      if (!match) return pitch;
      const letter = match[1].toUpperCase();
      const resolved = symbol || keyAccidental(keySignature, letter);
      return `${letter}${resolved}${match[2]}`;
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

  function eventPitches(event, field = null) {
    if (Array.isArray(event.pitches)) return event.pitches;
    if (event.pitch) return [event.pitch];
    return field && Array.isArray(event[field]) ? event[field] : [];
  }

  function sourceVisibleEvents(question, measureNumber, staff) {
    const measure = question.score.measures[measureNumber - 1];
    if (!measure) return [];
    const denominator = timeSignatureAt(question, measureNumber).denominator;

    if (question.category === "satb") {
      const voicesOnStaff = staff === "treble"
        ? ["soprano", "alto"]
        : ["tenor", "bass"];
      if (measure.voices && !measure.events) {
        const source = measure.questionVoices || measure.voices;
        return voicesOnStaff.flatMap((voice) => {
          let beat = 1;
          return (source[voice] || []).flatMap((event) => {
            const currentBeat = beat;
            beat += durationBeats(event.duration || "q", denominator);
            const pitches = eventPitches(event);
            return pitches.length
              ? [{ beat: currentBeat, pitches: copy(pitches), voice, staff, supplied: true }]
              : [];
          });
        });
      }
      let beat = 1;
      return (measure.events || []).flatMap((event) => {
        const currentBeat = beat;
        beat += durationBeats(event.duration || "q", denominator);
        const source = event.questionVoices || event.voices || {};
        return voicesOnStaff.flatMap((voice) => {
          const value = source[voice];
          const pitches = value == null ? [] : Array.isArray(value) ? value : [value];
          return pitches.length
            ? [{ beat: currentBeat, pitches: copy(pitches), voice, staff, supplied: true }]
            : [];
        });
      });
    }

    if (measure.staffVoices) {
      return (measure.staffVoices[staff] || []).flatMap((voice, voiceIndex) => {
        let beat = 1;
        return (voice.events || []).flatMap((event) => {
          const currentBeat = beat;
          beat += durationBeats(event.duration || "q", denominator);
          const pitches = eventPitches(event, staff);
          return pitches.length
            ? [{
                beat: currentBeat,
                pitches: copy(pitches),
                voice: voice.role || `${staff}-${voiceIndex + 1}`,
                staff,
                supplied: true,
              }]
            : [];
        });
      });
    }

    let beat = 1;
    const questionField = staff === "treble" ? "qTreble" : "qBass";
    return (measure.events || []).flatMap((event) => {
      const currentBeat = beat;
      beat += durationBeats(
        event[`${staff}Duration`] || event.duration || "q",
        denominator
      );
      const pitches = Object.hasOwn(event, questionField)
        ? event[questionField] || []
        : event[staff] || [];
      return pitches.length
        ? [{ beat: currentBeat, pitches: copy(pitches), voice: staff, staff, supplied: true }]
        : [];
    });
  }

  function visibleAccidentalContext(question, state, details) {
    const measureNumber = Number(details.measure);
    const insertionBeat = Number(details.beat);
    const staff = details.staff;
    const denominator = timeSignatureAt(question, measureNumber).denominator;
    const voicesOnStaff = question.category === "satb"
      ? staff === "treble" ? ["soprano", "alto"] : ["tenor", "bass"]
      : [staff];
    const student = voicesOnStaff.flatMap((voice) =>
      eventStarts(streamFor(state, measureNumber, voice), denominator).map(
        (item) => ({
          beat: item.beat,
          pitches: copy(item.event.pitches || []),
          voice,
          staff,
          supplied: false,
        })
      )
    );
    return [...sourceVisibleEvents(question, measureNumber, staff), ...student]
      .filter((event) => event.beat < insertionBeat - 0.001)
      .sort((first, second) =>
        first.beat - second.beat || Number(second.supplied) - Number(first.supplied)
      );
  }

  function emptyPlaceholder(question, measureNumber) {
    const beats = measureCapacity(question, measureNumber);
    const denominator = timeSignatureAt(question, measureNumber).denominator;
    return [{ duration: durationForExactBeats(beats, denominator) || "w" }];
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
        const denominator = timeSignatureAt(question, measureNumber).denominator;
        const voices = Object.fromEntries(
          SATB_VOICES.map((voice) => {
            const student = includeStudent
              ? materializeTimedStream(
                  copy(streamFor(state, measureNumber, voice)),
                  denominator
                )
              : [];
            const sourceEvents = source[voice] || [];
            const events = student.length
              ? student.map((event) => ({
                  pitch: event.pitches?.[0] || null,
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
      const denominator = timeSignatureAt(question, measureNumber).denominator;
      const staffVoices = Object.fromEntries(
        PIANO_STAVES.map((staff) => {
          const sourceEvents = source[staff] || [];
          const studentEvents = includeStudent
            ? materializeTimedStream(
                copy(streamFor(state, measureNumber, staff)),
                denominator
              ).map((event) => ({
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
    if (question.interaction?.type === "notation-completion") {
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
      const insertionBeat = Number(details.insertionBeat);
      const earlier = (details.priorEvents || [])
        .filter(
          (event) =>
            !Number.isFinite(insertionBeat) ||
            !Number.isFinite(Number(event.beat)) ||
            Number(event.beat) < insertionBeat - 0.001
        )
        .flatMap((event) => eventPitches(event).map((pitch) => ({ event, pitch })))
        .map(({ event, pitch }) => ({
          event,
          match: /^([A-Ga-g])((?:##|bb|#|b|n)?)(-?\d+)$/.exec(
            normalizeAccidental(pitch)
          ),
        }))
        .filter((item) => item.match)
        .filter((item) =>
          item.match[1].toUpperCase() === letter &&
          Number(item.match[3]) === octave
        )
        .sort((first, second) =>
          Number(first.event.beat || 0) - Number(second.event.beat || 0)
        )
        .map((item) => item.match)
        .at(-1);
      accidental = earlier
        ? earlier[2] || keyAccidental(details.keySignature, letter)
        : keyAccidental(details.keySignature, letter);
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
    removePitchFromSelected,
    toggleTie,
    applyAccidental,
    setSubmitted,
    locate,
    isEditable,
    editableMeasures,
    measureCapacity,
    durationBeats,
    usedBeats,
    eventStarts,
    materializeTimedStream,
    snapBeatAtX,
    composeScore,
    questionOnlyScore,
    scoreForPlayback,
    sourceVisibleEvents,
    visibleAccidentalContext,
    spellPitchAtStaffPosition,
  });
})();
