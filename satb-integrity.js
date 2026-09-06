(function () {
  "use strict";

  const data = window.CadenceData;
  if (!data?.questions) throw new Error("Cadence Lab SATB integrity requires the question bank first.");

  const VOICES = ["soprano", "alto", "tenor", "bass"];
  const PC = Object.freeze({ C:0,"C#":1,Db:1,D:2,"D#":3,Eb:3,E:4,F:5,"F#":6,Gb:6,G:7,"G#":8,Ab:8,A:9,"A#":10,Bb:10,B:11 });
  const RANGES = Object.freeze({
    soprano: [60,81],
    alto: [55,74],
    tenor: [48,67],
    bass: [40,60],
  });

  function midi(value) {
    const match = /^([A-G])([#b]?)(-?\d+)$/.exec(String(value || ""));
    if (!match) return null;
    return (Number(match[3]) + 1) * 12 + PC[`${match[1]}${match[2]}`];
  }

  function question(id) {
    const item = data.questions.find((candidate) => candidate.id === id);
    if (!item) throw new Error(`Missing SATB question ${id}`);
    return item;
  }

  function setMoment(id, measureIndex, eventIndex, values) {
    const q = question(id);
    const event = q.score?.measures?.[measureIndex]?.events?.[eventIndex];
    if (!event?.voices) throw new Error(`${id}: missing model moment ${measureIndex + 1}.${eventIndex + 1}`);
    const voices = Object.fromEntries(VOICES.map((voice, index) => [voice, values[index]]));
    event.voices = voices;
    if (event.questionVoices) {
      if (Object.hasOwn(event.questionVoices, "soprano")) event.questionVoices.soprano = voices.soprano;
      if (Object.hasOwn(event.questionVoices, "bass")) event.questionVoices.bass = voices.bass;
    }
  }

  function replaceOriginalModels() {
    const sets = {
      "satb-f-c": {
        positions: [[0,0],[0,1],[0,2],[0,3],[1,0],[1,1],[2,0]],
        voicings: [
          ["A4","F4","C4","F2"], ["Bb4","F4","D4","Bb2"],
          ["G4","E4","Bb3","C3"], ["C5","F4","A3","F2"],
          ["F5","A4","A3","C3"], ["F5","B4","D4","G3"],
          ["E5","C5","G4","C3"],
        ],
      },
      "satb-gminor": {
        positions: [[0,0],[0,1],[1,0],[1,1],[2,0],[2,1],[2,2]],
        voicings: [
          ["G5","Bb4","D4","G2"], ["Eb5","G4","C4","C3"],
          ["C5","F#4","A3","D3"], ["Bb4","G4","D4","G2"],
          ["Eb5","G4","C4","C3"], ["D5","F#4","A3","D3"],
          ["D5","G4","Bb3","G2"],
        ],
      },
      "satb-c-aminor": {
        positions: [[0,0],[0,1],[0,2],[0,3],[1,0],[1,1],[2,0]],
        voicings: [
          ["G4","E4","C4","C3"], ["C5","F4","A3","F2"],
          ["B4","F4","D4","G2"], ["C5","E4","A3","A2"],
          ["D5","F4","A3","D3"], ["B4","G#4","D4","E3"],
          ["E5","A4","C4","A2"],
        ],
      },
    };
    Object.entries(sets).forEach(([id, set]) => set.voicings.forEach((values, index) => {
      const [measureIndex,eventIndex] = set.positions[index];
      setMoment(id, measureIndex, eventIndex, values);
    }));
  }

  function fixExact2025Q1cModel() {
    const q = question("nzqa-2025-bach-satb");
    // NZQA 2025 assessment schedule p.4: in bar 22 the alto's suspended
    // D continues as an eighth note and resolves directly to C on the second
    // eighth before the following C crotchet. The earlier transcription had B.
    q.score.measures[1].voices.alto[2].pitch = "C4";
    // Schedule p.4, bar 23 beat 1: the bass is C3, not G3.
    q.score.measures[2].voices.bass[0].pitch = "C3";
  }

  function parseChord(symbol) {
    const raw = String(symbol || "").replaceAll("♯", "#").replaceAll("♭", "b");
    const match = /^([A-G](?:#|b)?)(m?)(7?)(?:\/([A-G](?:#|b)?))?$/.exec(raw);
    if (!match) return null;
    const root = PC[match[1]];
    const minor = match[2] === "m";
    const seventh = match[3] === "7";
    const pcs = [root, (root + (minor ? 3 : 4)) % 12, (root + 7) % 12];
    if (seventh) pcs.push((root + 10) % 12);
    return { root, pcs, seventh, bass: match[4] ? PC[match[4]] : root };
  }

  function moments(q) {
    const result = [];
    (q.score?.measures || []).forEach((measure, measureIndex) => (measure.events || []).forEach((event, eventIndex) => {
      if (event.voices && VOICES.every((voice) => event.voices[voice])) result.push({ measureIndex, eventIndex, voices: event.voices });
    }));
    return result;
  }

  const intervalClass = (a,b) => Math.abs(a-b) % 12;
  const sameDirection = (a,b) => a !== 0 && b !== 0 && a * b > 0;

  function modelErrors(q) {
    if (q.sourceType !== "original-practice" || q.category !== "satb") return [];
    const errors = [];
    const ms = moments(q);
    const harmony = q.score?.harmonicEvents || [];
    if (ms.length !== harmony.length) errors.push(`${q.id}: ${ms.length} model moments but ${harmony.length} harmonic events`);

    ms.forEach((moment, index) => {
      const pitches = VOICES.map((voice) => midi(moment.voices[voice]));
      if (pitches.some((pitch) => !Number.isFinite(pitch))) {
        errors.push(`${q.id}: unreadable pitch at model moment ${index + 1}`);
        return;
      }
      VOICES.forEach((voice, voiceIndex) => {
        const [low, high] = RANGES[voice];
        if (pitches[voiceIndex] < low || pitches[voiceIndex] > high) errors.push(`${q.id}: ${voice} outside normal chorale range at model moment ${index + 1}`);
      });
      if (!(pitches[0] >= pitches[1] && pitches[1] >= pitches[2] && pitches[2] >= pitches[3])) errors.push(`${q.id}: voice crossing at model moment ${index + 1}`);
      if (pitches[0] - pitches[1] > 12) errors.push(`${q.id}: soprano-alto spacing exceeds an octave at model moment ${index + 1}`);
      if (pitches[1] - pitches[2] > 12) errors.push(`${q.id}: alto-tenor spacing exceeds an octave at model moment ${index + 1}`);

      const chord = parseChord(harmony[index]?.chordSymbol);
      if (chord) {
        const pcs = pitches.map((pitch) => pitch % 12);
        pcs.forEach((pc) => { if (!chord.pcs.includes(pc)) errors.push(`${q.id}: non-chord tone in model chord ${index + 1}`); });
        chord.pcs.forEach((pc) => { if (!pcs.includes(pc)) errors.push(`${q.id}: incomplete ${harmony[index].chordSymbol} at model moment ${index + 1}`); });
        if (pitches[3] % 12 !== chord.bass) errors.push(`${q.id}: wrong bass/inversion for ${harmony[index].chordSymbol} at model moment ${index + 1}`);
      }

      if (!index) return;
      const previous = VOICES.map((voice) => midi(ms[index - 1].voices[voice]));
      const motion = pitches.map((pitch, voiceIndex) => pitch - previous[voiceIndex]);
      motion.forEach((distance, voiceIndex) => {
        const limit = voiceIndex === 3 ? 12 : 7;
        if (Math.abs(distance) > limit) errors.push(`${q.id}: excessive melodic leap in ${VOICES[voiceIndex]} into model moment ${index + 1}`);
        if ([6,10,11].includes(Math.abs(distance))) errors.push(`${q.id}: awkward tritone/seventh melodic leap in ${VOICES[voiceIndex]} into model moment ${index + 1}`);
      });
      for (let upper = 0; upper < 3; upper += 1) {
        if (pitches[upper] < previous[upper + 1] || pitches[upper + 1] > previous[upper]) errors.push(`${q.id}: voice overlap between ${VOICES[upper]} and ${VOICES[upper + 1]} into model moment ${index + 1}`);
      }
      for (let first = 0; first < 4; first += 1) for (let second = first + 1; second < 4; second += 1) {
        const before = intervalClass(previous[first], previous[second]);
        const after = intervalClass(pitches[first], pitches[second]);
        if (before === after && [0,7].includes(after) && sameDirection(motion[first], motion[second])) errors.push(`${q.id}: consecutive perfect ${after === 7 ? "fifths" : "octaves/unisons"} between ${VOICES[first]} and ${VOICES[second]} into model moment ${index + 1}`);
      }
      const outerAfter = intervalClass(pitches[0], pitches[3]);
      if ([0,7].includes(outerAfter) && sameDirection(motion[0], motion[3]) && Math.abs(motion[0]) > 2) errors.push(`${q.id}: direct outer perfect ${outerAfter === 7 ? "fifth" : "octave"} with a soprano leap into model moment ${index + 1}`);

      const previousChord = parseChord(harmony[index - 1]?.chordSymbol);
      if (previousChord?.seventh) {
        const leadingPc = (previousChord.root + 4) % 12;
        const seventhPc = (previousChord.root + 10) % 12;
        previous.forEach((pitch, voiceIndex) => {
          if (pitch % 12 === leadingPc && pitches[voiceIndex] - pitch !== 1) errors.push(`${q.id}: dominant leading tone does not resolve up by semitone into model moment ${index + 1}`);
          if (pitch % 12 === seventhPc && ![1,2].includes(pitch - pitches[voiceIndex])) errors.push(`${q.id}: dominant seventh does not resolve down by step into model moment ${index + 1}`);
        });
      }
    });
    return errors;
  }

  function audit() {
    const errors = data.questions.flatMap(modelErrors);
    const q1c = question("nzqa-2025-bach-satb");
    const alto = q1c.score.measures[1].voices.alto;
    if (!(alto[0]?.pitch === "D4" && alto[0]?.tieToNext && alto[1]?.pitch === "D4" && alto[1]?.duration === "8" && alto[2]?.pitch === "C4" && alto[2]?.duration === "8")) errors.push("nzqa-2025-bach-satb: IV9-8 suspension is not D4 tied into D4 then resolved to C4");
    if (q1c.score.measures[2].voices.bass[0]?.pitch !== "C3") errors.push("nzqa-2025-bach-satb: bar 23 opening model bass does not match the schedule");
    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  replaceOriginalModels();
  fixExact2025Q1cModel();
  const initialAudit = audit();
  if (!initialAudit.valid) throw new Error(`SATB integrity failed:\n${initialAudit.errors.join("\n")}`);

  window.CadenceSatbIntegrity = Object.freeze({ modelErrors, audit, initialAudit });
})();
