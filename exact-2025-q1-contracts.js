(function () {
  "use strict";
  const questions = window.CadenceData?.questions || [];
  const q1b = questions.find((question) => question.id === "nzqa-2025-bach-modulation");
  if (!q1b?.sourceSpec) throw new Error("Missing exact 2025 Q1(b) source contract.");
  q1b.sourceSpec.sectionRanges = [
    { label: "X", key: "E minor", start: 4, end: 11 },
    { label: "Y", key: "D major", start: 21, end: 24 },
    { label: "Z", key: "A minor", start: 66, end: 73 },
  ];
})();
