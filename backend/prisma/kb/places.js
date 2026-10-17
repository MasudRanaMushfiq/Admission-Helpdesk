// name, for, seats, location, facilities
const HALLS = [
  ['Padma Hall', 'male', 600, 'campus er uttor pashe, main gate er kache', 'dining, canteen, reading room, wifi o TV room'],
  ['Meghna Hall', 'male', 550, 'campus er uttor pashe, Padma Hall er pashe', 'dining, canteen, reading room, wifi o gym'],
  ['Jamuna Hall', 'male', 500, 'central field er purbo pashe', 'dining, canteen, reading room o wifi'],
  ['Teesta Hall', 'male', 450, 'Engineering Building er pichone', 'dining, reading room, wifi o computer lab'],
  ['Karnaphuli Hall', 'male', 500, 'central mosque er kache', 'dining, canteen, reading room o wifi'],
  ['Surma Hall', 'male', 400, 'campus er poschim gate er kache', 'dining, reading room, wifi o badminton court'],
  ['Rupsha Hall', 'male', 450, 'Agriculture Building er dokkhine', 'dining, canteen, reading room o wifi'],
  ['Madhumati Hall', 'male', 350, 'lake er pashe', 'dining, reading room, wifi o TV room'],
  ['Shapla Hall', 'female', 550, 'campus er dokkhin pashe, female hall area te', 'dining, canteen, reading room, wifi o common room'],
  ['Rajanigandha Hall', 'female', 500, 'female hall area te, Shapla Hall er pashe', 'dining, reading room, wifi o gym'],
  ['Kadam Hall', 'female', 450, 'medical center er kache', 'dining, canteen, reading room o wifi'],
  ['Shefali Hall', 'female', 400, 'female hall area te, library er pichone', 'dining, reading room, wifi o prayer room'],
  ['Krishnachura Hall', 'female', 400, 'Arts Building er purbo pashe', 'dining, canteen, reading room o wifi'],
  ['Bokul Hall', 'female', 350, 'female hall area er shesh mathay', 'dining, reading room, wifi o TV room'],
].map(([name, gender, seats, location, facilities]) => ({ name, gender, seats, location, facilities }));

function hallEntries(h) {
  const who = h.gender === 'male' ? 'chele (male)' : 'meye (female)';
  return [
    ['Halls', `${h.name} kader jonno?`, `${h.name} ${who} student der jonno hall. Ekhane prai ${h.seats} jon student thakte pare.`],
    ['Halls', `${h.name} e koyta seat ache?`, `${h.name} e mot prai ${h.seats} ta seat ache. Seat deya hoy merit, distance o year er upor vitti kore.`],
    ['Halls', `${h.name} e thakte mash e koto taka lage?`, `${h.name} e seat rent mash e prai 100 taka. Dining e proti meal 40-60 taka, tai khawa shoho mash e prai 3,500-4,500 taka khoroch hoy.`],
    ['Halls', `${h.name} kothay?`, `${h.name} ${h.location}.`],
    ['Halls', `${h.name} e ki ki facility ache?`, `${h.name} e ${h.facilities} ache. 24 ghonta security o generator backup o ache.`],
  ].map(([category, question, answer]) => ({ category, question, answer }));
}

// division -> districts
const DIVISIONS = {
  Dhaka: ['Dhaka', 'Faridpur', 'Gazipur', 'Gopalganj', 'Kishoreganj', 'Madaripur', 'Manikganj', 'Munshiganj', 'Narayanganj', 'Narsingdi', 'Rajbari', 'Shariatpur', 'Tangail'],
  'Chattogram (Chittagong)': ['Bandarban', 'Brahmanbaria', 'Chandpur', 'Chattogram (Chittagong)', 'Cumilla (Comilla)', "Cox's Bazar", 'Feni', 'Khagrachhari', 'Lakshmipur', 'Noakhali', 'Rangamati'],
  Rajshahi: ['Bogura (Bogra)', 'Chapainawabganj', 'Joypurhat', 'Naogaon', 'Natore', 'Pabna', 'Rajshahi', 'Sirajganj'],
  Khulna: ['Bagerhat', 'Chuadanga', 'Jashore (Jessore)', 'Jhenaidah', 'Khulna', 'Kushtia', 'Magura', 'Meherpur', 'Narail', 'Satkhira'],
  'Barishal (Barisal)': ['Barguna', 'Barishal (Barisal)', 'Bhola', 'Jhalokati', 'Patuakhali', 'Pirojpur'],
  Sylhet: ['Habiganj', 'Moulvibazar', 'Sunamganj', 'Sylhet'],
  Rangpur: ['Dinajpur', 'Gaibandha', 'Kurigram', 'Lalmonirhat', 'Nilphamari', 'Panchagarh', 'Rangpur', 'Thakurgaon'],
  Mymensingh: ['Jamalpur', 'Mymensingh', 'Netrokona', 'Sherpur'],
};

function centerEntries() {
  const entries = [];
  for (const [division, districts] of Object.entries(DIVISIONS)) {
    entries.push(
      {
        category: 'Exam Centers',
        question: `${division} e ki admission exam er center ache?`,
        answer: `Haan, ${division} division e exam center ache. Center ta divisional city er ekta govt university/college campus e hoy, exact venue admit card e lekha thakbe.`,
      },
      {
        category: 'Exam Centers',
        question: `${division} center e exam dite chaile ki korbo?`,
        answer: `Application form fill up korar somoy "Exam Center" option e ${division} select korbe. Application deadline er age porjonto portal theke center change korte parbe.`,
      },
    );
    for (const district of districts) {
      entries.push({
        category: 'Exam Centers',
        question: `${district} theke admission exam kothay dite hobe?`,
        answer: `${district} ${division} division er moddhe. Tai tumi application form e ${division} center choose korte paro, othoba main campus e o exam dite paro.`,
      });
    }
  }
  return entries;
}

module.exports = { HALLS, hallKb: () => HALLS.flatMap(hallEntries), centerKb: centerEntries };
