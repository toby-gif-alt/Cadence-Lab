/*
 * Hand-authored AS 91421 teaching templates.
 *
 * This file contains no transposition, random chord selection or procedural
 * music generator. The small helpers below only keep repeated metadata and
 * assessment wording consistent; every note, rhythm and harmonic event is
 * explicitly authored in the question data.
 */

const keyRelationships = window.CadenceKeyRelationships;
if (!keyRelationships) {
  throw new Error("Cadence Lab key-relationship semantics must load before the question bank.");
}

const sourceTypeNames = {
  mixed: "Mixed sources",
  "nzqa-reference": "NZQA reference",
  "original-practice": "Original practice",
};

const categoryNames = {
  mixed: "Mixed practice",
  analysis: "Roman numeral analysis",
  modulation: "Keys and modulation",
  satb: "SATB / vocal completion",
  piano: "Piano completion",
  jazz: "Jazz / rock notation",
  features: "Harmonic or tonal feature",
};

const rubricByCategory = {
  analysis: {
    tasks: {
      A: ["Identify individual chords using Roman numerals, including inversions where shown."],
      M: ["Analyse a secure run of consecutive chords in the correct local key."],
      E: ["Complete the extended analysis and explain any pivot or contextual chord function."],
    },
    criteria: {
      A: ["Several isolated chords are correct relative to the stated key."],
      M: ["A consecutive progression is secure, including relevant inversions or sevenths."],
      E: ["The near-complete progression and any pivot or contextual function are explained with precise evidence."],
    },
  },
  modulation: {
    tasks: {
      A: ["Identify at least one local key centre."],
      M: ["Support the key centres with accidentals, chord functions or cadence evidence."],
      E: ["Explain the relationships to the tonic and how the harmony moves between the keys."],
    },
    criteria: {
      A: ["At least one key is identified correctly."],
      M: ["The key identifications are supported by relevant musical evidence."],
      E: ["The key relationships and harmonic route are analysed comprehensively."],
    },
  },
  satb: {
    tasks: {
      A: ["Supply chord tones in the missing voices."],
      M: ["Join consecutive chords with singable voice leading and correct tendency-note resolutions."],
      E: ["Complete the full phrase convincingly in chorale style, avoiding crossing and exposed parallels."],
    },
    criteria: {
      A: ["Several isolated chords contain appropriate chord tones."],
      M: ["A secure consecutive passage has controlled spacing and tendency-note resolution."],
      E: ["The entire realisation is stylistically convincing, singable and free of significant part-writing errors."],
    },
  },
  piano: {
    tasks: {
      A: ["Supply bass notes and chord tones that match the indications."],
      M: ["Continue the accompaniment pattern through a secure consecutive progression."],
      E: ["Realise the full phrase convincingly, preserving texture, register and cadence shape."],
    },
    criteria: {
      A: ["Several isolated bass notes or chords are correct."],
      M: ["The accompaniment forms a connected progression in a consistent piano texture."],
      E: ["The extended realisation is fluent, stylistically appropriate and tonally convincing."],
    },
  },
  jazz: {
    tasks: {
      A: ["Identify chord roots and basic qualities using jazz / rock notation."],
      M: ["Analyse a consecutive progression, including sevenths, additions and slash bass notes."],
      E: ["Complete the extended analysis and explain a contextual harmonic function or device."],
    },
    criteria: {
      A: ["Several chord roots and qualities are correct."],
      M: ["A consecutive sequence includes the defining extensions and bass notes."],
      E: ["The extended progression and its contextual harmonic effect are explained with precise evidence."],
    },
  },
  features: {
    tasks: {
      A: ["Identify the named harmonic or tonal feature."],
      M: ["Describe how it operates, using evidence from the displayed notes and rhythm."],
      E: ["Analyse its function and effect across the whole phrase."],
    },
    criteria: {
      A: ["The feature is identified accurately."],
      M: ["Its operation is explained with relevant score evidence."],
      E: ["Its wider tonal, harmonic or expressive function is analysed comprehensively."],
    },
  },
};

function originalSource(focus) {
  return {
    creator: "Cadence Lab",
    title: focus,
    acknowledgement: "Original practice material written for Cadence Lab.",
  };
}

function nzqaSource(year, question, part, extract, creator, title, location) {
  return {
    year,
    question,
    part,
    extract,
    creator,
    title,
    location,
    acknowledgement:
      "Teaching transcription of the named 2021–2024 NZQA examination extract; task layout and answer evidence checked against the matching published assessment schedule.",
  };
}

function measuredScore(config) {
  return {
    timeSignature: "4/4",
    measuresPerSystem: 2,
    ...config,
  };
}

function harmonicBox(measure, beat, event, modelLabel, details = {}) {
  return {
    measure,
    beat,
    event,
    analysisBox: true,
    modelLabel,
    ...details,
  };
}

const studentPresentationById = {
  "nzqa-2021-bach-pivots": {
    title: "Reference: Roman numeral and modulation analysis",
    context:
      "The first nine labels are supplied as in the paper. Analyse the ten blank positions in bars 4–8 and show how the shared harmonies connect the stated key areas.",
    hiddenConceptTerms: ["pivot chord", "pivot chords", "two related-key pivots"],
  },
  "nzqa-2022-bach-c-aminor": {
    title: "Reference: Roman numeral and modulation analysis",
    context:
      "Keep the supplied opening and closing labels, analyse the blank positions, mark both cadences, and show how the shared first-inversion harmony connects the stated key areas.",
    hiddenConceptTerms: ["pivot chord", "pivot chords", "pivot into"],
  },
  "analysis-c-g": {
    title: "Original: Roman numeral and modulation analysis",
    hiddenConceptTerms: ["pivot chord"],
  },
  "analysis-a-c": {
    title: "Original: Roman numeral and modulation analysis",
    context:
      "The passage changes key. Analyse the consecutive harmonies, identify the shared chord, and label it in both local keys.",
    hiddenConceptTerms: ["pivot chord"],
  },
  "analysis-gminor-bflat": {
    title: "Original: Roman numeral and modulation analysis",
    context:
      "The passage moves from G minor to a related major key. Analyse the consecutive harmonies, include inversion figures, and label the shared chord in both keys.",
    hiddenConceptTerms: ["relative-major pivot", "pivot chord"],
  },
  "nzqa-2024-bach-analysis": {
    title: "Reference: Roman numeral and modulation analysis",
    context:
      "Analyse the 13 blank positions after the five supplied labels, show how the shared harmony connects the stated key areas, and explain chord X's cadential function.",
    hiddenConceptTerms: ["pivot chord", "diminished seventh", "pivot and diminished seventh"],
  },
  "modulation-d-g-f": {
    title: "Original: identify two related key regions",
    context:
      "The passage begins in D minor. Identify the temporary region X and the final region Y, give cadence evidence, and explain each relationship to D minor.",
    hiddenConceptTerms: ["G minor", "F major"],
  },
  "nzqa-2023-bach-key-regions": {
    title: "Reference: identify and support the key regions",
    hiddenConceptTerms: [],
  },
  "modulation-c-g-e": {
    title: "Original: identify two temporary key regions",
    context:
      "The passage begins in C major. Identify X and Y, give exact cadence evidence, and state each relationship to C major.",
    hiddenConceptTerms: ["G major", "E minor"],
  },
  "modulation-a-fsharp": {
    title: "Original: identify the closing key",
    context:
      "The passage begins in A major. Identify the final key, state its relationship to A major, and explain the harmonic function of the altered note in the approach to the cadence.",
    hiddenConceptTerms: ["F-sharp minor", "F♯ minor", "raised leading note"],
  },
  "modulation-gminor-eb-f": {
    title: "Original: identify two related key regions",
    context:
      "The passage begins in G minor and moves through two related key regions. Identify X and Y, give musical evidence for each key, and describe each relationship to G minor.",
    hiddenConceptTerms: ["E-flat major", "E♭ major", "F major", "relative of dominant"],
  },
  "modulation-e-b-csharp": {
    title: "Original: identify two local key centres",
    context:
      "The passage begins in E major. Identify X and Y, describe each relationship to E major, and explain how the altered notes clarify the two local keys.",
    hiddenConceptTerms: ["B major", "C-sharp minor", "C♯ minor"],
  },
  "nzqa-2024-bach-satb": {
    title: "Reference: complete the four-part texture",
    hiddenConceptTerms: [],
  },
  "satb-f-c": {
    title: "Original: complete the inner parts",
    context:
      "Complete alto and tenor beneath the supplied outer parts. Maintain smooth common-tone voice leading through the key change and resolve tendency notes correctly.",
    hiddenConceptTerms: [],
  },
  "satb-gminor": {
    title: "Original: complete the inner parts",
    context:
      "Fill the inner parts while keeping the supplied soprano and bass intact. Handle the raised leading note and resolve the dominant seventh by step.",
    hiddenConceptTerms: [],
  },
  "satb-c-aminor": {
    title: "Original: complete the inner parts",
    context:
      "Complete the alto and tenor lines through the move from C major to A minor. Keep each voice in range and resolve the closing minor-key tendency note correctly.",
    hiddenConceptTerms: [],
  },
  "piano-d-f": {
    title: "Original: complete the piano accompaniment",
    context:
      "Continue the quaver accompaniment beneath the supplied melody. Preserve the opening pattern and make the final cadence clear.",
    hiddenConceptTerms: ["F major"],
  },
  "piano-a-fsharp": {
    title: "Original: complete the piano texture",
    context:
      "Complete the missing bass and inner notes while retaining the crotchet chord pattern. Resolve the altered chord tone convincingly.",
    hiddenConceptTerms: ["F-sharp minor", "F♯ minor", "E-sharp", "E♯"],
  },
  "piano-g-c": {
    title: "Original: continue the accompaniment",
    context:
      "Continue the left-hand pattern after the rest and shape the second phrase toward a clear cadence. Keep the tied melody note visible across the barline.",
    hiddenConceptTerms: ["C major"],
  },
  "piano-bflat-gminor": {
    title: "Original: complete the piano accompaniment",
    context:
      "Complete the chordal accompaniment under the dotted melody. Retain the 3/4 metre and make the final dominant-to-tonic motion clear.",
    hiddenConceptTerms: ["G minor"],
  },
  "nzqa-2021-valentine-techniques": {
    title: "Reference: chord and harmonic-feature analysis",
    context:
      "Complete the chord boxes above bars 21–29, classify the marked X, Y and Z melody notes, and explain the two harmonic techniques operating in bars 21–25.",
    hiddenConceptTerms: ["tonic pedal", "pedal point", "minor-line harmony"],
  },
  "nzqa-2024-commercial-chromatic-bass": {
    title: "Reference: chord and bass-line analysis",
    context:
      "Analyse the eleven boxed positions in bars 19–28, including both sonorities in bar 23, then explain the bass movement and rate of harmonic change in bars 24–28.",
    hiddenConceptTerms: ["chromatic bass", "one chord per bar"],
  },
  "jazz-c-turnaround": {
    title: "Original: analyse the chord sequence",
    context:
      "Write a complete chord symbol in every box and explain how the chromatic sonority extends the turnaround. Include every added tone shown in the final voicing.",
    hiddenConceptTerms: ["secondary dominant", "A7", "added sixth"],
  },
  "jazz-e-turnaround": {
    title: "Original: analyse the chord sequence",
    context:
      "Name every chord completely, including any sevenths or added tones. Explain how the chromatic sonority redirects the progression.",
    hiddenConceptTerms: ["C-sharp 7", "C♯7", "secondary dominant", "added sixth"],
  },
  "jazz-blues-secondary": {
    title: "Original: analyse the chord sequence",
    context:
      "Identify the eight chord symbols and explain how the linking chord connects the preceding seventh chord to the tonic over G.",
    hiddenConceptTerms: ["diminished seventh", "diminished link"],
  },
  "jazz-sus-line": {
    title: "Original: analyse the extended chords",
    context:
      "Name every extended chord, treat the internal note change within the held harmony accurately, and explain its effect on the approach to the cadence.",
    hiddenConceptTerms: ["suspended dominant", "G7sus4", "suspension"],
  },
  "nzqa-2023-poulenc-pedal": {
    title: "Reference: identify the bass device",
    context:
      "Identify the compositional device in the bass of this 3/8 opening and explain its tonal and expressive effect beneath the changing melody and inner parts.",
    hiddenConceptTerms: ["tonic pedal", "pedal point"],
  },
  "feature-diminished": {
    title: "Original: analyse chord X",
    hiddenConceptTerms: ["diminished seventh", "diminished-seventh"],
  },
  "feature-pedal": {
    title: "Original: identify and explain the bass device",
    hiddenConceptTerms: ["tonic pedal", "pedal point", "tonic-pedal"],
  },
  "feature-chromatic-bass": {
    title: "Original: analyse the bass movement",
    hiddenConceptTerms: ["chromatic bass", "descending chromatic bass"],
  },
  "feature-nonharmonic": {
    title: "Original: classify the marked note",
    context:
      "The active harmony remains Gmaj7 for the whole bar. Classify F-sharp and the marked A at beat 2 in relation to that harmony, and justify each classification.",
    hiddenConceptTerms: ["passing note", "chord tone", "chordal"],
  },
  "feature-harmonic-rhythm": {
    title: "Original: compare the rate of harmonic change",
    context:
      "Compare the rate of harmonic change across all three measures and explain how the changing rate shapes the cadence. Cite the displayed beats and barlines.",
    hiddenConceptTerms: ["harmonic-rhythm acceleration", "accelerating harmonic rhythm", "acceleration"],
  },
};

const completionInteractions = {
  "nzqa-2024-bach-satb": {
    type: "notation-completion",
    editableRegions: [
      { measures: [2, 3], voices: ["soprano", "alto", "tenor", "bass"] },
    ],
  },
  "satb-f-c": {
    type: "notation-completion",
    editableRegions: [
      { measures: [1, 2, 3], voices: ["alto", "tenor"] },
    ],
  },
  "satb-gminor": {
    type: "notation-completion",
    editableRegions: [
      { measures: [1, 2, 3], voices: ["alto", "tenor"] },
    ],
  },
  "satb-c-aminor": {
    type: "notation-completion",
    editableRegions: [
      { measures: [1, 2, 3], voices: ["alto", "tenor"] },
    ],
  },
  "piano-d-f": {
    type: "notation-completion",
    editableRegions: [
      { measures: [2, 3], voices: ["treble", "bass"] },
    ],
  },
  "piano-a-fsharp": {
    type: "notation-completion",
    editableRegions: [
      { measures: [2, 3], voices: ["treble", "bass"] },
    ],
  },
  "piano-g-c": {
    type: "notation-completion",
    editableRegions: [
      { measures: [2, 3], voices: ["treble", "bass"] },
    ],
  },
  "piano-bflat-gminor": {
    type: "notation-completion",
    editableRegions: [
      { measures: [2, 3], voices: ["treble", "bass"] },
    ],
  },
};

const keyChoices = [
  "C major", "G major", "D major", "A major", "E major", "B major",
  "F♯ major", "C♯ major", "F major", "B♭ major", "E♭ major", "A♭ major",
  "D♭ major", "G♭ major", "A minor", "E minor", "B minor", "F♯ minor",
  "C♯ minor", "G♯ minor", "D minor", "G minor", "C minor", "F minor",
  "B♭ minor", "E♭ minor",
];

const nonHarmonicToneChoices = [
  "passing note",
  "accented passing note",
  "auxiliary / neighbour note",
  "suspension",
  "appoggiatura",
];

const harmonicTechniqueChoices = [
  "tonic pedal",
  "descending chromatic inner line",
  "descending chromatic bass",
  "sequence",
  "harmonic-rhythm change",
  "dominant pedal",
];

const featureResponses = {
  "nzqa-2023-poulenc-pedal": [
    ["feature", "Feature", ["tonic pedal"], [
      "tonic pedal", "dominant pedal", "ostinato bass", "descending chromatic bass",
    ]],
    ["function", "Function", ["tonal stability with upper-part friction"], [
      "tonal stability with upper-part friction", "increased instability without a tonal anchor",
      "a sequential bass pattern", "reduced harmonic tension",
    ]],
  ],
  "feature-diminished": [
    ["feature", "Chord X", ["F♯ diminished seventh"], [
      "F♯ diminished seventh", "F♯ minor seventh", "D7/F♯", "G diminished seventh",
    ]],
    ["function", "Function", ["vii°7/V"], [
      "vii°7/V", "vii°7", "V7/V", "common-tone diminished seventh",
    ]],
  ],
  "feature-pedal": [
    ["feature", "Feature", ["tonic pedal"], [
      "tonic pedal", "dominant pedal", "ostinato bass", "descending chromatic bass",
    ]],
    ["function", "Function", ["keeps the tonic present"], [
      "keeps the tonic present", "increases instability", "weakens the tonal centre",
      "creates a sequential bass pattern",
    ]],
  ],
  "feature-chromatic-bass": [
    ["feature", "Bass motion", ["descending chromatic bass"], [
      "descending chromatic bass", "ascending chromatic bass", "tonic pedal", "diatonic sequence",
    ]],
    ["effect", "Effect", ["creates momentum"], [
      "creates momentum", "creates greater stability", "slows the harmonic motion",
      "removes tonal direction",
    ]],
  ],
  "feature-nonharmonic": [
    ["f-sharp", "F♯", ["chord tone"], [
      "chord tone", "passing note", "auxiliary / neighbour note", "suspension", "appoggiatura",
    ]],
    ["a-natural", "A", ["passing note"], nonHarmonicToneChoices],
  ],
  "feature-harmonic-rhythm": [
    ["feature", "Pattern", ["accelerating harmonic rhythm"], [
      "accelerating harmonic rhythm", "regular harmonic rhythm", "decelerating harmonic rhythm",
      "static harmony",
    ]],
    ["effect", "Effect", ["increases urgency"], [
      "increases urgency", "creates greater repose", "weakens the cadence",
      "creates metrical ambiguity",
    ]],
  ],
};

const jazzDistractors = {
  "nzqa-2021-valentine-techniques": ["Cmaj7", "F7", "Gm7"],
  "nzqa-2024-commercial-chromatic-bass": ["F♯dim7/F", "E♯m7(♭5)", "D7"],
  "jazz-c-turnaround": ["C7", "Am7", "G7sus4"],
  "jazz-e-turnaround": ["E7", "C♯m7", "B7sus4"],
  "jazz-blues-secondary": ["F♯m7", "Cmaj7", "A♭7"],
  "jazz-sus-line": ["Gm7", "C7", "Amaj7"],
};

function harmonicAnswerRole(category, event) {
  if (event.analysisBox === false) return "none";
  if (["analysis", "jazz"].includes(category)) {
    return event.questionLabel ? "supplied" : "editable";
  }
  if (["satb", "piano"].includes(category)) {
    return event.questionLabel ? "supplied" : "none";
  }
  return "none";
}

function scoreWithExplicitAnswerRoles(config) {
  return {
    ...config.score,
    harmonicEvents: (config.score.harmonicEvents || []).map((event, index) => {
      const answerRole = event.answerRole || harmonicAnswerRole(config.category, event);
      return {
        ...event,
        answerRole,
        answerSlotId: answerRole === "editable"
          ? `${config.id}-h${index + 1}`
          : undefined,
      };
    }),
  };
}

function analysisInteraction(config, score) {
  return {
    type: "roman-analysis",
    allowPaper: true,
    keyChoices,
    slots: score.harmonicEvents.flatMap((event, harmonicIndex) =>
      event.answerRole === "editable"
        ? [{
            id: event.answerSlotId,
            harmonicIndex,
            label: `Bar ${event.measure}, beat ${event.beat || 1}`,
            acceptedAnswers: [{ label: event.modelLabel }],
            allowDualAnalysis: String(event.modelLabel || "").includes(" / "),
          }]
        : []
    ),
  };
}

function modulationInteraction(config) {
  const homeKey = keyRelationships.formatKey(config.homeKey);
  const regions = config.keyRegions || [];
  const semanticRegions = regions.map((region) => {
    const localKey = keyRelationships.formatKey(region.localKey);
    const relationship = keyRelationships.relationshipBetween(homeKey, localKey);
    const acceptedLabels = region.acceptedRelationshipLabels ||
      relationship.acceptedLabels;
    if (!relationship.acceptedLabels.includes(region.modelRelationship) ||
        acceptedLabels.some((label) => !relationship.acceptedLabels.includes(label))) {
      throw new Error(
        `${config.id}: ${homeKey} → ${localKey} has invalid relationship metadata.`
      );
    }
    return {
      ...region,
      localKey,
      relationship,
      acceptedLabels: [
        ...new Set([region.modelRelationship, ...acceptedLabels]),
      ],
    };
  });
  return {
    type: "key-modulation",
    allowPaper: true,
    homeKey,
    keyChoices,
    relationshipChoices: [
      ...new Set([
        ...keyRelationships.relationshipChoices,
        ...semanticRegions.flatMap((region) => region.acceptedLabels),
      ]),
    ],
    fields: semanticRegions.flatMap((region) => [
      {
        id: `${region.section.toLowerCase()}-key`,
        label: `${region.section} key`,
        kind: "key",
        homeKey,
        localKey: region.localKey,
        acceptedAnswers: [{ label: region.localKey }],
      },
      {
        id: `${region.section.toLowerCase()}-relationship`,
        label: `${region.section} relationship`,
        kind: "relationship",
        homeKey,
        localKey: region.localKey,
        semanticRelationship: {
          canonical: region.relationship.canonical,
          degree: region.relationship.degree,
        },
        acceptedAnswers: region.acceptedLabels.map((label) => ({ label })),
      },
    ]),
    evidencePrompt: "Optional: identify cadence, leading-note or accidental evidence.",
  };
}

function jazzInteraction(config, score) {
  const slots = score.harmonicEvents.flatMap((event, harmonicIndex) =>
    event.answerRole === "editable"
      ? [{
          id: event.answerSlotId,
          harmonicIndex,
          label: `Bar ${event.measure}, beat ${event.beat || 1}`,
          acceptedAnswers: [{ label: event.modelLabel || event.chordSymbol }],
        }]
      : []
  );
  const labels = [
    ...slots.map((slot) => slot.acceptedAnswers[0].label),
    ...(jazzDistractors[config.id] || []),
  ];
  const interaction = {
    type: "jazz-chord-placement",
    allowPaper: true,
    seed: `${config.id}-published-bank-v1`,
    slots,
    bank: labels.map((label, index) => ({
      id: `${config.id}-chord-${index + 1}`,
      label,
    })),
    advancedBuilder: true,
  };
  if (config.id === "nzqa-2021-valentine-techniques") {
    interaction.fields = [
      { id: "x", label: "X", kind: "classification", choices: nonHarmonicToneChoices, acceptedAnswers: [{ label: "auxiliary / neighbour note" }] },
      { id: "y", label: "Y", kind: "classification", choices: nonHarmonicToneChoices, acceptedAnswers: [{ label: "accented passing note" }] },
      { id: "z", label: "Z", kind: "classification", choices: nonHarmonicToneChoices, acceptedAnswers: [{ label: "appoggiatura" }] },
      { id: "technique-1", label: "Harmonic technique 1", kind: "classification", choices: harmonicTechniqueChoices, acceptedAnswers: [{ label: "descending chromatic inner line" }, { label: "tonic pedal" }] },
      { id: "technique-2", label: "Harmonic technique 2", kind: "classification", choices: harmonicTechniqueChoices, acceptedAnswers: [{ label: "descending chromatic inner line" }, { label: "tonic pedal" }] },
    ];
    interaction.unorderedFieldGroups = [{
      id: "harmonic-techniques",
      label: "Harmonic techniques",
      fieldIds: ["technique-1", "technique-2"],
      acceptedSets: [["descending chromatic inner line", "tonic pedal"]],
    }];
  }
  return interaction;
}

function featureInteraction(config) {
  return {
    type: "feature-analysis",
    allowPaper: true,
    fields: (featureResponses[config.id] || []).map(([id, label, answers, choices]) => ({
      id,
      label,
      kind: "classification",
      choices,
      acceptedAnswers: answers.map((answer) => ({ label: answer })),
    })),
    evidencePrompt: "Optional: cite the relevant pitches, bass motion, cadence or rate of change.",
  };
}

function universalInteraction(config, score) {
  if (config.category === "analysis") return analysisInteraction(config, score);
  if (config.category === "modulation") return modulationInteraction(config);
  if (config.category === "jazz") return jazzInteraction(config, score);
  if (config.category === "features") return featureInteraction(config);
  return null;
}

function neutralStudentCaption(config) {
  if (config.sourceType === "nzqa-reference") {
    return `NZQA reference • ${config.source.year} ${config.source.question} ${config.source.part} • ${config.source.extract}`;
  }
  return `Original Cadence Lab practice • ${categoryNames[config.category]}`;
}

function createQuestion(config) {
  const rubric = rubricByCategory[config.category];
  const presentation = studentPresentationById[config.id];
  if (!presentation) {
    throw new Error(`Missing student presentation audit for ${config.id}.`);
  }
  const score = scoreWithExplicitAnswerRoles(config);
  const interaction = config.interaction || completionInteractions[config.id] ||
    universalInteraction(config, score);
  return {
    ...config,
    internalTitle: config.internalTitle || config.title,
    studentTitle: presentation.title,
    studentContext: presentation.context || config.context,
    hiddenConceptTerms: presentation.hiddenConceptTerms,
    interaction,
    score: {
      ...score,
      studentCaption: neutralStudentCaption(config),
      accessibleLabel:
        config.category === "satb"
          ? "Question musical extract: four-part completion or analysis score."
          : config.category === "piano"
            ? "Question musical extract: two-stave piano completion score."
            : "Question musical extract for written harmonic or tonal analysis.",
    },
    tasks: config.tasks || rubric.tasks,
    criteria: config.criteria || rubric.criteria,
  };
}

const questionBank = [
  createQuestion({
    id: "nzqa-2021-bach-pivots",
    category: "analysis",
    sourceType: "nzqa-reference",
    source: nzqaSource(
      2021,
      "Question One",
      "(a)",
      "Extract One",
      "J. S. Bach",
      "Nun lob’, mein’ Seel’, den Herren",
      "bars 1–8, exam p.2; schedule p.3"
    ),
    family: "Roman numeral analysis",
    title: "Reference: two related-key pivots",
    context:
      "The first nine labels are supplied as in the paper. Analyse the ten blank positions in bars 4–8 and label both pivots in A major and F-sharp minor.",
    sourceSpec: {
      romanNumerals: ["I", "vi", "iii", "IV", "V7", "I6", "ii7", "V", "I", "I", "i6", "V6", "V7", "i", "V7", "I6", "ii7", "V", "I"],
      analysisPositions: 19,
      answerPositions: 10,
      keyCentres: ["A major", "F♯ minor"],
      suppliedLabels: ["A: I", "vi", "iii", "IV", "V⁷d", "Ib", "II⁷b", "V", "I"],
      measureCount: 9,
      independentSatb: true,
    },
    score: measuredScore({
      key: "A major → F♯ minor → A major",
      keySignature: "A",
      timeSignature: "3/4",
      layout: "satb",
      voiceLabels: { treble: ["S", "A"], bass: ["T", "B"] },
      labelPosition: "bottom",
      caption: "NZQA reference • 2021 Q1(a), Extract One • bars 1–8 transcription",
      measures: [
        { expectedBeats: 1, voices: {
          soprano: [{ pitch: "A4", duration: "q" }],
          alto: [{ pitch: "E4", duration: "q" }],
          tenor: [{ pitch: "C#4", duration: "q" }],
          bass: [{ pitch: "A3", duration: "q" }],
        } },
        { voices: {
          soprano: [{ pitch: "A4", duration: "h" }, { pitch: "G#4", duration: "q" }],
          alto: [{ pitch: "F#4", duration: "h" }, { pitch: "E4", duration: "q" }],
          tenor: [{ pitch: "C#4", duration: "h" }, { pitch: "C#4", duration: "q" }],
          bass: [{ pitch: "F#3", duration: "h" }, { pitch: "C#3", duration: "q" }],
        } },
        { voices: {
          soprano: [{ pitch: "F#4", duration: "h" }, { pitch: "E4", duration: "q" }],
          alto: [{ pitch: "D4", duration: "q" }, { pitch: "C#4", duration: "q" }, { pitch: "B3", duration: "q" }],
          tenor: [{ pitch: "A3", duration: "h" }, { pitch: "G#3", duration: "q" }],
          bass: [{ pitch: "D3", duration: "h" }, { pitch: "D3", duration: "q" }],
        } },
        { voices: {
          soprano: [{ pitch: "A4", duration: "q" }, { pitch: "B4", duration: "h" }],
          alto: [{ pitch: "E4", duration: "q" }, { pitch: "F#4", duration: "q" }, { pitch: "E4", duration: "q" }],
          tenor: [{ pitch: "A3", duration: "h" }, { pitch: "G#3", duration: "q" }],
          bass: [{ pitch: "C#3", duration: "q" }, { pitch: "D3", duration: "q" }, { pitch: "E3", duration: "q" }],
        } },
        { voices: {
          soprano: [{ pitch: "C#5", duration: "h" }, { pitch: "C#5", duration: "q" }],
          alto: [{ pitch: "E4", duration: "h" }, { pitch: "F#4", duration: "8" }, { pitch: "E4", duration: "8" }],
          tenor: [{ pitch: "A3", duration: "h" }, { pitch: "C#4", duration: "q" }],
          bass: [{ pitch: "A2", duration: "h" }, { pitch: "A3", duration: "q" }],
        } },
        { voices: {
          soprano: [{ pitch: "C#5", duration: "q" }, { pitch: "B4", duration: "q" }, { pitch: "C#5", duration: "q" }],
          alto: [{ pitch: "G#4", duration: "h" }, { pitch: "E#4", duration: "q" }],
          tenor: [{ pitch: "C#4", duration: "h" }, { pitch: "B3", duration: "q" }],
          bass: [{ pitch: "E#3", duration: "h" }, { pitch: "C#3", duration: "q" }],
        } },
        { voices: {
          soprano: [{ pitch: "C#5", duration: "h" }, { pitch: "B4", duration: "q" }],
          alto: [{ pitch: "F#4", duration: "h" }, { pitch: "G#4", duration: "q" }],
          tenor: [{ pitch: "A3", duration: "h" }, { pitch: "E4", duration: "q" }],
          bass: [{ pitch: "F#3", duration: "q" }, { pitch: "E3", duration: "q" }, { pitch: "D3", duration: "q" }],
        } },
        { voices: {
          soprano: [{ pitch: "A4", duration: "q" }, { pitch: "B4", duration: "h" }],
          alto: [{ pitch: "A4", duration: "h" }, { pitch: "G#4", duration: "q" }],
          tenor: [{ pitch: "E4", duration: "q" }, { pitch: "F#4", duration: "q" }, { pitch: "E4", duration: "q" }],
          bass: [{ pitch: "C#3", duration: "q" }, { pitch: "D3", duration: "q" }, { pitch: "E3", duration: "q" }],
        } },
        { expectedBeats: 2, endBarline: "final", voices: {
          soprano: [{ pitch: "A4", duration: "h" }],
          alto: [{ pitch: "E4", duration: "h" }],
          tenor: [{ pitch: "C#4", duration: "h" }],
          bass: [{ pitch: "A2", duration: "h" }],
        } },
      ],
      harmonicEvents: [
        harmonicBox(1, 1, 0, "A: I", { localKey: "A major", romanNumeral: "I", chordSymbol: "A", questionLabel: "A: I" }),
        harmonicBox(2, 1, null, "vi", { localKey: "A major", romanNumeral: "vi", chordSymbol: "F♯m", questionLabel: "vi" }),
        harmonicBox(2, 3, null, "iii", { localKey: "A major", romanNumeral: "iii", chordSymbol: "C♯m", questionLabel: "iii" }),
        harmonicBox(3, 1, null, "IV", { localKey: "A major", romanNumeral: "IV", chordSymbol: "D", questionLabel: "IV" }),
        harmonicBox(3, 3, null, "V⁷d", { localKey: "A major", romanNumeral: "V7", chordSymbol: "E7/D", questionLabel: "V⁷d" }),
        harmonicBox(4, 1, null, "Ib", { localKey: "A major", romanNumeral: "I6", chordSymbol: "A/C♯", questionLabel: "Ib" }),
        harmonicBox(4, 2, null, "ii⁷b", { localKey: "A major", romanNumeral: "ii7", chordSymbol: "Bm7/D", questionLabel: "II⁷b" }),
        harmonicBox(4, 3, null, "V", { localKey: "A major", romanNumeral: "V", chordSymbol: "E", questionLabel: "V" }),
        harmonicBox(5, 1, null, "I", { localKey: "A major", romanNumeral: "I", chordSymbol: "A", questionLabel: "I" }),
        harmonicBox(5, 2, null, "I", { localKey: "A major", romanNumeral: "I", chordSymbol: "A" }),
        harmonicBox(5, 3, null, "A: vib / f♯: ib", { localKey: "F♯ minor", romanNumeral: "i6", chordSymbol: "F♯m/A" }),
        harmonicBox(6, 1, null, "Vb", { localKey: "F♯ minor", romanNumeral: "V6", chordSymbol: "C♯/E♯" }),
        harmonicBox(6, 3, null, "V⁷", {
          localKey: "F♯ minor",
          romanNumeral: "V7",
          chordSymbol: "C♯7",
          validationPitches: ["C#5", "E#4", "B3"],
          bassPitch: "C#3",
          omittedChordIntervals: [7],
        }),
        harmonicBox(7, 1, null, "f♯: I / A: vi", { localKey: "F♯ minor", romanNumeral: "i", chordSymbol: "F♯m" }),
        harmonicBox(7, 3, null, "A: V⁷d", { localKey: "A major", romanNumeral: "V7", chordSymbol: "E7/D" }),
        harmonicBox(8, 1, null, "Ib", { localKey: "A major", romanNumeral: "I6", chordSymbol: "A/C♯" }),
        harmonicBox(8, 2, null, "ii⁷b", { localKey: "A major", romanNumeral: "ii7", chordSymbol: "Bm7/D" }),
        harmonicBox(8, 3, null, "V", { localKey: "A major", romanNumeral: "V", chordSymbol: "E" }),
        harmonicBox(9, 1, null, "I", { localKey: "A major", romanNumeral: "I", chordSymbol: "A" }),
      ],
    }),
    answerHeading: "Reference analysis",
    answer: [
      "<strong>Ten blank positions:</strong> A: I–vib / F♯ minor: ib–Vb–V7–i / A: vi–V7d–Ib–ii7b–V–I.",
      "F♯ minor is A major’s relative minor. F♯m/A is vib in A and ib in F♯ minor; the later F♯-minor tonic is reused as vi in A before the closing dominant and tonic.",
    ],
  }),
  createQuestion({
    id: "nzqa-2022-bach-c-aminor",
    category: "analysis",
    sourceType: "nzqa-reference",
    source: nzqaSource(
      2022,
      "Question One",
      "(a)",
      "Extract One",
      "J. S. Bach",
      "Was mein Gott will, das",
      "bars 0–5, exam p.2; schedule p.3"
    ),
    family: "Roman numeral analysis",
    title: "Reference: C major to A minor",
    context:
      "Keep the supplied C-major and closing cadence labels, analyse the blank positions, mark both cadences, and show the D-minor first-inversion pivot into A minor.",
    sourceSpec: {
      romanNumerals: ["vi", "iii", "IV", "I", "I6", "I64", "V", "I", "V", "ii", "iv6", "i", "i", "V", "i6", "V", "i"],
      analysisPositions: 17,
      answerPositions: 10,
      keyCentres: ["C major", "A minor"],
      suppliedLabels: ["C: vi", "Ic", "V", "I", "V sus⁴–V♯3", "i"],
      measureCount: 6,
      independentSatb: true,
    },
    score: measuredScore({
      key: "C major → A minor",
      keySignature: "C",
      layout: "satb",
      voiceLabels: { treble: ["S", "A"], bass: ["T", "B"] },
      labelPosition: "bottom",
      caption: "NZQA reference • 2022 Q1(a), Extract One • bars 0–5 transcription",
      measures: [
        { expectedBeats: 1, voices: {
          soprano: [{ pitch: "E4", duration: "q" }],
          alto: [{ pitch: "C4", duration: "q" }],
          tenor: [{ pitch: "A3", duration: "q" }],
          bass: [{ pitch: "A2", duration: "q" }],
        } },
        { voices: {
          soprano: [{ pitch: "G4", duration: "q" }, { pitch: "A4", duration: "q" }, { pitch: "G4", duration: "q" }, { pitch: "C5", duration: "q" }],
          alto: [{ pitch: "E4", duration: "8" }, { pitch: "D4", duration: "8" }, { pitch: "C4", duration: "8" }, { pitch: "D4", duration: "8" }, { pitch: "E4", duration: "8" }, { pitch: "F4", duration: "8" }, { pitch: "G4", duration: "q" }],
          tenor: [{ pitch: "B3", duration: "q" }, { pitch: "A3", duration: "8" }, { pitch: "B3", duration: "8" }, { pitch: "C4", duration: "q" }, { pitch: "C4", duration: "8" }, { pitch: "D4", duration: "8" }],
          bass: [{ pitch: "E3", duration: "q" }, { pitch: "F3", duration: "q" }, { pitch: "C3", duration: "8" }, { pitch: "D3", duration: "8" }, { pitch: "E3", duration: "8" }, { pitch: "F3", duration: "8" }],
        } },
        { voices: {
          soprano: [{ pitch: "C5", duration: "q" }, { pitch: "B4", duration: "q" }, { pitch: "C5", duration: "q" }, { pitch: "C5", duration: "q" }],
          alto: [{ pitch: "G4", duration: "q" }, { pitch: "G4", duration: "q" }, { pitch: "G4", duration: "q" }, { pitch: "G4", duration: "q" }],
          tenor: [{ pitch: "E4", duration: "8" }, { pitch: "D4", duration: "16" }, { pitch: "C4", duration: "16" }, { pitch: "D4", duration: "q" }, { pitch: "E4", duration: "q" }, { pitch: "E4", duration: "q" }],
          bass: [{ pitch: "G3", duration: "q" }, { pitch: "G2", duration: "q" }, { pitch: "C3", duration: "q" }, { pitch: "C3", duration: "q" }],
        } },
        { voices: {
          soprano: [{ pitch: "B4", duration: "q" }, { pitch: "A4", duration: "q" }, { pitch: "D5", duration: "qd" }, { pitch: "C5", duration: "8" }],
          alto: [{ pitch: "G4", duration: "q" }, { pitch: "F4", duration: "8" }, { pitch: "G4", duration: "8" }, { pitch: "A4", duration: "h" }],
          tenor: [{ pitch: "D4", duration: "q" }, { pitch: "D4", duration: "q" }, { pitch: "A3", duration: "q" }, { pitch: "E4", duration: "q", tieToNext: true }],
          bass: [{ pitch: "G3", duration: "q" }, { pitch: "D3", duration: "8" }, { pitch: "E3", duration: "8" }, { pitch: "F3", duration: "8" }, { pitch: "G3", duration: "8" }, { pitch: "A3", duration: "q" }],
        } },
        { voices: {
          soprano: [{ pitch: "B4", duration: "q" }, { pitch: "C5", duration: "q" }, { pitch: "B4", duration: "h" }],
          alto: [{ pitch: "G#4", duration: "q" }, { pitch: "A4", duration: "h" }, { pitch: "G#4", duration: "q" }],
          tenor: [{ pitch: "E4", duration: "q" }, { pitch: "E4", duration: "q" }, { pitch: "E4", duration: "qd" }, { pitch: "D4", duration: "8" }],
          bass: [{ pitch: "E3", duration: "8" }, { pitch: "D3", duration: "8" }, { pitch: "C3", duration: "8" }, { pitch: "A2", duration: "8" }, { pitch: "E3", duration: "h" }],
        } },
        { expectedBeats: 3, endBarline: "final", voices: {
          soprano: [{ pitch: "A4", duration: "hd" }],
          alto: [{ pitch: "E4", duration: "hd" }],
          tenor: [{ pitch: "C4", duration: "hd" }],
          bass: [{ pitch: "A2", duration: "hd" }],
        } },
      ],
      harmonicEvents: [
        harmonicBox(1, 1, null, "C: vi", { localKey: "C major", romanNumeral: "vi", chordSymbol: "Am", questionLabel: "C: vi" }),
        harmonicBox(2, 1, null, "iii", { localKey: "C major", romanNumeral: "iii", chordSymbol: "Em" }),
        harmonicBox(2, 2, null, "IV", { localKey: "C major", romanNumeral: "IV", chordSymbol: "F" }),
        harmonicBox(2, 3, null, "I", { localKey: "C major", romanNumeral: "I", chordSymbol: "C" }),
        harmonicBox(2, 4, null, "Ib", { localKey: "C major", romanNumeral: "I6", chordSymbol: "C/E" }),
        harmonicBox(3, 1, null, "Ic", { localKey: "C major", romanNumeral: "I64", chordSymbol: "C/G", questionLabel: "Ic" }),
        harmonicBox(3, 2, null, "V", { localKey: "C major", romanNumeral: "V", chordSymbol: "G", questionLabel: "V" }),
        harmonicBox(3, 3, null, "I", { localKey: "C major", romanNumeral: "I", chordSymbol: "C", questionLabel: "I" }),
        harmonicBox(4, 1, null, "V", { localKey: "C major", romanNumeral: "V", chordSymbol: "G" }),
        harmonicBox(4, 2, null, "ii", { localKey: "C major", romanNumeral: "ii", chordSymbol: "Dm" }),
        harmonicBox(4, 3, null, "C: iib / a: ivb", { localKey: "A minor", romanNumeral: "iv6", chordSymbol: "Dm/F" }),
        harmonicBox(4, 4, null, "i sus⁴", { localKey: "A minor", romanNumeral: "i", chordSymbol: "Asus4" }),
        harmonicBox(4, 4.5, null, "i", { localKey: "A minor", romanNumeral: "i", chordSymbol: "Am" }),
        harmonicBox(5, 1, null, "V♯3", { localKey: "A minor", romanNumeral: "V", chordSymbol: "E" }),
        { measure: 5, beat: 2, analysisBox: false, modelLabel: "(ib)", localKey: "A minor", romanNumeral: "i6", chordSymbol: "Am/C" },
        harmonicBox(5, 3, null, "V sus⁴–V♯3", { localKey: "A minor", romanNumeral: "V", chordSymbol: "Esus4", questionLabel: "V sus⁴–V♯3" }),
        harmonicBox(6, 1, null, "i", { localKey: "A minor", romanNumeral: "i", chordSymbol: "Am", questionLabel: "i" }),
      ],
    }),
    answerHeading: "Reference analysis",
    answer: [
      "<strong>Published route:</strong> C: vi–iii–IV–I–Ib–Ic–V–I–V–ii–iib / A minor: ivb–i(sus4)–i–V♯3–(ib)–V(sus4–♯3)–i.",
      "D minor in first inversion is the principal pivot (ii b in C and iv b in A minor); the schedule also accepts a pivot on other beats of bar 3. The cadences are C: Ic–V–I and A minor: V(sus4–♯3)–i.",
    ],
  }),
  createQuestion({
    id: "analysis-c-g",
    category: "analysis",
    sourceType: "original-practice",
    source: originalSource("C-major chorale moving to the dominant"),
    family: "Roman numeral analysis",
    title: "Original: modulation to the dominant",
    context:
      "The passage begins in C major and ends in G major. Analyse the boxed harmonies and show the common chord in both keys.",
    score: measuredScore({
      key: "C major → G major",
      keySignature: "C",
      labelPosition: "bottom",
      caption: "Original practice • C major to G major",
      measures: [
        { events: [
          { treble: ["E4", "G4", "C5"], bass: ["C3"], duration: "q" },
          { treble: ["D4", "G4", "B4"], bass: ["B2"], duration: "q" },
          { treble: ["F4", "A4", "C5"], bass: ["F2"], duration: "q" },
          { treble: ["E4", "G4", "C5"], bass: ["G2"], duration: "q" },
        ] },
        { events: [
          { treble: ["E4", "G4", "C5"], bass: ["C3"], duration: "q" },
          { treble: ["F4", "A4"], bass: ["E3"], duration: "q" },
          { treble: ["C4", "F#4", "A4"], bass: ["D3"], duration: "q" },
          { treble: ["D4", "F#4", "C5"], bass: ["D3"], duration: "q" },
        ] },
        { endBarline: "final", events: [
          { treble: ["D4", "G4", "B4"], bass: ["G2"], duration: "q" },
          { treble: ["A4"], bass: ["D3"], duration: "8" },
          { treble: ["B4"], bass: ["G3"], duration: "8" },
          { treble: [], trebleRest: true, bass: ["D3"], duration: "q" },
          { treble: ["D4", "G4", "B4"], bass: ["G2"], duration: "q" },
        ] },
      ],
      harmonicEvents: [
        harmonicBox(1, 1, 0, "C: I", { localKey: "C major", romanNumeral: "I", chordSymbol: "C", questionLabel: "C: I" }),
        harmonicBox(1, 3, 2, "IV", { localKey: "C major", romanNumeral: "IV", chordSymbol: "F" }),
        harmonicBox(2, 1, 0, "C: I / G: IV", { localKey: "G major", romanNumeral: "IV", chordSymbol: "C" }),
        harmonicBox(2, 3, 2, "V⁷", { localKey: "G major", romanNumeral: "V7", chordSymbol: "D7" }),
        harmonicBox(3, 1, 0, "I", { localKey: "G major", romanNumeral: "I", chordSymbol: "G" }),
      ],
    }),
    answerHeading: "Analysis and pivot",
    answer: [
      "<strong>Progression:</strong> C: I–IV–I / G: IV–V7–I.",
      "C major is the common chord: I in C and IV in G. F♯ in D7 supplies G major’s leading note before the perfect cadence D7–G.",
    ],
  }),
  createQuestion({
    id: "analysis-a-c",
    category: "analysis",
    sourceType: "original-practice",
    source: originalSource("A-minor phrase moving to the relative major"),
    family: "Roman numeral analysis",
    title: "Original: minor to relative major",
    context:
      "Analyse the consecutive harmonies and label the D-minor common chord relative to A minor and C major.",
    score: measuredScore({
      key: "A minor → C major",
      keySignature: "Am",
      labelPosition: "bottom",
      caption: "Original practice • A minor to C major",
      measures: [
        { events: [
          { treble: ["C4", "E4", "A4"], bass: ["A2"], duration: "q" },
          { treble: ["B3", "E4"], bass: ["G2"], duration: "q" },
          { treble: ["D4", "F4", "A4"], bass: ["D3"], duration: "q" },
          { treble: ["E4", "A4"], bass: ["C3"], duration: "q" },
        ] },
        { events: [
          { treble: ["D4", "F4", "A4"], bass: ["D3"], duration: "q" },
          { treble: ["E4", "G4"], bass: ["E3"], duration: "8" },
          { treble: ["F4", "A4"], bass: ["F3"], duration: "8" },
          { treble: ["D4", "F4", "B4"], bass: ["G2"], duration: "q" },
          { treble: ["B3", "D4", "F4"], bass: ["G3"], duration: "q" },
        ] },
        { endBarline: "final", events: [
          { treble: ["E4", "G4", "C5"], bass: ["C3"], duration: "h" },
          { treble: ["D4", "G4", "B4"], bass: ["G2"], duration: "q" },
          { treble: ["E4", "G4", "C5"], bass: ["C3"], duration: "q" },
        ] },
      ],
      harmonicEvents: [
        harmonicBox(1, 1, 0, "a: i", { localKey: "A minor", romanNumeral: "i", chordSymbol: "Am", questionLabel: "a: i" }),
        harmonicBox(1, 3, 2, "iv", { localKey: "A minor", romanNumeral: "iv", chordSymbol: "Dm" }),
        harmonicBox(2, 1, 0, "a: iv / C: ii", { localKey: "C major", romanNumeral: "ii", chordSymbol: "Dm" }),
        harmonicBox(2, 3, 3, "V⁷", { localKey: "C major", romanNumeral: "V7", chordSymbol: "G7" }),
        harmonicBox(3, 1, 0, "I", { localKey: "C major", romanNumeral: "I", chordSymbol: "C" }),
      ],
    }),
    answerHeading: "Analysis in both keys",
    answer: [
      "D minor is iv in A minor and ii in C major. G7–C then confirms the relative major with a perfect cadence.",
    ],
  }),
  createQuestion({
    id: "analysis-gminor-bflat",
    category: "analysis",
    sourceType: "original-practice",
    source: originalSource("G-minor phrase moving to B-flat major"),
    family: "Roman numeral analysis",
    title: "Original: relative-major pivot",
    context:
      "Analyse this G-minor phrase as it turns toward B-flat major. Include inversion figures and the shared E-flat harmony.",
    score: measuredScore({
      key: "G minor → B♭ major",
      keySignature: "Gm",
      labelPosition: "bottom",
      caption: "Original practice • G minor to B-flat major",
      measures: [
        { events: [
          { treble: ["Bb3", "D4", "G4"], bass: ["G2"], duration: "q" },
          { treble: ["G3", "Bb3", "Eb4"], bass: ["Eb3"], duration: "q" },
          { treble: ["A3", "C4", "F#4"], bass: ["D3"], duration: "q" },
          { treble: ["G4"], bass: ["C3"], duration: "8" },
          { treble: ["F#4"], bass: ["D3"], duration: "8" },
        ] },
        { events: [
          { treble: ["G3", "Bb3", "Eb4"], bass: ["Eb3"], duration: "q" },
          { treble: ["F4"], bass: ["D3"], duration: "q" },
          { treble: ["A3", "C4", "Eb4"], bass: ["F2"], duration: "q" },
          { treble: ["Bb3", "D4"], bass: ["A2"], duration: "q" },
        ] },
        { endBarline: "final", events: [
          { treble: ["Bb3", "D4", "F4"], bass: ["Bb2"], duration: "h" },
          { treble: ["C4", "Eb4"], bass: ["F2"], duration: "q" },
          { treble: ["Bb3", "D4", "F4"], bass: ["Bb2"], duration: "q" },
        ] },
      ],
      harmonicEvents: [
        harmonicBox(1, 1, 0, "g: i", { localKey: "G minor", romanNumeral: "i", chordSymbol: "Gm", questionLabel: "g: i" }),
        harmonicBox(1, 2, 1, "VI", { localKey: "G minor", romanNumeral: "VI", chordSymbol: "E♭" }),
        harmonicBox(1, 3, 2, "V⁷", { localKey: "G minor", romanNumeral: "V7", chordSymbol: "D7" }),
        harmonicBox(2, 1, 0, "g: VI / B♭: IV", { localKey: "B♭ major", romanNumeral: "IV", chordSymbol: "E♭" }),
        harmonicBox(2, 3, 2, "V⁷", { localKey: "B♭ major", romanNumeral: "V7", chordSymbol: "F7" }),
        harmonicBox(3, 1, 0, "I", { localKey: "B♭ major", romanNumeral: "I", chordSymbol: "B♭" }),
      ],
    }),
    answerHeading: "Relative-major analysis",
    answer: [
      "E♭ is VI in G minor and IV in B♭ major. The following F7–B♭ perfect cadence establishes the relative major.",
    ],
  }),
  createQuestion({
    id: "nzqa-2024-bach-analysis",
    category: "analysis",
    sourceType: "nzqa-reference",
    source: nzqaSource(
      2024,
      "Question One",
      "(a)",
      "Extract One",
      "J. S. Bach",
      "Herzlich lieb hab’ ich dich, o Herr",
      "bars 1–4, exam p.2; schedule p.3"
    ),
    family: "Roman numeral analysis",
    title: "Reference: pivot and diminished seventh",
    context:
      "Analyse the 13 blank positions after the five supplied labels, show A minor as the pivot into E minor, and explain the diminished seventh chord’s cadential function.",
    sourceSpec: {
      romanNumerals: ["I", "V", "vi", "iii", "I", "IV", "IV6", "I", "vi", "iii", "IV", "V6", "I", "iv", "V7", "IV6", "vii7", "i"],
      analysisPositions: 18,
      answerPositions: 13,
      keyCentres: ["C major", "E minor"],
      suppliedLabels: ["C: I", "V", "vi", "iii", "I"],
      measureCount: 5,
      independentSatb: true,
    },
    score: measuredScore({
      key: "C major → E minor",
      keySignature: "C",
      layout: "satb",
      voiceLabels: { treble: ["S", "A"], bass: ["T", "B"] },
      labelPosition: "bottom",
      caption: "NZQA reference • 2024 Q1(a), Extract One • bars 1–4 transcription",
      measures: [
        { expectedBeats: 1, voices: {
          soprano: [{ pitch: "C5", duration: "q" }],
          alto: [{ pitch: "G4", duration: "q" }],
          tenor: [{ pitch: "E4", duration: "q" }],
          bass: [{ pitch: "C3", duration: "q" }],
        } },
        { voices: {
          soprano: [{ pitch: "B4", duration: "q" }, { pitch: "A4", duration: "q" }, { pitch: "G4", duration: "q" }, { pitch: "F4", duration: "8" }, { pitch: "E4", duration: "8" }],
          alto: [{ pitch: "G4", duration: "8" }, { pitch: "F4", duration: "8" }, { pitch: "E4", duration: "q" }, { pitch: "E4", duration: "q" }, { pitch: "E4", duration: "8" }, { pitch: "D4", duration: "8" }],
          tenor: [{ pitch: "D4", duration: "q" }, { pitch: "D4", duration: "8" }, { pitch: "C4", duration: "8" }, { pitch: "B3", duration: "q" }, { pitch: "C4", duration: "8" }, { pitch: "B3", duration: "8" }],
          bass: [{ pitch: "G3", duration: "q" }, { pitch: "A3", duration: "q" }, { pitch: "E3", duration: "8" }, { pitch: "D3", duration: "8" }, { pitch: "C3", duration: "q" }],
        } },
        { voices: {
          soprano: [{ pitch: "A4", duration: "q" }, { pitch: "A4", duration: "q" }, { pitch: "G4", duration: "q" }, { pitch: "C5", duration: "q" }],
          alto: [{ pitch: "C4", duration: "q" }, { pitch: "F4", duration: "q" }, { pitch: "E4", duration: "q" }, { pitch: "E4", duration: "8" }, { pitch: "F4", duration: "8" }],
          tenor: [{ pitch: "A3", duration: "8" }, { pitch: "B3", duration: "8" }, { pitch: "C4", duration: "q" }, { pitch: "C4", duration: "q" }, { pitch: "C4", duration: "8" }, { pitch: "D4", duration: "8" }],
          bass: [{ pitch: "F3", duration: "8" }, { pitch: "G3", duration: "8" }, { pitch: "A3", duration: "8" }, { pitch: "B3", duration: "8" }, { pitch: "C4", duration: "q" }, { pitch: "A3", duration: "q" }],
        } },
        { voices: {
          soprano: [{ pitch: "B4", duration: "q" }, { pitch: "A4", duration: "q" }, { pitch: "G4", duration: "q" }, { pitch: "F4", duration: "8" }, { pitch: "E4", duration: "8" }],
          alto: [{ pitch: "G4", duration: "q" }, { pitch: "F4", duration: "8" }, { pitch: "E4", duration: "8" }, { pitch: "D4", duration: "q" }, { pitch: "C4", duration: "8" }, { pitch: "D4", duration: "8" }],
          tenor: [{ pitch: "E4", duration: "8" }, { pitch: "D4", duration: "8" }, { pitch: "C4", duration: "q" }, { pitch: "D4", duration: "q" }, { pitch: "G3", duration: "q" }],
          bass: [{ pitch: "E3", duration: "q" }, { pitch: "F3", duration: "q" }, { pitch: "B2", duration: "q" }, { pitch: "C3", duration: "8" }, { pitch: "B2", duration: "8" }],
        } },
        { endBarline: "final", voices: {
          soprano: [{ pitch: "A4", duration: "q" }, { pitch: "A4", duration: "q" }, { pitch: "G4", duration: "q" }, { pitch: "G4", duration: "q" }],
          alto: [{ pitch: "E4", duration: "8" }, { pitch: "D#4", duration: "8" }, { pitch: "E4", duration: "8" }, { pitch: "F#4", duration: "8" }, { pitch: "F#4", duration: "8" }, { pitch: "E4", duration: "8" }, { pitch: "E4", duration: "q" }],
          tenor: [{ pitch: "C4", duration: "8" }, { pitch: "B3", duration: "8" }, { pitch: "A3", duration: "8" }, { pitch: "C4", duration: "8" }, { pitch: "B3", duration: "q" }, { pitch: "C4", duration: "8" }, { pitch: "B3", duration: "8" }],
          bass: [{ pitch: "A2", duration: "8" }, { pitch: "B2", duration: "8" }, { pitch: "C#3", duration: "8" }, { pitch: "D#3", duration: "8" }, { pitch: "E3", duration: "q" }, { pitch: "C3", duration: "q" }],
        } },
      ],
      harmonicEvents: [
        harmonicBox(1, 1, null, "C: I", { localKey: "C major", romanNumeral: "I", chordSymbol: "C", questionLabel: "C: I" }),
        harmonicBox(2, 1, null, "V", { localKey: "C major", romanNumeral: "V", chordSymbol: "G", questionLabel: "V" }),
        harmonicBox(2, 2.5, null, "vi", { localKey: "C major", romanNumeral: "vi", chordSymbol: "Am", questionLabel: "vi" }),
        harmonicBox(2, 3, null, "iii", { localKey: "C major", romanNumeral: "iii", chordSymbol: "Em", questionLabel: "iii" }),
        harmonicBox(2, 4, null, "I", {
          localKey: "C major",
          romanNumeral: "I",
          chordSymbol: "C",
          questionLabel: "I",
          validationPitches: ["E4", "C4"],
          bassPitch: "C3",
          omittedChordIntervals: [7],
        }),
        harmonicBox(3, 1, null, "IV", { localKey: "C major", romanNumeral: "IV", chordSymbol: "F" }),
        harmonicBox(3, 2, null, "IVb", { localKey: "C major", romanNumeral: "IV6", chordSymbol: "F/A" }),
        harmonicBox(3, 3, null, "I", { localKey: "C major", romanNumeral: "I", chordSymbol: "C" }),
        harmonicBox(3, 4, null, "vi", { localKey: "C major", romanNumeral: "vi", chordSymbol: "Am" }),
        harmonicBox(4, 1, null, "iii", { localKey: "C major", romanNumeral: "iii", chordSymbol: "Em" }),
        harmonicBox(4, 2, null, "IV", { localKey: "C major", romanNumeral: "IV", chordSymbol: "F" }),
        harmonicBox(4, 3, null, "Vb", { localKey: "C major", romanNumeral: "V6", chordSymbol: "G/B" }),
        harmonicBox(4, 4, null, "I", {
          localKey: "C major",
          romanNumeral: "I",
          chordSymbol: "C",
          validationPitches: ["C4", "G3"],
          bassPitch: "C3",
          omittedChordIntervals: [4],
        }),
        harmonicBox(5, 1, null, "C: vi / e: iv", { localKey: "E minor", romanNumeral: "iv", chordSymbol: "Am" }),
        harmonicBox(5, 1.5, null, "V⁷", {
          localKey: "E minor",
          romanNumeral: "V7",
          chordSymbol: "B7",
          validationPitches: ["A4", "D#4", "B3"],
          bassPitch: "B2",
          omittedChordIntervals: [7],
        }),
        harmonicBox(5, 2, null, "IVb", { localKey: "E minor", romanNumeral: "IV6", chordSymbol: "A/C♯" }),
        harmonicBox(5, 2.5, null, "♯vii°⁷", { localKey: "E minor", romanNumeral: "vii7", chordSymbol: "D♯dim7" }),
        harmonicBox(5, 3, null, "i", {
          localKey: "E minor",
          romanNumeral: "i",
          chordSymbol: "Em",
          validationPitches: ["G4", "B3"],
          bassPitch: "E3",
        }),
      ],
    }),
    answerHeading: "Published analysis and function",
    answer: [
      "<strong>Analysis after the five supplied labels:</strong> C: IV–IVb–I–vi–iii–IV–Vb–I–vi / E minor: iv–V7–IVb–♯vii°7–i. The A-minor chord is the pivot: vi in C major and iv in E minor.",
      "The diminished seventh adds harmonic interest and decorates or strengthens the perfect cadence by embellishing the dominant. Other well-supported explanations are possible.",
    ],
  }),
  createQuestion({
    id: "modulation-d-g-f",
    category: "modulation",
    homeKey: "D minor",
    keyRegions: [
      { section: "X", localKey: "G minor", modelRelationship: "subdominant" },
      { section: "Y", localKey: "F major", modelRelationship: "relative major" },
    ],
    sourceType: "original-practice",
    source: {
      creator: "Cadence Lab",
      title: "D-minor related-key study",
      acknowledgement:
        "Adapted original practice inspired by common related-key tasks; this simplified texture is not presented as an NZQA transcription.",
    },
    family: "Keys and modulation",
    title: "Adapted: D minor through G minor to F",
    context:
      "Identify the temporary G-minor region X and the final F-major region Y. Give cadence evidence and explain each relationship to D minor.",
    score: measuredScore({
      key: "D minor → G minor → F major",
      keySignature: "Dm",
      timeSignature: "2/4",
      labelPosition: "bottom",
      caption: "Adapted original practice • D minor, G minor and F major",
      brackets: [
        { start: 1, end: 2, label: "X" },
        { start: 5, end: 6, label: "Y" },
      ],
      measures: [
        { events: [
          { treble: ["F4", "A4"], bass: ["D3"], duration: "q" },
          { treble: ["C4", "F#4", "A4"], bass: ["D3"], duration: "q" },
        ] },
        { events: [
          { treble: ["D4", "G4", "Bb4"], bass: ["G2"], duration: "q" },
          { treble: ["C#4", "E4", "G4"], bass: ["A2"], duration: "q" },
        ] },
        { events: [
          { treble: ["F4", "A4"], bass: ["D3"], duration: "q" },
          { treble: ["E4", "G4", "Bb4"], bass: ["C3"], duration: "q" },
        ] },
        { endBarline: "final", events: [
          { treble: ["F4", "A4", "C5"], bass: ["F2"], duration: "h" },
        ] },
      ],
      harmonicEvents: [
        harmonicBox(1, 1, 0, "d: i", { localKey: "D minor", romanNumeral: "i", chordSymbol: "Dm", questionLabel: "d: i" }),
        harmonicBox(1, 2, 1, "g: V⁷", { localKey: "G minor", romanNumeral: "V7", chordSymbol: "D7" }),
        harmonicBox(2, 1, 0, "g: i", { localKey: "G minor", romanNumeral: "i", chordSymbol: "Gm" }),
        harmonicBox(2, 2, 1, "d: V⁷", { localKey: "D minor", romanNumeral: "V7", chordSymbol: "A7" }),
        harmonicBox(3, 1, 0, "d: i / F: vi", { localKey: "F major", romanNumeral: "vi", chordSymbol: "Dm" }),
        harmonicBox(3, 2, 1, "F: V⁷", { localKey: "F major", romanNumeral: "V7", chordSymbol: "C7" }),
        harmonicBox(4, 1, 0, "F: I", { localKey: "F major", romanNumeral: "I", chordSymbol: "F" }),
      ],
    }),
    answerHeading: "Key centres and relationships",
    answer: [
      "<strong>X: G minor.</strong> D7 contains F♯ and resolves to G minor; G minor is the subdominant key of D minor.",
      "<strong>Y: F major.</strong> D minor is reused as vi, then C7–F gives a perfect cadence. F major is D minor’s relative major.",
    ],
  }),
  createQuestion({
    id: "nzqa-2023-bach-key-regions",
    category: "modulation",
    homeKey: "G minor",
    keyRegions: [
      {
        section: "X",
        localKey: "E♭ major",
        modelRelationship: "relative major of the subdominant",
        acceptedRelationshipLabels: ["relative major of the subdominant"],
      },
      {
        section: "Y",
        localKey: "C minor",
        modelRelationship: "subdominant",
        acceptedRelationshipLabels: ["subdominant"],
      },
      {
        section: "Z",
        localKey: "F major",
        modelRelationship: "relative major of the dominant",
        acceptedRelationshipLabels: ["relative major of the dominant"],
      },
    ],
    sourceType: "nzqa-reference",
    source: nzqaSource(
      2023,
      "Question One",
      "(b)",
      "Extract Two",
      "J. S. Bach",
      "Durch Adams Fall ist ganz verderbt",
      "bars 4–10, exam p.3; schedule p.4"
    ),
    family: "Keys and modulation",
    title: "Reference: three key regions from G minor",
    context:
      "Name sections X, Y and Z, cite their leading notes or cadences, and state each relationship to the G-minor tonic.",
    sourceSpec: {
      analysisPositions: 0,
      keyCentres: ["E♭ major", "C minor", "F major"],
      keyRelationships: [
        { section: "X", homeKey: "G minor", localKey: "E♭ major", acceptedLabels: ["relative major of the subdominant"] },
        { section: "Y", homeKey: "G minor", localKey: "C minor", acceptedLabels: ["subdominant"] },
        { section: "Z", homeKey: "G minor", localKey: "F major", acceptedLabels: ["relative major of the dominant"] },
      ],
      sections: ["X", "Y", "Z"],
      sectionRanges: [
        { label: "X", key: "E♭ major", start: { measure: 2, beat: 2 }, end: { measure: 3, beat: 3 } },
        { label: "Y", key: "C minor", start: { measure: 3, beat: 4 }, end: { measure: 5, beat: 3 } },
        { label: "Z", key: "F major", start: { measure: 7, beat: 1 }, end: { measure: 7, beat: 3 } },
      ],
      measureCount: 7,
      independentSatb: true,
    },
    score: measuredScore({
      key: "G minor with E♭, C minor and F regions",
      keySignature: "Gm",
      layout: "satb",
      voiceLabels: { treble: ["S", "A"], bass: ["T", "B"] },
      labelPosition: "bottom",
      caption: "NZQA reference • 2023 Q1(b), Extract Two • bars 4–10 transcription",
      brackets: [
        { start: { measure: 2, beat: 2 }, end: { measure: 3, beat: 3 }, label: "X", key: "E♭ major" },
        { start: { measure: 3, beat: 4 }, end: { measure: 5, beat: 3 }, label: "Y", key: "C minor", repeatLabel: false },
        { start: { measure: 7, beat: 1 }, end: { measure: 7, beat: 3 }, label: "Z", key: "F major" },
      ],
      measures: [
        { expectedBeats: 3, voices: {
          soprano: [{ pitch: "Bb4", duration: "q" }, { pitch: "A4", duration: "q" }, { pitch: "G4", duration: "q" }],
          alto: [{ pitch: "D4", duration: "q" }, { pitch: "C4", duration: "q" }, { pitch: "B3", duration: "q" }],
          tenor: [{ pitch: "F#3", duration: "8" }, { pitch: "G3", duration: "q" }, { pitch: "F#3", duration: "8" }, { pitch: "G3", duration: "q" }],
          bass: [{ pitch: "D3", duration: "h" }, { pitch: "G2", duration: "q" }],
        } },
        { voices: {
          soprano: [{ pitch: "Bb4", duration: "q" }, { pitch: "Bb4", duration: "8" }, { pitch: "Ab4", duration: "8" }, { pitch: "G4", duration: "8" }, { pitch: "F4", duration: "8" }, { pitch: "Eb4", duration: "8" }, { pitch: "F4", duration: "8" }],
          alto: [{ pitch: "F4", duration: "8" }, { pitch: "Eb4", duration: "8" }, { pitch: "D4", duration: "8" }, { pitch: "C4", duration: "8" }, { pitch: "Bb3", duration: "q" }, { pitch: "C4", duration: "8" }, { pitch: "D4", duration: "8" }],
          tenor: [{ pitch: "Bb3", duration: "q" }, { pitch: "F3", duration: "q" }, { pitch: "G3", duration: "q" }, { pitch: "G3", duration: "8" }, { pitch: "Ab3", duration: "8" }],
          bass: [{ pitch: "D3", duration: "8" }, { pitch: "C3", duration: "8" }, { pitch: "Bb2", duration: "q" }, { pitch: "Eb3", duration: "8" }, { pitch: "D3", duration: "8" }, { pitch: "C3", duration: "q" }],
        } },
        { voices: {
          soprano: [{ pitch: "G4", duration: "q" }, { pitch: "F4", duration: "q" }, { pitch: "Eb4", duration: "q" }, { pitch: "G4", duration: "q" }],
          alto: [{ pitch: "Eb4", duration: "q" }, { pitch: "D4", duration: "q" }, { pitch: "Eb4", duration: "q" }, { pitch: "Bb3", duration: "8" }, { pitch: "C4", duration: "8" }],
          tenor: [{ pitch: "Bb3", duration: "qd" }, { pitch: "Ab3", duration: "8" }, { pitch: "G3", duration: "q" }, { pitch: "G3", duration: "q" }],
          bass: [{ pitch: "G2", duration: "8" }, { pitch: "Ab2", duration: "8" }, { pitch: "Bb2", duration: "q" }, { pitch: "Eb2", duration: "q" }, { pitch: "Eb3", duration: "q" }],
        } },
        { voices: {
          soprano: [{ pitch: "G4", duration: "q" }, { pitch: "G4", duration: "q" }, { pitch: "F4", duration: "q" }, { pitch: "Eb4", duration: "8" }, { pitch: "D4", duration: "8" }],
          alto: [{ pitch: "D4", duration: "q" }, { pitch: "C4", duration: "q" }, { pitch: "C4", duration: "q" }, { pitch: "C4", duration: "q" }],
          tenor: [{ pitch: "G3", duration: "8" }, { pitch: "F3", duration: "8" }, { pitch: "Eb3", duration: "q" }, { pitch: "F3", duration: "8" }, { pitch: "G3", duration: "8" }, { pitch: "Ab3", duration: "q" }],
          bass: [{ pitch: "B2", duration: "q" }, { pitch: "C3", duration: "8" }, { pitch: "Bb2", duration: "8" }, { pitch: "Ab2", duration: "8" }, { pitch: "G2", duration: "8" }, { pitch: "F2", duration: "q" }],
        } },
        { expectedBeats: 3, voices: {
          soprano: [{ pitch: "D4", duration: "h" }, { pitch: "C4", duration: "q" }],
          alto: [{ pitch: "C4", duration: "q" }, { pitch: "B3", duration: "q" }, { pitch: "C4", duration: "q" }],
          tenor: [{ pitch: "G3", duration: "qd" }, { pitch: "F3", duration: "8" }, { pitch: "Eb3", duration: "q" }],
          bass: [{ pitch: "G2", duration: "h" }, { pitch: "C3", duration: "q" }],
        } },
        { voices: {
          soprano: [{ pitch: "G4", duration: "q" }, { pitch: "F4", duration: "q" }, { pitch: "G4", duration: "q" }, { pitch: "A4", duration: "q" }],
          alto: [{ pitch: "Eb4", duration: "q" }, { pitch: "Eb4", duration: "8" }, { pitch: "D4", duration: "8" }, { pitch: "Eb4", duration: "8" }, { pitch: "G4", duration: "8" }, { pitch: "F4", duration: "8" }, { pitch: "Eb4", duration: "8" }],
          tenor: [{ pitch: "C4", duration: "8" }, { pitch: "Bb3", duration: "8" }, { pitch: "Ab3", duration: "q" }, { pitch: "Bb3", duration: "q" }, { pitch: "C4", duration: "q" }],
          bass: [{ pitch: "C3", duration: "q" }, { pitch: "F3", duration: "q" }, { pitch: "Eb3", duration: "8" }, { pitch: "D3", duration: "8" }, { pitch: "C3", duration: "q" }],
        } },
        { endBarline: "final", voices: {
          soprano: [{ pitch: "Bb4", duration: "8" }, { pitch: "A4", duration: "8" }, { pitch: "G4", duration: "q" }, { pitch: "F4", duration: "q" }, { pitch: "C5", duration: "q" }],
          alto: [{ pitch: "D4", duration: "8" }, { pitch: "C4", duration: "8" }, { pitch: "Bb3", duration: "q" }, { pitch: "A3", duration: "q" }, { pitch: "F4", duration: "q" }],
          tenor: [{ pitch: "F3", duration: "qd" }, { pitch: "E3", duration: "8" }, { pitch: "F3", duration: "q" }, { pitch: "A3", duration: "q" }],
          bass: [{ pitch: "Bb2", duration: "q" }, { pitch: "C3", duration: "q" }, { pitch: "F2", duration: "q" }, { pitch: "F3", duration: "q" }],
        } },
      ],
      harmonicEvents: [],
    }),
    answerHeading: "Reference key evidence",
    answer: [
      "<strong>X: E♭ major</strong>, supported by B♭7–E♭; it is the relative major of the subdominant.",
      "<strong>Y: C minor</strong>, supported by B-natural and G7–Cm; it is the subdominant. <strong>Z: F major</strong>, supported by E-natural and C7–F; it is the relative major of the dominant.",
    ],
  }),
  createQuestion({
    id: "modulation-c-g-e",
    category: "modulation",
    homeKey: "C major",
    keyRegions: [
      { section: "X", localKey: "G major", modelRelationship: "dominant" },
      { section: "Y", localKey: "E minor", modelRelationship: "mediant minor" },
    ],
    sourceType: "original-practice",
    source: originalSource("Two temporary key centres from C major"),
    family: "Keys and modulation",
    title: "Original: dominant then mediant minor",
    context:
      "Identify X and Y, give exact cadence evidence, and state each relationship to the C-major tonic.",
    score: measuredScore({
      key: "C major",
      keySignature: "C",
      caption: "Original practice • temporary G major and E minor",
      brackets: [
        { start: 2, end: 3, label: "X" },
        { start: 4, end: 5, label: "Y" },
      ],
      measures: [
        { events: [
          { treble: ["E4", "G4", "C5"], bass: ["C3"], duration: "h" },
          { treble: ["F4", "A4", "C5"], bass: ["F2"], duration: "h" },
        ] },
        { events: [
          { treble: ["C4", "F#4", "A4"], bass: ["D3"], duration: "h" },
          { treble: ["D4", "G4", "B4"], bass: ["G2"], duration: "h" },
        ] },
        { endBarline: "final", events: [
          { treble: ["D#4", "F#4", "A4"], bass: ["B2"], duration: "h" },
          { treble: ["E4", "G4", "B4"], bass: ["E3"], duration: "h" },
        ] },
      ],
      harmonicEvents: [],
    }),
    answerHeading: "Keys, evidence and relationships",
    answer: [
      "<strong>X: G major.</strong> F♯ and the D7–G perfect cadence establish the dominant key.",
      "<strong>Y: E minor.</strong> D♯ and B7–Em establish the mediant minor, which is also G major’s relative minor.",
    ],
  }),
  createQuestion({
    id: "modulation-a-fsharp",
    category: "modulation",
    homeKey: "A major",
    keyRegions: [
      { section: "X", localKey: "F♯ minor", modelRelationship: "relative minor" },
    ],
    sourceType: "original-practice",
    source: originalSource("A major moving to its relative minor"),
    family: "Keys and modulation",
    title: "Original: raised leading note in F-sharp minor",
    context:
      "Identify the final key and explain the harmonic function of E-sharp in the approach to the cadence.",
    score: measuredScore({
      key: "A major → F♯ minor",
      keySignature: "A",
      caption: "Original practice • A major to F-sharp minor",
      brackets: [{ start: 2, end: 4, label: "X" }],
      measures: [
        { events: [
          { treble: ["C#4", "E4", "A4"], bass: ["A2"], duration: "h" },
          { treble: ["D4", "F#4", "A4"], bass: ["D3"], duration: "h" },
        ] },
        { events: [
          { treble: ["C#4", "F#4", "A4"], bass: ["F#2"], duration: "h" },
          { treble: ["B3", "E#4", "G#4"], bass: ["C#3"], duration: "h" },
        ] },
        { endBarline: "final", events: [
          { treble: ["C#4", "F#4", "A4"], bass: ["F#2"], duration: "w" },
        ] },
      ],
      harmonicEvents: [],
    }),
    answerHeading: "Establishing the relative minor",
    answer: [
      "The final key is F♯ minor, the relative minor of A major. E♯ is the raised leading note and chordal third of C♯7; C♯7–F♯m is the confirming perfect cadence.",
    ],
  }),
  createQuestion({
    id: "modulation-gminor-eb-f",
    category: "modulation",
    homeKey: "G minor",
    keyRegions: [
      { section: "X", localKey: "E♭ major", modelRelationship: "submediant / VI" },
      { section: "Y", localKey: "F major", modelRelationship: "relative major of the dominant" },
    ],
    sourceType: "original-practice",
    source: originalSource("Related key regions from G minor"),
    family: "Keys and modulation",
    title: "Original: submediant and relative of dominant",
    context:
      "Sections X and Y cadence in two related major keys. Identify them, give evidence and relate each to G minor.",
    score: measuredScore({
      key: "G minor",
      keySignature: "Gm",
      caption: "Original practice • related regions from G minor",
      brackets: [
        { start: 1, end: 2, label: "X" },
        { start: 3, end: 4, label: "Y" },
      ],
      measures: [
        { events: [
          { treble: ["Bb3", "D4", "G4"], bass: ["G2"], duration: "h" },
          { treble: ["D4", "F4", "Ab4"], bass: ["Bb2"], duration: "h" },
        ] },
        { events: [
          { treble: ["Eb4", "G4", "Bb4"], bass: ["Eb3"], duration: "h" },
          { treble: ["E4", "G4", "Bb4"], bass: ["C3"], duration: "h" },
        ] },
        { endBarline: "final", events: [
          { treble: ["F4", "A4", "C5"], bass: ["F2"], duration: "w" },
        ] },
      ],
      harmonicEvents: [],
    }),
    answerHeading: "Related-key evidence",
    answer: [
      "X is E♭ major, supported by B♭7–E♭; relative to G minor it is VI, the submediant key (also describable as the relative major of the subdominant). Y is F major, supported by E-natural and C7–F; it is the relative major of the dominant key, D minor.",
    ],
  }),
  createQuestion({
    id: "modulation-e-b-csharp",
    category: "modulation",
    homeKey: "E major",
    keyRegions: [
      { section: "X", localKey: "B major", modelRelationship: "dominant" },
      { section: "Y", localKey: "C♯ minor", modelRelationship: "relative minor" },
    ],
    sourceType: "original-practice",
    source: originalSource("Dominant and relative-minor regions from E major"),
    family: "Keys and modulation",
    title: "Original: two sharp-key centres",
    context:
      "Identify X and Y and explain how A-sharp and B-sharp clarify the two local keys.",
    score: measuredScore({
      key: "E major",
      keySignature: "E",
      caption: "Original practice • E major, B major and C-sharp minor",
      brackets: [
        { start: 2, end: 3, label: "X" },
        { start: 4, end: 5, label: "Y" },
      ],
      measures: [
        { events: [
          { treble: ["G#4", "B4", "E5"], bass: ["E3"], duration: "h" },
          { treble: ["A4", "C#5", "E5"], bass: ["A2"], duration: "h" },
        ] },
        { events: [
          { treble: ["E4", "A#4", "C#5"], bass: ["F#2"], duration: "h" },
          { treble: ["F#4", "B4", "D#5"], bass: ["B2"], duration: "h" },
        ] },
        { endBarline: "final", events: [
          { treble: ["D#4", "F#4", "B#4"], bass: ["G#2"], duration: "h" },
          { treble: ["E4", "G#4", "C#5"], bass: ["C#3"], duration: "h" },
        ] },
      ],
      harmonicEvents: [],
    }),
    answerHeading: "Two local cadences",
    answer: [
      "X is B major, the dominant of E, established by F♯7–B and its A♯ leading note. Y is C♯ minor, E major’s relative minor, established by G♯7–C♯m and B♯ as its raised leading note.",
    ],
  }),
  createQuestion({
    id: "nzqa-2024-bach-satb",
    category: "satb",
    sourceType: "nzqa-reference",
    source: nzqaSource(
      2024,
      "Question One",
      "(c)",
      "Extract Three",
      "J. S. Bach",
      "Herzlich lieb hab’ ich dich, o Herr",
      "bars 18–19, exam p.3; schedule p.4"
    ),
    family: "SATB / vocal completion",
    title: "Reference: chorale-style completion",
    context:
      "Continue from the fully supplied bar 17 and create all four parts in bars 18–19. Use the printed Roman numerals, follow the supplied rhythmic pattern, and include at least two passing notes.",
    sourceSpec: {
      chordSymbols: ["C/E", "F", "F/A", "G/B", "C/E", "C", "Gsus4", "C"],
      analysisPositions: 8,
      suppliedLabels: ["F: Vb", "I", "F: Ib / C: IVb", "Vb", "Ib", "I", "V⁴–³", "I"],
      keyCentres: ["F major", "C major"],
      measureCount: 3,
      independentSatb: true,
      harmonicSpans: [
        {
          measure: 3,
          beat: 1,
          label: "V⁴–³",
          chordSymbol: "Gsus4",
          resolutionBeat: 2,
          resolutionChordSymbol: "G",
        },
      ],
      completionContract: {
        suppliedMeasure: 1,
        targetMeasures: [2, 3],
        chordsToRealise: 8,
        harmonicIndications: 8,
        blankTargetVoices: true,
      },
    },
    score: measuredScore({
      key: "F major → C major",
      keySignature: "C",
      sourceKeyCentres: ["F major", "C major"],
      layout: "satb",
      voiceLabels: { treble: ["S", "A"], bass: ["T", "B"] },
      completion: true,
      labelPosition: "bottom",
      caption: "NZQA reference • 2024 Q1(c), Extract Three • bars 17–19 transcription",
      measures: [
        { voices: {
          soprano: [{ pitch: "A4", duration: "8" }, { pitch: "D5", duration: "8" }, { pitch: "B4", duration: "q" }, { pitch: "C5", duration: "q" }, { pitch: "C5", duration: "q" }],
          alto: [{ pitch: "E4", duration: "8" }, { pitch: "D4", duration: "8" }, { pitch: "E4", duration: "q" }, { pitch: "E4", duration: "q" }, { pitch: "C5", duration: "8" }, { pitch: "Bb4", duration: "8" }],
          tenor: [{ pitch: "C4", duration: "8" }, { pitch: "A3", duration: "8" }, { pitch: "B3", duration: "8" }, { pitch: "G#3", duration: "8" }, { pitch: "A3", duration: "q" }, { pitch: "G3", duration: "q" }],
          bass: [{ pitch: "F#3", duration: "q" }, { pitch: "G#3", duration: "8" }, { pitch: "E3", duration: "8" }, { pitch: "A3", duration: "q" }, { pitch: "E3", duration: "q" }],
        }, questionVoices: {
          soprano: [{ pitch: "A4", duration: "8" }, { pitch: "D5", duration: "8" }, { pitch: "B4", duration: "q" }, { pitch: "C5", duration: "q" }, { pitch: "C5", duration: "q" }],
          alto: [{ pitch: "E4", duration: "8" }, { pitch: "D4", duration: "8" }, { pitch: "E4", duration: "q" }, { pitch: "E4", duration: "q" }, { pitch: "C5", duration: "8" }, { pitch: "Bb4", duration: "8" }],
          tenor: [{ pitch: "C4", duration: "8" }, { pitch: "A3", duration: "8" }, { pitch: "B3", duration: "8" }, { pitch: "G#3", duration: "8" }, { pitch: "A3", duration: "q" }, { pitch: "G3", duration: "q" }],
          bass: [{ pitch: "F#3", duration: "q" }, { pitch: "G#3", duration: "8" }, { pitch: "E3", duration: "8" }, { pitch: "A3", duration: "q" }, { pitch: "E3", duration: "q" }],
        } },
        { voices: {
          soprano: [{ pitch: "C5", duration: "q" }, { pitch: "C5", duration: "q" }, { pitch: "D5", duration: "q" }, { pitch: "C5", duration: "q" }],
          alto: [{ pitch: "A4", duration: "8" }, { pitch: "G4", duration: "8" }, { pitch: "F4", duration: "8" }, { pitch: "E4", duration: "8" }, { pitch: "D4", duration: "q" }, { pitch: "E4", duration: "8" }, { pitch: "G4", duration: "8" }],
          tenor: [{ pitch: "C4", duration: "8" }, { pitch: "Bb3", duration: "8" }, { pitch: "A3", duration: "q" }, { pitch: "A3", duration: "8" }, { pitch: "G3", duration: "8" }, { pitch: "G3", duration: "8" }, { pitch: "E4", duration: "8" }],
          bass: [{ pitch: "F3", duration: "8" }, { pitch: "G3", duration: "8" }, { pitch: "A3", duration: "q" }, { pitch: "B2", duration: "q" }, { pitch: "E3", duration: "8" }, { pitch: "C3", duration: "8" }],
        }, questionVoices: {
          soprano: [{ duration: "w" }],
          alto: [{ duration: "w" }],
          tenor: [{ duration: "w" }],
          bass: [{ duration: "w" }],
        } },
        { expectedBeats: 3, endBarline: "final", voices: {
          soprano: [{ pitch: "C5", duration: "q" }, { pitch: "B4", duration: "q" }, { pitch: "C5", duration: "q" }],
          alto: [{ pitch: "G4", duration: "qd" }, { pitch: "G4", duration: "8" }, { pitch: "G4", duration: "q" }],
          tenor: [{ pitch: "D4", duration: "8" }, { pitch: "C4", duration: "8" }, { pitch: "D4", duration: "q" }, { pitch: "E4", duration: "q" }],
          bass: [{ pitch: "G3", duration: "q" }, { pitch: "G2", duration: "q" }, { pitch: "C3", duration: "q" }],
        }, questionVoices: {
          soprano: [{ duration: "hd" }],
          alto: [{ duration: "hd" }],
          tenor: [{ duration: "hd" }],
          bass: [{ duration: "hd" }],
        } },
      ],
      harmonicEvents: [
        harmonicBox(1, 4, null, "F: Vb", { questionLabel: "F: Vb", chordSymbol: "C/E" }),
        harmonicBox(2, 1, null, "I", { questionLabel: "I", chordSymbol: "F" }),
        harmonicBox(2, 2, null, "F: Ib / C: IVb", { questionLabel: "F: Ib / C: IVb", chordSymbol: "F/A" }),
        harmonicBox(2, 3.5, null, "Vb", { questionLabel: "Vb", chordSymbol: "G/B" }),
        harmonicBox(2, 4, null, "Ib", { questionLabel: "Ib", chordSymbol: "C/E" }),
        harmonicBox(2, 4.5, null, "I", { questionLabel: "I", chordSymbol: "C" }),
        harmonicBox(3, 1, null, "V⁴–³", {
          questionLabel: "V⁴–³",
          chordSymbol: "Gsus4",
          resolution: { beat: 2, chordSymbol: "G" },
        }),
        harmonicBox(3, 3, null, "I", { questionLabel: "I", chordSymbol: "C" }),
      ],
      nonHarmonicNotes: [
        { measure: 2, event: 1, pitch: "G4", chordSymbol: "F", type: "passing note" },
        { measure: 2, event: 3, pitch: "E4", chordSymbol: "F/A", type: "passing note" },
      ],
    }),
    answerHeading: "One acceptable SATB realisation",
    answer: [
      "The model follows the published harmonic route F: Vb–I–Ib, pivoting as C: IVb, then C: Vb–Ib–I–V4–3–I. It includes passing motion in the final dominant span.",
      "This is one acceptable realisation. Other solutions are possible; check voice order, singable ranges, tendency-note resolution, and the absence of consecutive perfect fifths or octaves.",
    ],
  }),
  createQuestion({
    id: "satb-f-c",
    category: "satb",
    sourceType: "original-practice",
    source: originalSource("Chorale-style F-major modulation"),
    family: "SATB / vocal completion",
    title: "Original: F major to C major",
    context:
      "Complete alto and tenor beneath the given outer parts. Preserve common tones through the pivot and resolve the final dominant seventh correctly.",
    score: measuredScore({
      key: "F major → C major",
      keySignature: "F",
      layout: "satb",
      completion: true,
      labelPosition: "bottom",
      caption: "Original practice • SATB in F major and C major",
      measures: [
        { events: [
          { voices: { soprano: "A4", alto: "F4", tenor: "C3", bass: "F2" }, questionVoices: { soprano: "A4", bass: "F2" }, duration: "q" },
          { voices: { soprano: "Bb4", alto: "F4", tenor: "D3", bass: "Bb2" }, questionVoices: { soprano: "Bb4", bass: "Bb2" }, duration: "q" },
          { voices: { soprano: "Bb4", alto: "E4", tenor: "G3", bass: "C3" }, questionVoices: { soprano: "Bb4", bass: "C3" }, duration: "q" },
          { voices: { soprano: "A4", alto: "F4", tenor: "C3", bass: "F2" }, questionVoices: { soprano: "A4", bass: "F2" }, duration: "q" },
        ] },
        { events: [
          { voices: { soprano: "C5", alto: "F4", tenor: "A3", bass: "C3" }, questionVoices: { soprano: "C5", bass: "C3" }, duration: "h" },
          { voices: { soprano: "B4", alto: "F4", tenor: "D3", bass: "G2" }, questionVoices: { soprano: "B4", bass: "G2" }, duration: "h" },
        ] },
        { endBarline: "final", events: [
          { voices: { soprano: "C5", alto: "G4", tenor: "E3", bass: "C3" }, questionVoices: { soprano: "C5", bass: "C3" }, duration: "w" },
        ] },
      ],
      harmonicEvents: [
        harmonicBox(1, 1, 0, "F: I", { questionLabel: "F: I", chordSymbol: "F" }),
        harmonicBox(1, 2, 1, "IV", { questionLabel: "IV", chordSymbol: "B♭" }),
        harmonicBox(1, 3, 2, "V⁷", { questionLabel: "V⁷", chordSymbol: "C7" }),
        harmonicBox(1, 4, 3, "I", { questionLabel: "I", chordSymbol: "F" }),
        harmonicBox(2, 1, 0, "F: I⁶4 / C: IV⁶4", { questionLabel: "I⁶4 / C: IV⁶4", chordSymbol: "F/C" }),
        harmonicBox(2, 3, 1, "C: V⁷", { questionLabel: "V⁷", chordSymbol: "G7" }),
        harmonicBox(3, 1, 0, "I", { questionLabel: "I", chordSymbol: "C" }),
      ],
    }),
    answerHeading: "One acceptable SATB realisation",
    answer: [
      "The F chord over C keeps the common tones A and F while functioning as a pivot into C major. B rises to C and the seventh F in G7 falls to E at the cadence.",
    ],
  }),
  createQuestion({
    id: "satb-gminor",
    category: "satb",
    sourceType: "original-practice",
    source: originalSource("G-minor chorale cadence"),
    family: "SATB / vocal completion",
    title: "Original: minor-key cadence",
    context:
      "Fill the inner parts, keeping the soprano and bass intact. Treat F-sharp as the raised leading note and resolve the dominant seventh by step.",
    score: measuredScore({
      key: "G minor",
      keySignature: "Gm",
      layout: "satb",
      completion: true,
      labelPosition: "bottom",
      caption: "Original practice • SATB cadence in G minor",
      measures: [
        { events: [
          { voices: { soprano: "G5", alto: "Bb4", tenor: "D3", bass: "G2" }, questionVoices: { soprano: "G5", bass: "G2" }, duration: "h" },
          { voices: { soprano: "G5", alto: "C5", tenor: "Eb3", bass: "C3" }, questionVoices: { soprano: "G5", bass: "C3" }, duration: "h" },
        ] },
        { events: [
          { voices: { soprano: "F#5", alto: "C5", tenor: "A3", bass: "D3" }, questionVoices: { soprano: "F#5", bass: "D3" }, duration: "h" },
          { voices: { soprano: "G5", alto: "Bb4", tenor: "D3", bass: "G2" }, questionVoices: { soprano: "G5", bass: "G2" }, duration: "h" },
        ] },
        { endBarline: "final", events: [
          { voices: { soprano: "Eb5", alto: "G4", tenor: "C3", bass: "C3" }, questionVoices: { soprano: "Eb5", bass: "C3" }, duration: "q" },
          { voices: { soprano: "D5", alto: "F#4", tenor: "A3", bass: "D3" }, questionVoices: { soprano: "D5", bass: "D3" }, duration: "q" },
          { voices: { soprano: "G5", alto: "Bb4", tenor: "D3", bass: "G2" }, questionVoices: { soprano: "G5", bass: "G2" }, duration: "h" },
        ] },
      ],
      harmonicEvents: [
        harmonicBox(1, 1, 0, "g: i", { questionLabel: "g: i", chordSymbol: "Gm" }),
        harmonicBox(1, 3, 1, "iv", { questionLabel: "iv", chordSymbol: "Cm" }),
        harmonicBox(2, 1, 0, "V⁷", { questionLabel: "V⁷", chordSymbol: "D7" }),
        harmonicBox(2, 3, 1, "i", { questionLabel: "i", chordSymbol: "Gm" }),
        harmonicBox(3, 1, 0, "iv", { questionLabel: "iv", chordSymbol: "Cm" }),
        harmonicBox(3, 2, 1, "V", { questionLabel: "V", chordSymbol: "D" }),
        harmonicBox(3, 3, 2, "i", { questionLabel: "i", chordSymbol: "Gm" }),
      ],
    }),
    answerHeading: "One acceptable inner-part solution",
    answer: [
      "F♯ resolves to G at the principal cadence and C, the seventh of D7, resolves down to B♭. Contrary motion between soprano and bass strengthens the close.",
    ],
  }),
  createQuestion({
    id: "satb-c-aminor",
    category: "satb",
    sourceType: "original-practice",
    source: originalSource("C-major chorale turning to A minor"),
    family: "SATB / vocal completion",
    title: "Original: relative-minor chorale",
    context:
      "Complete the alto and tenor lines through the move from C major to A minor. Keep each voice in range and make G-sharp resolve to A.",
    score: measuredScore({
      key: "C major → A minor",
      keySignature: "C",
      layout: "satb",
      completion: true,
      labelPosition: "bottom",
      caption: "Original practice • SATB in C major and A minor",
      measures: [
        { events: [
          { voices: { soprano: "G4", alto: "E4", tenor: "C3", bass: "C3" }, questionVoices: { soprano: "G4", bass: "C3" }, duration: "q" },
          { voices: { soprano: "A4", alto: "F4", tenor: "C3", bass: "F2" }, questionVoices: { soprano: "A4", bass: "F2" }, duration: "q" },
          { voices: { soprano: "B4", alto: "F4", tenor: "D3", bass: "G2" }, questionVoices: { soprano: "B4", bass: "G2" }, duration: "q" },
          { voices: { soprano: "C5", alto: "E4", tenor: "A3", bass: "A2" }, questionVoices: { soprano: "C5", bass: "A2" }, duration: "q" },
        ] },
        { events: [
          { voices: { soprano: "D5", alto: "A4", tenor: "F3", bass: "D3" }, questionVoices: { soprano: "D5", bass: "D3" }, duration: "h" },
          { voices: { soprano: "B4", alto: "G#4", tenor: "D4", bass: "E3" }, questionVoices: { soprano: "B4", bass: "E3" }, duration: "h" },
        ] },
        { endBarline: "final", events: [
          { voices: { soprano: "A4", alto: "E4", tenor: "C3", bass: "A2" }, questionVoices: { soprano: "A4", bass: "A2" }, duration: "w" },
        ] },
      ],
      harmonicEvents: [
        harmonicBox(1, 1, 0, "C: I", { questionLabel: "C: I", chordSymbol: "C" }),
        harmonicBox(1, 2, 1, "IV", { questionLabel: "IV", chordSymbol: "F" }),
        harmonicBox(1, 3, 2, "V⁷", { questionLabel: "V⁷", chordSymbol: "G7" }),
        harmonicBox(1, 4, 3, "C: vi / a: i", { questionLabel: "vi / a: i", chordSymbol: "Am" }),
        harmonicBox(2, 1, 0, "a: iv", { questionLabel: "iv", chordSymbol: "Dm" }),
        harmonicBox(2, 3, 1, "V⁷", { questionLabel: "V⁷", chordSymbol: "E7" }),
        harmonicBox(3, 1, 0, "i", { questionLabel: "i", chordSymbol: "Am" }),
      ],
    }),
    answerHeading: "One acceptable relative-minor solution",
    answer: [
      "A minor serves as vi in C and i in the new key. At the close, G♯ rises to A while the seventh D in E7 falls to C.",
    ],
  }),
  createQuestion({
    id: "piano-d-f",
    category: "piano",
    sourceType: "original-practice",
    source: originalSource("Broken-chord piano modulation from D minor to F major"),
    family: "Piano completion",
    title: "Original: broken-chord modulation",
    context:
      "Continue the quaver accompaniment beneath the supplied melody. Preserve the opening pattern and make the final ii–V7–I in F major clear.",
    score: measuredScore({
      key: "D minor → F major",
      keySignature: "Dm",
      timeSignature: "6/8",
      layout: "piano",
      completion: true,
      labelPosition: "bottom",
      caption: "Original practice • piano completion in D minor and F major",
      measures: [
        { events: [
          { treble: ["F4", "A4"], qTreble: ["A4"], bass: ["D3"], qBass: ["D3"], duration: "8" },
          { treble: ["A4", "D5"], qTreble: ["D5"], bass: ["A2"], qBass: ["A2"], duration: "8" },
          { treble: ["F4", "A4"], qTreble: ["A4"], bass: ["D3"], qBass: ["D3"], duration: "8" },
          { treble: ["G4", "Bb4"], qTreble: ["Bb4"], bass: ["G2"], qBass: ["G2"], duration: "8" },
          { treble: ["Bb4", "D5"], qTreble: ["D5"], bass: ["D3"], qBass: ["D3"], duration: "8" },
          { treble: ["G4", "Bb4"], qTreble: ["Bb4"], bass: ["G2"], qBass: ["G2"], duration: "8" },
        ] },
        { events: [
          { treble: ["F4", "A4"], qTreble: ["A4"], bass: ["D3"], qBass: [], duration: "8" },
          { treble: ["A4", "D5"], qTreble: ["D5"], bass: ["A2"], qBass: [], duration: "8" },
          { treble: ["F4", "A4"], qTreble: ["A4"], bass: ["D3"], qBass: [], duration: "8" },
          { treble: ["E4", "G4", "Bb4"], qTreble: ["Bb4"], bass: ["C3"], qBass: [], duration: "8" },
          { treble: ["G4", "C5"], qTreble: ["C5"], bass: ["G2"], qBass: [], duration: "8" },
          { treble: ["E4", "Bb4"], qTreble: ["Bb4"], bass: ["C3"], qBass: [], duration: "8" },
        ] },
        { endBarline: "final", events: [
          { treble: ["F4", "A4"], qTreble: ["A4"], bass: ["F2"], qBass: [], duration: "8" },
          { treble: ["A4", "C5"], qTreble: ["C5"], bass: ["C3"], qBass: [], duration: "8" },
          { treble: ["F4", "A4"], qTreble: ["A4"], bass: ["F3"], qBass: [], duration: "8" },
          { treble: ["G4", "Bb4"], qTreble: ["Bb4"], bass: ["G2"], qBass: [], duration: "8" },
          { treble: ["E4", "G4", "Bb4"], qTreble: ["G4"], bass: ["C3"], qBass: [], duration: "8" },
          { treble: ["F4", "A4"], qTreble: ["A4"], bass: ["F2"], qBass: [], duration: "8" },
        ] },
      ],
      harmonicEvents: [
        harmonicBox(1, 1, 0, "d: i", { questionLabel: "d: i" }),
        harmonicBox(1, 4, 3, "iv", { questionLabel: "iv" }),
        harmonicBox(2, 1, 0, "d: i / F: vi", { questionLabel: "i / F: vi" }),
        harmonicBox(2, 4, 3, "F: V⁷", { questionLabel: "V⁷" }),
        harmonicBox(3, 1, 0, "F: I", { questionLabel: "I" }),
        harmonicBox(3, 4, 3, "ii–V⁷–I", { questionLabel: "ii–V⁷–I" }),
      ],
    }),
    answerHeading: "Model broken-chord accompaniment",
    answer: [
      "The model keeps the quaver pulse and alternates bass and chord members. D minor functions as i initially and vi in F; the final Gm–C7–F gesture makes the new tonic explicit.",
    ],
  }),
  createQuestion({
    id: "piano-a-fsharp",
    category: "piano",
    sourceType: "original-practice",
    source: originalSource("Chordal piano texture moving from A major to F-sharp minor"),
    family: "Piano completion",
    title: "Original: chordal texture into the relative minor",
    context:
      "Complete the missing bass and inner notes while retaining the crotchet chord pattern. Make the E-sharp in C-sharp 7 resolve convincingly.",
    score: measuredScore({
      key: "A major → F♯ minor",
      keySignature: "A",
      layout: "piano",
      completion: true,
      labelPosition: "bottom",
      caption: "Original practice • piano completion in A major and F-sharp minor",
      measures: [
        { events: [
          { treble: ["E4", "A4", "C#5"], qTreble: ["C#5"], bass: ["A2"], qBass: ["A2"], duration: "q" },
          { treble: ["F#4", "A4", "D5"], qTreble: ["D5"], bass: ["D3"], qBass: ["D3"], duration: "q" },
          { treble: ["D4", "G#4", "B4"], qTreble: ["B4"], bass: ["E3"], qBass: ["E3"], duration: "q" },
          { treble: ["E4", "A4", "C#5"], qTreble: ["C#5"], bass: ["A2"], qBass: ["A2"], duration: "q" },
        ] },
        { events: [
          { treble: ["C#4", "F#4", "A4"], qTreble: ["A4"], bass: ["F#2"], qBass: [], duration: "h" },
          { treble: ["B3", "E#4", "G#4"], qTreble: ["G#4"], bass: ["C#3"], qBass: [], duration: "h" },
        ] },
        { endBarline: "final", events: [
          { treble: ["C#4", "F#4", "A4"], qTreble: ["A4"], bass: ["F#2"], qBass: [], duration: "w" },
        ] },
      ],
      harmonicEvents: [
        harmonicBox(1, 1, 0, "A: I", { questionLabel: "A: I" }),
        harmonicBox(1, 2, 1, "IV", { questionLabel: "IV" }),
        harmonicBox(1, 3, 2, "V⁷", { questionLabel: "V⁷" }),
        harmonicBox(1, 4, 3, "I / f♯: III", { questionLabel: "I / f♯: III" }),
        harmonicBox(2, 1, 0, "f♯: i", { questionLabel: "i" }),
        harmonicBox(2, 3, 1, "V⁷", { questionLabel: "V⁷" }),
        harmonicBox(3, 1, 0, "i", { questionLabel: "i" }),
      ],
    }),
    answerHeading: "Model chordal accompaniment",
    answer: [
      "The texture preserves the supplied chord rhythm and register. E♯ is the chordal third of C♯7 and leading note of F♯ minor, so it resolves upward to F♯.",
    ],
  }),
  createQuestion({
    id: "piano-g-c",
    category: "piano",
    sourceType: "original-practice",
    source: originalSource("Phrase-based piano completion from G major to C major"),
    family: "Piano completion",
    title: "Original: accompaniment across a phrase boundary",
    context:
      "Continue the left-hand pattern after the rest and shape the second phrase toward a cadence in C major. The tied melody note must remain visible across the barline.",
    score: measuredScore({
      key: "G major → C major",
      keySignature: "G",
      layout: "piano",
      completion: true,
      labelPosition: "bottom",
      caption: "Original practice • piano phrases in G major and C major",
      measures: [
        { events: [
          { treble: ["D4", "G4", "B4"], qTreble: ["B4"], bass: ["G2"], qBass: ["G2"], duration: "q" },
          { treble: ["E4", "G4", "C5"], qTreble: ["C5"], bass: ["C3"], qBass: ["C3"], duration: "q" },
          { treble: ["C4", "F#4", "A4"], qTreble: ["A4"], bass: ["D3"], qBass: ["D3"], duration: "q" },
          { treble: ["E4", "G4", "C5"], qTreble: ["C5"], bass: ["C3"], qBass: ["C3"], duration: "q" },
        ] },
        { events: [
          { treble: ["E4", "G4", "C5"], qTreble: ["C5"], bass: ["C3"], qBass: [], duration: "h" },
          { treble: [], qTreble: [], trebleRest: true, bass: ["G2"], qBass: [], duration: "q" },
          { treble: ["D4", "F4", "B4"], qTreble: ["B4"], bass: ["G2"], qBass: [], duration: "q" },
        ] },
        { endBarline: "final", events: [
          { treble: ["E4", "G4", "C5"], qTreble: ["C5"], bass: ["C3"], qBass: [], duration: "w" },
        ] },
      ],
      ties: [{ from: 3, to: 4, staff: "treble", firstPitch: "C5", lastPitch: "C5" }],
      harmonicEvents: [
        harmonicBox(1, 1, 0, "G: I", { questionLabel: "G: I" }),
        harmonicBox(1, 2, 1, "G: IV / C: I", { questionLabel: "IV / C: I" }),
        harmonicBox(1, 3, 2, "G: V⁷", { questionLabel: "V⁷" }),
        harmonicBox(1, 4, 3, "G: IV / C: I", { questionLabel: "IV / C: I" }),
        harmonicBox(2, 1, 0, "C: I", { questionLabel: "C: I" }),
        harmonicBox(2, 4, 2, "V⁷", { questionLabel: "V⁷" }),
        harmonicBox(3, 1, 0, "I", { questionLabel: "I" }),
      ],
    }),
    answerHeading: "Model phrase continuation",
    answer: [
      "The rest articulates the phrase without stopping the bass motion. C major first appears as IV in G and then becomes the new tonic; G7–C confirms it at the close.",
    ],
  }),
  createQuestion({
    id: "piano-bflat-gminor",
    category: "piano",
    sourceType: "original-practice",
    source: originalSource("Dotted-rhythm piano completion in B-flat major and G minor"),
    family: "Piano completion",
    title: "Original: dotted melody into G minor",
    context:
      "Complete the chordal accompaniment under the dotted melody. Retain the 3/4 metre and make the final dominant-to-tonic motion in G minor clear.",
    score: measuredScore({
      key: "B♭ major → G minor",
      keySignature: "Bb",
      timeSignature: "3/4",
      layout: "piano",
      completion: true,
      labelPosition: "bottom",
      caption: "Original practice • dotted piano phrase in B-flat and G minor",
      measures: [
        { events: [
          { treble: ["D4", "F4", "Bb4"], qTreble: ["Bb4"], bass: ["Bb2"], qBass: ["Bb2"], duration: "qd" },
          { treble: ["C4", "Eb4", "A4"], qTreble: ["A4"], bass: ["F3"], qBass: ["F3"], duration: "8" },
          { treble: ["D4", "F4", "Bb4"], qTreble: ["Bb4"], bass: ["Bb2"], qBass: ["Bb2"], duration: "q" },
        ] },
        { events: [
          { treble: ["D4", "G4", "Bb4"], qTreble: ["Bb4"], bass: ["G2"], qBass: [], duration: "qd" },
          { treble: ["C4", "F#4", "A4"], qTreble: ["A4"], bass: ["D3"], qBass: [], duration: "8" },
          { treble: ["C4", "F#4", "A4"], qTreble: ["F#4"], bass: ["D3"], qBass: [], duration: "q" },
        ] },
        { endBarline: "final", events: [
          { treble: ["D4", "G4", "Bb4"], qTreble: ["G4"], bass: ["G2"], qBass: [], duration: "hd" },
        ] },
      ],
      harmonicEvents: [
        harmonicBox(1, 1, 0, "B♭: I", { questionLabel: "B♭: I" }),
        harmonicBox(1, 3, 2, "I / g: III", { questionLabel: "I / g: III" }),
        harmonicBox(2, 1, 0, "g: i", { questionLabel: "g: i" }),
        harmonicBox(2, 3, 2, "V⁷", { questionLabel: "V⁷" }),
        harmonicBox(3, 1, 0, "i", { questionLabel: "i" }),
      ],
    }),
    answerHeading: "Model dotted-rhythm accompaniment",
    answer: [
      "The model preserves the dotted-quarter–eighth gesture and supplies stable chord spacing beneath it. F♯ in D7 leads to G and confirms the relative minor.",
    ],
  }),
  createQuestion({
    id: "nzqa-2021-valentine-techniques",
    category: "jazz",
    sourceType: "nzqa-reference",
    source: nzqaSource(
      2021,
      "Question Three",
      "(a)",
      "Extract Six",
      "Richard Rodgers and Lorenz Hart",
      "My Funny Valentine",
      "bars 21–29, exam pp.8–9; schedule pp.8–9"
    ),
    family: "Jazz / rock notation",
    title: "Reference: minor-line harmony and tonic pedal",
    context:
      "Complete the chord boxes above bars 21–29, classify the marked X, Y and Z melody notes, and explain the two harmonic techniques operating in bars 21–25.",
    sourceSpec: {
      chordSymbols: ["Cm", "Cm9(maj7)", "Cm7", "Cm9(add6)", "Fm/C", "Fm", "Dm7(♭5)", "G7", "Fm/A♭", "G7", "Cm"],
      analysisPositions: 11,
      suppliedLabels: ["Cm", "Fm"],
      keyCentres: ["C minor"],
      noteAnnotationLabels: ["Y", "X", "Y", "X", "Y", "Z"],
      noteAnnotations: [
        { measure: 1, beat: 3, staff: "treble", pitch: "D5", label: "Y" },
        { measure: 2, beat: 2.5, staff: "treble", pitch: "F5", label: "X" },
        { measure: 3, beat: 3, staff: "treble", pitch: "D5", label: "Y" },
        { measure: 4, beat: 2.5, staff: "treble", pitch: "F5", label: "X" },
        { measure: 5, beat: 3, staff: "treble", pitch: "G4", label: "Y" },
        { measure: 6, beat: 3, staff: "treble", pitch: "G4", label: "Z" },
      ],
      measureCount: 9,
    },
    score: measuredScore({
      key: "C minor",
      keySignature: "Cm",
      sourceKeyCentres: ["C minor"],
      layout: "piano",
      labelPosition: "top",
      caption: "NZQA reference • 2021 Q3(a), Extract Six • bars 21–29 transcription",
      noteAnnotations: [
        { measure: 1, beat: 3, staff: "treble", pitch: "D5", label: "Y" },
        { measure: 2, beat: 2.5, staff: "treble", pitch: "F5", label: "X" },
        { measure: 3, beat: 3, staff: "treble", pitch: "D5", label: "Y" },
        { measure: 4, beat: 2.5, staff: "treble", pitch: "F5", label: "X" },
        { measure: 5, beat: 3, staff: "treble", pitch: "G4", label: "Y" },
        { measure: 6, beat: 3, staff: "treble", pitch: "G4", label: "Z" },
      ],
      measures: [
        { events: [
          { treble: ["C4", "Eb4", "G4"], bass: ["C3"], duration: "h" },
          { treble: ["D5"], bass: [], bassRest: true, duration: "q" },
          { treble: ["Eb5"], bass: ["C3"], duration: "q" },
        ] },
        { events: [
          { treble: ["Eb4", "G4", "B4", "D5"], bass: ["C3"], duration: "qd" },
          { treble: ["F5"], bass: [], bassRest: true, duration: "8" },
          { treble: ["Eb5"], bass: ["C3"], duration: "h" },
        ] },
        { events: [
          { treble: ["Eb4", "G4", "Bb4", "C5"], bass: ["C3"], duration: "h" },
          { treble: ["D5"], bass: ["G2"], duration: "q" },
          { treble: ["Eb5"], bass: ["C3"], duration: "q" },
        ] },
        { events: [
          { treble: ["D4", "Eb4", "G4", "A4"], bass: ["C3"], duration: "qd" },
          { treble: ["F5"], bass: [], bassRest: true, duration: "8" },
          { treble: ["Eb5"], bass: ["C3"], duration: "h" },
        ] },
        { events: [
          { treble: ["F4", "Ab4", "C5"], bass: ["C3"], duration: "h" },
          { treble: ["G4"], bass: ["C3"], duration: "q" },
          { treble: ["Ab4"], bass: ["C3"], duration: "q" },
        ] },
        { events: [
          { treble: ["F4", "Ab4", "C5"], bass: ["F2"], duration: "h" },
          { treble: ["G4"], bass: ["C3"], duration: "q" },
          { treble: ["Ab4"], bass: ["F2"], duration: "q" },
        ] },
        { events: [
          { treble: ["F4", "Ab4", "C5"], bass: ["D3"], duration: "h" },
          { treble: ["F4", "B4", "D5"], bass: ["G2"], duration: "h" },
        ] },
        { events: [
          { treble: ["F4", "Ab4", "C5"], bass: ["Ab2"], duration: "h" },
          { treble: ["F4", "B4", "D5"], bass: ["G2"], duration: "h" },
        ] },
        { endBarline: "final", events: [
          { treble: ["C4", "Eb4", "G4"], bass: ["C3"], duration: "h" },
          { treble: ["G4"], bass: [], bassRest: true, duration: "q" },
          { treble: ["C5"], bass: ["C3"], duration: "q" },
        ] },
      ],
      ties: [{ from: 18, to: 20, staff: "treble", firstPitch: "C5", lastPitch: "C5" }],
      harmonicEvents: [
        harmonicBox(1, 1, 0, "Cm", { chordSymbol: "Cm", questionLabel: "Cm" }),
        harmonicBox(2, 1, 0, "Cm9(maj7)", { chordSymbol: "Cm9(maj7)" }),
        harmonicBox(3, 1, 0, "Cm7", { chordSymbol: "Cm7" }),
        harmonicBox(4, 1, 0, "Cm9(add6)", { chordSymbol: "Cm9(add6)" }),
        harmonicBox(5, 1, 0, "Fm/C", { chordSymbol: "Fm/C" }),
        harmonicBox(6, 1, 0, "Fm", { chordSymbol: "Fm", questionLabel: "Fm" }),
        harmonicBox(7, 1, 0, "Dm7(♭5)", { chordSymbol: "Dm7♭5" }),
        harmonicBox(7, 3, 1, "G7", { chordSymbol: "G7" }),
        harmonicBox(8, 1, 0, "Fm/A♭", { chordSymbol: "Fm/A♭" }),
        harmonicBox(8, 3, 1, "G7", { chordSymbol: "G7" }),
        harmonicBox(9, 1, 0, "Cm", { chordSymbol: "Cm" }),
      ],
      nonHarmonicNotes: [
        { measure: 1, event: 1, pitch: "D5", chordSymbol: "Cm", type: "accented passing note" },
        { measure: 2, event: 1, pitch: "F5", chordSymbol: "Cm9(maj7)", type: "auxiliary note" },
        { measure: 3, event: 1, pitch: "D5", chordSymbol: "Cm7", type: "accented passing note" },
        { measure: 4, event: 1, pitch: "F5", chordSymbol: "Cm9(add6)", type: "auxiliary note" },
        { measure: 5, event: 1, pitch: "G4", chordSymbol: "Fm/C", type: "accented passing note" },
        { measure: 6, event: 1, pitch: "G4", chordSymbol: "Fm", type: "appoggiatura" },
      ],
    }),
    answerHeading: "Reference harmonic techniques",
    answer: [
      "<strong>Published chord route:</strong> Cm–Cm9(maj7)–Cm7–Cm9(add6)–Fm/C–Fm–Dm7(♭5)–G7–Fm/A♭–G7–Cm. Accepted alternatives should be credited when the displayed pitches and bass support them.",
      "X is an auxiliary note (bars 22 and 24), Y is an accented passing note (bars 21, 23 and 25), and Z is an appoggiatura (bar 26). The descending chromatic inner line creates movement and interest against the repeated melody, while the C tonic pedal in bars 21–25 provides stability.",
    ],
  }),
  createQuestion({
    id: "nzqa-2024-commercial-chromatic-bass",
    category: "jazz",
    sourceType: "nzqa-reference",
    source: nzqaSource(
      2024,
      "Question Three",
      "(a)",
      "Extract Six",
      "Phillip Norman",
      "Love is Commercial",
      "bars 16–28, exam pp.8–9; schedule p.9"
    ),
    family: "Jazz / rock notation",
    title: "Reference: one chord per bar over chromatic bass",
    context:
      "Analyse the eleven boxed positions in bars 19–28, including both sonorities in bar 23, then explain the descending bass and one-chord-per-bar harmonic rhythm in bars 24–28.",
    sourceSpec: {
      chordSymbols: ["C♯m(add9)", "Dmaj7", "Bm9", "G♯dim/B", "C♯7sus4", "C♯7", "F♯m", "E♯dim7", "F♯m/E", "D♯m7(♭5)", "Dmaj7"],
      analysisPositions: 11,
      suppliedLabels: ["C♯m(add9)"],
      sections: ["bars 24–28"],
      measureCount: 10,
      requiredPitchSpellings: ["E#2", "E#4"],
    },
    score: measuredScore({
      key: "D major / F♯ minor area",
      keySignature: "D",
      layout: "piano",
      labelPosition: "top",
      caption: "NZQA reference • 2024 Q3(a), Extract Six • bars 19–28 transcription",
      brackets: [{ start: 18, end: 40, label: "bars 24–28" }],
      measures: [
        { events: [
          { treble: ["E4", "G#4", "C#5", "D#5"], bass: ["C#3"], duration: "qd" },
          { treble: ["B4"], bass: [], bassRest: true, duration: "8" },
          { treble: ["G#4"], bass: ["G#2"], duration: "q" },
          { treble: ["E4", "D#5"], bass: ["C#3"], duration: "q" },
        ] },
        { events: [
          { treble: ["F#4", "A4", "C#5"], bass: ["D3"], duration: "q" },
          { treble: ["A4"], bass: ["A2"], duration: "q" },
          { treble: ["F#4"], bass: [], bassRest: true, duration: "q" },
          { treble: ["E4", "A4"], bass: ["D3"], duration: "q" },
        ] },
        { events: [
          { treble: ["D4", "A4", "B4", "C#5", "F#5"], bass: ["B2"], duration: "qd" },
          { treble: ["E5"], bass: [], bassRest: true, duration: "8" },
          { treble: ["D5"], bass: ["F#3"], duration: "q" },
          { treble: ["C#5"], bass: ["B2"], duration: "q" },
        ] },
        { events: [
          { treble: ["D4", "G#4", "B4"], bass: ["B2"], duration: "q" },
          { treble: ["C#5"], bass: ["D3"], duration: "q" },
          { treble: ["B4"], bass: [], bassRest: true, duration: "q" },
          { treble: ["G#4"], bass: ["B2"], duration: "q" },
        ] },
        { events: [
          { treble: ["F#4", "G#4", "B4"], bass: ["C#3"], duration: "h" },
          { treble: ["E#4", "G#4", "B4"], bass: ["C#3"], duration: "h" },
        ] },
        { events: [
          { treble: ["A3", "C#4", "F#4"], bass: ["F#2"], duration: "q" },
          { treble: ["C#5"], bass: ["C#3"], duration: "8" },
          { treble: ["B4"], bass: ["E3"], duration: "8" },
          { treble: ["A4"], bass: [], bassRest: true, duration: "q" },
          { treble: ["F#4"], bass: ["F#2"], duration: "q" },
        ] },
        { events: [
          { treble: ["G#3", "B3", "D4", "E#4"], bass: ["E#2"], duration: "q" },
          { treble: ["B4"], bass: ["B2"], duration: "q" },
          { treble: [], trebleRest: true, bass: ["D3"], duration: "q" },
          { treble: ["G#4"], bass: ["E#2"], duration: "q" },
        ] },
        { events: [
          { treble: ["A3", "C#4", "F#4"], bass: ["E2"], duration: "q" },
          { treble: ["G#4"], bass: ["C#3"], duration: "8" },
          { treble: ["A4"], bass: ["E3"], duration: "8" },
          { treble: ["C#5"], bass: [], bassRest: true, duration: "q" },
          { treble: ["A4"], bass: ["E2"], duration: "q" },
        ] },
        { events: [
          { treble: ["F#3", "A3", "C#4"], bass: ["D#2"], duration: "q" },
          { treble: ["A4"], bass: ["F#3"], duration: "q" },
          { treble: ["G#4"], bass: [], bassRest: true, duration: "q" },
          { treble: ["F#4"], bass: ["D#2"], duration: "q" },
        ] },
        { endBarline: "final", events: [
          { treble: ["C#4", "F#4", "A4"], bass: ["D2"], duration: "q" },
          { treble: ["E4"], bass: ["A2"], duration: "8" },
          { treble: ["F#4"], bass: ["D3"], duration: "8" },
          { treble: ["A4"], bass: [], bassRest: true, duration: "q" },
          { treble: ["C#4", "F#4", "A4"], bass: ["D2"], duration: "q" },
        ] },
      ],
      harmonicEvents: [
        harmonicBox(1, 1, 0, "C♯m(add9)", { chordSymbol: "C♯madd9", questionLabel: "C♯m(add9)" }),
        harmonicBox(2, 1, 0, "Dmaj7", { chordSymbol: "Dmaj7" }),
        harmonicBox(3, 1, 0, "Bm9", { chordSymbol: "Bm9" }),
        harmonicBox(4, 1, 0, "G♯dim/B", { chordSymbol: "G♯dim/B" }),
        harmonicBox(5, 1, 0, "C♯7sus4", { chordSymbol: "C♯7sus4" }),
        harmonicBox(5, 3, 1, "C♯7", { chordSymbol: "C♯7" }),
        harmonicBox(6, 1, 0, "F♯m", { chordSymbol: "F♯m" }),
        harmonicBox(7, 1, 0, "E♯dim7", { chordSymbol: "E♯dim7" }),
        harmonicBox(8, 1, 0, "F♯m/E", { chordSymbol: "F♯m/E" }),
        harmonicBox(9, 1, 0, "D♯m7(♭5)", { chordSymbol: "D♯m7(♭5)" }),
        harmonicBox(10, 1, 0, "Dmaj7", { chordSymbol: "Dmaj7" }),
      ],
    }),
    answerHeading: "Reference chord analysis and effect",
    answer: [
      "<strong>Published analysis:</strong> C♯m(add9)–Dmaj7–Bm9–G♯dim/B–C♯7sus4–C♯7–F♯m–E♯dim7–F♯m/E–D♯m7(♭5)–Dmaj7. Credit alternatives only where the published score and schedule support them.",
      "In bars 24–28, the bass descends F♯–E♯–E–D♯–D and contrasts with the earlier more static bass. One chord per bar slows and regularises the harmonic rhythm while the chromatic descent creates momentum and forward direction.",
    ],
  }),
  createQuestion({
    id: "jazz-c-turnaround",
    category: "jazz",
    sourceType: "original-practice",
    source: originalSource("C-major extended turnaround"),
    family: "Jazz / rock notation",
    title: "Original: secondary-dominant turnaround",
    context:
      "Write a chord symbol in every box and explain how A7 extends the turnaround. Include the final added sixth.",
    score: measuredScore({
      key: "C major",
      keySignature: "C",
      labelPosition: "top",
      caption: "Original practice • C-major jazz turnaround",
      measures: [
        { events: [
          { treble: ["F4", "A4", "C5"], bass: ["D3"], duration: "q" },
          { treble: ["E5"], bass: [], bassRest: true, duration: "q" },
          { treble: ["F4", "B4", "D5"], bass: ["G2"], duration: "q" },
          { treble: ["A4"], bass: ["D3"], duration: "q" },
        ] },
        { events: [
          { treble: ["E4", "G4", "B4"], bass: ["C3"], duration: "q" },
          { treble: ["D5"], bass: ["G2"], duration: "8" },
          { treble: ["E5"], bass: ["B2"], duration: "8" },
          { treble: ["C#4", "E4", "G4"], bass: ["A2"], duration: "q" },
          { treble: ["B4"], bass: [], bassRest: true, duration: "q" },
        ] },
        { events: [
          { treble: ["F4", "A4", "C5"], bass: ["D3"], duration: "q" },
          { treble: ["D5"], bass: ["A2"], duration: "q" },
          { treble: ["F4", "B4", "D5"], bass: ["G2"], duration: "q" },
          { treble: ["A4"], bass: ["G3"], duration: "q" },
        ] },
        { endBarline: "final", events: [
          { treble: ["E4", "G4", "A4"], bass: ["C3"], duration: "q" },
          { treble: ["E5"], bass: ["G2"], duration: "8" },
          { treble: ["D5"], bass: ["A2"], duration: "8" },
          { treble: [], trebleRest: true, bass: ["G2"], duration: "q" },
          { treble: ["E4", "G4", "A4"], bass: ["C3"], duration: "q" },
        ] },
      ],
      ties: [{ from: 12, to: 13, staff: "treble", firstPitch: "A4", lastPitch: "A4" }],
      harmonicEvents: [
        harmonicBox(1, 1, 0, "Dm7", { chordSymbol: "Dm7", questionLabel: "Dm7" }),
        harmonicBox(1, 3, 2, "G7", { chordSymbol: "G7" }),
        harmonicBox(2, 1, 0, "Cmaj7", { chordSymbol: "Cmaj7" }),
        harmonicBox(2, 3, 3, "A7", { chordSymbol: "A7" }),
        harmonicBox(3, 1, 0, "Dm7", { chordSymbol: "Dm7" }),
        harmonicBox(3, 3, 2, "G7", { chordSymbol: "G7" }),
        harmonicBox(4, 1, 0, "C6", { chordSymbol: "C6" }),
      ],
    }),
    answerHeading: "Chord symbols and function",
    answer: [
      "<strong>Progression:</strong> Dm7–G7–Cmaj7–A7–Dm7–G7–C6. A7 is V7 of ii: C♯ directs the harmony into Dm7 before the final ii–V–I.",
      "The final C6 voicing is C–E–G–A. In this G7-to-tonic context, C6 is the intended and musically appropriate analysis.",
    ],
  }),
  createQuestion({
    id: "jazz-e-turnaround",
    category: "jazz",
    sourceType: "original-practice",
    source: originalSource("E-major pop-jazz turnaround"),
    family: "Jazz / rock notation",
    title: "Original: pop-jazz phrase in E",
    context:
      "Name the chords, including sevenths and the final added sixth. Explain the function of C-sharp 7.",
    score: measuredScore({
      key: "E major",
      keySignature: "E",
      labelPosition: "top",
      caption: "Original practice • E-major pop-jazz turnaround",
      measures: [
        { events: [
          { treble: ["A4", "C#5", "E5"], bass: ["F#3"], duration: "q" },
          { treble: ["G#5"], bass: [], bassRest: true, duration: "q" },
          { treble: ["A4", "D#5", "F#5"], bass: ["B2"], duration: "q" },
          { treble: ["C#5"], bass: ["F#3"], duration: "q" },
        ] },
        { events: [
          { treble: ["G#4", "B4", "D#5"], bass: ["E3"], duration: "q" },
          { treble: ["F#5"], bass: ["B2"], duration: "8" },
          { treble: ["G#5"], bass: ["D#3"], duration: "8" },
          { treble: ["B3", "E#4", "G#4"], bass: ["C#3"], duration: "q" },
          { treble: ["D#5"], bass: [], bassRest: true, duration: "q" },
        ] },
        { events: [
          { treble: ["A4", "C#5", "E5"], bass: ["F#3"], duration: "q" },
          { treble: ["F#5"], bass: ["C#3"], duration: "q" },
          { treble: ["A4", "D#5", "F#5"], bass: ["B2"], duration: "q" },
          { treble: ["C#5"], bass: ["B3"], duration: "q" },
        ] },
        { endBarline: "final", events: [
          { treble: ["G#4", "B4", "C#5"], bass: ["E3"], duration: "h" },
          { treble: ["B4"], bass: [], bassRest: true, duration: "q" },
          { treble: ["G#4", "B4", "C#5"], bass: ["E3"], duration: "q" },
        ] },
      ],
      harmonicEvents: [
        harmonicBox(1, 1, 0, "F♯m7", { chordSymbol: "F♯m7", questionLabel: "F♯m7" }),
        harmonicBox(1, 3, 2, "B7", { chordSymbol: "B7" }),
        harmonicBox(2, 1, 0, "Emaj7", { chordSymbol: "Emaj7" }),
        harmonicBox(2, 3, 3, "C♯7", { chordSymbol: "C♯7" }),
        harmonicBox(3, 1, 0, "F♯m7", { chordSymbol: "F♯m7" }),
        harmonicBox(3, 3, 2, "B7", { chordSymbol: "B7" }),
        harmonicBox(4, 1, 0, "E6", { chordSymbol: "E6" }),
      ],
    }),
    answerHeading: "Complete chord analysis",
    answer: [
      "C♯7 is V7 of ii. E♯ is its chordal third and leading note into F♯, so it is not a non-harmonic note in that sonority.",
    ],
  }),
  createQuestion({
    id: "jazz-blues-secondary",
    category: "jazz",
    sourceType: "original-practice",
    source: originalSource("Blues-inflected turnaround with a diminished connector"),
    family: "Jazz / rock notation",
    title: "Original: blues colour and diminished link",
    context:
      "Identify the eight chord symbols and explain how the diminished seventh connects F7 to the tonic over G.",
    score: measuredScore({
      key: "C major / blues",
      keySignature: "C",
      labelPosition: "top",
      caption: "Original practice • blues-inflected turnaround",
      measures: [
        { events: [
          { treble: ["E4", "G4", "Bb4"], bass: ["C3"], duration: "q" },
          { treble: ["C5"], bass: ["G2"], duration: "q" },
          { treble: ["A3", "C4", "Eb4"], bass: ["F2"], duration: "q" },
          { treble: ["G4"], bass: [], bassRest: true, duration: "q" },
        ] },
        { events: [
          { treble: ["A3", "C4", "Eb4"], bass: ["F#2"], duration: "q" },
          { treble: ["A4"], bass: ["A2"], duration: "8" },
          { treble: ["G4"], bass: ["B2"], duration: "8" },
          { treble: ["E4", "G4", "C5"], bass: ["G2"], duration: "q" },
          { treble: ["E5"], bass: [], bassRest: true, duration: "q" },
        ] },
        { events: [
          { treble: ["C#4", "E4", "G4"], bass: ["A2"], duration: "q" },
          { treble: ["B4"], bass: ["E3"], duration: "q" },
          { treble: ["F4", "A4", "C5"], bass: ["D3"], duration: "q" },
          { treble: ["E5"], bass: ["A2"], duration: "q" },
        ] },
        { endBarline: "final", events: [
          { treble: ["F4", "B4", "D5"], bass: ["G2"], duration: "q" },
          { treble: ["A4"], bass: ["D3"], duration: "q" },
          { treble: ["E4", "G4", "A4"], bass: ["C3"], duration: "q" },
          { treble: ["E4", "G4", "A4"], bass: ["C3"], duration: "q" },
        ] },
      ],
      harmonicEvents: [
        harmonicBox(1, 1, 0, "C7", { chordSymbol: "C7", questionLabel: "C7" }),
        harmonicBox(1, 3, 2, "F7", { chordSymbol: "F7" }),
        harmonicBox(2, 1, 0, "F♯dim7", { chordSymbol: "F♯dim7" }),
        harmonicBox(2, 3, 3, "C/G", { chordSymbol: "C/G" }),
        harmonicBox(3, 1, 0, "A7", { chordSymbol: "A7" }),
        harmonicBox(3, 3, 2, "Dm7", { chordSymbol: "Dm7" }),
        harmonicBox(4, 1, 0, "G7", { chordSymbol: "G7" }),
        harmonicBox(4, 3, 2, "C6", { chordSymbol: "C6" }),
      ],
    }),
    answerHeading: "Blues turnaround analysis",
    answer: [
      "F♯dim7 intensifies the semitone approach into G bass and C/G. A7 then functions as V7 of ii before the conventional Dm7–G7–C6 close.",
    ],
  }),
  createQuestion({
    id: "jazz-sus-line",
    category: "jazz",
    sourceType: "original-practice",
    source: originalSource("Suspended-dominant jazz phrase"),
    family: "Jazz / rock notation",
    title: "Original: suspended dominant and ninths",
    context:
      "Name the extended chords and distinguish G7sus4 from its resolution to G7. Explain why the suspension delays dominant resolution.",
    score: measuredScore({
      key: "C major",
      keySignature: "C",
      labelPosition: "top",
      caption: "Original practice • suspended-dominant jazz phrase",
      measures: [
        { events: [
          { treble: ["F4", "A4", "C5", "E5"], bass: ["D3"], duration: "q" },
          { treble: ["A4"], bass: [], bassRest: true, duration: "q" },
          { treble: ["F4", "C5", "D5"], bass: ["G2"], duration: "q" },
          { treble: ["E5"], bass: ["D3"], duration: "q" },
        ] },
        { events: [
          { treble: ["F4", "B4", "D5"], bass: ["G2"], duration: "q" },
          { treble: ["A4"], bass: ["D3"], duration: "8" },
          { treble: ["B4"], bass: ["G3"], duration: "8" },
          { treble: ["D4", "E4", "G4", "B4"], bass: ["C3"], duration: "q" },
          { treble: ["E5"], bass: [], bassRest: true, duration: "q" },
        ] },
        { events: [
          { treble: ["C#4", "E4", "G4"], bass: ["A2"], duration: "q" },
          { treble: ["B4"], bass: ["E3"], duration: "q" },
          { treble: ["F4", "A4", "C5", "E5"], bass: ["D3"], duration: "q" },
          { treble: ["F5"], bass: ["A2"], duration: "q" },
        ] },
        { endBarline: "final", events: [
          { treble: ["F4", "B4", "D5"], bass: ["G2"], duration: "q" },
          { treble: ["A4"], bass: ["D3"], duration: "q" },
          { treble: ["E4", "G4", "A4"], bass: ["C3"], duration: "q" },
          { treble: ["E4", "G4", "A4"], bass: ["C3"], duration: "q" },
        ] },
      ],
      ties: [{ from: 15, to: 16, staff: "treble", firstPitch: "A4", lastPitch: "A4" }],
      harmonicEvents: [
        harmonicBox(1, 1, 0, "Dm9", { chordSymbol: "Dm9", questionLabel: "Dm9" }),
        harmonicBox(1, 3, 2, "G7sus4", { chordSymbol: "G7sus4" }),
        harmonicBox(2, 1, 0, "G7", { chordSymbol: "G7" }),
        harmonicBox(2, 3, 3, "Cmaj9", { chordSymbol: "Cmaj9" }),
        harmonicBox(3, 1, 0, "A7", { chordSymbol: "A7" }),
        harmonicBox(3, 3, 2, "Dm9", { chordSymbol: "Dm9" }),
        harmonicBox(4, 1, 0, "G7", { chordSymbol: "G7" }),
        harmonicBox(4, 3, 2, "C6", { chordSymbol: "C6" }),
      ],
    }),
    answerHeading: "Suspension and extensions",
    answer: [
      "The C in G7sus4 replaces B and delays the dominant’s leading-note pull. Its fall to B forms G7, which then resolves to Cmaj9; the second half uses A7 as V7 of ii.",
    ],
  }),
  createQuestion({
    id: "nzqa-2023-poulenc-pedal",
    category: "features",
    sourceType: "nzqa-reference",
    source: nzqaSource(
      2023,
      "Question Two",
      "(a)",
      "Extract Four",
      "Francis Poulenc",
      "Novelette No. 1 in C minor",
      "bars 1–5, exam p.5; schedule p.6"
    ),
    family: "Harmonic or tonal feature",
    title: "Reference: tonic pedal with dissonance",
    context:
      "Identify the compositional device in the bass of this 3/8 opening and explain how it establishes C while creating dissonance beneath the changing melody and inner parts.",
    sourceSpec: {
      chordSymbols: ["C", "Dm/C", "F/C", "G7/C", "C"],
      analysisPositions: 5,
      keyCentres: ["C major"],
      measureCount: 5,
      bassPedal: "C",
    },
    score: measuredScore({
      key: "C major area",
      keySignature: "C",
      sourceKeyCentres: ["C major"],
      timeSignature: "3/8",
      layout: "piano",
      caption: "NZQA reference • 2023 Q2(a), Extract Four • bars 1–5 transcription",
      measures: [
        { events: [
          { treble: ["G4"], bass: ["C3", "E3"], duration: "16" },
          { treble: [], trebleRest: true, bass: ["C3", "G3"], duration: "16" },
          { treble: ["C5"], bass: ["C3", "E3"], duration: "16" },
          { treble: [], trebleRest: true, bass: ["C3", "G3"], duration: "16" },
          { treble: ["B4"], bass: ["C3", "E3"], duration: "16" },
          { treble: [], trebleRest: true, bass: ["C3", "G3"], duration: "16" },
        ] },
        { events: [
          { treble: ["A4"], bass: ["C3", "D3", "F3"], duration: "16" },
          { treble: [], trebleRest: true, bass: ["C3", "A3"], duration: "16" },
          { treble: ["D5"], bass: ["C3", "F3"], duration: "16" },
          { treble: [], trebleRest: true, bass: ["C3", "A3"], duration: "16" },
          { treble: ["C5"], bass: ["C3", "D3"], duration: "16" },
          { treble: [], trebleRest: true, bass: ["C3", "F3"], duration: "16" },
        ] },
        { events: [
          { treble: ["A4"], bass: ["C3", "F3"], duration: "16" },
          { treble: [], trebleRest: true, bass: ["C3", "A3"], duration: "16" },
          { treble: ["F5"], bass: ["C3", "F3"], duration: "16" },
          { treble: [], trebleRest: true, bass: ["C3", "A3"], duration: "16" },
          { treble: ["E5"], bass: ["C3", "F3"], duration: "16" },
          { treble: [], trebleRest: true, bass: ["C3", "A3"], duration: "16" },
        ] },
        { events: [
          { treble: ["F4", "G4", "B4", "D5"], bass: ["C3"], duration: "16" },
          { treble: [], trebleRest: true, bass: ["C3", "G3"], duration: "16" },
          { treble: ["D5"], bass: ["C3", "B3"], duration: "16" },
          { treble: [], trebleRest: true, bass: ["C3", "G3"], duration: "16" },
          { treble: ["B4"], bass: ["C3", "F3"], duration: "16" },
          { treble: [], trebleRest: true, bass: ["C3", "D3"], duration: "16" },
        ] },
        { endBarline: "final", events: [
          { treble: ["E4", "G4", "C5"], bass: ["C3"], duration: "8" },
          { treble: ["D4", "F4", "B4"], bass: ["G2"], duration: "8" },
          { treble: ["E4", "G4", "C5"], bass: ["C3"], duration: "8" },
        ] },
      ],
      harmonicEvents: [
        { measure: 1, beat: 1, event: 0, analysisBox: false, chordSymbol: "C" },
        { measure: 2, beat: 1, event: 0, analysisBox: false, chordSymbol: "Dm/C" },
        { measure: 3, beat: 1, event: 0, analysisBox: false, chordSymbol: "F/C" },
        { measure: 4, beat: 1, event: 0, analysisBox: false, chordSymbol: "G7/C" },
        { measure: 5, beat: 1, event: 0, analysisBox: false, chordSymbol: "C" },
      ],
    }),
    answerHeading: "Reference pedal analysis",
    answer: [
      "The repeated C is a tonic pedal. It establishes and continually recalls the C tonic while D-minor, F and G7 sonorities create changing degrees of dissonance above it.",
      "That combination of tonal stability and upper-part friction is the function identified in the 2023 assessment schedule.",
    ],
  }),
  createQuestion({
    id: "feature-diminished",
    category: "features",
    sourceType: "original-practice",
    source: originalSource("Secondary diminished seventh decorating a cadence"),
    family: "Harmonic or tonal feature",
    title: "Original: diminished seventh before the dominant",
    context:
      "Identify chord X, describe its voice leading and explain how it strengthens the larger cadence in C major.",
    score: measuredScore({
      key: "C major",
      keySignature: "C",
      labelPosition: "bottom",
      caption: "Original practice • diminished-seventh function",
      brackets: [{ start: 2, end: 2, label: "X" }],
      measures: [
        { events: [
          { treble: ["E4", "G4", "C5"], bass: ["C3"], duration: "h" },
          { treble: ["F4", "A4", "D5"], bass: ["D3"], duration: "h" },
        ] },
        { events: [
          { treble: ["C4", "Eb4", "A4"], bass: ["F#3"], duration: "h" },
          { treble: ["B3", "D4", "F4"], bass: ["G2"], duration: "h" },
        ] },
        { endBarline: "final", events: [
          { treble: ["C4", "E4", "G4"], bass: ["C3"], duration: "w" },
        ] },
      ],
      harmonicEvents: [
        harmonicBox(1, 1, 0, "I", { localKey: "C major", romanNumeral: "I", chordSymbol: "C", questionLabel: "C: I" }),
        harmonicBox(1, 3, 1, "ii", { localKey: "C major", romanNumeral: "ii", chordSymbol: "Dm" }),
        harmonicBox(2, 1, 0, "vii°7/V", { localKey: "C major", romanNumeral: "vii7/V", chordSymbol: "F♯dim7" }),
        harmonicBox(2, 3, 1, "V⁷", { localKey: "C major", romanNumeral: "V7", chordSymbol: "G7" }),
        harmonicBox(3, 1, 0, "I", { localKey: "C major", romanNumeral: "I", chordSymbol: "C" }),
      ],
    }),
    answerHeading: "Function and effect",
    answer: [
      "X is F♯ diminished seventh, vii°7/V. F♯ rises to G while E♭ falls to D, intensifying the dominant arrival. It decorates and strengthens the G7–C perfect cadence.",
    ],
  }),
  createQuestion({
    id: "feature-pedal",
    category: "features",
    sourceType: "original-practice",
    source: originalSource("Tonic pedal beneath changing upper harmonies"),
    family: "Harmonic or tonal feature",
    title: "Original: tonic pedal across a phrase",
    context:
      "Identify the bass device and explain the balance of stability and dissonance it creates as the upper chords change.",
    score: measuredScore({
      key: "C major",
      keySignature: "C",
      timeSignature: "3/4",
      layout: "piano",
      caption: "Original practice • tonic pedal in C major",
      measures: [
        { events: [{ treble: ["E4", "G4", "C5"], bass: ["C3"], duration: "hd" }] },
        { events: [{ treble: ["F4", "A4", "D5"], bass: ["C3"], duration: "hd" }] },
        { events: [{ treble: ["F4", "A4", "C5"], bass: ["C3"], duration: "hd" }] },
        { endBarline: "final", events: [{ treble: ["E4", "G4", "C5"], bass: ["C3"], duration: "hd" }] },
      ],
      harmonicEvents: [
        { measure: 1, beat: 1, event: 0, analysisBox: false, chordSymbol: "C" },
        { measure: 2, beat: 1, event: 0, analysisBox: false, chordSymbol: "Dm/C" },
        { measure: 3, beat: 1, event: 0, analysisBox: false, chordSymbol: "F/C" },
        { measure: 4, beat: 1, event: 0, analysisBox: false, chordSymbol: "C" },
      ],
    }),
    answerHeading: "Tonic-pedal analysis",
    answer: [
      "C is a tonic pedal. It keeps the tonic present while the D-minor and F sonorities create temporary friction above it, making the final consonant C chord feel settled.",
    ],
  }),
  createQuestion({
    id: "feature-chromatic-bass",
    category: "features",
    sourceType: "original-practice",
    source: originalSource("Descending chromatic bass in A minor"),
    family: "Harmonic or tonal feature",
    title: "Original: descending chromatic bass",
    context:
      "Describe the bass pattern and explain how the notated harmonic changes lead to the final cadence in A minor.",
    score: measuredScore({
      key: "A minor",
      keySignature: "Am",
      layout: "piano",
      labelPosition: "bottom",
      caption: "Original practice • chromatic bass in A minor",
      measures: [
        { events: [
          { treble: ["C4", "E4", "A4"], bass: ["A2"], duration: "q" },
          { treble: ["C4", "E4", "A4"], bass: ["G#2"], duration: "q" },
          { treble: ["C4", "E4", "G4"], bass: ["G2"], duration: "q" },
          { treble: ["C4", "D#4", "A4"], bass: ["F#2"], duration: "q" },
        ] },
        { endBarline: "final", events: [
          { treble: ["C4", "E4", "A4"], bass: ["F2"], duration: "q" },
          { treble: ["B3", "D4", "G#4"], bass: ["E2"], duration: "q" },
          { treble: ["C4", "E4", "A4"], bass: ["A2"], duration: "h" },
        ] },
      ],
      harmonicEvents: [
        harmonicBox(1, 1, 0, "Am", { chordSymbol: "Am", questionLabel: "Am" }),
        harmonicBox(1, 2, 1, "Am/G♯", { chordSymbol: "Am/G♯" }),
        harmonicBox(1, 3, 2, "C/G", { chordSymbol: "C/G" }),
        harmonicBox(1, 4, 3, "F♯dim7", { chordSymbol: "F♯dim7" }),
        harmonicBox(2, 1, 0, "Am/F", { chordSymbol: "Am/F" }),
        harmonicBox(2, 2, 1, "E7", { chordSymbol: "E7" }),
        harmonicBox(2, 3, 2, "Am", { chordSymbol: "Am" }),
      ],
    }),
    answerHeading: "Chromatic motion and tonal direction",
    answer: [
      "The bass descends A–G♯–G–F♯–F–E before returning to A. The semitone motion gives the phrase continuous direction while several upper notes are retained.",
      "The frequent harmonic changes and chromatic bass movement create momentum. E7 then resolves to the A-minor tonic, so the chromatic sequence intensifies the final tonal arrival.",
    ],
  }),
  createQuestion({
    id: "feature-nonharmonic",
    category: "features",
    sourceType: "original-practice",
    source: originalSource("Chord-tone versus non-harmonic-note classification"),
    family: "Harmonic or tonal feature",
    title: "Original: classify notes against the active chord",
    context:
      "The active harmony is Gmaj7 for the whole bar. Explain why F-sharp is chordal and classify the marked A at beat 2.",
    score: measuredScore({
      key: "G major",
      keySignature: "G",
      layout: "piano",
      caption: "Original practice • active-chord note classification",
      measures: [
        { endBarline: "final", events: [
          { treble: ["G4"], bass: ["G2", "B2", "D3", "F#3"], duration: "q" },
          { treble: ["A4"], bass: ["G2", "B2", "D3", "F#3"], duration: "q" },
          { treble: ["B4"], bass: ["G2", "B2", "D3", "F#3"], duration: "q" },
          { treble: ["B4"], bass: ["G2", "B2", "D3", "F#3"], duration: "q" },
        ] },
      ],
      harmonicEvents: [
        { measure: 1, beat: 1, event: 0, analysisBox: false, chordSymbol: "Gmaj7" },
      ],
      nonHarmonicNotes: [
        { measure: 1, event: 1, staff: "treble", pitch: "A4", chordSymbol: "Gmaj7", type: "passing note" },
      ],
      noteAnnotations: [
        { measure: 1, beat: 2, staff: "treble", pitch: "A4", label: "X" },
      ],
    }),
    answerHeading: "Active-chord classification",
    answer: [
      "F♯ is the major seventh of Gmaj7 and therefore a chord tone. A is outside Gmaj7 and passes by step from G to B, so it is a passing note.",
    ],
  }),
  createQuestion({
    id: "feature-harmonic-rhythm",
    category: "features",
    sourceType: "original-practice",
    source: originalSource("Measured harmonic-rhythm acceleration"),
    family: "Harmonic or tonal feature",
    title: "Original: harmonic rhythm before a cadence",
    context:
      "Compare the rate of harmonic change in all three measures and explain how the acceleration shapes the cadence. Cite the displayed beats and barlines.",
    score: measuredScore({
      key: "D major",
      keySignature: "D",
      labelPosition: "bottom",
      caption: "Original practice • measured harmonic-rhythm acceleration",
      measures: [
        { events: [{ treble: ["F#4", "A4", "D5"], bass: ["D3"], duration: "w" }] },
        { events: [
          { treble: ["G4", "B4", "D5"], bass: ["G2"], duration: "h" },
          { treble: ["F#4", "A4", "D5"], bass: ["D3"], duration: "h" },
        ] },
        { endBarline: "final", events: [
          { treble: ["G4", "B4", "E5"], bass: ["E3"], duration: "q" },
          { treble: ["E4", "G4", "A4", "C#5"], bass: ["A2"], duration: "q" },
          { treble: ["F#4", "A4", "D5"], bass: ["D3"], duration: "q" },
          { treble: ["F#4", "A4", "D5"], bass: ["D3"], duration: "q" },
        ] },
      ],
      harmonicEvents: [
        harmonicBox(1, 1, 0, "I", { localKey: "D major", romanNumeral: "I", chordSymbol: "D", questionLabel: "D: I" }),
        harmonicBox(2, 1, 0, "IV", { localKey: "D major", romanNumeral: "IV", chordSymbol: "G" }),
        harmonicBox(2, 3, 1, "I", { localKey: "D major", romanNumeral: "I", chordSymbol: "D" }),
        harmonicBox(3, 1, 0, "ii", { localKey: "D major", romanNumeral: "ii", chordSymbol: "Em" }),
        harmonicBox(3, 2, 1, "V⁷", { localKey: "D major", romanNumeral: "V7", chordSymbol: "A7" }),
        harmonicBox(3, 3, 2, "I", { localKey: "D major", romanNumeral: "I", chordSymbol: "D" }),
      ],
    }),
    answerHeading: "Measured harmonic-rhythm evidence",
    answer: [
      "Measure 1 sustains one harmony for four beats; measure 2 has two half-note harmonies; measure 3 changes on successive quarter-note beats before the tonic is repeated.",
      "The acceleration increases urgency into ii–V7–I. This claim is supported by explicit 4/4 metre, durations and barlines in the displayed score.",
    ],
  }),
];

window.CadenceData = Object.freeze({
  questions: Object.freeze(questionBank),
  categories: Object.freeze(categoryNames),
  sourceTypes: Object.freeze(sourceTypeNames),
});
