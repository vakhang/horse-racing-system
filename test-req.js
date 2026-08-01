fetch('https://horse-racing-system-production-492c.up.railway.app/api/registrations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({raceId: 11, horseId: 1, ownerId: 1})
})
.then(async res => {
  const data = await res.json().catch(() => res.text());
  console.log("Status:", res.status);
  console.log("Data:", data);
})
.catch(e => console.log("Error:", e));
