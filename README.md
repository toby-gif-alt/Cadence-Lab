# Cadence Lab

Interactive and paper-based practice for NCEA Level 3 Music Studies AS 91421.

## Put it on GitHub Pages

1. Create a GitHub repository and add these files, including `vendor/`.
2. In **Settings → Pages**, choose **Deploy from a branch**.
3. Select `main` and the repository root, then save.

The app is entirely static. It has no API key, database, package-manager install, framework or build step.

## Question bank and sources

`question-bank.js` contains 50 hand-authored templates:

| Family | Count |
| --- | ---: |
| Roman-numeral analysis | 9 |
| Keys and modulation | 8 |
| SATB / vocal completion | 5 |
| Piano completion | 8 |
| Jazz / rock notation | 8 |
| Harmonic or tonal feature | 12 |

Authored questions are classified as `nzqa-reference`, `practice-assessment-reference` or `original-practice`; generated chord sets are separately labelled `generated-practice`. The bank currently retains five exact official references: 2021 Bach Q1(a), 2022 Bach Q1(a), 2023 Bach Q1(b), 2024 Bach Q1(a), and 2024 Bach Q1(c). No Learning Ideas item currently meets the exact-transcription contract, so those useful reductions are labelled adapted original practice and the practice-reference count is zero. Each retained reference records provider, year, question, part, extract, creator, title, bars, source kind, source-page location and acknowledgement metadata. The PDFs are external source material and are not stored in the repository. [`docs/source-audit-2021-2025.md`](docs/source-audit-2021-2025.md) is the full question/schedule manifest; `docs/nzqa-task-map.md` retains the concise official-task overview.

The retained reference templates are page-checked transcriptions of the named published extracts, preserving the printed bars, metre, rhythmic surface, score layout, supplied labels, blank analysis positions and schedule evidence. Reduced, selected, reconstructed or otherwise uncertain surfaces—including the current 2025 and Learning Ideas studies—are explicitly classified as adapted original practice and do not count as references. Empty reference filters are disabled while the source taxonomy remains available for future exact additions.

The 50 source-based and original questions remain fully authored. A separate controlled generator creates four independent vertical chord-identification prompts from a verified semantic catalogue; it does not generate SATB, modulation or Bach-style passages and never alters a reference.

## Notation architecture

- `question-bank.js` owns assessment content and authored score data.
- `key-relationships.js` owns exact-spelling semantic keys and derives contextual home-to-local key relationships.
- `score-renderer.js` adapts the data into responsive VexFlow systems without question-specific drawing code.
- `question-validator.js` checks structural, music-theory and independent source-fidelity invariants when the static app loads.
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

Every question keeps its authoring metadata separate from its learner presentation. `internalTitle`, the complete score, model labels and answer prose remain available for validation and post-submit comparison; `studentTitle`, `studentContext`, `score.studentCaption` and the visible task text are the only presentation fields used before submission. Each entry also declares `hiddenConceptTerms`, and validation checks the whole bank for accidental concept or answer disclosure. The app does not prebuild hidden answer prose, rubric rows, model SVG content or model playback timelines in the rendered DOM.

Every authored question declares one of six answer contracts: `roman-analysis`, `key-modulation`, `jazz-chord-placement`, `feature-analysis`, `contextual-analysis` or `paper-completion`. Roman answers use structured key, degree, quality, seventh and NZQA inversion fields; second analyses appear only on slots explicitly authored for a pivot, and inversion choices are constrained to the selected chord size. Half-diminished quality is always normalised to a seventh chord in both UI and stored state, while diminished triads remain valid. Modulation tasks store exact-spelling semantic `homeKey` and `localKey` data; every relationship prompt supplies the home tonic, and accepted descriptions are derived and validated for that exact key pair. Each learner-facing relationship field shows only one preferred named answer plus three to five plausible distractors; reference fields can preserve source terminology while broader semantic aliases remain accepted internally. Jazz tasks use a deterministically shuffled, multiplicity-preserving chord bank plus the standard structured builder. The semantic chord vocabulary covers every authored editable answer, including minor add-nine, minor add-four, minor eleventh, minor ninth with major seventh or added sixth, dominant seventh sus4, slash basses and source-exact parenthetical or half-diminished display. Contextual tasks scaffold separate feature, evidence, function and effect points, preserve open-ended writing, and explicitly use self-check rather than automated NCEA grading. Every structured response remains separate from the model score and is snapshotted on submission.

All SATB and piano completion questions use a deliberately simple `paper-completion` contract. Learners write on paper or a printed question, hear only the notes visibly supplied in that question, then choose **I’ve finished** to reveal a separately rendered model. No browser note-entry state is created. Each question stores explicit semantic completion requirements and a question-aware self-check; the checklist helps comparison but does not claim to grade the learner’s paper. The renderer still accepts independent piano staff voices and independent SATB voices, so supplied and model notation retain their authored rhythm, rests, ties, spelling and beaming.

Printing is assessment-style A4. Question printing always hides application chrome, playback, the model and self-check—even after reveal—while the separate model-print action becomes available only after a paper completion is revealed. Completion sheets use portrait by default; the wider 2024 Bach reference uses landscape.

Learners no longer choose an Achievement, Merit or Excellence target. Every prompt exposes its complete Excellence-oriented practice task while the post-submit self-check continues to describe progression from isolated accuracy through secure consecutive work to a complete or convincing response. Roman and jazz placements advance to the next unanswered score box, without wrapping away from the final box once all positions are complete. Original prompt wording is audited so it asks learners to identify answer-bearing chords and devices instead of naming them in advance; exact reference prompts retain information genuinely supplied by the source.

Structured-analysis playback stays locked until submission. Paper completions instead offer **Hear supplied passage** immediately; the playback engine first derives a question-only score from `questionVoices`, `qTreble` and `qBass`, so it cannot sound model notes or infer notes from harmonic labels. After reveal, **Play model answer** uses the complete authored score and its own model cursor and scroll target. There are no student-notation or student-in-context playback modes. The Web Audio transport supports 40–160 BPM, pause/resume, stop and a measure-aware cursor. Rests advance time, dotted values retain their length, ties merge sustained notes, and simultaneous pitches sound as chords. Changing question, resizing the notation or submitting stops active playback.

## Validation scope

The validator checks that:

- question IDs and score signatures are distinct;
- every production score has explicit measures whose durations fill the stated metre;
- every harmonic event resolves to its authored measure and beat; a supplied label inside a blank completion region receives a non-notated proportional anchor rather than an invented pitch or duration;
- every harmonic event declares `supplied`, `editable` or `none`, every editable event maps to exactly one response slot, paper completions contain no editable analysis boxes, and layout anchors cannot create extra boxes;
- every completion has a category-matched `paper-completion` contract, semantic requirements, a non-empty question-aware self-check and a valid A4 print orientation;
- each declared chord symbol is supported by chord-bearing pitches that are present in the displayed notation and by the displayed slash bass, rejecting undeclared added tones; conventional omissions such as a fifth must be explicitly declared on that harmonic event;
- Roman-numeral roots agree with their declared local keys for the supported diatonic cases;
- every modulation task supplies or explicitly requests its home tonic, preserves exact key spelling, accepts only semantically valid relationship labels and presents a bounded field-specific set with exactly one visible correct answer;
- declared non-harmonic notes are outside the active chord and, when a single melodic path is identified, their approach, departure, chord-tone endpoints, direction and metrical accent support the authored passing, auxiliary/neighbour, suspension, appoggiatura or accented-passing classification;
- all SATB events contain four named voices in non-crossing order;
- reference metadata, provider/source taxonomy, year coverage and the zero-legacy target are preserved without brittle whole-bank count assertions;
- the final tonic-sixth voicing in the C turnaround remains C–E–G–A.

Chord validation verifies support for the intended symbol. It does not claim to enumerate every plausible contextual analysis. Each generated catalogue entry separately declares its allowed basses and harmonic-identity evidence. The generator then produces a constrained voicing that contains every exactly spelled defining tone, keeps the declared bass lowest, emphasises the intended root and avoids doubling a competing root. Sixth/minor-seventh, minor-sixth/half-diminished and suspended alternatives are therefore not accepted automatically; multiple symbols are accepted only when an entry explicitly declares deliberate ambiguity. `validateHarmonicIdentity()` checks that the key context, bass, root emphasis, exact spelling, voicing evidence and accepted symbols remain aligned. Every isolated measure displays its own key signature and a neutral key label. The visible `CID-XXXXXXX` token encodes the generator state: opening `?variant=CID-XXXXXXX` recreates the same four key contexts, voicings, doublings, basses, displayed notation and accepted analyses.

Source fidelity is a separate validation layer. Every official or practice-assessment reference must declare `transcriptionMode: "exact"`, the printed bar range and measure count, staff layout, and a source-derived event/rhythm signature independent of the score object being tested. Schedule-derived chord/Roman sequences, answer-position counts, key centres, supplied labels, X/Y/Z sections and completion contracts remain separate checks. The validator rejects reference metadata containing language such as “representative”, “selected regions”, “reduced”, “simplified”, “adapted” or “approximation”. The report exposes `musicTheoryErrors` and `sourceFidelityErrors` separately.

The validator does not invent melodic certainty from ambiguous chord stacks or unidentified SATB parts. When an authored non-harmonic-note label lacks enough voice context, it emits a non-failing `nonharmonic-context-manual-review` warning. It also produces review warnings for original analysis or jazz items that collapse into equal-duration simultaneous block chords with no independent rhythmic or melodic surface. The visual gallery displays all such warnings prominently.

The Achievement/Merit/Excellence checklists follow the recurring progression in the published schedules: isolated correct evidence; secure consecutive/contextual work; then extended analysis or convincing stylistic realisation. They are not percentage cut-offs and are not official marking judgements.

## Browser QA

Serve the repository root over HTTP, then open `tests/renderer-smoke.html`. The renderer smoke page validates the full bank and renders every question and model score at 1000, 780 and 390 pixels, including exact semantic box-count checks. Open `tests/interaction-smoke.html` for the whole-bank spoiler audit, all paper contracts, question-only versus model playback, A4 question/model print separation, contextual self-check contracts, pivot-only dual Roman controls, auto-advance, semantic key relationships, exhaustive authored-jazz builder construction, ambiguity coverage, visible-Variant-ID round trips and hundreds of seeded generated variants. `tests/visual-gallery.html?category=analysis&width=780` provides category review; `tests/visual-gallery.html?source=nzqa-reference&year=2024&question=Question%20One&width=1000` filters retained references by provider/source, year and question. Width accepts any value from 340 to 1040 pixels, and the gallery surfaces all manual-review warnings.

Cadence Lab is not an official NZQA resource.
