(function () {
  "use strict";

  const data = window.CadenceData;
  if (!data?.questions) {
    throw new Error("Cadence Lab question bank must load before the 2024 Q2 references.");
  }

  const getQuestion = (id) => {
    const question = data.questions.find((candidate) => candidate.id === id);
    if (!question) throw new Error(`Missing ${id}`);
    return question;
  };
  const note = (pitch, duration, details = {}) => ({ pitch, duration, ...details });
  const chord = (pitches, duration, details = {}) => ({ pitches, duration, ...details });
  const rest = (duration, details = {}) => ({ duration, rest: true, ...details });
  const voice = (role, stemDirection, events) => ({ role, stemDirection, events });
  const triplet = (id, details = {}) => ({
    id,
    numNotes: 3,
    notesOccupied: 2,
    bracketed: true,
    ...details,
  });
  const officialSource = (part, extract, creator, title, bars, location) => ({
    provider: "NZQA",
    year: 2024,
    question: "Question Two",
    part,
    extract,
    creator,
    title,
    bars,
    sourceKind: "official-exam",
    location,
    acknowledgement:
      "Teaching transcription of the named NZQA 2024 examination extract; learner-visible notation was checked against the question paper and model evidence against the published assessment schedule.",
  });
  const durationText = (event) => event.tuplet
    ? `${event.duration}{${event.tuplet.numNotes}:${event.tuplet.notesOccupied}}`
    : event.duration;
  const staffVoiceCounts = (measures, sourceName = "staffVoices") =>
    measures.map((measure) => Object.fromEntries(
      ["treble", "bass"].map((staff) => [
        staff,
        (measure[sourceName]?.[staff] || []).map((stream) => stream.events.length),
      ])
    ));
  const staffVoiceRhythms = (measures, sourceName = "staffVoices") =>
    measures.map((measure) => Object.fromEntries(
      ["treble", "bass"].map((staff) => [
        staff,
        (measure[sourceName]?.[staff] || []).map((stream) =>
          stream.events.map(durationText).join(" ")
        ),
      ])
    ));
  const pianoMeasure = (treble, bass, details = {}) => ({
    ...details,
    staffVoices: { treble, bass },
  });
  const blankVoice = (role, stemDirection, duration = "hd") =>
    voice(role, stemDirection, [rest(duration)]);

  // Exam p.5, Extract Four, bars 1–25. Independent streams retain the two
  // notated treble voices where the source separates melody and inner part.
  const extractFourMeasures = [
    pianoMeasure(
      [voice("melody", "up", [note("F#4", "8d"), note("A4", "16"), note("B4", "q"), note("C#5", "q")])],
      [voice("bass", "down", [note("F#2", "q"), chord(["F#3", "A3"], "q"), note("C#3", "q")])]
    ),
    pianoMeasure(
      [voice("melody", "up", [note("C#5", "8d"), note("A4", "16"), note("B4", "q"), note("C#5", "q")])],
      [voice("bass", "down", [note("E#2", "q"), chord(["G#3", "B3"], "q"), rest("q")])]
    ),
    pianoMeasure(
      [voice("melody", "up", [note("B4", "qd"), note("Gn4", "8"), note("B4", "8"), note("C#5", "8")])],
      [voice("bass", "down", [note("En2", "q"), chord(["Gn3", "A#3"], "q"), chord(["Gn3", "A#3"], "q")])]
    ),
    pianoMeasure(
      [
        voice("melody", "up", [note("B4", "8d"), note("F#4", "16"), note("A4", "q"), note("B4", "q")]),
        voice("inner", "down", [note("F#4", "h"), note("F#4", "q")]),
      ],
      [voice("bass", "down", [note("D2", "q"), chord(["F#3", "B3"], "q"), chord(["F#3", "B3"], "q")])]
    ),
    pianoMeasure(
      [
        voice("melody", "up", [chord(["F#4", "A4", "C#5"], "q", { arpeggio: "up" }), note("D5", "q"), note("C#5", "q")]),
        voice("inner", "down", [note("F#4", "q"), note("A4", "q"), note("A4", "q")]),
      ],
      [voice("bass", "down", [chord(["B1", "B2"], "q"), chord(["D3", "F#3", "B3"], "q"), chord(["D3", "F#3", "B3"], "q")])],
      { systemBreakAfter: true }
    ),
    pianoMeasure(
      [
        voice("melody", "up", [note("B4", "8d"), note("C#5", "16"), note("B4", "q"), note("A4", "8d"), note("F#4", "16")]),
        voice("inner", "down", [note("A4", "q"), chord(["G#4", "B4"], "q"), chord(["F#4", "A4"], "q")]),
      ],
      [voice("bass", "down", [chord(["C#1", "C#2"], "q"), chord(["F#3", "A3", "C#4"], "q"), chord(["F#3", "A3", "C#4"], "q")])]
    ),
    pianoMeasure(
      [
        voice("melody", "up", [note("Cn5", "qd"), note("B4", "8"), note("A4", "8"), note("G#4", "8")]),
        voice("inner", "down", [note("E4", "8d"), note("F#4", "16"), note("E#4", "8"), note("D#4", "8"), note("C#4", "8"), note("B3", "8")]),
      ],
      [voice("bass", "down", [chord(["C#1", "C#2"], "q"), chord(["G#3", "B3"], "q"), note("E#3", "q")])]
    ),
    pianoMeasure(
      [
        voice("melody", "up", [note("B4", "8d"), note("A4", "16"), note("G#4", "8"), note("B4", "8"), note("C#5", "8"), note("D5", "8")]),
        voice("inner", "down", [note("E4", "h"), note("F#4", "q")]),
      ],
      [voice("bass", "down", [rest("q"), chord(["A2", "C#3"], "q"), rest("q")])]
    ),
    pianoMeasure(
      [
        voice("melody", "up", [chord(["F#4", "A4", "C#5"], "q", { arpeggio: "up" }), note("D5", "q", { tieToNext: true }), note("D5", "8"), note("E5", "8")]),
        voice("inner", "down", [note("E4", "q"), note("E4", "q"), note("E4", "q")]),
      ],
      [voice("bass", "down", [chord(["B1", "B2"], "q"), chord(["D3", "F#3", "B3"], "q"), chord(["D3", "F#3", "B3"], "q")])]
    ),
    pianoMeasure(
      [
        voice("melody", "up", [note("B4", "8d"), note("C#5", "16"), note("B4", "q"), note("A4", "8d"), note("F#4", "16")]),
        voice("inner", "down", [note("A4", "q"), chord(["G#4", "B4"], "q"), chord(["F#4", "A4"], "q")]),
      ],
      [voice("bass", "down", [chord(["C#1", "C#2"], "q"), chord(["F#3", "A3", "C#4"], "q"), chord(["F#3", "A3", "C#4"], "q")])],
      { systemBreakAfter: true }
    ),
    pianoMeasure(
      [
        voice("melody", "up", [note("Cn5", "qd"), note("B4", "8"), note("A4", "8"), note("G#4", "8")]),
        voice("inner", "down", [note("E4", "8d"), note("F#4", "16"), note("E#4", "8"), note("D#4", "8"), note("C#4", "8"), note("B3", "8")]),
      ],
      [voice("bass", "down", [chord(["C#1", "C#2"], "q"), chord(["G#3", "B3"], "q"), note("E#3", "q")])]
    ),
    pianoMeasure(
      [
        voice("melody", "up", [note("B4", "8d"), note("A4", "16"), note("G#4", "q"), note("B4", "8"), note("C#5", "8")]),
        voice("inner", "down", [note("E4", "h"), rest("q")]),
      ],
      [voice("bass", "down", [rest("q"), chord(["F#2", "A2", "C#3"], "q"), rest("q")])],
      { endBarline: "double" }
    ),
    pianoMeasure(
      [voice("melody", "up", [note("C#5", "8d"), note("A4", "16"), note("F#4", "q"), note("A4", "q")])],
      [voice("bass", "down", [note("A2", "q"), chord(["A3", "C#4", "E4"], "q"), chord(["A3", "C#4", "E4"], "q")])]
    ),
    pianoMeasure(
      [voice("melody", "up", [note("B4", "8d"), note("C#5", "16"), note("D5", "q"), note("C#5", "8d"), note("D5", "16")])],
      [voice("bass", "down", [note("E2", "q"), chord(["G#3", "B3", "D4"], "q"), chord(["G#3", "B3", "D4"], "q")])]
    ),
    pianoMeasure(
      [voice("melody", "up", [note("E5", "8d"), note("F#5", "16"), note("G#5", "q", { ornament: "tr" }), note("F#5", "8d"), note("E#5", "16")])],
      [voice("bass", "down", [note("E2", "q"), chord(["G#3", "B3", "D4"], "q"), chord(["G#3", "B3", "D4"], "q")])],
      { systemBreakAfter: true }
    ),
    pianoMeasure(
      [
        voice("melody", "up", [note("F#5", "q"), note("D5", "8"), note("C#5", "8"), note("B#4", "q")]),
        voice("inner", "down", [rest("q"), chord(["B4", "D5"], "q"), chord(["A#4", "C#5"], "q")]),
      ],
      [voice("bass", "down", [note("A2", "q"), chord(["F#3", "A3", "C#4"], "q"), chord(["F#3", "A3", "C#4"], "q")])]
    ),
    pianoMeasure(
      [voice("melody", "up", [note("C#5", "8d"), note("A4", "16"), note("F#4", "q"), note("F#4", "8d"), note("A4", "16")])],
      [voice("bass", "down", [note("A2", "q"), chord(["A3", "C#4", "E4"], "q"), chord(["A3", "C#4", "E4"], "q")])]
    ),
    pianoMeasure(
      [voice("melody", "up", [note("B4", "8d"), note("C#5", "16"), note("D5", "q"), note("C#5", "8d"), note("D5", "16")])],
      [voice("bass", "down", [note("A2", "q"), chord(["D3", "F#3", "A3"], "q"), chord(["D3", "F#3", "A3"], "q")])]
    ),
    pianoMeasure(
      [
        voice("melody", "up", [note("C#5", "8d"), note("D5", "16"), note("E5", "q"), note("G#5", "q")]),
        voice("inner", "down", [note("C#5", "h", { tieToNext: true }), note("C#5", "q", { tieToNext: true })]),
      ],
      [voice("bass", "down", [note("A2", "q"), chord(["A3", "C#4", "E4"], "q"), chord(["A3", "C#4", "E4"], "q")])]
    ),
    pianoMeasure(
      [
        voice("melody", "up", [chord(["C#5", "E5", "A5"], "qd"), chord(["B4", "D5", "G#5"], "8"), chord(["A4", "C#5", "F#5"], "q")]),
        voice("inner", "down", [note("C#5", "h"), note("B4", "q")]),
      ],
      [voice("bass", "down", [note("A2", "q"), chord(["E3", "G#3", "B3"], "q"), chord(["E3", "G#3", "B3"], "q")])],
      { systemBreakAfter: true }
    ),
    pianoMeasure(
      [
        voice("melody", "up", [note("C#5", "8d"), note("A4", "16"), note("F#4", "q"), note("G#4", "q")]),
        voice("inner", "down", [rest("q"), note("F#4", "q"), chord(["D#4", "F#4"], "q")]),
      ],
      [voice("bass", "down", [chord(["A1", "A2"], "q"), chord(["F#3", "A3", "C#4"], "q"), rest("q")])]
    ),
    pianoMeasure(
      [
        voice("melody", "up", [note("G4", "8d"), note("A4", "16"), note("B4", "q"), note("C#5", "8d"), note("D5", "16")]),
        voice("inner", "down", [note("Fn4", "h"), note("G4", "q")]),
      ],
      [voice("bass", "down", [chord(["A1", "A2"], "q"), chord(["D3", "F#3", "A3"], "q"), chord(["D3", "F#3", "A3"], "q")])]
    ),
    pianoMeasure(
      [
        voice("melody", "up", [note("B4", "8d"), note("C#5", "16"), note("D5", "q", { ornament: "tr" }), note("C#5", "8d"), note("Cn5", "16")]),
        voice("inner", "down", [note("F#4", "h"), note("F#4", "q")]),
      ],
      [voice("bass", "down", [chord(["A1", "A2"], "q"), chord(["E3", "G#3", "B3"], "q"), chord(["E3", "G#3", "B3"], "q")])]
    ),
    pianoMeasure(
      [
        voice("melody", "up", [note("D5", "q", { ornament: "mordent" }), note("C#5", "8"), note("B#4", "8"), note("C#5", "q")]),
        voice("inner", "down", [note("F#4", "h"), note("E#4", "q")]),
      ],
      [voice("bass", "down", [chord(["A1", "A2"], "q"), chord(["E3", "G#3", "B3"], "q"), chord(["E3", "G#3", "B3"], "q")])]
    ),
    pianoMeasure(
      [
        voice("melody", "up", [note("C#5", "8d"), note("A4", "16"), note("F#4", "q"), note("G#4", "8d"), note("A4", "16")]),
        voice("inner", "down", [rest("q"), note("F#4", "h")]),
      ],
      [voice("bass", "down", [chord(["A1", "A2"], "q"), chord(["E3", "A3", "C#4"], "q"), rest("q")])],
      { endBarline: "final", systemBreakAfter: true }
    ),
  ];

  const romanRoute = [
    "F♯m: i", "Vb", "♯iii°⁷c", "ivb", "iv", "ic", "V⁷",
    "i", "iv", "ic", "V⁷", "i", "A: I", "V⁷",
  ];
  const analysisOnsets = [1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1];
  const analysisEvents = romanRoute.map((label, index) => ({
    measure: index + 1,
    beat: analysisOnsets[index],
    analysisBox: true,
    answerRole: index === 0 ? "supplied" : "editable",
    questionLabel: index === 0 ? label : undefined,
    answerSlotId: index === 0 ? undefined : `nzqa-2024-rimsky-analysis-h${index}`,
    modelLabel: label,
    romanNumeral: label,
    localKey: index < 12 ? "F♯ minor" : "A major",
    validateChord: false,
  }));
  const extractFourScore = () => ({
    key: "F♯ minor → A major",
    keySignature: "F#m",
    timeSignature: "3/4",
    layout: "piano",
    measuresPerSystem: 5,
    authoredSystemBreaks: true,
    minimumEngravingWidth: 1120,
    bottomAnalysisPadding: 120,
    barNumbers: Array.from({ length: 25 }, (_, index) => index + 1),
    sourceKeyCentres: ["F♯ minor", "A major"],
    sharedSourceId: "nzqa-2024-q2-extract-four",
    measures: structuredClone(extractFourMeasures),
    harmonicEvents: [],
    sourceSlurs: [
      { from: { measure: 1, beat: 2 }, to: { measure: 1, beat: 3 }, staff: "treble", role: "melody", position: "above" },
      { from: { measure: 2, beat: 2 }, to: { measure: 2, beat: 3 }, staff: "treble", role: "melody", position: "above" },
      { from: { measure: 3, beat: 1 }, to: { measure: 3, beat: 3.5 }, staff: "treble", role: "melody", position: "above" },
      { from: { measure: 4, beat: 1 }, to: { measure: 4, beat: 3 }, staff: "treble", role: "melody", position: "above" },
      { from: { measure: 6, beat: 1 }, to: { measure: 6, beat: 2 }, staff: "treble", role: "melody", position: "above" },
      { from: { measure: 7, beat: 1 }, to: { measure: 7, beat: 3.5 }, staff: "treble", role: "melody", position: "above" },
      { from: { measure: 8, beat: 1 }, to: { measure: 8, beat: 2.5 }, staff: "treble", role: "melody", position: "above" },
      { from: { measure: 9, beat: 2 }, to: { measure: 9, beat: 3 }, staff: "treble", role: "melody", position: "above" },
      { from: { measure: 10, beat: 1 }, to: { measure: 10, beat: 2 }, staff: "treble", role: "melody", position: "above" },
      { from: { measure: 11, beat: 1 }, to: { measure: 11, beat: 3.5 }, staff: "treble", role: "melody", position: "above" },
      { from: { measure: 11, beat: 2 }, to: { measure: 11, beat: 3 }, staff: "bass", role: "bass", position: "above" },
      { from: { measure: 12, beat: 1 }, to: { measure: 12, beat: 3.5 }, staff: "treble", role: "melody", position: "above" },
      { from: { measure: 13, beat: 1 }, to: { measure: 13, beat: 2 }, staff: "treble", role: "melody", position: "below" },
      { from: { measure: 14, beat: 2 }, to: { measure: 14, beat: 3 }, staff: "treble", role: "melody", position: "above" },
      { from: { measure: 17, beat: 1 }, to: { measure: 17, beat: 2 }, staff: "treble", role: "melody", position: "below" },
      { from: { measure: 18, beat: 2 }, to: { measure: 18, beat: 3 }, staff: "treble", role: "melody", position: "above" },
      { from: { measure: 22, beat: 1 }, to: { measure: 22, beat: 2 }, staff: "treble", role: "melody", position: "below" },
      { from: { measure: 25, beat: 1 }, to: { measure: 25, beat: 2 }, staff: "treble", role: "melody", position: "above" },
    ],
    sourceTextAnnotations: [
      { measure: 1, beat: 1.6, staff: "treble", text: "p dolce" },
      { measure: 3, beat: 1, staff: "treble", text: "poco cresc." },
      { measure: 5, beat: 1, staff: "treble", text: "mf", bold: true },
      { measure: 6, beat: 1, endBeat: 4, staff: "treble", type: "diminuendo" },
      { measure: 7, beat: 1, staff: "treble", text: "p", bold: true },
      { measure: 8, beat: 1, endBeat: 4, staff: "treble", type: "crescendo" },
      { measure: 9, beat: 1, staff: "treble", text: "f", bold: true },
      { measure: 10, beat: 1, endBeat: 4, staff: "treble", type: "diminuendo" },
      { measure: 11, beat: 1, staff: "treble", text: "p", bold: true },
      { measure: 13, beat: 1, staff: "treble", text: "p leggiero" },
      { measure: 21, beat: 1, staff: "treble", text: "mf", bold: true },
    ],
  });

  const q2a = getQuestion("nzqa-2024-rimsky-analysis");
  Object.assign(q2a, {
    category: "analysis",
    sourceType: "nzqa-reference",
    source: officialSource(
      "(a)(i)", "Extract Four", "Nikolai Rimsky-Korsakov",
      "Two Piano Pieces", "1–25", "exam pp.4–5; schedule p.6"
    ),
    title: "Reference: Rimsky-Korsakov Roman analysis",
    internalTitle: "Reference: Rimsky-Korsakov Roman analysis",
    studentTitle: "Reference: analyse the printed Rimsky-Korsakov extract",
    context:
      "The passage begins in F-sharp minor and modulates in bar 13. Analyse the 13 blank chord positions in bars 2–14, focusing on the bass clef in each bar. The first tonic chord is supplied.",
    studentContext:
      "The passage begins in F-sharp minor and modulates in bar 13. Analyse the 13 blank chord positions in bars 2–14, focusing on the bass clef in each bar. The first tonic chord is supplied.",
    hiddenConceptTerms: [],
    sourceSpec: {
      transcriptionMode: "exact",
      year: 2024,
      provider: "NZQA",
      question: "Question Two",
      part: "(a)(i)",
      bars: "1–25",
      printedBars: "1–25",
      printedMeasureCount: 25,
      staffLayout: "piano",
      staffNames: ["treble", "bass"],
      sharedSourceId: "nzqa-2024-q2-extract-four",
      romanNumerals: romanRoute,
      analysisPositions: 14,
      answerPositions: 13,
      suppliedLabels: ["F♯m: i"],
      keyCentres: ["F♯ minor", "A major"],
      modulationInstructionBar: 13,
      sourceSlurCount: 18,
      sourceTextAnnotationCount: 11,
      arpeggioCount: 2,
      perMeasureStaffVoiceEventCounts: staffVoiceCounts(extractFourMeasures),
      staffVoiceRhythmSignatures: staffVoiceRhythms(extractFourMeasures),
    },
    score: {
      ...extractFourScore(),
      caption: "NZQA examination reference • 2024 Question Two (a)(i), Extract Four • bars 1–25 transcription",
      studentCaption: "NZQA examination reference • 2024 Question Two (a)(i) • Extract Four",
      modelCaption: "Published Roman-numeral analysis • 2024 Question Two (a)(i)",
      harmonicEvents: structuredClone(analysisEvents),
    },
    interaction: {
      type: "roman-analysis",
      allowPaper: true,
      keyChoices: ["F♯ minor", "A major"],
      slots: analysisEvents.slice(1).map((event, index) => ({
        id: event.answerSlotId,
        harmonicIndex: index + 1,
        label: `Bar ${event.measure}, beat ${event.beat}`,
        acceptedAnswers: [{ label: event.modelLabel }],
        allowDualAnalysis: false,
      })),
      fields: [],
    },
    answerHeading: "Published Rimsky-Korsakov analysis",
    answer: [
      "After the supplied F♯m:i, the 13 assessed positions are Vb–♯iii°⁷c–ivb–iv–ic–V⁷–i–iv–ic–V⁷–i–A:I–V⁷. The change to A major is direct rather than a pivot-chord modulation.",
    ],
  });

  const q2b = getQuestion("nzqa-2024-rimsky-context");
  Object.assign(q2b, {
    category: "features",
    sourceType: "nzqa-reference",
    source: officialSource(
      "(a)(ii)", "Extract Four", "Nikolai Rimsky-Korsakov",
      "Two Piano Pieces", "1–25", "exam pp.4–5; schedule p.7"
    ),
    title: "Reference: Rimsky-Korsakov tonality and non-harmonic notes",
    internalTitle: "Reference: Rimsky-Korsakov tonality and non-harmonic notes",
    studentTitle: "Reference: explain tonality and melodic decoration",
    context:
      "Using the whole extract, explain the tonality and modulation, including the relationship between the keys and the evidence that establishes each region. Then identify and discuss several non-harmonic notes and their musical effect.",
    studentContext:
      "Using the whole extract, explain the tonality and modulation, including the relationship between the keys and the evidence that establishes each region. Then identify and discuss several non-harmonic notes and their musical effect.",
    hiddenConceptTerms: [
      "A major", "relative major", "passing note", "accented passing note",
      "grace note", "trill", "mordent", "auxiliary note", "suspension", "appoggiatura",
    ],
    sourceSpec: {
      transcriptionMode: "exact",
      year: 2024,
      provider: "NZQA",
      question: "Question Two",
      part: "(a)(ii)",
      bars: "1–25",
      printedBars: "1–25",
      printedMeasureCount: 25,
      staffLayout: "piano",
      staffNames: ["treble", "bass"],
      sharedSourceId: "nzqa-2024-q2-extract-four",
      keyCentres: ["F♯ minor", "A major"],
      scheduleModulationEvidence: {
        localKey: "A major",
        relationship: "relative major",
        directChangeBar: 12,
        noPivotChord: true,
        confirmingBass: "A",
        confirmingFunctions: ["tonic", "dominant seventh"],
        pedalReinforcement: true,
      },
      nonHarmonicEvidence: {
        passing: [4, 8, 12, 14, 15],
        accentedPassing: [5, 7, 9, 11],
        grace: [6, 10],
        trill: [15, 23],
        mordent: [24],
        chromaticAccentedAuxiliary: [16, 24],
        suspension: [6, 12],
        appoggiatura: [16, 24],
      },
      responseFields: ["tonality-modulation", "non-harmonic-notes"],
      sourceSlurCount: 18,
      sourceTextAnnotationCount: 11,
      perMeasureStaffVoiceEventCounts: staffVoiceCounts(extractFourMeasures),
      staffVoiceRhythmSignatures: staffVoiceRhythms(extractFourMeasures),
    },
    score: {
      ...extractFourScore(),
      caption: "NZQA examination reference • 2024 Question Two (a)(ii), Extract Four • bars 1–25 transcription",
      studentCaption: "NZQA examination reference • 2024 Question Two (a)(ii) • Extract Four",
    },
    interaction: {
      type: "contextual-analysis",
      allowPaper: true,
      reflectionOnly: true,
      fields: [
        {
          id: "tonality-modulation",
          label: "Tonality, modulation and key relationship",
          kind: "text",
          prompt: "Name the tonal regions, explain their relationship, and cite bass, chord-function and modulation-method evidence from the score.",
          acceptedAnswers: [{
            label: "The extract moves from F♯ minor to A major, its relative major. A in the bass and tonic / dominant-seventh harmony establish the A-major region; the schedule describes the move as direct, without a pivot chord, and reinforced by a pedal note.",
          }],
        },
        {
          id: "non-harmonic-notes",
          label: "Non-harmonic notes and their effect",
          kind: "text",
          prompt: "Identify several decorated notes by bar and explain how they shape the melodic line.",
          acceptedAnswers: [{
            label: "The score uses passing and accented passing notes, grace notes, trills, a mordent, chromatic accented auxiliary notes, suspensions and appoggiaturas. These decorations add interest, emphasis and forward motion to the melodic line.",
          }],
        },
      ],
    },
    answerHeading: "Published schedule evidence",
    answer: [
      "Tonality: the passage moves from F♯ minor to A major, its relative major. A in the bass and tonic / dominant-seventh harmony reinforce the new region. The schedule describes a direct move to A major at bar 12, without a pivot chord, reinforced by a pedal note.",
      "Non-harmonic notes: published examples include passing notes in bars 4, 8, 12, 14 and 15; accented passing notes in bars 5, 7, 9 and 11; grace notes in bars 6 and 10; trills in bars 15 and 23; a mordent in bar 24; chromatic accented auxiliary notes in bars 16 and 24; suspensions in bars 6 and 12; and appoggiaturas in bars 16 and 24. They add interest, emphasis and momentum to the melodic line.",
    ],
  });

  // Exam p.6, Extract Five, bars 90–96; schedule p.7 sample realisation.
  const extractFiveMeasures = [
    pianoMeasure(
      [
        voice("melody", "up", [chord(["C#4", "D4"], "8d"), chord(["B3", "D4"], "16"), chord(["B3", "D4"], "q"), chord(["B3", "D4"], "8"), note("F#4", "8")]),
        voice("inner", "down", [note("F#3", "q"), note("F#3", "q"), note("F#3", "q")]),
      ],
      [
        voice("bass-upper", "up", [note("B2", "8d"), note("A2", "16"), note("F#2", "8d"), note("A2", "16"), note("B2", "q")]),
        voice("bass", "down", [note("D2", "hd")]),
      ]
    ),
    pianoMeasure(
      [
        voice("melody", "up", [chord(["C#4", "E4"], "8d"), chord(["B3", "D4"], "16"), chord(["C#4", "E4"], "8d"), chord(["B3", "D4"], "16"), chord(["B3", "D4", "F#4"], "q")]),
        voice("inner", "down", [note("F#3", "q"), note("F#3", "q"), note("F#3", "q")]),
      ],
      [
        voice("bass-upper", "up", [note("B2", "8d"), note("A2", "16"), note("B2", "8d"), note("A2", "16"), note("F#2", "q")]),
        voice("bass", "down", [note("D2", "hd")]),
      ]
    ),
    pianoMeasure(
      [
        voice("melody", "up", [chord(["F#4", "A4"], "8d", { ornament: "mordent" }), chord(["E4", "G4"], "16"), chord(["C#4", "E4"], "q"), chord(["C#4", "E4"], "q")]),
        voice("inner", "down", [note("A3", "q"), note("A3", "q"), note("A3", "q")]),
      ],
      [
        voice("bass-upper", "up", [note("F#2", "q"), note("F#2", "q"), note("A2", "q")]),
        voice("bass", "down", [note("D2", "hd")]),
      ],
      { systemBreakAfter: true }
    ),
    pianoMeasure(
      [
        voice("melody", "up", [note("D4", "8d"), note("D4", "16"), note("C#4", "q"), note("D#4", "q")]),
        voice("inner", "down", [chord(["A#3", "C#4"], "q"), chord(["An3", "C#4"], "q"), chord(["A3", "C#4"], "q")]),
      ],
      [
        voice("bass-upper", "up", [rest("q"), note("B2", "q"), note("A2", "q")]),
        voice("bass", "down", [note("F#2", "h"), note("F#1", "q")]),
      ]
    ),
    pianoMeasure(
      [
        voice("melody", "up", [note("E4", "8d"), note("E4", "16"), note("E4", "q"), note("D#4", "q")]),
        voice("inner", "down", [chord(["G#3", "B3"], "h"), chord(["G#3", "B3", "E#4"], "q")]),
      ],
      [
        voice("bass-upper", "up", [rest("q"), note("B2", "q"), note("C#3", "q")]),
        voice("bass", "down", [note("E2", "h"), note("C#2", "q")]),
      ]
    ),
    pianoMeasure(
      [
        voice("melody", "up", [note("F#4", "8d"), note("C#4", "16"), note("F#4", "q"), note("G#4", "q")]),
        voice("inner", "down", [chord(["A3", "C#4"], "h"), chord(["G#3", "B3", "D4"], "q")]),
      ],
      [
        voice("bass-upper", "up", [rest("q"), note("C#3", "q"), note("E3", "q")]),
        voice("bass", "down", [note("F#2", "h"), note("E2", "q")]),
      ]
    ),
    pianoMeasure(
      [
        voice("melody", "up", [
          note("A4", "8d"), note("A4", "16"), note("A4", "q"),
          note("G#4", "8", { tuplet: triplet("q2b-m96") }),
          note("A4", "8", { tuplet: triplet("q2b-m96") }),
          note("F#4", "8", { tuplet: triplet("q2b-m96") }),
        ]),
        voice("inner", "down", [
          chord(["C#4", "E4"], "8d"), chord(["C#4", "E4"], "16"),
          chord(["C#4", "E4"], "q"), chord(["C#4", "E4"], "q"),
        ]),
      ],
      [
        voice("bass-upper", "up", [rest("q"), note("A2", "q", { tieToNext: true }), chord(["A2", "C#3"], "q")]),
        voice("bass", "down", [note("A2", "hd")]),
      ],
      { endBarline: "final", systemBreakAfter: true }
    ),
  ];
  const questionExtractFiveMeasures = extractFiveMeasures.map((measure, index) => {
    const copy = structuredClone(measure);
    if (index < 3) {
      copy.questionStaffVoices = structuredClone(copy.staffVoices);
      return copy;
    }
    copy.questionStaffVoices = {
      treble: [
        structuredClone(copy.staffVoices.treble[0]),
        blankVoice("inner", "down"),
      ],
      bass: index === 6
        ? [
            voice("bass-upper", "up", [rest("h"), chord(["A2", "C#3"], "q")]),
            blankVoice("bass", "down"),
          ]
        : [blankVoice("bass-upper", "up"), blankVoice("bass", "down")],
    };
    return copy;
  });
  const completionRoute = [
    "D: III", "iii / E: ii", "E: V⁷", "I",
    "F♯: V⁷", "i / A: vi", "A: V⁷", "I",
  ];
  const completionLocations = [
    [4, 1], [4, 2], [4, 3], [5, 1], [5, 3], [6, 1], [6, 3], [7, 1],
  ];
  const completionEvents = completionRoute.map((label, index) => ({
    measure: completionLocations[index][0],
    beat: completionLocations[index][1],
    analysisBox: true,
    answerRole: "supplied",
    questionLabel: label,
    modelLabel: label,
    romanNumeral: label,
    validateChord: false,
  }));

  const q2c = getQuestion("nzqa-2024-rimsky-piano");
  Object.assign(q2c, {
    category: "piano",
    sourceType: "nzqa-reference",
    source: officialSource(
      "(b)", "Extract Five", "Nikolai Rimsky-Korsakov",
      "Two Piano Pieces", "90–96", "exam p.6; schedule p.7"
    ),
    title: "Reference: 2024 related-key piano completion",
    internalTitle: "Reference: 2024 related-key piano completion",
    studentTitle: "Reference: complete the printed piano texture on paper",
    context:
      "Complete the harmony in bars 93–96 using all eight supplied Roman-numeral indications. Retain the printed melody and continue the piano style established in bar 92 as the music moves from D major through E major and F-sharp minor to A major.",
    studentContext:
      "Complete the harmony in bars 93–96 using all eight supplied Roman-numeral indications. Retain the printed melody and continue the piano style established in bar 92 as the music moves from D major through E major and F-sharp minor to A major.",
    hiddenConceptTerms: [],
    sourceSpec: {
      transcriptionMode: "exact",
      year: 2024,
      provider: "NZQA",
      question: "Question Two",
      part: "(b)",
      bars: "90–96",
      printedBars: "90–96",
      printedMeasureCount: 7,
      staffLayout: "piano",
      staffNames: ["treble", "bass"],
      keyCentres: ["D major", "E major", "F♯ minor", "A major"],
      romanNumerals: completionRoute,
      suppliedLabels: completionRoute,
      analysisPositions: 8,
      answerPositions: 0,
      expectedChordCount: 8,
      expectedCompletionType: "piano",
      perMeasureStaffVoiceEventCounts: staffVoiceCounts(extractFiveMeasures),
      staffVoiceRhythmSignatures: staffVoiceRhythms(extractFiveMeasures),
      questionStaffVoiceEventCounts: staffVoiceCounts(questionExtractFiveMeasures, "questionStaffVoices"),
      questionStaffVoiceRhythmSignatures: staffVoiceRhythms(questionExtractFiveMeasures, "questionStaffVoices"),
      completionContract: {
        suppliedMeasures: [90, 91, 92],
        suppliedStyleMeasure: 92,
        targetMeasures: [4, 5, 6, 7],
        printedTargetMeasures: [93, 94, 95, 96],
        chordsToRealise: 8,
        harmonicIndications: 8,
        questionRetainsMelody: true,
        requiredParts: ["bass line", "inner parts"],
      },
    },
    score: {
      key: "D major → E major → F♯ minor → A major",
      keySignature: "D",
      timeSignature: "3/4",
      layout: "piano",
      completion: true,
      authoredSystemBreaks: true,
      minimumEngravingWidth: 1040,
      barNumbers: [90, 91, 92, 93, 94, 95, 96],
      sourceKeyCentres: ["D major", "E major", "F♯ minor", "A major"],
      caption: "NZQA examination reference • 2024 Question Two (b), Extract Five • bars 90–96",
      studentCaption: "NZQA examination reference • 2024 Question Two (b) • printed completion score",
      modelCaption: "Published schedule sample realisation • 2024 Question Two (b)",
      measures: questionExtractFiveMeasures,
      harmonicEvents: completionEvents,
      sourceSlurs: [
        { from: { measure: 1, beat: 2 }, to: { measure: 1, beat: 3 }, staff: "bass", role: "bass-upper", position: "above" },
        { from: { measure: 2, beat: 2 }, to: { measure: 2, beat: 3 }, staff: "bass", role: "bass-upper", position: "above" },
        { from: { measure: 5, beat: 2 }, to: { measure: 5, beat: 3 }, staff: "bass", role: "bass-upper", position: "above" },
        { from: { measure: 6, beat: 2 }, to: { measure: 6, beat: 3 }, staff: "bass", role: "bass-upper", position: "above" },
      ],
      sourceTextAnnotations: [
        { measure: 3, beat: 1, staff: "treble", text: "f", bold: true },
        { measure: 4, beat: 1, staff: "treble", text: "p", bold: true },
        { measure: 4, beat: 2, staff: "treble", text: "cresc." },
        { measure: 7, beat: 2, staff: "treble", text: "dim." },
      ],
    },
    interaction: {
      type: "paper-completion",
      allowPaper: true,
      completionType: "piano",
      targetMeasures: [4, 5, 6, 7],
      chordsToRealise: 8,
      completionRequirements: {
        suppliedStyleMeasure: 3,
        targetMeasures: [4, 5, 6, 7],
        chordsToRealise: 8,
        retainMelody: true,
      },
      selfCheck: [
        "I retained the printed melody and completed only the missing piano harmony.",
        "My bass and inner parts realise all eight printed Roman-numeral indications.",
        "My continuation follows the rhythm, register and chord placement established in bar 92.",
        "My voice leading makes the D-major, E-major, F♯-minor and A-major regions clear.",
      ],
      printOrientation: "landscape",
    },
    answerHeading: "One possible model completion",
    answer: [
      "The eight printed harmonies are D:III–iii / E:ii–V⁷–I–F♯:V⁷–i / A:vi–V⁷–I. The model score preserves the published rhythmic piano surface rather than reducing the answer to block chords.",
    ],
  });
})();
