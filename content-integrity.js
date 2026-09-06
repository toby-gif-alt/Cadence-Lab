(function () {
  "use strict";

  const data = window.CadenceData;
  if (!data?.questions) throw new Error("Cadence Lab content integrity requires the question bank first.");

  function question(id) {
    const item = data.questions.find((candidate) => candidate.id === id);
    if (!item) throw new Error(`Missing content-integrity question ${id}`);
    return item;
  }

  function fixValentineAdaptation() {
    const q = question("nzqa-2021-valentine-techniques");
    const displayedContext =
      "Complete the chord boxes above displayed bars 1–9, classify the marked X, Y and Z melody notes, and explain the two harmonic techniques operating in displayed bars 1–5.";
    q.context = displayedContext;
    q.studentContext = displayedContext;
    q.score.barNumbers = Array.from({ length: q.score.measures.length }, (_, index) => index + 1);
    q.score.showBarNumbers = true;

    // The displayed pedagogical score is not the NZQA source transcription.
    // Mark only notes whose classification is actually supported by this score.
    const annotations = [
      { measure: 2, beat: 2.5, staff: "treble", pitch: "F5", label: "X" },
      { measure: 3, beat: 3, staff: "treble", pitch: "D5", label: "Y" },
      { measure: 4, beat: 2.5, staff: "treble", pitch: "F5", label: "X" },
      { measure: 5, beat: 3, staff: "treble", pitch: "G4", label: "Y" },
      { measure: 6, beat: 3, staff: "treble", pitch: "G4", label: "Z" },
    ];
    q.score.noteAnnotations = annotations.map((item) => ({ ...item }));
    q.sourceSpec.noteAnnotations = annotations.map((item) => ({ ...item }));
    q.sourceSpec.noteAnnotationLabels = annotations.map((item) => item.label);
    q.sourceSpec.displayedBars = "1–9";

    q.score.nonHarmonicNotes = [
      { measure: 2, event: 1, staff: "treble", pitch: "F5", chordSymbol: "Cm9(maj7)", type: "appoggiatura" },
      { measure: 3, event: 1, staff: "treble", pitch: "D5", chordSymbol: "Cm7", type: "accented passing note" },
      { measure: 4, event: 1, staff: "treble", pitch: "F5", chordSymbol: "Cm9(add6)", type: "appoggiatura" },
      { measure: 5, event: 1, staff: "treble", pitch: "G4", chordSymbol: "Fm/C", type: "accented passing note" },
      { measure: 6, event: 1, staff: "treble", pitch: "G4", chordSymbol: "Fm", type: "passing note" },
    ];

    const fields = q.interaction?.fields || [];
    const accepted = {
      x: "appoggiatura",
      y: "accented passing note",
      z: "passing note",
    };
    fields.forEach((field) => {
      if (accepted[field.id]) field.acceptedAnswers = [{ label: accepted[field.id] }];
    });

    q.answer = [
      "<strong>Displayed chord route:</strong> Cm–Cm9(maj7)–Cm7–Cm9(add6)–Fm/C–Fm–Dm7(♭5)–G7–Fm/A♭–G7–Cm.",
      "In this displayed adaptation, X is an appoggiatura in bars 2 and 4, Y is an accented passing note in bars 3 and 5, and Z is a passing note in bar 6. The descending chromatic inner line creates movement and interest against the repeated melody, while the C tonic pedal in displayed bars 1–5 provides stability.",
    ];
  }

  function audit() {
    const errors = [];
    const q = question("nzqa-2021-valentine-techniques");
    const expectedAnnotations = ["2:X:F5", "3:Y:D5", "4:X:F5", "5:Y:G4", "6:Z:G4"];
    const actualAnnotations = (q.score.noteAnnotations || []).map((item) => `${item.measure}:${item.label}:${item.pitch}`);
    if (JSON.stringify(actualAnnotations) !== JSON.stringify(expectedAnnotations)) {
      errors.push(`Valentine displayed note markers are ${JSON.stringify(actualAnnotations)}`);
    }
    const expectedTypes = ["appoggiatura", "accented passing note", "appoggiatura", "accented passing note", "passing note"];
    const actualTypes = (q.score.nonHarmonicNotes || []).map((item) => item.type);
    if (JSON.stringify(actualTypes) !== JSON.stringify(expectedTypes)) {
      errors.push(`Valentine NHT classifications are ${JSON.stringify(actualTypes)}`);
    }
    const fieldMap = Object.fromEntries((q.interaction?.fields || []).map((field) => [field.id, field.acceptedAnswers?.[0]?.label]));
    if (fieldMap.x !== "appoggiatura" || fieldMap.y !== "accented passing note" || fieldMap.z !== "passing note") {
      errors.push(`Valentine interaction answers disagree with the displayed score: ${JSON.stringify(fieldMap)}`);
    }
    if (/21|22|23|24|25|26|27|28|29/.test(q.studentContext || "")) {
      errors.push("Valentine learner prompt leaks source bar numbers into the 1–9 adaptation");
    }
    if ((q.score.barNumbers || []).join(",") !== "1,2,3,4,5,6,7,8,9") {
      errors.push("Valentine displayed bar numbers are not 1–9");
    }
    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  fixValentineAdaptation();
  const initialAudit = audit();
  if (!initialAudit.valid) throw new Error(`Content integrity failed:\n${initialAudit.errors.join("\n")}`);

  window.CadenceContentIntegrity = Object.freeze({ audit, initialAudit });
})();
