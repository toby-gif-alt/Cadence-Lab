(function () {
  "use strict";

  const data = window.CadenceData;
  if (!data?.questions) {
    throw new Error("Cadence Lab question bank must load before the 2024 Q3(a) reference.");
  }

  const question = data.questions.find(
    (candidate) => candidate.id === "nzqa-2024-commercial-chromatic-bass"
  );
  if (!question) throw new Error("Missing nzqa-2024-commercial-chromatic-bass");

  const note = (pitch, duration, details = {}) => ({ pitch, duration, ...details });
  const chord = (pitches, duration, details = {}) => ({ pitches, duration, ...details });
  const rest = (duration, details = {}) => ({ duration, rest: true, ...details });
  const voice = (role, stemDirection, events, details = {}) => ({
    role,
    stemDirection,
    events,
    ...details,
  });
  const staffMeasure = (vocalEvents, trebleVoices, bassVoices, details = {}) => ({
    ...details,
    staffVoices: {
      vocal: [voice("vocal", "auto", vocalEvents, { beam: false })],
      treble: trebleVoices,
      bass: bassVoices,
    },
  });
  const repeatedTreble = (pitches) => [
    voice("piano-chords", "down", [
      chord(pitches, "q"),
      rest("8"),
      chord(pitches, "8", { tieToNext: true }),
      chord(pitches, "h"),
    ]),
  ];
  const repeatedBass = (pitches) => [
    voice("piano-bass", "down", [
      chord(pitches, "q"),
      rest("8"),
      chord(pitches, "8", { tieToNext: true }),
      chord(pitches, "h"),
    ]),
  ];

  // NZQA 2024 examination pp. 8–9, Extract Six, bars 16–28.
  // The three independent staves preserve the printed vocal rhythm and the
  // piano's separate upper, inner and bass surfaces.
  const measures = [
    staffMeasure(
      [note("F#4", "8"), note("A4", "8"), note("B4", "8"), note("C#5", "8", { tieToNext: true }), note("C#5", "8"), note("B4", "8"), note("A4", "q")],
      repeatedTreble(["C#4", "F#4"]),
      repeatedBass(["D3", "A3"])
    ),
    staffMeasure(
      [note("F#4", "8"), note("A4", "8"), note("B4", "8"), note("C#5", "8", { tieToNext: true }), note("C#5", "q"), rest("q")],
      repeatedTreble(["C#4", "F#4"]),
      repeatedBass(["D3", "A3"])
    ),
    staffMeasure(
      [note("F#4", "8"), note("A4", "8"), note("B4", "8"), note("C#5", "8", { tieToNext: true }), note("C#5", "8"), note("B4", "8"), note("A4", "q")],
      repeatedTreble(["C#4", "F#4"]),
      repeatedBass(["D3", "A3"]),
      { systemBreakAfter: true }
    ),
    staffMeasure(
      [note("G#4", "hd"), rest("q")],
      repeatedTreble(["B3", "D#4", "E4"]),
      repeatedBass(["C#3", "G#3"])
    ),
    staffMeasure(
      [note("F#4", "8"), note("A4", "8"), note("B4", "8"), note("C#5", "8", { tieToNext: true }), note("C#5", "8"), note("B4", "8"), note("A4", "q")],
      repeatedTreble(["A3", "C#4", "F#4"]),
      repeatedBass(["D3", "F#3"])
    ),
    staffMeasure(
      [note("F#4", "8"), note("A4", "8"), note("B4", "8"), note("C#5", "8", { tieToNext: true }), note("C#5", "q"), rest("q")],
      repeatedTreble(["A3", "C#4", "F#4"]),
      repeatedBass(["B2", "D3", "F#3"])
    ),
    staffMeasure(
      [note("F#4", "8"), note("G#4", "8"), note("A4", "8"), note("B4", "8", { tieToNext: true }), note("B4", "8"), note("A4", "8"), note("B4", "q")],
      [voice("piano-chords", "down", [
        chord(["A3", "C#4", "F#4"], "q"),
        rest("8"),
        chord(["B3", "D4", "G#4"], "8", { tieToNext: true }),
        chord(["B3", "D4", "G#4"], "h"),
      ])],
      [voice("piano-bass", "down", [
        chord(["B2", "D3", "F#3"], "q"),
        rest("8"),
        chord(["B2", "G#3"], "8", { tieToNext: true }),
        chord(["B2", "G#3"], "h"),
      ])],
      { systemBreakAfter: true }
    ),
    staffMeasure(
      [note("C#5", "hd"), rest("q")],
      [voice("piano-chords", "down", [
        chord(["B3", "C#4", "F#4", "G#4"], "q"),
        rest("8"),
        chord(["B3", "C#4", "E#4", "G#4"], "8", { tieToNext: true }),
        chord(["B3", "C#4", "E#4", "G#4"], "h"),
      ])],
      repeatedBass(["C#3", "G#3"])
    ),
    staffMeasure(
      [note("C#4", "8"), note("C#4", "8"), note("F#4", "8"), note("A4", "8", { tieToNext: true }), note("A4", "8"), note("G#4", "8"), note("F#4", "q")],
      repeatedTreble(["A3", "C#4", "F#4"]),
      [voice("piano-bass", "down", [
        note("F#2", "h", { tieToNext: true }),
        note("F#2", "8"),
        note("F#3", "8"),
        note("E3", "q"),
      ])]
    ),
    staffMeasure(
      [note("E#4", "8"), note("G#4", "8"), note("B4", "8"), note("D5", "8", { tieToNext: true }), note("D5", "q"), rest("q")],
      [voice("piano-figure", "up", [
        note("E#4", "8"), note("G#4", "8"), note("B4", "8"), note("D5", "8", { tieToNext: true }), note("D5", "h"),
      ], { beamGroups: ["2/4"] })],
      [voice("piano-bass", "down", [
        chord(["E#3", "B3", "D4"], "hd"),
        chord(["E#3", "B3", "D4"], "q"),
      ])],
      { systemBreakAfter: true }
    ),
    staffMeasure(
      [note("F#4", "8"), note("F#4", "q"), note("G#4", "8"), note("A4", "8"), note("G#4", "8"), note("F#4", "q")],
      [voice("piano-figure", "up", [
        note("F#4", "qd"), note("G#4", "8"), note("A4", "8"), note("G#4", "8"), chord(["F#4", "C#5"], "q", { tieToNext: true }),
      ])],
      [voice("piano-bass", "down", [
        chord(["E3", "A3", "C#4"], "qd"),
        chord(["E3", "A3", "C#4"], "8", { tieToNext: true }),
        chord(["E3", "A3", "C#4"], "h"),
      ])]
    ),
    staffMeasure(
      [note("C#4", "hd"), rest("q")],
      [voice("piano-figure", "up", [
        chord(["F#4", "C#5"], "h", { tieToNext: true }),
        chord(["F#4", "C#5"], "8"),
        note("C#4", "8"), note("D4", "8"), note("E4", "8"),
      ], { beamGroups: ["2/4"] })],
      [voice("piano-bass", "down", [
        chord(["D#3", "A3", "C#4"], "q"),
        rest("8"),
        chord(["D#3", "A3", "C#4"], "8", { tieToNext: true }),
        chord(["D#3", "A3", "C#4"], "h"),
      ])]
    ),
    staffMeasure(
      [note("F#4", "8"), note("F#4", "q"), note("G#4", "8"), note("A4", "8"), note("G#4", "8"), note("F#4", "8"), note("B4", "8")],
      repeatedTreble(["C#4", "F#4"]),
      repeatedBass(["D3", "A3"]),
      { endBarline: "final", systemBreakAfter: true }
    ),
  ];

  const chordRoute = [
    "C♯m(add9)", "Dmaj7", "Bm9", "G♯dim/B", "C♯7sus4", "C♯7",
    "F♯m", "E♯dim7", "F♯m/E", "D♯m7(♭5)", "Dmaj7",
  ];
  const chordSymbols = [
    "C#madd9", "Dmaj7", "Bm9", "G#dim/B", "C#7sus4", "C#7",
    "F#m", "E#dim7", "F#m/E", "D#m7b5", "Dmaj7",
  ];
  const chordLocations = [
    [4, 1], [5, 1], [6, 1], [7, 3], [8, 1], [8, 3],
    [9, 1], [10, 1], [11, 1], [12, 1], [13, 1],
  ];
  const validationPitches = [
    ["C#3", "E4", "G#3", "D#4"],
    ["D3", "F#3", "A3", "C#4"],
    ["B2", "D3", "F#3", "A3", "C#4"],
    ["B2", "D4", "G#4"],
    ["C#3", "F#4", "G#3", "B3"],
    ["C#3", "E#4", "G#3", "B3"],
    ["F#2", "A3", "C#4"],
    ["E#3", "G#4", "B3", "D4"],
    ["E3", "F#4", "A3", "C#4"],
    ["D#3", "F#4", "A3", "C#4"],
    ["D3", "F#4", "A3", "C#4"],
  ];
  const harmonicEvents = chordRoute.map((modelLabel, index) => ({
    measure: chordLocations[index][0],
    beat: chordLocations[index][1],
    analysisBox: true,
    answerRole: "editable",
    answerSlotId: `nzqa-2024-commercial-chromatic-bass-h${index + 1}`,
    modelLabel,
    chordSymbol: chordSymbols[index],
    validationPitches: validationPitches[index],
    validationScope: "harmonic-span",
    bassPitch: index === 3 ? "B2" : index === 8 ? "E3" : undefined,
  }));

  const lyrics = [
    [1, 1, "Where"], [1, 1.5, "would"], [1, 2, "a"], [1, 2.5, "song-"], [1, 3.5, "wri-"], [1, 4, "ter"],
    [2, 1, "be"], [2, 1.5, "with-"], [2, 2, "out"], [2, 2.5, "love?"],
    [3, 1, "Who"], [3, 1.5, "would"], [3, 2, "be"], [3, 2.5, "moved"], [3, 3.5, "by"], [3, 4, "his"],
    [4, 1, "song?"],
    [5, 1, "Who"], [5, 1.5, "can"], [5, 2, "i-"], [5, 2.5, "mag-"], [5, 3.5, "ine"], [5, 4, "T."],
    [6, 1, "V."], [6, 1.5, "with-"], [6, 2, "out"], [6, 2.5, "love?"],
    [7, 1, "“Neigh-"], [7, 1.5, "bours”"], [7, 2, "would"], [7, 2.5, "seem"], [7, 3.5, "aw-"], [7, 4, "f’lly"],
    [8, 1, "long"],
    [9, 1, "Pub-"], [9, 1.5, "lish-"], [9, 2, "ers"], [9, 2.5, "print__"], [9, 3.5, "all"], [9, 4, "those"],
    [10, 1, "books"], [10, 1.5, "a-"], [10, 2, "bout"], [10, 2.5, "love__"],
    [11, 1, "Ro-"], [11, 1.5, "mance"], [11, 2.5, "on"], [11, 3, "e-"], [11, 3.5, "ver-"], [11, 4, "y"],
    [12, 1, "page"],
    [13, 1, "Peo-"], [13, 1.5, "ple"], [13, 2.5, "are"], [13, 3, "si-"], [13, 3.5, "lly"], [13, 4, "as"], [13, 4.5, "chooks"],
  ].map(([measure, beat, text]) => ({ measure, beat, text }));

  const durationText = (event) => event.tuplet
    ? `${event.duration}{${event.tuplet.numNotes}:${event.tuplet.notesOccupied}}`
    : event.duration;
  const staffNames = ["vocal", "treble", "bass"];
  const staffSignature = (mapper) => measures.map((measure) => Object.fromEntries(
    staffNames.map((staff) => [staff, measure.staffVoices[staff].map((stream) =>
      stream.events.map(mapper).join(" ")
    )])
  ));
  const voiceCounts = measures.map((measure) => Object.fromEntries(
    staffNames.map((staff) => [staff, measure.staffVoices[staff].map((stream) => stream.events.length)])
  ));
  const rhythmSignatures = staffSignature(durationText);
  const pitchSignatures = staffSignature((event) => event.rest
    ? "_"
    : (event.pitches || (event.pitch ? [event.pitch] : [])).join("+"));
  const tieSignatures = staffSignature((event) => event.tieToNext ? "1" : "0");
  const beamPolicies = measures.map((measure) => Object.fromEntries(
    staffNames.map((staff) => [staff, measure.staffVoices[staff].map((stream) => ({
      role: stream.role,
      beam: stream.beam !== false,
      beamGroups: stream.beamGroups || null,
    }))])
  ));
  const analysisLocations = harmonicEvents.map((event) => ({
    bar: event.measure + 15,
    beat: event.beat,
    answerRole: event.answerRole,
  }));
  const deviceAnswer = "A descending chromatic bass line in bars 24–28 contrasts with the more static bass line in the previous eight bars. The change to one chord per bar creates momentum and forward direction.";

  Object.assign(question, {
    sourceType: "nzqa-reference",
    source: {
      provider: "NZQA",
      year: 2024,
      question: "Question Three",
      part: "(a)",
      extract: "Extract Six",
      creator: "Phillip Norman",
      title: "Love is Commercial",
      bars: "16–28",
      sourceKind: "official-exam",
      location: "bars 16–28, exam pp. 8–9; schedule p. 9",
      acknowledgement: "Teaching transcription of the named NZQA 2024 examination extract; learner-visible notation was checked against the question paper and model evidence against the published assessment schedule.",
    },
    family: "Jazz / rock notation",
    title: "Reference: Phillip Norman chord analysis",
    internalTitle: "Reference: Phillip Norman chord analysis",
    studentTitle: "Reference: analyse the printed chord positions",
    context: "Analyse the eleven boxed positions in bars 19–28 using jazz / rock notation. Then identify the harmonic device used in bars 24–28 and comment on its effect.",
    studentContext: "Analyse the eleven boxed positions in bars 19–28 using jazz / rock notation. Then identify the harmonic device used in bars 24–28 and comment on its effect.",
    hiddenConceptTerms: ["descending chromatic bass", "one chord per bar", "momentum", "forward direction"],
    tasks: { A: [], M: [], E: [] },
    sourceSpec: {
      transcriptionMode: "exact",
      year: 2024,
      provider: "NZQA",
      question: "Question Three",
      part: "(a)",
      bars: "16–28",
      printedBars: "16–28",
      printedMeasureCount: 13,
      printedBarNumbers: Array.from({ length: 13 }, (_, index) => index + 16),
      staffLayout: "vocal-piano",
      staffNames,
      staffLabels: ["Voice", "Piano"],
      sourceChordLabels: ["Dmaj7", "(Dmaj7)", "(Dmaj7)"],
      chordSymbols: chordRoute,
      analysisPositions: 11,
      answerPositions: 11,
      expectedChordCount: 11,
      suppliedLabels: [],
      perMeasureStaffVoiceEventCounts: voiceCounts,
      staffVoiceRhythmSignatures: rhythmSignatures,
      staffVoicePitchSignatures: pitchSignatures,
      staffVoiceTieSignatures: tieSignatures,
      staffVoiceBeamPolicies: beamPolicies,
      sourceLyrics: lyrics.map(({ measure, beat, text }) => ({ measure, beat, text })),
      analysisLocations,
      bassDescent: [
        { bar: 24, pitch: "F#2" },
        { bar: 25, pitch: "E#3" },
        { bar: 26, pitch: "E3" },
        { bar: 27, pitch: "D#3" },
        { bar: 28, pitch: "D3" },
      ],
      harmonicDeviceAcceptedAnswers: [deviceAnswer],
      learnerContract: {
        editableChordPositions: 11,
        visibleModelChordAnswersBeforeSubmit: 0,
        harmonicDevicePromptIsSpoilerSafe: true,
        modelRouteRevealedAsText: true,
      },
    },
    score: {
      key: "D major / F♯ minor area",
      keySignature: "D",
      timeSignature: "4/4",
      showTimeSignature: false,
      layout: "vocal-piano",
      measuresPerSystem: 4,
      authoredSystemBreaks: true,
      authoredBreakMinWidth: 620,
      minimumEngravingWidth: 760,
      bottomAnalysisPadding: 24,
      labelPosition: "top",
      barNumbers: Array.from({ length: 13 }, (_, index) => index + 16),
      barNumberMode: "system-start",
      staffLabels: { vocal: "Voice", piano: "Piano" },
      caption: "NZQA examination reference • 2024 Question Three (a), Extract Six • bars 16–28",
      studentCaption: "NZQA examination reference • 2024 Question Three (a) • printed analysis score",
      modelCaption: "Published schedule chord analysis • 2024 Question Three (a)",
      accessibleLabel: "Question musical extract: voice and piano score for jazz / rock chord analysis.",
      measures,
      harmonicEvents,
      sourceChordLabels: [
        { measure: 1, beat: 1, label: "Dmaj7" },
        { measure: 2, beat: 1, label: "(Dmaj7)" },
        { measure: 3, beat: 1, label: "(Dmaj7)" },
      ],
      lyrics,
    },
    interaction: {
      type: "jazz-chord-placement",
      allowPaper: true,
      advancedBuilder: true,
      showModelScore: false,
      hintBankMode: "none",
      bank: [],
      slots: harmonicEvents.map((event, index) => ({
        id: event.answerSlotId,
        harmonicIndex: index,
        label: `Bar ${event.measure + 15}${event.beat === 1 ? "" : `, beat ${event.beat}`}`,
        acceptedAnswers: [{ label: chordRoute[index] }],
      })),
      fields: [{
        id: "harmonic-device-effect",
        label: "Harmonic device and effect",
        kind: "text",
        prompt: "Identify the harmonic device used in bars 24–28 and comment on its effect.",
        acceptedAnswers: [{ label: deviceAnswer }],
      }],
    },
    answerHeading: "Published chord and harmonic-device analysis",
    answer: [
      `<strong>Published chord route:</strong> ${chordRoute.join("–")}.`,
      deviceAnswer,
    ],
  });
})();
