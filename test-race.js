fetch('https://horse-racing-system-production-492c.up.railway.app/api/races')
.then(res => res.json())
.then(data => {
    const race = data.find(r => r.name === 'Chặng 1 - Khởi động' && r.tournamentName === 'Giải đấu 4');
    console.log(race);
})
.catch(e => console.error(e));
