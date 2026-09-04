(function () {
  "use strict";

  const VEXFLOW_VERSION = "4.2.5";
  const SVG_NS = "http://www.w3.org/2000/svg";
  const DEFAULT_TIME_SIGNATURE = "4/4";
  const DEFAULT_EXPLICIT_DURATION = "q";
  const LEGACY_EVENT_DURATION = "w";
  const MIN_RENDER_WIDTH = 340;
  const MAX_RENDER_WIDTH = 1040;
  const MEASURE_MIN_WIDTH = 128;
  const LEGACY_EVENT_MIN_WIDTH = 90;
  const MARGIN_X = 42;
  const VOICE_LABEL_MARGIN_X = 58;
  const SATB_VOICE_NAMES = ["soprano", "alto", "tenor", "bass"];

  const durationAliases = {
    "1": "w",
    whole: "w",
    w: "w",
    "2": "h",
    half: "h",
    h: "h",
    "4": "q",
    quarter: "q",
    q: "q",
    "8": "8",
    eighth: "8",
    e: "8",
    "16": "16",
    sixteenth: "16",
    "dotted-half": "hd",
    dottedhalf: "hd",
    hd: "hd",
    "dotted-quarter": "qd",
    dottedquarter: "qd",
    qd: "qd",
    "dotted-eighth": "8d",
    dottedeighth: "8d",
    "8d": "8d",
  };

  function getVexFlow() {
    const vex = window.Vex?.Flow || window.Vex;
    if (!vex?.Renderer || !vex?.StaveNote) {
      throw new Error("VexFlow did not load before the score renderer.");
    }
    return vex;
  }

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
  }

  function normalizeDuration(value) {
    const key = String(value || DEFAULT_EXPLICIT_DURATION).toLowerCase();
    const duration = durationAliases[key];
    if (!duration) {
      throw new Error(`Unsupported note duration: ${value}`);
    }
    return duration;
  }

  function durationDetails(value) {
    const normalized = normalizeDuration(value);
    const dotCount = (normalized.match(/d/g) || []).length;
    return {
      normalized,
      base: normalized.replaceAll("d", ""),
      dots: dotCount,
    };
  }

  function durationInBeats(value, denominator = 4) {
    const details = durationDetails(value);
    const quarterBeats = { w: 4, h: 2, q: 1, "8": 0.5, "16": 0.25 }[
      details.base
    ];
    let multiplier = 1;
    let addition = 0.5;
    for (let index = 0; index < details.dots; index += 1) {
      multiplier += addition;
      addition /= 2;
    }
    return quarterBeats * multiplier * (denominator / 4);
  }

  function parseTimeSignature(value) {
    const match = /^(\d+)\/(\d+)$/.exec(value || DEFAULT_TIME_SIGNATURE);
    if (!match) {
      throw new Error(`Invalid time signature: ${value}`);
    }
    return {
      numerator: Number(match[1]),
      denominator: Number(match[2]),
      text: `${match[1]}/${match[2]}`,
    };
  }

  function normalizeAccidental(value) {
    return String(value || "")
      .replaceAll("♯", "#")
      .replaceAll("♭", "b")
      .replaceAll("♮", "n")
      .replaceAll("𝄪", "##")
      .replaceAll("𝄫", "bb");
  }

  function parsePitch(value) {
    const match = /^([A-Ga-g])((?:##|bb|#|b|n)?)(-?\d+)$/.exec(
      normalizeAccidental(value)
    );
    if (!match) {
      throw new Error(`Invalid pitch spelling: ${value}`);
    }
    return {
      letter: match[1].toLowerCase(),
      accidental: match[2],
      octave: Number(match[3]),
      source: String(value),
    };
  }

  function vexKey(parsedPitch) {
    return `${parsedPitch.letter}${parsedPitch.accidental}/${parsedPitch.octave}`;
  }

  function inferKeySignature(label) {
    const firstKey = String(label || "C")
      .split("→")[0]
      .trim();
    const match = /^([A-Ga-g])([#b♯♭]?)(?:\s+(major|minor))?/i.exec(firstKey);
    if (!match) return "C";
    const letter = match[1].toUpperCase();
    const accidental = normalizeAccidental(match[2]);
    const minor = match[3]?.toLowerCase() === "minor" ? "m" : "";
    return `${letter}${accidental}${minor}`;
  }

  function keySignatureForStaff(value, staff) {
    if (!value) return null;
    if (typeof value === "string") return value;
    return value[staff] || value.all || value.default || null;
  }

  function eventDuration(event, staff, scoreMode) {
    const suppliedDuration = event[`${staff}Duration`] ?? event.duration;
    if (suppliedDuration != null) return normalizeDuration(suppliedDuration);
    return scoreMode === "legacy"
      ? LEGACY_EVENT_DURATION
      : DEFAULT_EXPLICIT_DURATION;
  }

  function eventIsRest(event, staff) {
    return Boolean(event[`${staff}Rest`] || event.rest === staff || event.rest === true);
  }

  function normalizeIndependentVoiceStreams(
    source,
    measureIndex,
    timeSignature,
    sourceName
  ) {
    if (source == null) return null;
    if (typeof source !== "object" || Array.isArray(source)) {
      throw new Error(
        `SATB measure ${measureIndex + 1} ${sourceName} must be an object of voice streams.`
      );
    }
    const unknownNames = Object.keys(source).filter(
      (name) => !SATB_VOICE_NAMES.includes(name)
    );
    if (unknownNames.length) {
      throw new Error(
        `SATB measure ${measureIndex + 1} ${sourceName} has unknown voice field(s): ${unknownNames.join(", ")}.`
      );
    }

    return Object.fromEntries(
      SATB_VOICE_NAMES.map((voiceName) => {
        const stream = source[voiceName] || [];
        if (!Array.isArray(stream)) {
          throw new Error(
            `SATB measure ${measureIndex + 1} ${sourceName}.${voiceName} must be an array.`
          );
        }
        let beat = 1;
        const normalized = stream.map((value, voiceIndex) => {
          const event = typeof value === "string" ? { pitch: value } : value;
          if (!event || typeof event !== "object" || Array.isArray(event)) {
            throw new Error(
              `SATB measure ${measureIndex + 1} ${sourceName}.${voiceName} event ${voiceIndex + 1} is invalid.`
            );
          }
          const pitches = event.pitches ??
            (event.pitch == null ? [] : [event.pitch]);
          if (!Array.isArray(pitches) || pitches.length > 1) {
            throw new Error(
              `SATB measure ${measureIndex + 1} ${sourceName}.${voiceName} event ${voiceIndex + 1} must contain at most one pitch.`
            );
          }
          if (pitches[0] != null) parsePitch(pitches[0]);
          const duration = normalizeDuration(event.duration);
          const durationBeats = durationInBeats(
            duration,
            timeSignature.denominator
          );
          const result = {
            ...event,
            pitch: pitches[0] ?? null,
            duration,
            rest: Boolean(event.rest),
            _voice: voiceName,
            _voiceIndex: voiceIndex,
            _measureIndex: measureIndex,
            _beat: beat,
            _durationBeats: durationBeats,
          };
          beat += durationBeats;
          return result;
        });
        return [voiceName, normalized];
      })
    );
  }

  function soundingPitchAt(stream, beat) {
    const event = stream.find(
      (candidate) =>
        candidate._beat <= beat + 0.001 &&
        candidate._beat + candidate._durationBeats > beat + 0.001
    );
    return event && !event.rest ? event.pitch : null;
  }

  function normalizeMeasures(score) {
    const initialKeySignature =
      score.keySignature || inferKeySignature(score.key);
    let globalIndex = 0;
    let currentKeySignature = initialKeySignature;

    if (Array.isArray(score.measures) && score.measures.length) {
      let currentTimeSignature = parseTimeSignature(score.timeSignature);
      const measures = score.measures.map((source, measureIndex) => {
        const measure = Array.isArray(source) ? { events: source } : source;
        const sourceEvents = measure.events || measure.chords || [];
        if (measure.keySignature) currentKeySignature = measure.keySignature;
        if (measure.timeSignature) {
          currentTimeSignature = parseTimeSignature(measure.timeSignature);
        }
        const voiceStreams = normalizeIndependentVoiceStreams(
          measure.voices,
          measureIndex,
          currentTimeSignature,
          "voices"
        );
        const questionVoiceStreams = normalizeIndependentVoiceStreams(
          measure.questionVoices,
          measureIndex,
          currentTimeSignature,
          "questionVoices"
        );
        let events;
        if (voiceStreams) {
          const harmonicBeats = (score.harmonicEvents || [])
            .filter(
              (event) =>
                Number(event.measure) === measureIndex + 1 &&
                !Number.isInteger(event.event) &&
                Number.isFinite(Number(event.beat))
            )
            .map((event) => Number(event.beat));
          const onsetBeats = [
            ...new Set(
              [
                ...SATB_VOICE_NAMES.flatMap((voiceName) =>
                  voiceStreams[voiceName].map((event) => event._beat)
                ),
                ...harmonicBeats,
              ]
            ),
          ].sort((a, b) => a - b);
          events = onsetBeats.map((beat) => ({
            _index: globalIndex++,
            _beat: beat,
            _independentSatb: true,
            voices: Object.fromEntries(
              SATB_VOICE_NAMES.map((voiceName) => [
                voiceName,
                soundingPitchAt(voiceStreams[voiceName], beat),
              ])
            ),
          }));
          const anchorByBeat = new Map(
            events.map((event) => [event._beat, event._index])
          );
          [voiceStreams, questionVoiceStreams].filter(Boolean).forEach((streams) => {
            SATB_VOICE_NAMES.forEach((voiceName) => {
              streams[voiceName].forEach((event) => {
                event._anchorIndex = anchorByBeat.get(event._beat) ?? null;
              });
            });
          });
        } else {
          let eventBeat = 1;
          events = sourceEvents.map((event) => {
            const normalizedEvent = {
              ...event,
              _index: globalIndex++,
              _beat: eventBeat,
              _measureIndex: measureIndex,
            };
            eventBeat += durationInBeats(
              event.duration || DEFAULT_EXPLICIT_DURATION,
              currentTimeSignature.denominator
            );
            return normalizedEvent;
          });
        }
        return {
          index: measureIndex,
          mode: "explicit",
          events,
          voiceStreams,
          questionVoiceStreams,
          expectedBeats: measure.expectedBeats || null,
          keySignature: measure.keySignature || null,
          effectiveKeySignature: currentKeySignature,
          cancelKeySignature: measure.cancelKeySignature || null,
          timeSignature: measure.timeSignature || null,
          effectiveTimeSignature: currentTimeSignature,
          beginBarline: measure.beginBarline || null,
          endBarline: measure.endBarline || measure.barline || null,
        };
      });
      return { mode: "explicit", measures };
    }

    return {
      mode: "legacy",
      measures: [
        {
          index: 0,
          mode: "legacy",
          events: (score.chords || []).map((event) => ({
            ...event,
            _index: globalIndex++,
          })),
          keySignature: null,
          effectiveKeySignature: currentKeySignature,
          cancelKeySignature: null,
          timeSignature: null,
          effectiveTimeSignature: parseTimeSignature(DEFAULT_TIME_SIGNATURE),
          beginBarline: null,
          endBarline: null,
        },
      ],
    };
  }

  function eventIndexAtBeat(measure, beat) {
    const targetBeat = Number(beat);
    if (!Number.isFinite(targetBeat) || targetBeat < 1) {
      throw new Error(`Invalid harmonic-event beat: ${beat}`);
    }
    if (measure.voiceStreams) {
      const event = measure.events.find(
        (candidate) => Math.abs(candidate._beat - targetBeat) < 0.001
      );
      if (event) return event._index;
      throw new Error(
        `No SATB voice event begins at beat ${beat} in measure ${measure.index + 1}.`
      );
    }
    let currentBeat = 1;
    for (const event of measure.events) {
      if (Math.abs(currentBeat - targetBeat) < 0.001) return event._index;
      currentBeat += durationInBeats(
        event.duration || DEFAULT_EXPLICIT_DURATION,
        measure.effectiveTimeSignature.denominator
      );
    }
    throw new Error(
      `No note event begins at beat ${beat} in measure ${measure.index + 1}.`
    );
  }

  function resolveEventIndex(locator, normalizedScore) {
    if (Number.isInteger(locator.eventIndex)) return locator.eventIndex;
    const measureNumber = Number(locator.measure);
    if (!Number.isInteger(measureNumber) || measureNumber < 1) {
      throw new Error("A harmonic event needs a one-based measure number.");
    }
    const measure = normalizedScore.measures[measureNumber - 1];
    if (!measure) {
      throw new Error(`Harmonic event refers to missing measure ${measureNumber}.`);
    }
    if (Number.isInteger(locator.event)) {
      const event = measure.events[locator.event];
      if (!event) {
        throw new Error(
          `Harmonic event refers to missing event ${locator.event} in measure ${measureNumber}.`
        );
      }
      return event._index;
    }
    return eventIndexAtBeat(measure, locator.beat || 1);
  }

  function normalizeHarmonicEvents(score, normalizedScore) {
    if (Array.isArray(score.harmonicEvents)) {
      return score.harmonicEvents.map((event) => {
        const resolutionLocator = event.resolution
          ? { measure: event.measure, ...event.resolution }
          : null;
        return {
          ...event,
          _index: resolveEventIndex(event, normalizedScore),
          _resolutionIndex: resolutionLocator
            ? resolveEventIndex(resolutionLocator, normalizedScore)
            : null,
        };
      });
    }
    return normalizedScore.measures.flatMap((measure) =>
      measure.events
        .filter(
          (event) =>
            event.answerLabel || event.givenLabel || score.blankLabels
        )
        .map((event) => ({
          _index: event._index,
          analysisBox: true,
          questionLabel: event.givenLabel,
          modelLabel: event.answerLabel,
        }))
    );
  }

  function normalizeBrackets(score, normalizedScore) {
    return (score.brackets || []).map((bracket) => ({
      ...bracket,
      start: Number.isInteger(bracket.start)
        ? bracket.start
        : resolveEventIndex(bracket.start, normalizedScore),
      end: Number.isInteger(bracket.end)
        ? bracket.end
        : resolveEventIndex(bracket.end, normalizedScore),
    }));
  }

  function normalizedPitchSpelling(value) {
    const pitch = parsePitch(value);
    return `${pitch.letter}${pitch.accidental}${pitch.octave}`;
  }

  function normalizeNoteAnnotations(score, normalizedScore) {
    return (score.noteAnnotations || []).map((annotation, annotationIndex) => {
      const staff = annotation.staff || "treble";
      if (!['treble', 'bass'].includes(staff)) {
        throw new Error(
          `Note annotation ${annotationIndex + 1} has unsupported staff ${staff}.`
        );
      }
      if (!annotation.pitch || !annotation.label) {
        throw new Error(
          `Note annotation ${annotationIndex + 1} needs an exact pitch and label.`
        );
      }
      const eventIndex = resolveEventIndex(annotation, normalizedScore);
      const measure = normalizedScore.measures[Number(annotation.measure) - 1];
      const event = measure?.events.find((candidate) => candidate._index === eventIndex);
      const expectedPitch = normalizedPitchSpelling(annotation.pitch);
      let matchingVoices = [];
      if (measure?.voiceStreams) {
        const roles = staff === "treble"
          ? ["soprano", "alto"]
          : ["tenor", "bass"];
        matchingVoices = roles.filter((voiceName) =>
          measure.voiceStreams[voiceName].some(
            (voiceEvent) =>
              voiceEvent._anchorIndex === eventIndex &&
              voiceEvent.pitch &&
              normalizedPitchSpelling(voiceEvent.pitch) === expectedPitch
          )
        );
      } else {
        const pitches = event?.[staff] || [];
        if (pitches.some(
          (pitch) => normalizedPitchSpelling(pitch) === expectedPitch
        )) {
          matchingVoices = ["chord"];
        }
      }
      if (annotation.voice && !matchingVoices.includes(annotation.voice)) {
        matchingVoices = [];
      }
      if (!matchingVoices.length) {
        throw new Error(
          `Note annotation ${annotation.label} cannot find ${annotation.pitch} on the ${staff} stave at measure ${annotation.measure}, beat ${annotation.beat ?? "?"}.`
        );
      }
      if (!annotation.voice && matchingVoices.length > 1) {
        throw new Error(
          `Note annotation ${annotation.label} matches ${annotation.pitch} in more than one voice; specify voice.`
        );
      }
      return {
        ...annotation,
        staff,
        voice: annotation.voice || matchingVoices[0],
        _index: eventIndex,
      };
    });
  }

  function visiblePitches(event, staff, showAnswer) {
    if (showAnswer) return event[staff] || [];
    const questionField = staff === "treble" ? "qTreble" : "qBass";
    return Object.hasOwn(event, questionField)
      ? event[questionField] || []
      : event[staff] || [];
  }

  function attachDots(VF, note, dotCount) {
    if (!dotCount || note instanceof VF.GhostNote) return;
    for (let index = 0; index < dotCount; index += 1) {
      VF.Dot.buildAndAttach([note], { all: true });
    }
  }

  function makeStaveNote(
    VF,
    pitches,
    clef,
    duration,
    stemDirection,
    isRest = false,
    restKey = null
  ) {
    const details = durationDetails(duration);
    const vexDuration = `${details.base}${"d".repeat(details.dots)}`;
    if (!pitches.length) {
      if (!isRest) return new VF.GhostNote({ duration: vexDuration });
      const rest = new VF.StaveNote({
        clef,
        keys: [restKey || (clef === "bass" ? "d/3" : "b/4")],
        duration: `${vexDuration}r`,
        stem_direction: stemDirection,
      });
      attachDots(VF, rest, details.dots);
      return rest;
    }
    const parsedPitches = pitches.map(parsePitch);
    const note = new VF.StaveNote({
      clef,
      keys: parsedPitches.map(vexKey),
      duration: vexDuration,
      stem_direction: stemDirection,
    });
    attachDots(VF, note, details.dots);
    return note;
  }

  function splitSatbPitches(pitches, staff, eventIndex) {
    if (!pitches.length) return { upper: [], lower: [] };
    if (pitches.length === 1) {
      return staff === "treble"
        ? { upper: pitches, lower: [] }
        : { upper: [], lower: pitches };
    }
    if (pitches.length !== 2) {
      throw new Error(
        `SATB event ${eventIndex + 1} has ${pitches.length} pitches on the ${staff} stave. ` +
          "Legacy SATB input supports at most two pitches per stave; use event.voices with soprano, alto, tenor and bass fields for richer data."
      );
    }
    return {
      upper: [pitches[pitches.length - 1]],
      lower: [pitches[0]],
    };
  }

  function normalizeSatbVoiceValue(value, voiceName, eventIndex, sourceName) {
    if (value == null) return [];
    const pitches = Array.isArray(value) ? value : [value];
    if (pitches.length > 1) {
      throw new Error(
        `SATB event ${eventIndex + 1} ${sourceName}.${voiceName} contains ${pitches.length} pitches. ` +
          "Each named SATB voice must contain at most one pitch."
      );
    }
    return pitches;
  }

  function selectedSatbVoices(event, showAnswer) {
    const hasModelVoices = Object.hasOwn(event, "voices");
    const hasQuestionVoices = Object.hasOwn(event, "questionVoices");
    if (!hasModelVoices && !hasQuestionVoices) return null;
    if (!hasModelVoices) {
      throw new Error(
        `SATB event ${event._index + 1} supplies questionVoices without model voices.`
      );
    }
    if (
      ["treble", "bass", "qTreble", "qBass"].some((field) =>
        Object.hasOwn(event, field)
      )
    ) {
      throw new Error(
        `SATB event ${event._index + 1} mixes named voices with legacy stave pitches. ` +
          "Use either event.voices/questionVoices or treble/bass/qTreble/qBass."
      );
    }

    const source = !showAnswer && hasQuestionVoices
      ? event.questionVoices
      : event.voices;
    if (!source || typeof source !== "object" || Array.isArray(source)) {
      throw new Error(
        `SATB event ${event._index + 1} must provide named voice data as an object.`
      );
    }
    const unknownNames = Object.keys(source).filter(
      (name) => !SATB_VOICE_NAMES.includes(name)
    );
    if (unknownNames.length) {
      throw new Error(
        `SATB event ${event._index + 1} has unknown voice field(s): ${unknownNames.join(", ")}.`
      );
    }
    return Object.fromEntries(
      SATB_VOICE_NAMES.map((voiceName) => [
        voiceName,
        normalizeSatbVoiceValue(
          source[voiceName],
          voiceName,
          event._index,
          !showAnswer && hasQuestionVoices ? "questionVoices" : "voices"
        ),
      ])
    );
  }

  function satbPitchesForRole(event, staff, role, showAnswer) {
    const namedVoices = selectedSatbVoices(event, showAnswer);
    if (namedVoices) return namedVoices[role];
    const split = splitSatbPitches(
      visiblePitches(event, staff, showAnswer),
      staff,
      event._index
    );
    return split[role === "soprano" || role === "tenor" ? "upper" : "lower"];
  }

  const naturalPitchClasses = {
    c: 0,
    d: 2,
    e: 4,
    f: 5,
    g: 7,
    a: 9,
    b: 11,
  };

  function pitchClass(parsedPitch) {
    const accidentalOffset = [...parsedPitch.accidental].reduce(
      (total, accidental) =>
        total + (accidental === "#" ? 1 : accidental === "b" ? -1 : 0),
      0
    );
    return (naturalPitchClasses[parsedPitch.letter] + accidentalOffset + 12) % 12;
  }

  function parseChordSymbol(value) {
    const normalized = normalizeAccidental(value)
      .replaceAll("Δ", "maj")
      .replaceAll("ø", "m7b5")
      .replaceAll("°", "dim")
      .replaceAll("(", "")
      .replaceAll(")", "")
      .replaceAll(" ", "");
    const rootMatch = /^([A-Ga-g])([#b]?)(.*)$/.exec(normalized);
    if (!rootMatch) throw new Error(`Unsupported chord symbol: ${value}`);

    const root = `${rootMatch[1]}${rootMatch[2]}`;
    let quality = rootMatch[3];
    let bass = null;
    const slashMatch = /^(.*)\/([A-Ga-g])([#b]?)$/.exec(quality);
    if (slashMatch) {
      quality = slashMatch[1];
      bass = `${slashMatch[2]}${slashMatch[3]}`;
    }

    const lowerQuality = quality.toLowerCase();
    let intervals;
    if (/^(m|min)9(?:add6|6)/.test(lowerQuality)) {
      intervals = [0, 2, 3, 7, 9];
    } else if (/^(m|min)9maj7/.test(lowerQuality)) {
      intervals = [0, 2, 3, 7, 11];
    } else if (/^(m7b5|half-?dim)/.test(lowerQuality)) {
      intervals = [0, 3, 6, 10];
    } else if (/^(dim7|o7)/.test(lowerQuality)) {
      intervals = [0, 3, 6, 9];
    } else if (/^(dim|o)/.test(lowerQuality)) {
      intervals = [0, 3, 6];
    } else if (/^(m|min)maj9/.test(lowerQuality)) {
      intervals = [0, 2, 3, 7, 11];
    } else if (/^(m|min)9/.test(lowerQuality)) {
      intervals = [0, 2, 3, 7, 10];
    } else if (/^maj9/.test(lowerQuality)) {
      intervals = [0, 2, 4, 7, 11];
    } else if (/^9/.test(lowerQuality)) {
      intervals = [0, 2, 4, 7, 10];
    } else if (/^(m|min)maj7/.test(lowerQuality)) {
      intervals = [0, 3, 7, 11];
    } else if (/^(m|min)7/.test(lowerQuality)) {
      intervals = [0, 3, 7, 10];
    } else if (/^maj7/.test(lowerQuality)) {
      intervals = [0, 4, 7, 11];
    } else if (/^7sus4|^7sus/.test(lowerQuality)) {
      intervals = [0, 5, 7, 10];
    } else if (/^7/.test(lowerQuality)) {
      intervals = [0, 4, 7, 10];
    } else if (/^(m|min)6/.test(lowerQuality)) {
      intervals = [0, 3, 7, 9];
    } else if (/^6/.test(lowerQuality)) {
      intervals = [0, 4, 7, 9];
    } else if (/^sus2/.test(lowerQuality)) {
      intervals = [0, 2, 7];
    } else if (/^sus4|^sus/.test(lowerQuality)) {
      intervals = [0, 5, 7];
    } else if (/^(m|min)add9/.test(lowerQuality)) {
      intervals = [0, 2, 3, 7];
    } else if (/^add9/.test(lowerQuality)) {
      intervals = [0, 2, 4, 7];
    } else if (/^(m|min)$/.test(lowerQuality)) {
      intervals = [0, 3, 7];
    } else if (lowerQuality === "" || /^maj$/.test(lowerQuality)) {
      intervals = [0, 4, 7];
    } else {
      throw new Error(`Unsupported chord quality in symbol: ${value}`);
    }

    return {
      source: String(value),
      rootPitchClass: pitchClass(parsePitch(`${root}4`)),
      bassPitchClass: bass == null ? null : pitchClass(parsePitch(`${bass}4`)),
      intervals,
    };
  }

  function eventPitches(event) {
    if (event.voices && typeof event.voices === "object") {
      return SATB_VOICE_NAMES.flatMap((voiceName) => {
        const value = event.voices[voiceName];
        return value == null ? [] : Array.isArray(value) ? value : [value];
      });
    }
    return [...(event.treble || []), ...(event.bass || [])];
  }

  function eventBassPitch(event) {
    const value = event.voices?.bass ?? event.bass?.[0];
    if (value == null) return null;
    return Array.isArray(value) ? value[0] || null : value;
  }

  function validateChordIdentification(event, expectedSymbol) {
    const symbols = event.acceptableChordSymbols || [
      expectedSymbol || event.expectedChordSymbol,
    ];
    if (!symbols[0]) {
      throw new Error("Chord-identification validation needs an expected symbol.");
    }
    const actualPitchClasses = new Set(
      eventPitches(event).map((pitch) => pitchClass(parsePitch(pitch)))
    );
    const bassPitch = eventBassPitch(event);
    const actualBassPitchClass = bassPitch == null
      ? null
      : pitchClass(parsePitch(bassPitch));
    const analyses = symbols.map((symbol) => {
      const parsed = parseChordSymbol(symbol);
      const requiredPitchClasses = new Set(
        parsed.intervals.map((interval) => (parsed.rootPitchClass + interval) % 12)
      );
      const permittedOmissions = new Set(
        (event.omittedChordIntervals || []).map(
          (interval) => (parsed.rootPitchClass + Number(interval)) % 12
        )
      );
      if (parsed.bassPitchClass != null) {
        requiredPitchClasses.add(parsed.bassPitchClass);
      }
      const missingPitchClasses = [...requiredPitchClasses].filter(
        (value) =>
          !actualPitchClasses.has(value) && !permittedOmissions.has(value)
      );
      const extraPitchClasses = [...actualPitchClasses].filter(
        (value) => !requiredPitchClasses.has(value)
      );
      const bassMismatch =
        parsed.bassPitchClass != null &&
        parsed.bassPitchClass !== actualBassPitchClass;
      return {
        symbol,
        valid:
          missingPitchClasses.length === 0 &&
          extraPitchClasses.length === 0 &&
          !bassMismatch,
        missingPitchClasses,
        extraPitchClasses,
        bassMismatch,
      };
    });
    return {
      valid: analyses.some((analysis) => analysis.valid),
      actualPitchClasses: [...actualPitchClasses].sort((a, b) => a - b),
      analyses,
    };
  }

  function validateScoreData(normalizedScore, layout) {
    const events = normalizedScore.measures.flatMap((measure) => measure.events);
    events.forEach((event) => {
      if (event.expectedChordSymbol || event.acceptableChordSymbols) {
        const validation = validateChordIdentification(event);
        if (!validation.valid) {
          const expected = (
            event.acceptableChordSymbols || [event.expectedChordSymbol]
          ).join(" or ");
          throw new Error(
            `Chord-identification event ${event._index + 1} does not fully support ${expected}.`
          );
        }
      }
      if (layout === "satb") {
        if (event._independentSatb) return;
        if (event.voices || event.questionVoices) {
          selectedSatbVoices(event, true);
          selectedSatbVoices(event, false);
        } else {
          [true, false].forEach((showAnswer) => {
            splitSatbPitches(
              visiblePitches(event, "treble", showAnswer),
              "treble",
              event._index
            );
            splitSatbPitches(
              visiblePitches(event, "bass", showAnswer),
              "bass",
              event._index
            );
          });
        }
      }
    });

    normalizedScore.measures
      .filter((measure) => measure.voiceStreams)
      .forEach((measure) => {
        if (layout !== "satb") {
          throw new Error(
            `Independent voice streams require SATB layout in measure ${measure.index + 1}.`
          );
        }
        SATB_VOICE_NAMES.forEach((voiceName) => {
          if (!measure.voiceStreams[voiceName].length) {
            throw new Error(
              `SATB measure ${measure.index + 1} model voice ${voiceName} is empty.`
            );
          }
        });
      });
  }

  function validateHarmonicEvents(normalizedScore, harmonicEvents) {
    const events = new Map(
      normalizedScore.measures
        .flatMap((measure) => measure.events)
        .map((event) => [event._index, event])
    );
    harmonicEvents.forEach((harmonicEvent) => {
      const points = [
        {
          index: harmonicEvent._index,
          symbol: harmonicEvent.chordSymbol,
          details: harmonicEvent,
          description: `harmonic event ${harmonicEvent._index + 1}`,
        },
      ];
      if (harmonicEvent.resolution?.chordSymbol) {
        points.push({
          index: harmonicEvent._resolutionIndex,
          symbol: harmonicEvent.resolution.chordSymbol,
          details: harmonicEvent.resolution,
          description: `the resolution of harmonic event ${harmonicEvent._index + 1}`,
        });
      }
      points.forEach((point) => {
        const noteEvent = events.get(point.index);
        if (!noteEvent) {
          throw new Error(
            "A harmonic event could not be matched to displayed notation."
          );
        }
        if (!point.symbol || point.details.validateChord === false) return;
        const validationEvent = point.details.validationPitches
          ? {
              treble: point.details.validationPitches,
              bass: point.details.bassPitch ? [point.details.bassPitch] : [],
              omittedChordIntervals: point.details.omittedChordIntervals,
            }
          : noteEvent;
        const validation = validateChordIdentification(
          validationEvent,
          point.symbol
        );
        if (!validation.valid) {
          throw new Error(
            `Displayed pitches at ${point.description} do not fully support ${point.symbol}.`
          );
        }
      });
    });
  }

  function absolutePitchNumber(value) {
    const parsed = parsePitch(value);
    return (parsed.octave + 1) * 12 + pitchClass(parsed);
  }

  function closePitchCollisionCount(pitches) {
    const values = pitches.map(absolutePitchNumber).sort((a, b) => a - b);
    let collisions = 0;
    for (let index = 1; index < values.length; index += 1) {
      if (values[index] - values[index - 1] <= 2) collisions += 1;
    }
    return collisions;
  }

  function estimateMeasureWidth(
    measure,
    score,
    layout,
    harmonicEvents,
    noteAnnotations
  ) {
    const notationEvents = measure.voiceStreams
      ? SATB_VOICE_NAMES.flatMap((voiceName) => measure.voiceStreams[voiceName])
      : measure.events;
    const durations = notationEvents.map((event) =>
      durationInBeats(
        event.duration || DEFAULT_EXPLICIT_DURATION,
        measure.effectiveTimeSignature.denominator
      )
    );
    const shortestDuration = Math.min(...durations, 4);
    const onsetCount = Math.max(1, measure.events.length);
    const accidentalCount = notationEvents.reduce((count, event) => {
      const pitches = event.pitch
        ? [event.pitch]
        : [...(event.treble || []), ...(event.bass || [])];
      return count + pitches.filter(
        (pitch) => Boolean(parsePitch(pitch).accidental)
      ).length;
    }, 0);
    const restCount = notationEvents.filter(
      (event) =>
        event.rest ||
        event.trebleRest ||
        event.bassRest ||
        (event.voiceRests || []).length
    ).length;
    const dottedCount = notationEvents.filter(
      (event) => durationDetails(event.duration || "q").dots > 0
    ).length;
    const tieCount = notationEvents.filter((event) => event.tieToNext).length +
      (score.ties || []).filter((tie) =>
        measure.events.some(
          (event) => event._index === (tie.from ?? tie.start)
        )
      ).length;
    const eventIndices = new Set(measure.events.map((event) => event._index));
    const analysisCount = harmonicEvents.filter(
      (event) => eventIndices.has(event._index) && event.analysisBox !== false
    ).length;
    const annotationCount = noteAnnotations.filter(
      (annotation) => eventIndices.has(annotation._index)
    ).length;
    let closeCollisions = 0;
    let simultaneousActivity = 0;
    if (measure.voiceStreams) {
      measure.events.forEach((event) => {
        const upper = ["soprano", "alto"]
          .map((voiceName) => soundingPitchAt(
            measure.voiceStreams[voiceName],
            event._beat
          ))
          .filter(Boolean);
        const lower = ["tenor", "bass"]
          .map((voiceName) => soundingPitchAt(
            measure.voiceStreams[voiceName],
            event._beat
          ))
          .filter(Boolean);
        closeCollisions += closePitchCollisionCount(upper) +
          closePitchCollisionCount(lower);
        simultaneousActivity += upper.length + lower.length;
      });
    } else {
      measure.events.forEach((event) => {
        closeCollisions += closePitchCollisionCount(event.treble || []) +
          closePitchCollisionCount(event.bass || []);
        simultaneousActivity += (event.treble || []).length +
          (event.bass || []).length;
      });
    }

    const subdivisionPressure = Math.max(0, 1 / shortestDuration - 1);
    const preferredWidth = Math.round(clamp(
      MEASURE_MIN_WIDTH +
        Math.max(0, onsetCount - 1) * 24 +
        subdivisionPressure * 14 +
        (measure.voiceStreams ? 24 : 0) +
        Math.max(0, notationEvents.length - onsetCount) * 2.5 +
        simultaneousActivity * (layout === "satb" ? 1.5 : 0.7) +
        accidentalCount * 7 +
        restCount * 5 +
        dottedCount * 5 +
        tieCount * 8 +
        closeCollisions * 10 +
        analysisCount * 8 +
        annotationCount * 15,
      MEASURE_MIN_WIDTH,
      540
    ));
    return {
      preferredWidth,
      onsetCount,
      shortestDuration,
      accidentalCount,
      restCount,
      dottedCount,
      tieCount,
      closeCollisions,
      analysisCount,
      annotationCount,
    };
  }

  function distributeMeasureWidths(preferredWidths, availableWidth) {
    const weighted = preferredWidths.map(
      (value, index) => value + (index === 0 ? 34 : 0)
    );
    const total = weighted.reduce((sum, value) => sum + value, 0) || 1;
    return weighted.map((value) => availableWidth * value / total);
  }

  function buildSystems(
    normalizedScore,
    score,
    width,
    layout,
    harmonicEvents,
    noteAnnotations
  ) {
    const leftMargin = score.voiceLabels && layout === "satb"
      ? VOICE_LABEL_MARGIN_X
      : MARGIN_X;
    const availableWidth = width - leftMargin - MARGIN_X;
    if (normalizedScore.mode === "explicit") {
      const metrics = normalizedScore.measures.map((measure) =>
        estimateMeasureWidth(
          measure,
          score,
          layout,
          harmonicEvents,
          noteAnnotations
        )
      );
      const systems = [];
      let systemMeasures = [];
      let systemMetrics = [];
      let preferredTotal = 0;
      const flush = () => {
        if (!systemMeasures.length) return;
        const preferredWidths = systemMetrics.map(
          (metric) => metric.preferredWidth
        );
        systems.push({
          measures: systemMeasures,
          metrics: systemMetrics,
          preferredWidths,
          measureWidths: distributeMeasureWidths(
            preferredWidths,
            availableWidth
          ),
          availableWidth,
        });
        systemMeasures = [];
        systemMetrics = [];
        preferredTotal = 0;
      };
      normalizedScore.measures.forEach((measure, index) => {
        const metric = metrics[index];
        const nextTotal = preferredTotal + metric.preferredWidth;
        if (systemMeasures.length && nextTotal > availableWidth) flush();
        systemMeasures.push(measure);
        systemMetrics.push(metric);
        preferredTotal += metric.preferredWidth;
      });
      flush();
      return { systems, leftMargin };
    }

    const source = normalizedScore.measures[0];
    const eventsPerSystem =
      score.eventsPerSystem ||
      Math.max(1, Math.floor(availableWidth / LEGACY_EVENT_MIN_WIDTH));
    const systems = [];
    for (let index = 0; index < source.events.length; index += eventsPerSystem) {
      systems.push({
        measures: [{
          ...source,
          index: systems.length,
          events: source.events.slice(index, index + eventsPerSystem),
        }],
        metrics: [],
        preferredWidths: [availableWidth],
        measureWidths: [availableWidth],
        availableWidth,
      });
    }
    return {
      systems: systems.length ? systems : [{
        measures: [source],
        metrics: [],
        preferredWidths: [availableWidth],
        measureWidths: [availableWidth],
        availableWidth,
      }],
      leftMargin,
    };
  }

  function barlineType(VF, value, fallback) {
    if (value == null) return fallback;
    const key = String(value).toLowerCase().replaceAll("_", "-");
    const typeName = {
      none: "NONE",
      single: "SINGLE",
      double: "DOUBLE",
      end: "END",
      final: "END",
      "repeat-begin": "REPEAT_BEGIN",
      "repeat-start": "REPEAT_BEGIN",
      "repeat-end": "REPEAT_END",
      "repeat-both": "REPEAT_BOTH",
    }[key];
    if (!typeName) throw new Error(`Unsupported barline type: ${value}`);
    return VF.Barline.type[typeName];
  }

  function addReference(
    VF,
    referenceMap,
    eventIndex,
    staff,
    note,
    role,
    pitches = []
  ) {
    if (note instanceof VF.GhostNote) return;
    if (!referenceMap.has(eventIndex)) referenceMap.set(eventIndex, {});
    const eventReferences = referenceMap.get(eventIndex);
    if (!eventReferences[staff]) eventReferences[staff] = [];
    eventReferences[staff].push({ note, role, pitches });
  }

  function buildStaffVoices(
    VF,
    events,
    staff,
    stave,
    layout,
    showAnswer,
    timeSignature,
    referenceMap,
    scoreMode,
    measure
  ) {
    const voiceConfig = {
      num_beats: measure?.expectedBeats || timeSignature.numerator,
      beat_value: timeSignature.denominator,
    };

    if (layout !== "satb") {
      const tickables = events.map((event) => {
        const pitches = visiblePitches(event, staff, showAnswer);
        const note = makeStaveNote(
          VF,
          pitches,
          staff,
          eventDuration(event, staff, scoreMode),
          undefined,
          eventIsRest(event, staff)
        );
        note.setStave(stave);
        addReference(
          VF,
          referenceMap,
          event._index,
          staff,
          note,
          "chord",
          pitches
        );
        return note;
      });
      const voice = new VF.Voice(voiceConfig)
        .setStrict(false)
        .addTickables(tickables);
      return [{ voice, tickables, timeSignature }];
    }

    const roles = staff === "treble"
      ? [
          { name: "soprano", direction: VF.Stem.UP },
          { name: "alto", direction: VF.Stem.DOWN },
        ]
      : [
          { name: "tenor", direction: VF.Stem.UP },
          { name: "bass", direction: VF.Stem.DOWN },
        ];

    if (measure.voiceStreams) {
      const streams = !showAnswer && measure.questionVoiceStreams
        ? measure.questionVoiceStreams
        : measure.voiceStreams;
      return roles.map((role) => {
        const stream = streams[role.name] || [];
        const tickables = stream.map((event) => {
          const pitches = event.rest || !event.pitch ? [] : [event.pitch];
          const note = makeStaveNote(
            VF,
            pitches,
            staff,
            event.duration,
            role.direction,
            event.rest,
            {
              soprano: "b/4",
              alto: "f/4",
              tenor: "d/3",
              bass: "b/2",
            }[role.name]
          );
          note.setStave(stave);
          if (Number.isInteger(event._anchorIndex)) {
            addReference(
              VF,
              referenceMap,
              event._anchorIndex,
              staff,
              note,
              role.name,
              pitches
            );
          }
          return note;
        });
        if (!tickables.length) {
          const expectedBeats = measure.expectedBeats || timeSignature.numerator;
          const ghostDuration = ["w", "hd", "h", "qd", "q", "8d", "8", "16"]
            .find(
              (duration) =>
                Math.abs(
                  durationInBeats(duration, timeSignature.denominator) -
                    expectedBeats
                ) < 0.001
            );
          if (!ghostDuration) {
            throw new Error(
              `SATB measure ${measure.index + 1} cannot represent ${expectedBeats} empty beats.`
            );
          }
          const ghost = makeStaveNote(
            VF,
            [],
            staff,
            ghostDuration,
            role.direction,
            false
          );
          ghost.setStave(stave);
          tickables.push(ghost);
        }
        const voice = new VF.Voice(voiceConfig)
          .setStrict(false)
          .addTickables(tickables);
        return {
          voice,
          tickables,
          role: role.name,
          independent: true,
          timeSignature,
        };
      });
    }

    return roles.map((role) => {
      const tickables = events.map((event) => {
        const pitches = satbPitchesForRole(
          event,
          staff,
          role.name,
          showAnswer
        );
        const note = makeStaveNote(
          VF,
          pitches,
          staff,
          eventDuration(event, staff, scoreMode),
          role.direction,
          (
            (!showAnswer && event.questionVoiceRests) ||
            event.voiceRests ||
            []
          ).includes(role.name)
        );
        note.setStave(stave);
        addReference(
          VF,
          referenceMap,
          event._index,
          staff,
          note,
          role.name,
          pitches
        );
        return note;
      });
      const voice = new VF.Voice(voiceConfig)
        .setStrict(false)
        .addTickables(tickables);
      return { voice, tickables, role: role.name, timeSignature };
    });
  }

  function addStaveModifiers(
    stave,
    clef,
    measure,
    systemIndex,
    measureIndexInSystem,
    scoreMode
  ) {
    const isSystemStart = measureIndexInSystem === 0;
    const shouldShowKey = isSystemStart || measure.keySignature;
    const shouldShowTime =
      scoreMode === "explicit" &&
      ((systemIndex === 0 && measureIndexInSystem === 0) ||
        Boolean(measure.timeSignature));

    if (isSystemStart) stave.addClef(clef);
    if (shouldShowKey) {
      const key = keySignatureForStaff(measure.effectiveKeySignature, clef);
      const cancelKey = keySignatureForStaff(measure.cancelKeySignature, clef);
      if (key) stave.addKeySignature(key, cancelKey || undefined);
    }
    if (shouldShowTime) {
      stave.addTimeSignature(
        measure.timeSignature || measure.effectiveTimeSignature.text
      );
    }
  }

  function createSvgElement(tagName, attributes = {}, text = "") {
    const element = document.createElementNS(SVG_NS, tagName);
    Object.entries(attributes).forEach(([name, value]) => {
      element.setAttribute(name, String(value));
    });
    if (text) element.textContent = text;
    return element;
  }

  function drawAnalysisBox(
    group,
    anchor,
    label,
    showAnswer,
    position,
    scoreWidth
  ) {
    const boxWidth = Math.min(
      126,
      Math.max(62, String(label || "").length * 7.2 + 20)
    );
    const x = clamp(
      anchor.note.getAbsoluteX(),
      boxWidth / 2 + 5,
      scoreWidth - boxWidth / 2 - 5
    );
    const y =
      position === "top"
        ? anchor.topStave.getYForLine(0) - 22
        : anchor.bottomStave.getYForLine(4) + 36;

    group.appendChild(
      createSvgElement("rect", {
        x: x - boxWidth / 2,
        y: y - 18,
        width: boxWidth,
        height: 27,
        rx: 4,
        fill: showAnswer ? "#ecfdf5" : "#f8fafc",
        stroke: showAnswer ? "#0f8a6b" : "#8a96a7",
        "stroke-width": 1.2,
        class: "analysis-box",
      })
    );
    if (label) {
      group.appendChild(
        createSvgElement(
          "text",
          {
            x,
            y,
            "text-anchor": "middle",
            "font-family": "Georgia, 'Times New Roman', serif",
            "font-size": 13,
            "font-weight": 700,
            fill: showAnswer ? "#08775c" : "#172033",
            class: "analysis-box-label",
          },
          label
        )
      );
    }
  }

  function drawBracket(
    group,
    bracket,
    anchors,
    systemCount,
    scoreWidth
  ) {
    let labelDrawn = false;
    for (let systemIndex = 0; systemIndex < systemCount; systemIndex += 1) {
      const sectionAnchors = [];
      for (let eventIndex = bracket.start; eventIndex <= bracket.end; eventIndex += 1) {
        const anchor = anchors.get(eventIndex);
        if (anchor?.systemIndex === systemIndex) sectionAnchors.push(anchor);
      }
      if (!sectionAnchors.length) continue;
      const first = sectionAnchors[0];
      const last = sectionAnchors[sectionAnchors.length - 1];
      const x1 = clamp(first.note.getAbsoluteX() - 18, 5, scoreWidth - 5);
      const x2 = clamp(last.note.getAbsoluteX() + 18, 5, scoreWidth - 5);
      const y = first.systemLayout.bracketY;
      const centre = (x1 + x2) / 2;

      group.appendChild(
        createSvgElement("path", {
          d: `M ${x1} ${y + 7} V ${y} H ${x2} V ${y + 7}`,
          fill: "none",
          stroke: "#3f4650",
          "stroke-width": 1.1,
          class: "analysis-bracket",
          "data-system-index": systemIndex,
        })
      );
      if (!labelDrawn || bracket.repeatLabel !== false) {
        group.appendChild(
          createSvgElement(
            "text",
            {
              x: centre,
              y: y - 4,
              "text-anchor": "middle",
              "font-family": "Georgia, 'Times New Roman', serif",
              "font-size": 12,
              "font-weight": 700,
              fill: "#2f3742",
              class: "analysis-bracket-label",
              "data-system-index": systemIndex,
            },
            bracket.label
          )
        );
        labelDrawn = true;
      }
    }
  }

  function annotationIsVisible(annotation, showAnswer) {
    if (showAnswer && annotation.showInModel === false) return false;
    if (!showAnswer && annotation.showInQuestion === false) return false;
    return true;
  }

  function resolveNoteAnnotationReference(annotation, referenceMap) {
    const expectedPitch = normalizedPitchSpelling(annotation.pitch);
    const references = referenceMap.get(annotation._index)?.[annotation.staff] || [];
    return references.find(
      (reference) =>
        (!annotation.voice || reference.role === annotation.voice) &&
        reference.pitches.some(
          (pitch) => normalizedPitchSpelling(pitch) === expectedPitch
        )
    ) || null;
  }

  function drawNoteAnnotation(
    VF,
    group,
    annotation,
    referenceMap,
    anchors,
    showAnswer,
    scoreWidth
  ) {
    if (!annotationIsVisible(annotation, showAnswer)) return false;
    const reference = resolveNoteAnnotationReference(annotation, referenceMap);
    const anchor = anchors.get(annotation._index);
    if (!reference || !anchor) {
      throw new Error(
        `Note annotation ${annotation.label} could not resolve ${annotation.pitch} to a displayed notehead.`
      );
    }
    const pitchIndex = reference.pitches.findIndex(
      (pitch) =>
        normalizedPitchSpelling(pitch) ===
        normalizedPitchSpelling(annotation.pitch)
    );
    const ys = reference.note.getYs?.() || [];
    const noteY = ys[pitchIndex] ?? ys[0];
    if (!Number.isFinite(noteY)) {
      throw new Error(
        `Note annotation ${annotation.label} could not determine the notehead position for ${annotation.pitch}.`
      );
    }
    const noteX = reference.note.getAbsoluteX();
    const stemDirection = reference.note.getStemDirection?.();
    const labelOffset = stemDirection === VF.Stem.UP ? -16 : 16;
    const labelX = clamp(noteX + labelOffset, 12, scoreWidth - 12);
    const labelY = anchor.systemLayout.annotationY;
    const marker = createSvgElement("g", {
      class: "note-annotation",
      "data-event-index": annotation._index,
      "data-measure": annotation.measure,
      "data-beat": annotation.beat ?? "",
      "data-pitch": annotation.pitch,
      "data-system-index": anchor.systemIndex,
    });
    marker.appendChild(
      createSvgElement("path", {
        d: `M ${labelX} ${labelY + 4} L ${noteX} ${noteY - 7}`,
        fill: "none",
        stroke: "#343b45",
        "stroke-width": 0.9,
        class: "note-annotation-leader",
      })
    );
    marker.appendChild(
      createSvgElement(
        "text",
        {
          x: labelX,
          y: labelY,
          "text-anchor": "middle",
          "font-family": "Georgia, 'Times New Roman', serif",
          "font-size": 13,
          "font-weight": 700,
          fill: "#172033",
          stroke: "#ffffff",
          "stroke-width": 3,
          "paint-order": "stroke",
          class: "note-annotation-label",
        },
        annotation.label
      )
    );
    group.appendChild(marker);
    return true;
  }

  function drawVoiceLabels(group, score, topStave, bottomStave, systemIndex) {
    if (!score.voiceLabels || !bottomStave) return;
    const labels = score.voiceLabels === true
      ? { treble: ["S", "A"], bass: ["T", "B"] }
      : score.voiceLabels;
    const x = topStave.getX() - 18;
    const positions = [
      [labels.treble?.[0], topStave.getYForLine(1)],
      [labels.treble?.[1], topStave.getYForLine(3)],
      [labels.bass?.[0], bottomStave.getYForLine(1)],
      [labels.bass?.[1], bottomStave.getYForLine(3)],
    ];
    positions.filter(([label]) => label).forEach(([label, y]) => {
      group.appendChild(
        createSvgElement(
          "text",
          {
            x,
            y: y + 4,
            "text-anchor": "middle",
            "font-family": "Georgia, 'Times New Roman', serif",
            "font-size": 12,
            "font-style": "italic",
            fill: "#343b45",
            class: "satb-voice-label",
            "data-system-index": systemIndex,
          },
          label
        )
      );
    });
  }

  function resolveTieReference(referenceMap, eventIndex, staff, role) {
    const references = referenceMap.get(eventIndex)?.[staff] || [];
    if (!references.length) return null;
    if (role) {
      return references.find((reference) => reference.role === role) || null;
    }
    return references[0];
  }

  function independentSatbTies(normalizedScore) {
    return SATB_VOICE_NAMES.flatMap((voiceName) => {
      const stream = normalizedScore.measures.flatMap(
        (measure) => measure.voiceStreams?.[voiceName] || []
      );
      return stream.flatMap((event, index) => {
        if (!event.tieToNext) return [];
        const next = stream[index + 1];
        if (!next || !Number.isInteger(event._anchorIndex) ||
            !Number.isInteger(next._anchorIndex)) {
          throw new Error(
            `SATB ${voiceName} tie has no following anchored note.`
          );
        }
        return [{
          from: event._anchorIndex,
          to: next._anchorIndex,
          staff: ["soprano", "alto"].includes(voiceName) ? "treble" : "bass",
          voice: voiceName,
          firstPitch: event.pitch,
          lastPitch: next.pitch,
          direction: ["soprano", "tenor"].includes(voiceName)
            ? "above"
            : "below",
        }];
      });
    });
  }

  function drawTies(VF, context, ties, referenceMap, anchors) {
    (ties || []).forEach((tie) => {
      const fromIndex = tie.from ?? tie.start;
      const toIndex = tie.to ?? tie.end;
      const staff = tie.staff || "treble";
      const first = resolveTieReference(
        referenceMap,
        fromIndex,
        staff,
        tie.voice
      );
      const last = resolveTieReference(
        referenceMap,
        toIndex,
        staff,
        tie.voice
      );
      if (!first || !last) return;

      const tieIndices = (reference, pitch, indices, index) => {
        if (indices) return indices;
        if (pitch) {
          const pitchIndex = reference.pitches.indexOf(pitch);
          if (pitchIndex < 0) {
            throw new Error(`Tie pitch ${pitch} is not present in the displayed ${staff} event.`);
          }
          return [pitchIndex];
        }
        return [index ?? 0];
      };
      const firstIndices = tieIndices(
        first,
        tie.firstPitch,
        tie.firstIndices,
        tie.firstIndex
      );
      const lastIndices = tieIndices(
        last,
        tie.lastPitch,
        tie.lastIndices,
        tie.lastIndex
      );
      const firstSystem = anchors.get(fromIndex)?.systemIndex;
      const lastSystem = anchors.get(toIndex)?.systemIndex;
      const direction =
        tie.direction === "above"
          ? VF.Stem.UP
          : tie.direction === "below"
            ? VF.Stem.DOWN
            : null;
      const renderTie = (configuration) => {
        const staveTie = new VF.StaveTie(configuration);
        if (direction) staveTie.setDirection(direction);
        staveTie.setContext(context).draw();
      };

      if (firstSystem === lastSystem) {
        renderTie({
          first_note: first.note,
          last_note: last.note,
          first_indices: firstIndices,
          last_indices: lastIndices,
        });
      } else {
        renderTie({
          first_note: first.note,
          last_note: null,
          first_indices: firstIndices,
          last_indices: firstIndices,
        });
        renderTie({
          first_note: null,
          last_note: last.note,
          first_indices: lastIndices,
          last_indices: lastIndices,
        });
      }
    });
  }

  function drawSystemConnectors(VF, context, topStave, bottomStave, layout) {
    if (!bottomStave) return;
    new VF.StaveConnector(topStave, bottomStave)
      .setType(VF.StaveConnector.type.SINGLE_LEFT)
      .setContext(context)
      .draw();
    new VF.StaveConnector(topStave, bottomStave)
      .setType(
        layout === "satb"
          ? VF.StaveConnector.type.BRACKET
          : VF.StaveConnector.type.BRACE
      )
      .setContext(context)
      .draw();
  }

  function layoutName(layout) {
    return {
      treble: "treble staff",
      bass: "bass staff",
      satb: "SATB score on treble and bass staves",
      piano: "piano grand staff",
      grand: "grand staff",
    }[layout];
  }

  function accessibleLabel(score, layout, showAnswer) {
    if (showAnswer && score.modelAccessibleLabel) return score.modelAccessibleLabel;
    if (!showAnswer && score.accessibleLabel) return score.accessibleLabel;
    const mode = showAnswer ? "Model answer" : "Question";
    const completion =
      score.completion && !showAnswer
        ? " Only the supplied notes are shown; complete the missing parts on paper."
        : "";
    return `${mode} musical extract: ${layoutName(layout)} in ${score.key}.${completion}`;
  }

  function prepareSystemLayouts(
    systems,
    score,
    layout,
    harmonicEvents,
    brackets,
    noteAnnotations,
    showAnswer,
    hasTwoStaves
  ) {
    let yOffset = 0;
    systems.forEach((system) => {
      const eventIndices = new Set(
        system.measures.flatMap((measure) =>
          measure.events.map((event) => event._index)
        )
      );
      const systemHarmonicEvents = harmonicEvents.filter((event) =>
        eventIndices.has(event._index) && event.analysisBox !== false
      );
      const hasTopBoxes = systemHarmonicEvents.some(
        (event) =>
          (event.labelPosition || score.labelPosition || "bottom") === "top"
      );
      const hasBottomBoxes = systemHarmonicEvents.some(
        (event) =>
          (event.labelPosition || score.labelPosition || "bottom") !== "top"
      );
      const hasAnnotations = noteAnnotations.some(
        (annotation) =>
          eventIndices.has(annotation._index) &&
          annotationIsVisible(annotation, showAnswer)
      );
      const hasBrackets = brackets.some(
        (bracket) =>
          [...eventIndices].some(
            (eventIndex) => eventIndex >= bracket.start && eventIndex <= bracket.end
          )
      );
      const maximumPreferredWidth = Math.max(...system.preferredWidths, 0);
      const maximumCollisions = Math.max(
        ...system.metrics.map((metric) => metric.closeCollisions),
        0
      );
      const staffDistance = hasTwoStaves
        ? layout === "satb"
          ? Math.round(
              104 + clamp((maximumPreferredWidth - 220) * 0.08, 0, 28) +
                clamp(maximumCollisions * 2, 0, 12)
            )
          : 88
        : 0;
      const topPadding =
        28 +
        (hasTopBoxes ? 42 : 0) +
        (hasAnnotations ? 28 : 0) +
        (hasBrackets ? 25 : 0);
      const bottomPadding = hasBottomBoxes ? 55 : 8;
      const height = hasTwoStaves
        ? topPadding + staffDistance + 106 + bottomPadding
        : topPadding + 92 + bottomPadding;
      system.layout = {
        yOffset,
        height,
        topPadding,
        bottomPadding,
        staffDistance,
        hasTopBoxes,
        hasBottomBoxes,
        hasAnnotations,
        hasBrackets,
        annotationY: 0,
        bracketY: 0,
      };
      yOffset += height;
    });
    return Math.max(150, yOffset + 8);
  }

  function layoutDiagnostics(anchors, references) {
    const xsBySystem = new Map();
    anchors.forEach((anchor) => {
      if (!anchor.note) return;
      if (!xsBySystem.has(anchor.systemIndex)) {
        xsBySystem.set(anchor.systemIndex, new Set());
      }
      xsBySystem.get(anchor.systemIndex).add(
        Math.round(anchor.note.getAbsoluteX() * 1000) / 1000
      );
    });
    let minimumRhythmicGap = Infinity;
    xsBySystem.forEach((values) => {
      const sorted = [...values].sort((a, b) => a - b);
      for (let index = 1; index < sorted.length; index += 1) {
        minimumRhythmicGap = Math.min(
          minimumRhythmicGap,
          sorted[index] - sorted[index - 1]
        );
      }
    });
    let maximumSatbAlignmentDelta = 0;
    references.forEach((staves) => {
      const roleReferences = [
        ...(staves.treble || []),
        ...(staves.bass || []),
      ].filter((reference) => SATB_VOICE_NAMES.includes(reference.role));
      if (roleReferences.length < 2) return;
      const xs = roleReferences.map((reference) =>
        reference.note.getTickContext?.().getX?.() ??
          reference.note.getAbsoluteX()
      );
      maximumSatbAlignmentDelta = Math.max(
        maximumSatbAlignmentDelta,
        Math.max(...xs) - Math.min(...xs)
      );
    });
    return {
      minimumRhythmicGap: Number.isFinite(minimumRhythmicGap)
        ? minimumRhythmicGap
        : null,
      maximumSatbAlignmentDelta,
    };
  }

  function render(target, score, options = {}) {
    const VF = getVexFlow();
    const showAnswer = Boolean(options.showAnswer);
    const layout = score.layout || options.layout || "grand";
    const hasTwoStaves = !["treble", "bass"].includes(layout);
    const measuredWidth =
      options.width ||
      target.getBoundingClientRect().width ||
      target.closest(".paper")?.getBoundingClientRect().width ||
      900;
    const width = Math.round(clamp(measuredWidth, MIN_RENDER_WIDTH, MAX_RENDER_WIDTH));
    const normalizedScore = normalizeMeasures(score);
    validateScoreData(normalizedScore, layout);
    const harmonicEvents = normalizeHarmonicEvents(score, normalizedScore);
    const brackets = normalizeBrackets(score, normalizedScore);
    const noteAnnotations = normalizeNoteAnnotations(score, normalizedScore);
    validateHarmonicEvents(normalizedScore, harmonicEvents);
    const systemBuild = buildSystems(
      normalizedScore,
      score,
      width,
      layout,
      harmonicEvents,
      noteAnnotations
    );
    const systems = systemBuild.systems;
    const events = normalizedScore.measures.flatMap((measure) => measure.events);
    const notationEvents = normalizedScore.measures.flatMap((measure) =>
      measure.voiceStreams
        ? SATB_VOICE_NAMES.flatMap(
            (voiceName) => measure.voiceStreams[voiceName]
          )
        : measure.events
    );

    const analysisPosition = (event) =>
      event.labelPosition || score.labelPosition || "bottom";
    const height = prepareSystemLayouts(
      systems,
      score,
      layout,
      harmonicEvents,
      brackets,
      noteAnnotations,
      showAnswer,
      hasTwoStaves
    );

    target.replaceChildren();
    target.classList.add("notation-score");
    target.setAttribute("role", "img");
    target.setAttribute("aria-label", accessibleLabel(score, layout, showAnswer));
    target.dataset.layout = layout;
    target.dataset.renderer = `VexFlow ${VEXFLOW_VERSION}`;
    target.dataset.scoreMode = showAnswer ? "model" : "question";
    target.dataset.systemCount = String(systems.length);
    target.dataset.notationStructure =
      normalizedScore.mode === "explicit"
        ? "explicit-measures"
        : "legacy-harmonic-events";
    target.dataset.measureCount = String(
      normalizedScore.mode === "explicit" ? normalizedScore.measures.length : 0
    );
    target.dataset.eventCount = String(events.length);
    target.dataset.dottedEventCount = String(
      notationEvents.filter(
        (event) => durationDetails(event.duration || "q").dots > 0
      ).length
    );
    target.dataset.restEventCount = String(
      notationEvents.filter(
        (event) =>
          event.rest ||
          eventIsRest(event, "treble") ||
          eventIsRest(event, "bass") ||
          (event.voiceRests || []).length > 0
      ).length
    );
    target.dataset.independentVoiceMeasureCount = String(
      normalizedScore.measures.filter((measure) => measure.voiceStreams).length
    );
    target.dataset.harmonicEventCount = String(harmonicEvents.length);
    target.dataset.analysisBoxCount = String(
      harmonicEvents.filter((event) => event.analysisBox !== false).length
    );
    target.dataset.noteAnnotationCount = String(
      noteAnnotations.filter((annotation) =>
        annotationIsVisible(annotation, showAnswer)
      ).length
    );
    target.dataset.measurePreferredWidths = JSON.stringify(
      systems.flatMap((system) => system.preferredWidths.map(Math.round))
    );
    target.dataset.measureWidths = JSON.stringify(
      systems.flatMap((system) => system.measureWidths.map(Math.round))
    );
    target.dataset.systemMeasureCounts = JSON.stringify(
      systems.map((system) => system.measures.length)
    );

    const caption = document.createElement("div");
    caption.className = "score-caption";
    caption.setAttribute("aria-hidden", "true");
    caption.textContent = score.caption || `Original practice extract • ${score.key}`;
    const canvas = document.createElement("div");
    canvas.className = "notation-canvas";
    canvas.setAttribute("aria-hidden", "true");
    target.append(caption, canvas);

    const renderer = new VF.Renderer(canvas, VF.Renderer.Backends.SVG);
    renderer.resize(width, height);
    const context = renderer.getContext();
    context.setFillStyle("#172033");
    context.setStrokeStyle("#172033");

    const references = new Map();
    const anchors = new Map();
    const allVoiceBundles = [];
    let absoluteMeasureIndex = 0;

    systems.forEach((system, systemIndex) => {
      const systemMeasures = system.measures;
      const systemLayout = system.layout;
      const topY = systemLayout.yOffset + systemLayout.topPadding;
      const bottomY = hasTwoStaves
        ? topY + systemLayout.staffDistance
        : topY;
      let firstTopStave = null;
      let firstBottomStave = null;
      let measureX = systemBuild.leftMargin;

      systemMeasures.forEach((measure, measureIndexInSystem) => {
        const staveWidth = system.measureWidths[measureIndexInSystem];
        const x = measureX;
        measureX += staveWidth;
        const isLegacy = normalizedScore.mode === "legacy";
        const isFinalMeasure =
          absoluteMeasureIndex === normalizedScore.measures.length - 1;
        const topClef = layout === "bass" ? "bass" : "treble";
        const topStave = new VF.Stave(x, topY, staveWidth);
        topStave.setBegBarType(
          barlineType(
            VF,
            measure.beginBarline,
            isLegacy
              ? VF.Barline.type.NONE
              : measureIndexInSystem === 0
                ? VF.Barline.type.SINGLE
                : VF.Barline.type.NONE
          )
        );
        topStave.setEndBarType(
          barlineType(
            VF,
            measure.endBarline,
            isLegacy
              ? VF.Barline.type.NONE
              : isFinalMeasure
                ? VF.Barline.type.END
                : VF.Barline.type.SINGLE
          )
        );
        addStaveModifiers(
          topStave,
          topClef,
          measure,
          systemIndex,
          measureIndexInSystem,
          normalizedScore.mode
        );
        topStave.setContext(context).draw();

        let bottomStave = null;
        if (hasTwoStaves) {
          bottomStave = new VF.Stave(x, bottomY, staveWidth);
          bottomStave.setBegBarType(
            barlineType(
              VF,
              measure.beginBarline,
              isLegacy
                ? VF.Barline.type.NONE
                : measureIndexInSystem === 0
                  ? VF.Barline.type.SINGLE
                  : VF.Barline.type.NONE
            )
          );
          bottomStave.setEndBarType(
            barlineType(
              VF,
              measure.endBarline,
              isLegacy
                ? VF.Barline.type.NONE
                : isFinalMeasure
                  ? VF.Barline.type.END
                  : VF.Barline.type.SINGLE
            )
          );
          addStaveModifiers(
            bottomStave,
            "bass",
            measure,
            systemIndex,
            measureIndexInSystem,
            normalizedScore.mode
          );
          bottomStave.setContext(context).draw();
        }

        if (bottomStave && topStave.setNoteStartX && bottomStave.setNoteStartX) {
          const sharedNoteStartX = Math.max(
            topStave.getNoteStartX(),
            bottomStave.getNoteStartX()
          );
          topStave.setNoteStartX(sharedNoteStartX);
          bottomStave.setNoteStartX(sharedNoteStartX);
        }

        if (!firstTopStave) {
          firstTopStave = topStave;
          firstBottomStave = bottomStave;
          const topLineY = topStave.getYForLine(0);
          systemLayout.annotationY =
            topLineY - 18 - (systemLayout.hasTopBoxes ? 42 : 0);
          systemLayout.bracketY =
            topLineY - 25 -
            (systemLayout.hasTopBoxes ? 42 : 0) -
            (systemLayout.hasAnnotations ? 28 : 0);
          system.firstTopStave = topStave;
          system.firstBottomStave = bottomStave;
        }

        const topStaffName = layout === "bass" ? "bass" : "treble";
        const topBundles = buildStaffVoices(
          VF,
          measure.events,
          topStaffName,
          topStave,
          layout,
          showAnswer,
          measure.effectiveTimeSignature,
          references,
          normalizedScore.mode,
          measure
        );
        const bottomBundles = bottomStave
          ? buildStaffVoices(
              VF,
              measure.events,
              "bass",
              bottomStave,
              layout,
              showAnswer,
              measure.effectiveTimeSignature,
              references,
              normalizedScore.mode,
              measure
            )
          : [];
        const bundles = [...topBundles, ...bottomBundles];
        const voices = bundles.map((bundle) => bundle.voice);
        VF.Accidental.applyAccidentals(
          topBundles.map((bundle) => bundle.voice),
          keySignatureForStaff(measure.effectiveKeySignature, topStaffName)
        );
        if (bottomBundles.length) {
          VF.Accidental.applyAccidentals(
            bottomBundles.map((bundle) => bundle.voice),
            keySignatureForStaff(measure.effectiveKeySignature, "bass")
          );
        }
        const formatter = new VF.Formatter();
        // Join every active voice into one rhythmic tick grid. Notes remain
        // attached to their own stave, so collision handling is still local,
        // while coincident SATB onsets receive the same horizontal position.
        formatter.joinVoices(voices);
        if (formatter.preCalculateMinTotalWidth) {
          system.metrics[measureIndexInSystem].vexflowMinimumWidth =
            formatter.preCalculateMinTotalWidth(voices);
        }
        formatter.formatToStave(voices, topStave, {
          align_rests: true,
          stave: topStave,
        });

        topBundles.forEach((bundle) => bundle.voice.draw(context, topStave));
        bottomBundles.forEach((bundle) =>
          bundle.voice.draw(context, bottomStave)
        );
        bundles.forEach((bundle) => {
          bundle.systemIndex = systemIndex;
          bundle.measureIndex = measure.index;
          allVoiceBundles.push(bundle);
        });

        measure.events.forEach((event, eventIndexInMeasure) => {
          const eventReferences = references.get(event._index);
          let anchorNote =
            eventReferences?.treble?.[0]?.note ||
            eventReferences?.bass?.[0]?.note;
          if (!anchorNote && measure.voiceStreams) {
            const beatSpan =
              measure.expectedBeats || measure.effectiveTimeSignature.numerator;
            const startX = topStave.getNoteStartX();
            const endX = topStave.getNoteEndX();
            const proportionalX =
              startX + ((event._beat - 1) / beatSpan) * (endX - startX);
            anchorNote = { getAbsoluteX: () => proportionalX };
          }
          anchorNote ||= topBundles[0]?.tickables[eventIndexInMeasure] ||
            bottomBundles[0]?.tickables[eventIndexInMeasure];
          anchors.set(event._index, {
            note: anchorNote,
            topStave,
            bottomStave: bottomStave || topStave,
            systemIndex,
            systemLayout,
          });
        });
        absoluteMeasureIndex += 1;
      });

      drawSystemConnectors(
        VF,
        context,
        firstTopStave,
        firstBottomStave,
        layout
      );
    });

    if (normalizedScore.mode === "explicit") {
      allVoiceBundles.forEach((bundle) => {
        const beamOptions = {
          beam_rests: false,
          beam_middle_only: true,
          maintain_stem_directions: layout === "satb",
        };
        if (VF.Beam.getDefaultBeamGroups) {
          beamOptions.groups = VF.Beam.getDefaultBeamGroups(
            bundle.timeSignature.text
          );
        }
        VF.Beam.generateBeams(bundle.tickables, beamOptions)
          .forEach((beam) => beam.setContext(context).draw());
      });
    }
    drawTies(
      VF,
      context,
      [...(score.ties || []), ...independentSatbTies(normalizedScore)],
      references,
      anchors
    );

    const diagnostics = layoutDiagnostics(anchors, references);
    target.dataset.minimumRhythmicGap =
      diagnostics.minimumRhythmicGap == null
        ? ""
        : diagnostics.minimumRhythmicGap.toFixed(3);
    target.dataset.maximumSatbAlignmentDelta =
      diagnostics.maximumSatbAlignmentDelta.toFixed(3);
    target.dataset.interStaffDistances = JSON.stringify(
      systems.map((system) => system.layout.staffDistance)
    );
    target.dataset.measureVexflowMinimumWidths = JSON.stringify(
      systems.flatMap((system) =>
        system.metrics.map((metric) =>
          Math.round(metric.vexflowMinimumWidth || 0)
        )
      )
    );

    const svg = canvas.querySelector("svg");
    if (svg) {
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      svg.setAttribute("preserveAspectRatio", "xMidYMin meet");
      svg.setAttribute("aria-hidden", "true");
      svg.setAttribute("focusable", "false");
      svg.removeAttribute("width");
      svg.removeAttribute("height");
      svg.style.width = "100%";
      svg.style.height = "auto";
      svg.style.maxWidth = "100%";
      canvas.style.width = "100%";
      canvas.style.maxWidth = "100%";

      const decorationGroup = createSvgElement("g", {
        class: "score-decorations",
        "aria-hidden": "true",
      });
      brackets.forEach((bracket) =>
        drawBracket(
          decorationGroup,
          bracket,
          anchors,
          systems.length,
          width
        )
      );
      harmonicEvents.forEach((harmonicEvent) => {
        if (harmonicEvent.analysisBox === false) return;
        const anchor = anchors.get(harmonicEvent._index);
        if (!anchor) return;
        const label = showAnswer
          ? harmonicEvent.modelLabel ||
            harmonicEvent.chordSymbol ||
            harmonicEvent.romanNumeral ||
            ""
          : harmonicEvent.questionLabel || "";
        drawAnalysisBox(
          decorationGroup,
          anchor,
          label,
          showAnswer,
          analysisPosition(harmonicEvent),
          width
        );
      });
      let resolvedAnnotationCount = 0;
      noteAnnotations.forEach((annotation) => {
        if (drawNoteAnnotation(
          VF,
          decorationGroup,
          annotation,
          references,
          anchors,
          showAnswer,
          width
        )) {
          resolvedAnnotationCount += 1;
        }
      });
      systems.forEach((system, systemIndex) =>
        drawVoiceLabels(
          decorationGroup,
          score,
          system.firstTopStave,
          system.firstBottomStave,
          systemIndex
        )
      );
      svg.appendChild(decorationGroup);
      target.dataset.resolvedNoteAnnotationCount = String(
        resolvedAnnotationCount
      );
      target.dataset.systemTopStaffYs = JSON.stringify(
        systems.map((system) => system.firstTopStave.getYForLine(0))
      );
    }

    return {
      width,
      height,
      systems: systems.length,
      version: VEXFLOW_VERSION,
      notationStructure: target.dataset.notationStructure,
    };
  }

  window.CadenceScoreRenderer = Object.freeze({
    render,
    version: VEXFLOW_VERSION,
    parsePitch,
    parseChordSymbol,
    pitchClass,
    normalizeDuration,
    durationInBeats,
    normalizeMeasures,
    normalizeHarmonicEvents,
    normalizeBrackets,
    normalizeNoteAnnotations,
    estimateMeasureWidth,
    validateChordIdentification,
  });
})();
