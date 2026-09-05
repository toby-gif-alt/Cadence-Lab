# Cadence Lab

Interactive and paper-based practice for NCEA Level 3 Music Studies AS 91421.

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

The 32 source-based and original questions remain fully authored. A separate controlled generator creates four independent vertical chord-identification prompts from a verified semantic catalogue; it does not generate SATB, modulation or Bach-style passages and never alters an NZQA reference.

## Notation architecture

- `question-bank.js` owns assessment content and authored score data.
- `score-renderer.js` adapts the data into responsive VexFlow systems without question-specific drawing code.
- `question-validator.js` checks structural, music-theory and independent source-fidelity invariants when the static app loads.
- `student-answer.js` owns immutable learner-answer operations and composes those answers into the shared score format.
- `structured-answer.js` owns immutable Roman, key/modulation, jazz-placement and feature-classification responses, deterministic chord banks and authored-answer comparison.
- `chord-generator.js` owns reproducible, seeded vertical-chord practice variants and derives notation plus accepted symbols from the same validated semantic objects.
- `playback-engine.js` turns visible score data into a Web Audio timeline without using chord labels as a hidden note source.
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
      answerRole: "editable",
      answerSlotId: "analysis-example-h1",
      modelLabel: "C: I"
    }
  ]
}
```

`measure` and `beat` carry the musical location; `event` is a zero-based anchor within that measure. `answerRole` is always explicit: `supplied` displays an authored question label, `editable` maps one-to-one to a semantic response slot, and `none` creates no box. Layout or proportional anchors never imply a box by themselves. A melody can therefore contain many note events while creating only one authored analysis position. Answer boxes are drawn inside the score SVG and the renderer calculates top and bottom decoration space per system from the actual overlays, including modulation brackets and pitch-specific note markers.

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

## Spoiler-safe interaction and playback

Every question keeps its authoring metadata separate from its learner presentation. `internalTitle`, the complete score, model labels and answer prose remain available for validation and post-submit comparison; `studentTitle`, `studentContext`, `score.studentCaption` and the visible task text are the only presentation fields used before submission. Each entry also declares `hiddenConceptTerms`, and validation checks all 32 questions for accidental concept or answer disclosure. The app does not prebuild hidden answer prose, rubric rows, model SVG content or model playback timelines in the rendered DOM.

All 32 questions now declare one of five answer contracts: `roman-analysis`, `key-modulation`, `jazz-chord-placement`, `feature-analysis` or `notation-completion`. Roman answers use structured key, degree, quality, seventh and NZQA inversion fields; second analyses appear only on slots explicitly authored for a pivot, and inversion choices are constrained to the selected chord size. Half-diminished quality is always normalised to a seventh chord in both UI and stored state, while diminished triads remain valid. Modulation answers use X/Y/Z key and tonic-relationship selectors with optional evidence. Jazz tasks use a deterministically shuffled, multiplicity-preserving chord bank plus the standard structured builder. The semantic chord vocabulary covers every authored editable answer, including minor add-nine, minor ninth with major seventh or added sixth, dominant seventh sus4, slash basses and source-exact parenthetical `m7(♭5)` display. Feature tasks use plausible choices authored per field rather than a global option pool; *My Funny Valentine* stores its two harmonic techniques separately and compares them as an unordered pair. Every response remains separate from the model score, is snapshotted on submission and is compared only with the accepted answers stored on that exact response item. Authored comparison uses “matches model”; generated practice uses “matches intended analysis” for a single intentional identity and “matches accepted analysis” only for a deliberately declared multi-analysis fixture. Neither is automated NCEA grading.

The four SATB and four piano completion questions declare explicit `interaction.editableRegions`. Supplied notation is locked, while learner events live in a separate answer state with their own pitches, rests, durations, dots and ties. The compact editor uses local SVG notation icons, highlights editable bars for the selected staff, and supports direct semibreve-through-semiquaver entry, accidentals, one-shot add-chord-tone entry, individual chord-tone removal, direct second-tap deletion, keyboard deletion, undo and redo. Pointer and touch input previews the exact translucent note or rest—including spelling, duration, stem, dot and snapped onset—that the shared semantic insertion path will commit on release. Its voice-aware hit layer sits above supplied glyphs, so a locked soprano cannot block Alto entry, a locked bass cannot block Tenor entry and a supplied piano melody cannot block accompaniment entry. An add-chord-tone tap at an empty onset falls back to ordinary note insertion; at an occupied onset it highlights and extends the receiving student chord. Clicking a stave position derives a spelled pitch from the current clef, key signature and all preceding visible accidentals in the measure; it never mutates the question or model score. The renderer accepts independent piano staff voices as well as independent SATB voices, so learner rhythm does not have to be forced onto a shared event grid.

Learners no longer choose an Achievement, Merit or Excellence target. Every prompt exposes its complete Excellence-oriented practice task while the post-submit self-check continues to describe progression from isolated accuracy through secure consecutive work to a complete or convincing response. Roman and jazz placements advance to the next unanswered score box, without wrapping away from the final box once all positions are complete. Original prompt wording is audited so it asks learners to identify answer-bearing chords and devices instead of naming them in advance; exact reference prompts retain information genuinely supplied by the source.

Before submission, playback is limited to notes the learner has entered. Submission snapshots and locks the answer, then unlocks the supplied question, learner answer in context and model answer. The Web Audio transport supports 40–160 BPM, pause/resume, stop and a measure-aware cursor. Each playback mode owns its score target, so model playback highlights and follows the revealed model SVG rather than the learner score. Rests advance time, dotted values retain their length, ties merge sustained notes, and simultaneous pitches sound as chords. Resetting, changing question, resizing the notation or submitting stops active playback.

## Validation scope

The validator checks that:

- question IDs and score signatures are distinct;
- every production score has explicit measures whose durations fill the stated metre;
- every harmonic event resolves to its authored measure and beat; a supplied label inside a blank completion region receives a non-notated proportional anchor rather than an invented pitch or duration;
- every harmonic event declares `supplied`, `editable` or `none`, every editable event maps to exactly one response slot, completion tasks contain no editable analysis boxes, and layout anchors cannot create extra boxes;
- each declared chord symbol is supported by chord-bearing pitches that are present in the displayed notation and by the displayed slash bass, rejecting undeclared added tones; conventional omissions such as a fifth must be explicitly declared on that harmonic event;
- Roman-numeral roots agree with their declared local keys for the supported diatonic cases;
- declared non-harmonic notes are outside the active chord and, when a single melodic path is identified, their approach, departure, chord-tone endpoints, direction and metrical accent support the authored passing, auxiliary/neighbour, suspension, appoggiatura or accented-passing classification;
- all SATB events contain four named voices in non-crossing order;
- reference metadata, year distribution, category counts and the zero-legacy target are preserved;
- the final tonic-sixth voicing in the C turnaround remains C–E–G–A.

Chord validation verifies support for the intended symbol. It does not claim to enumerate every plausible contextual analysis. Each generated catalogue entry separately declares its allowed basses and harmonic-identity evidence. The generator then produces a constrained voicing that contains every exactly spelled defining tone, keeps the declared bass lowest, emphasises the intended root and avoids doubling a competing root. Sixth/minor-seventh, minor-sixth/half-diminished and suspended alternatives are therefore not accepted automatically; multiple symbols are accepted only when an entry explicitly declares deliberate ambiguity. `validateHarmonicIdentity()` checks that the key context, bass, root emphasis, exact spelling, voicing evidence and accepted symbols remain aligned. Every isolated measure displays its own key signature and a neutral key label. The visible `CID-XXXXXXX` token encodes the generator state: opening `?variant=CID-XXXXXXX` recreates the same four key contexts, voicings, doublings, basses, displayed notation and accepted analyses.

Source fidelity is a separate validation layer. Every `nzqa-reference` carries a `sourceSpec` derived from its assessment schedule: exact chord-symbol or Roman-numeral sequences, analysis and answer-position counts, key centres, supplied labels, X/Y/Z sections where relevant, and structural requirements such as independent SATB streams. The report exposes `musicTheoryErrors` and `sourceFidelityErrors` separately. This prevents an incorrectly transcribed label and an equally incorrect set of pitches from validating each other. The 2024 *Love is Commercial* specification, for example, requires the published E♯dim7 label and exact E♯–G♯–B–D spelling.

The validator does not invent melodic certainty from ambiguous chord stacks or unidentified SATB parts. When an authored non-harmonic-note label lacks enough voice context, it emits a non-failing `nonharmonic-context-manual-review` warning. It also produces review warnings for original analysis or jazz items that collapse into equal-duration simultaneous block chords with no independent rhythmic or melodic surface. The visual gallery displays all such warnings prominently.

The Achievement/Merit/Excellence checklists follow the recurring progression in the published schedules: isolated correct evidence; secure consecutive/contextual work; then extended analysis or convincing stylistic realisation. They are not percentage cut-offs and are not official marking judgements.

## Browser QA

Serve the repository root over HTTP, then open `tests/renderer-smoke.html`. The renderer smoke page validates the full bank and renders every question and model score at 1000, 780 and 390 pixels, including exact semantic box-count checks. Open `tests/interaction-smoke.html` for the 32-question spoiler audit plus immutable notation and structured-answer state, ghost/commit parity, voice-safe pointer and touch entry, direct deletion and undo, pivot-only dual Roman controls, auto-advance, exhaustive authored-jazz builder construction, ambiguity coverage, visible-Variant-ID round trips, hundreds of seeded generated variants, playback ownership and permission regressions. `tests/visual-gallery.html?category=analysis&width=780` provides a category-by-category review; `tests/visual-gallery.html?source=nzqa-reference&width=1000` shows all eight reference questions together. Width accepts any value from 340 to 1040 pixels, and the gallery surfaces all manual-review warnings.

Cadence Lab is not an official NZQA resource.
