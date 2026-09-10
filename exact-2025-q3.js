(function () {
  "use strict";

  const data = window.CadenceData;
  if (!data?.questions) {
    throw new Error("Cadence Lab question bank must load before the 2025 Q3 references.");
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
    bracketed: false,
    ...details,
  });
  const officialSource = (part, extract, bars, location) => ({
    provider: "NZQA",
    year: 2025,
    question: "Question Three",
    part,
    extract,
    creator: "Billy Joel",
    title: "New York State of Mind",
    bars,
    sourceKind: "official-exam",
    location,
    acknowledgement:
      "Teaching transcription of the named NZQA 2025 examination extract; learner-visible notation was checked against the question paper and model evidence against the published assessment schedule.",
  });
  const scoreVoiceCounts = (measures, sourceName = "staffVoices") =>
    measures.map((measure) => Object.fromEntries(
      ["vocal", "treble", "bass"].map((staff) => [
        staff,
        (measure[sourceName]?.[staff] || []).map((stream) => stream.events.length),
      ])
    ));
  const durationText = (event) => event.tuplet
    ? `${event.duration}{${event.tuplet.numNotes}:${event.tuplet.notesOccupied}}`
    : event.duration;
  const scoreRhythms = (measures, sourceName = "staffVoices") =>
    measures.map((measure) => Object.fromEntries(
      ["vocal", "treble", "bass"].map((staff) => [
        staff,
        (measure[sourceName]?.[staff] || []).map((stream) =>
          stream.events.map(durationText).join(" ")
        ),
      ])
    ));
  const staffMeasure = (vocalEvents, trebleVoices, bassVoices, details = {}) => ({
    ...details,
    staffVoices: {
      vocal: [voice("vocal", "up", vocalEvents)],
      treble: trebleVoices,
      bass: bassVoices,
    },
  });

  const q3aMeasures = [
    staffMeasure(
      [rest("h"), note("E5", "q", { tuplet: triplet("a5-1") }), note("E5", "8", { tuplet: triplet("a5-1"), tieToNext: true }), note("E5", "8", { tuplet: triplet("a5-2") }), note("D5", "8", { tuplet: triplet("a5-2") }), note("C5", "8", { tuplet: triplet("a5-2") })],
      [voice("piano-upper", "up", [rest("h"), note("E5", "q", { tuplet: triplet("pa5-1") }), note("E5", "8", { tuplet: triplet("pa5-1"), tieToNext: true }), note("E5", "8", { tuplet: triplet("pa5-2") }), note("D5", "8", { tuplet: triplet("pa5-2") }), note("C5", "8", { tuplet: triplet("pa5-2") })])],
      [
        voice("bass-figure", "up", [
          note("E3", "h", { graceNotes: [
            { pitch: "G3", duration: "16" },
            { pitch: "Gb3", duration: "16" },
            { pitch: "F3", duration: "16" },
          ] }),
          chord(["E3", "G3", "C4"], "h"),
        ]),
        voice("piano-bass", "down", [note("C2", "h"), rest("h")]),
      ],
      { beginBarline: "repeat-begin" }
    ),
    staffMeasure(
      [note("D5", "8"), note("E5", "8"), note("F5", "h"), note("D5", "8"), note("C5", "8")],
      [voice("piano-upper", "up", [note("D5", "8"), note("E5", "8"), note("F5", "h"), note("D5", "8"), note("C5", "8")])],
      [voice("piano-bass", "down", [note("E2", "h"), chord(["E3", "G#3", "B3", "D4"], "h")])],
      { systemBreakAfter: true }
    ),
    staffMeasure(
      [note("C5", "8"), note("D5", "8"), note("E5", "h"), note("C5", "8"), note("B4", "8")],
      [voice("piano-upper", "up", [note("C5", "8"), note("D5", "8"), note("E5", "h"), note("C5", "8"), note("B4", "8")])],
      [voice("piano-bass", "down", [note("A2", "h"), chord(["G3", "A3", "C4", "E4"], "h")])]
    ),
    staffMeasure(
      [note("C5", "8"), note("B4", "8"), note("A4", "hd")],
      [
        voice("piano-upper", "up", [
          note("C5", "8"), note("B4", "8"), note("A4", "q"),
          chord(["C4", "E4"], "q"), chord(["Bb3", "D4"], "q"),
        ]),
      ],
      [voice("piano-bass", "down", [chord(["G2", "Bb3"], "h"), chord(["C3", "E3", "G3", "Bb3"], "h")])]
    ),
    staffMeasure(
      [rest("q"), note("F5", "8"), note("G5", "8"), note("G5", "q"), note("F5", "8"), note("E5", "8")],
      [voice("piano-upper", "up", [rest("q"), note("F5", "8"), note("G5", "8"), note("G5", "q"), note("F5", "8"), note("E5", "8")])],
      [voice("piano-bass", "down", [note("F2", "h"), chord(["A3", "C4", "F4"], "h")])],
      { systemBreakAfter: true }
    ),
    staffMeasure(
      [note("F5", "8"), note("G5", "8"), note("A5", "h"), note("F5", "8"), note("E5", "8")],
      [voice("piano-upper", "up", [note("F5", "8"), note("G5", "8"), note("A5", "h"), note("F5", "8"), note("E5", "8")])],
      [voice("piano-bass", "down", [note("A2", "h"), chord(["G3", "A3", "C#4", "E4"], "h")])]
    ),
    staffMeasure(
      [note("F5", "8"), note("E5", "8"), note("D5", "hd")],
      [voice("piano-upper", "up", [note("F5", "8"), note("E5", "8"), note("D5", "hd")])],
      [voice("piano-bass", "down", [note("D3", "h"), chord(["D3", "F3", "A3", "C4"], "h")])]
    ),
    staffMeasure(
      [rest("w")],
      [voice("piano-upper", "up", [rest("w")])],
      [voice("piano-bass", "down", [chord(["Bb2", "Ab3", "C4", "D4", "F4"], "h"), chord(["Bb2", "Ab3", "D4", "F4"], "h")])]
    ),
    staffMeasure(
      [rest("8"), note("C5", "8"), note("E5", "q"), rest("q"), note("E5", "8", { tuplet: triplet("a13") }), note("D5", "8", { tuplet: triplet("a13") }), note("C5", "8", { tuplet: triplet("a13") })],
      [voice("piano-upper", "up", [rest("8"), note("C5", "8"), note("E5", "q"), rest("q"), note("E5", "8", { tuplet: triplet("pa13") }), note("D5", "8", { tuplet: triplet("pa13") }), note("C5", "8", { tuplet: triplet("pa13") })]), voice("piano-harmony", "down", [chord(["E3", "G3", "C4"], "h"), chord(["G#3", "D4", "G4"], "h")])],
      [voice("piano-bass", "down", [chord(["C3", "E3", "G3"], "h"), chord(["E2", "G#2", "D3", "G3"], "h")])],
      { endBarline: "final", systemBreakAfter: true }
    ),
  ];

  const assessedChords = ["E7", "Am7", "Gm(add4)", "C7", "F", "A7", "Dm7", "B♭9", "B♭7", "C"];
  const harmonicLocations = [[2, 1], [3, 1], [4, 1], [4, 3], [5, 1], [6, 1], [7, 1], [8, 1], [8, 3], [9, 1]];
  const validation = {
    E7: ["E2", "G#3", "B3", "D4"], Am7: ["A2", "G3", "C4", "E4"],
    "Gm(add4)": ["G2", "Bb3", "C5"], C7: ["C3", "E3", "G3", "Bb3"],
    F: ["F2", "A3", "C4"], A7: ["A2", "G3", "C#4", "E4"],
    Dm7: ["D3", "F3", "A3", "C4"], "B♭9": ["Bb2", "Ab3", "C4", "D4", "F4"],
    "B♭7": ["Bb2", "Ab3", "D4", "F4"], C: ["C3", "E3", "G3"],
  };
  const q3aHarmonicEvents = assessedChords.map((symbol, index) => ({
    measure: harmonicLocations[index][0],
    beat: harmonicLocations[index][1],
    analysisBox: true,
    answerRole: "editable",
    answerSlotId: `nzqa-2025-joel-chords-h${index + 1}`,
    modelLabel: symbol,
    chordSymbol: symbol,
    localKey: "C major",
    validationPitches: validation[symbol],
    validationScope: "harmonic-span",
    omittedChordIntervals: symbol === "Gm(add4)" ? [7] : undefined,
  }));

  const q3a = getQuestion("nzqa-2025-joel-chords");
  Object.assign(q3a, {
    sourceType: "nzqa-reference",
    source: officialSource("(a)", "Extract Seven", "5–13", "bars 5–13, exam p.9; schedule p.9"),
    title: "Reference: Billy Joel jazz / rock chord analysis",
    internalTitle: "Reference: Billy Joel jazz / rock chord analysis",
    studentTitle: "Reference: identify ten jazz / rock chords",
    context: "Identify the ten blank chords in bars 6–13 using jazz / rock notation. The two chord symbols already printed in the source are supplied, not answer positions.",
    studentContext: "Identify the ten blank chords in bars 6–13 using jazz / rock notation. The two chord symbols already printed in the source are supplied, not answer positions.",
    hiddenConceptTerms: [],
    sourceSpec: {
      transcriptionMode: "exact", year: 2025, provider: "NZQA", question: "Question Three", part: "(a)", bars: "5–13",
      printedBars: "5–13", printedMeasureCount: 9, staffLayout: "vocal-piano", staffNames: ["vocal", "treble", "bass"],
      keyCentres: ["C major"], chordSymbols: assessedChords, analysisPositions: 10, answerPositions: 10,
      sourceChordLabels: ["C", "E7(#9)"], expectedChordCount: 10,
      perMeasureStaffVoiceEventCounts: scoreVoiceCounts(q3aMeasures),
      staffVoiceRhythmSignatures: scoreRhythms(q3aMeasures),
    },
    score: {
      key: "C major", keySignature: "C", timeSignature: "4/4", layout: "vocal-piano",
      minimumEngravingWidth: 720, barNumbers: [5, 6, 7, 8, 9, 10, 11, 12, 13],
      authoredSystemBreaks: true,
      caption: "NZQA examination reference • 2025 Question Three (a), Extract Seven • bars 5–13 transcription",
      studentCaption: "NZQA examination reference • 2025 Question Three (a) • Extract Seven",
      measures: q3aMeasures, harmonicEvents: q3aHarmonicEvents,
      sourceChordLabels: [{ measure: 1, beat: 3, label: "C" }, { measure: 9, beat: 3, label: "E7(#9)" }],
      labelPosition: "top",
    },
    interaction: {
      type: "jazz-chord-placement", allowPaper: true, advancedBuilder: true,
      hintBankMode: "limited-vocabulary",
      seed: "nzqa-2025-q3a-published-bank-v1",
      slots: q3aHarmonicEvents.map((event, harmonicIndex) => ({
        id: event.answerSlotId, harmonicIndex,
        label: `Bar ${event.measure + 4}, beat ${event.beat}`,
        acceptedAnswers: [{ label: event.modelLabel }],
      })),
      bank: ["Cmaj7", "G7", "Am7", "Dm9", "F6"].map((label, index) => ({ id: `nzqa-2025-q3a-hint-${index + 1}`, label })),
      fields: [],
    },
    answerHeading: "Published chord-symbol sequence",
    answer: ["The ten assessed answers are E7, Am7, Gm(add4), C7, F, A7, Dm7, B♭9, B♭7 and C. The printed C and E7(#9) are supplied context rather than answer slots."],
  });

  const q3bVocal = [
    [rest("w")],
    [rest("h"), rest("8"), note("C5", "8"), note("C5", "8"), note("C5", "8")],
    [note("C5", "q"), note("B4", "q", { tieToNext: true }), note("B4", "8"), note("A4", "8"), note("F4", "q")],
    [rest("q"), note("G4", "q"), note("A4", "q"), note("A4", "q", { tieToNext: true })],
    [note("A4", "h"), rest("h")],
    [rest("q"), note("Bb4", "8"), note("Bb4", "8"), note("A4", "h")],
    [rest("q"), note("Bb4", "8"), note("A4", "8"), note("A4", "8"), note("Bb4", "q"), note("C5", "8")],
    [note("B4", "w")], [rest("w")],
    [rest("q"), note("C5", "q"), note("C5", "q"), note("C5", "q")],
    [note("C5", "qd"), note("B#4", "8"), note("A4", "8"), note("G4", "qd")],
    [rest("q"), note("A4", "q"), note("B#4", "q"), note("C5", "q", { tieToNext: true })],
    [note("C5", "h"), rest("q"), rest("8"), note("G4", "8")],
    [note("A4", "8"), note("B4", "q"), note("C5", "8"), note("C5", "h", { tieToNext: true })],
    [note("C5", "h"), rest("q"), rest("8"), note("G4", "8")],
    [note("A4", "q"), note("B4", "8"), note("B4", "8"), note("C5", "h", { tieToNext: true })],
    [note("C5", "w")], [rest("w")], [rest("w")],
  ];
  const pianoCopy = (events) => events.map((event) => event.rest
    ? { ...event }
    : { ...event, pitches: [event.pitch], pitch: undefined });
  const copiedPianoVoice = (measureIndex) => {
    const copied = voice("piano-upper", "up", pianoCopy(q3bVocal[measureIndex]));
    if ([3, 15].includes(measureIndex)) copied.events.at(-1).tieToNext = false;
    return copied;
  };
  const q3bTrebleVoices = [
    [voice("piano-upper", "up", [
        chord(["A3", "C4", "E4"], "q", { tuplet: triplet("b24-1") }),
        note("G3", "q", { tuplet: triplet("b24-1") }),
        note("F#3", "q", { tuplet: triplet("b24-1") }),
        note("G3", "8"), note("B3", "8"), note("D4", "8"), note("C4", "8"),
    ])],
    [copiedPianoVoice(1), voice("piano-harmony", "down", [chord(["G3", "C4", "E4"], "w")])],
    [copiedPianoVoice(2)],
    [copiedPianoVoice(3), voice("piano-harmony", "down", [
        rest("q"), chord(["F#4", "A4", "C#5"], "q"),
        chord(["G4", "B4", "D5"], "q", { tieToNext: true }),
        chord(["G4", "B4", "D5"], "q"),
    ])],
    [voice("piano-upper", "up", [
        chord(["G4", "B4", "D5"], "h"), chord(["D4", "F4", "A4"], "h"),
    ])],
    [copiedPianoVoice(5), voice("piano-harmony", "down", [chord(["Eb3", "G3", "Bb3"], "q"), rest("hd")])],
    [copiedPianoVoice(6)],
    [voice("piano-upper", "up", [chord(["C4", "E4", "G4"], "w")])],
    [voice("piano-upper", "up", [chord(["G4", "C5"], "q"), chord(["Ab4", "C5"], "q"), chord(["A4", "C5"], "q"), chord(["C4", "E4", "G4"], "q")])],
    [copiedPianoVoice(9), voice("piano-harmony", "down", [chord(["E3", "G3", "C4"], "q"), rest("hd")])],
    [copiedPianoVoice(10)],
    [copiedPianoVoice(11), voice("piano-harmony", "down", [
        rest("q"), chord(["D#4", "F#4", "A4"], "q"),
        chord(["E4", "G#4", "B4"], "q"), chord(["E4", "G4", "B4"], "q", { tieToNext: true }),
    ])],
    [copiedPianoVoice(12), voice("piano-harmony", "down", [chord(["E4", "G4", "B4"], "w")])],
    [copiedPianoVoice(13), voice("piano-harmony", "down", [chord(["E3", "G3", "B3"], "w")])],
    [copiedPianoVoice(14), voice("piano-harmony", "down", [chord(["F3", "A3", "C4"], "w")])],
    [copiedPianoVoice(15), voice("piano-harmony", "down", [chord(["F#3", "A3", "C#4"], "w")])],
    [
        voice("piano-upper", "up", [chord(["G#3", "C4", "E4"], "h"), note("C4", "8"), note("D4", "8"), note("C4", "q")]),
        voice("piano-harmony", "down", [chord(["E3", "G#3", "B3"], "w")]),
    ],
    [voice("piano-upper", "up", [chord(["C3", "Eb3", "G3"], "w")])],
    [voice("piano-upper", "up", [rest("w")])],
  ];
  const q3bBassVoices = [
    [voice("piano-bass", "down", [note("D2", "h"), chord(["D#3", "F#3", "A3", "C4"], "h")])],
    [voice("piano-bass", "down", [note("C2", "h"), chord(["C3", "E3", "G3", "C4"], "h")])],
    [voice("piano-bass", "down", [note("A1", "h"), chord(["D#3", "F#3", "A3", "C4"], "h")])],
    [voice("piano-bass", "down", [note("D2", "h"), chord(["D3", "G3", "B3", "D4"], "h")])],
    [voice("piano-bass", "down", [chord(["D3", "G3", "B3", "D4"], "h"), chord(["D3", "F3", "A3", "C4"], "h")])],
    [voice("piano-bass", "down", [note("F2", "h"), chord(["Bb2", "D3", "F3", "Bb3"], "h")])],
    [voice("piano-bass", "down", [chord(["Ab2", "C3", "Eb3", "Ab3"], "h"), note("D3", "h")])],
    [voice("piano-bass", "down", [note("F3", "h"), note("D3", "h")])],
    [voice("piano-bass", "down", [note("C2", "h"), note("D2", "h")])],
    [voice("piano-bass", "down", [note("E2", "h"), chord(["F#2", "A2", "C3", "E3"], "h")])],
    [voice("piano-bass", "down", [note("A1", "h"), chord(["A2", "C#3", "E3", "A3"], "h")])],
    [voice("piano-bass", "down", [note("D2", "h"), chord(["D#3", "F#3", "A3", "C4"], "h")])],
    [voice("piano-bass", "down", [chord(["E3", "G#3", "B3", "D4"], "h"), chord(["E3", "G3", "B3", "D4"], "h")])],
    [voice("piano-bass", "down", [note("C2", "h"), chord(["D3", "F3", "B3"], "h")])],
    [voice("piano-bass", "down", [chord(["F#3", "A3", "C4", "E4"], "h"), note("G1", "h")])],
    [voice("piano-bass", "down", [note("F#2", "h"), chord(["A2", "C#3", "F#3", "A3"], "h")])],
    [voice("piano-bass", "down", [rest("q"), note("D2", "hd")])],
    [
        voice("bass-upper", "up", [rest("q"), chord(["G2", "C3", "E3"], "q"), chord(["F2", "A2", "C3"], "q"), chord(["G2", "C3", "E3"], "q")]),
        voice("piano-bass", "down", [note("C2", "w")]),
    ],
    [
        voice("bass-upper", "up", [chord(["C3", "E3", "G3"], "h"), chord(["C3", "E3", "G3"], "h")]),
        voice("piano-bass", "down", [rest("q"), note("D2", "q"), rest("q"), note("D2", "q")]),
    ],
  ];
  const q3bMeasures = q3bVocal.map((vocalEvents, index) => {
    const measure = staffMeasure(
      vocalEvents,
      q3bTrebleVoices[index],
      q3bBassVoices[index],
      { systemBreakAfter: [4, 9, 14, 18].includes(index) }
    );
    if (index === 18) measure.endBarline = "final";
    return measure;
  });

  const q3b = getQuestion("nzqa-2025-joel-context");
  Object.assign(q3b, {
    sourceType: "nzqa-reference",
    source: officialSource("(b)", "Extract Eight", "24–42", "bars 24–42, exam pp.10–11; schedule p.9"),
    title: "Reference: Billy Joel harmonic rhythm and tonality",
    internalTitle: "Reference: Billy Joel harmonic rhythm and tonality",
    studentTitle: "Reference: analyse harmonic rhythm and tonality",
    context: "Discuss the harmonic rhythm and the tonality in bars 24–42. Support each response with specific evidence from the score.",
    studentContext: "Discuss the harmonic rhythm and the tonality in bars 24–42. Support each response with specific evidence from the score.",
    hiddenConceptTerms: ["1–1–2", "circle of fifths"],
    sourceSpec: {
      transcriptionMode: "exact", year: 2025, provider: "NZQA", question: "Question Three", part: "(b)", bars: "24–42",
      printedBars: "24–42", printedMeasureCount: 19, staffLayout: "vocal-piano", staffNames: ["vocal", "treble", "bass"],
      keyCentres: ["C major"], expectedChordCount: 0,
      responseFields: ["harmonic-rhythm", "tonality-features"],
      perMeasureStaffVoiceEventCounts: scoreVoiceCounts(q3bMeasures),
      staffVoiceRhythmSignatures: scoreRhythms(q3bMeasures),
    },
    score: {
      key: "C major", keySignature: "C", timeSignature: "4/4", layout: "vocal-piano",
      minimumEngravingWidth: 720, barNumbers: Array.from({ length: 19 }, (_, index) => index + 24),
      authoredSystemBreaks: true,
      sourceKeyCentres: ["C major"],
      caption: "NZQA examination reference • 2025 Question Three (b), Extract Eight • bars 24–42 transcription",
      studentCaption: "NZQA examination reference • 2025 Question Three (b) • Extract Eight",
      measures: q3bMeasures, harmonicEvents: [],
    },
    interaction: {
      type: "contextual-analysis", allowPaper: true, reflectionOnly: true,
      fields: [
        { id: "harmonic-rhythm", label: "Harmonic rhythm", kind: "text", prompt: "Describe the rate and pattern of chord changes, citing bars or chords.", acceptedAnswers: [{ label: "Chords change every one or two bars; the later 1–1–2 pattern gives extra weight to selected G, F, A and G harmonies." }] },
        { id: "tonality-features", label: "Tonality and specific features", kind: "text", prompt: "Describe the tonal movement and support it with specific harmonic evidence.", acceptedAnswers: [{ label: "The bridge moves away from C major through dominant–tonic and circle-of-fifths motion, seventh and major-seventh colour, and changes from major to minor such as G to G minor and A to A minor." }] },
      ],
    },
    answerHeading: "Published schedule evidence",
    answer: [
      "Harmonic rhythm: chords change every one or two bars, settling into a 1–1–2 pattern that gives particular emphasis to G, F, A and G.",
      "Tonality and specific features: the passage moves away from C major through dominant–tonic and circle-of-fifths motion, seventh and major-seventh additions, and colour changes such as G major to G minor and A major to A minor.",
    ],
  });

  const q3cVocal = [
    [note("A4", "q"), note("G4", "h"), rest("8", { tuplet: triplet("c14") }), note("E4", "8", { tuplet: triplet("c14") }), note("D4", "8", { tuplet: triplet("c14") })],
    [note("E4", "8"), note("A4", "qd"), note("C5", "8"), note("B4", "8"), note("B4", "q", { tieToNext: true })],
    [note("B4", "h"), rest("h")],
    [rest("h"), rest("q"), note("G4", "8", { tuplet: triplet("c17") }), note("A4", "8", { tuplet: triplet("c17") }), note("G4", "8", { tuplet: triplet("c17") })],
    [note("A4", "8"), note("B4", "qd", { tieToNext: true }), note("B4", "q"), note("A4", "8"), note("F4", "8")],
    [note("E4", "h"), rest("h")], [rest("w")], [rest("w")], [rest("w")], [rest("w")],
  ];
  const q3cChordLabels = [
    { measure: 1, beat: 1, label: "Am7" }, { measure: 1, beat: 3, label: "Cmaj7/G" },
    { measure: 2, beat: 1, label: "F" }, { measure: 2, beat: 3, label: "C/E" },
    { measure: 3, beat: 1, label: "D9" }, { measure: 4, beat: 1, label: "F9" },
    { measure: 5, beat: 1, label: "G9" }, { measure: 6, beat: 1, label: "Am7" },
    { measure: 6, beat: 4, label: "D7" }, { measure: 8, beat: 1, label: "Am7" },
    { measure: 8, beat: 4, label: "G" }, { measure: 9, beat: 3, label: "F/G" },
    { measure: 10, beat: 1, label: "Am7" }, { measure: 10, beat: 4, label: "G" },
  ];
  const copiedPianoEvents = (events) => events.map((event) => event.rest
    ? { ...event }
    : { ...event, pitches: [event.pitch], pitch: undefined });
  const d9PianoFigure = () => [
    chord(["F#3", "A3", "C4", "E4"], "qd"), note("E4", "8"),
    chord(["A4", "C5"], "8"), chord(["C5", "E5"], "8"),
    note("E4", "8"), note("A3", "8"),
  ];
  const q3cModelHarmony = [
    {
      upper: copiedPianoEvents(q3cVocal[0]),
      inner: [chord(["C4", "E4"], "h"), chord(["B3", "C4", "E4"], "h")],
      bass: [chord(["A2", "E3"], "h"), chord(["G2", "E3"], "h")],
    },
    {
      upper: copiedPianoEvents(q3cVocal[1]),
      inner: [chord(["A3", "C4"], "h"), chord(["G3", "C4"], "h")],
      bass: [chord(["F2", "C3"], "h"), chord(["E2", "C3"], "h")],
    },
    {
      upper: copiedPianoEvents(q3cVocal[2]),
      inner: d9PianoFigure(),
      bass: [note("D2", "w")],
    },
    {
      upper: copiedPianoEvents(q3cVocal[3]),
      inner: [chord(["A3", "C4", "Eb4", "G4"], "w")],
      bass: [note("F2", "w")],
    },
    {
      upper: copiedPianoEvents(q3cVocal[4]),
      inner: [note("G4", "w")],
      bass: [note("G2", "h"), chord(["F3", "A3", "B3", "D4"], "h")],
    },
    {
      upper: copiedPianoEvents(q3cVocal[5]),
      inner: [chord(["G3", "A3", "C4", "E4"], "hd"), chord(["F#3", "A3", "C4", "D4"], "q", { tieToNext: true })],
      bass: [note("A2", "hd"), note("D2", "q", { tieToNext: true })],
    },
    {
      upper: [],
      inner: [
        chord(["F#3", "A3", "C4", "D4"], "qd"), note("E4", "8"),
        chord(["B4", "E5"], "8"), chord(["C5", "E5"], "8"),
        note("E4", "8"), note("C4", "8"),
      ],
      bass: [note("D2", "w")],
    },
    {
      upper: [],
      inner: [chord(["G3", "A3", "C4", "E4"], "hd"), chord(["G3", "B3", "D4"], "q", { tieToNext: true })],
      bass: [note("A2", "hd"), note("G2", "q", { tieToNext: true })],
    },
    {
      upper: [],
      inner: [
        chord(["G3", "B3", "D4"], "q", { tuplet: triplet("pc22-1", { bracketed: true }) }),
        note("A3", "8", { tuplet: triplet("pc22-1", { bracketed: true }) }),
        note("A3", "8", { tuplet: triplet("pc22-2") }),
        note("B3", "8", { tuplet: triplet("pc22-2") }),
        note("D4", "8", { tuplet: triplet("pc22-2") }),
        chord(["F3", "A3", "C4", "D4"], "q"), note("D4", "q"),
      ],
      bass: [note("G2", "h"), note("G2", "h")],
    },
    {
      upper: [],
      inner: [chord(["G3", "A3", "C4", "E4"], "hd"), chord(["G3", "B3", "D4"], "q")],
      bass: [note("A2", "hd"), note("G2", "q")],
    },
  ];
  const q3cMeasures = q3cVocal.map((vocalEvents, index) => {
    const { upper, inner, bass } = q3cModelHarmony[index];
    const measure = staffMeasure(
      vocalEvents,
      [
        ...(upper.length ? [voice("piano-upper", "up", upper)] : []),
        voice("piano-inner", "down", inner),
      ],
      [voice("piano-bass", "down", bass)],
      { systemBreakAfter: [2, 6, 9].includes(index) }
    );
    measure.questionStaffVoices = index === 0 || index === 9
      ? JSON.parse(JSON.stringify(measure.staffVoices))
      : { vocal: [voice("vocal", "up", JSON.parse(JSON.stringify(vocalEvents)))], treble: [], bass: [] };
    if (index === 8) measure.endBarline = "repeat-end";
    if (index === 9) measure.endBarline = "final";
    return measure;
  });
  const q3cTargetLabels = ["F", "C/E", "D9", "F9", "G9", "Am7", "D7", "Am7", "G", "F/G"];
  const q3cTargetLocations = [[2, 1], [2, 3], [3, 1], [4, 1], [5, 1], [6, 1], [6, 4], [8, 1], [8, 4], [9, 3]];
  const q3cHarmonicEvents = q3cTargetLabels.map((label, index) => ({
    measure: q3cTargetLocations[index][0], beat: q3cTargetLocations[index][1],
    analysisBox: false, answerRole: "supplied", questionLabel: label, modelLabel: label,
  }));
  const q3cRhythmCues = [
    { measure: 2, beat: 1, duration: "h", label: "F" }, { measure: 2, beat: 3, duration: "h", label: "C/E" },
    { measure: 3, beat: 1, duration: "w", label: "D9" }, { measure: 4, beat: 1, duration: "w", label: "F9" },
    { measure: 5, beat: 1, duration: "w", label: "G9" }, { measure: 6, beat: 1, duration: "hd", label: "Am7" },
    { measure: 6, beat: 4, duration: "q", label: "D7" }, { measure: 7, beat: 1, duration: "w", label: "D7 continuation" },
    { measure: 8, beat: 1, duration: "hd", label: "Am7" }, { measure: 8, beat: 4, duration: "q", label: "G" },
    { measure: 9, beat: 1, duration: "h", label: "G continuation" }, { measure: 9, beat: 3, duration: "h", label: "F/G" },
  ];

  const q3c = getQuestion("nzqa-2025-joel-piano");
  Object.assign(q3c, {
    sourceType: "nzqa-reference",
    source: officialSource("(c)", "Extract Nine", "14–22", "bars 14–22, exam p.12; schedule p.10"),
    title: "Reference: Billy Joel piano completion",
    internalTitle: "Reference: Billy Joel piano completion",
    studentTitle: "Reference: complete the printed piano texture on paper",
    context: "Using the supplied chord symbols and rhythmic cues, complete the piano part on paper. Bar 14 establishes the style; retain the vocal line and continue the piano writing through bars 15–22, including the first ending.",
    studentContext: "Using the supplied chord symbols and rhythmic cues, complete the piano part on paper. Bar 14 establishes the style; retain the vocal line and continue the piano writing through bars 15–22, including the first ending.",
    hiddenConceptTerms: [],
    sourceSpec: {
      transcriptionMode: "exact", year: 2025, provider: "NZQA", question: "Question Three", part: "(c)", bars: "14–22",
      printedBars: "14–22", printedMeasureCount: 10, extraPartialMeasureCount: 1,
      printedBarNumbers: [14, 15, 16, 17, 18, 19, 20, 21, 22, 22],
      staffLayout: "vocal-piano", staffNames: ["vocal", "treble", "bass"], keyCentres: ["C major"],
      sourceChordLabels: q3cChordLabels.map((item) => item.label),
      chordSymbols: [], analysisPositions: 10, answerPositions: 0, expectedChordCount: 10,
      completionHarmony: q3cTargetLabels, rhythmCueCount: 12,
      completionContract: { suppliedMeasure: 1, targetMeasures: [2, 3, 4, 5, 6, 7, 8, 9], chordsToRealise: 10, harmonicIndications: 10, blankTargetStaffVoices: ["treble", "bass"] },
      perMeasureStaffVoiceEventCounts: scoreVoiceCounts(q3cMeasures),
      staffVoiceRhythmSignatures: scoreRhythms(q3cMeasures),
      questionStaffVoiceEventCounts: scoreVoiceCounts(q3cMeasures, "questionStaffVoices"),
      questionStaffVoiceRhythmSignatures: scoreRhythms(q3cMeasures, "questionStaffVoices"),
    },
    score: {
      key: "C major", keySignature: "C", timeSignature: "4/4", layout: "vocal-piano", completion: true,
      minimumEngravingWidth: 720, barNumbers: [14, 15, 16, 17, 18, 19, 20, 21, 22, 22],
      authoredSystemBreaks: true,
      sourceKeyCentres: ["C major"],
      caption: "NZQA examination reference • 2025 Question Three (c), Extract Nine • bars 14–22",
      studentCaption: "NZQA examination reference • 2025 Question Three (c) • printed completion score",
      modelCaption: "Published schedule sample realisation • 2025 Question Three (c)",
      measures: q3cMeasures, harmonicEvents: q3cHarmonicEvents,
      sourceChordLabels: q3cChordLabels, rhythmCues: q3cRhythmCues,
      endings: [
        { startMeasure: 8, endMeasure: 9, label: "1.", navigation: "D.S. al Coda" },
        { startMeasure: 10, endMeasure: 10, label: "2." },
      ],
    },
    interaction: {
      type: "paper-completion", allowPaper: true, completionType: "piano",
      targetMeasures: [2, 3, 4, 5, 6, 7, 8, 9], chordsToRealise: 10,
      completionRequirements: {
        suppliedStyleMeasure: 1,
        targetMeasures: [2, 3, 4, 5, 6, 7, 8, 9],
        chordsToRealise: 10,
        retainVocalLine: true,
      },
      selfCheck: [
        "I retained the printed vocal line and completed only the piano staves.",
        "My voicings realise all ten printed chord indications at the shown rhythmic positions.",
        "My continuation follows the register and spacing established in bar 14 and remains playable.",
        "I observed the first and second endings and the D.S. al Coda instruction.",
      ],
      printOrientation: "landscape",
    },
    answerHeading: "One possible model completion",
    answer: ["The published schedule sample realises the ten printed harmonies F–C/E–D9–F9–G9–Am7–D7–Am7–G–F/G while retaining the vocal line, the printed rhythmic framework, and both endings. Other stylistically appropriate realisations are possible."],
  });
})();
