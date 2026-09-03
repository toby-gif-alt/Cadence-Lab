(function () {
  "use strict";

  const { questions: questionBank, categories: categoryNames } =
    window.CadenceData;
  const scoreRenderer = window.CadenceScoreRenderer;
  const levelOrder = { achievement: 1, merit: 2, excellence: 3 };
  const levelNames = {
    achievement: "Achievement",
    merit: "Merit",
    excellence: "Excellence",
  };

  let currentQuestion = null;
  let setNumber = 0;
  let lastQuestionId = null;
  let renderedWidth = 0;
  let resizeFrame = null;

  const categorySelect = document.querySelector("#category");
  const difficultySelect = document.querySelector("#difficulty");
  const answerPanel = document.querySelector("#answer-panel");
  const revealButton = document.querySelector("#reveal-answer");
  const scoreElement = document.querySelector("#score");
  const modelScoreElement = document.querySelector("#model-score");

  function escapeText(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function chooseQuestion() {
    const category = categorySelect.value;
    const pool =
      category === "mixed"
        ? questionBank
        : questionBank.filter((question) => question.category === category);
    let candidates = pool.filter((question) => question.id !== lastQuestionId);
    if (!candidates.length) candidates = pool;
    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    lastQuestionId = picked.id;
    return picked;
  }

  function visibleTasks(question, difficulty) {
    const maximumLevel = levelOrder[difficulty];
    return ["A", "M", "E"].flatMap((level, index) =>
      index + 1 <= maximumLevel ? question.tasks[level] : []
    );
  }

  function scoreLayout(question) {
    if (question.score.layout) return question.score.layout;
    if (question.category === "satb") return "satb";
    if (question.category === "piano") return "piano";
    return "grand";
  }

  function renderScores(force = false) {
    if (!currentQuestion) return;
    const measuredWidth =
      scoreElement.getBoundingClientRect().width ||
      document.querySelector(".score-frame").getBoundingClientRect().width ||
      900;
    if (!force && Math.abs(measuredWidth - renderedWidth) < 36) return;

    const layout = scoreLayout(currentQuestion);
    const result = scoreRenderer.render(scoreElement, currentQuestion.score, {
      layout,
      showAnswer: false,
      width: measuredWidth,
    });
    scoreRenderer.render(modelScoreElement, currentQuestion.score, {
      layout,
      showAnswer: true,
      width: result.width,
    });
    renderedWidth = result.width;
  }

  function renderQuestion(question = chooseQuestion()) {
    currentQuestion = question;
    lastQuestionId = question.id;
    setNumber += 1;
    const difficulty = difficultySelect.value;
    const difficultyName = levelNames[difficulty];

    document.querySelector("#question-family").textContent = question.family;
    document.querySelector("#question-title").textContent = question.title;
    document.querySelector("#question-context").textContent = question.context;
    document.querySelector("#difficulty-chip").textContent =
      `Target: ${difficultyName}`;
    document.querySelector("#variant-chip").textContent =
      `Practice set ${String(setNumber).padStart(2, "0")}`;
    document.querySelector("#task-list").innerHTML = visibleTasks(
      question,
      difficulty
    )
      .map((task) => `<li>${escapeText(task)}</li>`)
      .join("");

    document.querySelector("#answer-heading").textContent =
      question.answerHeading;
    document.querySelector("#answer-copy").innerHTML = question.answer
      .map((line) => `<p>${line}</p>`)
      .join("");

    answerPanel.hidden = true;
    document.querySelector("#model-score-wrap").hidden = false;
    revealButton.innerHTML =
      '<span aria-hidden="true">◉</span> Reveal answer and guide';
    buildCriteria(question, difficulty);
    renderScores(true);
  }

  function buildCriteria(question, difficulty) {
    const maximumLevel = levelOrder[difficulty];
    const grid = document.querySelector("#criteria-grid");
    const rows = [];

    ["A", "M", "E"].forEach((level, index) => {
      if (index + 1 > maximumLevel) return;
      question.criteria[level].forEach((text, criterionIndex) => {
        rows.push(`
          <label class="criterion">
            <input type="checkbox" data-level="${level}" data-criterion="${criterionIndex}" />
            <span class="level-tag level-${level}">${level}</span>
            <span>${escapeText(text)}</span>
          </label>
        `);
      });
    });

    grid.innerHTML = rows.join("");
    grid
      .querySelectorAll("input")
      .forEach((input) => input.addEventListener("change", updateResult));
    updateResult();
  }

  function updateResult() {
    const inputs = [...document.querySelectorAll("#criteria-grid input")];
    const present = new Set(inputs.map((input) => input.dataset.level));
    const complete = (level) => {
      const group = inputs.filter((input) => input.dataset.level === level);
      return group.length > 0 && group.every((input) => input.checked);
    };

    let result = "Not yet secure";
    let className = "";
    let note = "Tick only the statements you can support from your written work.";

    if (complete("A")) {
      result = "Likely Achievement";
      className = "achieved";
      note =
        "Your isolated harmonic evidence is secure. Check the Merit statements to see whether it forms a convincing sequence.";
    }
    if (complete("A") && present.has("M") && complete("M")) {
      result = "Likely Merit";
      className = "merit";
      note =
        "Your consecutive analysis or realisation is secure. Excellence requires the extended response to remain convincing.";
    }
    if (complete("A") && complete("M") && complete("E")) {
      result = "Likely Excellence";
      className = "excellence";
      note =
        "Your checklist supports an extended, convincing response. Compare the details once more before accepting the judgement.";
    }

    const badge = document.querySelector("#result-badge");
    badge.textContent = result;
    badge.className = `result-badge ${className}`.trim();
    document.querySelector("#judgement-note").textContent = note;
  }

  function showQuestionById(questionId) {
    const question = questionBank.find((candidate) => candidate.id === questionId);
    if (!question) throw new Error(`Unknown question: ${questionId}`);
    categorySelect.value = question.category;
    renderQuestion(question);
  }

  document
    .querySelector("#new-question")
    .addEventListener("click", () => renderQuestion());
  categorySelect.addEventListener("change", () => renderQuestion());
  difficultySelect.addEventListener("change", () =>
    renderQuestion(currentQuestion || chooseQuestion())
  );
  revealButton.addEventListener("click", () => {
    const willShow = answerPanel.hidden;
    answerPanel.hidden = !willShow;
    revealButton.innerHTML = willShow
      ? '<span aria-hidden="true">×</span> Hide answer'
      : '<span aria-hidden="true">◉</span> Reveal answer and guide';
    if (willShow) {
      answerPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
  document
    .querySelector("#print-question")
    .addEventListener("click", () => window.print());

  if ("ResizeObserver" in window) {
    new ResizeObserver(() => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => renderScores());
    }).observe(scoreElement);
  }

  window.CadenceLab = Object.freeze({
    categoryNames,
    questions: questionBank,
    rendererVersion: scoreRenderer.version,
    showQuestion: showQuestionById,
    getCurrentQuestion: () => currentQuestion,
  });

  const requestedQuestionId = new URLSearchParams(window.location.search).get(
    "question"
  );
  const requestedQuestion = questionBank.find(
    (question) => question.id === requestedQuestionId
  );
  if (requestedQuestion) categorySelect.value = requestedQuestion.category;
  renderQuestion(requestedQuestion || undefined);
})();
