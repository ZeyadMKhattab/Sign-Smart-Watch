// ===============================
// HIGH CONTRAST TOGGLE
// ===============================
const contrastBtn = document.getElementById("contrast-toggle");
contrastBtn.addEventListener("click", () => {
  document.body.classList.toggle("high-contrast");
});

// ===============================
// MOCK DATA
// ===============================
const mockData = [
  { heartRate: 78, stress: 25, temp: 36.6, hydration: 85, activity: "Low" },
  { heartRate: 85, stress: 30, temp: 36.8, hydration: 80, activity: "Walking" },
  {
    heartRate: 92,
    stress: 40,
    temp: 37.0,
    hydration: 75,
    activity: "Moderate",
  },
  { heartRate: 110, stress: 55, temp: 37.4, hydration: 65, activity: "Active" },
  {
    heartRate: 135,
    stress: 72,
    temp: 38.0,
    hydration: 55,
    activity: "Running",
  },
  {
    heartRate: 150,
    stress: 85,
    temp: 39.2,
    hydration: 40,
    activity: "Intense",
  }, // 🔴 Critical
  {
    heartRate: 100,
    stress: 45,
    temp: 37.0,
    hydration: 70,
    activity: "Recovering",
  },
];

let currentIndex = 0;
let alertSent = false;

// ===============================
// DOM ELEMENTS
// ===============================
const heartRateEl = document.getElementById("heart-rate");
const stressEl = document.getElementById("stress-level");
const tempEl = document.getElementById("body-temp");
const hydrationEl = document.getElementById("hydration-level");
const activityEl = document.getElementById("activity-level");

const hrStatusEl = document.getElementById("hr-status");
const stressStatusEl = document.getElementById("stress-status");
const tempStatusEl = document.getElementById("temp-status");
const hydrationStatusEl = document.getElementById("hydration-status");
const activityStatusEl = document.getElementById("activity-status");

const lastCheckEl = document.getElementById("last-check");

// ===============================
// UPDATE VITALS
// ===============================
function updateVitals() {
  const vitals = mockData[currentIndex];

  // Update DOM
  heartRateEl.textContent = vitals.heartRate + " bpm";
  stressEl.textContent = vitals.stress + " %";
  tempEl.textContent = vitals.temp + " °C";
  hydrationEl.textContent = vitals.hydration + " %";
  activityEl.textContent = vitals.activity;
  lastCheckEl.textContent = new Date().toLocaleTimeString();

  // Update Status
  setStatus(
    hrStatusEl,
    vitals.heartRate < 100
      ? "normal"
      : vitals.heartRate < 140
        ? "warning"
        : "critical",
  );

  setStatus(
    stressStatusEl,
    vitals.stress < 50 ? "normal" : vitals.stress < 75 ? "warning" : "critical",
  );

  setStatus(
    tempStatusEl,
    vitals.temp < 37.5 ? "normal" : vitals.temp < 38.5 ? "warning" : "critical",
  );

  setStatus(
    hydrationStatusEl,
    vitals.hydration > 60
      ? "normal"
      : vitals.hydration > 45
        ? "warning"
        : "critical",
  );

  setStatus(
    activityStatusEl,
    vitals.activity === "Intense" ? "warning" : "normal",
  );

  // Auto Emergency
  if (
    (vitals.heartRate >= 140 || vitals.stress >= 75 || vitals.temp >= 38.5) &&
    !alertSent
  ) {
    sendEmergencyAlert(vitals);
    alertSent = true;
  }

  if (vitals.heartRate < 120 && vitals.stress < 60 && vitals.temp < 38) {
    alertSent = false;
  }

  // Add to chart
  addData(vitals.heartRate, vitals.stress, vitals.temp, vitals.hydration);

  // Next index
  currentIndex++;
  if (currentIndex >= mockData.length) currentIndex = 0;
}

// ===============================
// HELPER: SET STATUS
// ===============================
function setStatus(element, type) {
  element.className = "status " + type;
  element.textContent =
    type === "normal" ? "Normal" : type === "warning" ? "Warning" : "Critical";
}

// ===============================
// EMERGENCY ALERT
// ===============================
function sendEmergencyAlert(vitals) {
  const alertData = {
    user: "John Doe",
    heartRate: vitals.heartRate,
    stress: vitals.stress,
    temp: vitals.temp,
    hydration: vitals.hydration,
    activity: vitals.activity,
    timestamp: new Date().toISOString(),
  };
  console.log("🚨 EMERGENCY ALERT:", alertData);
  alert("🚨 Emergency Alert Triggered!");
}

document
  .getElementById("manual-alert")
  .addEventListener("click", () => sendEmergencyAlert(mockData[currentIndex]));

// ===============================
// CHART.JS
// ===============================
const ctx = document.getElementById("vitalsChart").getContext("2d");
const vitalsChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      { label: "Heart Rate (bpm)", data: [], borderColor: "red", tension: 0.3 },
      { label: "Stress (%)", data: [], borderColor: "blue", tension: 0.3 },
      {
        label: "Body Temp (°C)",
        data: [],
        borderColor: "orange",
        tension: 0.3,
      },
      { label: "Hydration (%)", data: [], borderColor: "green", tension: 0.3 },
    ],
  },
  options: {
    responsive: true,
    animation: false,
    scales: { y: { beginAtZero: true } },
  },
});

// ===============================
// ADD DATA TO CHART
// ===============================
function addData(hr, stress, temp, hydration) {
  const time = new Date().toLocaleTimeString();

  if (vitalsChart.data.labels.length > 12) {
    vitalsChart.data.labels.shift();
    vitalsChart.data.datasets.forEach((ds) => ds.data.shift());
  }

  vitalsChart.data.labels.push(time);
  vitalsChart.data.datasets[0].data.push(hr);
  vitalsChart.data.datasets[1].data.push(stress);
  vitalsChart.data.datasets[2].data.push(temp);
  vitalsChart.data.datasets[3].data.push(hydration);

  vitalsChart.update();
}

// ===============================
// AUTO UPDATE
// ===============================
updateVitals();
setInterval(updateVitals, 5000);
