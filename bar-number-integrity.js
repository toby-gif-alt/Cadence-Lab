(function () {
  "use strict";

  const baseRenderer = window.CadenceScoreRenderer;
  if (!baseRenderer?.render) throw new Error("Cadence Lab bar-number integrity requires the score renderer first.");
  const SVG_NS = "http://www.w3.org/2000/svg";

  function text(attributes, value) {
    const node = document.createElementNS(SVG_NS, "text");
    Object.entries(attributes).forEach(([key, val]) => node.setAttribute(key, String(val)));
    node.textContent = String(value);
    return node;
  }

  function redrawBarNumbers(target, score) {
    const svg = target.querySelector(".notation-canvas svg");
    const measures = target._cadenceHitMap?.measures || [];
    if (!svg || !measures.length) return;

    svg.querySelector(".score-bar-numbers")?.remove();
    const numbers = Array.isArray(score?.barNumbers) && score.barNumbers.length === measures.length
      ? score.barNumbers
      : measures.map((_, index) => index + 1);
    target.dataset.barNumbers = JSON.stringify(numbers);

    if (score?.showBarNumbers === false) {
      target.dataset.barNumberCount = "0";
      return;
    }

    const group = document.createElementNS(SVG_NS, "g");
    group.setAttribute("class", "score-bar-numbers");
    group.setAttribute("aria-hidden", "true");
    let count = 0;
    measures.forEach((measure, index) => {
      const number = numbers[index];
      if (number == null) return;
      const systemStart = index === 0 || measures[index - 1]?.system !== measure.system;
      // hit-map x is VexFlow's note-start area. At system starts that value can
      // still sit close to clef/key/time modifiers, so give the label additional
      // clearance. Ordinary measures need only a small inset after the barline.
      const x = Number(measure.x || 0) + (systemStart ? 24 : 5);
      const y = Math.max(13, Number(measure.topY || 20) - 12);
      group.appendChild(text({
        class: "measure-bar-number",
        x,
        y,
        "text-anchor": "start",
        "font-family": "Georgia, 'Times New Roman', serif",
        "font-size": 11.5,
        "font-weight": 700,
        fill: "#526176",
        "data-internal-measure": measure.measure,
        "data-bar-number": number,
        "data-system-start": systemStart,
      }, number));
      count += 1;
    });
    svg.appendChild(group);
    target.dataset.barNumberCount = String(count);
  }

  window.CadenceScoreRenderer = Object.freeze({
    ...baseRenderer,
    __barNumberIntegrity: true,
    render(target, score, options = {}) {
      const result = baseRenderer.render(target, score, options);
      redrawBarNumbers(target, score);
      return result;
    },
  });

  window.CadenceBarNumberIntegrity = Object.freeze({ redrawBarNumbers });
})();
