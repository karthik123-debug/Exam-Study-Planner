// Initialize Mermaid
mermaid.initialize({ startOnLoad: false });

// Load saved plans
function loadPlans() {
  const plans = JSON.parse(localStorage.getItem("studyPlans") || "[]");
  const plansList = document.getElementById("plansList");
  const noPlans = document.getElementById("noPlans");

  plansList.innerHTML = "";
  if (plans.length === 0) {
    noPlans.style.display = "block";
  } else {
    noPlans.style.display = "none";
    plans.forEach((plan, idx) => {
      const div = document.createElement("div");
      div.className = "plan-item"; // ✅ match CSS
      div.innerHTML = `
        📘 <strong>${plan.examName}</strong> (${plan.examDate})
        <button class="btn small" onclick="viewPlan(${idx})">👁️ View</button>
        <button class="btn danger small" onclick="deletePlan(${idx})">🗑️</button>
      `;
      plansList.appendChild(div);
    });
  }
}

// Save new plan
document.getElementById("planForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const examName = document.getElementById("examName").value;
  const examDate = document.getElementById("examDate").value;
  const topics = Array.from(document.getElementById("topics").selectedOptions).map(o => o.value);
  const subtopics = document.getElementById("subtopics").value.split(",").map(s => s.trim()).filter(Boolean);
  const timeTopic = document.getElementById("timeTopic").value;
  const timeSub = document.getElementById("timeSub").value;

  const newPlan = { examName, examDate, topics, subtopics, timeTopic, timeSub };

  const plans = JSON.parse(localStorage.getItem("studyPlans") || "[]");
  plans.push(newPlan);
  localStorage.setItem("studyPlans", JSON.stringify(plans));

  showToast(`✅ Plan for ${examName} saved!`, "success");
  loadPlans();
  generateFlowchart(newPlan);
});

// View plan
function viewPlan(idx) {
  const plans = JSON.parse(localStorage.getItem("studyPlans") || "[]");
  const plan = plans[idx];

  generateFlowchart(plan);

  const today = new Date();
  const examDay = new Date(plan.examDate);
  const daysLeft = Math.ceil((examDay - today) / (1000 * 60 * 60 * 24));

  document.getElementById("modalContent").innerHTML = `
    <h3>📘 ${plan.examName} Plan</h3>
    <p><b>Exam Date:</b> ${plan.examDate} (${daysLeft} days left)</p>
    <p><b>Time per Topic:</b> ${plan.timeTopic} mins</p>
    <p><b>Time per Subtopic:</b> ${plan.timeSub} mins</p>
    <p><b>Topics:</b> ${plan.topics.join(", ")}</p>
    <p><b>Subtopics:</b> ${plan.subtopics.join(", ")}</p>
  `;

  document.getElementById("modal").style.display = "block";
  showToast(`📅 ${plan.examName} scheduled successfully!`, "info");
}

// Delete plan
function deletePlan(idx) {
  const plans = JSON.parse(localStorage.getItem("studyPlans") || "[]");
  const removed = plans.splice(idx, 1)[0];
  localStorage.setItem("studyPlans", JSON.stringify(plans));
  loadPlans();
  showToast(`🗑️ Deleted plan for ${removed.examName}`, "error");
}

// Delete all
document.getElementById("clearAllBtn").addEventListener("click", () => {
  localStorage.removeItem("studyPlans");
  loadPlans();
  showToast("🗑️ All plans deleted", "error");
});

// Show all plans
document.getElementById("showPlansBtn").addEventListener("click", () => {
  loadPlans();
  showToast("📂 Showing all saved plans", "info");
});

// Generate flowchart
function generateFlowchart(plan) {
  const diagram = document.getElementById("diagram");
  let chart = `graph TD\n  A["${plan.examName} Exam on ${plan.examDate}"]`;

  plan.topics.forEach((topic, i) => {
    const t = `T${i}`;
    chart += `\n  A --> ${t}["${topic} (${plan.timeTopic} mins)"]`;

    plan.subtopics.forEach((sub, j) => {
      chart += `\n  ${t} --> S${i}${j}["${sub} (${plan.timeSub} mins)"]`;
    });
  });

  // ✅ Proper Mermaid rendering
  diagram.innerHTML = `<div class="mermaid">${chart}</div>`;
  mermaid.init(undefined, diagram.querySelectorAll(".mermaid"));
}

// Toast
function showToast(message, type = "info") {
  const toast = document.getElementById("toast");
  toast.innerHTML = message;
  toast.className = `toast ${type} show`; // ✅ use .show animation
  setTimeout(() => {
    toast.className = "toast"; // remove classes after fade
  }, 3000);
}

// Modal close
document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("modal").style.display = "none";
});
// ✅ Close modal when clicking outside
window.addEventListener("click", (e) => {
  if (e.target.id === "modal") {
    document.getElementById("modal").style.display = "none";
  }
});

loadPlans();