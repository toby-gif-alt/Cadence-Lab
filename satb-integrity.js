(function () {
  "use strict";
  const data = window.CadenceData;
  if (!data?.questions) throw new Error("Cadence Lab SATB integrity requires the question bank first.");

  const VOICES = ["soprano", "alto", "tenor", "bass"];
  const PC = Object.freeze({ C:0,"C#":1,Db:1,D:2,"D#":3,Eb:3,E:4,F:5,"F#":6,Gb:6,G:7,"G#":8,Ab:8,A:9,"A#":10,Bb:10,B:11 });
  const RANGES = Object.freeze({ soprano:[60,81], alto:[55,74], tenor:[48,67], bass:[40,60] });

  function midi(value) {
    const match = /^([A-G])([#b]?)(-?\d+)$/.exec(String(value || ""));
    return match ? (Number(match[3]) + 1) * 12 + PC[`${match[1]}${match[2]}`] : null;
  }

  function parseChord(value) {
    const raw = String(value || "").replaceAll("♯", "#").replaceAll("♭", "b");
    const match = /^([A-G](?:#|b)?)(m?)(7?)(?:\/([A-G](?:#|b)?))?$/.exec(raw);
    if (!match) return null;
    const root = PC[match[1]];
    const minor = match[2] === "m";
    const seventh = match[3] === "7";
    const pcs = [root, (root + (minor ? 3 : 4)) % 12, (root + 7) % 12];
    if (seventh) pcs.push((root + 10) % 12);
    return { root, minor, seventh, pcs, bass: match[4] ? PC[match[4]] : root };
  }

  function moments(question) {
    return (question.score?.measures || []).flatMap((measure, measureIndex) =>
      (measure.events || []).flatMap((event, eventIndex) =>
        event.voices && VOICES.every((voice) => event.voices[voice])
          ? [{ measureIndex, eventIndex, voices: event.voices }]
          : []
      )
    );
  }

  const intervalClass = (first, second) => Math.abs(first - second) % 12;
  const similarMotion = (first, second) => first !== 0 && second !== 0 && first * second > 0;

  function modelErrors(question) {
    if (question.sourceType !== "original-practice" || question.category !== "satb") return [];
    const errors = [];
    const modelMoments = moments(question);
    const harmony = question.score?.harmonicEvents || [];
    if (modelMoments.length !== harmony.length) {
      errors.push(`${question.id}: ${modelMoments.length} model moments but ${harmony.length} harmonic events`);
    }

    modelMoments.forEach((moment, index) => {
      const pitches = VOICES.map((voice) => midi(moment.voices[voice]));
      if (pitches.some((pitch) => !Number.isFinite(pitch))) {
        errors.push(`${question.id}: unreadable pitch at moment ${index + 1}`);
        return;
      }
      VOICES.forEach((voice, voiceIndex) => {
        const [low, high] = RANGES[voice];
        if (pitches[voiceIndex] < low || pitches[voiceIndex] > high) {
          errors.push(`${question.id}: ${voice} outside range at moment ${index + 1}`);
        }
      });
      if (!(pitches[0] >= pitches[1] && pitches[1] >= pitches[2] && pitches[2] >= pitches[3])) {
        errors.push(`${question.id}: voice crossing at moment ${index + 1}`);
      }
      if (pitches[0] - pitches[1] > 12 || pitches[1] - pitches[2] > 12) {
        errors.push(`${question.id}: upper-voice spacing exceeds an octave at moment ${index + 1}`);
      }

      const chord = parseChord(harmony[index]?.chordSymbol);
      if (!chord) {
        errors.push(`${question.id}: unsupported chord identity at moment ${index + 1}`);
      } else {
        const soundingPcs = pitches.map((pitch) => pitch % 12);
        soundingPcs.forEach((pc) => {
          if (!chord.pcs.includes(pc)) errors.push(`${question.id}: non-chord tone at moment ${index + 1}`);
        });
        chord.pcs.forEach((pc) => {
          if (!soundingPcs.includes(pc)) errors.push(`${question.id}: incomplete ${harmony[index].chordSymbol} at moment ${index + 1}`);
        });
        if (soundingPcs[3] !== chord.bass) errors.push(`${question.id}: wrong inversion at moment ${index + 1}`);
      }

      if (!index) return;
      const previous = VOICES.map((voice) => midi(modelMoments[index - 1].voices[voice]));
      const motion = pitches.map((pitch, voiceIndex) => pitch - previous[voiceIndex]);
      motion.forEach((distance, voiceIndex) => {
        if (Math.abs(distance) > 12 || [6,10,11].includes(Math.abs(distance))) {
          errors.push(`${question.id}: unsuitable melodic leap in ${VOICES[voiceIndex]} into moment ${index + 1}`);
        }
      });
      for (let upper = 0; upper < 3; upper += 1) {
        if (pitches[upper] < previous[upper + 1] || pitches[upper + 1] > previous[upper]) {
          errors.push(`${question.id}: voice overlap between ${VOICES[upper]} and ${VOICES[upper + 1]} into moment ${index + 1}`);
        }
      }
      for (let first = 0; first < 4; first += 1) {
        for (let second = first + 1; second < 4; second += 1) {
          const before = intervalClass(previous[first], previous[second]);
          const after = intervalClass(pitches[first], pitches[second]);
          if ([0,7].includes(before) && before === after && similarMotion(motion[first], motion[second])) {
            errors.push(`${question.id}: consecutive perfect interval between ${VOICES[first]} and ${VOICES[second]} into moment ${index + 1}`);
          }
        }
      }
      const outerAfter = intervalClass(pitches[0], pitches[3]);
      if ([0,7].includes(outerAfter) && similarMotion(motion[0], motion[3]) && Math.abs(motion[0]) > 2) {
        errors.push(`${question.id}: direct outer perfect interval with a soprano leap into moment ${index + 1}`);
      }

      const priorChord = parseChord(harmony[index - 1]?.chordSymbol);
      const nextChord = parseChord(harmony[index]?.chordSymbol);
      const isDominantResolution = priorChord && nextChord && !priorChord.minor &&
        priorChord.root === (nextChord.root + 7) % 12;
      if (isDominantResolution) {
        const leadingPc = (priorChord.root + 4) % 12;
        const leadingVoices = previous
          .map((pitch, voiceIndex) => ({ pitch, voiceIndex }))
          .filter(({ pitch }) => pitch % 12 === leadingPc);
        if (leadingVoices.length > 1) errors.push(`${question.id}: doubled leading tone before moment ${index + 1}`);
        leadingVoices.forEach(({ pitch, voiceIndex }) => {
          if (pitches[voiceIndex] - pitch !== 1) errors.push(`${question.id}: leading tone does not resolve up into moment ${index + 1}`);
        });
        if (priorChord.seventh) {
          const seventhPc = (priorChord.root + 10) % 12;
          previous.forEach((pitch, voiceIndex) => {
            if (pitch % 12 === seventhPc && ![1,2].includes(pitch - pitches[voiceIndex])) {
              errors.push(`${question.id}: dominant seventh does not resolve down into moment ${index + 1}`);
            }
          });
        }
      }
    });
    return errors;
  }

  function sourceCorrectionErrors() {
    const errors = [];
    const q1c = data.questions.find((question) => question.id === "nzqa-2025-bach-satb");
    const alto = q1c?.score?.measures?.[1]?.voices?.alto || [];
    if (!(alto[0]?.pitch === "D4" && alto[0]?.tieToNext && alto[1]?.pitch === "D4" &&
          alto[1]?.duration === "8" && alto[2]?.pitch === "C4" && alto[2]?.duration === "8")) {
      errors.push("nzqa-2025-bach-satb: bar 22 IV9–8 must show D tied to D, resolving to C");
    }
    if (q1c?.score?.measures?.[2]?.voices?.bass?.[0]?.pitch !== "G3") {
      errors.push("nzqa-2025-bach-satb: bar 23 opening bass must be G3 as printed in the schedule");
    }
    return errors;
  }

  function audit() {
    const errors = [...data.questions.flatMap(modelErrors), ...sourceCorrectionErrors()];
    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  const initialAudit = audit();
  if (!initialAudit.valid) throw new Error(`SATB integrity failed:\n${initialAudit.errors.join("\n")}`);
  window.CadenceSatbIntegrity = Object.freeze({ modelErrors, audit, initialAudit, ranges: RANGES });
})();
