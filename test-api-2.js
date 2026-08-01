async function test() {
  try {
    const res = await fetch('https://horse-racing-system-production-492c.up.railway.app/api/tournaments');
    const data = await res.json();
    console.log(data.map(t => t.id));
  } catch (e) {
    console.error(e);
  }
}
test();
