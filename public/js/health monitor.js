// --- HIGH CONTRAST TOGGLE ---
const contrastBtn = document.getElementById("contrast-toggle");
contrastBtn.addEventListener("click", () => {
  document.body.classList.toggle("high-contrast");
});

// --- MOCK VITALS DATA (replace with smartwatch API) ---
let vitals = { heartRate: 75, stress: 20 };

const heartRateEl = document.getElementById("heart-rate");
const stressEl = document.getElementById("stress-level");
const hrStatusEl = document.getElementById("hr-status");
const stressStatusEl = document.getElementById("stress-status");
const lastCheckEl = document.getElementById("last-check");

function updateVitals() {
  // Simulate data update
  vitals.heartRate = Math.floor(Math.random() * 120) + 50; // 50-170 bpm
  vitals.stress = Math.floor(Math.random() * 100); // 0-100%

  heartRateEl.textContent = vitals.heartRate + " bpm";
  stressEl.textContent = vitals.stress + " %";
  lastCheckEl.textContent = new Date().toLocaleTimeString();

  // Update status colors
  hrStatusEl.textContent =
    vitals.heartRate < 100
      ? "Normal"
      : vitals.heartRate < 140
        ? "Warning"
        : "Critical";
  hrStatusEl.className =
    "status " +
    (vitals.heartRate < 100
      ? "normal"
      : vitals.heartRate < 140
        ? "warning"
        : "critical");

  stressStatusEl.textContent =
    vitals.stress < 50 ? "Normal" : vitals.stress < 75 ? "Warning" : "Critical";
  stressStatusEl.className =
    "status " +
    (vitals.stress < 50
      ? "normal"
      : vitals.stress < 75
        ? "warning"
        : "critical");

  // Automatically send alert if critical
  if (vitals.heartRate >= 140 || vitals.stress >= 75) {
    sendEmergencyAlert();
  }

  // Update chart
  addData(vitals.heartRate, vitals.stress);
}

// --- EMERGENCY ALERT (placeholder) ---
function sendEmergencyAlert() {
  const alertData = {
    user: "John Doe",
    location: { lat: 30.0444, lng: 31.2357 },
    heartRate: vitals.heartRate,
    stress: vitals.stress,
    timestamp: new Date().toISOString(),
  };
  console.log("EMERGENCY ALERT SENT:", alertData);
  alert("Emergency alert triggered! Check console for details.");
}

document
  .getElementById("manual-alert")
  .addEventListener("click", sendEmergencyAlert);

// --- CHART.JS SETUP ---
const ctx = document.getElementById("vitalsChart").getContext("2d");
const vitalsChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      { label: "Heart Rate (bpm)", data: [], borderColor: "red", fill: false },
      { label: "Stress Level (%)", data: [], borderColor: "blue", fill: false },
    ],
  },
  options: {
    responsive: true,
    animation: false,
    scales: { y: { beginAtZero: true } },
  },
});

function addData(hr, stress) {
  const time = new Date().toLocaleTimeString();
  if (vitalsChart.data.labels.length > 10) {
    vitalsChart.data.labels.shift();
    vitalsChart.data.datasets[0].data.shift();
    vitalsChart.data.datasets[1].data.shift();
  }
  vitalsChart.data.labels.push(time);
  vitalsChart.data.datasets[0].data.push(hr);
  vitalsChart.data.datasets[1].data.push(stress);
  vitalsChart.update();
}

// --- AUTO UPDATE EVERY 5 SECONDS ---
setInterval(updateVitals, 5000);
