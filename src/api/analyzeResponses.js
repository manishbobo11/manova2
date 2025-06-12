export const analyzeResponses = async (responses) => {
  const res = await fetch('http://localhost:3001/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(responses)
  });

  return res.json();
};