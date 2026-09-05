# AS 91421 source audit, 2021–2025

This is the development manifest for Cadence Lab's source bank. It distinguishes official NZQA examination material from Learning Ideas practice assessments. The source PDFs remain external and are not committed to this repository.

## Method and conventions

- The **question paper** controls the learner-visible task, supplied notation, labels, keys, chord choices and completion region.
- The matching **assessment schedule** controls the model answer, accepted published alternatives and evidence prompts.
- “Other responses possible” is not an invitation to accept arbitrary labels. Only a defensible, known alternative is encoded.
- `existing` means the source task is already represented in the bank; `add` means it is in scope for this expansion; `combine` means closely related paper subparts share one structured Cadence Lab item; `defer` means the source is documented but needs a later notation transcription or interaction pass.
- Achievement generally identifies conventions, Merit explains them with evidence, and Excellence applies or analyses them comprehensively. The final column makes that expectation task-specific rather than treating the supplied language guide as an answer source.

## Source taxonomy and metadata contract

| Internal source type | Learner-facing label | Provider | `sourceKind` |
| --- | --- | --- | --- |
| `nzqa-reference` | NZQA examination reference | NZQA | `official-exam` |
| `practice-assessment-reference` | Practice assessment reference | Learning Ideas | `practice-assessment` |
| `original-practice` | Original Cadence Lab practice | Cadence Lab | `original-practice` |
| `generated-practice` | Generated Cadence Lab practice | Cadence Lab | `generated-practice` |

Reference metadata records `provider`, `year`, `question`, `part`, `extract`, `creator`, `title`, `bars`, `sourceKind`, source-page location and acknowledgement where those details are available.

## Official NZQA examinations

### 2021

| Source / part | Extract, creator and title | Task / key context | Learner is given | Learner must… | Schedule/model evidence | Excellence expectation | Existing equivalent / action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| NZQA 2021 Q1(a) | Extract One, J. S. Bach chorale | Roman analysis; A major → F♯ minor → A major | Opening analysis and the stated tonal route | Analyse bars 4–8 and show both pivots | 10 assessed chords; exact inversions and two pivot analyses | Secure extended progression with both modulations | `nzqa-2021-bach-pivots` / existing |
| NZQA 2021 Q1(b)(i) | Extract Two, Bach chorale continuation | Modulation; home A major | X/Y/Z regions | Name each key, cite evidence and give its relationship | X F♯ minor / relative minor; Y E major / dominant; Z D major / subdominant, with cadence and leading-note evidence | Relate all three regions to the home key with precise evidence | defer |
| NZQA 2021 Q1(b)(ii) | Extract Two | Contextual chromatic-note function; A major | D♮ in bars 12–13 | Explain its harmonic function | Seventh of E harmony; supports movement through a perfect cadence and return to A | Connect pitch, chord function and cadence | defer, combine with Q1(b) |
| NZQA 2021 Q1(c) | Extract Three, chorale-style completion | SATB/vocal completion; F♯ minor → A major | Printed melody/harmony indications and style model | Complete the missing four-part harmonisation | 11 chords; schedule supplies one acceptable stylistic realisation | Fluent, stylistic completion across the full region | defer |
| NZQA 2021 Q2(a)(i) | Extract Four, classical repertoire | Roman analysis | Stated opening key and supplied labels | Analyse the indicated progression | 8 assessed chords with exact inversions | Secure consecutive analysis | defer |
| NZQA 2021 Q2(a)(ii) | Extract Four | Contextual tonality/chromaticism; C major → G major | Score and stated starting key | Explain modulation and chromatic-note use | F♯, perfect cadence and C:I / G:IV pivot; chromaticism adds colour, smoothness and harmonic complexity | Link device, location, tonal function and effect | defer |
| NZQA 2021 Q2(b) | Extract Five, piano | Piano completion; B♭ major → F major → related region | Melody, first texture and Roman indications | Add bass and two inner parts in style | 8 chord moments in the published model | Sustained idiomatic texture and convincing tonal route | add |
| NZQA 2021 Q3(a)(i) | Extract Six, Rodgers and Hart, “My Funny Valentine” | Jazz/rock chord analysis | First chords and vocal/piano score | Identify chord symbols | 9 assessed chords with source spellings | Extended accurate chord sequence | existing |
| NZQA 2021 Q3(a)(ii–iii) | Same extract | NHT and harmonic-technique analysis | X/Y/Z note labels | Classify three NHTs and identify two techniques | X auxiliary, Y accented passing, Z appoggiatura; descending chromatic inner line and tonic pedal | Explain how the chromatic line creates movement over tonal stability | `nzqa-2021-valentine-techniques` / existing |
| NZQA 2021 Q3(b) | Extract Seven, piano | Piano completion | Chord symbols and opening accompaniment style | Complete bars 41–45 | 8 chord moments in model | Fluent stylistic realisation | defer |

### 2022

| Source / part | Extract, creator and title | Task / key context | Learner is given | Learner must… | Schedule/model evidence | Excellence expectation | Existing equivalent / action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| NZQA 2022 Q1(a) | Extract One, J. S. Bach chorale | Roman analysis with pivots/cadences | Opening/closing labels and stated key route | Analyse progression and identify two cadences | 10 assessed chords and two cadences | Complete, contextual analysis | `nzqa-2022-bach-c-aminor` / existing |
| NZQA 2022 Q1(b) | Extract Two | Modulation; home A minor | X/Y/Z brackets | Identify keys, evidence and relationships | X G major / dominant; Y E minor / relative minor of dominant; Z A minor / relative minor (as printed context requires) | Explain tonal route with cadence/accidental evidence | defer |
| NZQA 2022 Q1(c) | Extract Three, chorale | SATB/vocal completion | Roman route and supplied voice material | Complete parts with at least two passing notes | 8 chord moments in published model | Stylistically secure complete phrase | defer |
| NZQA 2022 Q2(a) | Extract Four, Felix Mendelssohn theme | Roman analysis; D minor → F major | Opening theme and stated bar-4 key | Analyse bars 5–8 and pivot | 10 assessed chords, exact inversions/pivot | Analyse extended progression and transition | defer |
| NZQA 2022 Q2(b) | Extracts Five and Six, variations | Contextual comparative analysis | Theme and two variations | Explain harmonic/tonal similarities and differences | Schedule accepts supported discussion of texture, rhythm, chromaticism and harmony | Multiple evidence-linked comparative points | defer |
| NZQA 2022 Q2(c) | Piano extract | Piano completion | Melody, harmony indications and model texture | Continue piano harmony | 7 chord moments | Consistent texture and voice leading | defer |
| NZQA 2022 Q3(a) | Extract Eight | Contextual tonality/chromatic bass; G major goal | Chromatic introduction | Explain tonality and how G becomes established | Initially unfixed/chromatic/minor colour; descending chromatic bass; D7–G extended perfect cadence at bars 8–9 | Trace ambiguity to tonal confirmation using score evidence | defer |
| NZQA 2022 Q3(b) | Extract Nine | Jazz/rock chord analysis | Score and supplied opening | Identify symbols | 10 assessed chords | Secure extended chord analysis | defer |
| NZQA 2022 Q3(c) | Extract Ten, piano | Piano completion | Chord symbols and opening texture | Complete the harmony | 7 chord moments | Idiomatic full phrase | defer |

### 2023

| Source / part | Extract, creator and title | Task / key context | Learner is given | Learner must… | Schedule/model evidence | Excellence expectation | Existing equivalent / action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| NZQA 2023 Q1(a) | Extract One, J. S. Bach chorale | Roman analysis; C minor → G minor | First labels and tonal route | Analyse bars 1–4 and pivot | 13 assessed chords with exact minor-key spellings | Complete progression and modulation | add |
| NZQA 2023 Q1(b) | Extract Two | Modulation | X/Y/Z regions | Identify local keys, evidence and relationships | Published key/evidence/relationship table | Full evidence-based tonal route | `nzqa-2023-bach-modulation` / existing |
| NZQA 2023 Q1(c) | Extract Three, Bach chorale | SATB/vocal completion; G minor | Opening completion and allowed Roman vocabulary | Complete bars 11–13 with passing notes | 9 chord moments | Stylistically controlled full phrase | defer |
| NZQA 2023 Q2(a) | Extract Four, Francis Poulenc | Harmonic/tonal feature | Score | Identify a compositional device and explain function | Pedal-point response and supported alternatives | Connect device, score location, harmonic function and effect | `nzqa-2023-poulenc-pedal` / existing |
| NZQA 2023 Q2(b)(i) | Extract Five | Roman analysis; C major → G major | Opening and stated modulation | Analyse bars 6–14 including pivot | 12 assessed chords | Secure extended analysis | defer |
| NZQA 2023 Q2(b)(ii) | Extract Five | Contextual chromatic-note function | F♯ marked in score | Explain F♯ function | Leading note of G, defining dominant-region harmony and cadence | Explain pitch in local-key context | defer, combine with Q2(b) |
| NZQA 2023 Q2(c) | Extract Six, piano | Piano completion; C major | Melody, Roman indications and first texture | Complete bars 21–24 | 7 chord moments | Convincing continuation of texture/cadence | add |
| NZQA 2023 Q3(a)(i) | Extract Seven | Jazz/rock chord analysis | Opening chord | Analyse bars 6–12 and 19–21 | 10 assessed chords | Extended accurate symbols | defer |
| NZQA 2023 Q3(a)(ii) | Extract Seven | Tonality/key evidence | Score | Identify and justify key/tonal reading | E minor or G major accepted when supported by cadence/modal evidence | Weigh evidence rather than name a key alone | defer, combine with Q3(a) |
| NZQA 2023 Q3(b) | Extract Eight, piano | Piano completion | Chord indications and opening style | Complete bars 29–35 | 7 chord moments | Fluent idiomatic completion | defer |

### 2024

| Source / part | Extract, creator and title | Task / key context | Learner is given | Learner must… | Schedule/model evidence | Excellence expectation | Existing equivalent / action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| NZQA 2024 Q1(a)(i) | Extract One, J. S. Bach chorale | Roman analysis; C major → related key | Five supplied labels and opening key | Analyse 13 positions including pivot | Exact published Roman sequence | Complete progression and pivot | `nzqa-2024-bach-analysis` / existing |
| NZQA 2024 Q1(a)(ii) | Extract One | Diminished-seventh function | Chord X | Explain its cadential/voice-leading function | Schedule-derived diminished-seventh evidence | Connect pitches, function and resolution | existing, combined with Q1(a) |
| NZQA 2024 Q1(b) | Extract Two | Modulation; home C major | X/Y brackets | Identify key, evidence and relationship | X A minor / relative minor; Y G major / dominant | Evidence-linked relationship analysis | defer |
| NZQA 2024 Q1(c) | Extract Three, Bach chorale | SATB/vocal completion; F major → C major | Bar 17 style model and eight harmonic indications | Create all four parts in bars 18–19 with two passing notes; realise V4–3 as one span | 8 chord moments; no model voice leakage | Full stylistic completion | `nzqa-2024-bach-satb` / existing |
| NZQA 2024 Q2(a)(i) | Extract Four, classical piano | Roman analysis | Opening key and printed score | Analyse bars 2–14 | 13 assessed chords | Secure extended analysis | defer |
| NZQA 2024 Q2(a)(ii–iii) | Extract Four | Integrated tonality and NHT analysis | Score and marked notes | Explain direct modulation/pedal and classify NHTs | A-major move without pivot plus schedule NHT classifications | Integrated, evidence-rich explanation | defer |
| NZQA 2024 Q2(b) | Extract Five, piano | Piano completion | Melody, indications and opening texture | Complete bars 93–96 | 8 chord moments | Fluent stylistic continuation | defer |
| NZQA 2024 Q3(a)(i) | Extract Six, Feist, “Love is Commercial” | Jazz/rock chord analysis | Opening symbol and score | Analyse bars 19–28 | 11 exact symbols, including E♯dim7 | Extended exact source analysis | `nzqa-2024-commercial-chromatic-bass` / existing |
| NZQA 2024 Q3(a)(ii) | Same extract | Chromatic bass/harmonic rhythm | Score | Explain device and effect | Frequent harmonic changes and chromatic bass create momentum | Evidence-linked contextual effect | existing, combined with Q3(a) |
| NZQA 2024 Q3(b) | Extract Seven, piano | Piano completion | Chord indications and opening style | Complete bars 33–39 | 9 chord moments | Idiomatic full phrase | defer |

### 2025

| Source / part | Extract, creator and title | Task / key context | Learner is given | Learner must… | Schedule/model evidence | Excellence expectation | Existing equivalent / action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| NZQA 2025 Q1(a) | Extract One, J. S. Bach, “Komm, Heiliger Geist, Herre Gott” | Roman analysis; G major → D major → G major | Bars 5–9 and first three labels I, Vb, IVb | Analyse 12 positions in bars 6–9 including both pivots | 12 assessed chords; exact inversions and pivot spellings | Complete extended analysis and both key transitions | add |
| NZQA 2025 Q1(b) | Extract Two, Bach chorale | Modulation; home G major | X/Y/Z brackets | Identify keys, evidence and relationships | X E minor / relative minor; Y D major / dominant; Z A minor / relative minor of subdominant (supertonic minor accepted) | Explain all regions with cadence and leading-note evidence | add |
| NZQA 2025 Q1(c)(i) | Extract Three, Bach chorale | SATB/vocal completion; G major | Roman indications and supplied tenor through bar 23 beat 1 | Add bass, soprano and alto; include the bar-22 suspension | First stage of 10-chord model | Stylistic voice leading with required suspension | add, combined two-stage paper task |
| NZQA 2025 Q1(c)(ii) | Extract Three | SATB/vocal completion; G major | Allowed I, ii, V, V7, vi and supplied continuation context | Choose/label harmony, add bass/alto/tenor and two passing notes through bar 24 beat 3 | Second stage; root position or inversions accepted where musically appropriate | Complete coherent phrase with two passing notes and labelled choices | add, combined two-stage paper task |
| NZQA 2025 Q2(a) | Extract Four, Franz Schubert, “Adagio and Rondo in E Major”, D506 / Op. 145 | Roman analysis; E major → F♯ minor → E major | First I and explicit tonal route | Analyse 12 positions in bars 1–6 including pivots | Exact 12-chord schedule route; alternative pivot placement noted by schedule | Complete progression and contextual pivots | add |
| NZQA 2025 Q2(b) | Extract Five, same work | Contextual harmonic/tonal feature; E major | Bars 7–8 | Identify feature, cite location, explain function/effect | Chromatic contrary semitone movement decorating dominant/cadential arrival; melodic repetition/imitation/sequence also supported | Evidence-linked analytical point, not feature naming alone | add |
| NZQA 2025 Q2(c) | Extract Six, Schubert rondo | Piano completion; E major | Bars 19–24, melody, Roman indications and opening piano style | Add bass and two inner parts in bars 20–24 | 8 chord moments in model | Fluent continuation of texture and tonal shape | add |
| NZQA 2025 Q3(a) | Extract Seven, Billy Joel, “New York State of Mind” | Jazz/rock chord analysis; C major context | Bar 5 symbol and vocal/piano score | Identify 10 symbols in bars 6–13 | E7, Am7, Gm(add4), C7, F, A7, Dm7, B♭9, B♭7, C | Exact extended analysis with source spelling | add |
| NZQA 2025 Q3(b)(i) | Extract Eight, same song, bridge | Integrated harmonic-rhythm analysis | Bars 24–42 | Comment on harmonic rhythm | Changes every one or two bars; 1–1–2 pattern; arrival/weight on G, F, A, G | Multiple evidence-linked observations | add, combined contextual interaction |
| NZQA 2025 Q3(b)(ii) | Extract Eight | Integrated tonality/harmony; C-major home context | Full bridge score | Explain tonality with specific harmonic features | Movement away from C via dominant–tonic and circle-of-fifths motion, seventh/major-seventh additions and major-to-minor changes | Coherent account using several located examples | add, combined contextual interaction |
| NZQA 2025 Q3(c) | Extract Nine, Billy Joel | Piano completion; jazz/pop context | Bars 14–22, chord symbols and opening piano texture | Complete bars 15–22 | 10 assessed chord moments in model | Idiomatic accompaniment that preserves harmonic rhythm and voice leading | add |

## Learning Ideas practice assessments

Learning Ideas material is labelled **Practice assessment reference**, never NZQA examination reference.

### 2022

| Source / part | Extract / task / key context | Given and required | Schedule/model evidence | Excellence expectation | Existing equivalent / action |
| --- | --- | --- | --- | --- | --- |
| Learning Ideas 2022 Q1(a) | Extract One; Roman analysis; A minor → G major → A minor | First phrase supplied; analyse bars 2–5 and both pivots | 16 assessed chords with exact pivots | Complete contextual progression | defer |
| Learning Ideas 2022 Q1(b)(i) | Extract Two; modulation; home A major | Identify three keys, evidence and relationships | B minor / supertonic, D major / subdominant, E major / dominant | Full evidence-linked route | add |
| Learning Ideas 2022 Q1(b)(ii) | Extract Two; A♯ function | Explain A♯ in bars 2–3 | Leading note of B minor; third of F♯7; supports perfect cadence and voice leading | Join pitch, local harmony and modulation | add, combined with Q1(b) |
| Learning Ideas 2022 Q1(c) | Extract Three; piano-style harmonisation; D major → B minor | Complete bars 1–4 in two stages with given constraints and at least one passing note | 10 assessed chord moments | Stylistic connected completion | defer |
| Learning Ideas 2022 Q2(a) | Extract Four; integrated Roman/modulation/NHT; D minor | Analyse bars 1–3, keys and NHTs | 8 chords; F relative major, A dominant major; passing, auxiliary and accented-passing labels | Integrate progression, tonal route and note classification | add |
| Learning Ideas 2022 Q2(b) | Extract Five; piano completion; C → G → D | Add bass and two inner parts | 9 chord moments | Convincing modulating texture | defer |
| Learning Ideas 2022 Q3(a) | Extract Six; jazz chord analysis | Opening supplied; identify remaining symbols | 8 assessed chords | Secure consecutive analysis | defer |
| Learning Ideas 2022 Q3(b) | Extract Seven; piano completion | Continue supplied accompaniment | 5 assessed chord moments | Idiomatic complete phrase | defer |

### 2023

| Source / part | Extract / task / key context | Given and required | Schedule/model evidence | Excellence expectation | Existing equivalent / action |
| --- | --- | --- | --- | --- | --- |
| Learning Ideas 2023 Q1(a) | Extract One; Roman/cadence analysis; F → C | First chord; analyse bars 1–4/pivot and complete two cadences | 11 chords plus two perfect cadences | Integrated progression and cadence realisation | defer |
| Learning Ideas 2023 Q1(b) | Extract Two; modulation; A-major home | Identify three keys/evidence/relationships | F♯ minor, E major and D major with schedule relationships | Evidence-linked route | defer |
| Learning Ideas 2023 Q1(c) | Extract Three; SATB completion; A minor → D minor | Complete missing parts with two passing notes | 8 chord moments | Stylistic full phrase | defer |
| Learning Ideas 2023 Q2(a) | Extract Four; integrated Roman/modulation/NHT; F minor | Analyse harmony, local keys and NHTs | A♭ relative major, C minor dominant and published NHT labels | Integrated evidence-rich analysis | defer |
| Learning Ideas 2023 Q2(b) | Extract Five; piano completion; B → G♭ → D♭ | Add bass and inner parts in style | 9 chord moments | Convincing tonal route | defer |
| Learning Ideas 2023 Q3(a) | Extract Six; integrated tonality/harmony; E♭ major | Analyse tonal establishment, tonicisation/modulation and progression | ii–V–I patterns; IV→iv opening ambiguity; B♭7–E♭ cadence; vi; minor ii–V7–i regions; diminished ii | Several precise linked points across the extract | add |
| Learning Ideas 2023 Q3(b) | Extract Seven; jazz chord analysis | First chord; analyse bars 44–52 | 12 assessed chords | Extended exact symbols | defer |
| Learning Ideas 2023 Q3(c) | Extract Eight; piano completion | Complete bars 53–60 from symbols | 9 chord moments | Idiomatic stylistic completion | defer |

### 2024

| Source / part | Extract / task / key context | Given and required | Schedule/model evidence | Excellence expectation | Existing equivalent / action |
| --- | --- | --- | --- | --- | --- |
| Learning Ideas 2024 Q1(a) | Extract One; Roman analysis; A → E | First chord; analyse bars 1–4 including pivot | 16 assessed chords | Complete contextual route | defer |
| Learning Ideas 2024 Q1(b) | Extract Two; modulation; E-major home | Identify three keys/evidence/relationships | A subdominant, E minor tonic minor, B dominant | Full evidence-based route | defer |
| Learning Ideas 2024 Q1(c) | Extract Three; SATB completion | Complete parts with required passing-note work | 9 chord moments | Fluent stylistic phrase | defer |
| Learning Ideas 2024 Q2(a) | Extract Four; two-device contextual analysis | Identify two devices and explain functions | Tonic pedal; melodic sequence; diminution accepted with located effects | Two distinct evidence/function/effect points | add |
| Learning Ideas 2024 Q2(b) | Extract Five; Roman analysis; D → A | Analyse extended passage and pivot | 14 assessed chords | Complete progression | defer |
| Learning Ideas 2024 Q2(c) | Extract Six; piano completion; B minor → E minor → G major | Continue supplied texture | Published harmonic route/model | Convincing modulating completion | defer |
| Learning Ideas 2024 Q3(a) | Extract Seven; integrated jazz tonality/harmony; F major → D minor | Analyse symbols, cadence/tonality and harmonic devices | 14 chords; perfect cadences, minor ii–V–i, G9/G13 secondary dominants | Integrate chord identity with tonal function | add |
| Learning Ideas 2024 Q3(b) | Extract Eight; piano completion | Continue accompaniment from printed symbols | Published model | Idiomatic full phrase | defer |

### 2025

| Source / part | Extract / task / key context | Given and required | Schedule/model evidence | Excellence expectation | Existing equivalent / action |
| --- | --- | --- | --- | --- | --- |
| Learning Ideas 2025 Q1(a) | Extract One; Roman analysis; B♭ major → related key | First two labels; analyse bars 1–4/pivot | 16 assessed chords | Complete contextual analysis | defer |
| Learning Ideas 2025 Q1(b) | Extract Two; modulation; B♭-major home | Identify two keys/evidence/relationships | G minor and C minor regions with published evidence | Evidence-linked relationship analysis | defer |
| Learning Ideas 2025 Q1(c) | Extract Three; SATB completion; F → B♭ | Complete from supplied Roman route with two passing notes | 8 chord moments | Stylistic full phrase | defer |
| Learning Ideas 2025 Q2(a)(i) | Extract Four; extended Roman analysis through several keys | First 11 chords and three keys supplied; analyse bars 10–25 | 15 assessed chords in answer region | Extended exact progression | defer |
| Learning Ideas 2025 Q2(a)(ii) | Extract Four; integrated tonal/harmonic/NHT analysis | Discuss modulations, relationships and NHTs | A/B/E-minor route; pivot/direct/sequence evidence; passing, accented passing, grace, mordent, suspension and appoggiatura examples | Multiple coherent, located analytical points | add |
| Learning Ideas 2025 Q2(b) | Extract Five; piano completion; E minor | Melody and harmonic indications | 12 chord moments | Consistent texture across full region | defer |
| Learning Ideas 2025 Q3(a)(i) | Extract Six; jazz chord analysis | First chord; analyse bars 1–8 | 11 assessed chords | Secure extended symbols | defer |
| Learning Ideas 2025 Q3(a)(ii) | Extract Six; chromatic-inner-line analysis | Identify device bars 1–3 and effect | Descending E♭–D–D♭–C inner line; movement over static roots/voice leading from I to IV | Connect located chromatic motion to harmonic effect | defer, combine with Q3(a) when its three-stave vocal-and-piano extract is transcribed |
| Learning Ideas 2025 Q3(b) | Piano extract | Continue bars 2–8 from chord indications | Published model | Idiomatic complete phrase | defer |

## Implementation rule

The bank may grow in stages, but the audit is never reduced to the implemented subset. New reference objects must point back to one row above, include a `sourceSpec`, and pass both music-theory validation and independent source-fidelity validation. Reference counts in tests are minimum/manifest assertions, not brittle totals.
