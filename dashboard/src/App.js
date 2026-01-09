import React, { useEffect, useState } from "react";

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3000/api/data")
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error("Error fetching data:", err));
  }, []);

  if (!data || Object.keys(data).length === 0)
    return <h2>No data received yet. Please scan from the extension.</h2>;

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>🛡️ Privacy Guardian Report</h1>
      <p><strong>Cookies:</strong> {data.cookies}</p>
      <p><strong>Trackers:</strong> {data.trackers}</p>
      <p><strong>Permissions:</strong> {data.permissions.join(", ")}</p>
      <p><strong>Privacy Score:</strong> {data.score}</p>
    </div>
  );
}

export default App;
