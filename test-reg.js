fetch('https://horse-racing-system-production-492c.up.railway.app/api/registrations', { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify({raceId: 13, horseId: 999, ownerId: 999}) 
})
.then(res => res.json().catch(()=>res.text()))
.then(d => console.log(d));
