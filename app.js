const questionBank = [
  {
    id: "roman-c-g",
    category: "analysis",
    family: "Roman numeral analysis",
    title: "Chorale modulation to the dominant",
    context: "The passage begins in C major and modulates to G major. A pivot chord is used. Analyse the harmony in the boxes provided.",
    tasks: {
      A: ["Identify each chord using Roman numeral notation, including inversions and sevenths."],
      M: ["Show the consecutive progression relative to the correct key."],
      E: ["Identify the pivot chord relative to both keys and state its modulatory function."],
    },
    score: {
      key: "C major → G major",
      blankLabels: true,
      labelPosition: "bottom",
      chords: [
        { treble: ["E4", "C5"], bass: ["C3", "G3"], givenLabel: "C: I", answerLabel: "C: I" },
        { treble: ["C4", "A4"], bass: ["A2", "E3"], answerLabel: "vi" },
        { treble: ["D4", "A4"], bass: ["F3", "A3"], answerLabel: "ii⁶" },
        { treble: ["B3", "F4"], bass: ["G2", "D3"], answerLabel: "V⁷" },
        { treble: ["C4", "E4"], bass: ["C3", "G3"], answerLabel: "I" },
        { treble: ["C4", "G4"], bass: ["C3", "E3"], answerLabel: "I / G: IV" },
        { treble: ["C4", "F#4", "A4"], bass: ["D3", "A3"], answerLabel: "V⁷" },
        { treble: ["B3", "G4"], bass: ["G2", "D3"], answerLabel: "I" },
      ],
    },
    answerHeading: "Chord analysis and pivot",
    answer: [
      "<strong>Progression:</strong> C: I – vi – ii⁶ – V⁷ – I – I / G: IV – V⁷ – I.",
      "<strong>Pivot:</strong> the C-major chord functions first as I in C major and then as IV in G major. D7 supplies F♯, the new leading note, and resolves to G through a perfect cadence.",
    ],
    criteria: {
      A: ["At least four isolated chords are correct relative to the stated key."],
      M: ["At least five consecutive chords, including inversions or sevenths, form a secure analysis."],
      E: ["The near-complete progression is correct and the pivot is labelled relative to both keys."],
    },
  },
  {
    id: "roman-a-c",
    category: "analysis",
    family: "Roman numeral analysis",
    title: "Minor key to relative major",
    context: "The extract begins in A minor and ends in C major. Analyse the chords and show the point at which one chord can be understood in both keys.",
    tasks: {
      A: ["Name the individual chords using Roman numerals."],
      M: ["Analyse the progression as consecutive chords, including the first inversion."],
      E: ["Label the pivot relative to both keys and explain how the cadence establishes C major."],
    },
    score: {
      key: "A minor → C major",
      blankLabels: true,
      labelPosition: "bottom",
      chords: [
        { treble: ["C4", "A4"], bass: ["A2", "E3"], givenLabel: "a: i", answerLabel: "a: i" },
        { treble: ["D4", "A4"], bass: ["F3", "A3"], answerLabel: "iv⁶" },
        { treble: ["G#4", "D5"], bass: ["E3", "B3"], answerLabel: "V⁷" },
        { treble: ["C4", "A4"], bass: ["A2", "E3"], answerLabel: "i" },
        { treble: ["F4", "D5"], bass: ["D3", "A3"], answerLabel: "iv / C: ii" },
        { treble: ["B3", "F4"], bass: ["G2", "D3"], answerLabel: "V⁷" },
        { treble: ["C4", "E4", "G4"], bass: ["C3", "G3"], answerLabel: "I" },
      ],
    },
    answerHeading: "Analysis in both keys",
    answer: [
      "<strong>Progression:</strong> a: i – iv⁶ – V⁷ – i – iv / C: ii – V⁷ – I.",
      "<strong>Evidence:</strong> D minor acts as iv in A minor and ii in C major. The following G7–C progression is a perfect cadence in C major and firmly establishes the relative major.",
    ],
    criteria: {
      A: ["At least three individual chords are correctly named."],
      M: ["A secure consecutive progression is identified through the cadence."],
      E: ["The pivot, cadence evidence and relationship to the original tonic are all explained correctly."],
    },
  },
  {
    id: "modulation-c-g-e",
    category: "modulation",
    family: "Keys and modulation",
    title: "Locate two temporary key centres",
    context: "The extract begins in C major. Sections X and Y establish temporary key centres. For each section, identify the key, give precise musical evidence, and state its relationship to C major.",
    tasks: {
      A: ["Identify the key of section X."],
      M: ["Provide cadence or accidental evidence for both key centres."],
      E: ["State the relationship of both keys to C major and explain how the harmony moves between them."],
    },
    score: {
      key: "C major",
      labelPosition: "bottom",
      brackets: [{ start: 4, end: 5, label: "X" }, { start: 6, end: 7, label: "Y" }],
      chords: [
        { treble: ["E4", "C5"], bass: ["C3", "G3"] },
        { treble: ["F4", "D5"], bass: ["D3", "A3"] },
        { treble: ["B3", "F4"], bass: ["G2", "D3"] },
        { treble: ["C4", "E4"], bass: ["C3", "G3"] },
        { treble: ["C4", "F#4", "A4"], bass: ["D3", "A3"] },
        { treble: ["B3", "G4"], bass: ["G2", "D3"] },
        { treble: ["D#4", "A4"], bass: ["B2", "F#3"] },
        { treble: ["B3", "G4"], bass: ["E3", "B3"] },
      ],
    },
    answerHeading: "Key, evidence and relationship",
    answer: [
      "<strong>X: G major.</strong> F♯ appears as the raised leading note and D7–G forms a perfect cadence. G major is the dominant key of C major.",
      "<strong>Y: E minor.</strong> D♯ is the raised leading note and B7–Em forms a perfect cadence. E minor is the relative minor of G major and the mediant key of C major.",
    ],
    criteria: {
      A: ["At least one key is identified correctly."],
      M: ["Both keys are supported with relevant accidental or cadence evidence."],
      E: ["Both relationships are correct and the harmonic route is explained with specific evidence."],
    },
  },
  {
    id: "modulation-a-fsharp",
    category: "modulation",
    family: "Keys and modulation",
    title: "From tonic major to relative minor",
    context: "The passage begins in A major and closes in F-sharp minor. Identify where the new key becomes established and explain the function of the altered note E-sharp.",
    tasks: {
      A: ["Identify the final key."],
      M: ["Give harmonic evidence showing where the new key is established."],
      E: ["Explain the function of E♯ and the relationship of the new key to A major."],
    },
    score: {
      key: "A major → F♯ minor",
      brackets: [{ start: 4, end: 7, label: "X" }],
      chords: [
        { treble: ["C#4", "A4"], bass: ["A2", "E3"] },
        { treble: ["D4", "F#4"], bass: ["D3", "A3"] },
        { treble: ["D4", "G#4"], bass: ["E3", "B3"] },
        { treble: ["C#4", "A4"], bass: ["A2", "E3"] },
        { treble: ["E4", "C#5"], bass: ["A2", "E3"] },
        { treble: ["B3", "F#4"], bass: ["B2", "F#3"] },
        { treble: ["B3", "E#4", "G#4"], bass: ["C#3", "G#3"] },
        { treble: ["C#4", "A4"], bass: ["F#2", "C#3"] },
      ],
    },
    answerHeading: "Establishing the relative minor",
    answer: [
      "<strong>Final key:</strong> F♯ minor, the relative minor of A major.",
      "<strong>Evidence:</strong> C♯7 resolves to F♯ minor in a perfect cadence. E♯ is the raised leading note of F♯ minor and the chordal third of C♯7, so it is not a non-harmonic note in that sonority.",
    ],
    criteria: {
      A: ["F♯ minor is identified as the final key."],
      M: ["The C♯7–F♯m cadence is used as precise evidence."],
      E: ["The key relationship and E♯'s function as a chord tone and raised leading note are explained accurately."],
    },
  },
  {
    id: "satb-f-c",
    category: "satb",
    family: "SATB / vocal completion",
    title: "Complete a chorale-style modulation",
    context: "Complete the alto and tenor parts on paper. The passage begins in F major and modulates to C major. Continue the style of the outer parts and use the chord indications provided.",
    tasks: {
      A: ["Supply correct chord tones for the missing parts."],
      M: ["Create a secure consecutive progression with smooth voice leading."],
      E: ["Complete the full passage convincingly, including the pivot and cadence, while avoiding part crossing and exposed parallels."],
    },
    score: {
      key: "F major → C major",
      completion: true,
      labelPosition: "bottom",
      chords: [
        { treble: ["A4", "F5"], bass: ["F2", "C3"], qTreble: ["F5"], qBass: ["F2"], givenLabel: "F: I", answerLabel: "F: I" },
        { treble: ["Bb4", "D5"], bass: ["Bb2", "F3"], qTreble: ["D5"], qBass: ["Bb2"], givenLabel: "IV", answerLabel: "IV" },
        { treble: ["Bb4", "E5"], bass: ["C3", "G3"], qTreble: ["E5"], qBass: ["C3"], givenLabel: "V⁷", answerLabel: "V⁷" },
        { treble: ["A4", "F5"], bass: ["F2", "C3"], qTreble: ["F5"], qBass: ["F2"], givenLabel: "I / C: IV", answerLabel: "I / C: IV" },
        { treble: ["B4", "F5"], bass: ["G2", "D3"], qTreble: ["F5"], qBass: ["G2"], givenLabel: "V⁷", answerLabel: "V⁷" },
        { treble: ["G4", "E5"], bass: ["C3", "C4"], qTreble: ["E5"], qBass: ["C3"], givenLabel: "I", answerLabel: "I" },
      ],
    },
    answerHeading: "One acceptable SATB realisation",
    answer: [
      "The model is one valid solution; other alto and tenor lines are possible.",
      "Check that every vertical sonority contains the required chord, the leading note B rises to C at the final cadence, chord sevenths resolve down where appropriate, and no pair of parts creates consecutive perfect fifths or octaves.",
    ],
    criteria: {
      A: ["At least four missing parts contain notes from the indicated chords."],
      M: ["At least four consecutive chords are correctly realised with generally smooth voice leading."],
      E: ["The extended passage is stylistically convincing, with a controlled cadence and no significant part-writing errors."],
    },
  },
  {
    id: "satb-gminor",
    category: "satb",
    family: "SATB / vocal completion",
    title: "Realise a minor-key cadence",
    context: "Complete the inner voices from the second chord onward. The passage is in G minor. Use the supplied Roman numerals and preserve a singable chorale texture.",
    tasks: {
      A: ["Place chord tones from the supplied harmonies in the missing voices."],
      M: ["Join the chords into a secure progression and resolve the dominant seventh correctly."],
      E: ["Produce a complete stylistic realisation with effective contrary or oblique motion into the final cadence."],
    },
    score: {
      key: "G minor",
      completion: true,
      labelPosition: "bottom",
      chords: [
        { treble: ["Bb4", "G5"], bass: ["G2", "D3"], givenLabel: "g: i", answerLabel: "g: i" },
        { treble: ["C5", "Eb5"], bass: ["Eb3", "G3"], qTreble: ["Eb5"], qBass: ["Eb3"], givenLabel: "iv⁶", answerLabel: "iv⁶" },
        { treble: ["C5", "F#5"], bass: ["D3", "A3"], qTreble: ["F#5"], qBass: ["D3"], givenLabel: "V⁷", answerLabel: "V⁷" },
        { treble: ["Bb4", "G5"], bass: ["G2", "D3"], qTreble: ["G5"], qBass: ["G2"], givenLabel: "i", answerLabel: "i" },
        { treble: ["G4", "Eb5"], bass: ["Eb3", "Bb3"], qTreble: ["Eb5"], qBass: ["Eb3"], givenLabel: "VI", answerLabel: "VI" },
        { treble: ["C5", "Eb5"], bass: ["A2", "Eb3"], qTreble: ["Eb5"], qBass: ["A2"], givenLabel: "ii°", answerLabel: "ii°" },
        { treble: ["C5", "F#5"], bass: ["D3", "A3"], qTreble: ["F#5"], qBass: ["D3"], givenLabel: "V⁷", answerLabel: "V⁷" },
        { treble: ["Bb4", "G5"], bass: ["G2", "D3"], qTreble: ["G5"], qBass: ["G2"], givenLabel: "i", answerLabel: "i" },
      ],
    },
    answerHeading: "One acceptable inner-part solution",
    answer: [
      "Other voicings are valid if they realise the same chords and maintain the style.",
      "Pay particular attention to F♯ resolving upward to G, the seventh C in D7 resolving downward, sensible spacing, and the absence of consecutive fifths and octaves.",
    ],
    criteria: {
      A: ["Several isolated chords contain the correct notes."],
      M: ["The dominant-to-tonic progressions are secure and the inner voices are mostly singable."],
      E: ["The whole phrase is convincing, accurately resolved and stylistically consistent."],
    },
  },
  {
    id: "piano-d-f",
    category: "piano",
    family: "Piano completion",
    title: "Complete the accompaniment and modulation",
    context: "Complete the bass and inner parts on paper, continuing the broken-chord style of the opening. The passage begins in D minor and closes in F major.",
    tasks: {
      A: ["Use notes belonging to the supplied chord indications."],
      M: ["Create a connected bass line and consistent accompaniment pattern."],
      E: ["Realise the entire modulation convincingly and shape the final cadence in the established piano style."],
    },
    score: {
      key: "D minor → F major",
      completion: true,
      labelPosition: "bottom",
      chords: [
        { treble: ["F4", "A4"], bass: ["D3", "A3"], givenLabel: "d: i", answerLabel: "d: i" },
        { treble: ["D4", "G4", "Bb4"], bass: ["Bb2", "F3"], qTreble: ["Bb4"], qBass: [], givenLabel: "iv⁶", answerLabel: "iv⁶" },
        { treble: ["C#4", "E4", "A4"], bass: ["A2", "E3"], qTreble: ["A4"], qBass: [], givenLabel: "V⁷", answerLabel: "V⁷" },
        { treble: ["F4", "A4"], bass: ["D3", "A3"], qTreble: ["A4"], qBass: [], givenLabel: "i / F: vi", answerLabel: "i / F: vi" },
        { treble: ["D4", "G4", "Bb4"], bass: ["G2", "D3"], qTreble: ["Bb4"], qBass: [], givenLabel: "ii", answerLabel: "ii" },
        { treble: ["E4", "G4", "Bb4"], bass: ["C3", "G3"], qTreble: ["Bb4"], qBass: [], givenLabel: "V⁷", answerLabel: "V⁷" },
        { treble: ["F4", "A4"], bass: ["F2", "C3"], qTreble: ["A4"], qBass: [], givenLabel: "I", answerLabel: "I" },
      ],
    },
    answerHeading: "Model piano realisation",
    answer: [
      "The written texture may differ from the model, but it should preserve the opening pattern and make each supplied chord audible.",
      "D minor serves as i in the opening key and vi in F major. The final G minor–C7–F progression functions as ii–V7–I in F.",
    ],
    criteria: {
      A: ["At least four individual accompaniment chords use the correct pitch collection."],
      M: ["A connected run of chords has an effective bass line and consistent texture."],
      E: ["The full extract is stylistically convincing and the modulation and cadence are clearly realised."],
    },
  },
  {
    id: "piano-a-fsharp",
    category: "piano",
    family: "Piano completion",
    title: "Continue a chordal piano texture",
    context: "Complete the piano part beneath the given melody. Continue the rhythm and spacing of the first chord. The passage moves from A major to F-sharp minor.",
    tasks: {
      A: ["Supply correct bass notes and chord tones."],
      M: ["Maintain the accompaniment pattern through consecutive chords."],
      E: ["Create a fluent extended realisation that makes the change of key and final cadence convincing."],
    },
    score: {
      key: "A major → F♯ minor",
      completion: true,
      labelPosition: "bottom",
      chords: [
        { treble: ["E4", "C#5"], bass: ["A2", "E3"], givenLabel: "A: I", answerLabel: "A: I" },
        { treble: ["F#4", "D5"], bass: ["F#2", "A3"], qTreble: ["D5"], qBass: [], givenLabel: "IV⁶", answerLabel: "IV⁶" },
        { treble: ["D4", "G#4", "B4"], bass: ["E3", "B3"], qTreble: ["B4"], qBass: [], givenLabel: "V⁷", answerLabel: "V⁷" },
        { treble: ["E4", "C#5"], bass: ["A2", "E3"], qTreble: ["C#5"], qBass: [], givenLabel: "I / f♯: III", answerLabel: "I / f♯: III" },
        { treble: ["B3", "E#4", "G#4"], bass: ["C#3", "G#3"], qTreble: ["G#4"], qBass: [], givenLabel: "V⁷", answerLabel: "V⁷" },
        { treble: ["C#4", "A4"], bass: ["F#2", "C#3"], qTreble: ["A4"], qBass: [], givenLabel: "i", answerLabel: "i" },
        { treble: ["D4", "F#4", "B4"], bass: ["B2", "F#3"], qTreble: ["B4"], qBass: [], givenLabel: "iv", answerLabel: "iv" },
        { treble: ["B3", "E#4", "G#4"], bass: ["C#3", "G#3"], qTreble: ["G#4"], qBass: [], givenLabel: "V⁷", answerLabel: "V⁷" },
        { treble: ["C#4", "A4"], bass: ["F#2", "C#3"], qTreble: ["A4"], qBass: [], givenLabel: "i", answerLabel: "i" },
      ],
    },
    answerHeading: "Model accompaniment",
    answer: [
      "A major can act as III in F♯ minor before C♯7 establishes the new dominant. Other textures are acceptable if the chord progression, bass direction and stylistic pattern remain clear.",
      "E♯ in C♯7 is the leading note of F♯ minor and should resolve upward to F♯.",
    ],
    criteria: {
      A: ["Correct bass notes or chord tones are supplied in several places."],
      M: ["The accompaniment forms a secure consecutive progression and the dominant resolves correctly."],
      E: ["The complete texture is fluent, stylistically consistent and tonally convincing."],
    },
  },
  {
    id: "jazz-c-turnaround",
    category: "jazz",
    family: "Jazz / rock notation",
    title: "Analyse an extended turnaround",
    context: "Analyse the harmony using jazz / rock notation in the boxes above the stave. The first chord is provided.",
    tasks: {
      A: ["Identify the root and quality of each individual chord."],
      M: ["Include sevenths, added notes and slash bass notes where they occur."],
      E: ["Analyse the full progression and explain the function of A7 in context."],
    },
    score: {
      key: "C major",
      blankLabels: true,
      labelPosition: "top",
      chords: [
        { treble: ["F4", "A4", "C5"], bass: ["D3"], givenLabel: "Dm7", answerLabel: "Dm7" },
        { treble: ["F4", "B4", "D5"], bass: ["G2"], answerLabel: "G7" },
        { treble: ["E4", "B4", "D5"], bass: ["C3"], answerLabel: "Cmaj7" },
        { treble: ["C#4", "G4", "B4"], bass: ["A2"], answerLabel: "A7" },
        { treble: ["F4", "A4", "C5"], bass: ["D3"], answerLabel: "Dm7" },
        { treble: ["F4", "B4", "D5"], bass: ["G2"], answerLabel: "G7" },
        { treble: ["E4", "A4", "C5"], bass: ["C3"], answerLabel: "C6" },
      ],
    },
    answerHeading: "Chord symbols and function",
    answer: [
      "<strong>Progression:</strong> Dm7 – G7 – Cmaj7 – A7 – Dm7 – G7 – C6.",
      "<strong>Function:</strong> A7 is a secondary dominant (V7 of ii). Its C♯ creates directed tension into Dm7 and extends the ii–V–I turnaround.",
    ],
    criteria: {
      A: ["At least four roots and basic chord qualities are correct."],
      M: ["A secure consecutive sequence includes the correct sevenths and alterations."],
      E: ["The full progression is accurate and A7 is explained as a secondary dominant with specific evidence."],
    },
  },
  {
    id: "jazz-e-turnaround",
    category: "jazz",
    family: "Jazz / rock notation",
    title: "Name the chords in a pop-jazz phrase",
    context: "Write a jazz / rock symbol for each chord. Include chord quality, sevenths and the final added sixth.",
    tasks: {
      A: ["Identify each chord root and whether it is major or minor."],
      M: ["Identify the consecutive progression with all sevenths."],
      E: ["Explain how the chromatic dominant extends the phrase before the final cadence."],
    },
    score: {
      key: "E major",
      blankLabels: true,
      labelPosition: "top",
      chords: [
        { treble: ["A4", "C#5", "E5"], bass: ["F#3"], givenLabel: "F♯m7", answerLabel: "F♯m7" },
        { treble: ["A4", "D#5", "F#5"], bass: ["B2"], answerLabel: "B7" },
        { treble: ["G#4", "D#5", "F#5"], bass: ["E3"], answerLabel: "Emaj7" },
        { treble: ["B3", "E#4", "G#4"], bass: ["C#3"], answerLabel: "C♯7" },
        { treble: ["A4", "C#5", "E5"], bass: ["F#3"], answerLabel: "F♯m7" },
        { treble: ["A4", "D#5", "F#5"], bass: ["B2"], answerLabel: "B7" },
        { treble: ["G#4", "C#5", "E5"], bass: ["E3"], answerLabel: "E6" },
      ],
    },
    answerHeading: "Complete chord analysis",
    answer: [
      "<strong>Progression:</strong> F♯m7 – B7 – Emaj7 – C♯7 – F♯m7 – B7 – E6.",
      "C♯7 is V7 of ii. E♯ is its chordal third and leading note into F♯; it is not a non-harmonic note in this sonority.",
    ],
    criteria: {
      A: ["Four or more basic chord identities are correct."],
      M: ["The consecutive progression includes accurate chord extensions."],
      E: ["The whole progression and the secondary-dominant function are explained accurately."],
    },
  },
  {
    id: "feature-diminished",
    category: "features",
    family: "Harmonic feature",
    title: "Explain a diminished seventh",
    context: "Identify the function of the diminished seventh chord marked X and explain its effect in the progression. Support your response with evidence from the score.",
    tasks: {
      A: ["Name the harmonic device at X."],
      M: ["Explain which chord it leads toward and how it does this."],
      E: ["Analyse its function within the larger cadence and comment on its expressive effect."],
    },
    score: {
      key: "C major",
      labelPosition: "bottom",
      brackets: [{ start: 3, end: 3, label: "X" }],
      chords: [
        { treble: ["E4", "C5"], bass: ["C3", "G3"] },
        { treble: ["C4", "A4"], bass: ["A2", "E3"] },
        { treble: ["F4", "D5"], bass: ["D3", "A3"] },
        { treble: ["C4", "Eb4", "A4"], bass: ["F#3"] },
        { treble: ["B3", "F4"], bass: ["G2", "D3"] },
        { treble: ["C4", "E4", "G4"], bass: ["C3"] },
      ],
    },
    answerHeading: "Function and effect",
    answer: [
      "<strong>X is F♯ diminished seventh:</strong> vii°7/V, a secondary leading-note chord directed toward G, the dominant of C major.",
      "F♯ rises to G while E♭ can fall to D, intensifying the arrival on V. It decorates and strengthens the dominant area, increasing tension immediately before the final G7–C perfect cadence.",
    ],
    criteria: {
      A: ["The diminished seventh is identified."],
      M: ["Its resolution toward G or the dominant is explained with note or chord evidence."],
      E: ["Its secondary function, voice-leading and role in strengthening the larger cadence are analysed."],
    },
  },
  {
    id: "feature-pedal",
    category: "features",
    family: "Tonal feature",
    title: "Analyse a tonic pedal",
    context: "Identify the harmonic device in the bass and explain how it affects tonality while the upper harmonies change.",
    tasks: {
      A: ["Identify the repeated or sustained bass note and name the device."],
      M: ["Explain how it relates to the tonic and the changing chords above."],
      E: ["Analyse the balance of stability and dissonance it creates across the phrase."],
    },
    score: {
      key: "C major",
      chords: [
        { treble: ["E4", "G4", "C5"], bass: ["C3"] },
        { treble: ["F4", "A4", "D5"], bass: ["C3"] },
        { treble: ["F4", "A4", "C5"], bass: ["C3"] },
        { treble: ["F4", "G4", "B4"], bass: ["C3"] },
        { treble: ["E4", "G4", "C5"], bass: ["C3"] },
      ],
    },
    answerHeading: "Tonic pedal analysis",
    answer: [
      "The repeated C in the bass is a <strong>tonic pedal</strong>. It anchors C major and provides tonal stability while the upper parts move through D minor, F and G-based harmonies.",
      "At moments the pedal is not part of the chord above, producing controlled dissonance. The tension is temporary, while the unchanging bass keeps the tonic present and makes the final return to C feel settled.",
    ],
    criteria: {
      A: ["C is correctly identified as a pedal note."],
      M: ["The tonic relationship and changing upper harmonies are explained."],
      E: ["The response analyses both the tonal stability and temporary dissonance, supported by score evidence."],
    },
  },
  {
    id: "feature-chromatic-bass",
    category: "features",
    family: "Harmonic feature",
    title: "Interpret a descending chromatic bass",
    context: "Analyse the bass line and explain how the harmonic rhythm and chromatic movement shape the phrase in A minor.",
    tasks: {
      A: ["Describe the direction and interval pattern of the bass line."],
      M: ["Explain how the changing chords create forward motion."],
      E: ["Analyse how chromatic descent, harmonic rhythm and the final cadence work together to control tension."],
    },
    score: {
      key: "A minor",
      chords: [
        { treble: ["C4", "E4", "A4"], bass: ["A2"] },
        { treble: ["C4", "E4", "A4"], bass: ["G#2"] },
        { treble: ["C4", "E4", "G4"], bass: ["G2"] },
        { treble: ["C4", "D#4", "A4"], bass: ["F#2"] },
        { treble: ["C4", "E4", "A4"], bass: ["F2"] },
        { treble: ["B3", "D4", "G#4"], bass: ["E2"] },
        { treble: ["C4", "E4", "A4"], bass: ["A2"] },
      ],
    },
    answerHeading: "Chromatic motion and tonal direction",
    answer: [
      "The bass descends chromatically A–G♯–G–F♯–F–E before returning to A. The semitone motion gives the phrase continuous direction even while several upper notes are retained.",
      "One chord per beat increases harmonic momentum. The line reaches E7, the dominant seventh of A minor, before resolving to the tonic; therefore the chromatic sequence intensifies rather than weakens the final tonal arrival.",
    ],
    criteria: {
      A: ["The chromatically descending bass is accurately described."],
      M: ["The response explains how chord changes create momentum."],
      E: ["The interaction of bass, harmonic rhythm, dominant function and final resolution is analysed with precise evidence."],
    },
  },
];

const categoryNames = {
  mixed: "Mixed practice",
  analysis: "Roman numeral analysis",
  modulation: "Keys and modulation",
  satb: "SATB / vocal completion",
  piano: "Piano completion",
  jazz: "Jazz / rock notation",
  features: "Harmonic or tonal feature",
};

const levelOrder = { achievement: 1, merit: 2, excellence: 3 };
const levelLetters = { achievement: "A", merit: "M", excellence: "E" };
const levelNames = { achievement: "Achievement", merit: "Merit", excellence: "Excellence" };

let currentQuestion = null;
let setNumber = 0;
let lastQuestionId = null;

const categorySelect = document.querySelector("#category");
const difficultySelect = document.querySelector("#difficulty");
const answerPanel = document.querySelector("#answer-panel");
const revealButton = document.querySelector("#reveal-answer");

function escapeText(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function chooseQuestion() {
  const category = categorySelect.value;
  const pool = category === "mixed" ? questionBank : questionBank.filter((q) => q.category === category);
  let candidates = pool.filter((q) => q.id !== lastQuestionId);
  if (!candidates.length) candidates = pool;
  const picked = candidates[Math.floor(Math.random() * candidates.length)];
  lastQuestionId = picked.id;
  return picked;
}

function visibleTasks(question, difficulty) {
  const max = levelOrder[difficulty];
  return ["A", "M", "E"].flatMap((level, index) => index + 1 <= max ? question.tasks[level] : []);
}

function renderQuestion() {
  currentQuestion = chooseQuestion();
  setNumber += 1;
  const difficulty = difficultySelect.value;
  const difficultyName = levelNames[difficulty];

  document.querySelector("#question-family").textContent = currentQuestion.family;
  document.querySelector("#question-title").textContent = currentQuestion.title;
  document.querySelector("#question-context").textContent = currentQuestion.context;
  document.querySelector("#difficulty-chip").textContent = `Target: ${difficultyName}`;
  document.querySelector("#variant-chip").textContent = `Practice set ${String(setNumber).padStart(2, "0")}`;
  document.querySelector("#task-list").innerHTML = visibleTasks(currentQuestion, difficulty)
    .map((task) => `<li>${escapeText(task)}</li>`)
    .join("");

  document.querySelector("#answer-heading").textContent = currentQuestion.answerHeading;
  document.querySelector("#answer-copy").innerHTML = currentQuestion.answer.map((line) => `<p>${line}</p>`).join("");
  document.querySelector("#writing-space").style.height = ["satb", "piano"].includes(currentQuestion.category) ? "70px" : "154px";

  answerPanel.hidden = true;
  revealButton.innerHTML = '<span aria-hidden="true">◉</span> Reveal answer and guide';
  buildCriteria(currentQuestion, difficulty);
  drawScore(document.querySelector("#score"), currentQuestion.score, false);
  const modelWrap = document.querySelector("#model-score-wrap");
  modelWrap.hidden = false;
  drawScore(document.querySelector("#model-score"), currentQuestion.score, true);
}

function buildCriteria(question, difficulty) {
  const max = levelOrder[difficulty];
  const grid = document.querySelector("#criteria-grid");
  const rows = [];
  ["A", "M", "E"].forEach((level, index) => {
    if (index + 1 > max) return;
    question.criteria[level].forEach((text, criterionIndex) => {
      rows.push(`
        <label class="criterion">
          <input type="checkbox" data-level="${level}" data-criterion="${criterionIndex}" />
          <span class="level-tag level-${level}">${level}</span>
          <span>${escapeText(text)}</span>
        </label>
      `);
    });
  });
  grid.innerHTML = rows.join("");
  grid.querySelectorAll("input").forEach((input) => input.addEventListener("change", updateResult));
  updateResult();
}

function updateResult() {
  const inputs = [...document.querySelectorAll("#criteria-grid input")];
  const present = new Set(inputs.map((input) => input.dataset.level));
  const complete = (level) => {
    const group = inputs.filter((input) => input.dataset.level === level);
    return group.length > 0 && group.every((input) => input.checked);
  };
  let result = "Not yet secure";
  let className = "";
  let note = "Tick only the statements you can support from your written work.";
  if (complete("A")) {
    result = "Likely Achievement";
    className = "achieved";
    note = "Your isolated harmonic evidence is secure. Check the Merit statements to see whether it forms a convincing sequence.";
  }
  if (complete("A") && (!present.has("M") || complete("M"))) {
    if (present.has("M")) {
      result = "Likely Merit";
      className = "merit";
      note = "Your consecutive analysis or realisation is secure. Excellence requires the extended response to remain convincing.";
    }
  }
  if (complete("A") && complete("M") && complete("E")) {
    result = "Likely Excellence";
    className = "excellence";
    note = "Your checklist supports an extended, convincing response. Compare the details once more before accepting the judgement.";
  }
  const badge = document.querySelector("#result-badge");
  badge.textContent = result;
  badge.className = `result-badge ${className}`.trim();
  document.querySelector("#judgement-note").textContent = note;
}

function parsePitch(pitch) {
  const match = /^([A-G])([#b]?)(-?\d)$/.exec(pitch);
  if (!match) return null;
  const letters = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };
  return { letter: match[1], accidental: match[2], octave: Number(match[3]), index: Number(match[3]) * 7 + letters[match[1]] };
}

function pitchY(pitch, clef) {
  const parsed = parsePitch(pitch);
  if (!parsed) return 100;
  const baseIndex = clef === "treble" ? 30 : 18;
  const baseY = clef === "treble" ? 108 : 222;
  return baseY - (parsed.index - baseIndex) * 5.2;
}

function svgEl(name, attrs = {}, text = null) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", name);
  Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
  if (text !== null) el.textContent = text;
  return el;
}

function drawLedgerLines(svg, x, y, clef) {
  const top = clef === "treble" ? 66 : 180;
  const bottom = clef === "treble" ? 108 : 222;
  if (y < top - 2) {
    for (let lineY = top - 10.4; lineY >= y - 1; lineY -= 10.4) {
      svg.appendChild(svgEl("line", { x1: x - 11, y1: lineY, x2: x + 11, y2: lineY, stroke: "#172033", "stroke-width": 1.25 }));
    }
  }
  if (y > bottom + 2) {
    for (let lineY = bottom + 10.4; lineY <= y + 1; lineY += 10.4) {
      svg.appendChild(svgEl("line", { x1: x - 11, y1: lineY, x2: x + 11, y2: lineY, stroke: "#172033", "stroke-width": 1.25 }));
    }
  }
}

function drawNote(svg, x, pitch, clef, stemDirection = "up") {
  const parsed = parsePitch(pitch);
  const y = pitchY(pitch, clef);
  drawLedgerLines(svg, x, y, clef);
  if (parsed?.accidental) {
    const symbol = parsed.accidental === "#" ? "♯" : "♭";
    svg.appendChild(svgEl("text", { x: x - 18, y: y + 5, "font-family": "Georgia, serif", "font-size": 18, fill: "#172033" }, symbol));
  }
  svg.appendChild(svgEl("ellipse", { cx: x, cy: y, rx: 8, ry: 5.5, fill: "#172033", transform: `rotate(-18 ${x} ${y})` }));
  const up = stemDirection === "up";
  svg.appendChild(svgEl("line", { x1: up ? x + 7 : x - 7, y1: y, x2: up ? x + 7 : x - 7, y2: up ? y - 32 : y + 32, stroke: "#172033", "stroke-width": 1.5 }));
}

function drawScore(svg, score, showAnswer) {
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  svg.appendChild(svgEl("rect", { width: 1000, height: 300, fill: "#ffffff" }));
  svg.appendChild(svgEl("text", { x: 30, y: 28, fill: "#526071", "font-size": 15, "font-family": "Inter, sans-serif", "font-weight": 700 }, `Original practice extract • ${score.key}`));

  const left = 58;
  const right = 968;
  [66, 76.5, 87, 97.5, 108, 180, 190.5, 201, 211.5, 222].forEach((y) => {
    svg.appendChild(svgEl("line", { x1: left, y1: y, x2: right, y2: y, stroke: "#172033", "stroke-width": 1.15 }));
  });
  svg.appendChild(svgEl("line", { x1: left, y1: 66, x2: left, y2: 222, stroke: "#172033", "stroke-width": 2 }));
  svg.appendChild(svgEl("text", { x: 64, y: 106, fill: "#172033", "font-size": 48, "font-family": "Bravura, Noto Music, Georgia, serif" }, "𝄞"));
  svg.appendChild(svgEl("text", { x: 65, y: 218, fill: "#172033", "font-size": 46, "font-family": "Bravura, Noto Music, Georgia, serif" }, "𝄢"));
  svg.appendChild(svgEl("text", { x: 104, y: 91, fill: "#172033", "font-size": 20, "font-family": "Georgia, serif", "font-weight": 700 }, "4"));
  svg.appendChild(svgEl("text", { x: 104, y: 108, fill: "#172033", "font-size": 20, "font-family": "Georgia, serif", "font-weight": 700 }, "4"));
  svg.appendChild(svgEl("text", { x: 104, y: 205, fill: "#172033", "font-size": 20, "font-family": "Georgia, serif", "font-weight": 700 }, "4"));
  svg.appendChild(svgEl("text", { x: 104, y: 222, fill: "#172033", "font-size": 20, "font-family": "Georgia, serif", "font-weight": 700 }, "4"));

  const startX = 155;
  const usable = 780;
  const spacing = score.chords.length > 1 ? usable / (score.chords.length - 1) : usable;

  score.chords.forEach((chord, index) => {
    const x = startX + spacing * index;
    const treble = showAnswer ? chord.treble : (Object.hasOwn(chord, "qTreble") ? chord.qTreble : chord.treble);
    const bass = showAnswer ? chord.bass : (Object.hasOwn(chord, "qBass") ? chord.qBass : chord.bass);
    (treble || []).forEach((pitch, noteIndex) => drawNote(svg, x + noteIndex * 1.8, pitch, "treble", noteIndex === 0 ? "down" : "up"));
    (bass || []).forEach((pitch, noteIndex) => drawNote(svg, x + noteIndex * 1.8, pitch, "bass", noteIndex === 0 ? "down" : "up"));

    if ((!bass || bass.length === 0) && score.completion && !showAnswer) {
      svg.appendChild(svgEl("text", { x: x - 8, y: 207, fill: "#9aa4b2", "font-size": 23, "font-family": "Georgia, serif" }, "𝄽"));
    }

    const label = showAnswer ? chord.answerLabel : chord.givenLabel;
    const labelY = score.labelPosition === "top" ? 52 : 267;
    if (label) {
      svg.appendChild(svgEl("text", { x, y: labelY, fill: showAnswer ? "#08775c" : "#172033", "font-size": 16, "font-family": "Georgia, serif", "font-weight": 700, "text-anchor": "middle" }, label));
    } else if (score.blankLabels) {
      svg.appendChild(svgEl("rect", { x: x - 29, y: labelY - 18, width: 58, height: 25, rx: 4, fill: "#f8fafc", stroke: "#9aa4b2", "stroke-width": 1.2 }));
    }

    if (index > 0 && index % 2 === 0) {
      const barX = x - spacing / 2;
      svg.appendChild(svgEl("line", { x1: barX, y1: 66, x2: barX, y2: 108, stroke: "#172033", "stroke-width": 1.25 }));
      svg.appendChild(svgEl("line", { x1: barX, y1: 180, x2: barX, y2: 222, stroke: "#172033", "stroke-width": 1.25 }));
    }
  });

  (score.brackets || []).forEach((bracket) => {
    const x1 = startX + spacing * bracket.start - 26;
    const x2 = startX + spacing * bracket.end + 26;
    svg.appendChild(svgEl("path", { d: `M ${x1} 43 v -8 H ${x2} v 8`, fill: "none", stroke: "#2563eb", "stroke-width": 2 }));
    svg.appendChild(svgEl("rect", { x: (x1 + x2) / 2 - 12, y: 18, width: 24, height: 22, rx: 5, fill: "#dbeafe" }));
    svg.appendChild(svgEl("text", { x: (x1 + x2) / 2, y: 34, fill: "#1e3a8a", "font-size": 14, "font-family": "Inter, sans-serif", "font-weight": 900, "text-anchor": "middle" }, bracket.label));
  });

  svg.appendChild(svgEl("line", { x1: right - 4, y1: 66, x2: right - 4, y2: 108, stroke: "#172033", "stroke-width": 3 }));
  svg.appendChild(svgEl("line", { x1: right, y1: 66, x2: right, y2: 108, stroke: "#172033", "stroke-width": 1 }));
  svg.appendChild(svgEl("line", { x1: right - 4, y1: 180, x2: right - 4, y2: 222, stroke: "#172033", "stroke-width": 3 }));
  svg.appendChild(svgEl("line", { x1: right, y1: 180, x2: right, y2: 222, stroke: "#172033", "stroke-width": 1 }));
}

document.querySelector("#new-question").addEventListener("click", renderQuestion);
categorySelect.addEventListener("change", renderQuestion);
difficultySelect.addEventListener("change", renderQuestion);
revealButton.addEventListener("click", () => {
  const willShow = answerPanel.hidden;
  answerPanel.hidden = !willShow;
  revealButton.innerHTML = willShow
    ? '<span aria-hidden="true">×</span> Hide answer'
    : '<span aria-hidden="true">◉</span> Reveal answer and guide';
  if (willShow) answerPanel.scrollIntoView({ behavior: "smooth", block: "start" });
});
document.querySelector("#print-question").addEventListener("click", () => window.print());

renderQuestion();
