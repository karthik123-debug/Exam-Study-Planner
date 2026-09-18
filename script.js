
/* ==========================================
   EXAM COUNTDOWN & STUDY PLANNER
   COMPLETE UPDATED SCRIPT
========================================== */

"use strict";

// ==========================================
// 1. GET HTML ELEMENTS
// ==========================================

const form = document.getElementById("planForm");
const examName = document.getElementById("examName");
const examDate = document.getElementById("examDate");
const topicsDropdown = document.getElementById("topics");
const subtopicsDropdown = document.getElementById("subtopics");

const timeTopic = document.getElementById("timeTopic");
const timeSub = document.getElementById("timeSub");

const plansList = document.getElementById("plansList");
const noPlans = document.getElementById("noPlans");

const diagram = document.getElementById("diagram");
const meta = document.getElementById("meta");

const modal = document.getElementById("modal");
const modalContent = document.getElementById("modalContent");
const closeModal = document.getElementById("closeModal");

const showPlansBtn = document.getElementById("showPlansBtn");
const clearAllBtn = document.getElementById("clearAllBtn");
const toast = document.getElementById("toast");

const STORAGE_KEY = "examCountdownStudyPlans";

let plans = loadPlans();
let editingId = null;
let toastTimer;

// ==========================================
// 2. SUBJECT → SUBTOPICS
// ==========================================

const subjectSubtopics = {
  CD: [
    "Lexical Analysis",
    "Parsing",
    "Syntax Trees",
    "Intermediate Code",
    "Code Optimization",
    "Code Generation"
  ],

  WT: [
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "Node.js",
    "Databases"
  ],

  CN: [
    "OSI Model",
    "TCP/IP",
    "Routing",
    "Switching",
    "Network Security",
    "Wireless Networks"
  ],

  ML: [
    "Regression",
    "Classification",
    "Clustering",
    "Neural Networks",
    "Backpropagation",
    "SVM"
  ],

  MSD: [
    "8086 Architecture",
    "Instruction Set",
    "Assembly Programming",
    "Memory Interfacing",
    "I/O Interfacing"
  ],

  AI: [
    "AI Search",
    "Heuristic Search",
    "Game Playing",
    "Expert Systems",
    "Knowledge Representation",
    "Machine Reasoning"
  ],

  DMT: [
    "Sets",
    "Relations",
    "Functions",
    "Graphs",
    "Trees",
    "Combinatorics",
    "Boolean Algebra"
  ]
};

// ==========================================
// 3. INITIALIZE MERMAID
// ==========================================

if (typeof mermaid !== "undefined") {
  mermaid.initialize({
    startOnLoad: false,
    theme: "dark",
    securityLevel: "strict",
    flowchart: {
      useMaxWidth: true,
      htmlLabels: false,
      curve: "basis"
    }
  });
} else {
  console.error("Mermaid library is not loaded.");
}

// ==========================================
// 4. LOCAL STORAGE
// ==========================================

function loadPlans() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return [];

    const data = JSON.parse(saved);

    if (!Array.isArray(data)) return [];

    return data.filter(plan =>
      plan &&
      typeof plan.id === "string" &&
      typeof plan.subject === "string" &&
      typeof plan.date === "string" &&
      Array.isArray(plan.topics) &&
      Array.isArray(plan.subtopics)
    );

  } catch (error) {
    console.error("Loading plans failed:", error);
    return [];
  }
}

function savePlans() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(plans)
    );

    return true;

  } catch (error) {
    console.error("Saving plans failed:", error);

    showToast(
      "Unable to save. Check your browser storage."
    );

    return false;
  }
}

// ==========================================
// 5. TOAST MESSAGE
// ==========================================

function showToast(message) {
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// ==========================================
// 6. DATE FUNCTIONS
// ==========================================

function getToday() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(
    today.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    today.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDaysRemaining(dateString) {
  const today = new Date(getToday() + "T00:00:00");
  const exam = new Date(dateString + "T00:00:00");

  return Math.round(
    (exam.getTime() - today.getTime()) /
    (1000 * 60 * 60 * 24)
  );
}

function formatDate(dateString) {
  const date = new Date(dateString + "T00:00:00");

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins} minutes`;
  }

  if (mins === 0) {
    return `${hours} hours`;
  }

  return `${hours} hours ${mins} minutes`;
}

// ==========================================
// 7. SELECT HELPERS
// ==========================================

function getSelectedValues(element) {
  return Array.from(element.selectedOptions)
    .map(option => option.value);
}

function setSelectedValues(element, values) {
  const selected = new Set(values || []);

  Array.from(element.options).forEach(option => {
    option.selected = selected.has(option.value);
  });
}

// ==========================================
// 8. SUBJECT CHANGE
// ==========================================

examName.addEventListener("change", function () {
  const subject = this.value;

  subtopicsDropdown.replaceChildren();

  const subtopics = subjectSubtopics[subject] || [];

  subtopics.forEach(subtopic => {
    const option = document.createElement("option");

    option.value = subtopic;
    option.textContent = subtopic;

    subtopicsDropdown.appendChild(option);
  });

  subtopicsDropdown.disabled =
    subtopics.length === 0;
});

// ==========================================
// 9. GET FORM DATA
// ==========================================

function getFormData() {
  const subject = examName.value;
  const date = examDate.value;

  const topics = getSelectedValues(
    topicsDropdown
  );

  const subtopics = getSelectedValues(
    subtopicsDropdown
  );

  const topicMinutes = Number(
    timeTopic.value
  );

  const subtopicMinutes = Number(
    timeSub.value
  );

  if (!subject) {
    showToast("Please select an exam subject.");
    return null;
  }

  if (!date) {
    showToast("Please select an exam date.");
    return null;
  }

  if (date < getToday()) {
    showToast("Select today or a future date.");
    return null;
  }

  if (
    topics.length === 0 &&
    subtopics.length === 0
  ) {
    showToast(
      "Please select at least one topic or subtopic."
    );

    return null;
  }

  if (
    !Number.isFinite(topicMinutes) ||
    topicMinutes < 1 ||
    !Number.isFinite(subtopicMinutes) ||
    subtopicMinutes < 1
  ) {
    showToast(
      "Study time must be at least 1 minute."
    );

    return null;
  }

  return {
    subject,
    date,
    topics,
    subtopics,
    topicMinutes,
    subtopicMinutes
  };
}

// ==========================================
// 10. CALCULATE STUDY TIME
// ==========================================

function calculateTotalTime(plan) {
  return (
    plan.topics.length * plan.topicMinutes +
    plan.subtopics.length * plan.subtopicMinutes
  );
}

// ==========================================
// 11. ADD OR UPDATE PLAN
// ==========================================

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const data = getFormData();

  if (!data) return;

  let currentPlan;

  if (editingId !== null) {
    const index = plans.findIndex(
      plan => plan.id === editingId
    );

    if (index === -1) {
      editingId = null;
      showToast("Plan not found.");
      return;
    }

    currentPlan = {
      ...plans[index],
      ...data
    };

    plans[index] = currentPlan;

    showToast("Plan updated successfully!");

  } else {
    currentPlan = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString()
    };

    plans.unshift(currentPlan);

    showToast("Plan saved successfully!");
  }

  editingId = null;

  resetSubmitButton();

  if (savePlans()) {
    renderPlans();
    await generateFlowchart(currentPlan);
  }
});

// ==========================================
// 12. CREATE BUTTON
// ==========================================

function createButton(text, style) {
  const button = document.createElement("button");

  button.type = "button";
  button.className = `btn ${style}`;
  button.textContent = text;

  return button;
}

// ==========================================
// 13. DISPLAY SAVED PLANS
// ==========================================

function renderPlans() {
  plansList.replaceChildren();

  noPlans.style.display =
    plans.length === 0 ? "block" : "none";

  plans.forEach(plan => {
    const card = document.createElement("div");

    card.className = "saved-plan";

    const title = document.createElement("h4");
    title.textContent =
      `${plan.subject} Study Plan`;

    const date = document.createElement("p");
    date.className = "muted";
    date.textContent =
      `📅 ${formatDate(plan.date)}`;

    const remaining = getDaysRemaining(
      plan.date
    );

    const countdown = document.createElement("p");
    countdown.className = "muted";

    if (remaining === 0) {
      countdown.textContent = "🎯 Exam is today!";
    } else if (remaining === 1) {
      countdown.textContent = "⏳ 1 day remaining";
    } else {
      countdown.textContent =
        `⏳ ${remaining} days remaining`;
    }

    const duration = document.createElement("p");
    duration.className = "muted";

    duration.textContent =
      `📚 Study time: ${
        formatDuration(calculateTotalTime(plan))
      }`;

    const actions = document.createElement("div");
    actions.className = "actions";

    const viewBtn = createButton(
      "View",
      "primary"
    );

    const editBtn = createButton(
      "Edit",
      "ghost"
    );

    const deleteBtn = createButton(
      "Delete",
      "danger"
    );

    viewBtn.addEventListener("click", () => {
      viewPlan(plan.id);
    });

    editBtn.addEventListener("click", () => {
      editPlan(plan.id);
    });

    deleteBtn.addEventListener("click", () => {
      deletePlan(plan.id);
    });

    actions.append(
      viewBtn,
      editBtn,
      deleteBtn
    );

    card.append(
      title,
      date,
      countdown,
      duration,
      actions
    );

    plansList.appendChild(card);
  });
}

// ==========================================
// 14. VIEW PLAN
// ==========================================

function viewPlan(id) {
  const plan = plans.find(
    item => item.id === id
  );

  if (!plan) return;

  modalContent.replaceChildren();

  const title = document.createElement("h2");
  title.textContent =
    `${plan.subject} Study Plan`;

  const date = document.createElement("p");
  date.textContent =
    `Exam Date: ${formatDate(plan.date)}`;

  const days = document.createElement("p");
  days.textContent =
    `${getDaysRemaining(plan.date)} days remaining`;

  const total = document.createElement("p");
  total.textContent =
    `Total Study Time: ${
      formatDuration(calculateTotalTime(plan))
    }`;

  const topicHeading = document.createElement("h3");
  topicHeading.textContent = "Study Topics";

  const topicList = document.createElement("ul");

  plan.topics.forEach(topic => {
    const item = document.createElement("li");

    item.textContent =
      `${topic} — ${plan.topicMinutes} minutes`;

    topicList.appendChild(item);
  });

  const subHeading = document.createElement("h3");
  subHeading.textContent = "Subtopics";

  const subList = document.createElement("ul");

  plan.subtopics.forEach(subtopic => {
    const item = document.createElement("li");

    item.textContent =
      `${subtopic} — ${plan.subtopicMinutes} minutes`;

    subList.appendChild(item);
  });

  modalContent.append(
    title,
    date,
    days,
    total,
    topicHeading,
    topicList,
    subHeading,
    subList
  );

  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
}

// ==========================================
// 15. CLOSE MODAL
// ==========================================

function closePlanModal() {
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
}

closeModal.addEventListener("click", closePlanModal);

modal.addEventListener("click", function (event) {
  if (event.target === modal) {
    closePlanModal();
  }
});

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closePlanModal();
  }
});

// ==========================================
// 16. EDIT PLAN
// ==========================================

function editPlan(id) {
  const plan = plans.find(
    item => item.id === id
  );

  if (!plan) return;

  editingId = id;

  examName.value = plan.subject;

  // Load subject-specific subtopics
  examName.dispatchEvent(
    new Event("change")
  );

  examDate.value = plan.date;

  setSelectedValues(
    topicsDropdown,
    plan.topics
  );

  setSelectedValues(
    subtopicsDropdown,
    plan.subtopics
  );

  timeTopic.value = plan.topicMinutes;
  timeSub.value = plan.subtopicMinutes;

  const submitButton = form.querySelector(
    'button[type="submit"]'
  );

  if (submitButton) {
    submitButton.textContent =
      "✏️ Update Study Plan";
  }

  form.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

  showToast(
    "Edit your details and click Update."
  );
}

// ==========================================
// 17. RESET SUBMIT BUTTON
// ==========================================

function resetSubmitButton() {
  const submitButton = form.querySelector(
    'button[type="submit"]'
  );

  if (submitButton) {
    submitButton.textContent =
      "➕ Add & Generate Flowchart";
  }
}

// ==========================================
// 18. DELETE SINGLE PLAN
// ==========================================

function deletePlan(id) {
  const confirmed = confirm(
    "Are you sure you want to delete this plan?"
  );

  if (!confirmed) return;

  plans = plans.filter(
    plan => plan.id !== id
  );

  if (editingId === id) {
    editingId = null;
    form.reset();

    subtopicsDropdown.replaceChildren();
    subtopicsDropdown.disabled = true;

    resetSubmitButton();
  }

  if (savePlans()) {
    renderPlans();

    if (plans.length > 0) {
      generateFlowchart(plans[0]);
    } else {
      diagram.replaceChildren();

      meta.textContent =
        "Fill the form and generate to see the flowchart.";
    }

    showToast("Plan deleted successfully.");
  }
}

// ==========================================
// 19. DELETE ALL PLANS
// ==========================================

clearAllBtn.addEventListener("click", function () {
  if (plans.length === 0) {
    showToast("No saved plans.");
    return;
  }

  const confirmed = confirm(
    "Are you sure you want to delete all plans?"
  );

  if (!confirmed) return;

  plans = [];
  editingId = null;

  if (savePlans()) {
    renderPlans();

    form.reset();

    subtopicsDropdown.replaceChildren();
    subtopicsDropdown.disabled = true;

    resetSubmitButton();

    diagram.replaceChildren();

    meta.textContent =
      "Fill the form and generate to see the flowchart.";

    showToast("All plans deleted.");
  }
});

// ==========================================
// 20. SHOW PREVIOUS PLANS
// ==========================================

showPlansBtn.addEventListener("click", function () {
  plansList.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

  if (plans.length === 0) {
    showToast("No previous plans found.");
  }
});

// ==========================================
// 21. MERMAID FLOWCHART
// ==========================================

function cleanMermaidText(text) {
  return String(text)
    .replace(/[\[\]{}()<>"]/g, "")
    .replace(/[\r\n]+/g, " ")
    .replace(/:/g, " -")
    .trim();
}

async function generateFlowchart(plan) {
  if (!plan) return;

  if (typeof mermaid === "undefined") {
    diagram.textContent =
      "Mermaid failed to load. Check your internet connection.";

    return;
  }

  const daysRemaining = getDaysRemaining(
    plan.date
  );

  meta.textContent =
    `${plan.subject} | Exam: ${formatDate(plan.date)} | ` +
    `${daysRemaining} days remaining | ` +
    `Total study time: ${
      formatDuration(calculateTotalTime(plan))
    }`;

  const lines = [
    "flowchart TD",
    'A(["START STUDY PLAN"])',
    `B["Subject - ${cleanMermaidText(plan.subject)}"]`,
    `C["Exam Date - ${formatDate(plan.date)}"]`,
    `D["Days Remaining - ${daysRemaining}"]`,
    "A --> B --> C --> D"
  ];

  let previous = "D";
  let count = 0;

  // Add topics
  for (const topic of plan.topics) {
    count++;

    const node = `T${count}`;

    lines.push(
      `${node}["Topic - ${cleanMermaidText(topic)} - ${plan.topicMinutes} min"]`
    );

    lines.push(
      `${previous} --> ${node}`
    );

    previous = node;
  }

  // Add subtopics
  for (const subtopic of plan.subtopics) {
    count++;

    const node = `S${count}`;

    lines.push(
      `${node}["Subtopic - ${cleanMermaidText(subtopic)} - ${plan.subtopicMinutes} min"]`
    );

    lines.push(
      `${previous} --> ${node}`
    );

    previous = node;
  }

  lines.push(
    `${previous} --> Z(["STUDY PLAN COMPLETED"])`
  );

  const mermaidCode = lines.join("\n");

  diagram.replaceChildren();

  try {
    const uniqueId =
      "studyPlan-" +
      Date.now() +
      "-" +
      Math.random().toString(36).slice(2, 8);

    const result = await mermaid.render(
      uniqueId,
      mermaidCode
    );

    diagram.innerHTML = result.svg;

    if (result.bindFunctions) {
      result.bindFunctions(diagram);
    }

  } catch (error) {
    console.error(
      "Mermaid flowchart error:",
      error
    );

    diagram.textContent =
      "Unable to generate flowchart. Please check the selected topics and try again.";
  }
}

// ==========================================
// 22. INITIALIZE WEBSITE
// ==========================================

function initializeApp() {
  examDate.min = getToday();

  renderPlans();

  if (plans.length > 0) {
    generateFlowchart(plans[0]);
  }
}

initializeApp();