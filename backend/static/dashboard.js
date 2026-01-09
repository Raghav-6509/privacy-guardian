async function loadData() {
  const res = await fetch("/history");
  const data = await res.json();

  document.getElementById("latestScore").innerText = data.latest.score;

  const adviceList = document.getElementById("aiAdviceList");
  adviceList.innerHTML = "";
  (data.latest.ai_advice || []).forEach((tip) => {
    const li = document.createElement("li");
    li.textContent = tip;
    adviceList.appendChild(li);
  });

  // Line chart: score history
  const historyCtx = document.getElementById("scoreChart").getContext("2d");
  new Chart(historyCtx, {
    type: "line",
    data: {
      labels: (data.history || []).map((_, i) => `Scan ${i + 1}`),
      datasets: [
        {
          label: "Privacy Score",
          data: (data.history || []).map((entry) => entry.score),
          borderColor: "#2563eb",
          fill: false,
        },
      ],
    },
  });

  // Doughnut: latest breakdown (cookies vs trackers vs permissions weight)
  const latest = (data.history || []).length ? data.history[data.history.length - 1] : null;
  if (latest) {
    const breakdownCtx = document.getElementById("breakdownChart").getContext("2d");
    const cookiesWeight = (latest.cookies || 0) * 0.01;
    const trackersWeight = (latest.trackers || 0) * 5;
    const permissionsWeight = (latest.permissions || []).length * 2;
    new Chart(breakdownCtx, {
      type: "doughnut",
      data: {
        labels: ["Cookies", "Trackers", "Permissions"],
        datasets: [
          {
            data: [cookiesWeight, trackersWeight, permissionsWeight],
            backgroundColor: ["#60a5fa", "#f59e0b", "#10b981"],
          },
        ],
      },
      options: {
        plugins: {
          legend: { position: "bottom" },
        },
      },
    });

    // Gauge-like: render as a semi-doughnut using circumference/rotation
    const gaugeCtx = document.getElementById("scoreGauge").getContext("2d");
    new Chart(gaugeCtx, {
      type: "doughnut",
      data: {
        labels: ["Score", "Remaining"],
        datasets: [
          {
            data: [latest.score, Math.max(0, 100 - latest.score)],
            backgroundColor: ["#22c55e", "#e5e7eb"],
            borderWidth: 0,
          },
        ],
      },
      options: {
        circumference: 180,
        rotation: -90,
        cutout: "75%",
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
        },
      },
      plugins: [{
        id: 'scoreLabel',
        afterDraw(chart) {
          const { ctx, chartArea: { width, height } } = chart;
          ctx.save();
          ctx.font = 'bold 24px Arial';
          ctx.fillStyle = '#111827';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${latest.score}`, chart.getDatasetMeta(0).data[0].x, chart.getDatasetMeta(0).data[0].y + 10);
          ctx.restore();
        }
      }]
    });
  }
}

loadData();
