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
  "nzqa-reference": "NZQA examination reference",
  "practice-assessment-reference": "Practice assessment reference",
  "original-practice": "Original Cadence Lab practice",
  "generated-practice": "Generated Cadence Lab practice",
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
    provider: "Cadence Lab",
    creator: "Cadence Lab",
    title: focus,
    sourceKind: "original-practice",
    acknowledgement: "Original practice material written for Cadence Lab.",
  };
}

function nzqaSource(year, question, part, extract, creator, title, location, bars = "") {
  return {
    provider: "NZQA",
    year,
    question,
    part,
    extract,
    creator,
    title,
    bars,
    sourceKind: "official-exam",
    location,
    acknowledgement:
      "Teaching transcription of the named NZQA examination extract; learner task checked against the question paper and model evidence checked against the matching published assessment schedule.",
  };
}

function practiceSource(year, question, part, extract, creator, title, location, bars = "") {
  return {
    provider: "Learning Ideas",
    year,
    question,
    part,
    extract,
    creator,
    title,
    bars,
    sourceKind: "practice-assessment",
    location,
    acknowledgement:
      "Teaching transcription of the named Learning Ideas practice-assessment extract; learner task checked against the question paper and model evidence checked against its answer schedule. This is not an official NZQA examination extract.",
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

function paperCompletion(completionType, completionRequirements, options = {}) {
  const sharedChecks = completionType === "satb"
    ? [
      "The completed voices stay in a sensible singing range and do not cross.",
      "Leading notes and chordal sevenths resolve appropriately.",
      "There are no consecutive perfect fifths or octaves between parts.",
    ]
    : [
      "The accompaniment is playable and uses a suitable register and spacing.",
      "The bass and important chord tones support every supplied harmonic indication.",
    ];
  return {
    type: "paper-completion",
    completionType,
    completionRequirements,
    selfCheck: [
      ...completionRequirements.selfCheck,
      ...sharedChecks,
    ],
    printOrientation: options.printOrientation || "portrait",
  };
}

const completionInteractions = {
  "nzqa-2021-beethoven-piano": paperCompletion("piano", {
    suppliedMeasures: [1],
    targetMeasures: [2, 3, 4],
    harmonicIndications: 8,
    requiredParts: ["bass line", "two inner parts"],
    texture: "Beethoven legato piano texture",
    selfCheck: [
      "Bars 10–13 retain the printed melody and all eight Roman-numeral indications.",
      "The bass line and two inner parts continue the first chord's spacing and legato texture.",
      "The harmonic route moves from B♭ major through F major to C major without changing the supplied melody.",
    ],
  }, { printOrientation: "landscape" }),
  "nzqa-2023-novelette-piano": paperCompletion("piano", {
    suppliedMeasures: [1],
    targetMeasures: [2, 3, 4, 5],
    harmonicIndications: 7,
    requiredParts: ["bass line", "two inner parts"],
    texture: "flowing 3/8 piano texture",
    selfCheck: [
      "Bars 21–24 retain the printed melody and all seven Roman-numeral indications.",
      "The bass line and two inner parts continue the rhythmic texture established in bar 20.",
      "The chromatic iv chord and diminished-seventh harmony resolve convincingly into the final first-inversion tonic.",
    ],
  }, { printOrientation: "landscape" }),
  "nzqa-2025-bach-satb": {
    ...paperCompletion("satb", {
      suppliedMeasures: [1],
      targetMeasures: [2, 3, 4],
      suppliedVoicesByStage: { first: ["tenor"], second: ["soprano"] },
      requiredVoicesByStage: {
        first: ["soprano", "alto", "bass"],
        second: ["alto", "tenor", "bass"],
      },
      harmonicIndications: 10,
      requiredSuspension: true,
      minimumPassingNotes: 2,
      learnerChoosesHarmony: true,
      allowedRomanChords: ["I", "ii", "V", "V7", "vi"],
      labelChosenChords: true,
      selfCheck: [
        "In bars 22–23 beat 1, the supplied tenor remains unchanged; bass, soprano and alto complete the printed harmony and include the bar-22 suspension.",
        "From bar 23 beat 2 to bar 24 beat 3, the supplied melody remains unchanged; bass, alto and tenor realise only I, ii, V, V7 or vi in root position or inversion.",
        "The chosen second-stage chords are labelled beneath the score and the completion includes at least two passing notes.",
      ],
    }, { printOrientation: "landscape" }),
  },
  "nzqa-2025-schubert-piano": paperCompletion("piano", {
    suppliedMeasures: [1],
    targetMeasures: [2, 3, 4, 5, 6],
    harmonicIndications: 8,
    requiredParts: ["bass line", "two inner parts"],
    texture: "Schubert two-part melodic and quaver-bass piano texture",
    selfCheck: [
      "Bars 20–24 retain the printed melody and all eight Roman-numeral indications.",
      "The bass line and two inner parts continue the piano writing established in bars 19–20.",
      "The final V7–I motion is clear and the added notes remain playable and stylistically consistent.",
    ],
  }, { printOrientation: "landscape" }),
  "nzqa-2025-joel-piano": paperCompletion("piano", {
    suppliedMeasures: [1],
    targetMeasures: [2, 3, 4, 5, 6, 7, 8],
    harmonicIndications: 10,
    requiredParts: ["bass line", "two inner parts"],
    texture: "Billy Joel piano accompaniment pattern",
    selfCheck: [
      "Bars 15–22 preserve the supplied melody and all ten printed chord indications.",
      "The bass line and two inner parts continue the opening pop-piano texture.",
      "Added sevenths, ninths and inversions are voiced cleanly without obscuring the melody.",
    ],
  }, { printOrientation: "landscape" }),
  "nzqa-2024-bach-satb": {
    ...paperCompletion("satb", {
      suppliedMeasures: [1],
      targetMeasures: [2, 3],
      requiredVoices: ["soprano", "alto", "tenor", "bass"],
      harmonicIndications: 8,
      minimumPassingNotes: 2,
      suspension: "V⁴–³",
      selfCheck: [
        "Bar 17 remains the supplied style model; all four parts are completed in bars 18–19.",
        "All eight chord moments are realised across the printed harmonic route, with V⁴–³ treated as one dominant span.",
        "The V⁴–³ suspension resolves from 4 to 3 while the dominant harmony remains active.",
        "The completion contains at least two passing notes.",
        "The melody, bass line and inner parts follow the rhythmic and chorale style of the supplied bar.",
      ],
    }, { printOrientation: "landscape" }),
  },
  "satb-f-c": paperCompletion("satb", {
    suppliedVoices: ["soprano", "bass"],
    requiredVoices: ["alto", "tenor"],
    harmonicIndications: 7,
    selfCheck: [
      "The alto and tenor are complete beneath the supplied soprano and bass.",
      "Common tones are preserved through the F/C pivot into C major.",
      "B rises to C and the seventh F in G7 falls to E at the final cadence.",
    ],
  }),
  "satb-gminor": paperCompletion("satb", {
    suppliedVoices: ["soprano", "bass"],
    requiredVoices: ["alto", "tenor"],
    harmonicIndications: 7,
    selfCheck: [
      "The alto and tenor are complete while the supplied soprano and bass remain unchanged.",
      "F♯ functions as the raised leading note and resolves to G.",
      "C, the seventh of D7, resolves down by step to B♭.",
    ],
  }),
  "satb-c-aminor": paperCompletion("satb", {
    suppliedVoices: ["soprano", "bass"],
    requiredVoices: ["alto", "tenor"],
    harmonicIndications: 7,
    selfCheck: [
      "The alto and tenor are complete through the move from C major to A minor.",
      "The pivot chord is convincing in both C major and A minor.",
      "G♯ rises to A and the seventh D in E7 falls to C.",
    ],
  }),
  "piano-d-f": paperCompletion("piano", {
    targetMeasures: [2, 3],
    harmonicIndications: 6,
    texture: "quaver broken-chord accompaniment",
    selfCheck: [
      "The quaver broken-chord pattern continues beneath the supplied melody.",
      "The change from D minor to F major is clear.",
      "The final ii–V7–I cadence in F major is fully realised.",
    ],
  }),
  "piano-a-fsharp": paperCompletion("piano", {
    targetMeasures: [2, 3],
    harmonicIndications: 7,
    texture: "crotchet chord pattern",
    selfCheck: [
      "The crotchet chord pattern and supplied melody remain clear.",
      "The change from A major to F♯ minor is convincing.",
      "E♯ is retained as the leading note and resolves upward to F♯.",
    ],
  }),
  "piano-g-c": paperCompletion("piano", {
    targetMeasures: [2, 3],
    harmonicIndications: 7,
    texture: "left-hand accompaniment pattern",
    selfCheck: [
      "The left-hand pattern continues after the supplied rest.",
      "The second phrase moves clearly from G major towards a cadence in C major.",
      "The supplied melody and its tie across the barline remain unchanged.",
    ],
  }),
  "piano-bflat-gminor": paperCompletion("piano", {
    targetMeasures: [2, 3],
    harmonicIndications: 5,
    texture: "dotted-quarter–quaver chordal accompaniment",
    selfCheck: [
      "The dotted-quarter–quaver pattern is preserved in 3/4 metre.",
      "The chordal accompaniment supports the supplied melody without crowding it.",
      "F♯ leads to G in a clear dominant-to-tonic close in G minor.",
    ],
  }),
};

const keyChoices = [
  "C major", "G major", "D major", "A major", "E major", "B major",
  "F♯ major", "C♯ major", "F major", "B♭ major", "E♭ major", "A♭ major",
  "D♭ major", "G♭ major", "A minor", "E minor", "B minor", "F♯ minor",
  "C♯ minor", "G♯ minor", "D minor", "G minor", "C minor", "F minor",
  "B♭ minor", "E♭ minor",
];

// Learner-facing labels deliberately use one naming system. The broader
// semantic vocabulary in key-relationships.js remains available for marking.
const learnerRelationshipVocabulary = Object.freeze([
  "tonic major",
  "tonic minor",
  "dominant",
  "dominant minor",
  "subdominant",
  "supertonic",
  "mediant major",
  "mediant minor",
  "submediant",
  "subtonic",
  "relative major",
  "relative minor",
  "relative major of the dominant",
  "relative minor of the dominant",
  "relative major of the subdominant",
  "relative minor of the subdominant",
]);

function stableRelationshipHash(value) {
  let hash = 2166136261;
  for (const character of String(value)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function derivedRelationshipChoices(questionId, region, relationship) {
  const seed = `${questionId}:${region.section}:${relationship.homeKey}:${relationship.localKey}`;
  const rankedDistractors = learnerRelationshipVocabulary
    .filter((label) =>
      label !== region.modelRelationship &&
      !relationship.acceptedLabels.includes(label)
    )
    .sort((first, second) =>
      stableRelationshipHash(`${seed}:distractor:${first}`) -
        stableRelationshipHash(`${seed}:distractor:${second}`) ||
      first.localeCompare(second, "en-NZ")
    )
    .slice(0, 4);

  return [region.modelRelationship, ...rankedDistractors]
    .sort((first, second) =>
      stableRelationshipHash(`${seed}:position:${first}`) -
        stableRelationshipHash(`${seed}:position:${second}`) ||
      first.localeCompare(second, "en-NZ")
    );
}

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
  "nzqa-2025-joel-chords": ["Cmaj7", "G7", "Dm9", "B♭maj7"],
  "practice-2024-jazz-tonality": ["F7", "E♭9", "A7sus4", "Cm7"],
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
    fields: config.analysisFields || [],
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
    const visibleChoices = region.relationshipChoices ||
      derivedRelationshipChoices(config.id, region, relationship);
    const visibleCorrectChoices = visibleChoices.filter((label) =>
      relationship.acceptedLabels.includes(label)
    );
    if (visibleChoices.length < 4 || visibleChoices.length > 6 ||
        new Set(visibleChoices).size !== visibleChoices.length ||
        !visibleChoices.includes(region.modelRelationship) ||
        visibleCorrectChoices.length !== 1 ||
        visibleCorrectChoices[0] !== region.modelRelationship) {
      throw new Error(`${config.id}: ${region.section} has invalid learner relationship choices.`);
    }
    return {
      ...region,
      localKey,
      relationship,
      visibleChoices: [...visibleChoices],
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
    fields: [...semanticRegions.flatMap((region) => [
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
        modelRelationship: region.modelRelationship,
        choices: region.visibleChoices,
        acceptedAnswers: region.acceptedLabels.map((label) => ({ label })),
      },
    ]), ...(config.analysisFields || [])],
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
    fields: config.analysisFields || [],
    reflectionOnly: config.reflectionOnly === true,
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

function contextualInteraction(config) {
  return {
    type: "contextual-analysis",
    allowPaper: true,
    reflectionOnly: true,
    fields: config.contextualFields || [],
    evidencePrompt: config.evidencePrompt || "Optional concluding link across your analysis points.",
  };
}

function universalInteraction(config, score) {
  if (config.contextualFields) return contextualInteraction(config);
  if (config.category === "analysis") return analysisInteraction(config, score);
  if (config.category === "modulation") return modulationInteraction(config);
  if (config.category === "jazz") return jazzInteraction(config, score);
  if (config.category === "features") return featureInteraction(config);
  return null;
}

function neutralStudentCaption(config) {
  if (config.sourceType === "nzqa-reference") {
    return `NZQA examination reference • ${config.source.year} ${config.source.question} ${config.source.part} • ${config.source.extract}`;
  }
  if (config.sourceType === "practice-assessment-reference") {
    return `Practice assessment reference • ${config.source.year} ${config.source.question} ${config.source.part} • ${config.source.extract}`;
  }
  return `Original Cadence Lab practice • ${categoryNames[config.category]}`;
}

function createQuestion(config) {
  const rubric = rubricByCategory[config.category];
  const presentation = config.presentation || studentPresentationById[config.id];
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
      "bars 1–8, exam p.2; schedule p.3",
      "1–8"
    ),
    family: "Roman numeral analysis",
    title: "Reference: two related-key pivots",
    context:
      "The first nine labels are supplied as in the paper. Analyse the ten blank positions in bars 4–8 and label both pivots in A major and F-sharp minor.",
    sourceSpec: {
      year: 2021, provider: "NZQA", question: "Question One", part: "(a)", bars: "1–8",
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
      caption: "NZQA examination reference • 2021 Q1(a), Extract One • bars 1–8 transcription",
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
      "bars 0–5, exam p.2; schedule p.3",
      "0–5"
    ),
    family: "Roman numeral analysis",
    title: "Reference: C major to A minor",
    context:
      "Keep the supplied C-major and closing cadence labels, analyse the blank positions, mark both cadences, and show the D-minor first-inversion pivot into A minor.",
    sourceSpec: {
      year: 2022, provider: "NZQA", question: "Question One", part: "(a)", bars: "0–5",
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
      caption: "NZQA examination reference • 2022 Q1(a), Extract One • bars 0–5 transcription",
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
      "bars 1–4, exam p.2; schedule p.3",
      "1–4"
    ),
    family: "Roman numeral analysis",
    title: "Reference: pivot and diminished seventh",
    context:
      "Analyse the 13 blank positions after the five supplied labels, show A minor as the pivot into E minor, and explain the diminished seventh chord’s cadential function.",
    sourceSpec: {
      year: 2024, provider: "NZQA", question: "Question One", part: "(a)", bars: "1–4",
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
      caption: "NZQA examination reference • 2024 Q1(a), Extract One • bars 1–4 transcription",
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
        relationshipChoices: [
          "relative major",
          "subdominant",
          "relative major of the subdominant",
          "relative major of the dominant",
          "relative minor",
        ],
      },
      {
        section: "Y",
        localKey: "C minor",
        modelRelationship: "subdominant",
        acceptedRelationshipLabels: ["subdominant"],
        relationshipChoices: [
          "relative major",
          "subdominant",
          "dominant minor",
          "relative major of the dominant",
          "tonic minor",
        ],
      },
      {
        section: "Z",
        localKey: "F major",
        modelRelationship: "relative major of the dominant",
        acceptedRelationshipLabels: ["relative major of the dominant"],
        relationshipChoices: [
          "relative major of the dominant",
          "relative major",
          "dominant",
          "subdominant",
          "relative major of the subdominant",
        ],
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
      "bars 4–10, exam p.3; schedule p.4",
      "4–10"
    ),
    family: "Keys and modulation",
    title: "Reference: three key regions from G minor",
    context:
      "Name sections X, Y and Z, cite their leading notes or cadences, and state each relationship to the G-minor tonic.",
    sourceSpec: {
      year: 2023, provider: "NZQA", question: "Question One", part: "(b)", bars: "4–10",
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
      caption: "NZQA examination reference • 2023 Q1(b), Extract Two • bars 4–10 transcription",
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
      { section: "X", localKey: "E♭ major", modelRelationship: "submediant" },
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
      "bars 17–19, exam p.3; schedule p.4",
      "17–19"
    ),
    family: "SATB / vocal completion",
    title: "Reference: chorale-style completion",
    context:
      "Continue from the fully supplied bar 17 and create all four parts in bars 18–19. Use the printed Roman numerals, follow the supplied rhythmic pattern, and include at least two passing notes.",
    sourceSpec: {
      year: 2024, provider: "NZQA", question: "Question One", part: "(c)", bars: "17–19",
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
      caption: "NZQA examination reference • 2024 Q1(c), Extract Three • bars 17–19 transcription",
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
    answerHeading: "One possible model completion",
    answer: [
      "The model follows the published harmonic route F: Vb–I–Ib, pivoting as C: IVb, then C: Vb–Ib–I–V4–3–I. It includes passing motion in the final dominant span.",
      "This is one possible model completion. Other solutions are possible; check voice order, singable ranges, tendency-note resolution, and the absence of consecutive perfect fifths or octaves.",
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
    answerHeading: "One possible model completion",
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
    answerHeading: "One possible model completion",
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
    answerHeading: "One possible model completion",
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
      "bars 21–29, exam pp.8–9; schedule pp.8–9",
      "21–29"
    ),
    family: "Jazz / rock notation",
    title: "Reference: minor-line harmony and tonic pedal",
    context:
      "Complete the chord boxes above bars 21–29, classify the marked X, Y and Z melody notes, and explain the two harmonic techniques operating in bars 21–25.",
    sourceSpec: {
      year: 2021, provider: "NZQA", question: "Question Three", part: "(a)", bars: "21–29",
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
      caption: "NZQA examination reference • 2021 Q3(a), Extract Six • bars 21–29 transcription",
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
      "bars 16–28, exam pp.8–9; schedule p.9",
      "16–28"
    ),
    family: "Jazz / rock notation",
    title: "Reference: one chord per bar over chromatic bass",
    context:
      "Analyse the eleven boxed positions in bars 19–28, including both sonorities in bar 23, then explain the descending bass and one-chord-per-bar harmonic rhythm in bars 24–28.",
    sourceSpec: {
      year: 2024, provider: "NZQA", question: "Question Three", part: "(a)", bars: "16–28",
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
      caption: "NZQA examination reference • 2024 Q3(a), Extract Six • bars 19–28 transcription",
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
      "bars 1–5, exam p.5; schedule p.6",
      "1–5"
    ),
    family: "Harmonic or tonal feature",
    title: "Reference: tonic pedal with dissonance",
    context:
      "Identify the compositional device in the bass of this 3/8 opening and explain how it establishes C while creating dissonance beneath the changing melody and inner parts.",
    sourceSpec: {
      year: 2023, provider: "NZQA", question: "Question Two", part: "(a)", bars: "1–5",
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
      caption: "NZQA examination reference • 2023 Q2(a), Extract Four • bars 1–5 transcription",
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
  createQuestion({
    id: "nzqa-2023-bach-analysis",
    category: "analysis",
    sourceType: "nzqa-reference",
    source: nzqaSource(2023, "Question One", "(a)", "Extract One", "J. S. Bach", "Durch Adams Fall ist ganz verderbt", "bars 1–4, exam p.2; schedule p.3", "1–4"),
    family: "Roman numeral analysis",
    title: "Reference: C minor to G minor",
    context: "The extract begins in C minor and modulates to G minor. Analyse the 13 blank positions in bars 1–4, including the pivot chord. The opening C-minor dominant and final V4–3–I are supplied as on the paper.",
    presentation: { title: "Reference: Roman analysis from C minor to G minor", hiddenConceptTerms: [] },
    sourceSpec: {
      year: 2023, provider: "NZQA", question: "Question One", part: "(a)", bars: "1–4",
      romanNumerals: ["Cm: Vb", "i", "ib", "IV⁷b", "Vb", "i⁹–⁸", "V⁷4–3", "i", "i / Gm: iv", "i", "ivb", "iv", "ii°", "ic", "V⁷4–3", "I"],
      suppliedLabels: ["Cm: Vb", "V⁷4–3", "I"], analysisPositions: 16, answerPositions: 13,
      keyCentres: ["C minor", "G minor"], pivotCount: 1, measureCount: 5, independentSatb: true,
    },
    score: measuredScore({
      key: "C minor → G minor", keySignature: "Cm", layout: "satb", labelPosition: "bottom", measuresPerSystem: 3,
      voiceLabels: { treble: ["S", "A"], bass: ["T", "B"] },
      sourceKeyCentres: ["C minor", "G minor"],
      caption: "NZQA examination reference • 2023 Q1(a), Extract One • bars 1–4 transcription",
      measures: [
        { expectedBeats: 1, voices: {
          soprano: [{ pitch: "G4", duration: "q" }], alto: [{ pitch: "D4", duration: "q" }],
          tenor: [{ pitch: "B3", duration: "q" }], bass: [{ pitch: "B2", duration: "q" }],
        } },
        { voices: {
          soprano: [{ pitch: "G4", duration: "h" }, { pitch: "G4", duration: "h" }],
          alto: [{ pitch: "Eb4", duration: "q" }, { pitch: "D4", duration: "q" }, { pitch: "Eb4", duration: "h" }],
          tenor: [{ pitch: "C4", duration: "q" }, { pitch: "Bb3", duration: "q" }, { pitch: "C4", duration: "q" }, { pitch: "B3", duration: "q" }],
          bass: [{ pitch: "C3", duration: "8" }, { pitch: "D3", duration: "8" }, { pitch: "Eb3", duration: "q" }, { pitch: "F3", duration: "h" }],
        } },
        { voices: {
          soprano: [{ pitch: "F4", duration: "q" }, { pitch: "Eb4", duration: "q" }, { pitch: "D4", duration: "h" }],
          alto: [{ pitch: "D4", duration: "h" }, { pitch: "C4", duration: "q" }, { pitch: "Bb3", duration: "q" }],
          tenor: [{ pitch: "B3", duration: "q" }, { pitch: "C4", duration: "8" }, { pitch: "Bb3", duration: "8" }, { pitch: "A3", duration: "h" }],
          bass: [{ pitch: "G2", duration: "h" }, { pitch: "F2", duration: "q" }, { pitch: "Eb2", duration: "q" }],
        } },
        { voices: {
          soprano: [{ pitch: "D4", duration: "q" }, { pitch: "Eb4", duration: "q" }, { pitch: "D4", duration: "q" }, { pitch: "C4", duration: "q" }],
          alto: [{ pitch: "Bb3", duration: "h" }, { pitch: "A3", duration: "q" }, { pitch: "G3", duration: "q" }],
          tenor: [{ pitch: "G3", duration: "q" }, { pitch: "F3", duration: "q" }, { pitch: "Eb3", duration: "8" }, { pitch: "D3", duration: "8" }, { pitch: "C3", duration: "q" }],
          bass: [{ pitch: "G2", duration: "8" }, { pitch: "Ab2", duration: "8" }, { pitch: "Bb2", duration: "q" }, { pitch: "C3", duration: "q" }, { pitch: "D3", duration: "q" }],
        } },
        { endBarline: "final", voices: {
          soprano: [{ pitch: "D4", duration: "h" }, { pitch: "G4", duration: "h" }],
          alto: [{ pitch: "C4", duration: "q" }, { pitch: "Bb3", duration: "q" }, { pitch: "B3", duration: "q" }, { pitch: "Bb3", duration: "q" }],
          tenor: [{ pitch: "A3", duration: "qd" }, { pitch: "G3", duration: "8" }, { pitch: "F#3", duration: "q" }, { pitch: "G3", duration: "q" }],
          bass: [{ pitch: "D3", duration: "h" }, { pitch: "G2", duration: "h" }],
        } },
      ],
      harmonicEvents: [
        harmonicBox(1, 1, null, "Cm: Vb", { questionLabel: "Cm: Vb", romanNumeral: "Cm: Vb" }),
        harmonicBox(2, 1, null, "i", { romanNumeral: "i" }), harmonicBox(2, 2, null, "ib", { romanNumeral: "ib" }),
        harmonicBox(2, 3, null, "IV⁷b", { romanNumeral: "IV⁷b" }), harmonicBox(2, 4, null, "Vb", { romanNumeral: "Vb" }),
        harmonicBox(3, 1, null, "i⁹–⁸", { romanNumeral: "i⁹–⁸" }), harmonicBox(3, 2, null, "V⁷4–3", { romanNumeral: "V⁷4–3" }),
        harmonicBox(3, 3, null, "i", { romanNumeral: "i" }), harmonicBox(3, 4, null, "i / Gm: iv", { romanNumeral: "i / Gm: iv" }),
        harmonicBox(4, 1, null, "i", { romanNumeral: "i" }), harmonicBox(4, 2, null, "ivb", { romanNumeral: "ivb" }),
        harmonicBox(4, 3, null, "iv", { romanNumeral: "iv" }), harmonicBox(4, 4, null, "ii°", { romanNumeral: "ii°" }),
        harmonicBox(5, 1, null, "ic", { romanNumeral: "ic" }),
        harmonicBox(5, 3, null, "V⁷4–3", { questionLabel: "V⁷4–3", romanNumeral: "V⁷4–3" }),
        harmonicBox(5, 4, null, "I", { questionLabel: "I", romanNumeral: "I" }),
      ],
    }),
    answerHeading: "Published Roman-numeral route",
    answer: ["The 13 assessed positions are i–ib–IV7b–Vb–i9–8–V7 4–3–i–i / G minor: iv–i–ivb–iv–ii°–ic, followed by the supplied V7 4–3–I close."],
  }),
  createQuestion({
    id: "nzqa-2021-beethoven-piano",
    category: "piano",
    sourceType: "nzqa-reference",
    source: nzqaSource(2021, "Question Two", "(b)", "Extract Five", "Ludwig van Beethoven", "Bagatelle, Op. 119, No. 8", "bars 9–14, exam p.7; schedule p.6", "9–14"),
    family: "Piano completion",
    title: "Reference: continue Beethoven's piano texture",
    context: "The passage begins in B♭ major, modulates to F major and then C major. Complete bars 10–13 by adding a bass line and two inner parts in the style of the first chord in bar 10.",
    presentation: { title: "Reference: Beethoven piano completion", hiddenConceptTerms: [] },
    sourceSpec: {
      year: 2021, provider: "NZQA", question: "Question Two", part: "(b)", bars: "9–14",
      suppliedLabels: ["B♭: Vb / F: Ib", "vi°⁷c", "ii", "viib / C: IV", "V⁷ / C: vii°⁷", "I / C: vii°⁷", "vii°⁷", "I"],
      analysisPositions: 8, keyCentres: ["B♭ major", "F major", "C major"], measureCount: 6,
      expectedChordCount: 8, expectedCompletionType: "piano",
      completionContract: { targetMeasures: [2, 3, 4, 5], chordsToRealise: 8, harmonicIndications: 8 },
    },
    score: measuredScore({
      key: "B♭ major → F major → C major", keySignature: "Bb", timeSignature: "3/4", layout: "piano", completion: true,
      sourceKeyCentres: ["B♭ major", "F major", "C major"],
      caption: "NZQA examination reference • 2021 Q2(b), Extract Five • bars 9–14 transcription",
      measures: [
        { events: [{ treble: ["Db5"], qTreble: ["Db5"], bass: ["Bb2"], qBass: ["Bb2"], duration: "hd" }] },
        { events: [
          { treble: ["F4", "Bb4", "D5"], qTreble: ["D5"], bass: ["Bb2"], qBass: [], duration: "q" },
          { treble: ["E4", "G4", "Bb4"], qTreble: ["Eb5"], bass: ["C3"], qBass: [], duration: "q" },
          { treble: ["F4", "A4", "C5"], qTreble: ["D5"], bass: ["F3"], qBass: [], duration: "q" },
        ] },
        { events: [
          { treble: ["F4", "A4", "C5"], qTreble: ["C5"], bass: ["A2"], qBass: [], duration: "q" },
          { treble: ["E4", "G4", "Bb4"], qTreble: ["D5"], bass: ["C3"], qBass: [], duration: "q" },
          { treble: ["D4", "F4", "B4"], qTreble: ["Db5"], bass: ["B2"], qBass: [], duration: "q" },
        ] },
        { events: [
          { treble: ["E4", "G4", "C5"], qTreble: ["C5"], bass: ["C3"], qBass: [], duration: "qd" },
          { treble: ["F4", "A4", "C5"], qTreble: ["A4"], bass: ["F2"], qBass: [], duration: "8" },
          { treble: ["F4", "Ab4", "B4", "D5"], qTreble: ["B4"], bass: ["G2"], qBass: [], duration: "q" },
        ] },
        { events: [
          { treble: ["E4", "G4", "C5"], qTreble: ["D5"], bass: ["C3"], qBass: [], duration: "h" },
          { treble: ["F4", "Ab4", "B4"], qTreble: ["C5"], bass: ["G2"], qBass: [], duration: "q" },
        ] },
        { endBarline: "final", events: [
          { treble: ["Db5"], qTreble: ["Db5"], bass: ["F2"], qBass: ["F2"], duration: "q" },
          { treble: ["C5"], qTreble: ["C5"], bass: ["F2"], qBass: ["F2"], duration: "q" },
          { treble: ["A4"], qTreble: ["A4"], bass: ["F2"], qBass: ["F2"], duration: "q" },
        ] },
      ], harmonicEvents: [
        harmonicBox(2, 1, 0, "B♭: Vb / F: Ib", { questionLabel: "B♭: Vb / F: Ib" }),
        harmonicBox(2, 2, 1, "vi°⁷c", { questionLabel: "vi°⁷c" }),
        harmonicBox(3, 1, 0, "ii", { questionLabel: "ii" }),
        harmonicBox(3, 2, 1, "viib / C: IV", { questionLabel: "viib / C: IV" }),
        harmonicBox(4, 1, 0, "V⁷ / C: vii°⁷", { questionLabel: "V⁷ / C: vii°⁷" }),
        harmonicBox(4, 3, 2, "I / C: vii°⁷", { questionLabel: "I / C: vii°⁷" }),
        harmonicBox(5, 1, 0, "vii°⁷", { questionLabel: "vii°⁷" }),
        harmonicBox(5, 3, 1, "I", { questionLabel: "I" }),
      ],
    }),
    answerHeading: "One possible model completion",
    answer: ["The model preserves the printed melody and supplies eight chords through the B♭–F–C tonal route. It is one possible realisation; other stylistically appropriate bass and inner-part solutions are possible."],
  }),
  createQuestion({
    id: "nzqa-2023-novelette-piano",
    category: "piano",
    sourceType: "nzqa-reference",
    source: nzqaSource(2023, "Question Two", "(c)", "Extract Six", "Robert Schumann, arranged", "Novelette No. 1 in C minor", "bars 20–24, exam p.7; schedule p.7", "20–24"),
    family: "Piano completion",
    title: "Reference: continue the Novelette piano texture",
    context: "The extract is in C major. Complete bars 21–24 from the seven supplied Roman-numeral indications by adding a bass line and two inner parts in the style of bar 20.",
    presentation: { title: "Reference: C-major piano completion", hiddenConceptTerms: [] },
    sourceSpec: {
      year: 2023, provider: "NZQA", question: "Question Two", part: "(c)", bars: "20–24",
      suppliedLabels: ["Ib", "ii⁷", "V", "I", "ivᵐᵃʲ⁷(♭3)", "vii°⁷c", "Ib"],
      analysisPositions: 7, keyCentres: ["C major"], measureCount: 5,
      expectedChordCount: 7, expectedCompletionType: "piano",
      completionContract: { targetMeasures: [2, 3, 4, 5], chordsToRealise: 7, harmonicIndications: 7 },
    },
    score: measuredScore({
      key: "C major", keySignature: "C", timeSignature: "3/8", layout: "piano", completion: true,
      sourceKeyCentres: ["C major"], caption: "NZQA examination reference • 2023 Q2(c), Extract Six • bars 20–24 transcription",
      measures: [
        { events: [
          { treble: ["E4", "G4", "C5"], qTreble: ["C5"], bass: ["C3", "G3"], qBass: ["C3", "G3"], duration: "8" },
          { treble: ["F4", "A4", "D5"], qTreble: ["B4"], bass: ["F3"], qBass: ["F3"], duration: "16" },
          { treble: ["E4", "G4", "C5"], qTreble: ["A4"], bass: ["G3"], qBass: ["G3"], duration: "16" },
          { treble: ["D4", "G4", "B4"], qTreble: ["B4"], bass: ["G2"], qBass: ["G2"], duration: "8" },
        ] },
        { events: [
          { treble: ["G4", "C5", "E5"], qTreble: ["C5"], bass: ["E3"], qBass: [], duration: "8" },
          { treble: ["F4", "A4", "C5", "D5"], qTreble: ["E5"], bass: ["D3"], qBass: [], duration: "8" },
          { treble: ["F4", "G4", "B4", "D5"], qTreble: ["D5"], bass: ["G2"], qBass: [], duration: "8" },
        ] },
        { events: [{ treble: ["E4", "G4", "C5"], qTreble: ["D5"], bass: ["C3"], qBass: [], duration: "qd" }] },
        { events: [
          { treble: ["F4", "Ab4", "B4", "D5"], qTreble: ["F5"], bass: ["F2"], qBass: [], duration: "q" },
          { treble: ["F4", "Ab4", "B4", "D5"], qTreble: ["D5"], bass: ["D3"], qBass: [], duration: "8" },
        ] },
        { endBarline: "final", events: [{ treble: ["G4", "C5", "E5"], qTreble: ["C5"], bass: ["E3"], qBass: [], duration: "qd" }] },
      ], harmonicEvents: [
        harmonicBox(2, 1, 0, "Ib", { questionLabel: "Ib" }), harmonicBox(2, 2, 1, "ii⁷", { questionLabel: "ii⁷" }),
        harmonicBox(2, 3, 2, "V", { questionLabel: "V" }), harmonicBox(3, 1, 0, "I", { questionLabel: "I" }),
        harmonicBox(4, 1, 0, "ivᵐᵃʲ⁷(♭3)", { questionLabel: "ivᵐᵃʲ⁷(♭3)" }),
        harmonicBox(4, 3, 1, "vii°⁷c", { questionLabel: "vii°⁷c" }), harmonicBox(5, 1, 0, "Ib", { questionLabel: "Ib" }),
      ],
    }),
    answerHeading: "One possible model completion",
    answer: ["The model continues the 3/8 texture through Ib–ii7–V–I–ivmaj7(♭3)–vii°7c–Ib. It is one possible realisation; other solutions are valid when the supplied melody, harmony and style are preserved."],
  }),
  createQuestion({
    id: "nzqa-2025-bach-analysis",
    category: "analysis",
    sourceType: "nzqa-reference",
    source: nzqaSource(2025, "Question One", "(a)", "Extract One", "J. S. Bach", "Komm, Heiliger Geist, Herre Gott", "bars 5–9, exam p.2; schedule p.3", "5–9"),
    family: "Roman numeral analysis",
    title: "Reference: G major, D major and return",
    context: "The passage begins in G major, modulates to D major, and then returns to G major. The first three labels are supplied. Analyse the 12 indicated positions in bars 6–9 and include a pivot chord at each modulation.",
    presentation: { title: "Reference: Roman analysis through two key changes", hiddenConceptTerms: [] },
    sourceSpec: {
      year: 2025, provider: "NZQA", question: "Question One", part: "(a)", bars: "5–9",
      romanNumerals: ["G: I", "Vb", "IVb", "I", "Vb", "V / D: I", "Vb", "IVb", "IV⁽⁷⁾", "V⁽⁷⁾", "I", "I / G: V⁷d", "Ib", "vii°b", "I"],
      analysisPositions: 15, answerPositions: 12, suppliedLabels: ["G: I", "Vb", "IVb"],
      keyCentres: ["G major", "D major"], pivotCount: 2, measureCount: 5,
    },
    score: measuredScore({
      key: "G major → D major → G major", keySignature: "G", layout: "piano", timeSignature: "4/4", measuresPerSystem: 2,
      caption: "NZQA examination reference • 2025 Q1(a), Extract One • bars 5–9 transcription",
      measures: [
        { expectedBeats: 1, events: [{ treble: ["B4", "D5", "G5"], bass: ["G3"], duration: "q" }] },
        { events: [
          { treble: ["A4", "D5", "F#5"], bass: ["F#3"], duration: "q" },
          { treble: ["G4", "C5", "E5"], bass: ["E3"], duration: "q" },
          { treble: ["B4", "D5", "G5"], bass: ["G3"], duration: "q" },
          { treble: ["A4", "D5", "F#5"], bass: ["F#3"], duration: "q" },
        ] },
        { events: [
          { treble: ["B4", "D5", "G5"], bass: ["G3"], duration: "8" },
          { treble: ["A4", "D5", "F#5"], bass: ["F#3"], duration: "8" },
          { treble: ["B4", "D5", "G5"], bass: ["B2"], duration: "q" },
          { treble: ["F#4", "B4", "D5", "G5"], bass: ["G2"], duration: "q" },
          { treble: ["G4", "A4", "C#5", "E5"], bass: ["A2"], duration: "q" },
        ] },
        { events: [
          { treble: ["A4", "D5", "F#5"], bass: ["D3"], duration: "h" },
          { treble: ["A4", "C5", "D5", "F#5"], bass: ["C3"], duration: "h" },
        ] },
        { endBarline: "final", events: [
          { treble: ["B4", "D5", "G5"], bass: ["B2"], duration: "q" },
          { treble: ["A4", "C5", "F#5"], bass: ["A2"], duration: "q" },
          { treble: ["B4", "D5", "G5"], bass: ["G2"], duration: "h" },
        ] },
      ],
      harmonicEvents: [
        harmonicBox(1, 1, 0, "G: I", { questionLabel: "G: I", localKey: "G major", romanNumeral: "G: I" }),
        harmonicBox(2, 1, 0, "Vb", { questionLabel: "Vb", localKey: "G major", romanNumeral: "Vb" }),
        harmonicBox(2, 2, 1, "IVb", { questionLabel: "IVb", localKey: "G major", romanNumeral: "IVb" }),
        harmonicBox(2, 3, 2, "I", { localKey: "G major", romanNumeral: "I" }),
        harmonicBox(2, 4, 3, "Vb", { localKey: "G major", romanNumeral: "Vb" }),
        harmonicBox(3, 1, 0, "V / D: I", { localKey: "G major", romanNumeral: "V / D: I" }),
        harmonicBox(3, 1.5, 1, "Vb", { localKey: "D major", romanNumeral: "Vb" }),
        harmonicBox(3, 2, 2, "IVb", { localKey: "D major", romanNumeral: "IVb" }),
        harmonicBox(3, 3, 3, "IV⁽⁷⁾", { localKey: "D major", romanNumeral: "IV⁽⁷⁾" }),
        harmonicBox(3, 4, 4, "V⁽⁷⁾", { localKey: "D major", romanNumeral: "V⁽⁷⁾" }),
        harmonicBox(4, 1, 0, "I", { localKey: "D major", romanNumeral: "I" }),
        harmonicBox(4, 3, 1, "I / G: V⁷d", { localKey: "D major", romanNumeral: "I / G: V⁷d" }),
        harmonicBox(5, 1, 0, "Ib", { localKey: "G major", romanNumeral: "Ib" }),
        harmonicBox(5, 2, 1, "vii°b", { localKey: "G major", romanNumeral: "vii°b" }),
        harmonicBox(5, 3, 2, "I", { localKey: "G major", romanNumeral: "I" }),
      ],
    }),
    answerHeading: "Published Roman-numeral route",
    answer: ["After the supplied G: I–Vb–IVb, the 12 assessed labels are I–Vb–V / D: I–Vb–IVb–IV(7)–V(7)–I–I / G: V7d–Ib–vii°b–I."],
  }),
  createQuestion({
    id: "nzqa-2025-bach-modulation",
    category: "modulation",
    homeKey: "G major",
    keyRegions: [
      { section: "X", localKey: "E minor", modelRelationship: "relative minor", relationshipChoices: ["relative minor", "dominant", "subdominant", "tonic minor", "mediant major"] },
      { section: "Y", localKey: "D major", modelRelationship: "dominant", relationshipChoices: ["dominant", "subdominant", "relative minor", "supertonic", "tonic major"] },
      { section: "Z", localKey: "A minor", modelRelationship: "relative minor of the subdominant", acceptedRelationshipLabels: ["relative minor of the subdominant", "supertonic minor"], relationshipChoices: ["relative minor of the subdominant", "relative minor", "dominant minor", "subdominant", "relative major of the dominant"] },
    ],
    sourceType: "nzqa-reference",
    source: nzqaSource(2025, "Question One", "(b)", "Extract Two", "J. S. Bach", "Komm, Heiliger Geist, Herre Gott", "bars 9–20, exam p.3; schedule p.4", "9–20"),
    family: "Keys and modulation",
    title: "Reference: three local key regions from G major",
    context: "The extract is in G major and modulates through several keys between bars 9–20. For X, Y and Z, identify the local key, give score evidence and state its relationship to the tonic G major.",
    presentation: { title: "Reference: identify three local key regions", hiddenConceptTerms: [] },
    sourceSpec: {
      year: 2025, provider: "NZQA", question: "Question One", part: "(b)", bars: "9–20",
      sections: ["X", "Y", "Z"], keyCentres: ["E minor", "D major", "A minor"],
      keyRelationships: [
        { section: "X", homeKey: "G major", localKey: "E minor", acceptedLabels: [] },
        { section: "Y", homeKey: "G major", localKey: "D major", acceptedLabels: [] },
        { section: "Z", homeKey: "G major", localKey: "A minor", acceptedLabels: ["relative minor of the subdominant", "supertonic minor"] },
      ], measureCount: 6,
    },
    score: measuredScore({
      key: "G major", keySignature: "G", layout: "satb", voiceLabels: { treble: ["S", "A"], bass: ["T", "B"] },
      sourceKeyCentres: ["E minor", "D major", "A minor"], caption: "NZQA examination reference • 2025 Q1(b), Extract Two • bars 9–20 selected regions",
      brackets: [{ start: 0, end: 3, label: "X", key: "E minor" }, { start: 4, end: 7, label: "Y", key: "D major" }, { start: 8, end: 11, label: "Z", key: "A minor" }],
      measures: [
        { events: [{ voices: { soprano: "G4", alto: "E4", tenor: "B3", bass: "E3" }, duration: "h" }, { voices: { soprano: "F#4", alto: "D#4", tenor: "B3", bass: "B2" }, duration: "h" }] },
        { events: [{ voices: { soprano: "E4", alto: "B3", tenor: "G3", bass: "E3" }, duration: "w" }] },
        { events: [{ voices: { soprano: "E5", alto: "C#4", tenor: "A3", bass: "A2" }, duration: "h" }, { voices: { soprano: "D5", alto: "A4", tenor: "F#3", bass: "D3" }, duration: "h" }] },
        { events: [{ voices: { soprano: "F#4", alto: "D4", tenor: "A3", bass: "D3" }, duration: "w" }] },
        { events: [{ voices: { soprano: "B4", alto: "G#4", tenor: "D4", bass: "E3" }, duration: "h" }, { voices: { soprano: "A4", alto: "E4", tenor: "C4", bass: "A2" }, duration: "h" }] },
        { endBarline: "final", events: [{ voices: { soprano: "A4", alto: "E4", tenor: "C4", bass: "A2" }, duration: "w" }] },
      ], harmonicEvents: [],
    }),
    answerHeading: "Published key, evidence and relationship table",
    answer: ["X: E minor — imperfect cadence in bars 10–11 moving to I in bar 11, with D♯ — relative minor. Y: D major — perfect cadence and C♯ — dominant. Z: A minor — perfect cadence and G♯ — relative minor of the subdominant; supertonic minor is accepted."],
  }),
  createQuestion({
    id: "nzqa-2025-bach-satb",
    category: "satb",
    sourceType: "nzqa-reference",
    source: nzqaSource(2025, "Question One", "(c)", "Extract Three", "J. S. Bach", "Komm, Heiliger Geist, Herre Gott", "bars 21–24, exam p.4; schedule p.4", "21–24"),
    family: "SATB / vocal completion",
    title: "Reference: two-stage chorale completion",
    context: "In G major, first complete bars 22–23 beat 1 around the supplied tenor and include the printed suspension. Then complete bar 23 beat 2 through bar 24 beat 3 around the supplied melody, choosing and labelling I, ii, V, V7 or vi in root position or inversion and including two passing notes.",
    presentation: { title: "Reference: two-stage chorale completion", hiddenConceptTerms: [] },
    sourceSpec: {
      year: 2025, provider: "NZQA", question: "Question One", part: "(c)", bars: "21–24",
      romanNumerals: ["I", "Ib", "IV⁹–⁸", "I", "Vb", "I", "vi", "iib", "V⁷", "I"],
      analysisPositions: 10, suppliedLabels: ["I", "Ib", "IV⁹–⁸"], keyCentres: ["G major"], measureCount: 4,
      expectedChordCount: 10, requiredPassingNotes: 2, requiredSuspension: true, expectedCompletionType: "satb",
      completionContract: { targetMeasures: [2, 3, 4], chordsToRealise: 10, harmonicIndications: 3 },
    },
    score: measuredScore({
      key: "G major", keySignature: "G", layout: "satb", voiceLabels: { treble: ["S", "A"], bass: ["T", "B"] }, completion: true,
      sourceKeyCentres: ["G major"], caption: "NZQA examination reference • 2025 Q1(c), Extract Three • bars 21–24 transcription",
      measures: [
        { voices: { soprano: [{ pitch: "G4", duration: "q" }, { pitch: "A4", duration: "q" }, { pitch: "B4", duration: "q" }, { pitch: "D5", duration: "q" }], alto: [{ pitch: "D4", duration: "h" }, { pitch: "G4", duration: "h" }], tenor: [{ pitch: "B3", duration: "q" }, { pitch: "A3", duration: "q" }, { pitch: "G3", duration: "h" }], bass: [{ pitch: "G3", duration: "q" }, { pitch: "F#3", duration: "q" }, { pitch: "E3", duration: "q" }, { pitch: "G3", duration: "q" }] }, questionVoices: { soprano: [{ pitch: "G4", duration: "q" }, { pitch: "A4", duration: "q" }, { pitch: "B4", duration: "q" }, { pitch: "D5", duration: "q" }], alto: [{ pitch: "D4", duration: "h" }, { pitch: "G4", duration: "h" }], tenor: [{ pitch: "B3", duration: "q" }, { pitch: "A3", duration: "q" }, { pitch: "G3", duration: "h" }], bass: [{ pitch: "G3", duration: "q" }, { pitch: "F#3", duration: "q" }, { pitch: "E3", duration: "q" }, { pitch: "G3", duration: "q" }] } },
        { voices: { soprano: [{ pitch: "B4", duration: "q" }, { pitch: "D5", duration: "q" }, { pitch: "C5", duration: "q" }, { pitch: "B4", duration: "q" }], alto: [{ pitch: "G4", duration: "h" }, { pitch: "A4", duration: "q" }, { pitch: "G4", duration: "q" }], tenor: [{ pitch: "D4", duration: "h" }, { pitch: "E4", duration: "q" }, { pitch: "D4", duration: "q" }], bass: [{ pitch: "G3", duration: "q" }, { pitch: "B2", duration: "q" }, { pitch: "C3", duration: "q" }, { pitch: "D3", duration: "q" }] }, questionVoices: { soprano: [{ duration: "w" }], alto: [{ duration: "w" }], tenor: [{ pitch: "D4", duration: "h" }, { pitch: "E4", duration: "q" }, { pitch: "D4", duration: "q" }], bass: [{ duration: "w" }] } },
        { voices: { soprano: [{ pitch: "G4", duration: "q" }, { pitch: "A4", duration: "8" }, { pitch: "B4", duration: "8" }, { pitch: "C5", duration: "q" }, { pitch: "D5", duration: "q" }], alto: [{ pitch: "D4", duration: "q" }, { pitch: "F#4", duration: "q" }, { pitch: "E4", duration: "q" }, { pitch: "F#4", duration: "q" }], tenor: [{ pitch: "B3", duration: "q" }, { pitch: "A3", duration: "q" }, { pitch: "G3", duration: "q" }, { pitch: "A3", duration: "q" }], bass: [{ pitch: "G3", duration: "q" }, { pitch: "D3", duration: "q" }, { pitch: "E3", duration: "q" }, { pitch: "C3", duration: "q" }] }, questionVoices: { soprano: [{ duration: "q" }, { pitch: "A4", duration: "8" }, { pitch: "B4", duration: "8" }, { pitch: "C5", duration: "q" }, { pitch: "D5", duration: "q" }], alto: [{ duration: "w" }], tenor: [{ pitch: "B3", duration: "q" }, { duration: "hd" }], bass: [{ duration: "w" }] } },
        { expectedBeats: 3, endBarline: "final", voices: { soprano: [{ pitch: "C5", duration: "h" }, { pitch: "B4", duration: "q" }], alto: [{ pitch: "E4", duration: "q" }, { pitch: "F#4", duration: "q" }, { pitch: "G4", duration: "q" }], tenor: [{ pitch: "A3", duration: "q" }, { pitch: "D4", duration: "q" }, { pitch: "D4", duration: "q" }], bass: [{ pitch: "A2", duration: "q" }, { pitch: "D3", duration: "q" }, { pitch: "G2", duration: "q" }] }, questionVoices: { soprano: [{ pitch: "C5", duration: "h" }, { pitch: "B4", duration: "q" }], alto: [{ duration: "hd" }], tenor: [{ duration: "hd" }], bass: [{ duration: "hd" }] } },
      ],
      harmonicEvents: [
        harmonicBox(2, 1, null, "I", { questionLabel: "I", romanNumeral: "I", localKey: "G major" }),
        harmonicBox(2, 2, null, "Ib", { questionLabel: "Ib", romanNumeral: "Ib", localKey: "G major" }),
        harmonicBox(2, 3, null, "IV⁹–⁸", { questionLabel: "IV⁹–⁸", romanNumeral: "IV⁹–⁸", localKey: "G major" }),
        harmonicBox(3, 1, null, "I", { romanNumeral: "I", localKey: "G major" }),
        harmonicBox(3, 2, null, "Vb", { romanNumeral: "Vb", localKey: "G major" }),
        harmonicBox(3, 3, null, "I", { romanNumeral: "I", localKey: "G major" }),
        harmonicBox(3, 4, null, "vi", { romanNumeral: "vi", localKey: "G major" }),
        harmonicBox(4, 1, null, "iib", { romanNumeral: "iib", localKey: "G major" }),
        harmonicBox(4, 2, null, "V⁷", { romanNumeral: "V⁷", localKey: "G major" }),
        harmonicBox(4, 3, null, "I", { romanNumeral: "I", localKey: "G major" }),
      ],
    }),
    answerHeading: "One possible model completion",
    answer: ["The schedule model realises I–Ib–IV9–8, then one valid chosen route I–Vb–I–vi–iib–V7–I. It preserves the supplied tenor in stage one, the supplied melody in stage two, the required suspension, and at least two passing notes. Other stylistically valid realisations are possible."],
  }),
  createQuestion({
    id: "nzqa-2025-schubert-analysis",
    category: "analysis",
    sourceType: "nzqa-reference",
    source: nzqaSource(2025, "Question Two", "(a)", "Extract Four", "Franz Schubert", "Adagio and Rondo in E Major, D 506 Op. 145", "bars 1–6, exam p.5; schedule p.6", "1–6"),
    family: "Roman numeral analysis",
    title: "Reference: extended Schubert progression and pivots",
    context: "The extract begins in E major, modulates to F♯ minor, and returns to E major. The first I is supplied. Analyse the 12 indicated positions and include the pivot at each modulation.",
    presentation: { title: "Reference: Schubert Roman analysis", hiddenConceptTerms: [] },
    sourceSpec: { year: 2025, provider: "NZQA", question: "Question Two", part: "(a)", bars: "1–6", romanNumerals: ["E: I", "V⁷b", "I", "ii / F♯m: i", "iib / F♯m: ib", "V⁷", "V⁷", "i / E: ii", "V⁷b", "vii°⁷", "V⁷b", "I", "V⁷c"], analysisPositions: 13, answerPositions: 12, suppliedLabels: ["E: I"], keyCentres: ["E major", "F♯ minor"], pivotCount: 2, measureCount: 6 },
    score: measuredScore({
      key: "E major → F♯ minor → E major", keySignature: "E", timeSignature: "3/4", layout: "piano", caption: "NZQA examination reference • 2025 Q2(a), Extract Four • bars 1–6 transcription",
      measures: [
        { events: [{ treble: ["G#4", "B4", "E5"], bass: ["E3"], duration: "q" }, { treble: ["A4", "D#5", "F#5"], bass: ["F#3"], duration: "q" }, { treble: ["G#4", "B4", "E5"], bass: ["E3"], duration: "q" }] },
        { events: [{ treble: ["A4", "C#5", "E5"], bass: ["F#3"], duration: "q" }, { treble: ["A4", "C#5", "F#5"], bass: ["A3"], duration: "q" }, { treble: ["G#4", "B#4", "D5", "F#5"], bass: ["C#3"], duration: "q" }] },
        { events: [{ treble: ["G#4", "B#4", "D5", "F#5"], bass: ["C#3"], duration: "hd" }] },
        { events: [{ treble: ["G#4", "B#4", "D5", "F#5"], bass: ["C#3"], duration: "h" }, { treble: ["A4", "C#5", "F#5"], bass: ["F#3"], duration: "q" }] },
        { events: [{ treble: ["A4", "D#5", "F#5"], bass: ["F#3"], duration: "q" }, { treble: ["A4", "C5", "D#5", "F#5"], bass: ["D#3"], duration: "q" }, { treble: ["A4", "D#5", "F#5"], bass: ["F#3"], duration: "q" }] },
        { endBarline: "final", events: [{ treble: ["G#4", "B4", "E5"], bass: ["E3"], duration: "h" }, { treble: ["A4", "B4", "D#5", "F#5"], bass: ["A3"], duration: "q" }] },
      ],
      harmonicEvents: [
        harmonicBox(1, 1, 0, "E: I", { questionLabel: "E: I", localKey: "E major", romanNumeral: "E: I" }), harmonicBox(1, 2, 1, "V⁷b", { localKey: "E major", romanNumeral: "V⁷b" }), harmonicBox(1, 3, 2, "I", { localKey: "E major", romanNumeral: "I" }),
        harmonicBox(2, 1, 0, "ii / F♯m: i", { localKey: "E major", romanNumeral: "ii / F♯m: i" }), harmonicBox(2, 2, 1, "iib / F♯m: ib", { localKey: "F♯ minor", romanNumeral: "iib / F♯m: ib" }), harmonicBox(2, 3, 2, "V⁷", { localKey: "F♯ minor", romanNumeral: "V⁷" }),
        harmonicBox(3, 1, 0, "V⁷", { localKey: "F♯ minor", romanNumeral: "V⁷" }), harmonicBox(4, 3, 1, "i / E: ii", { localKey: "F♯ minor", romanNumeral: "i / E: ii" }),
        harmonicBox(5, 1, 0, "V⁷b", { localKey: "E major", romanNumeral: "V⁷b" }), harmonicBox(5, 2, 1, "vii°⁷", { localKey: "E major", romanNumeral: "vii°⁷" }), harmonicBox(5, 3, 2, "V⁷b", { localKey: "E major", romanNumeral: "V⁷b" }),
        harmonicBox(6, 1, 0, "I", { localKey: "E major", romanNumeral: "I" }), harmonicBox(6, 3, 1, "V⁷c as suspension", { localKey: "E major", romanNumeral: "V⁷c" }),
      ],
    }),
    answerHeading: "Published Schubert analysis",
    answer: ["The 12 assessed positions are V7b–I–ii / F♯m:i–iib / F♯m:ib–V7–V7–i / E:ii–V7b–vii°7–V7b–I–V7c as a suspension. The schedule accepts either adjacent ii/i pivot placement at the first modulation."],
  }),
  createQuestion({
    id: "nzqa-2025-schubert-feature",
    category: "features",
    sourceType: "nzqa-reference",
    source: nzqaSource(2025, "Question Two", "(b)", "Extract Five", "Franz Schubert", "Adagio and Rondo in E Major, D 506 Op. 145", "bars 7–8, exam p.6; schedule p.6", "7–8"),
    family: "Harmonic or tonal feature",
    title: "Reference: feature, evidence, function and effect",
    context: "Identify a harmonic or tonal feature in bars 7–8, locate precise score evidence, and explain its function and effect in the phrase.",
    presentation: { title: "Reference: contextual harmonic feature", hiddenConceptTerms: ["contrary chromatic motion", "sequence"] },
    contextualFields: [
      { id: "feature", label: "Feature", kind: "classification", choices: ["chromatic semitone movement", "melodic repetition / imitation / sequence", "tonic pedal", "circle-of-fifths motion", "harmonic-rhythm change"], acceptedAnswers: [{ label: "chromatic semitone movement" }, { label: "melodic repetition / imitation / sequence" }] },
      { id: "location", label: "Score evidence / location", kind: "text", prompt: "Name the bar, beat, voices and pitch direction.", acceptedAnswers: [{ label: "Bar 7 beat 3: contrary chromatic semitone motion, descending in one part and ascending in another." }] },
      { id: "function", label: "Function", kind: "text", prompt: "Explain what the feature does harmonically or melodically.", acceptedAnswers: [{ label: "It decorates the cadence point and emphasises the imperfect cadence / dominant harmony; alternatively, repetition develops the melody and provides continuity." }] },
      { id: "effect", label: "Effect", kind: "text", prompt: "Connect the device to the listener's sense of motion or continuity.", acceptedAnswers: [{ label: "It creates variety and interest and momentum back to the tonic; the melodic alternative provides continuity." }] },
    ],
    sourceSpec: { year: 2025, provider: "NZQA", question: "Question Two", part: "(b)", bars: "7–8", expectedChordCount: 0, measureCount: 2 },
    score: measuredScore({
      key: "E major", keySignature: "E", timeSignature: "3/4", layout: "piano", caption: "NZQA examination reference • 2025 Q2(b), Extract Five • bars 7–8 transcription",
      measures: [
        { events: [{ treble: ["G#4", "E5"], bass: ["E3", "B3"], duration: "q" }, { treble: ["F#4", "D#5"], bass: ["F#3"], duration: "q" }, { treble: ["G4", "C#5"], bass: ["F3"], duration: "q" }] },
        { endBarline: "final", events: [{ treble: ["E4", "B4"], bass: ["G#2"], duration: "q" }, { treble: ["D#4", "B4"], bass: ["A3"], duration: "q" }, { treble: [], trebleRest: true, bass: ["G#3"], duration: "q" }] },
      ], harmonicEvents: [],
    }),
    answerHeading: "Schedule-derived contextual evidence",
    answer: ["One response identifies contrary chromatic semitone motion at bar 7 beat 3: one part descends while another ascends. It decorates the cadence point, emphasises the imperfect cadence/dominant and creates variety, interest and momentum back to tonic. The schedule also allows repetition, imitation or sequence in the melody when its developmental and continuity function is explained."],
  }),
  createQuestion({
    id: "nzqa-2025-schubert-piano",
    category: "piano",
    sourceType: "nzqa-reference",
    source: nzqaSource(2025, "Question Two", "(c)", "Extract Six", "Franz Schubert", "Adagio and Rondo in E Major, D 506 Op. 145", "bars 19–24, exam p.7; schedule p.7", "19–24"),
    family: "Piano completion",
    title: "Reference: continue Schubert's piano texture",
    context: "The Rondo extract is in E major. Continue the piano writing of bars 19–20 by adding a bass line and two inner parts in bars 20–24, using all eight supplied Roman-numeral indications.",
    presentation: { title: "Reference: Schubert piano completion", hiddenConceptTerms: [] },
    sourceSpec: { year: 2025, provider: "NZQA", question: "Question Two", part: "(c)", bars: "19–24", suppliedLabels: ["V", "ii", "iib", "vii°⁷", "V", "I", "V⁷", "I"], analysisPositions: 8, expectedChordCount: 8, measureCount: 6, expectedCompletionType: "piano", completionContract: { targetMeasures: [2, 3, 4, 5, 6], chordsToRealise: 8, harmonicIndications: 8 } },
    score: measuredScore({
      key: "E major", keySignature: "E", timeSignature: "2/4", layout: "piano", completion: true, caption: "NZQA examination reference • 2025 Q2(c), Extract Six • bars 19–24 transcription",
      measures: [
        { events: [{ treble: ["B4", "E5"], qTreble: ["E5"], bass: ["E3", "B3"], qBass: ["E3", "B3"], duration: "q" }, { treble: ["D#5", "F#5"], qTreble: ["F#5"], bass: ["E3", "B3"], qBass: ["E3", "B3"], duration: "q" }] },
        { events: [{ treble: ["B4", "D#5"], qTreble: ["D#5"], bass: ["B2", "F#3"], qBass: [], duration: "h" }] },
        { events: [{ treble: ["A4", "C#5", "E5"], qTreble: ["E5"], bass: ["F#2"], qBass: [], duration: "q" }, { treble: ["A4", "C#5", "F#5"], qTreble: ["F#5"], bass: ["A2"], qBass: [], duration: "q" }] },
        { events: [{ treble: ["A4", "C5", "D#5", "F#5"], qTreble: ["F#5"], bass: ["D#3"], qBass: [], duration: "q" }, { treble: ["A4", "B4", "D#5"], qTreble: ["D#5"], bass: ["B2"], qBass: [], duration: "q" }] },
        { events: [{ treble: ["G#4", "B4", "E5"], qTreble: ["E5"], bass: ["E3"], qBass: [], duration: "q" }, { treble: ["A4", "B4", "D#5", "F#5"], qTreble: ["F#5"], bass: ["B2"], qBass: [], duration: "q" }] },
        { endBarline: "final", events: [{ treble: ["G#4", "B4", "E5"], qTreble: ["E5"], bass: ["E2"], qBass: [], duration: "h" }] },
      ], harmonicEvents: [
        harmonicBox(2, 1, 0, "V", { questionLabel: "V" }), harmonicBox(3, 1, 0, "ii", { questionLabel: "ii" }), harmonicBox(3, 2, 1, "iib", { questionLabel: "iib" }), harmonicBox(4, 1, 0, "vii°⁷", { questionLabel: "vii°⁷" }), harmonicBox(4, 2, 1, "V", { questionLabel: "V" }), harmonicBox(5, 1, 0, "I", { questionLabel: "I" }), harmonicBox(5, 2, 1, "V⁷", { questionLabel: "V⁷" }), harmonicBox(6, 1, 0, "I", { questionLabel: "I" }),
      ],
    }),
    answerHeading: "One possible model completion",
    answer: ["The schedule model continues the compact two-part melodic texture with a bass and two inner parts through V–ii–iib–vii°7–V–I–V7–I. Other stylistically appropriate realisations are possible."],
  }),
  createQuestion({
    id: "nzqa-2025-joel-chords",
    category: "jazz",
    sourceType: "nzqa-reference",
    source: nzqaSource(2025, "Question Three", "(a)", "Extract Seven", "Billy Joel", "New York State of Mind", "bars 5–13, exam p.9; schedule p.9", "5–13"),
    family: "Jazz / rock notation",
    title: "Reference: extended pop-jazz chord analysis",
    context: "C is supplied at bar 5. Analyse the 10 chord positions in bars 6–13 using jazz / rock notation. Where a bar contains one chord, use the harmony of the whole bar.",
    presentation: { title: "Reference: identify ten jazz / rock chords", hiddenConceptTerms: [] },
    sourceSpec: { year: 2025, provider: "NZQA", question: "Question Three", part: "(a)", bars: "5–13", chordSymbols: ["C", "E7", "Am7", "Gm(add4)", "C7", "F", "A7", "Dm7", "B♭9", "B♭7", "C"], analysisPositions: 11, answerPositions: 10, suppliedLabels: ["C"], keyCentres: ["C major"], measureCount: 9 },
    score: measuredScore({
      key: "C major", keySignature: "C", layout: "piano", labelPosition: "top", caption: "NZQA examination reference • 2025 Q3(a), Extract Seven • bars 5–13 transcription",
      measures: [
        { events: [{ treble: ["E4", "G4", "C5"], bass: ["C3"], duration: "w" }] },
        { events: [{ treble: ["G#4", "B4", "D5"], bass: ["E3"], duration: "w" }] },
        { events: [{ treble: ["G4", "A4", "C5", "E5"], bass: ["A2"], duration: "h" }, { treble: ["G4", "Bb4", "C5", "D5"], bass: ["G2"], duration: "h" }] },
        { events: [{ treble: ["Bb4", "C5", "E5", "G5"], bass: ["C3"], duration: "w" }] },
        { events: [{ treble: ["A4", "C5", "F5"], bass: ["F3"], duration: "w" }] },
        { events: [{ treble: ["G4", "C#5", "E5"], bass: ["A2"], duration: "h" }, { treble: ["A4", "C5", "D5", "F5"], bass: ["D3"], duration: "h" }] },
        { events: [{ treble: ["Ab4", "C5", "D5", "F5"], bass: ["Bb2"], duration: "w" }] },
        { events: [{ treble: ["Ab4", "Bb4", "D5", "F5"], bass: ["Bb2"], duration: "h" }, { treble: ["E4", "G4", "C5"], bass: ["C3"], duration: "h" }] },
        { endBarline: "final", events: [{ treble: ["E4", "G4", "C5"], bass: ["C3"], duration: "w" }] },
      ], harmonicEvents: [
        harmonicBox(1, 1, 0, "C", { chordSymbol: "C", questionLabel: "C", localKey: "C major" }), harmonicBox(2, 1, 0, "E7", { chordSymbol: "E7", localKey: "C major" }), harmonicBox(3, 1, 0, "Am7", { chordSymbol: "Am7", localKey: "C major" }), harmonicBox(3, 3, 1, "Gm(add4)", { chordSymbol: "Gm(add4)", localKey: "C major" }), harmonicBox(4, 1, 0, "C7", { chordSymbol: "C7", localKey: "C major" }), harmonicBox(5, 1, 0, "F", { chordSymbol: "F", localKey: "C major" }), harmonicBox(6, 1, 0, "A7", { chordSymbol: "A7", localKey: "C major" }), harmonicBox(6, 3, 1, "Dm7", { chordSymbol: "Dm7", localKey: "C major" }), harmonicBox(7, 1, 0, "B♭9", { chordSymbol: "B♭9", localKey: "C major" }), harmonicBox(8, 1, 0, "B♭7", { chordSymbol: "B♭7", localKey: "C major" }), harmonicBox(8, 3, 1, "C", { chordSymbol: "C", localKey: "C major" }),
      ],
    }),
    answerHeading: "Published chord-symbol sequence",
    answer: ["The 10 assessed answers are E7, Am7, Gm(add4), C7, F, A7, Dm7, B♭9, B♭7 and C."],
  }),
  createQuestion({
    id: "nzqa-2025-joel-context",
    category: "features",
    sourceType: "nzqa-reference",
    source: nzqaSource(2025, "Question Three", "(b)", "Extract Eight", "Billy Joel", "New York State of Mind", "bars 24–42, exam pp.10–11; schedule p.9", "24–42"),
    family: "Contextual harmonic and tonal analysis",
    title: "Reference: harmonic rhythm and tonality in the bridge",
    context: "Analyse the bridge's harmonic rhythm and tonality. Build at least two evidence points: name the feature, locate it in the score, and explain its function or effect.",
    presentation: { title: "Reference: analyse harmonic rhythm and tonality", hiddenConceptTerms: ["1–1–2", "circle of fifths"] },
    contextualFields: [
      { id: "point-1-feature", label: "Point 1 · Feature", kind: "classification", choices: ["harmonic rhythm", "dominant–tonic motion", "circle-of-fifths motion", "added sevenths / major sevenths", "major chord changed to minor"], acceptedAnswers: [{ label: "harmonic rhythm" }] },
      { id: "point-1-evidence", label: "Point 1 · Score evidence", kind: "text", prompt: "State the rate/pattern and name affected chords or bars.", acceptedAnswers: [{ label: "Chords change every one or two bars and settle into a 1–1–2 pattern that emphasises G, F, A and G." }] },
      { id: "point-1-effect", label: "Point 1 · Function / effect", kind: "text", prompt: "Explain how that pattern shapes the bridge.", acceptedAnswers: [{ label: "The changing rate creates motion while the longer bar gives selected chords extra weight." }] },
      { id: "point-2-feature", label: "Point 2 · Feature", kind: "classification", choices: ["movement away from C-major tonality", "dominant–tonic motion", "circle-of-fifths motion", "jazz seventh / major-seventh additions", "major chord changed to minor"], acceptedAnswers: [{ label: "movement away from C-major tonality" }, { label: "dominant–tonic motion" }, { label: "circle-of-fifths motion" }, { label: "jazz seventh / major-seventh additions" }, { label: "major chord changed to minor" }] },
      { id: "point-2-evidence", label: "Point 2 · Score evidence", kind: "text", prompt: "Name at least two specific harmonic examples.", acceptedAnswers: [{ label: "Dominant–tonic and circle-of-fifths motion, seventh/major-seventh additions, and G–G minor or A–A minor changes move away from C major." }] },
      { id: "point-2-effect", label: "Point 2 · Function / effect", kind: "text", prompt: "Relate the examples to local tonal movement.", acceptedAnswers: [{ label: "The chord choices create varied local centres and tonal colour before the song returns to its C-major frame." }] },
    ],
    sourceSpec: { year: 2025, provider: "NZQA", question: "Question Three", part: "(b)", bars: "24–42", expectedChordCount: 0, measureCount: 6 },
    score: measuredScore({
      key: "C major context", keySignature: "C", layout: "piano", caption: "NZQA examination reference • 2025 Q3(b), Extract Eight • representative bridge systems, bars 24–42",
      measures: [
        { events: [{ treble: ["F4", "A4", "C5"], bass: ["F2"], duration: "w" }] }, { events: [{ treble: ["F4", "B4", "D5"], bass: ["G2"], duration: "w" }] },
        { events: [{ treble: ["E4", "G4", "B4", "D5"], bass: ["C3"], duration: "w" }] }, { events: [{ treble: ["D4", "G4", "Bb4"], bass: ["G2"], duration: "w" }] },
        { events: [{ treble: ["C4", "F4", "A4"], bass: ["F2"], duration: "w" }] }, { endBarline: "final", events: [{ treble: ["C#4", "E4", "A4"], bass: ["A2"], duration: "w" }] },
      ], harmonicEvents: [],
    }),
    answerHeading: "Schedule-derived bridge analysis",
    answer: ["The schedule describes chords changing every one or two bars and settling into a 1–1–2 pattern that emphasises G, F, A and G. Tonality moves away from C major through dominant–tonic and circle-of-fifths motion, jazz seventh/major-seventh additions, and changes such as G to G minor and A to A minor."],
  }),
  createQuestion({
    id: "nzqa-2025-joel-piano",
    category: "piano",
    sourceType: "nzqa-reference",
    source: nzqaSource(2025, "Question Three", "(c)", "Extract Nine", "Billy Joel", "New York State of Mind", "bars 14–22, exam p.12; schedule p.10", "14–22"),
    family: "Piano completion",
    title: "Reference: continue Billy Joel's piano accompaniment",
    context: "Continue the harmony of the piano part in bars 15–22 from the printed jazz/rock chord indications, preserving the opening accompaniment style and supplied melody.",
    presentation: { title: "Reference: pop-piano completion", hiddenConceptTerms: [] },
    sourceSpec: { year: 2025, provider: "NZQA", question: "Question Three", part: "(c)", bars: "14–22", suppliedLabels: ["Cmaj7/G", "F", "C/E", "D9", "F9", "G9", "Am7", "D7", "Am7", "G"], analysisPositions: 10, expectedChordCount: 10, measureCount: 8, expectedCompletionType: "piano", completionContract: { targetMeasures: [2, 3, 4, 5, 6, 7, 8], chordsToRealise: 10, harmonicIndications: 10 } },
    score: measuredScore({
      key: "C major", keySignature: "C", layout: "piano", completion: true, caption: "NZQA examination reference • 2025 Q3(c), Extract Nine • bars 14–22 transcription",
      measures: [
        { events: [{ treble: ["G4", "C5", "E5"], qTreble: ["E5"], bass: ["A2", "E3"], qBass: ["A2", "E3"], duration: "h" }, { treble: ["G4", "B4", "E5"], qTreble: ["E5"], bass: ["G2"], qBass: ["G2"], duration: "h" }] },
        { events: [{ treble: ["G4", "B4", "C5", "E5"], qTreble: ["E5"], bass: ["G2"], qBass: [], duration: "h" }, { treble: ["A4", "C5", "F5"], qTreble: ["F5"], bass: ["F2"], qBass: [], duration: "h" }] },
        { events: [{ treble: ["G4", "C5", "E5"], qTreble: ["E5"], bass: ["E2"], qBass: [], duration: "h" }, { treble: ["C5", "E5", "F#5"], qTreble: ["F#5"], bass: ["D2"], qBass: [], duration: "h" }] },
        { events: [{ treble: ["Eb4", "A4", "C5", "G5"], qTreble: ["G5"], bass: ["F2"], qBass: [], duration: "h" }, { treble: ["F4", "A4", "B4", "D5"], qTreble: ["D5"], bass: ["G2"], qBass: [], duration: "h" }] },
        { events: [{ treble: ["G4", "A4", "C5", "E5"], qTreble: ["E5"], bass: ["A2"], qBass: [], duration: "h" }, { treble: ["F#4", "A4", "C5", "D5"], qTreble: ["D5"], bass: ["D2"], qBass: [], duration: "h" }] },
        { events: [{ treble: ["G4", "A4", "C5", "E5"], qTreble: ["E5"], bass: ["A2"], qBass: [], duration: "w" }] },
        { events: [{ treble: ["G4", "B4", "D5"], qTreble: ["D5"], bass: ["G2"], qBass: [], duration: "w" }] },
        { endBarline: "final", events: [{ treble: ["G4", "B4", "D5"], qTreble: ["D5"], bass: ["G2"], qBass: [], duration: "w" }] },
      ], harmonicEvents: [
        harmonicBox(2, 1, 0, "Cmaj7/G", { questionLabel: "Cmaj7/G" }), harmonicBox(2, 3, 1, "F", { questionLabel: "F" }), harmonicBox(3, 1, 0, "C/E", { questionLabel: "C/E" }), harmonicBox(3, 3, 1, "D9", { questionLabel: "D9" }), harmonicBox(4, 1, 0, "F9", { questionLabel: "F9" }), harmonicBox(4, 3, 1, "G9", { questionLabel: "G9" }), harmonicBox(5, 1, 0, "Am7", { questionLabel: "Am7" }), harmonicBox(5, 3, 1, "D7", { questionLabel: "D7" }), harmonicBox(6, 1, 0, "Am7", { questionLabel: "Am7" }), harmonicBox(7, 1, 0, "G", { questionLabel: "G" }),
      ],
    }),
    answerHeading: "One possible model completion",
    answer: ["The schedule model realises the 10 printed chord moments Cmaj7/G–F–C/E–D9–F9–G9–Am7–D7–Am7–G while preserving the vocal melody and continuing the piano texture. Other stylistically appropriate realisations are possible."],
  }),
  createQuestion({
    id: "practice-2022-asharp-function",
    category: "modulation",
    homeKey: "A major",
    keyRegions: [
      { section: "1", localKey: "B minor", modelRelationship: "supertonic", relationshipChoices: ["supertonic", "relative minor", "dominant minor", "subdominant", "mediant minor"] },
      { section: "2", localKey: "D major", modelRelationship: "subdominant", relationshipChoices: ["subdominant", "dominant", "relative major", "supertonic", "tonic major"] },
      { section: "3", localKey: "E major", modelRelationship: "dominant", relationshipChoices: ["dominant", "subdominant", "relative minor", "mediant major", "tonic major"] },
    ],
    analysisFields: [
      { id: "altered-note", label: "Altered note", kind: "classification", choices: ["A♯", "A♮", "G♯", "B♭", "E♯"], acceptedAnswers: [{ label: "A♯" }] },
      { id: "chord-membership", label: "Chord membership / function", kind: "text", prompt: "Name the chord and the altered note's chord member.", acceptedAnswers: [{ label: "A♯ is the third of F♯7, the dominant chord in B minor." }] },
      { id: "key-implication", label: "Key implication", kind: "text", prompt: "Explain the altered note in the local key.", acceptedAnswers: [{ label: "A♯ is the raised leading note of B minor." }] },
      { id: "cadence-effect", label: "Cadence / modulation effect", kind: "text", prompt: "Connect the pitch to voice leading and the modulation.", acceptedAnswers: [{ label: "It supplies strong leading-note motion in F♯7–B minor and helps establish the modulated key with a perfect cadence." }] },
    ],
    sourceType: "practice-assessment-reference",
    source: practiceSource(2022, "Question One", "(b)", "Extract Two", "Composer not credited", "Practice modulation and altered-note function", "questions p.3; answers p.4", "2–3"),
    family: "Keys, evidence and contextual pitch function",
    title: "Practice reference: A♯ in a modulation",
    context: "The passage begins in A major and passes through three marked local keys. Identify each key, cite evidence and state its relationship to A major; then explain the function of A♯ in bars 2–3.",
    presentation: { title: "Practice reference: keys and an altered-note function", hiddenConceptTerms: ["leading note of B minor", "third of F♯7"] },
    sourceSpec: { year: 2022, provider: "Learning Ideas", question: "Question One", part: "(b)", bars: "2–3", sections: ["1", "2", "3"], keyCentres: ["B minor", "D major", "E major"], keyRelationships: [{ section: "1", homeKey: "A major", localKey: "B minor", acceptedLabels: [] }, { section: "2", homeKey: "A major", localKey: "D major", acceptedLabels: [] }, { section: "3", homeKey: "A major", localKey: "E major", acceptedLabels: [] }], requiredPitchSpellings: ["A#4"], measureCount: 3 },
    score: measuredScore({
      key: "A major", keySignature: "A", layout: "piano", sourceKeyCentres: ["B minor", "D major", "E major"], caption: "Practice assessment reference • 2022 Q1(b), Extract Two • selected key regions",
      brackets: [{ start: 0, end: 1, label: "1", key: "B minor" }, { start: 2, end: 3, label: "2", key: "D major" }, { start: 4, end: 5, label: "3", key: "E major" }],
      measures: [
        { events: [{ treble: ["F#4", "A#4", "C#5", "E5"], bass: ["F#3"], duration: "h" }, { treble: ["F#4", "B4", "D5"], bass: ["B2"], duration: "h" }] },
        { events: [{ treble: ["A4", "D5", "F#5"], bass: ["D3"], duration: "h" }, { treble: ["G4", "C#5", "E5"], bass: ["A2"], duration: "h" }] },
        { endBarline: "final", events: [{ treble: ["F#4", "A4", "D#5"], bass: ["B2"], duration: "h" }, { treble: ["G#4", "B4", "E5"], bass: ["E3"], duration: "h" }] },
      ], harmonicEvents: [],
    }),
    answerHeading: "Practice-schedule evidence",
    answer: ["1 is B minor: A♯ and a perfect cadence support the supertonic region. 2 is D major: G♮ and a perfect cadence support the subdominant. 3 is E major: four sharps and B–E support the dominant. A♯ is B minor's leading note and the third of F♯7, producing strong voice leading through the perfect cadence into the modulated key."],
  }),
  createQuestion({
    id: "practice-2022-integrated-analysis",
    category: "features",
    sourceType: "practice-assessment-reference",
    source: practiceSource(2022, "Question Two", "(a)", "Extract Four", "Composer not credited", "Integrated Roman, modulation and non-harmonic-note analysis", "questions pp.5–6; answers p.6", "1–8"),
    family: "Integrated harmonic and tonal analysis",
    title: "Practice reference: progression, keys and non-harmonic notes",
    context: "The extract begins in D minor. Analyse the Roman progression, explain the moves to F major and A major with evidence, and classify the marked non-harmonic notes as parts of one connected response.",
    presentation: { title: "Practice reference: integrated classical analysis", hiddenConceptTerms: ["relative major", "dominant major", "accented passing"] },
    contextualFields: [
      { id: "roman-route", label: "Roman progression", kind: "text", prompt: "Record the eight indicated Roman-numeral answers in order.", acceptedAnswers: [{ label: "Use the eight Roman labels printed in the practice answer schedule, relative to the active local keys." }] },
      { id: "f-region", label: "F-major modulation", kind: "text", prompt: "State relationship, location and evidence.", acceptedAnswers: [{ label: "F major is the relative major, established in bars 4–5 by E♭ and a perfect cadence." }] },
      { id: "a-region", label: "A-major modulation", kind: "text", prompt: "State relationship, location and evidence.", acceptedAnswers: [{ label: "A major is the dominant major, established in bars 6–8 by G♯/B♮ and a perfect cadence." }] },
      { id: "nht-1", label: "NHT marker 1", kind: "classification", choices: ["passing note", "auxiliary / neighbour note", "accented passing note", "suspension", "appoggiatura"], acceptedAnswers: [{ label: "passing note" }] },
      { id: "nht-2", label: "NHT marker 2", kind: "classification", choices: ["passing note", "auxiliary / neighbour note", "accented passing note", "suspension", "appoggiatura"], acceptedAnswers: [{ label: "auxiliary / neighbour note" }] },
      { id: "nht-3", label: "NHT marker 3", kind: "classification", choices: ["passing note", "auxiliary / neighbour note", "accented passing note", "suspension", "appoggiatura"], acceptedAnswers: [{ label: "accented passing note" }] },
    ],
    sourceSpec: { year: 2022, provider: "Learning Ideas", question: "Question Two", part: "(a)", bars: "1–8", keyCentres: ["D minor", "F major", "A major"], nonHarmonicMarkers: ["passing note", "auxiliary / neighbour note", "accented passing note"], expectedChordCount: 8, measureCount: 4 },
    score: measuredScore({
      key: "D minor → F major → A major", keySignature: "Dm", layout: "piano", sourceKeyCentres: ["D minor", "F major", "A major"], caption: "Practice assessment reference • 2022 Q2(a), Extract Four • integrated analysis",
      measures: [
        { events: [{ treble: ["F4", "A4", "D5"], bass: ["D3"], duration: "h" }, { treble: ["E4", "G4", "C#5"], bass: ["A2"], duration: "h" }] },
        { events: [{ treble: ["F4", "A4", "C5"], bass: ["F3"], duration: "h" }, { treble: ["E4", "G4", "C5"], bass: ["C3"], duration: "h" }] },
        { events: [{ treble: ["E4", "G#4", "B4", "D5"], bass: ["E3"], duration: "h" }, { treble: ["E4", "A4", "C#5"], bass: ["A2"], duration: "h" }] },
        { endBarline: "final", events: [{ treble: ["D4", "F4", "B4"], bass: ["G#2"], duration: "h" }, { treble: ["E4", "A4", "C#5"], bass: ["A2"], duration: "h" }] },
      ], harmonicEvents: [],
    }),
    answerHeading: "Practice-schedule integrated evidence",
    answer: ["The answer schedule combines the eight Roman answers with two evidence-based modulations: F major, the relative major, in bars 4–5; and A major, the dominant major, in bars 6–8. Its marked NHT evidence includes passing notes, auxiliary notes and accented passing notes."],
  }),
  createQuestion({
    id: "practice-2023-tonality-harmony",
    category: "features",
    sourceType: "practice-assessment-reference",
    source: practiceSource(2023, "Question Three", "(a)", "Extract Six", "Composer not credited", "Tonality and harmony analysis", "questions pp.7–8; answers p.9", "1–18"),
    family: "Contextual harmonic and tonal analysis",
    title: "Practice reference: tonality through ii–V–I motion",
    context: "Analyse the tonality and harmony across the whole extract. Use several connected points to explain the overall key, opening ambiguity, temporary centres and the final return.",
    presentation: { title: "Practice reference: analyse tonality and harmony", hiddenConceptTerms: ["E♭ major", "ii–V–I", "diminished ii"] },
    contextualFields: [
      { id: "overall-key", label: "Overall key and first confirmation", kind: "text", prompt: "Name the home key and the cadence/bar evidence.", acceptedAnswers: [{ label: "E♭ major, first established by B♭7–E♭ in bars 7–8." }] },
      { id: "opening", label: "Opening tonal ambiguity", kind: "text", prompt: "Explain the opening IV to iv motion.", acceptedAnswers: [{ label: "The piece starts on IV and moves to iv minor, delaying a clear tonic and creating tonal ambiguity." }] },
      { id: "temporary-centres", label: "Temporary centres", kind: "text", prompt: "Trace the minor ii–V7–i progressions.", acceptedAnswers: [{ label: "After vi in bar 13, minor ii–V7–i progressions tonicise G minor in bars 14–15 and F minor in bars 16–17." }] },
      { id: "final-return", label: "Return and unusual chord", kind: "text", prompt: "Explain the final cadence and altered ii quality.", acceptedAnswers: [{ label: "A final perfect cadence returns to E♭; its ii–V–I unusually uses a diminished ii instead of the expected minor ii." }] },
    ],
    sourceSpec: { year: 2023, provider: "Learning Ideas", question: "Question Three", part: "(a)", bars: "1–18", keyCentres: ["E♭ major", "G minor", "F minor"], expectedChordCount: 0, measureCount: 5 },
    score: measuredScore({
      key: "E♭ major with temporary minor centres", keySignature: "Eb", layout: "piano", sourceKeyCentres: ["E♭ major", "G minor", "F minor"], caption: "Practice assessment reference • 2023 Q3(a), Extract Six • tonal route",
      measures: [
        { events: [{ treble: ["F4", "Ab4", "C5"], bass: ["F3"], duration: "h" }, { treble: ["F4", "Ab4", "B4", "D5"], bass: ["Bb2"], duration: "h" }] },
        { events: [{ treble: ["G4", "Bb4", "Eb5"], bass: ["Eb3"], duration: "w" }] },
        { events: [{ treble: ["A4", "C5", "Eb5"], bass: ["A2"], duration: "h" }, { treble: ["F#4", "A4", "C5", "D5"], bass: ["D3"], duration: "h" }] },
        { events: [{ treble: ["G4", "Bb4", "D5"], bass: ["G2"], duration: "h" }, { treble: ["F4", "Ab4", "C5"], bass: ["F2"], duration: "h" }] },
        { endBarline: "final", events: [{ treble: ["F4", "Ab4", "Cb5"], bass: ["F2"], duration: "h" }, { treble: ["G4", "Bb4", "Eb5"], bass: ["Eb3"], duration: "h" }] },
      ], harmonicEvents: [],
    }),
    answerHeading: "Practice-schedule tonal analysis",
    answer: ["The overall key is E♭ major, confirmed by B♭7–E♭ in bars 7–8 after an ambiguous IV–iv opening. Bar 13 moves to vi; minor ii–V7–i progressions briefly establish G minor and then F minor before a final perfect cadence returns to E♭. The last ii–V–I unusually uses diminished ii."],
  }),
  createQuestion({
    id: "practice-2024-two-devices",
    category: "features",
    sourceType: "practice-assessment-reference",
    source: practiceSource(2024, "Question Two", "(a)", "Extract Four", "Composer not credited", "Two compositional devices and their functions", "questions p.5; answers p.6", "1–3"),
    family: "Contextual harmonic and tonal analysis",
    title: "Practice reference: two devices and their functions",
    context: "Identify two compositional devices in the extract. For each, give a location and explain its musical function or effect.",
    presentation: { title: "Practice reference: analyse two compositional devices", hiddenConceptTerms: ["tonic pedal", "melodic sequence", "diminution"] },
    contextualFields: [
      { id: "device-1", label: "Point 1 · Device", kind: "classification", choices: ["tonic pedal", "melodic sequence", "diminution", "dominant pedal", "augmentation"], acceptedAnswers: [{ label: "tonic pedal" }, { label: "melodic sequence" }, { label: "diminution" }] },
      { id: "location-1", label: "Point 1 · Location / evidence", kind: "text", prompt: "Name the voice, bars or rhythmic change.", acceptedAnswers: [{ label: "Tonic pedal in the bass, sequence in the melody in bars 1–3, or halved motif rhythm in bar 3." }] },
      { id: "function-1", label: "Point 1 · Function / effect", kind: "text", prompt: "Explain what the device contributes.", acceptedAnswers: [{ label: "The pedal establishes D major and creates dissonant interest; sequence makes the theme memorable; diminution creates brisk urgency." }] },
      { id: "device-2", label: "Point 2 · Device", kind: "classification", choices: ["tonic pedal", "melodic sequence", "diminution", "dominant pedal", "augmentation"], acceptedAnswers: [{ label: "tonic pedal" }, { label: "melodic sequence" }, { label: "diminution" }] },
      { id: "location-2", label: "Point 2 · Location / evidence", kind: "text", prompt: "Choose different evidence from point 1.", acceptedAnswers: [{ label: "Tonic pedal in the bass, sequence in the melody in bars 1–3, or halved motif rhythm in bar 3." }] },
      { id: "function-2", label: "Point 2 · Function / effect", kind: "text", prompt: "Explain the second device's contribution.", acceptedAnswers: [{ label: "The pedal establishes D major and creates dissonant interest; sequence creates repetition with variation; diminution increases urgency." }] },
    ],
    sourceSpec: { year: 2024, provider: "Learning Ideas", question: "Question Two", part: "(a)", bars: "1–3", expectedChordCount: 0, measureCount: 3 },
    score: measuredScore({
      key: "D major", keySignature: "D", layout: "piano", caption: "Practice assessment reference • 2024 Q2(a), Extract Four • bars 1–3 transcription",
      measures: [
        { events: [{ treble: ["F#4", "A4", "D5"], bass: ["D2"], duration: "h" }, { treble: ["G4", "B4", "E5"], bass: ["D2"], duration: "h" }] },
        { events: [{ treble: ["A4", "C#5", "F#5"], bass: ["D2"], duration: "h" }, { treble: ["B4", "D5", "G5"], bass: ["D2"], duration: "h" }] },
        { endBarline: "final", events: [{ treble: ["A4", "D5", "F#5"], bass: ["D2"], duration: "q" }, { treble: ["B4", "E5", "G5"], bass: ["D2"], duration: "q" }, { treble: ["A4", "C#5", "F#5"], bass: ["D2"], duration: "q" }, { treble: ["F#4", "A4", "D5"], bass: ["D2"], duration: "q" }] },
      ], harmonicEvents: [],
    }),
    answerHeading: "Practice-schedule device evidence",
    answer: ["Valid schedule examples include a tonic pedal in the bass, which establishes D major while generating dissonant interest; melodic sequence in bars 1–3, which makes the theme memorable through repetition with variation; and diminution in bar 3, where the motif rhythm is halved to create a brisk, urgent effect. The response must explain two separate devices."],
  }),
  createQuestion({
    id: "practice-2024-jazz-tonality",
    category: "jazz",
    sourceType: "practice-assessment-reference",
    source: practiceSource(2024, "Question Three", "(a)", "Extract Seven", "George and Ira Gershwin", "Our Love Is Here to Stay", "questions pp.8–9; answers p.9", "4–14"),
    family: "Jazz / rock notation and contextual tonality",
    title: "Practice reference: jazz symbols, key and tonal movement",
    context: "Analyse the 14 blank chord positions in bars 4–8 and 12–14 using jazz / rock notation. Then identify the key and explain the tonal changes with specific chord and cadence evidence.",
    presentation: { title: "Practice reference: jazz chords and tonality", hiddenConceptTerms: ["F major", "D minor", "secondary dominant"] },
    reflectionOnly: true,
    analysisFields: [
      { id: "key", label: "Overall key", kind: "classification", choices: ["F major", "D minor", "B♭ major", "C major", "G minor"], acceptedAnswers: [{ label: "F major" }] },
      { id: "tonal-evidence", label: "Key and cadence evidence", kind: "text", prompt: "Use the key signature and specific bar/cadence evidence.", acceptedAnswers: [{ label: "F major is supported by the B♭ key signature and perfect cadences in bars 3–4 and 11–12." }] },
      { id: "modulation", label: "Modulation", kind: "text", prompt: "Name the local key, bars and progression.", acceptedAnswers: [{ label: "Bars 13–14 move to D minor through a minor ii–V7–i progression." }] },
      { id: "secondary-dominants", label: "Secondary-dominant evidence", kind: "text", prompt: "Name the extended dominants and where they occur.", acceptedAnswers: [{ label: "G9 and G13 act as secondary dominants in bars 2, 7 and 15." }] },
    ],
    sourceSpec: { year: 2024, provider: "Learning Ideas", question: "Question Three", part: "(a)", bars: "4–14", chordSymbols: ["Gm7", "C7", "F6", "Gm11", "C9", "G13", "Gm7", "C7", "D9", "Fmaj7", "B♭maj9", "Eø7", "A7", "Dm"], analysisPositions: 14, answerPositions: 14, keyCentres: ["F major", "D minor"], measureCount: 10 },
    score: measuredScore({
      key: "F major with a D-minor region", keySignature: "F", layout: "piano", labelPosition: "top", sourceKeyCentres: ["F major", "D minor"], caption: "Practice assessment reference • 2024 Q3(a), Extract Seven • assessed chord positions",
      measures: [
        { events: [{ treble: ["G4", "Bb4", "D5", "F5"], bass: ["G2"], duration: "h" }, { treble: ["G4", "Bb4", "C5", "E5"], bass: ["C3"], duration: "h" }] },
        { events: [{ treble: ["A4", "C5", "D5", "F5"], bass: ["F3"], duration: "w" }] },
        { events: [{ treble: ["A4", "Bb4", "C5", "D5", "F5"], bass: ["G2"], duration: "w" }] },
        { events: [{ treble: ["Bb4", "C5", "D5", "E5", "G5"], bass: ["C3"], duration: "h" }, { treble: ["A4", "B4", "D5", "E5", "F5", "G5"], bass: ["G2"], duration: "h" }] },
        { events: [{ treble: ["G4", "Bb4", "D5", "F5"], bass: ["G2"], duration: "h" }, { treble: ["G4", "Bb4", "C5", "E5"], bass: ["C3"], duration: "h" }] },
        { events: [{ treble: ["A4", "C5", "D5", "E5", "F#5"], bass: ["D3"], duration: "w" }] },
        { events: [{ treble: ["A4", "C5", "E5", "F5"], bass: ["F3"], duration: "w" }] },
        { events: [{ treble: ["A4", "Bb4", "C5", "D5", "F5"], bass: ["Bb2"], duration: "w" }] },
        { events: [{ treble: ["G4", "Bb4", "D5"], bass: ["E3"], duration: "h" }, { treble: ["G4", "C#5", "E5"], bass: ["A2"], duration: "h" }] },
        { endBarline: "final", events: [{ treble: ["F4", "A4", "D5"], bass: ["D3"], duration: "w" }] },
      ],
      harmonicEvents: [
        harmonicBox(1, 1, 0, "Gm7", { chordSymbol: "Gm7" }), harmonicBox(1, 3, 1, "C7", { chordSymbol: "C7" }), harmonicBox(2, 1, 0, "F6", { chordSymbol: "F6" }), harmonicBox(3, 1, 0, "Gm11", { chordSymbol: "Gm11" }), harmonicBox(4, 1, 0, "C9", { chordSymbol: "C9" }), harmonicBox(4, 3, 1, "G13", { chordSymbol: "G13" }), harmonicBox(5, 1, 0, "Gm7", { chordSymbol: "Gm7" }), harmonicBox(5, 3, 1, "C7", { chordSymbol: "C7" }), harmonicBox(6, 1, 0, "D9", { chordSymbol: "D9" }), harmonicBox(7, 1, 0, "Fmaj7", { chordSymbol: "Fmaj7" }), harmonicBox(8, 1, 0, "B♭maj9", { chordSymbol: "B♭maj9" }), harmonicBox(9, 1, 0, "Eø7", { chordSymbol: "Eø7" }), harmonicBox(9, 3, 1, "A7", { chordSymbol: "A7" }), harmonicBox(10, 1, 0, "Dm", { chordSymbol: "Dm" }),
      ],
    }),
    answerHeading: "Practice-schedule chord and tonal evidence",
    answer: ["The 14 assessed symbols are Gm7, C7, F6, Gm11, C9, G13, Gm7, C7, D9, Fmaj7, B♭maj9, Eø7, A7 and Dm. The overall key is F major, supported by the one-flat signature and perfect cadences in bars 3–4 and 11–12. Bars 13–14 tonicise D minor through a minor ii–V7–i, while G9 and G13 act as secondary dominants."],
  }),
  createQuestion({
    id: "practice-2025-integrated-tonality",
    category: "features",
    sourceType: "practice-assessment-reference",
    source: practiceSource(2025, "Question Two", "(a)(ii)", "Extract Four", "Composer not credited", "Integrated tonality, modulation and non-harmonic-note analysis", "questions pp.5–6; answers p.7", "1–25"),
    family: "Integrated contextual harmonic and tonal analysis",
    title: "Practice reference: tonal route and non-harmonic notes",
    context: "Analyse the tonality and harmonic features of the entire extract. Trace the modulations and their relationships to the tonic, explain how the changes occur, and discuss several non-harmonic notes with precise musical evidence.",
    presentation: { title: "Practice reference: integrated tonality and note analysis", hiddenConceptTerms: ["A major", "B major", "melodic sequence", "direct modulation"] },
    contextualFields: [
      { id: "tonal-route", label: "Tonal route", kind: "text", prompt: "Name the tonic and the local keys in order.", acceptedAnswers: [{ label: "The passage moves from E minor to A major, then B major, and returns to E minor." }] },
      { id: "relationships", label: "Key relationships and evidence", kind: "text", prompt: "Relate each local key to E minor and cite cadence or accidental evidence.", acceptedAnswers: [{ label: "A major is the major subdominant region and B major is the dominant; the return to E minor is confirmed by its leading note and cadence." }] },
      { id: "modulation-method", label: "How the modulations occur", kind: "text", prompt: "Distinguish direct changes, sequence and the return pivot.", acceptedAnswers: [{ label: "The A-major to B-major changes are direct and follow a melodic sequence whose motif rises by step; the return to E minor uses a pivot chord." }] },
      { id: "nht-type-1", label: "Non-harmonic note 1", kind: "classification", choices: ["passing note", "accented passing note", "grace note", "mordent", "suspension", "appoggiatura"], acceptedAnswers: [{ label: "passing note" }, { label: "accented passing note" }, { label: "grace note" }, { label: "mordent" }, { label: "suspension" }, { label: "appoggiatura" }] },
      { id: "nht-evidence-1", label: "Note 1 · score evidence", kind: "text", prompt: "Give its bar/voice, approach and resolution.", acceptedAnswers: [{ label: "Identify the exact note and show from its approach and departure how it fits the chosen classification." }] },
      { id: "nht-type-2", label: "Non-harmonic note 2", kind: "classification", choices: ["passing note", "accented passing note", "grace note", "mordent", "suspension", "appoggiatura"], acceptedAnswers: [{ label: "passing note" }, { label: "accented passing note" }, { label: "grace note" }, { label: "mordent" }, { label: "suspension" }, { label: "appoggiatura" }] },
      { id: "nht-evidence-2", label: "Note 2 · score evidence and effect", kind: "text", prompt: "Choose a contrasting type and explain its melodic or harmonic contribution.", acceptedAnswers: [{ label: "A second located example should use a different non-harmonic-note type and explain how it adds melodic interest, tension or decoration." }] },
    ],
    sourceSpec: {
      year: 2025, provider: "Learning Ideas", question: "Question Two", part: "(a)(ii)", bars: "1–25",
      keyCentres: ["E minor", "A major", "B major"],
      nonHarmonicMarkers: ["passing note", "accented passing note", "grace note", "mordent", "suspension", "appoggiatura"],
      expectedChordCount: 0, measureCount: 5,
    },
    score: measuredScore({
      key: "E minor with related major regions", keySignature: "Em", layout: "piano",
      sourceKeyCentres: ["E minor", "A major", "B major"],
      caption: "Practice assessment reference • 2025 Q2(a)(ii), Extract Four • representative tonal route",
      measures: [
        { events: [{ treble: ["G4", "B4", "E5"], bass: ["E3"], duration: "h" }, { treble: ["F#4", "A4", "D#5"], bass: ["B2"], duration: "h" }] },
        { events: [{ treble: ["A4", "C#5", "E5"], bass: ["A2"], duration: "h" }, { treble: ["G#4", "B4", "E5"], bass: ["E3"], duration: "h" }] },
        { events: [{ treble: ["A#4", "C#5", "F#5"], bass: ["F#2"], duration: "h" }, { treble: ["F#4", "B4", "D#5"], bass: ["B2"], duration: "h" }] },
        { events: [{ treble: ["G#4", "B4", "E5"], bass: ["E3"], duration: "q" }, { treble: ["A4", "C#5", "F#5"], bass: ["F#3"], duration: "q" }, { treble: ["B4", "D#5", "G5"], bass: ["G3"], duration: "q" }, { treble: ["A#4", "C#5", "F#5"], bass: ["F#3"], duration: "q" }] },
        { endBarline: "final", events: [{ treble: ["F#4", "A4", "D#5"], bass: ["B2"], duration: "h" }, { treble: ["G4", "B4", "E5"], bass: ["E3"], duration: "h" }] },
      ], harmonicEvents: [],
    }),
    answerHeading: "Practice-schedule contextual evidence",
    answer: ["The schedule traces E minor to A major, then B major, and back to E minor through a pivot chord. The A-major and B-major changes are direct modulations linked by a melodic sequence whose motif rises by step. Supported non-harmonic-note evidence may include passing notes, accented passing notes, grace notes, mordents, suspensions and appoggiaturas. A strong response locates and explains several examples rather than merely listing terms."],
  }),
];

window.CadenceData = Object.freeze({
  questions: Object.freeze(questionBank),
  categories: Object.freeze(categoryNames),
  sourceTypes: Object.freeze(sourceTypeNames),
});
