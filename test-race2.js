fetch('https://horse-racing-system-production-492c.up.railway.app/api/races')
.then(res => res.json())
.then(data => {
    const races = data.filter(r => r.tournamentName === 'Giải đấu 4');
    console.log(races);
})
.catch(e => console.error(e));
