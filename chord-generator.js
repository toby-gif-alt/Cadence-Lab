(function () {
  "use strict";

  function catalogEntry(value) {
    const {
      competingRoots = [],
      acceptedAlternatives = [],
      minRootOccurrences = 2,
      maxCompetingRootOccurrences = 1,
      contextualStrength = "strong",
      ...entry
    } = value;
    return Object.freeze({
      ...entry,
      allowedBasses: Object.freeze([...(entry.allowedBasses || [])]),
      tones: Object.freeze([...entry.tones]),
      harmonicIdentity: Object.freeze({
        intendedRoot: entry.root,
        keyContext: entry.key,
        requiredTones: Object.freeze([...entry.tones]),
        minRootOccurrences,
        competingRoots: Object.freeze([...competingRoots]),
        maxCompetingRootOccurrences,
        contextualStrength,
        acceptedAlternatives: Object.freeze([...acceptedAlternatives]),
      }),
    });
  }

  const catalog = Object.freeze([
    catalogEntry({ key: "C major", keySignature: "C", root: "C", formula: "major", tones: ["C", "E", "G"], allowedBasses: ["C"] }),
    catalogEntry({ key: "C major", keySignature: "C", root: "D", formula: "minor-seventh", tones: ["D", "F", "A", "C"], allowedBasses: ["D"], competingRoots: ["F"] }),
    catalogEntry({ key: "C major", keySignature: "C", root: "G", formula: "dominant-flat-nine", tones: ["G", "Ab", "B", "D", "F"], allowedBasses: ["G"] }),
    catalogEntry({ key: "C major", keySignature: "C", root: "C", formula: "sixth", tones: ["C", "E", "G", "A"], allowedBasses: ["C", "E"], competingRoots: ["A"] }),
    catalogEntry({ key: "C major", keySignature: "C", root: "C", formula: "six-add-nine", tones: ["C", "D", "E", "G", "A"], allowedBasses: ["C", "E"] }),
    catalogEntry({ key: "C major", keySignature: "C", root: "G", formula: "suspended-four", tones: ["G", "C", "D"], allowedBasses: ["D"], competingRoots: ["C"] }),
    catalogEntry({ key: "G major", keySignature: "G", root: "G", formula: "major-seventh", tones: ["G", "B", "D", "F#"], allowedBasses: ["G", "B"] }),
    catalogEntry({ key: "G major", keySignature: "G", root: "A", formula: "minor-ninth", tones: ["A", "B", "C", "E", "G"], allowedBasses: ["A"] }),
    catalogEntry({ key: "G major", keySignature: "G", root: "D", formula: "dominant-thirteenth", tones: ["D", "E", "F#", "A", "B", "C"], allowedBasses: ["F#"] }),
    catalogEntry({ key: "G major", keySignature: "G", root: "B", formula: "half-diminished", tones: ["B", "D", "F", "A"], allowedBasses: ["D"], competingRoots: ["D"] }),
    catalogEntry({ key: "G major", keySignature: "G", root: "E", formula: "suspended-four", tones: ["E", "A", "B"], allowedBasses: ["E"], competingRoots: ["A"] }),
    catalogEntry({ key: "D major", keySignature: "D", root: "D", formula: "sixth", tones: ["D", "F#", "A", "B"], allowedBasses: ["D"], competingRoots: ["B"] }),
    catalogEntry({ key: "D major", keySignature: "D", root: "E", formula: "add-nine", tones: ["E", "F#", "G#", "B"], allowedBasses: ["E"] }),
    catalogEntry({ key: "D major", keySignature: "D", root: "A", formula: "dominant-seventh", tones: ["A", "C#", "E", "G"], allowedBasses: ["A"] }),
    catalogEntry({ key: "D major", keySignature: "D", root: "G", formula: "add-nine", tones: ["G", "A", "B", "D"], allowedBasses: ["B"] }),
    catalogEntry({ key: "F major", keySignature: "F", root: "F", formula: "major-ninth", tones: ["F", "G", "A", "C", "E"], allowedBasses: ["A"] }),
    catalogEntry({ key: "F major", keySignature: "F", root: "G", formula: "minor-ninth", tones: ["G", "A", "Bb", "D", "F"], allowedBasses: ["G", "Bb"] }),
    catalogEntry({ key: "F major", keySignature: "F", root: "C", formula: "dominant-eleventh", tones: ["C", "D", "E", "F", "G", "Bb"], allowedBasses: ["E"] }),
    catalogEntry({ key: "F major", keySignature: "F", root: "Bb", formula: "major-seventh", tones: ["Bb", "D", "F", "A"], allowedBasses: ["D"] }),
    catalogEntry({ key: "B♭ major", keySignature: "Bb", root: "Bb", formula: "major", tones: ["Bb", "D", "F"], allowedBasses: ["Bb"] }),
    catalogEntry({ key: "B♭ major", keySignature: "Bb", root: "C", formula: "minor-seventh", tones: ["C", "Eb", "G", "Bb"], allowedBasses: ["C"], competingRoots: ["Eb"] }),
    catalogEntry({ key: "B♭ major", keySignature: "Bb", root: "F", formula: "dominant-thirteenth", tones: ["F", "G", "A", "C", "D", "Eb"], allowedBasses: ["A"] }),
    catalogEntry({ key: "B♭ major", keySignature: "Bb", root: "D", formula: "diminished-seventh", tones: ["D", "F", "Ab", "Cb"], allowedBasses: ["F"], competingRoots: ["F", "Ab", "Cb"] }),
    catalogEntry({ key: "A minor", keySignature: "Am", root: "A", formula: "minor", tones: ["A", "C", "E"], allowedBasses: ["A"] }),
    catalogEntry({ key: "A minor", keySignature: "Am", root: "B", formula: "half-diminished", tones: ["B", "D", "F", "A"], allowedBasses: ["D"], competingRoots: ["D"] }),
    catalogEntry({ key: "A minor", keySignature: "Am", root: "E", formula: "dominant-sharp-nine", tones: ["E", "F##", "G#", "B", "D"], allowedBasses: ["G#"] }),
    catalogEntry({ key: "A minor", keySignature: "Am", root: "F", formula: "major-ninth", tones: ["F", "G", "A", "C", "E"], allowedBasses: ["A"] }),
    catalogEntry({ key: "E minor", keySignature: "Em", root: "E", formula: "minor-sixth", tones: ["E", "G", "B", "C#"], allowedBasses: ["E"], competingRoots: ["C#"] }),
    catalogEntry({ key: "E minor", keySignature: "Em", root: "F#", formula: "diminished-seventh", tones: ["F#", "A", "C", "Eb"], allowedBasses: ["A"], competingRoots: ["A", "C", "Eb"] }),
    catalogEntry({ key: "E minor", keySignature: "Em", root: "B", formula: "dominant-flat-nine", tones: ["B", "C", "D#", "F#", "A"], allowedBasses: ["D#"] }),
    catalogEntry({ key: "E minor", keySignature: "Em", root: "C", formula: "major-seventh", tones: ["C", "E", "G", "B"], allowedBasses: ["E"] }),
    catalogEntry({ key: "D minor", keySignature: "Dm", root: "D", formula: "minor-sixth", tones: ["D", "F", "A", "B"], allowedBasses: ["D", "F"], competingRoots: ["B"] }),
    catalogEntry({ key: "D minor", keySignature: "Dm", root: "E", formula: "diminished-seventh", tones: ["E", "G", "Bb", "Db"], allowedBasses: ["G"], competingRoots: ["G", "Bb", "Db"] }),
    catalogEntry({ key: "D minor", keySignature: "Dm", root: "A", formula: "dominant-sharp-eleven", tones: ["A", "C#", "D#", "E", "G"], allowedBasses: ["C#"] }),
    catalogEntry({ key: "D minor", keySignature: "Dm", root: "G", formula: "minor-ninth", tones: ["G", "A", "Bb", "D", "F"], allowedBasses: ["Bb"] }),
  ]);

  const intentionalAmbiguityFixture = catalogEntry({
    key: "neutral C key signature",
    keySignature: "C",
    root: "D",
    formula: "minor-sixth",
    tones: ["D", "F", "A", "B"],
    allowedBasses: ["A"],
    competingRoots: ["B"],
    minRootOccurrences: 1,
    contextualStrength: "deliberately-ambiguous",
    acceptedAlternatives: [{ root: "B", formula: "half-diminished", bass: "A" }],
  });

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
    "minor-add-nine": [[0, 0], [1, 2], [2, 3], [4, 7]],
    "six-add-nine": [[0, 0], [1, 2], [2, 4], [4, 7], [5, 9]],
    "minor-ninth-major-seventh": [[0, 0], [1, 2], [2, 3], [4, 7], [6, 11]],
    "minor-nine-add-six": [[0, 0], [1, 2], [2, 3], [4, 7], [5, 9], [6, 10]],
    "dominant-seven-sus-four": [[0, 0], [3, 5], [4, 7], [6, 10]],
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

  function randomFromState(seedState) {
    let state = Number(seedState) >>> 0 || 1;
    return function () {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      return (state >>> 0) / 4294967296;
    };
  }

  function randomFromSeed(seedText) {
    return randomFromState(seedNumber(seedText));
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

  function semanticChord(entry, random, forcedBass) {
    const allowedBasses = entry.allowedBasses || [];
    if (!allowedBasses.length) {
      throw new Error(`Generated chord ${entry.root} ${entry.formula} has no allowed bass.`);
    }
    if (forcedBass && !allowedBasses.includes(forcedBass)) {
      throw new Error(`Bass ${forcedBass} is not allowed for ${entry.root} ${entry.formula}.`);
    }
    const bass = forcedBass || allowedBasses[Math.floor(random() * allowedBasses.length)];
    return {
      ...window.CadenceStructuredAnswer.semanticJazzChord(
        displayPitch(entry.root),
        entry.formula,
        bass === entry.root ? "" : displayPitch(bass)
      ),
      bassPitch: bass,
    };
  }

  function acceptedAnalysesForChord(entry, chord) {
    const structured = window.CadenceStructuredAnswer;
    const symbols = [structured.formatJazzChord(chord)];
    (entry.harmonicIdentity?.acceptedAlternatives || []).forEach((alternative) => {
      const bass = alternative.bass || alternative.root;
      symbols.push(structured.formatJazzChord(
        structured.semanticJazzChord(
          displayPitch(alternative.root),
          alternative.formula,
          bass === alternative.root ? "" : displayPitch(bass),
          alternative
        )
      ));
    });
    return [...new Set(symbols)];
  }

  function buildVoicing(entry, chord) {
    const identity = entry.harmonicIdentity;
    const bassName = chord.bassPitch;
    const bassRootOccurrences = bassName === entry.root ? 1 : 0;
    const upperRootCopies = Math.max(
      0,
      identity.minRootOccurrences - bassRootOccurrences
    );
    const upperNames = [
      ...Array.from({ length: upperRootCopies }, () => entry.root),
      ...entry.tones.filter((tone) => tone !== entry.root && tone !== bassName),
    ];
    const rootOctaves = [4, 5, 6];
    let rootIndex = 0;
    const treble = upperNames.map((pitch) => {
      const octave = pitch === entry.root
        ? rootOctaves[rootIndex++] || 6
        : 4;
      return pitchWithOctave(pitch, octave);
    });
    const bass = [pitchWithOctave(bassName, 2)];
    const allNames = [...treble.map(pitchName), bassName];
    return {
      treble,
      bass,
      rootOccurrences: allNames.filter((pitch) => pitch === entry.root).length,
      competingRootOccurrences: Object.fromEntries(
        identity.competingRoots.map((root) => [
          root,
          allNames.filter((pitch) => pitch === root).length,
        ])
      ),
    };
  }

  function chordEvent(entry, chord, acceptableChordSymbols, voicing) {
    const symbol = acceptableChordSymbols[0];
    return {
      treble: [...voicing.treble],
      bass: [...voicing.bass],
      duration: "w",
      expectedChordSymbol: symbol,
      acceptableChordSymbols: [...acceptableChordSymbols],
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
        key: entry.key,
        keySignature: entry.keySignature,
        root: entry.root,
        formula: entry.formula,
        tones: [...entry.tones],
        allowedBasses: [...entry.allowedBasses],
        bass: chord.bassPitch,
        harmonicIdentity: {
          ...entry.harmonicIdentity,
          requiredTones: [...entry.harmonicIdentity.requiredTones],
          competingRoots: [...entry.harmonicIdentity.competingRoots],
          acceptedAlternatives: entry.harmonicIdentity.acceptedAlternatives.map(
            (alternative) => ({ ...alternative })
          ),
        },
        voicing: {
          treble: [...voicing.treble],
          bass: [...voicing.bass],
          rootOccurrences: voicing.rootOccurrences,
          competingRootOccurrences: { ...voicing.competingRootOccurrences },
        },
      },
    };
  }

  function pitchName(value) {
    return String(value).replace(/-?\d+$/, "");
  }

  function validateCatalogEntry(entry) {
    const expected = formulaToneSpecs[entry.formula];
    if (!expected || entry.tones.length !== expected.length) return false;
    if (!entry.allowedBasses?.length ||
        !entry.allowedBasses.every((bass) => entry.tones.includes(bass))) return false;
    const identity = entry.harmonicIdentity;
    if (!identity ||
        identity.intendedRoot !== entry.root ||
        identity.keyContext !== entry.key ||
        JSON.stringify(identity.requiredTones) !== JSON.stringify(entry.tones) ||
        !Number.isInteger(identity.minRootOccurrences) ||
        identity.minRootOccurrences < 1 ||
        !identity.competingRoots.every((root) => entry.tones.includes(root))) return false;
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

  function pitchHeight(value) {
    const renderer = window.CadenceScoreRenderer;
    const parsed = renderer.parsePitch(value);
    return parsed.octave * 12 + renderer.pitchClass(parsed);
  }

  function validateHarmonicIdentity(event, context = {}) {
    const errors = [];
    const sourceSpec = event?.generatedSourceSpec;
    if (!sourceSpec) return { valid: false, errors: ["Missing generated source specification."] };
    const identity = sourceSpec.harmonicIdentity;
    const semantic = event.generatedSemanticChord;
    if (!identity) errors.push("Missing harmonic-identity evidence.");
    if (identity?.intendedRoot !== sourceSpec.root) errors.push("Intended root does not match the source specification.");
    if (identity?.keyContext !== sourceSpec.key) errors.push("Key context does not match the harmonic identity.");
    if (context.key && context.key !== sourceSpec.key) errors.push("Displayed key label does not match the source specification.");
    if (context.keySignature && context.keySignature !== sourceSpec.keySignature) errors.push("Displayed key signature does not match the source specification.");
    if (!sourceSpec.allowedBasses?.includes(sourceSpec.bass)) errors.push("Displayed bass is not declared as an allowed bass.");
    if (semantic?.formula !== sourceSpec.formula || semantic?.root !== displayPitch(sourceSpec.root)) {
      errors.push("Semantic chord does not preserve the intended root and formula.");
    }
    if ((semantic?.bass || semantic?.root) !== displayPitch(sourceSpec.bass)) {
      errors.push("Semantic chord bass does not match the displayed bass.");
    }

    const treble = event.treble || [];
    const bass = event.bass || [];
    const spellings = [...treble, ...bass].map(pitchName);
    const spellingSet = new Set(spellings);
    const requiredTones = identity?.requiredTones || [];
    if (requiredTones.some((tone) => !spellingSet.has(tone))) {
      errors.push("Voicing omits a required exactly spelled chord tone.");
    }
    if (spellings.some((tone) => !requiredTones.includes(tone))) {
      errors.push("Voicing contains a tone outside the declared harmonic identity.");
    }
    if (pitchName(bass[0] || "") !== sourceSpec.bass) errors.push("Notated bass spelling does not match the intended bass.");
    if (bass.length !== 1 || treble.some((pitch) => pitchHeight(pitch) <= pitchHeight(bass[0]))) {
      errors.push("Generated bass must be the single lowest pitch.");
    }
    const rootOccurrences = spellings.filter((pitch) => pitch === sourceSpec.root).length;
    if (rootOccurrences < (identity?.minRootOccurrences || 1)) errors.push("Intended root is not sufficiently emphasised.");
    (identity?.competingRoots || []).forEach((root) => {
      const competitorOccurrences = spellings.filter((pitch) => pitch === root).length;
      if (competitorOccurrences > identity.maxCompetingRootOccurrences) {
        errors.push(`Competing root ${root} is over-emphasised.`);
      }
      if (identity.contextualStrength === "strong" && rootOccurrences <= competitorOccurrences) {
        errors.push(`Intended root is not stronger than competing root ${root}.`);
      }
    });
    const voicing = sourceSpec.voicing;
    if (!voicing ||
        JSON.stringify(voicing.treble) !== JSON.stringify(treble) ||
        JSON.stringify(voicing.bass) !== JSON.stringify(bass) ||
        voicing.rootOccurrences !== rootOccurrences) {
      errors.push("Stored voicing evidence does not match the notation.");
    }

    const declaredSymbols = acceptedAnalysesForChord(sourceSpec, {
      ...semantic,
      bassPitch: sourceSpec.bass,
    });
    if (JSON.stringify(declaredSymbols) !== JSON.stringify(event.acceptableChordSymbols || [])) {
      errors.push("Accepted analyses do not match the explicitly declared identities.");
    }
    if (event.expectedChordSymbol !== declaredSymbols[0]) errors.push("Primary intended analysis is not the expected symbol.");
    declaredSymbols.forEach((symbol) => {
      if (!window.CadenceScoreRenderer.validateChordIdentification({
        ...event,
        acceptableChordSymbols: [symbol],
      }, symbol).valid) {
        errors.push(`Displayed pitches do not support declared analysis ${symbol}.`);
      }
    });
    return { valid: errors.length === 0, errors };
  }

  function createIdentityFixture(entry, options = {}) {
    const random = randomFromSeed(options.seed || `${entry.key}-${entry.root}-${entry.formula}`);
    const chord = semanticChord(entry, random, options.bass);
    const voicing = buildVoicing(entry, chord);
    const accepted = acceptedAnalysesForChord(entry, chord);
    return {
      key: entry.key,
      keySignature: entry.keySignature,
      entry,
      chord,
      event: chordEvent(entry, chord, accepted, voicing),
      acceptedAnswers: accepted,
    };
  }

  function variantIdFromState(seedState) {
    return `CID-${(Number(seedState) >>> 0).toString(36).toUpperCase().padStart(7, "0")}`;
  }

  function stateFromVariantId(variantId) {
    const match = /^CID-([0-9A-Z]{7})$/i.exec(String(variantId || "").trim());
    if (!match) throw new Error("Variant ID must use the form CID-XXXXXXX.");
    const state = Number.parseInt(match[1], 36);
    if (!Number.isSafeInteger(state) || state < 0 || state > 0xFFFFFFFF) {
      throw new Error("Variant ID contains an invalid generator state.");
    }
    return state >>> 0;
  }

  function makeVariantId(seedText) {
    return variantIdFromState(seedNumber(seedText));
  }

  function createFromState(seedState) {
    const variantId = variantIdFromState(seedState);
    const random = randomFromState(seedState);
    const entries = chooseEntries(random, 4);
    const cases = entries.map((entry) => {
      const chord = semanticChord(entry, random);
      const voicing = buildVoicing(entry, chord);
      const accepted = acceptedAnalysesForChord(entry, chord);
      return { chord, voicing, accepted };
    });
    const chords = cases.map((generatedCase) => generatedCase.chord);
    const acceptedSymbols = cases.map((generatedCase) => generatedCase.accepted);
    const symbols = acceptedSymbols.map((answers) => answers[0]);
    const measures = entries.map((entry, index) => ({
      keySignature: entry.keySignature,
      keyLabel: entry.key,
      events: [chordEvent(
        entry,
        chords[index],
        acceptedSymbols[index],
        cases[index].voicing
      )],
      endBarline: index === entries.length - 1 ? "final" : undefined,
    }));
    const distractors = catalog
      .map((entry, index) => {
        const chord = semanticChord(entry, () => (index % entry.tones.length) / entry.tones.length);
        return window.CadenceStructuredAnswer.formatJazzChord(chord);
      })
      .filter((label, index, all) =>
        !acceptedSymbols.flat().includes(label) && all.indexOf(label) === index
      )
      .slice(0, 6);
    const slots = symbols.map((symbol, index) => ({
      id: `generated-chord-${index + 1}`,
      harmonicIndex: index,
      label: `Chord ${index + 1}`,
      acceptedAnswers: acceptedSymbols[index].map((label) => ({ label })),
    }));
    return {
      id: `generated-${variantId.toLowerCase()}`,
      variantId,
      generatorSeed: variantId,
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
        seed: `${variantId}-hint-bank`,
        slots,
        bank: [...acceptedSymbols.flat(), ...distractors].map((label, index) => ({
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
        ...acceptedSymbols.map((answers, index) => answers.length === 1
          ? `Chord ${index + 1} — Intended analysis: ${answers[0]}.`
          : `Chord ${index + 1} — Accepted analyses: ${answers.join(" or ")}.`),
        "Each intended or deliberately accepted analysis is validated against the displayed pitches, bass note, key context and exact spelling.",
      ],
    };
  }

  function create(seedText) {
    return createFromState(seedNumber(String(seedText || "cadence-lab-default")));
  }

  function createFromVariantId(variantId) {
    return createFromState(stateFromVariantId(variantId));
  }

  function validateVariant(question) {
    const normalized = window.CadenceScoreRenderer.normalizeMeasures(question.score);
    return normalized.measures.every((measure, index) => {
      const event = measure.events[0];
      const accepted = question.interaction.slots[index].acceptedAnswers.map((answer) => answer.label);
      const expected = accepted[0];
      const sourceSpec = event.generatedSourceSpec;
      const sourceMeasure = question.score.measures[index];
      const identityValidation = validateHarmonicIdentity(event, {
        key: sourceMeasure.keyLabel,
        keySignature: sourceMeasure.keySignature,
      });
      return event.expectedChordSymbol === expected &&
        JSON.stringify(event.acceptableChordSymbols) === JSON.stringify(accepted) &&
        accepted.length === 1 + sourceSpec.harmonicIdentity.acceptedAlternatives.length &&
        sourceMeasure.keyLabel === sourceSpec.key &&
        sourceMeasure.keySignature === sourceSpec.keySignature &&
        measure.keyLabel === sourceSpec.key &&
        measure.keySignature === sourceSpec.keySignature &&
        validateCatalogEntry(sourceSpec) &&
        identityValidation.valid;
    });
  }

  window.CadenceChordGenerator = Object.freeze({
    catalog,
    intentionalAmbiguityFixture,
    create,
    createIdentityFixture,
    createFromVariantId,
    makeVariantId,
    randomFromSeed,
    acceptedAnalysesForChord,
    validateCatalogEntry,
    validateHarmonicIdentity,
    validateVariant,
  });
})();
