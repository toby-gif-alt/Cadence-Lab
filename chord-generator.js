(function () {
  "use strict";

  const catalog = Object.freeze([
    { key: "C major", keySignature: "C", root: "C", formula: "major", tones: ["C", "E", "G"] },
    { key: "C major", keySignature: "C", root: "D", formula: "minor-seventh", tones: ["D", "F", "A", "C"] },
    { key: "C major", keySignature: "C", root: "G", formula: "dominant-flat-nine", tones: ["G", "Ab", "B", "D", "F"] },
    { key: "C major", keySignature: "C", root: "C", formula: "sixth", tones: ["C", "E", "G", "A"], fixedBass: "E" },
    { key: "C major", keySignature: "C", root: "C", formula: "six-add-nine", tones: ["C", "D", "E", "G", "A"], fixedBass: "E" },
    { key: "C major", keySignature: "C", root: "G", formula: "suspended-four", tones: ["G", "C", "D"], fixedBass: "D" },
    { key: "G major", keySignature: "G", root: "G", formula: "major-seventh", tones: ["G", "B", "D", "F#"] },
    { key: "G major", keySignature: "G", root: "A", formula: "minor-ninth", tones: ["A", "B", "C", "E", "G"] },
    { key: "G major", keySignature: "G", root: "D", formula: "dominant-thirteenth", tones: ["D", "E", "F#", "A", "B", "C"], fixedBass: "F#" },
    { key: "G major", keySignature: "G", root: "B", formula: "half-diminished", tones: ["B", "D", "F", "A"], fixedBass: "D" },
    { key: "G major", keySignature: "G", root: "A", formula: "suspended-two", tones: ["A", "B", "E"], fixedBass: "E" },
    { key: "D major", keySignature: "D", root: "D", formula: "sixth", tones: ["D", "F#", "A", "B"] },
    { key: "D major", keySignature: "D", root: "E", formula: "add-nine", tones: ["E", "F#", "G#", "B"] },
    { key: "D major", keySignature: "D", root: "A", formula: "dominant-seventh", tones: ["A", "C#", "E", "G"] },
    { key: "D major", keySignature: "D", root: "G", formula: "add-nine", tones: ["G", "A", "B", "D"], fixedBass: "B" },
    { key: "F major", keySignature: "F", root: "F", formula: "major-ninth", tones: ["F", "G", "A", "C", "E"], fixedBass: "A" },
    { key: "F major", keySignature: "F", root: "G", formula: "minor-ninth", tones: ["G", "A", "Bb", "D", "F"], fixedBass: "Bb" },
    { key: "F major", keySignature: "F", root: "C", formula: "dominant-eleventh", tones: ["C", "D", "E", "F", "G", "Bb"], fixedBass: "E" },
    { key: "F major", keySignature: "F", root: "Bb", formula: "major-seventh", tones: ["Bb", "D", "F", "A"], fixedBass: "D" },
    { key: "B♭ major", keySignature: "Bb", root: "Bb", formula: "major", tones: ["Bb", "D", "F"] },
    { key: "B♭ major", keySignature: "Bb", root: "C", formula: "minor-seventh", tones: ["C", "Eb", "G", "Bb"] },
    { key: "B♭ major", keySignature: "Bb", root: "F", formula: "dominant-thirteenth", tones: ["F", "G", "A", "C", "D", "Eb"], fixedBass: "A" },
    { key: "B♭ major", keySignature: "Bb", root: "D", formula: "diminished-seventh", tones: ["D", "F", "Ab", "Cb"], fixedBass: "F" },
    { key: "A minor", keySignature: "Am", root: "A", formula: "minor", tones: ["A", "C", "E"] },
    { key: "A minor", keySignature: "Am", root: "B", formula: "half-diminished", tones: ["B", "D", "F", "A"], fixedBass: "D" },
    { key: "A minor", keySignature: "Am", root: "E", formula: "dominant-sharp-nine", tones: ["E", "F##", "G#", "B", "D"], fixedBass: "G#" },
    { key: "A minor", keySignature: "Am", root: "F", formula: "major-ninth", tones: ["F", "G", "A", "C", "E"], fixedBass: "A" },
    { key: "E minor", keySignature: "Em", root: "E", formula: "minor-sixth", tones: ["E", "G", "B", "C#"] },
    { key: "E minor", keySignature: "Em", root: "F#", formula: "diminished-seventh", tones: ["F#", "A", "C", "Eb"], fixedBass: "A" },
    { key: "E minor", keySignature: "Em", root: "B", formula: "dominant-flat-nine", tones: ["B", "C", "D#", "F#", "A"], fixedBass: "D#" },
    { key: "E minor", keySignature: "Em", root: "C", formula: "major-seventh", tones: ["C", "E", "G", "B"], fixedBass: "E" },
    { key: "D minor", keySignature: "Dm", root: "D", formula: "minor-sixth", tones: ["D", "F", "A", "B"], fixedBass: "F" },
    { key: "D minor", keySignature: "Dm", root: "E", formula: "diminished-seventh", tones: ["E", "G", "Bb", "Db"], fixedBass: "G" },
    { key: "D minor", keySignature: "Dm", root: "A", formula: "dominant-sharp-eleven", tones: ["A", "C#", "D#", "E", "G"], fixedBass: "C#" },
    { key: "D minor", keySignature: "Dm", root: "G", formula: "minor-ninth", tones: ["G", "A", "Bb", "D", "F"], fixedBass: "Bb" },
  ]);

  const formulaToneSpecs = Object.freeze({
    major: [[0, 0], [2, 4], [4, 7]],
    minor: [[0, 0], [2, 3], [4, 7]],
    sixth: [[0, 0], [2, 4], [4, 7], [5, 9]],
    "minor-sixth": [[0, 0], [2, 3], [4, 7], [5, 9]],
    "dominant-seventh": [[0, 0], [2, 4], [4, 7], [6, 10]],
    "major-seventh": [[0, 0], [2, 4], [4, 7], [6, 11]],
    "minor-seventh": [[0, 0], [2, 3], [4, 7], [6, 10]],
    "dominant-ninth": [[0, 0], [1, 2], [2, 4], [4, 7], [6, 10]],
    "major-ninth": [[0, 0], [1, 2], [2, 4], [4, 7], [6, 11]],
    "minor-ninth": [[0, 0], [1, 2], [2, 3], [4, 7], [6, 10]],
    "dominant-eleventh": [[0, 0], [1, 2], [2, 4], [3, 5], [4, 7], [6, 10]],
    "dominant-thirteenth": [[0, 0], [1, 2], [2, 4], [4, 7], [5, 9], [6, 10]],
    "dominant-flat-nine": [[0, 0], [1, 1], [2, 4], [4, 7], [6, 10]],
    "dominant-sharp-nine": [[0, 0], [1, 3], [2, 4], [4, 7], [6, 10]],
    "dominant-sharp-eleven": [[0, 0], [2, 4], [3, 6], [4, 7], [6, 10]],
    "thirteenth-flat-nine": [[0, 0], [1, 1], [2, 4], [4, 7], [5, 9], [6, 10]],
    "add-nine": [[0, 0], [1, 2], [2, 4], [4, 7]],
    "six-add-nine": [[0, 0], [1, 2], [2, 4], [4, 7], [5, 9]],
    "suspended-two": [[0, 0], [1, 2], [4, 7]],
    "suspended-four": [[0, 0], [3, 5], [4, 7]],
    diminished: [[0, 0], [2, 3], [4, 6]],
    "diminished-seventh": [[0, 0], [2, 3], [4, 6], [6, 9]],
    "half-diminished": [[0, 0], [2, 3], [4, 6], [6, 10]],
  });

  function seedNumber(value) {
    return [...String(value || "cadence-lab")].reduce(
      (seed, character) => Math.imul(seed ^ character.charCodeAt(0), 16777619) >>> 0,
      2166136261
    );
  }

  function randomFromSeed(seedText) {
    let state = seedNumber(seedText) || 1;
    return function () {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      return (state >>> 0) / 4294967296;
    };
  }

  function displayPitch(value) {
    return String(value).replaceAll("#", "♯").replaceAll("b", "♭");
  }

  function pitchWithOctave(name, octave) {
    return `${name}${octave}`;
  }

  function chooseEntries(random, count) {
    const pool = [...catalog];
    const result = [];
    while (result.length < count) {
      const index = Math.floor(random() * pool.length);
      result.push(pool.splice(index, 1)[0]);
    }
    return result;
  }

  function semanticChord(entry, random) {
    const bass = entry.fixedBass || entry.tones[Math.floor(random() * entry.tones.length)];
    return {
      ...window.CadenceStructuredAnswer.semanticJazzChord(
        displayPitch(entry.root),
        entry.formula,
        bass === entry.root ? "" : displayPitch(bass)
      ),
      bassPitch: bass,
    };
  }

  function chordEvent(entry, chord) {
    const symbol = window.CadenceStructuredAnswer.formatJazzChord(chord);
    return {
      treble: entry.tones.map((pitch, index) => pitchWithOctave(pitch, index > 3 ? 5 : 4)),
      bass: [pitchWithOctave(chord.bassPitch, 2)],
      duration: "w",
      expectedChordSymbol: symbol,
      acceptableChordSymbols: [symbol],
      generatedSemanticChord: {
        root: chord.root,
        quality: chord.quality,
        extension: chord.extension,
        alteration: chord.alteration,
        addition: chord.addition,
        formula: chord.formula,
        bass: chord.bass,
      },
      generatedSourceSpec: {
        root: entry.root,
        formula: entry.formula,
        tones: [...entry.tones],
        bass: chord.bassPitch,
      },
    };
  }

  function pitchName(value) {
    return String(value).replace(/-?\d+$/, "");
  }

  function validateCatalogEntry(entry) {
    const expected = formulaToneSpecs[entry.formula];
    if (!expected || entry.tones.length !== expected.length) return false;
    const renderer = window.CadenceScoreRenderer;
    const root = renderer.parsePitch(`${entry.root}4`);
    const rootLetter = "CDEFGAB".indexOf(entry.root[0].toUpperCase());
    const rootPitchClass = renderer.pitchClass(root);
    const actual = entry.tones.map((tone) => {
      const pitch = renderer.parsePitch(`${tone}4`);
      const letter = "CDEFGAB".indexOf(tone[0].toUpperCase());
      return [
        (letter - rootLetter + 7) % 7,
        (renderer.pitchClass(pitch) - rootPitchClass + 12) % 12,
      ];
    });
    return expected.every(([degree, semitones]) =>
      actual.some(([actualDegree, actualSemitones]) =>
        actualDegree === degree && actualSemitones === semitones
      )
    );
  }

  function makeVariantId(seedText) {
    return `CID-${seedNumber(seedText).toString(36).toUpperCase().padStart(7, "0").slice(-7)}`;
  }

  function create(seedText) {
    const seed = String(seedText || "cadence-lab-default");
    const random = randomFromSeed(seed);
    const entries = chooseEntries(random, 4);
    const chords = entries.map((entry) => semanticChord(entry, random));
    const symbols = chords.map((chord) => window.CadenceStructuredAnswer.formatJazzChord(chord));
    const measures = entries.map((entry, index) => ({
      keySignature: entry.keySignature,
      events: [chordEvent(entry, chords[index])],
      endBarline: index === entries.length - 1 ? "final" : undefined,
    }));
    const distractors = catalog
      .map((entry, index) => {
        const chord = semanticChord(entry, () => (index % entry.tones.length) / entry.tones.length);
        return window.CadenceStructuredAnswer.formatJazzChord(chord);
      })
      .filter((label, index, all) => !symbols.includes(label) && all.indexOf(label) === index)
      .slice(0, 6);
    const variantId = makeVariantId(seed);
    const slots = symbols.map((symbol, index) => ({
      id: `generated-chord-${index + 1}`,
      harmonicIndex: index,
      label: `Chord ${index + 1}`,
      acceptedAnswers: [{ label: symbol }],
    }));
    return {
      id: `generated-${variantId.toLowerCase()}`,
      variantId,
      generatorSeed: seed,
      category: "chord-identification",
      sourceType: "generated-practice",
      source: {
        creator: "Cadence Lab",
        title: "Controlled chord-identification generator",
        acknowledgement: "Controlled, independent generated practice.",
      },
      family: "Chord identification",
      internalTitle: "Generated vertical-chord identification",
      studentTitle: "Generated practice: identify four chords",
      studentContext: "Identify each independently voiced chord using a complete jazz or popular-music chord symbol. Include any inversion or non-root bass.",
      hiddenConceptTerms: [],
      score: {
        key: entries.map((entry) => entry.key).join(" · "),
        keySignature: entries[0].keySignature,
        timeSignature: "4/4",
        layout: "piano",
        measuresPerSystem: 4,
        studentCaption: `Generated Cadence Lab practice • ${variantId}`,
        accessibleLabel: "Four generated vertical chords for chord-symbol identification.",
        measures,
        harmonicEvents: symbols.map((symbol, index) => ({
          measure: index + 1,
          beat: 1,
          event: 0,
          analysisBox: true,
          answerRole: "editable",
          answerSlotId: slots[index].id,
          modelLabel: symbol,
          chordSymbol: symbol,
        })),
      },
      interaction: {
        type: "jazz-chord-placement",
        allowPaper: true,
        seed: `${seed}-hint-bank`,
        slots,
        bank: [...symbols, ...distractors].map((label, index) => ({
          id: `${variantId}-token-${index + 1}`,
          label,
        })),
        advancedBuilder: true,
        hintBank: true,
      },
      tasks: {
        A: ["Identify the root and basic quality of all four chords."],
        M: ["Include sevenths, extensions, alterations and suspensions where present."],
        E: ["Give each complete symbol, including the exact slash bass or inversion where required."],
      },
      criteria: {
        A: ["The chord roots and core qualities are identified accurately."],
        M: ["The symbols preserve the defining extensions, additions, alterations or suspensions."],
        E: ["All four complete symbols match the displayed spellings and bass notes."],
      },
      answerHeading: "Generated chord-identification model",
      answer: [
        `Accepted symbols: ${symbols.join(" · ")}.`,
        "Each answer is derived from the same semantic chord object that generated its displayed pitches and bass note.",
      ],
    };
  }

  function validateVariant(question) {
    const normalized = window.CadenceScoreRenderer.normalizeMeasures(question.score);
    return normalized.measures.every((measure, index) => {
      const event = measure.events[0];
      const expected = question.interaction.slots[index].acceptedAnswers[0].label;
      const sourceSpec = event.generatedSourceSpec;
      const semantic = event.generatedSemanticChord;
      const trebleSpellings = event.treble.map(pitchName);
      const bassSpelling = pitchName(event.bass[0]);
      return event.expectedChordSymbol === expected &&
        JSON.stringify(trebleSpellings) === JSON.stringify(sourceSpec.tones) &&
        bassSpelling === sourceSpec.bass &&
        validateCatalogEntry(sourceSpec) &&
        semantic.formula === sourceSpec.formula &&
        semantic.root === displayPitch(sourceSpec.root) &&
        (semantic.bass || semantic.root) === displayPitch(sourceSpec.bass) &&
        window.CadenceScoreRenderer.validateChordIdentification(event, expected).valid;
    });
  }

  window.CadenceChordGenerator = Object.freeze({
    catalog,
    create,
    makeVariantId,
    randomFromSeed,
    validateCatalogEntry,
    validateVariant,
  });
})();
