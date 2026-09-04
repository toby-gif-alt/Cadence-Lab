# Cadence Lab

Paper-based practice for NCEA Level 3 Music Studies AS 91421.

## Put it on GitHub Pages

1. Create a GitHub repository and add these files, including `vendor/`.
2. In **Settings → Pages**, choose **Deploy from a branch**.
3. Select `main` and the repository root, then save.

The app is entirely static. It has no API key, database, package-manager install, framework or build step.

## Question bank and sources

`question-bank.js` contains 32 hand-authored templates:

| Family | Count |
| --- | ---: |
| Roman-numeral analysis | 6 |
| Keys and modulation | 6 |
| SATB / vocal completion | 4 |
| Piano completion | 4 |
| Jazz / rock notation | 6 |
| Harmonic or tonal feature | 6 |

Every question has either `sourceType: "nzqa-reference"` or `sourceType: "original-practice"`. The eight reference templates cover every year from 2021 to 2024, with an intentionally uneven distribution so the bank can include both 2024 Bach tasks. Each includes question, part, extract, creator, title, location and acknowledgement metadata. The PDFs are external source material and are not stored in the repository. `docs/nzqa-task-map.md` maps all exam families to their matching assessment-schedule evidence.

The reference templates are practical teaching transcriptions of the named published extracts, retaining the assessed bars, metre, rhythmic surface, score layout, supplied labels, blank analysis positions and published answer evidence as far as the renderer permits. A simplified related-key study formerly attributed to Mendelssohn is now explicitly classified as adapted original practice. The source filter and badges preserve that distinction in the interface and on printouts.

There is no procedural music generator. All pitches, rhythms, measures, harmonic changes and answer anchors are explicitly authored.

## Notation architecture

- `question-bank.js` owns assessment content and authored score data.
- `score-renderer.js` adapts the data into responsive VexFlow systems without question-specific drawing code.
- `question-validator.js` checks structural, music-theory and independent source-fidelity invariants when the static app loads.
- `vendor/vexflow-bravura-4.2.5.js` is the pinned VexFlow 4.2.5 browser build. Its MIT licence is in `vendor/VEXFLOW-LICENSE.txt`.

All production questions use `score.measures`. The renderer preserves event durations, dotted values, rests, time-signature and key-signature changes, measure boundaries, ties, automatic beams and optional begin/end barlines. Supported barline values are `none`, `single`, `double`, `end`, `repeat-begin`, `repeat-end` and `repeat-both`.

Legacy `score.chords` input remains a renderer compatibility path only. It stays unmetered and cannot create inferred rhythm, metre or barlines. The current question bank has zero legacy scores.

### Note events and harmonic events

Rhythmic notation and harmonic analysis are intentionally separate:

```js
{
  measures: [
    { events: [
      { treble: ["E4", "G4", "C5"], bass: ["C3"], duration: "h" },
      { treble: ["D4", "F4", "B4"], bass: ["G2"], duration: "h" }
    ] }
  ],
  harmonicEvents: [
    {
      measure: 1,
      beat: 1,
      event: 0,
      localKey: "C major",
      romanNumeral: "I",
      chordSymbol: "C",
      analysisBox: true,
      modelLabel: "C: I"
    }
  ]
}
```

`measure` and `beat` carry the musical location; `event` is a zero-based anchor within that measure. A melody can therefore contain many note events while creating only one analysis box for the active harmony. Answer boxes are drawn inside the score SVG and the renderer calculates top and bottom decoration space per system from the actual overlays, including modulation brackets and pitch-specific note markers.

### Pitch-specific note annotations

Questions that refer to a marked note use semantic annotation data rather than prose alone:

```js
noteAnnotations: [
  {
    measure: 1,
    beat: 2,
    staff: "treble",
    pitch: "A4",
    label: "X"
  }
]
```

The renderer resolves the locator to the exact displayed notehead and draws a small examination-style label with a leader. An annotation fails validation if its event, staff, exact pitch or optional named SATB voice cannot be resolved. Markers, section brackets and chord-analysis boxes use separate vertical lanes and remain within the responsive SVG.

### SATB and completion data

SATB uses explicit named voices:

```js
{
  voices: { soprano: "F5", alto: "A4", tenor: "C3", bass: "F2" },
  questionVoices: { soprano: "F5", bass: "F2" },
  duration: "q"
}
```

Each named voice accepts one pitch per event. Mixing named and legacy stave fields, supplying an unknown voice, or placing more than two pitches on a legacy SATB stave throws a development error. Question-only fields are selected before VexFlow notes are constructed, so omitted answer pitches do not leak into score metadata, accidentals or spacing.

Reference chorales can instead give every part its own rhythmic stream:

```js
{
  voices: {
    soprano: [{ pitch: "G4", duration: "q" }, { pitch: "A4", duration: "h" }],
    alto: [{ pitch: "E4", duration: "8" }, { pitch: "F4", duration: "8" }, { pitch: "E4", duration: "h" }],
    tenor: [{ pitch: "C3", duration: "hd" }],
    bass: [{ pitch: "C3", duration: "q", tieToNext: true }, { pitch: "C3", duration: "h" }]
  }
}
```

The renderer constructs four independent VexFlow voices—soprano and alto on the treble stave, tenor and bass on the bass stave—so each part can retain its own durations, rests and ties. Optional `questionVoices` uses the same stream format for completion prompts. The shared-event form remains available for original practice where all four parts genuinely share a rhythmic grid.

Optional `voiceLabels: { treble: ["S", "A"], bass: ["T", "B"] }` adds compact examination-style part labels at each system. Soprano/alto and tenor/bass are joined as separate contrapuntal pairs for local notehead, accidental and rest collision handling, while a shared formatter preserves vertical rhythmic alignment between the staves. Beams are generated independently for each voice using the active metre's default beat groups.

### Density-aware engraving

Explicit measures are assigned a deterministic preferred width from their rhythmic onsets, shortest value, independent-voice activity, accidentals, rests, dots, ties, close-position seconds/unisons, analysis boxes and note annotations. Measures are packed only while their preferred widths fit the system; remaining width is distributed proportionally. VexFlow's own minimum formatting width is also recorded during formatting for QA. Dense chorale bars therefore receive more horizontal space than sparse bars, and narrow screens reflow to additional systems instead of compressing every bar equally. SATB inter-staff distance also increases modestly for dense or collision-prone systems.

Piano completion events use the corresponding `qTreble` and `qBass` fields to keep the melody or supplied accompaniment visible while hiding notes the learner must write.

## Validation scope

The validator checks that:

- question IDs and score signatures are distinct;
- every production score has explicit measures whose durations fill the stated metre;
- every harmonic event resolves to an authored note-event anchor;
- each declared chord symbol is supported by chord-bearing pitches that are present in the displayed notation and by the displayed slash bass, rejecting undeclared added tones; conventional omissions such as a fifth must be explicitly declared on that harmonic event;
- Roman-numeral roots agree with their declared local keys for the supported diatonic cases;
- declared non-harmonic notes are outside the active chord and, when a single melodic path is identified, their approach, departure, chord-tone endpoints, direction and metrical accent support the authored passing, auxiliary/neighbour, suspension, appoggiatura or accented-passing classification;
- all SATB events contain four named voices in non-crossing order;
- reference metadata, year distribution, category counts and the zero-legacy target are preserved;
- the final tonic-sixth voicing in the C turnaround remains C–E–G–A.

Chord validation verifies support for the intended symbol. It does not claim to enumerate every plausible contextual analysis. `acceptableChordSymbols` remains available when the author deliberately permits more than one reading.

Source fidelity is a separate validation layer. Every `nzqa-reference` carries a `sourceSpec` derived from its assessment schedule: exact chord-symbol or Roman-numeral sequences, analysis and answer-position counts, key centres, supplied labels, X/Y/Z sections where relevant, and structural requirements such as independent SATB streams. The report exposes `musicTheoryErrors` and `sourceFidelityErrors` separately. This prevents an incorrectly transcribed label and an equally incorrect set of pitches from validating each other. The 2024 *Love is Commercial* specification, for example, requires the published E♯dim7 label and exact E♯–G♯–B–D spelling.

The validator does not invent melodic certainty from ambiguous chord stacks or unidentified SATB parts. When an authored non-harmonic-note label lacks enough voice context, it emits a non-failing `nonharmonic-context-manual-review` warning. It also produces review warnings for original analysis or jazz items that collapse into equal-duration simultaneous block chords with no independent rhythmic or melodic surface. The visual gallery displays all such warnings prominently.

The Achievement/Merit/Excellence checklists follow the recurring progression in the published schedules: isolated correct evidence; secure consecutive/contextual work; then extended analysis or convincing stylistic realisation. They are not percentage cut-offs and are not official marking judgements.

## Browser QA

Serve the repository root over HTTP, then open `tests/renderer-smoke.html`. The smoke page validates the full bank and renders every question and model score at 1000, 780 and 390 pixels. `tests/visual-gallery.html?category=analysis&width=780` provides a category-by-category review; `tests/visual-gallery.html?source=nzqa-reference&width=1000` shows all eight reference questions together. Width accepts any value from 340 to 1040 pixels, and the gallery surfaces all manual-review warnings.

Cadence Lab is not an official NZQA resource.
