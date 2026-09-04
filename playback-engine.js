(function () {
  "use strict";

  const QUARTER_BEATS = { w: 4, h: 2, q: 1, "8": 0.5, "16": 0.25 };
  const PITCH_CLASSES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

  function normalizeAccidental(value) {
    return String(value || "")
      .replaceAll("♯", "#")
      .replaceAll("♭", "b")
      .replaceAll("♮", "n");
  }

  function durationBeats(value) {
    const duration = String(value || "q").toLowerCase();
    const base = duration.replaceAll("d", "");
    if (!(base in QUARTER_BEATS)) throw new Error(`Unsupported duration: ${value}`);
    let multiplier = 1;
    let addition = 0.5;
    for (let index = 0; index < (duration.match(/d/g) || []).length; index += 1) {
      multiplier += addition;
      addition /= 2;
    }
    return QUARTER_BEATS[base] * multiplier;
  }

  function pitchMidi(value) {
    const match = /^([A-Ga-g])((?:##|bb|#|b|n)?)(-?\d+)$/.exec(
      normalizeAccidental(value)
    );
    if (!match) throw new Error(`Invalid pitch spelling: ${value}`);
    const accidental = [...match[2]].reduce(
      (sum, symbol) => sum + (symbol === "#" ? 1 : symbol === "b" ? -1 : 0),
      0
    );
    return (Number(match[3]) + 1) * 12 + PITCH_CLASSES[match[1].toUpperCase()] + accidental;
  }

  function pitchFrequency(value) {
    return 440 * 2 ** ((pitchMidi(value) - 69) / 12);
  }

  function timeSignature(value) {
    const match = /^(\d+)\/(\d+)$/.exec(value || "4/4");
    if (!match) throw new Error(`Invalid time signature: ${value}`);
    return { numerator: Number(match[1]), denominator: Number(match[2]) };
  }

  function measureLength(measure, signature) {
    const denominatorBeats = measure.expectedBeats || signature.numerator;
    return denominatorBeats * (4 / signature.denominator);
  }

  function normalizedPitches(event, field) {
    if (event.rest) return [];
    if (event.pitches) return event.pitches;
    if (event.pitch) return [event.pitch];
    return event[field] || [];
  }

  function measureStreams(measure, measureIndex, firstSourceEventIndex) {
    if (measure.staffVoices) {
      return {
        streams: ["treble", "bass"].flatMap((staff) =>
          (measure.staffVoices[staff] || []).map((voice, voiceIndex) => ({
            key: `${staff}:${voice.role || voiceIndex}`,
            voice: voice.role || staff,
            staff,
            events: (voice.events || []).map((event, eventIndex) => ({
              ...event,
              pitches: normalizedPitches(event, staff),
              eventOrder: eventIndex,
            })),
          }))
        ),
        sourceEventCount: 0,
      };
    }

    if (measure.voices && !measure.events) {
      return {
        streams: ["soprano", "alto", "tenor", "bass"].map((voice) => ({
          key: `satb:${voice}`,
          voice,
          staff: ["soprano", "alto"].includes(voice) ? "treble" : "bass",
          events: (measure.voices[voice] || []).map((event, eventIndex) => ({
            ...event,
            pitches: normalizedPitches(event, voice),
            eventOrder: eventIndex,
          })),
        })),
        sourceEventCount: 0,
      };
    }

    const events = measure.events || [];
    const hasNamedSatb = events.some((event) => event.voices);
    const names = hasNamedSatb
      ? ["soprano", "alto", "tenor", "bass"]
      : ["treble", "bass"];
    return {
      streams: names.map((voice) => ({
        key: hasNamedSatb ? `satb:${voice}` : `staff:${voice}`,
        voice,
        staff: ["soprano", "alto", "treble"].includes(voice) ? "treble" : "bass",
        events: events.map((event, eventIndex) => {
          const namedPitch = event.voices?.[voice];
          const pitches = hasNamedSatb
            ? namedPitch == null ? [] : [namedPitch]
            : normalizedPitches(event, voice);
          return {
            pitches,
            rest: hasNamedSatb
              ? (event.voiceRests || []).includes(voice)
              : Boolean(event[`${voice}Rest`] || event.rest === voice || event.rest === true),
            duration: event[`${voice}Duration`] || event.duration || "q",
            tieToNext: event.tieToNext,
            eventOrder: eventIndex,
            sourceEventIndex: firstSourceEventIndex + eventIndex,
          };
        }),
      })),
      sourceEventCount: events.length,
    };
  }

  function mergeTies(notes, score) {
    const links = [];
    const byStream = new Map();
    notes.forEach((note) => {
      if (!byStream.has(note.streamKey)) byStream.set(note.streamKey, []);
      byStream.get(note.streamKey).push(note);
    });
    byStream.forEach((streamNotes) => {
      streamNotes.forEach((note) => {
        if (!note.tieToNext) return;
        const next = streamNotes.find(
          (candidate) =>
            candidate.streamEventOrder === note.streamEventOrder + 1 &&
            candidate.pitch === note.pitch &&
            candidate.startBeat >= note.startBeat
        );
        if (next) links.push([note, next]);
      });
    });
    (score.ties || []).forEach((tie) => {
      const from = tie.from ?? tie.start;
      const to = tie.to ?? tie.end;
      const first = notes.find(
        (note) =>
          note.sourceEventIndex === from &&
          (!tie.staff || note.staff === tie.staff) &&
          (!tie.voice || note.voice === tie.voice) &&
          (!tie.firstPitch || note.pitch === tie.firstPitch)
      );
      const last = notes.find(
        (note) =>
          note.sourceEventIndex === to &&
          (!tie.staff || note.staff === tie.staff) &&
          (!tie.voice || note.voice === tie.voice) &&
          (!tie.lastPitch || note.pitch === tie.lastPitch)
      );
      if (first && last) links.push([first, last]);
    });

    const continuationIds = new Set();
    links
      .sort((a, b) => a[0].startBeat - b[0].startBeat)
      .forEach(([first, last]) => {
        const origin = notes.find(
          (candidate) =>
            candidate.pitch === first.pitch &&
            candidate.streamKey === first.streamKey &&
            Math.abs(candidate.startBeat + candidate.durationBeats - first.startBeat) < 0.001 &&
            !continuationIds.has(candidate.id)
        ) || first;
        origin.durationBeats = Math.max(
          origin.durationBeats,
          last.startBeat + last.durationBeats - origin.startBeat
        );
        continuationIds.add(last.id);
      });
    return notes.filter((note) => !continuationIds.has(note.id));
  }

  function buildTimeline(score, tempo = 88) {
    if (!score || !Array.isArray(score.measures)) {
      return { notes: [], totalBeats: 0, durationSeconds: 0, measureStarts: [] };
    }
    let activeSignature = timeSignature(score.timeSignature || "4/4");
    let measureStart = 0;
    let sourceEventIndex = 0;
    let noteId = 0;
    const streamEventOrders = new Map();
    const measureStarts = [];
    const notes = [];

    score.measures.forEach((measure, measureIndex) => {
      if (measure.timeSignature) activeSignature = timeSignature(measure.timeSignature);
      measureStarts.push(measureStart);
      const built = measureStreams(measure, measureIndex, sourceEventIndex);
      sourceEventIndex += built.sourceEventCount;
      built.streams.forEach((stream) => {
        let streamBeat = 0;
        stream.events.forEach((event) => {
          const beats = durationBeats(event.duration || "q");
          const streamEventOrder = streamEventOrders.get(stream.key) || 0;
          streamEventOrders.set(stream.key, streamEventOrder + 1);
          if (!event.rest) {
            event.pitches.forEach((pitch) => {
              notes.push({
                id: `playback-${noteId++}`,
                pitch,
                startBeat: measureStart + streamBeat,
                durationBeats: beats,
                measure: measureIndex + 1,
                beatInMeasure: streamBeat,
                voice: stream.voice,
                staff: stream.staff,
                streamKey: stream.key,
                eventOrder: event.eventOrder,
                streamEventOrder,
                sourceEventIndex: event.sourceEventIndex,
                tieToNext: Boolean(event.tieToNext),
              });
            });
          }
          streamBeat += beats;
        });
      });
      measureStart += measureLength(measure, activeSignature);
    });

    const mergedNotes = mergeTies(notes, score).sort(
      (a, b) => a.startBeat - b.startBeat || a.pitch.localeCompare(b.pitch)
    );
    const secondsPerBeat = 60 / Number(tempo || 88);
    return {
      notes: mergedNotes,
      totalBeats: measureStart,
      durationSeconds: measureStart * secondsPerBeat,
      measureStarts,
      tempo: Number(tempo || 88),
      secondsPerBeat,
    };
  }

  class PlaybackEngine {
    constructor(options = {}) {
      this.onProgress = options.onProgress || (() => {});
      this.onStateChange = options.onStateChange || (() => {});
      this.context = null;
      this.nodes = [];
      this.frame = null;
      this.state = "stopped";
      this.timeline = null;
      this.positionBeat = 0;
      this.startedAt = 0;
      this.startBeat = 0;
    }

    ensureContext() {
      if (!this.context) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) throw new Error("Web Audio is not supported in this browser.");
        this.context = new AudioContextClass();
      }
      if (this.context.state === "suspended") this.context.resume();
      return this.context;
    }

    makeTone(pitch, when, duration, gainScale = 1) {
      const context = this.ensureContext();
      const output = context.createGain();
      const fundamental = context.createOscillator();
      const colour = context.createOscillator();
      const colourGain = context.createGain();
      const frequency = pitchFrequency(pitch);
      fundamental.type = "triangle";
      colour.type = "sine";
      fundamental.frequency.setValueAtTime(frequency, when);
      colour.frequency.setValueAtTime(frequency * 2, when);
      colourGain.gain.setValueAtTime(0.16, when);
      output.gain.setValueAtTime(0.0001, when);
      output.gain.exponentialRampToValueAtTime(0.08 * gainScale, when + 0.012);
      output.gain.exponentialRampToValueAtTime(0.0001, when + Math.max(0.07, duration));
      fundamental.connect(output);
      colour.connect(colourGain).connect(output);
      output.connect(context.destination);
      fundamental.start(when);
      colour.start(when);
      fundamental.stop(when + duration + 0.04);
      colour.stop(when + duration + 0.04);
      this.nodes.push(fundamental, colour, output, colourGain);
    }

    play(score, options = {}) {
      this.stop(false);
      const tempo = Number(options.tempo || 88);
      this.timeline = buildTimeline(score, tempo);
      const requestedMeasure = Math.max(1, Number(options.startMeasure || 1));
      this.startBeat = options.startBeat ??
        this.timeline.measureStarts[requestedMeasure - 1] ?? 0;
      this.positionBeat = this.startBeat;
      const context = this.ensureContext();
      this.startedAt = context.currentTime + 0.045;
      const audible = this.timeline.notes.filter(
        (note) => note.startBeat + note.durationBeats > this.startBeat + 0.001
      );
      const simultaneous = new Map();
      audible.forEach((note) => {
        const key = note.startBeat.toFixed(4);
        simultaneous.set(key, (simultaneous.get(key) || 0) + 1);
      });
      audible.forEach((note) => {
        const clippedStart = Math.max(note.startBeat, this.startBeat);
        const clippedDuration = note.durationBeats - Math.max(0, this.startBeat - note.startBeat);
        const when = this.startedAt + (clippedStart - this.startBeat) * this.timeline.secondsPerBeat;
        const duration = Math.max(0.06, clippedDuration * this.timeline.secondsPerBeat * 0.92);
        const gainScale = 1 / Math.sqrt(simultaneous.get(note.startBeat.toFixed(4)) || 1);
        this.makeTone(note.pitch, when, duration, gainScale);
      });
      this.state = "playing";
      this.onStateChange(this.state);
      this.tick();
      return this.timeline;
    }

    tick() {
      cancelAnimationFrame(this.frame);
      if (this.state !== "playing" || !this.timeline) return;
      const elapsed = Math.max(0, this.context.currentTime - this.startedAt);
      this.positionBeat = this.startBeat + elapsed / this.timeline.secondsPerBeat;
      this.onProgress({
        beat: Math.min(this.positionBeat, this.timeline.totalBeats),
        timeline: this.timeline,
      });
      if (this.positionBeat >= this.timeline.totalBeats) {
        this.stop();
        return;
      }
      this.frame = requestAnimationFrame(() => this.tick());
    }

    pause() {
      if (this.state !== "playing") return this.positionBeat;
      this.positionBeat = this.startBeat +
        Math.max(0, this.context.currentTime - this.startedAt) /
          this.timeline.secondsPerBeat;
      this.clearNodes();
      this.state = "paused";
      this.onStateChange(this.state);
      return this.positionBeat;
    }

    resume(score, options = {}) {
      if (this.state !== "paused") return this.play(score, options);
      return this.play(score, { ...options, startBeat: this.positionBeat });
    }

    clearNodes() {
      cancelAnimationFrame(this.frame);
      this.frame = null;
      this.nodes.forEach((node) => {
        try { node.stop?.(); } catch (_) { /* already stopped */ }
        try { node.disconnect?.(); } catch (_) { /* already disconnected */ }
      });
      this.nodes = [];
    }

    stop(notify = true) {
      this.clearNodes();
      this.state = "stopped";
      this.positionBeat = 0;
      this.timeline = null;
      if (notify) {
        this.onProgress({ beat: null, timeline: null });
        this.onStateChange(this.state);
      }
    }

    auditionPitch(pitch) {
      const context = this.ensureContext();
      this.makeTone(pitch, context.currentTime + 0.01, 0.24, 0.8);
    }
  }

  window.CadencePlayback = Object.freeze({
    PlaybackEngine,
    buildTimeline,
    durationBeats,
    pitchFrequency,
  });
})();
