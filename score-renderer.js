(function () {
  "use strict";

  const VEXFLOW_VERSION = "4.2.5";
  const SVG_NS = "http://www.w3.org/2000/svg";
  const DEFAULT_TIME_SIGNATURE = "4/4";
  const DEFAULT_DURATION = "q";
  const MIN_RENDER_WIDTH = 520;
  const MAX_RENDER_WIDTH = 1040;
  const MEASURE_MIN_WIDTH = 330;
  const MARGIN_X = 42;

  const durationAliases = {
    "1": "w",
    whole: "w",
    w: "w",
    "2": "h",
    half: "h",
    h: "h",
    "4": "q",
    quarter: "q",
    q: "q",
    "8": "8",
    eighth: "8",
    e: "8",
    "16": "16",
    sixteenth: "16",
  };

  const durationInQuarterBeats = {
    w: 4,
    h: 2,
    q: 1,
    "8": 0.5,
    "16": 0.25,
  };

  function getVexFlow() {
    const vex = window.Vex?.Flow || window.Vex;
    if (!vex?.Renderer || !vex?.StaveNote) {
      throw new Error("VexFlow did not load before the score renderer.");
    }
    return vex;
  }

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
  }

  function normalizeDuration(value) {
    const key = String(value || DEFAULT_DURATION).toLowerCase();
    const duration = durationAliases[key];
    if (!duration) {
      throw new Error(`Unsupported note duration: ${value}`);
    }
    return duration;
  }

  function parseTimeSignature(value) {
    const match = /^(\d+)\/(\d+)$/.exec(value || DEFAULT_TIME_SIGNATURE);
    if (!match) {
      throw new Error(`Invalid time signature: ${value}`);
    }
    return {
      numerator: Number(match[1]),
      denominator: Number(match[2]),
      text: `${match[1]}/${match[2]}`,
    };
  }

  function normalizeAccidental(value) {
    return String(value || "")
      .replaceAll("♯", "#")
      .replaceAll("♭", "b")
      .replaceAll("♮", "n")
      .replaceAll("𝄪", "##")
      .replaceAll("𝄫", "bb");
  }

  function parsePitch(value) {
    const match = /^([A-Ga-g])((?:##|bb|#|b|n)?)(-?\d+)$/.exec(
      normalizeAccidental(value)
    );
    if (!match) {
      throw new Error(`Invalid pitch spelling: ${value}`);
    }
    return {
      letter: match[1].toLowerCase(),
      accidental: match[2],
      octave: Number(match[3]),
      source: String(value),
    };
  }

  function vexKey(parsedPitch) {
    return `${parsedPitch.letter}${parsedPitch.accidental}/${parsedPitch.octave}`;
  }

  function inferKeySignature(label) {
    const firstKey = String(label || "C")
      .split("→")[0]
      .trim();
    const match = /^([A-Ga-g])([#b♯♭]?)(?:\s+(major|minor))?/i.exec(firstKey);
    if (!match) return "C";
    const letter = match[1].toUpperCase();
    const accidental = normalizeAccidental(match[2]);
    const minor = match[3]?.toLowerCase() === "minor" ? "m" : "";
    return `${letter}${accidental}${minor}`;
  }

  function keySignatureForStaff(value, staff) {
    if (!value) return null;
    if (typeof value === "string") return value;
    return value[staff] || value.all || value.default || null;
  }

  function eventDuration(event, staff) {
    return normalizeDuration(
      event[`${staff}Duration`] || event.duration || DEFAULT_DURATION
    );
  }

  function measureCapacity(timeSignature) {
    return timeSignature.numerator * (4 / timeSignature.denominator);
  }

  function normalizeMeasures(score) {
    const timeSignature = parseTimeSignature(score.timeSignature);
    const initialKeySignature =
      score.keySignature || inferKeySignature(score.key);
    let globalIndex = 0;
    let currentKeySignature = initialKeySignature;

    if (Array.isArray(score.measures) && score.measures.length) {
      return score.measures.map((source, measureIndex) => {
        const measure = Array.isArray(source) ? { events: source } : source;
        const events = measure.events || measure.chords || [];
        if (measure.keySignature) currentKeySignature = measure.keySignature;
        return {
          index: measureIndex,
          events: events.map((event) => ({
            ...event,
            _index: globalIndex++,
          })),
          keySignature: measure.keySignature || null,
          effectiveKeySignature: currentKeySignature,
          cancelKeySignature: measure.cancelKeySignature || null,
          timeSignature: measure.timeSignature || null,
        };
      });
    }

    const measures = [];
    const capacity = measureCapacity(timeSignature);
    let beatCount = 0;
    let events = [];

    (score.chords || []).forEach((event) => {
      const duration = normalizeDuration(event.duration || DEFAULT_DURATION);
      const beats = durationInQuarterBeats[duration];
      if (events.length && beatCount + beats > capacity) {
        measures.push({
          index: measures.length,
          events,
          keySignature: null,
          effectiveKeySignature: currentKeySignature,
          cancelKeySignature: null,
          timeSignature: null,
        });
        events = [];
        beatCount = 0;
      }
      events.push({ ...event, _index: globalIndex++ });
      beatCount += beats;
      if (Math.abs(beatCount - capacity) < 0.0001) {
        measures.push({
          index: measures.length,
          events,
          keySignature: null,
          effectiveKeySignature: currentKeySignature,
          cancelKeySignature: null,
          timeSignature: null,
        });
        events = [];
        beatCount = 0;
      }
    });

    if (events.length) {
      measures.push({
        index: measures.length,
        events,
        keySignature: null,
        effectiveKeySignature: currentKeySignature,
        cancelKeySignature: null,
        timeSignature: null,
      });
    }
    return measures;
  }

  function visiblePitches(event, staff, showAnswer) {
    if (showAnswer) return event[staff] || [];
    const questionField = staff === "treble" ? "qTreble" : "qBass";
    return Object.hasOwn(event, questionField)
      ? event[questionField] || []
      : event[staff] || [];
  }

  function makeStaveNote(VF, pitches, clef, duration, stemDirection) {
    if (!pitches.length) {
      return new VF.GhostNote({ duration });
    }
    const parsedPitches = pitches.map(parsePitch);
    const note = new VF.StaveNote({
      clef,
      keys: parsedPitches.map(vexKey),
      duration,
      stem_direction: stemDirection,
    });
    return note;
  }

  function splitSatbPitches(pitches, staff) {
    if (!pitches.length) return { upper: [], lower: [] };
    if (pitches.length === 1) {
      return staff === "treble"
        ? { upper: pitches, lower: [] }
        : { upper: [], lower: pitches };
    }
    return {
      upper: [pitches[pitches.length - 1]],
      lower: [pitches[0]],
    };
  }

  function addReference(VF, referenceMap, eventIndex, staff, note, role) {
    if (note instanceof VF.GhostNote) return;
    if (!referenceMap.has(eventIndex)) referenceMap.set(eventIndex, {});
    const eventReferences = referenceMap.get(eventIndex);
    if (!eventReferences[staff]) eventReferences[staff] = [];
    eventReferences[staff].push({ note, role });
  }

  function buildStaffVoices(
    VF,
    events,
    staff,
    stave,
    layout,
    showAnswer,
    timeSignature,
    referenceMap
  ) {
    const voiceConfig = {
      num_beats: timeSignature.numerator,
      beat_value: timeSignature.denominator,
    };

    if (layout !== "satb") {
      const tickables = events.map((event) => {
        const note = makeStaveNote(
          VF,
          visiblePitches(event, staff, showAnswer),
          staff,
          eventDuration(event, staff),
          undefined
        );
        note.setStave(stave);
        addReference(VF, referenceMap, event._index, staff, note, "chord");
        return note;
      });
      const voice = new VF.Voice(voiceConfig)
        .setStrict(false)
        .addTickables(tickables);
      return [{ voice, tickables }];
    }

    const roles = [
      { name: "upper", direction: VF.Stem.UP },
      { name: "lower", direction: VF.Stem.DOWN },
    ];
    return roles.map((role) => {
      const tickables = events.map((event) => {
        const split = splitSatbPitches(
          visiblePitches(event, staff, showAnswer),
          staff
        );
        const note = makeStaveNote(
          VF,
          split[role.name],
          staff,
          eventDuration(event, staff),
          role.direction
        );
        note.setStave(stave);
        addReference(VF, referenceMap, event._index, staff, note, role.name);
        return note;
      });
      const voice = new VF.Voice(voiceConfig)
        .setStrict(false)
        .addTickables(tickables);
      return { voice, tickables, role: role.name };
    });
  }

  function addStaveModifiers(
    stave,
    clef,
    measure,
    systemIndex,
    measureIndexInSystem,
    timeSignature
  ) {
    const isSystemStart = measureIndexInSystem === 0;
    const shouldShowKey = isSystemStart || measure.keySignature;
    const shouldShowTime =
      (systemIndex === 0 && measureIndexInSystem === 0) ||
      Boolean(measure.timeSignature);

    if (isSystemStart) stave.addClef(clef);
    if (shouldShowKey) {
      const key = keySignatureForStaff(measure.effectiveKeySignature, clef);
      const cancelKey = keySignatureForStaff(measure.cancelKeySignature, clef);
      if (key) stave.addKeySignature(key, cancelKey || undefined);
    }
    if (shouldShowTime) {
      stave.addTimeSignature(measure.timeSignature || timeSignature.text);
    }
  }

  function createSvgElement(tagName, attributes = {}, text = "") {
    const element = document.createElementNS(SVG_NS, tagName);
    Object.entries(attributes).forEach(([name, value]) => {
      element.setAttribute(name, String(value));
    });
    if (text) element.textContent = text;
    return element;
  }

  function drawLabel(group, anchor, label, blank, showAnswer, position) {
    const x = anchor.note.getAbsoluteX();
    const y =
      position === "top"
        ? anchor.topStave.getYForLine(0) - 19
        : anchor.bottomStave.getYForLine(4) + 35;

    if (label) {
      group.appendChild(
        createSvgElement(
          "text",
          {
            x,
            y,
            "text-anchor": "middle",
            "font-family": "Georgia, 'Times New Roman', serif",
            "font-size": 15,
            "font-weight": 700,
            fill: showAnswer ? "#08775c" : "#172033",
          },
          label
        )
      );
    } else if (blank) {
      group.appendChild(
        createSvgElement("rect", {
          x: x - 28,
          y: y - 17,
          width: 56,
          height: 23,
          rx: 4,
          fill: "#f8fafc",
          stroke: "#8a96a7",
          "stroke-width": 1.2,
        })
      );
    }
  }

  function drawBracket(group, bracket, anchors, systemCount) {
    for (let systemIndex = 0; systemIndex < systemCount; systemIndex += 1) {
      const sectionAnchors = [];
      for (let eventIndex = bracket.start; eventIndex <= bracket.end; eventIndex += 1) {
        const anchor = anchors.get(eventIndex);
        if (anchor?.systemIndex === systemIndex) sectionAnchors.push(anchor);
      }
      if (!sectionAnchors.length) continue;
      const first = sectionAnchors[0];
      const last = sectionAnchors[sectionAnchors.length - 1];
      const x1 = first.note.getAbsoluteX() - 24;
      const x2 = last.note.getAbsoluteX() + 24;
      const y = first.topStave.getYForLine(0) - 37;
      const centre = (x1 + x2) / 2;

      group.appendChild(
        createSvgElement("path", {
          d: `M ${x1} ${y + 9} V ${y} H ${x2} V ${y + 9}`,
          fill: "none",
          stroke: "#2563eb",
          "stroke-width": 2,
        })
      );
      group.appendChild(
        createSvgElement("rect", {
          x: centre - 12,
          y: y - 11,
          width: 24,
          height: 20,
          rx: 5,
          fill: "#dbeafe",
        })
      );
      group.appendChild(
        createSvgElement(
          "text",
          {
            x: centre,
            y: y + 4,
            "text-anchor": "middle",
            "font-family": "Inter, ui-sans-serif, sans-serif",
            "font-size": 13,
            "font-weight": 900,
            fill: "#1e3a8a",
          },
          bracket.label
        )
      );
    }
  }

  function resolveTieReference(referenceMap, eventIndex, staff, role) {
    const references = referenceMap.get(eventIndex)?.[staff] || [];
    if (!references.length) return null;
    if (role) {
      return references.find((reference) => reference.role === role) || null;
    }
    return references[0];
  }

  function drawTies(VF, context, ties, referenceMap, anchors) {
    (ties || []).forEach((tie) => {
      const fromIndex = tie.from ?? tie.start;
      const toIndex = tie.to ?? tie.end;
      const staff = tie.staff || "treble";
      const first = resolveTieReference(
        referenceMap,
        fromIndex,
        staff,
        tie.voice
      );
      const last = resolveTieReference(
        referenceMap,
        toIndex,
        staff,
        tie.voice
      );
      if (!first || !last) return;

      const firstIndices = tie.firstIndices || [tie.firstIndex || 0];
      const lastIndices = tie.lastIndices || [tie.lastIndex || 0];
      const firstSystem = anchors.get(fromIndex)?.systemIndex;
      const lastSystem = anchors.get(toIndex)?.systemIndex;
      const direction =
        tie.direction === "above"
          ? VF.Stem.UP
          : tie.direction === "below"
            ? VF.Stem.DOWN
            : null;
      const renderTie = (configuration) => {
        const staveTie = new VF.StaveTie(configuration);
        if (direction) staveTie.setDirection(direction);
        staveTie.setContext(context).draw();
      };

      if (firstSystem === lastSystem) {
        renderTie({
          first_note: first.note,
          last_note: last.note,
          first_indices: firstIndices,
          last_indices: lastIndices,
        });
      } else {
        renderTie({
          first_note: first.note,
          last_note: null,
          first_indices: firstIndices,
          last_indices: firstIndices,
        });
        renderTie({
          first_note: null,
          last_note: last.note,
          first_indices: lastIndices,
          last_indices: lastIndices,
        });
      }
    });
  }

  function drawSystemConnectors(VF, context, topStave, bottomStave, layout) {
    if (!bottomStave) return;
    new VF.StaveConnector(topStave, bottomStave)
      .setType(VF.StaveConnector.type.SINGLE_LEFT)
      .setContext(context)
      .draw();
    new VF.StaveConnector(topStave, bottomStave)
      .setType(
        layout === "satb"
          ? VF.StaveConnector.type.BRACKET
          : VF.StaveConnector.type.BRACE
      )
      .setContext(context)
      .draw();
  }

  function layoutName(layout) {
    return {
      treble: "treble staff",
      bass: "bass staff",
      satb: "SATB score on treble and bass staves",
      piano: "piano grand staff",
      grand: "grand staff",
    }[layout];
  }

  function accessibleLabel(score, layout, showAnswer) {
    if (showAnswer && score.modelAccessibleLabel) return score.modelAccessibleLabel;
    if (!showAnswer && score.accessibleLabel) return score.accessibleLabel;
    const mode = showAnswer ? "Model answer" : "Question";
    const completion =
      score.completion && !showAnswer
        ? " Only the supplied notes are shown; complete the missing parts on paper."
        : "";
    return `${mode} musical extract: ${layoutName(layout)} in ${score.key}.${completion}`;
  }

  function render(target, score, options = {}) {
    const VF = getVexFlow();
    const showAnswer = Boolean(options.showAnswer);
    const layout = score.layout || options.layout || "grand";
    const hasTwoStaves = !["treble", "bass"].includes(layout);
    const measuredWidth =
      options.width ||
      target.getBoundingClientRect().width ||
      target.closest(".paper")?.getBoundingClientRect().width ||
      900;
    const width = Math.round(clamp(measuredWidth, MIN_RENDER_WIDTH, MAX_RENDER_WIDTH));
    const measures = normalizeMeasures(score);
    const measuresPerSystem =
      score.measuresPerSystem ||
      Math.max(1, Math.floor((width - MARGIN_X * 2) / MEASURE_MIN_WIDTH));
    const systems = [];
    for (let index = 0; index < measures.length; index += measuresPerSystem) {
      systems.push(measures.slice(index, index + measuresPerSystem));
    }

    const needsTopSpace =
      score.labelPosition === "top" || (score.brackets || []).length > 0;
    const topPadding = needsTopSpace ? 52 : 30;
    const systemHeight = hasTwoStaves
      ? topPadding + 182
      : topPadding + 104;
    const height = Math.max(150, systems.length * systemHeight + 8);

    target.replaceChildren();
    target.classList.add("notation-score");
    target.setAttribute("role", "img");
    target.setAttribute("aria-label", accessibleLabel(score, layout, showAnswer));
    target.dataset.layout = layout;
    target.dataset.renderer = `VexFlow ${VEXFLOW_VERSION}`;
    target.dataset.scoreMode = showAnswer ? "model" : "question";
    target.dataset.systemCount = String(systems.length);

    const caption = document.createElement("div");
    caption.className = "score-caption";
    caption.setAttribute("aria-hidden", "true");
    caption.textContent = `Original practice extract • ${score.key}`;
    const canvas = document.createElement("div");
    canvas.className = "notation-canvas";
    canvas.setAttribute("aria-hidden", "true");
    target.append(caption, canvas);

    const renderer = new VF.Renderer(canvas, VF.Renderer.Backends.SVG);
    renderer.resize(width, height);
    const context = renderer.getContext();
    context.setFillStyle("#172033");
    context.setStrokeStyle("#172033");

    const timeSignature = parseTimeSignature(score.timeSignature);
    const references = new Map();
    const anchors = new Map();
    const allVoiceBundles = [];
    let absoluteMeasureIndex = 0;

    systems.forEach((systemMeasures, systemIndex) => {
      const staveWidth = (width - MARGIN_X * 2) / systemMeasures.length;
      const topY = systemIndex * systemHeight + topPadding;
      const bottomY = hasTwoStaves ? topY + 88 : topY;
      let firstTopStave = null;
      let firstBottomStave = null;

      systemMeasures.forEach((measure, measureIndexInSystem) => {
        const x = MARGIN_X + measureIndexInSystem * staveWidth;
        const isFinalMeasure = absoluteMeasureIndex === measures.length - 1;
        const topClef = layout === "bass" ? "bass" : "treble";
        const topStave = new VF.Stave(x, topY, staveWidth);
        topStave.setBegBarType(
          measureIndexInSystem === 0
            ? VF.Barline.type.SINGLE
            : VF.Barline.type.NONE
        );
        topStave.setEndBarType(
          isFinalMeasure ? VF.Barline.type.END : VF.Barline.type.SINGLE
        );
        addStaveModifiers(
          topStave,
          topClef,
          measure,
          systemIndex,
          measureIndexInSystem,
          timeSignature
        );
        topStave.setContext(context).draw();

        let bottomStave = null;
        if (hasTwoStaves) {
          bottomStave = new VF.Stave(x, bottomY, staveWidth);
          bottomStave.setBegBarType(
            measureIndexInSystem === 0
              ? VF.Barline.type.SINGLE
              : VF.Barline.type.NONE
          );
          bottomStave.setEndBarType(
            isFinalMeasure ? VF.Barline.type.END : VF.Barline.type.SINGLE
          );
          addStaveModifiers(
            bottomStave,
            "bass",
            measure,
            systemIndex,
            measureIndexInSystem,
            timeSignature
          );
          bottomStave.setContext(context).draw();
        }

        if (!firstTopStave) {
          firstTopStave = topStave;
          firstBottomStave = bottomStave;
        }

        const topStaffName = layout === "bass" ? "bass" : "treble";
        const topBundles = buildStaffVoices(
          VF,
          measure.events,
          topStaffName,
          topStave,
          layout,
          showAnswer,
          timeSignature,
          references
        );
        const bottomBundles = bottomStave
          ? buildStaffVoices(
              VF,
              measure.events,
              "bass",
              bottomStave,
              layout,
              showAnswer,
              timeSignature,
              references
            )
          : [];
        const bundles = [...topBundles, ...bottomBundles];
        const voices = bundles.map((bundle) => bundle.voice);
        VF.Accidental.applyAccidentals(
          topBundles.map((bundle) => bundle.voice),
          keySignatureForStaff(measure.effectiveKeySignature, topStaffName)
        );
        if (bottomBundles.length) {
          VF.Accidental.applyAccidentals(
            bottomBundles.map((bundle) => bundle.voice),
            keySignatureForStaff(measure.effectiveKeySignature, "bass")
          );
        }
        const formatter = new VF.Formatter();
        formatter.joinVoices(topBundles.map((bundle) => bundle.voice));
        if (bottomBundles.length) {
          formatter.joinVoices(bottomBundles.map((bundle) => bundle.voice));
        }
        formatter.formatToStave(voices, topStave, {
          align_rests: true,
          stave: topStave,
        });

        topBundles.forEach((bundle) => bundle.voice.draw(context, topStave));
        bottomBundles.forEach((bundle) =>
          bundle.voice.draw(context, bottomStave)
        );
        bundles.forEach((bundle) => {
          allVoiceBundles.push(bundle);
        });

        measure.events.forEach((event, eventIndexInMeasure) => {
          const anchorNote =
            topBundles[0]?.tickables[eventIndexInMeasure] ||
            bottomBundles[0]?.tickables[eventIndexInMeasure];
          anchors.set(event._index, {
            note: anchorNote,
            topStave,
            bottomStave: bottomStave || topStave,
            systemIndex,
          });
        });
        absoluteMeasureIndex += 1;
      });

      drawSystemConnectors(
        VF,
        context,
        firstTopStave,
        firstBottomStave,
        layout
      );
    });

    allVoiceBundles.forEach((bundle) => {
      VF.Beam.generateBeams(bundle.tickables, {
        beam_rests: false,
        maintain_stem_directions: layout === "satb",
      }).forEach((beam) => beam.setContext(context).draw());
    });
    drawTies(VF, context, score.ties, references, anchors);

    const svg = canvas.querySelector("svg");
    if (svg) {
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      svg.setAttribute("preserveAspectRatio", "xMidYMin meet");
      svg.setAttribute("aria-hidden", "true");
      svg.setAttribute("focusable", "false");
      svg.removeAttribute("width");
      svg.removeAttribute("height");
      svg.style.width = "100%";
      svg.style.height = "auto";
      svg.style.maxWidth = "100%";
      canvas.style.width = "100%";
      canvas.style.maxWidth = "100%";

      const decorationGroup = createSvgElement("g", {
        class: "score-decorations",
        "aria-hidden": "true",
      });
      measures.flatMap((measure) => measure.events).forEach((event) => {
        const anchor = anchors.get(event._index);
        if (!anchor) return;
        const label = showAnswer ? event.answerLabel : event.givenLabel;
        drawLabel(
          decorationGroup,
          anchor,
          label,
          Boolean(score.blankLabels),
          showAnswer,
          score.labelPosition || "bottom"
        );
      });
      (score.brackets || []).forEach((bracket) =>
        drawBracket(decorationGroup, bracket, anchors, systems.length)
      );
      svg.appendChild(decorationGroup);
    }

    return {
      width,
      height,
      systems: systems.length,
      version: VEXFLOW_VERSION,
    };
  }

  window.CadenceScoreRenderer = Object.freeze({
    render,
    version: VEXFLOW_VERSION,
    parsePitch,
    normalizeDuration,
  });
})();
