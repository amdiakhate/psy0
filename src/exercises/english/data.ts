/**
 * Banques de questions d'anglais (présélection cadets).
 * Convention : `options[correct]` est LA seule réponse défendable ;
 * l'ordre des options est mélangé à la génération (le `correct` de la banque
 * pointe donc simplement la bonne entrée, ici toujours en premier par lisibilité).
 */

export type EnglishBank = 'grammar' | 'vocab-general' | 'vocab-aviation' | 'comprehension';

export const ENGLISH_BANKS: EnglishBank[] = ['grammar', 'vocab-general', 'vocab-aviation', 'comprehension'];

export interface EnglishEntry {
  prompt: string;
  options: [string, string, string, string];
  correct: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
}

const grammar: EnglishEntry[] = [
  { prompt: 'He ___ football every Saturday.', options: ['plays', 'play', 'playing', 'are playing'], correct: 0, difficulty: 1 },
  { prompt: 'They ___ at the airport now.', options: ['are', 'is', 'am', 'be'], correct: 0, difficulty: 1 },
  { prompt: 'I ___ my homework yesterday evening.', options: ['did', 'done', 'do', 'doing'], correct: 0, difficulty: 1 },
  { prompt: '___ you speak English?', options: ['Do', 'Does', 'Are', 'Is'], correct: 0, difficulty: 1 },
  { prompt: 'She doesn\'t ___ coffee.', options: ['like', 'likes', 'liked', 'liking'], correct: 0, difficulty: 1 },
  { prompt: 'Water ___ at 100 degrees Celsius.', options: ['boils', 'boil', 'are boiling', 'is boil'], correct: 0, difficulty: 1 },
  { prompt: 'He speaks English ___ than his brother.', options: ['better', 'more good', 'gooder', 'best'], correct: 0, difficulty: 1 },
  { prompt: 'All pilots ___ trained twice a year.', options: ['are', 'is', 'be', 'been'], correct: 0, difficulty: 1 },
  { prompt: 'She ___ to Paris last week.', options: ['went', 'has gone', 'goes', 'is going'], correct: 0, difficulty: 2 },
  { prompt: 'If it rains tomorrow, we ___ at home.', options: ['will stay', 'will staying', 'stayed', 'would stayed'], correct: 0, difficulty: 2 },
  { prompt: 'This suitcase is ___ than mine.', options: ['heavier', 'more heavy', 'heaviest', 'most heavy'], correct: 0, difficulty: 2 },
  { prompt: 'It is the ___ airport in Europe.', options: ['biggest', 'bigger', 'most big', 'more big'], correct: 0, difficulty: 2 },
  { prompt: 'She has worked here ___ 2015.', options: ['since', 'for', 'during', 'ago'], correct: 0, difficulty: 2 },
  { prompt: 'I have known him ___ ten years.', options: ['for', 'since', 'during', 'ago'], correct: 0, difficulty: 2 },
  { prompt: 'The pilot ___ the plane safely despite the storm.', options: ['flew', 'flied', 'flown', 'fly'], correct: 0, difficulty: 2 },
  { prompt: 'The passengers have already ___ their seats.', options: ['taken', 'took', 'take', 'taking'], correct: 0, difficulty: 2 },
  { prompt: 'Yesterday he ___ me a funny story.', options: ['told', 'said', 'spoke', 'talked'], correct: 0, difficulty: 2 },
  { prompt: 'How ___ luggage are you checking in?', options: ['much', 'many', 'few', 'lots'], correct: 0, difficulty: 2 },
  { prompt: 'There are not ___ seats left on this flight.', options: ['many', 'much', 'a lot', 'little'], correct: 0, difficulty: 2 },
  { prompt: 'We arrived ___ Madrid at noon.', options: ['in', 'to', 'on', 'under'], correct: 0, difficulty: 2 },
  { prompt: 'We ___ in London since 2019.', options: ['have lived', 'live', 'lives', 'are live'], correct: 0, difficulty: 3 },
  { prompt: 'Smoking is forbidden: you ___ smoke on board.', options: ['must not', 'don\'t have to', 'are allowed to', 'should'], correct: 0, difficulty: 3 },
  { prompt: 'He ___ his keys, so he cannot open the door now.', options: ['has lost', 'loses', 'is losing', 'will lost'], correct: 0, difficulty: 3 },
  { prompt: 'The letter ___ yesterday.', options: ['was sent', 'has been sent', 'is sent', 'is sending'], correct: 0, difficulty: 3 },
  { prompt: 'If I ___ rich, I would travel the world.', options: ['were', 'am', 'will be', 'would be'], correct: 0, difficulty: 3 },
  { prompt: 'This is the man ___ car was stolen.', options: ['whose', 'who', 'which', 'whom'], correct: 0, difficulty: 3 },
  { prompt: 'The meeting ___ postponed until Monday.', options: ['has been', 'has', 'have been', 'is be'], correct: 0, difficulty: 3 },
  { prompt: 'I would rather ___ by the window.', options: ['sit', 'to sit', 'sitting', 'sat'], correct: 0, difficulty: 3 },
  { prompt: 'You had better ___ your seatbelt.', options: ['fasten', 'to fasten', 'fastening', 'fastened'], correct: 0, difficulty: 3 },
  { prompt: 'The captain is responsible ___ the safety of the flight.', options: ['for', 'of', 'to', 'about'], correct: 0, difficulty: 3 },
  { prompt: 'She apologized ___ arriving late.', options: ['for', 'of', 'on', 'to'], correct: 0, difficulty: 3 },
  { prompt: 'She asked me where I ___.', options: ['lived', 'living', 'to live', 'am live'], correct: 0, difficulty: 4 },
  { prompt: 'By the time we arrived, the film ___.', options: ['had started', 'has started', 'starts', 'was start'], correct: 0, difficulty: 4 },
  { prompt: 'I look forward to ___ from you.', options: ['hearing', 'hear', 'heard', 'be heard'], correct: 0, difficulty: 4 },
  { prompt: 'He is used to ___ up early.', options: ['getting', 'get', 'got', 'gets'], correct: 0, difficulty: 4 },
  { prompt: 'Each of the passengers ___ a boarding pass.', options: ['has', 'have', 'are having', 'is have'], correct: 0, difficulty: 4 },
  { prompt: 'Despite ___ tired, she kept working.', options: ['being', 'be', 'to be', 'she was'], correct: 0, difficulty: 4 },
  { prompt: 'The flight attendant suggested ___ some water.', options: ['drinking', 'to drink', 'drink', 'drank'], correct: 0, difficulty: 4 },
  { prompt: 'If she had checked the weather, she ___ the storm.', options: ['would have avoided', 'would avoid', 'will have avoided', 'had avoided'], correct: 0, difficulty: 4 },
  { prompt: 'Hardly ___ the plane landed when the passengers stood up.', options: ['had', 'has', 'did', 'was'], correct: 0, difficulty: 5 },
  { prompt: 'Not until the fog lifted ___ take off.', options: ['could the plane', 'the plane could', 'the plane can', 'can the plane'], correct: 0, difficulty: 5 },
  { prompt: 'It is high time we ___ this problem seriously.', options: ['took', 'take', 'will take', 'have taken'], correct: 0, difficulty: 5 },
];

const vocabGeneral: EnglishEntry[] = [
  { prompt: 'A synonym of "quick" is ___.', options: ['fast', 'slow', 'heavy', 'late'], correct: 0, difficulty: 1 },
  { prompt: 'The opposite of "cheap" is ___.', options: ['expensive', 'free', 'poor', 'small'], correct: 0, difficulty: 1 },
  { prompt: '"Huge" means ___.', options: ['very large', 'very small', 'very fast', 'very old'], correct: 0, difficulty: 1 },
  { prompt: 'A person who writes books is ___.', options: ['an author', 'a reader', 'a printer', 'a librarian'], correct: 0, difficulty: 1 },
  { prompt: 'To "improve" means to get ___.', options: ['better', 'worse', 'older', 'smaller'], correct: 0, difficulty: 1 },
  { prompt: 'The opposite of "safety" is ___.', options: ['danger', 'security', 'caution', 'rescue'], correct: 0, difficulty: 1 },
  { prompt: 'In foggy weather, you cannot ___ far.', options: ['see', 'hear', 'jump', 'sleep'], correct: 0, difficulty: 1 },
  { prompt: 'The opposite of "arrival" is ___.', options: ['departure', 'entrance', 'landing', 'return'], correct: 0, difficulty: 1 },
  { prompt: '"Reliable" describes someone you can ___.', options: ['trust', 'avoid', 'forget', 'pay'], correct: 0, difficulty: 2 },
  { prompt: 'To "postpone" a meeting means to ___.', options: ['delay it', 'cancel it', 'start it', 'shorten it'], correct: 0, difficulty: 2 },
  { prompt: '"Exhausted" means very ___.', options: ['tired', 'angry', 'hungry', 'excited'], correct: 0, difficulty: 2 },
  { prompt: 'To "purchase" means to ___.', options: ['buy', 'sell', 'borrow', 'steal'], correct: 0, difficulty: 2 },
  { prompt: '"Annual" means happening every ___.', options: ['year', 'month', 'week', 'day'], correct: 0, difficulty: 2 },
  { prompt: 'A "decade" is a period of ___.', options: ['ten years', 'two years', 'one hundred years', 'five years'], correct: 0, difficulty: 2 },
  { prompt: 'The opposite of "increase" is ___.', options: ['decrease', 'rise', 'growth', 'gain'], correct: 0, difficulty: 2 },
  { prompt: '"Brave" is a synonym of ___.', options: ['courageous', 'cowardly', 'careful', 'clever'], correct: 0, difficulty: 2 },
  { prompt: 'Someone who is "punctual" is always ___.', options: ['on time', 'late', 'polite', 'busy'], correct: 0, difficulty: 2 },
  { prompt: 'To "require" means to ___.', options: ['need', 'offer', 'forbid', 'finish'], correct: 0, difficulty: 2 },
  { prompt: '"Wealthy" means ___.', options: ['rich', 'healthy', 'weak', 'wise'], correct: 0, difficulty: 2 },
  { prompt: 'To "hire" someone means to give them a ___.', options: ['job', 'gift', 'ticket', 'lift'], correct: 0, difficulty: 2 },
  { prompt: '"Grateful" means feeling ___.', options: ['thankful', 'great', 'angry', 'afraid'], correct: 0, difficulty: 2 },
  { prompt: '"Seldom" means ___.', options: ['rarely', 'always', 'quickly', 'recently'], correct: 0, difficulty: 3 },
  { prompt: '"Accurate" means ___.', options: ['exact', 'wrong', 'approximate', 'slow'], correct: 0, difficulty: 3 },
  { prompt: '"Mandatory" means ___.', options: ['compulsory', 'optional', 'forbidden', 'useless'], correct: 0, difficulty: 3 },
  { prompt: 'An "attempt" is a ___.', options: ['try', 'success', 'order', 'habit'], correct: 0, difficulty: 3 },
  { prompt: '"Currently" means ___.', options: ['at the moment', 'in the past', 'soon', 'rarely'], correct: 0, difficulty: 3 },
  { prompt: 'To "gather" means to ___.', options: ['collect', 'throw away', 'divide', 'lose'], correct: 0, difficulty: 3 },
  { prompt: '"Weary" means ___.', options: ['tired', 'aware', 'worried', 'wet'], correct: 0, difficulty: 4 },
  { prompt: 'To "assess" means to ___.', options: ['evaluate', 'ignore', 'assist', 'assume'], correct: 0, difficulty: 4 },
  { prompt: '"Scarce" means ___.', options: ['rare', 'plentiful', 'cheap', 'scary'], correct: 0, difficulty: 4 },
  { prompt: 'A "drawback" is a ___.', options: ['disadvantage', 'drawing', 'benefit', 'delay'], correct: 0, difficulty: 4 },
  { prompt: '"Thorough" means ___.', options: ['very careful and complete', 'very fast', 'quite lazy', 'rather loud'], correct: 0, difficulty: 4 },
];

const vocabAviation: EnglishEntry[] = [
  { prompt: 'The "runway" is where the plane ___.', options: ['takes off and lands', 'is repaired', 'is built', 'checks in passengers'], correct: 0, difficulty: 1 },
  { prompt: '"Piste" (aviation) translates to ___.', options: ['runway', 'taxiway', 'highway', 'railway'], correct: 0, difficulty: 1 },
  { prompt: 'The "crew" is ___.', options: ['the people working on the plane', 'the passengers', 'the luggage', 'the engines'], correct: 0, difficulty: 1 },
  { prompt: '"Fuel" is ___.', options: ['what makes the engines run', 'food served on board', 'a safety device', 'a kind of wind'], correct: 0, difficulty: 1 },
  { prompt: '"Take-off" is the moment when the plane ___.', options: ['leaves the ground', 'touches the ground', 'changes direction', 'slows down'], correct: 0, difficulty: 1 },
  { prompt: 'The "altitude" is the ___ of the aircraft.', options: ['height', 'speed', 'weight', 'length'], correct: 0, difficulty: 1 },
  { prompt: 'The "cockpit" is where ___.', options: ['the pilots sit', 'the meals are prepared', 'the luggage is stored', 'the passengers sleep'], correct: 0, difficulty: 1 },
  { prompt: '"Atterrissage" translates to ___.', options: ['landing', 'boarding', 'take-off', 'taxiing'], correct: 0, difficulty: 1 },
  { prompt: 'The "control tower" is responsible for ___.', options: ['managing aircraft movements', 'selling tickets', 'repairing engines', 'serving meals'], correct: 0, difficulty: 1 },
  { prompt: '"Décollage" translates to ___.', options: ['take-off', 'landing', 'boarding', 'delay'], correct: 0, difficulty: 1 },
  { prompt: 'The "gate" is where passengers ___.', options: ['board the aircraft', 'collect their luggage', 'go through security', 'refuel the plane'], correct: 0, difficulty: 1 },
  { prompt: '"Vitesse" translates to ___.', options: ['speed', 'altitude', 'weight', 'distance'], correct: 0, difficulty: 1 },
  { prompt: '"Siège" translates to ___.', options: ['seat', 'belt', 'wing', 'floor'], correct: 0, difficulty: 1 },
  { prompt: '"Équipage" translates to ___.', options: ['crew', 'equipment', 'luggage', 'schedule'], correct: 0, difficulty: 2 },
  { prompt: '"Turbulence" refers to ___.', options: ['irregular air movements', 'engine failure', 'heavy luggage', 'a landing technique'], correct: 0, difficulty: 2 },
  { prompt: 'A "layover" is ___.', options: ['a stop between two flights', 'a type of seat', 'an emergency landing', 'a flight cancellation'], correct: 0, difficulty: 2 },
  { prompt: '"Aile" translates to ___.', options: ['wing', 'wheel', 'window', 'aisle'], correct: 0, difficulty: 2 },
  { prompt: '"Approach" is the phase when the aircraft ___.', options: ['descends towards the runway', 'climbs after take-off', 'parks at the gate', 'boards passengers'], correct: 0, difficulty: 2 },
  { prompt: '"Escale" translates to ___.', options: ['stopover', 'runway', 'gate', 'aisle'], correct: 0, difficulty: 2 },
  { prompt: 'A "mayday" call means ___.', options: ['a life-threatening emergency', 'a routine check', 'a delayed departure', 'a change of gate'], correct: 0, difficulty: 2 },
  { prompt: 'The "black box" records ___.', options: ['flight data and cockpit sounds', 'the in-flight movies', 'the luggage weight', 'the ticket sales'], correct: 0, difficulty: 2 },
  { prompt: '"Carburant" translates to ___.', options: ['fuel', 'cargo', 'carbon', 'engine'], correct: 0, difficulty: 2 },
  { prompt: 'The "aisle" is ___.', options: ['the corridor between the seats', 'the plane\'s wing', 'the emergency exit', 'the pilot\'s seat'], correct: 0, difficulty: 2 },
  { prompt: 'A "clearance" from air traffic control is ___.', options: ['an authorization', 'a punishment', 'a cleaning operation', 'a weather report'], correct: 0, difficulty: 3 },
  { prompt: 'A "holding pattern" means the aircraft ___.', options: ['circles while waiting to land', 'flies faster', 'returns to the departure airport', 'follows another plane'], correct: 0, difficulty: 3 },
  { prompt: 'The "landing gear" refers to the ___.', options: ['wheels', 'wings', 'windows', 'engines'], correct: 0, difficulty: 3 },
  { prompt: 'To "taxi" means the aircraft ___.', options: ['moves slowly on the ground', 'flies at low altitude', 'lands in emergency', 'refuels in the air'], correct: 0, difficulty: 3 },
  { prompt: 'The "fuselage" is ___.', options: ['the main body of the aircraft', 'the front wheel', 'the tail only', 'the fuel tank'], correct: 0, difficulty: 3 },
  { prompt: '"ETA" stands for ___.', options: ['estimated time of arrival', 'extra ticket allowance', 'emergency technical assistance', 'external tank access'], correct: 0, difficulty: 3 },
  { prompt: '"Overbooked" means ___.', options: ['more tickets sold than seats', 'flying above the clouds', 'carrying extra fuel', 'arriving ahead of schedule'], correct: 0, difficulty: 3 },
  { prompt: 'A "red-eye flight" is ___.', options: ['an overnight flight', 'a cancelled flight', 'a low-cost flight', 'a training flight'], correct: 0, difficulty: 4 },
  { prompt: 'To "divert" a flight means to ___.', options: ['send it to a different airport', 'cancel it', 'delay it', 'overbook it'], correct: 0, difficulty: 4 },
];

const comprehension: EnglishEntry[] = [
  { prompt: 'The flight was delayed due to fog.\nWhy was the flight late?', options: ['Because of bad weather', 'Because of a strike', 'Because of a technical problem', 'Because the crew was late'], correct: 0, difficulty: 1 },
  { prompt: 'The seatbelt sign is on; please return to your seats.\nWhat should passengers do?', options: ['Sit down and fasten their seatbelts', 'Leave the aircraft', 'Open the windows', 'Go to the cockpit'], correct: 0, difficulty: 1 },
  { prompt: 'Mary always books a window seat because she loves watching the clouds.\nWhy does Mary choose the window?', options: ['She enjoys the view', 'She is afraid of the aisle', 'It is cheaper', 'She wants to sleep'], correct: 0, difficulty: 1 },
  { prompt: 'Passengers must check in at least two hours before departure.\nWhen should you arrive at check-in?', options: ['No later than two hours before the flight', 'Two hours after departure', 'At least two hours after boarding', 'Whenever you want'], correct: 0, difficulty: 2 },
  { prompt: 'John missed his connection because his first flight landed late.\nWhy did John miss his second flight?', options: ['His first flight was late', 'He overslept', 'He lost his ticket', 'He went to the wrong airport'], correct: 0, difficulty: 2 },
  { prompt: 'If the cabin loses pressure, oxygen masks will drop automatically.\nWhen do the masks drop?', options: ['If cabin pressure is lost', 'When the plane lands', 'When passengers ask for them', 'Before every take-off'], correct: 0, difficulty: 2 },
  { prompt: 'Tom\'s suitcase was five kilos over the limit, so he paid an extra fee.\nWhy did Tom pay more?', options: ['His luggage was too heavy', 'His ticket was invalid', 'He arrived late', 'He changed his seat'], correct: 0, difficulty: 2 },
  { prompt: 'After landing, please remain seated until the aircraft comes to a complete stop.\nWhen may passengers stand up?', options: ['Once the plane has fully stopped', 'As soon as the wheels touch down', 'During the approach', 'Right before landing'], correct: 0, difficulty: 2 },
  { prompt: 'The airline canceled all afternoon flights, but morning departures operated normally.\nWhich flights took place?', options: ['The morning flights', 'The afternoon flights', 'No flights at all', 'Only evening flights'], correct: 0, difficulty: 2 },
  { prompt: 'Only passengers with priority boarding may board at this time.\nWho can board now?', options: ['Passengers with priority boarding', 'All passengers', 'No one', 'Crew members only'], correct: 0, difficulty: 2 },
  { prompt: 'Due to strong winds, the aircraft will land at a nearby airport instead.\nWhat is happening?', options: ['The flight is being diverted', 'The flight is cancelled', 'The plane will land as planned', 'The passengers must change planes'], correct: 0, difficulty: 3 },
  { prompt: 'Although the storm had passed, the runway remained closed for inspection.\nWhy was the runway still closed?', options: ['It had to be inspected', 'The storm was still active', 'A plane was parked on it', 'The airport was understaffed'], correct: 0, difficulty: 3 },
  { prompt: 'The low-cost airline charges for meals, whereas the national carrier includes them.\nWhich airline gives free meals?', options: ['The national carrier', 'The low-cost airline', 'Both airlines', 'Neither airline'], correct: 0, difficulty: 3 },
  { prompt: 'The airline overbooked the flight, so two volunteers took a later plane in exchange for compensation.\nWhat did the volunteers receive?', options: ['Compensation', 'Nothing', 'A free suitcase', 'A new passport'], correct: 0, difficulty: 3 },
  { prompt: 'Sarah, a flight attendant for ten years, has just been promoted to purser.\nWhat is Sarah\'s new position?', options: ['Purser', 'Flight attendant', 'Pilot', 'Passenger'], correct: 0, difficulty: 3 },
  { prompt: 'Boarding starts at 2:40 p.m. and the gate closes fifteen minutes before the 3:10 p.m. departure.\nWhen does the gate close?', options: ['At 2:55 p.m.', 'At 3:10 p.m.', 'At 2:40 p.m.', 'At 3:25 p.m.'], correct: 0, difficulty: 4 },
  { prompt: 'The captain announced a delay of forty minutes, twice as long as first expected.\nHow long was the delay first expected to be?', options: ['Twenty minutes', 'Forty minutes', 'Eighty minutes', 'Ten minutes'], correct: 0, difficulty: 4 },
  { prompt: 'Despite leaving home early, Anna reached the airport only minutes before the gate closed because of a traffic jam.\nWhy was Anna almost late?', options: ['Traffic was heavy', 'She left home late', 'Her taxi broke down', 'The gate closed early'], correct: 0, difficulty: 4 },
  { prompt: 'Visibility dropped below the minimum required, forcing the crew to abort the landing and climb again.\nWhat did the crew do?', options: ['They climbed and gave up the landing attempt', 'They landed immediately', 'They turned off the engines', 'They asked passengers to leave'], correct: 0, difficulty: 5 },
  { prompt: 'Had the mechanics not spotted the faulty sensor, the aircraft would have departed as scheduled.\nWhy didn\'t the plane leave on time?', options: ['A faulty sensor was found', 'The weather was bad', 'The crew was on strike', 'The sensor worked perfectly'], correct: 0, difficulty: 5 },
];

export const BANKS: Record<EnglishBank, EnglishEntry[]> = {
  grammar,
  'vocab-general': vocabGeneral,
  'vocab-aviation': vocabAviation,
  comprehension,
};
