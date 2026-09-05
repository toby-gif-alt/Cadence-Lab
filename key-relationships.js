(function () {
  "use strict";

  const LETTERS = ["C", "D", "E", "F", "G", "A", "B"];
  const NATURAL_PITCH_CLASSES = Object.freeze({
    C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11,
  });
  const SCALE_INTERVALS = Object.freeze({
    major: Object.freeze([0, 2, 4, 5, 7, 9, 11]),
    minor: Object.freeze([0, 2, 3, 5, 7, 8, 10]),
  });
  const DEGREE_NAMES = Object.freeze([
    "tonic",
    "supertonic",
    "mediant",
    "subdominant",
    "dominant",
    "submediant",
    "subtonic",
  ]);
  const ROMAN_DEGREES = Object.freeze({
    major: Object.freeze(["I", "II", "III", "IV", "V", "VI", "VII"]),
    minor: Object.freeze(["i", "ii", "iii", "iv", "v", "vi", "vii"]),
  });

  function normalizeAccidental(value) {
    return String(value || "")
      .replaceAll("#", "♯")
      .replaceAll("b", "♭");
  }

  function parseKey(value) {
    if (value && typeof value === "object") {
      return parseKey(`${value.tonic || ""} ${value.mode || ""}`);
    }
    const match = /^([A-Ga-g])([#b♯♭]?)[ ]+(major|minor)$/i.exec(
      String(value || "").trim()
    );
    if (!match) throw new Error(`Invalid semantic key: ${value}`);
    return Object.freeze({
      tonic: `${match[1].toUpperCase()}${normalizeAccidental(match[2])}`,
      mode: match[3].toLowerCase(),
    });
  }

  function formatKey(value) {
    const key = parseKey(value);
    return `${key.tonic} ${key.mode}`;
  }

  function pitchClass(value) {
    const key = parseKey(typeof value === "string" && / (?:major|minor)$/i.test(value)
      ? value
      : `${value.tonic} ${value.mode}`);
    const accidental = key.tonic.slice(1);
    const offset = accidental === "♯" ? 1 : accidental === "♭" ? -1 : 0;
    return (NATURAL_PITCH_CLASSES[key.tonic[0]] + offset + 12) % 12;
  }

  function keysEqual(firstValue, secondValue) {
    const first = parseKey(firstValue);
    const second = parseKey(secondValue);
    return first.tonic === second.tonic && first.mode === second.mode;
  }

  function accidentalFor(letter, targetPitchClass) {
    let difference = (targetPitchClass - NATURAL_PITCH_CLASSES[letter] + 12) % 12;
    if (difference > 6) difference -= 12;
    return { "-2": "♭♭", "-1": "♭", 0: "", 1: "♯", 2: "♯♯" }[difference] ?? null;
  }

  function transposeSpelled(value, letterSteps, semitones, mode) {
    const key = parseKey(value);
    const sourceLetterIndex = LETTERS.indexOf(key.tonic[0]);
    const targetLetter = LETTERS[(sourceLetterIndex + letterSteps + 7) % 7];
    const targetPitchClass = (pitchClass(key) + semitones + 12) % 12;
    const accidental = accidentalFor(targetLetter, targetPitchClass);
    if (accidental == null || accidental.length > 1) {
      throw new Error(`Unsupported key spelling from ${formatKey(key)}.`);
    }
    return parseKey(`${targetLetter}${accidental} ${mode}`);
  }

  function relativeKey(value) {
    const key = parseKey(value);
    return key.mode === "major"
      ? transposeSpelled(key, 5, 9, "minor")
      : transposeSpelled(key, 2, 3, "major");
  }

  function functionalKey(value, functionName) {
    const key = parseKey(value);
    if (functionName === "dominant") {
      return transposeSpelled(key, 4, 7, key.mode);
    }
    if (functionName === "subdominant") {
      return transposeSpelled(key, 3, 5, key.mode);
    }
    throw new Error(`Unsupported functional key: ${functionName}`);
  }

  function unique(values) {
    return [...new Set(values.filter(Boolean))];
  }

  function relationshipBetween(homeValue, localValue) {
    const home = parseKey(homeValue);
    const local = parseKey(localValue);
    const homeKey = formatKey(home);
    const localKey = formatKey(local);

    if (home.tonic === local.tonic && home.mode !== local.mode) {
      const canonical = local.mode === "major"
        ? "parallel / tonic major"
        : "parallel / tonic minor";
      return Object.freeze({
        homeKey,
        localKey,
        canonical,
        degree: local.mode === "major" ? "I" : "i",
        acceptedLabels: Object.freeze(unique([
          canonical,
          local.mode === "major" ? "parallel major" : "parallel minor",
          local.mode === "major" ? "tonic major" : "tonic minor",
        ])),
      });
    }

    const homeLetterIndex = LETTERS.indexOf(home.tonic[0]);
    const localLetterIndex = LETTERS.indexOf(local.tonic[0]);
    const degreeIndex = (localLetterIndex - homeLetterIndex + 7) % 7;
    const expectedPitchClass = (
      pitchClass(home) + SCALE_INTERVALS[home.mode][degreeIndex]
    ) % 12;
    if (pitchClass(local) !== expectedPitchClass) {
      return Object.freeze({
        homeKey,
        localKey,
        canonical: "chromatic relationship",
        degree: null,
        acceptedLabels: Object.freeze([]),
      });
    }

    const degree = ROMAN_DEGREES[local.mode][degreeIndex];
    const degreeName = DEGREE_NAMES[degreeIndex];
    const labels = [];
    let canonical = degreeName;

    if (keysEqual(local, home)) {
      canonical = "tonic";
      labels.push("tonic", degree);
    } else if (keysEqual(local, relativeKey(home))) {
      canonical = home.mode === "major" ? "relative minor" : "relative major";
      labels.push(canonical, degreeName, `${degreeName} ${local.mode}`, degree);
    } else if (degreeIndex === 4 && local.mode === "minor") {
      canonical = "dominant minor";
      labels.push(canonical, degree);
    } else {
      labels.push(degreeName, `${degreeName} ${local.mode}`, degree);
    }

    if ([0, 1, 2, 3, 4, 5, 6].includes(degreeIndex)) {
      labels.push(`${canonical} / ${degree}`);
    }

    ["dominant", "subdominant"].forEach((functionName) => {
      const functionKey = functionalKey(home, functionName);
      const functionRelative = relativeKey(functionKey);
      if (keysEqual(local, functionRelative)) {
        labels.push(
          `${functionRelative.mode === "major" ? "relative major" : "relative minor"} of the ${functionName}`
        );
      }
    });

    return Object.freeze({
      homeKey,
      localKey,
      canonical,
      degree,
      acceptedLabels: Object.freeze(unique(labels)),
    });
  }

  const relationshipChoices = Object.freeze([
    "tonic", "I", "i",
    "dominant", "dominant / V", "dominant minor", "v",
    "subdominant", "subdominant / IV", "subdominant / iv", "IV", "iv",
    "supertonic", "supertonic / ii", "II", "ii",
    "mediant", "mediant major", "mediant minor", "III", "iii",
    "submediant", "submediant major", "submediant minor", "submediant / VI", "VI", "vi",
    "subtonic", "subtonic major", "subtonic / VII", "VII",
    "relative major", "relative minor",
    "parallel / tonic major", "parallel / tonic minor",
    "relative major of the dominant", "relative minor of the dominant",
    "relative major of the subdominant", "relative minor of the subdominant",
  ]);

  window.CadenceKeyRelationships = Object.freeze({
    parseKey,
    formatKey,
    relationshipBetween,
    relationshipChoices,
  });
})();
