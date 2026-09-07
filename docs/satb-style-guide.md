# Cadence Lab SATB model-answer guide

This guide separates conditions that make a four-part model answer invalid from choices that are legal but may still make it a weak teaching model. It applies to original and adapted Cadence Lab SATB material. Exact source transcriptions remain faithful to the published score even when their style is not the house model.

The rules are grounded in the open *Music Theory for the 21st-Century Classroom* chapters on [root-position voice leading](https://musictheory.pugetsound.edu/mt21c/VoiceLeadingFourPartsRootPosition.html), [first-inversion triads](https://musictheory.pugetsound.edu/mt21c/VoiceLeadingFirstInversionTriads.html), [second-inversion triads](https://musictheory.pugetsound.edu/mt21c/VoiceLeadingSecondInversionTriads.html), [seventh-chord voice leading](https://musictheory.pugetsound.edu/mt21c/VoiceLeadingSeventhChordsIntro.html), [melodic writing](https://musictheory.pugetsound.edu/mt21c/RulesOfMelody.html), [voice ranges](https://musictheory.pugetsound.edu/mt21c/VoiceRanges.html), [spacing](https://musictheory.pugetsound.edu/mt21c/RulesOfSpacing.html), [doubling](https://musictheory.pugetsound.edu/mt21c/SummaryOfDoublingRules.html), [suspensions](https://musictheory.pugetsound.edu/mt21c/Suspension.html), [adding non-chord tones](https://musictheory.pugetsound.edu/mt21c/AddingsNCTs.html), and [avoiding parallels introduced by decoration](https://musictheory.pugetsound.edu/mt21c/AvoidingObjectionableParallels.html).

## Hard errors

- A voice lies outside the configured practical range, crosses another voice, or overlaps the previous position of an adjacent voice.
- Soprano–alto or alto–tenor spacing exceeds an octave without a documented source reason. Bass–tenor may exceed an octave.
- A chord contains an unsupported pitch, omits a defining chord member without an explicit omission contract, or has the wrong bass/inversion.
- Consecutive or exposed perfect fifths/octaves occur between parts, including compound equivalents.
- An augmented melodic interval, an extreme leap, a doubled leading note at a dominant resolution, or an unresolved leading note/chordal seventh makes the line defective.
- A declared non-harmonic note is actually a chord tone or fails its defining approach, metrical placement, preparation, retention, or resolution.

These conditions fail the strict integrity audit and block the bank from loading.

## Style-quality preferences

- Retain common tones where useful and move the remaining upper voices by step or to the nearest available chord tone. A musically motivated contrary line may override literal common-tone retention.
- Avoid repeated large leaps, especially in alto and tenor; a leap larger than a fourth should normally reverse direction, and consecutive leaps should outline a clear triad.
- Prefer independent, singable inner parts over static filler or repeated similar motion in all upper voices.
- In a root-position triad, normally double the root. In first inversion, avoid routinely doubling the bass/chordal third. In second inversion, normally double the bass/chordal fifth. Diminished chords and contrapuntal contexts require case-by-case judgement.
- Keep the overall texture comfortably spaced and avoid needlessly separating bass and tenor or repeatedly driving all parts in the same direction.
- Treat every suspension as a three-stage event: consonant preparation, accented dissonant retention, and downward stepwise resolution. A `9–8` or `4–3` label describes intervals above the current bass, not merely two adjacent pitch names.

These preferences produce review warnings. They become blocking only when a test explicitly requests strict quality mode, because a warning should prompt musical review rather than silently rewrite authored notes. When a supplied outer part makes the best complete-chord route trigger a heuristic, the question stores a concise `score.modelQualityReview` explanation so that the exception is deliberate and auditable.
