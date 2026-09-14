(function () {
  "use strict";

  const data = window.CadenceData;
  if (!data?.questions) {
    throw new Error("Cadence Lab question bank must load before the 2024 Q3(b) reference.");
  }
  const question = data.questions.find(
    (candidate) => candidate.id === "nzqa-2024-commercial-piano"
  );
  if (!question) throw new Error("Missing nzqa-2024-commercial-piano");

  const note = (pitch, duration, details = {}) => ({ pitch, duration, ...details });
  const chord = (pitches, duration, details = {}) => ({ pitches, duration, ...details });
  const rest = (duration, details = {}) => ({ duration, rest: true, ...details });
  const voice = (role, stemDirection, events, details = {}) => ({
    role,
    stemDirection,
    events,
    ...details,
  });
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const staffMeasure = (vocalEvents, trebleVoices, bassVoices, details = {}) => ({
    ...details,
    staffVoices: {
      vocal: [voice("vocal", "auto", vocalEvents)],
      treble: trebleVoices,
      bass: bassVoices,
    },
  });
  const pianoChordVoice = (events) => [voice("piano-chords", "up", events)];
  const pianoBassVoice = (events) => [voice("piano-bass", "up", events)];
  const repeatedChords = (pitches) => [
    chord(pitches, "q"), chord(pitches, "q"), chord(pitches, "q"),
  ];
  const heldBass = (pitch, finalPitch = pitch) => [
    note(pitch, "h", { tieToNext: true }),
    note(pitch, "8d"),
    note(finalPitch, "16"),
  ];

  // NZQA 2024 examination p. 10 and assessment schedule p. 10,
  // Extract Seven, Phillip Norman, "Love is Commercial", bars 32–40.
  // Bars 33–39 retain the complete published schedule realisation here, but
  // questionStaffVoices deliberately masks both piano staves in that region.
  const measures = [
    staffMeasure(
      [note("B3", "q"), note("D4", "qd"), note("E4", "8")],
      pianoChordVoice(repeatedChords(["A3", "C#4", "E4", "G4"])),
      pianoBassVoice(heldBass("D2", "C#2"))
    ),
    staffMeasure(
      [
        note("D4", "16"), note("C#4", "16"),
        note("B3", "8", { tieToNext: true }), note("B3", "q"), rest("q"),
      ],
      pianoChordVoice(repeatedChords(["A3", "Cn4", "D4", "F#4"])),
      pianoBassVoice(heldBass("F#2", "F#1"))
    ),
    staffMeasure(
      [
        note("Cn4", "16"), note("B3", "16"),
        note("A3", "8", { tieToNext: true }), note("A3", "q"), note("B3", "q"),
      ],
      pianoChordVoice([
        chord(["B3", "D4", "Fn4", "G4"], "q"),
        chord(["B3", "D4", "Fn4", "G4"], "q"),
        chord(["Fn3", "G3", "B3", "D4"], "q"),
      ]),
      pianoBassVoice(heldBass("G1")),
      { systemBreakAfter: true }
    ),
    staffMeasure(
      [note("D4", "h"), rest("q")],
      pianoChordVoice([
        chord(["A3", "D4", "F#4"], "q"),
        chord(["B3", "D4", "G4"], "q"),
        chord(["G#3", "B3", "D4", "Fn4"], "q"),
      ]),
      pianoBassVoice([note("D2", "q"), note("E2", "q"), note("G#2", "q")])
    ),
    staffMeasure(
      [note("F#4", "h"), note("A4", "q")],
      pianoChordVoice(repeatedChords(["A3", "C#4", "F#4"])),
      pianoBassVoice(heldBass("F#2", "F#1"))
    ),
    staffMeasure(
      [
        note("B4", "16"), note("A4", "16"),
        note("G4", "8", { tieToNext: true }), note("G4", "h"),
      ],
      pianoChordVoice(repeatedChords(["B3", "D4", "G4"])),
      pianoBassVoice(heldBass("G1")),
      { systemBreakAfter: true }
    ),
    staffMeasure(
      [note("D4", "h"), note("B4", "q")],
      pianoChordVoice(repeatedChords(["G#3", "B3", "D4", "E4"])),
      pianoBassVoice(heldBass("G#1"))
    ),
    staffMeasure(
      [note("E5", "h"), rest("q")],
      pianoChordVoice(repeatedChords(["A3", "C#4", "E4", "G4", "B4"])),
      pianoBassVoice([note("A1", "q"), note("A2", "q"), note("F#2", "q")])
    ),
    staffMeasure(
      [note("E5", "h"), note("B4", "q")],
      pianoChordVoice(repeatedChords(["G3", "B3", "D4", "F#4"])),
      pianoBassVoice(heldBass("F#2", "F#1")),
      { endBarline: "final", systemBreakAfter: true }
    ),
  ];

  measures.forEach((measure, index) => {
    measure.questionStaffVoices = [0, 8].includes(index)
      ? clone(measure.staffVoices)
      : {
          vocal: clone(measure.staffVoices.vocal),
          treble: [],
          bass: [],
        };
  });

  const chordLabels = [
    { measure: 2, beat: 1, label: "D7/F♯", symbol: "D7/F#", validationPitches: ["F#2", "A3", "Cn4", "D4", "F#4"] },
    { measure: 3, beat: 1, label: "G7", symbol: "G7", validationPitches: ["G1", "B3", "D4", "Fn4"] },
    { measure: 4, beat: 1, label: "D", symbol: "D", validationPitches: ["D2", "A3", "D4", "F#4"] },
    { measure: 4, beat: 2, label: "Em7", symbol: "Em7", validationPitches: ["E2", "B3", "D4", "G4"] },
    { measure: 4, beat: 3, label: "G♯dim7", symbol: "G#dim7", validationPitches: ["G#2", "G#3", "B3", "D4", "Fn4"] },
    { measure: 5, beat: 1, label: "F♯m", symbol: "F#m", validationPitches: ["F#2", "A3", "C#4", "F#4"] },
    { measure: 6, beat: 1, label: "G", symbol: "G", validationPitches: ["G1", "B3", "D4", "G4"] },
    { measure: 7, beat: 1, label: "E7/G♯", symbol: "E7/G#", validationPitches: ["G#1", "G#3", "B3", "D4", "E4"] },
    { measure: 8, beat: 1, label: "A9", symbol: "A9", validationPitches: ["A1", "A3", "C#4", "E4", "G4", "B4"] },
  ];
  const harmonicEvents = chordLabels.map((item) => ({
    measure: item.measure,
    beat: item.beat,
    analysisBox: false,
    answerRole: "supplied",
    questionLabel: item.label,
    modelLabel: item.label,
    chordSymbol: item.symbol,
    validationPitches: item.validationPitches,
    validationScope: "onset",
    bassPitch: item.symbol.includes("/") ? item.validationPitches[0] : undefined,
  }));
  const sourceChordLabels = chordLabels.map(({ measure, beat, label }) => ({
    measure,
    beat,
    label,
  }));
  const lyrics = [
    [1, 1, "Love"], [1, 2, "is"], [1, 2.5, "comm-"],
    [2, 1, "er-"], [2, 1.5, "cial__"],
    [3, 1, "Love____"], [3, 3, "means"],
    [4, 1, "cash"], [5, 1, "Love"], [5, 3, "can"],
    [6, 1, "help"], [6, 1.5, "you__"],
    [7, 1, "Build"], [7, 3, "a"], [8, 1, "stash"],
    [9, 1, "if"], [9, 3, "your"],
  ].map(([measure, beat, text]) => ({ measure, beat, text }));

  const staffNames = ["vocal", "treble", "bass"];
  const durationText = (event) => event.tuplet
    ? `${event.duration}{${event.tuplet.numNotes}:${event.tuplet.notesOccupied}}`
    : event.duration;
  const staffSignature = (sourceName, mapper) => measures.map((measure) =>
    Object.fromEntries(staffNames.map((staff) => [
      staff,
      (measure[sourceName]?.[staff] || []).map((stream) =>
        stream.events.map(mapper).join(" ")
      ),
    ]))
  );
  const staffCounts = (sourceName) => measures.map((measure) =>
    Object.fromEntries(staffNames.map((staff) => [
      staff,
      (measure[sourceName]?.[staff] || []).map((stream) => stream.events.length),
    ]))
  );
  const pitchText = (event) => event.rest
    ? "_"
    : (event.pitches || (event.pitch ? [event.pitch] : [])).join("+");
  const tieText = (event) => event.tieToNext ? "1" : "0";
  const beamPolicies = (sourceName) => measures.map((measure) =>
    Object.fromEntries(staffNames.map((staff) => [
      staff,
      (measure[sourceName]?.[staff] || []).map((stream) => ({
        role: stream.role,
        beam: stream.beam !== false,
        beamGroups: stream.beamGroups || null,
      })),
    ]))
  );

  Object.assign(question, {
    category: "piano",
    family: "Piano completion",
    sourceType: "nzqa-reference",
    source: {
      provider: "NZQA",
      year: 2024,
      question: "Question Three",
      part: "(b)",
      extract: "Extract Seven",
      creator: "Phillip Norman",
      title: "Love is Commercial",
      bars: "32–40",
      sourceKind: "official-exam",
      location: "bars 32–40, exam p. 10; schedule p. 10",
      acknowledgement: "Teaching transcription of the named NZQA 2024 examination extract; learner-visible notation was checked against the question paper and the model completion against the published assessment schedule.",
    },
    title: "Reference: Phillip Norman piano completion",
    internalTitle: "Reference: Phillip Norman piano completion",
    studentTitle: "Reference: complete the printed piano texture on paper",
    context: "Complete the piano harmony in bars 33–39 using the nine printed chord indications and the style established in bar 32. Keep the printed vocal line unchanged.",
    studentContext: "Complete the piano harmony in bars 33–39 using the nine printed chord indications and the style established in bar 32. Keep the printed vocal line unchanged.",
    hiddenConceptTerms: [],
    tasks: { A: [], M: [], E: [] },
    sourceSpec: {
      transcriptionMode: "exact",
      year: 2024,
      provider: "NZQA",
      question: "Question Three",
      part: "(b)",
      bars: "32–40",
      printedBars: "32–40",
      printedMeasureCount: 9,
      printedBarNumbers: Array.from({ length: 9 }, (_, index) => index + 32),
      staffLayout: "vocal-piano",
      staffNames,
      staffLabels: ["Voice", "Piano"],
      keyCentres: ["D major"],
      timeSignature: "3/4",
      tempoMarking: "♩ = 86",
      dynamics: [{ bar: 32, beat: 1, text: "mf" }],
      sourceChordLabels: sourceChordLabels.map((item) => item.label),
      chordSymbols: chordLabels.map((item) => item.symbol),
      suppliedLabels: sourceChordLabels.map((item) => item.label),
      completionHarmony: sourceChordLabels.map((item) => item.label),
      analysisPositions: 9,
      answerPositions: 0,
      expectedChordCount: 9,
      perMeasureStaffVoiceEventCounts: staffCounts("staffVoices"),
      staffVoiceRhythmSignatures: staffSignature("staffVoices", durationText),
      staffVoicePitchSignatures: staffSignature("staffVoices", pitchText),
      staffVoiceTieSignatures: staffSignature("staffVoices", tieText),
      staffVoiceBeamPolicies: beamPolicies("staffVoices"),
      questionStaffVoiceEventCounts: staffCounts("questionStaffVoices"),
      questionStaffVoiceRhythmSignatures: staffSignature("questionStaffVoices", durationText),
      questionStaffVoicePitchSignatures: staffSignature("questionStaffVoices", pitchText),
      questionStaffVoiceTieSignatures: staffSignature("questionStaffVoices", tieText),
      questionStaffVoiceBeamPolicies: beamPolicies("questionStaffVoices"),
      sourceLyrics: clone(lyrics),
      analysisLocations: sourceChordLabels.map((item) => ({
        bar: item.measure + 31,
        beat: item.beat,
        answerRole: "supplied",
      })),
      completionContract: {
        suppliedMeasure: 1,
        trailingSuppliedMeasure: 9,
        targetMeasures: [2, 3, 4, 5, 6, 7, 8],
        chordsToRealise: 9,
        harmonicIndications: 9,
        blankTargetStaffVoices: ["treble", "bass"],
        retainVocalLine: true,
      },
      learnerContract: {
        suppliedStyleBar: 32,
        targetBars: [33, 34, 35, 36, 37, 38, 39],
        suppliedReturnBar: 40,
        visibleModelPianoPitchesInTargetBeforeSubmit: 0,
        modelRevealUsesPublishedScheduleRealisation: true,
      },
    },
    score: {
      key: "D major",
      keySignature: "D",
      timeSignature: "3/4",
      showTimeSignature: true,
      layout: "vocal-piano",
      completion: true,
      measuresPerSystem: 3,
      authoredSystemBreaks: true,
      authoredBreakMinWidth: 620,
      minimumEngravingWidth: 760,
      barNumbers: Array.from({ length: 9 }, (_, index) => index + 32),
      barNumberMode: "system-start",
      sourceKeyCentres: ["D major"],
      staffLabels: { vocal: "Voice", piano: "Piano" },
      caption: "NZQA examination reference • 2024 Question Three (b), Extract Seven • bars 32–40",
      studentCaption: "NZQA examination reference • 2024 Question Three (b) • printed piano-completion score",
      modelCaption: "Published schedule sample realisation • 2024 Question Three (b)",
      accessibleLabel: "Question musical extract: vocal line and piano grand staff for the 2024 NZQA piano-completion task.",
      measures,
      harmonicEvents,
      sourceChordLabels,
      lyrics,
      sourceTextAnnotations: [
        { measure: 1, beat: 1, staff: "vocal", position: "above", text: "♩ = 86", italic: false },
        { measure: 1, beat: 1, staff: "treble", text: "mf", bold: true },
      ],
    },
    interaction: {
      type: "paper-completion",
      allowPaper: true,
      completionType: "piano",
      targetMeasures: [2, 3, 4, 5, 6, 7, 8],
      chordsToRealise: 9,
      completionRequirements: {
        suppliedStyleMeasure: 1,
        targetMeasures: [2, 3, 4, 5, 6, 7, 8],
        suppliedReturnMeasure: 9,
        chordsToRealise: 9,
        retainVocalLine: true,
      },
      selfCheck: [
        "I retained the printed vocal line and completed only the piano staves in bars 33–39.",
        "My piano writing realises all nine printed chord indications at their printed positions.",
        "My rhythm, register and voicing continue the style established in bar 32.",
      ],
      printOrientation: "landscape",
    },
    answerHeading: "One possible model completion",
    answer: [
      "The published schedule sample realises D7/F♯–G7–D–Em7–G♯dim7–F♯m–G–E7/G♯–A9 while retaining the printed vocal line and the piano rhythm, register and voicing style established in bar 32. Other stylistically appropriate realisations are possible.",
    ],
  });
})();
