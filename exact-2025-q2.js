(function () {
  "use strict";

  const data = window.CadenceData;
  if (!data?.questions) {
    throw new Error("Cadence Lab question bank must load before the 2025 Q2 references.");
  }

  const getQuestion = (id) => {
    const question = data.questions.find((candidate) => candidate.id === id);
    if (!question) throw new Error(`Missing ${id}`);
    return question;
  };
  const note = (pitch, duration, details = {}) => ({ pitch, duration, ...details });
  const chord = (pitches, duration, details = {}) => ({ pitches, duration, ...details });
  const rest = (duration) => ({ duration, rest: true });
  const voice = (role, stemDirection, events) => ({ role, stemDirection, events });
  const tuplet = (id, numNotes, notesOccupied, details = {}) => ({
    id,
    numNotes,
    notesOccupied,
    ...details,
  });
  const officialSource = (part, extract, bars, location) => ({
    provider: "NZQA",
    year: 2025,
    question: "Question Two",
    part,
    extract,
    creator: "Franz Schubert",
    title: "Adagio and Rondo in E Major, D. 506 / Op. 145",
    bars,
    sourceKind: "official-exam",
    location,
    acknowledgement:
      "Teaching transcription of the named NZQA 2025 examination extract; learner-visible notation was checked against the question paper and model evidence against the published assessment schedule.",
  });
  const harmonicBox = (measure, beat, modelLabel, details = {}) => ({
    measure,
    beat,
    analysisBox: true,
    modelLabel,
    ...details,
  });

  const q2aMeasures = [
    {
      staffVoices: {
        treble: [
          voice("melody", "up", [
            note("B4", "8d"), note("E5", "16"), note("B4", "8"),
            note("B4", "8"), note("B4", "8"), note("B4", "8"),
          ]),
          voice("inner", "down", [
            note("E4", "qd"), note("E4", "8"), note("F#4", "8"), note("F#4", "8"),
          ]),
        ],
        bass: [voice("bass", "down", [
          chord(["E3", "G#3"], "qd"), chord(["E3", "G#3"], "8"),
          chord(["D#3", "A3"], "8"), chord(["D#3", "A3"], "8"),
        ])],
      },
    },
    {
      staffVoices: {
        treble: [
          voice("melody", "up", [
            note("B4", "8d"), note("G#4", "16"), note("E4", "q"),
            note("D#4", "16", { tuplet: tuplet("m2-sextuplet", 6, 4, { bracketed: false }) }),
            note("E4", "16", { tuplet: tuplet("m2-sextuplet", 6, 4, { bracketed: false }) }),
            note("F#4", "16", { tuplet: tuplet("m2-sextuplet", 6, 4, { bracketed: false }) }),
            note("G#4", "16", { tuplet: tuplet("m2-sextuplet", 6, 4, { bracketed: false }) }),
            note("A4", "16", { tuplet: tuplet("m2-sextuplet", 6, 4, { bracketed: false }) }),
            note("B4", "16", { tuplet: tuplet("m2-sextuplet", 6, 4, { bracketed: false }) }),
          ]),
          voice("inner", "down", [note("E4", "q"), rest("h")]),
        ],
        bass: [
          voice("bass-upper", "up", [note("G#3", "8d"), note("B3", "16"), note("G#3", "q"), rest("q")]),
          voice("bass", "down", [note("E3", "h"), rest("q")]),
        ],
      },
    },
    {
      staffVoices: {
        treble: [
          voice("melody", "up", [
            chord(["A4", "C#5"], "8d"), chord(["G#4", "B4"], "16"),
            chord(["F#4", "A4"], "8"), note("A4", "8"),
            note("A4", "16"), note("G#4", "16"), note("Gn4", "16"), note("G#4", "16"),
          ]),
          voice("inner", "down", [
            note("C#4", "qd"), chord(["C#4", "F#4"], "8"),
            chord(["B3", "E#4"], "8"), chord(["B3", "E#4"], "8"),
          ]),
        ],
        bass: [voice("bass", "down", [
          note("F#2", "8d"), note("G#2", "16"), note("A2", "8"),
          note("A2", "16d"), note("B2", "32"), note("C#3", "8"), note("C#3", "8"),
        ])],
      },
    },
    {
      staffVoices: {
        treble: [
          voice("melody", "up", [
            note("C#5", "8d"),
            note("B4", "32", { tuplet: tuplet("m4-triplet", 3, 2) }),
            note("A4", "32", { tuplet: tuplet("m4-triplet", 3, 2) }),
            note("G#4", "32", { tuplet: tuplet("m4-triplet", 3, 2) }),
            note("F#4", "8"), rest("8"), rest("16"),
            note("E4", "16"), note("F#4", "16"), note("G#4", "16"),
          ]),
          voice("inner", "down", [note("E#4", "q"), note("F#4", "8"), rest("qd")]),
        ],
        bass: [voice("bass", "down", [
          chord(["C#3", "B3"], "q"), chord(["F#3", "A3"], "8"), rest("qd"),
        ])],
      },
    },
    {
      staffVoices: {
        treble: [voice("melody", "up", [
          chord(["F#4", "A4"], "8d"), chord(["A4", "C#5"], "32"),
          chord(["G#4", "B4"], "32"), chord(["F#4", "A4"], "16"),
          chord(["F#4", "A4"], "8"), chord(["F#4", "A4"], "8"),
          chord(["F#4", "A4"], "8"), chord(["F#4", "A4"], "16"),
        ])],
        bass: [voice("bass", "down", [
          chord(["D#3", "B3"], "qd"), chord(["D#3", "Cn4"], "8"),
          chord(["D#3", "B3"], "8"), chord(["D#3", "Cn4"], "8"),
        ])],
      },
    },
    {
      endBarline: "single",
      staffVoices: {
        treble: [
          voice("melody", "up", [
            chord(["F#4", "A4", "F#5"], "8d"), chord(["G#4", "E5"], "16"),
            note("E5", "8"), note("D#5", "16d"), note("C#5", "64"),
            note("D#5", "64"), note("C#5", "16"), note("B4", "16"),
            note("C#5", "16"), note("D#5", "16"),
          ]),
          voice("inner", "down", [rest("q"), note("A4", "h")]),
        ],
        bass: [voice("bass", "down", [
          chord(["D#3", "B3"], "8d"), chord(["E3", "B3"], "16"),
          chord(["F#3", "B3"], "h"),
        ])],
      },
    },
  ];

  const q2a = getQuestion("nzqa-2025-schubert-analysis");
  Object.assign(q2a, {
    sourceType: "nzqa-reference",
    source: officialSource("(a)", "Extract Four", "1–6", "bars 1–6, exam p.5; schedule p.6"),
    title: "Reference: Schubert Roman analysis through two key changes",
    internalTitle: "Reference: Schubert Roman analysis through two key changes",
    studentTitle: "Reference: Roman analysis through two key changes",
    context:
      "The extract begins in E major, modulates to F-sharp minor, and then returns to E major. Analyse the twelve blank chord positions in bars 1–6, including a pivot chord at each modulation. The first tonic chord is supplied.",
    studentContext:
      "The extract begins in E major, modulates to F-sharp minor, and then returns to E major. Analyse the twelve blank chord positions in bars 1–6, including a pivot chord at each modulation. The first tonic chord is supplied.",
    hiddenConceptTerms: [],
    sourceSpec: {
      transcriptionMode: "exact",
      year: 2025,
      provider: "NZQA",
      question: "Question Two",
      part: "(a)",
      bars: "1–6",
      printedBars: "1–6",
      printedMeasureCount: 6,
      staffLayout: "piano",
      romanNumerals: [
        "E: I", "V⁷b", "I", "ii / F♯m: i", "iib / F♯m: ib", "V⁷",
        "V⁷", "i / E: ii", "V⁷b", "vii°⁷", "V⁷b", "I", "V⁷c sus",
      ],
      analysisPositions: 13,
      answerPositions: 12,
      suppliedLabels: ["E: I"],
      keyCentres: ["E major", "F♯ minor"],
      pivotCount: 2,
      acceptedPivotAlternatives: [
        ["ii / F♯m: i", "iib / F♯m: ib"],
        ["i / E: ii"],
      ],
      perMeasureStaffVoiceEventCounts: [
        { treble: [6, 4], bass: [4] }, { treble: [9, 2], bass: [4, 2] },
        { treble: [8, 4], bass: [7] }, { treble: [10, 3], bass: [3] },
        { treble: [8], bass: [4] }, { treble: [10, 2], bass: [3] },
      ],
      staffVoiceRhythmSignatures: [
        { treble: ["8d 16 8 8 8 8", "qd 8 8 8"], bass: ["qd 8 8 8"] },
        { treble: ["8d 16 q 16{6:4} 16{6:4} 16{6:4} 16{6:4} 16{6:4} 16{6:4}", "q h"], bass: ["8d 16 q q", "h q"] },
        { treble: ["8d 16 8 8 16 16 16 16", "qd 8 8 8"], bass: ["8d 16 8 16d 32 8 8"] },
        { treble: ["8d 32{3:2} 32{3:2} 32{3:2} 8 8 16 16 16 16", "q 8 qd"], bass: ["q 8 qd"] },
        { treble: ["8d 32 32 16 8 8 8 16"], bass: ["qd 8 8 8"] },
        { treble: ["8d 16 8 16d 64 64 16 16 16 16", "q h"], bass: ["8d 16 h"] },
      ],
    },
    score: {
      key: "E major → F♯ minor → E major",
      keySignature: "E",
      timeSignature: "3/4",
      layout: "piano",
      measuresPerSystem: 3,
      minimumEngravingWidth: 410,
      barNumbers: [1, 2, 3, 4, 5, 6],
      sourceKeyCentres: ["E major", "F♯ minor"],
      caption: "NZQA examination reference • 2025 Question Two (a), Extract Four • bars 1–6 transcription",
      studentCaption: "NZQA examination reference • 2025 Question Two (a) • Extract Four",
      measures: q2aMeasures,
      harmonicEvents: [
        harmonicBox(1, 1, "E: I", { questionLabel: "E: I", localKey: "E major", romanNumeral: "E: I", answerRole: "supplied" }),
        harmonicBox(1, 3, "V⁷b", { localKey: "E major", romanNumeral: "V⁷b" }),
        harmonicBox(2, 1, "I", { localKey: "E major", romanNumeral: "I" }),
        harmonicBox(3, 1, "ii / F♯m: i", { localKey: "E major", romanNumeral: "ii / F♯m: i" }),
        harmonicBox(3, 2, "iib / F♯m: ib", { localKey: "F♯ minor", romanNumeral: "iib / F♯m: ib" }),
        harmonicBox(3, 3, "V⁷", { localKey: "F♯ minor", romanNumeral: "V⁷" }),
        harmonicBox(4, 1, "V⁷", { localKey: "F♯ minor", romanNumeral: "V⁷" }),
        harmonicBox(4, 2, "i / E: ii", { localKey: "F♯ minor", romanNumeral: "i / E: ii" }),
        harmonicBox(5, 1, "V⁷b", { localKey: "E major", romanNumeral: "V⁷b" }),
        harmonicBox(5, 2.5, "vii°⁷", { localKey: "E major", romanNumeral: "vii°⁷" }),
        harmonicBox(6, 1, "V⁷b", { localKey: "E major", romanNumeral: "V⁷b" }),
        harmonicBox(6, 1.75, "I", { localKey: "E major", romanNumeral: "I" }),
        harmonicBox(6, 2, "V⁷c sus", { localKey: "E major", romanNumeral: "V⁷c sus" }),
      ],
    },
    answerHeading: "Published Schubert analysis",
    answer: [
      "The twelve assessed positions are V⁷b–I–ii / F♯m:i–iib / F♯m:ib–V⁷–V⁷–i / E:ii–V⁷b–vii°⁷–V⁷b–I–V⁷c sus. The schedule accepts either adjacent chord as the pivot into F-sharp minor.",
    ],
  });
  q2a.score.harmonicEvents.forEach((event, index) => {
    event.answerRole ||= "editable";
    if (event.answerRole === "editable") event.answerSlotId = `${q2a.id}-h${index + 1}`;
  });
  q2a.interaction = {
    type: "roman-analysis",
    allowPaper: true,
    keyChoices: ["E major", "F♯ minor"],
    slots: q2a.score.harmonicEvents.flatMap((event, harmonicIndex) => {
      if (event.answerRole !== "editable") return [];
      const firstPivot = harmonicIndex === 3;
      const secondPivotAlternative = harmonicIndex === 4;
      const returnPivot = harmonicIndex === 7;
      const suspendedDominant = harmonicIndex === 12;
      const acceptedAnswers = firstPivot
        ? [{ label: "ii / F♯m: i" }, { label: "ii / f♯: i" }, { label: "ii" }]
        : secondPivotAlternative
          ? [{ label: "iib / F♯m: ib" }, { label: "iib / f♯: ib" }, { label: "F♯m: ib" }]
          : returnPivot
            ? [{ label: event.modelLabel }, { label: "f♯: i / E: ii" }]
            : suspendedDominant
              ? [{ label: event.modelLabel }, { label: "V⁷c sus⁴" }]
              : [{ label: event.modelLabel }];
      return [{
        id: event.answerSlotId,
        harmonicIndex,
        label: `Bar ${event.measure}, beat ${event.beat}`,
        acceptedAnswers,
        allowDualAnalysis: [3, 4, 7].includes(harmonicIndex),
      }];
    }),
    fields: [],
  };

  const q2bMeasures = [
    {
      staffVoices: {
        treble: [
          voice("melody", "up", [
            note("E5", "8d"), note("G#5", "32"), note("F#5", "32"),
            note("E5", "16"),
            note("D#5", "16"), note("C#5", "16"), note("B4", "16"),
            note("A4", "16"), note("G#4", "16"), note("Gn4", "16"), note("F#4", "16"),
          ]),
          voice("inner", "down", [note("G#4", "h"), note("C#4", "8"), note("C#4", "8")]),
        ],
        bass: [voice("bass", "down", [
          chord(["E3", "B3", "E4"], "h"), note("A2", "8"), note("A#2", "8"),
        ])],
      },
    },
    {
      endBarline: "single",
      staffVoices: {
        treble: [
          voice("melody", "up", [chord(["G#3", "E4"], "q"), chord(["F#3", "D#4"], "q"), rest("q")]),
          voice("inner", "down", [note("B3", "h"), rest("q")]),
        ],
        bass: [voice("bass", "down", [
          note("B2", "qdd"), note("D#3", "32"), note("C#3", "32"),
          note("B2", "16"), note("A2", "16"), note("G#2", "16"), note("F#2", "16"),
        ])],
      },
    },
  ];
  const q2b = getQuestion("nzqa-2025-schubert-feature");
  Object.assign(q2b, {
    sourceType: "nzqa-reference",
    source: officialSource("(b)", "Extract Five", "7–8", "bars 7–8, exam p.6; schedule p.6"),
    title: "Reference: Schubert harmonic or tonal feature",
    internalTitle: "Reference: Schubert harmonic or tonal feature",
    studentTitle: "Reference: identify and explain a harmonic or tonal feature",
    context:
      "Identify one harmonic or tonal feature in bars 7–8. Cite precise evidence from the score and explain the feature's function.",
    studentContext:
      "Identify one harmonic or tonal feature in bars 7–8. Cite precise evidence from the score and explain the feature's function.",
    hiddenConceptTerms: [],
    sourceSpec: {
      transcriptionMode: "exact",
      year: 2025,
      provider: "NZQA",
      question: "Question Two",
      part: "(b)",
      bars: "7–8",
      printedBars: "7–8",
      printedMeasureCount: 2,
      staffLayout: "piano",
      keyCentres: ["E major"],
      expectedChordCount: 0,
      acceptedFeatureFamilies: ["chromatic contrary semitone movement", "melodic repetition / imitation / sequence"],
      perMeasureStaffVoiceEventCounts: [
        { treble: [11, 3], bass: [3] },
        { treble: [3, 2], bass: [7] },
      ],
      staffVoiceRhythmSignatures: [
        { treble: ["8d 32 32 16 16 16 16 16 16 16 16", "h 8 8"], bass: ["h 8 8"] },
        { treble: ["q q q", "h q"], bass: ["qdd 32 32 16 16 16 16"] },
      ],
    },
    score: {
      key: "E major",
      keySignature: "E",
      timeSignature: "3/4",
      layout: "piano",
      measuresPerSystem: 2,
      minimumEngravingWidth: 470,
      barNumbers: [7, 8],
      sourceKeyCentres: ["E major"],
      caption: "NZQA examination reference • 2025 Question Two (b), Extract Five • bars 7–8 transcription",
      studentCaption: "NZQA examination reference • 2025 Question Two (b) • Extract Five",
      measures: q2bMeasures,
      harmonicEvents: [],
    },
    interaction: {
      type: "contextual-analysis",
      allowPaper: true,
      reflectionOnly: true,
      fields: [
        { id: "feature", label: "Harmonic / tonal feature", kind: "text", prompt: "Name one feature used in bars 7–8.", acceptedAnswers: [{ label: "chromatic semitone movement in contrary motion" }, { label: "melodic repetition / imitation / sequence" }] },
        { id: "evidence", label: "Score evidence", kind: "text", prompt: "Locate the relevant bar, beat, voices and pitch movement.", acceptedAnswers: [{ label: "In bar 7 beat 3, one part descends while another ascends in chromatic semitones." }, { label: "The melodic idea is repeated, imitated or sequenced." }] },
        { id: "function", label: "Function", kind: "text", prompt: "Explain what the feature does in this phrase.", acceptedAnswers: [{ label: "It decorates the cadence point, emphasises the imperfect cadence / dominant, and creates momentum back to the tonic." }, { label: "It develops the melody and provides continuity." }] },
      ],
      evidencePrompt: "Optional: connect the feature, evidence and musical effect in one concluding sentence.",
    },
    answerHeading: "Schedule-derived feature evidence",
    answer: [
      "One published response identifies chromatic semitone movement in contrary motion at bar 7 beat 3. It decorates the cadence point, emphasises the imperfect cadence / dominant and creates momentum back to the tonic. The schedule also accepts repetition, imitation or sequence in the melodic line when its developmental and continuity function is explained.",
    ],
  });

  const q2cMeasures = [
    {
      staffVoices: {
        treble: [
          voice("melody", "up", [note("E4", "q"), note("F#4", "8"), note("G#4", "8")]),
          voice("inner", "down", [note("B3", "h")]),
        ],
        bass: [voice("bass", "down", [note("E2", "8"), note("G#2", "8"), note("E2", "8"), note("G#2", "8")])],
      },
    },
    {
      staffVoices: {
        treble: [
          voice("melody", "up", [note("G#4", "q"), note("G#4", "q")]),
          voice("inner", "down", [chord(["C#4", "E#4"], "q"), chord(["D#4", "F#4"], "q")]),
        ],
        bass: [voice("bass", "down", [note("C#2", "8"), note("G#2", "8"), note("B1", "8"), note("B2", "8")])],
      },
      questionStaffVoices: {
        treble: [
          voice("melody", "up", [note("G#4", "q"), note("G#4", "q")]),
          voice("inner", "down", [chord(["C#4", "E#4"], "q"), rest("q")]),
        ],
        bass: [voice("bass", "down", [note("C#2", "8"), note("G#2", "8"), rest("8"), rest("8")])],
      },
    },
    {
      staffVoices: {
        treble: [
          voice("melody", "up", [note("A4", "q"), note("G#4", "8"), note("F#4", "8")]),
          voice("inner", "down", [chord(["A3", "C#4"], "q"), chord(["A3", "C#4"], "q")]),
        ],
        bass: [voice("bass", "down", [note("F#2", "8"), note("C#3", "8"), note("A2", "8"), note("C#3", "8")])],
      },
      questionStaffVoices: {
        treble: [voice("melody", "up", [note("A4", "q"), note("G#4", "8"), note("F#4", "8")]), voice("inner", "down", [rest("h")])],
        bass: [voice("bass", "down", [rest("h")])],
      },
    },
    {
      staffVoices: {
        treble: [
          voice("melody", "up", [note("C#5", "q"), note("B4", "8"), note("A4", "8")]),
          voice("inner", "down", [chord(["A3", "Cn4", "D#4"], "q"), chord(["B3", "D#4", "F#4"], "q")]),
        ],
        bass: [voice("bass", "down", [note("D#2", "8"), note("D#3", "8"), note("B1", "8"), note("B2", "8")])],
      },
      questionStaffVoices: {
        treble: [voice("melody", "up", [note("C#5", "q"), note("B4", "8"), note("A4", "8")]), voice("inner", "down", [rest("h")])],
        bass: [voice("bass", "down", [rest("h")])],
      },
    },
    {
      staffVoices: {
        treble: [
          voice("melody", "up", [note("G#4", "q"), note("A4", "8"), note("F#4", "8")]),
          voice("inner", "down", [chord(["G#3", "B3"], "q"), chord(["A3", "D#4", "F#4"], "q")]),
        ],
        bass: [voice("bass", "down", [note("E2", "8"), note("B2", "8"), note("B1", "8"), note("B2", "8")])],
      },
      questionStaffVoices: {
        treble: [voice("melody", "up", [note("G#4", "q"), note("A4", "8"), note("F#4", "8")]), voice("inner", "down", [rest("h")])],
        bass: [voice("bass", "down", [rest("h")])],
      },
    },
    {
      endBarline: "repeat-end",
      staffVoices: {
        treble: [
          voice("melody", "up", [note("E4", "q"), rest("q")]),
          voice("inner", "down", [chord(["G#3", "B3"], "q"), rest("q")]),
        ],
        bass: [voice("bass", "down", [note("E2", "8"), note("B2", "8"), note("E2", "8"), note("B2", "8")])],
      },
      questionStaffVoices: {
        treble: [voice("melody", "up", [note("E4", "q"), rest("q")]), voice("inner", "down", [rest("h")])],
        bass: [voice("bass", "down", [rest("h")])],
      },
    },
  ];
  q2cMeasures[0].questionStaffVoices = structuredClone(q2cMeasures[0].staffVoices);

  const q2c = getQuestion("nzqa-2025-schubert-piano");
  Object.assign(q2c, {
    sourceType: "nzqa-reference",
    source: officialSource("(c)", "Extract Six", "19–24", "bars 19–24, exam p.7; schedule p.7"),
    title: "Reference: Schubert piano completion",
    internalTitle: "Reference: Schubert piano completion",
    studentTitle: "Reference: complete the Schubert piano texture",
    context:
      "Complete the harmony in bars 20–24 using all eight supplied Roman-numeral indications. Continue the piano style established in bars 19–20 by adding a bass line and two inner parts; retain every supplied note.",
    studentContext:
      "Complete the harmony in bars 20–24 using all eight supplied Roman-numeral indications. Continue the piano style established in bars 19–20 by adding a bass line and two inner parts; retain every supplied note.",
    hiddenConceptTerms: [],
    sourceSpec: {
      transcriptionMode: "exact",
      year: 2025,
      provider: "NZQA",
      question: "Question Two",
      part: "(c)",
      bars: "19–24",
      printedBars: "19–24",
      printedMeasureCount: 6,
      staffLayout: "piano",
      keyCentres: ["E major"],
      romanNumerals: ["V", "ii", "iib", "vii°⁷", "V", "I", "V⁷", "I"],
      suppliedLabels: ["V", "ii", "iib", "vii°⁷", "V", "I", "V⁷", "I"],
      analysisPositions: 8,
      expectedChordCount: 8,
      expectedCompletionType: "piano",
      perMeasureStaffVoiceEventCounts: [
        { treble: [3, 1], bass: [4] }, { treble: [2, 2], bass: [4] },
        { treble: [3, 2], bass: [4] }, { treble: [3, 2], bass: [4] },
        { treble: [3, 2], bass: [4] }, { treble: [2, 2], bass: [4] },
      ],
      staffVoiceRhythmSignatures: [
        { treble: ["q 8 8", "h"], bass: ["8 8 8 8"] },
        { treble: ["q q", "q q"], bass: ["8 8 8 8"] },
        { treble: ["q 8 8", "q q"], bass: ["8 8 8 8"] },
        { treble: ["q 8 8", "q q"], bass: ["8 8 8 8"] },
        { treble: ["q 8 8", "q q"], bass: ["8 8 8 8"] },
        { treble: ["q q", "q q"], bass: ["8 8 8 8"] },
      ],
      questionStaffVoiceEventCounts: [
        { treble: [3, 1], bass: [4] }, { treble: [2, 2], bass: [4] },
        { treble: [3, 1], bass: [1] }, { treble: [3, 1], bass: [1] },
        { treble: [3, 1], bass: [1] }, { treble: [2, 1], bass: [1] },
      ],
      questionStaffVoiceRhythmSignatures: [
        { treble: ["q 8 8", "h"], bass: ["8 8 8 8"] },
        { treble: ["q q", "q q"], bass: ["8 8 8 8"] },
        { treble: ["q 8 8", "h"], bass: ["h"] },
        { treble: ["q 8 8", "h"], bass: ["h"] },
        { treble: ["q 8 8", "h"], bass: ["h"] },
        { treble: ["q q", "h"], bass: ["h"] },
      ],
      completionContract: {
        suppliedMeasure: 1,
        suppliedThrough: { measure: 20, beat: 1 },
        targetMeasures: [2, 3, 4, 5, 6],
        chordsToRealise: 8,
        harmonicIndications: 8,
        requiredParts: ["bass line", "two inner parts"],
        questionRetainsMelody: true,
        modelOnlyVoicesMaskedAfterBeat: { measure: 20, beat: 1 },
      },
    },
    score: {
      key: "E major",
      keySignature: "E",
      timeSignature: "2/4",
      layout: "piano",
      measuresPerSystem: 3,
      completion: true,
      barNumbers: [19, 20, 21, 22, 23, 24],
      sourceKeyCentres: ["E major"],
      caption: "NZQA examination reference • 2025 Question Two (c), Extract Six • bars 19–24 transcription",
      studentCaption: "NZQA examination reference • 2025 Question Two (c) • Extract Six",
      measures: q2cMeasures,
      harmonicEvents: [
        harmonicBox(2, 2, "V", { questionLabel: "V", romanNumeral: "V", answerRole: "supplied" }),
        harmonicBox(3, 1, "ii", { questionLabel: "ii", romanNumeral: "ii", answerRole: "supplied" }),
        harmonicBox(3, 2, "iib", { questionLabel: "iib", romanNumeral: "iib", answerRole: "supplied" }),
        harmonicBox(4, 1, "vii°⁷", { questionLabel: "vii°⁷", romanNumeral: "vii°⁷", answerRole: "supplied" }),
        harmonicBox(4, 2, "V", { questionLabel: "V", romanNumeral: "V", answerRole: "supplied" }),
        harmonicBox(5, 1, "I", { questionLabel: "I", romanNumeral: "I", answerRole: "supplied" }),
        harmonicBox(5, 2, "V⁷", { questionLabel: "V⁷", romanNumeral: "V⁷", answerRole: "supplied" }),
        harmonicBox(6, 1, "I", { questionLabel: "I", romanNumeral: "I", answerRole: "supplied" }),
      ],
    },
    interaction: {
      type: "paper-completion",
      completionType: "piano",
      completionRequirements: {
        suppliedMeasures: [19],
        suppliedThrough: { measure: 20, beat: 1 },
        targetMeasures: [20, 21, 22, 23, 24],
        harmonicIndications: 8,
        requiredParts: ["bass line", "two inner parts"],
        texture: "the printed Schubert piano style in bars 19–20",
        selfCheck: [
          "Retain the printed melody and the supplied opening texture through bar 20 beat 1.",
          "Realise all eight Roman-numeral indications with a bass line and two inner parts.",
          "Continue the established quaver-bass texture and keep the completion playable.",
        ],
      },
      selfCheck: [
        "Retain the printed melody and the supplied opening texture through bar 20 beat 1.",
        "Realise all eight Roman-numeral indications with a bass line and two inner parts.",
        "The accompaniment is playable and uses a suitable register and spacing.",
      ],
      printOrientation: "landscape",
    },
    answerHeading: "One possible model completion",
    answer: [
      "The assessment schedule's sample realisation continues the printed texture through V–ii–iib–vii°⁷–V–I–V⁷–I. Other stylistically appropriate realisations are possible.",
    ],
  });
})();
