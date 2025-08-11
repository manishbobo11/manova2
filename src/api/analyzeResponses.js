import { apiFetch } from '../lib/api';

export const analyzeResponses = async (responses) => {
  const res = await apiFetch('/api/analyze', {
    method: 'POST',
    body: JSON.stringify(responses)
  });

  return res.json();
};