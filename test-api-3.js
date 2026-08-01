async function test() {
  try {
    const res = await fetch('https://horse-racing-system-production-492c.up.railway.app/api/races');
    const data = await res.json();
    console.log(data[0]);
  } catch (e) {
    console.error(e);
  }
}
test();
