const IDS = ["a", "b", "c", "d"];
const DIFFICULTY_BY_TIER = {
  1: "Easy Ugly HR",
  2: "Certified Ugly Applicant",
  3: "Deep Ugly Department",
  4: "Ugly Labs Internal",
  5: "Impossible Ugly Final"
};
const IMAGE_KEY_BY_TIER = {
  1: "tierEasy",
  2: "tierCertified",
  3: "tierDeep",
  4: "tierInternal",
  5: "tierImpossible"
};
const REWARD_BY_TIER = {
  1: 10,
  2: 40,
  3: 140,
  4: 375,
  5: 850
};

function stableIndex(value, modulo) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash % modulo;
}

function buildOptions(question) {
  const optionCount = question.wrong.length + 1;
  const correctIndex = stableIndex(question.id, optionCount);
  const orderedTexts = [...question.wrong];
  orderedTexts.splice(correctIndex, 0, question.correct);
  return {
    options: orderedTexts.map((text, index) => ({ id: IDS[index], text })),
    correctOptionId: IDS[correctIndex]
  };
}

function q(question) {
  const built = buildOptions(question);
  return {
    id: question.id,
    tier: question.tier,
    difficulty: DIFFICULTY_BY_TIER[question.tier],
    category: question.category,
    imageKey: IMAGE_KEY_BY_TIER[question.tier],
    prompt: question.prompt,
    options: built.options,
    correctOptionId: built.correctOptionId,
    correctRoast: question.correctRoast,
    wrongRoast: question.wrongRoast,
    explanation: question.explanation,
    reward: REWARD_BY_TIER[question.tier]
  };
}

const RAW_QUESTIONS = JSON.parse(String.raw`[
  {
    "id": "human-easy-001",
    "tier": 1,
    "category": "Human Communication",
    "prompt": "Human, when someone says “I’m good” but clearly looks stressed, what are they usually trying to do?",
    "correct": "They are usually avoiding a bigger conversation or trying to stay polite.",
    "wrong": ["They are definitely completely fine."],
    "correctRoast": "Correct. InSquignito has learned that “good” does not always mean good.",
    "wrongRoast": "Not quite. Humans often say they are fine even when the evidence disagrees.",
    "explanation": "People often use simple polite answers to avoid explaining how they really feel."
  },
  {
    "id": "human-easy-002",
    "tier": 1,
    "category": "Small Talk",
    "prompt": "Why do humans talk about the weather when they do not know what else to say?",
    "correct": "Because weather is a safe, easy topic that almost anyone can respond to.",
    "wrong": ["Because they are usually giving a detailed climate report."],
    "correctRoast": "Correct. A safe topic has been identified. InSquignito respects the efficiency.",
    "wrongRoast": "Not quite. Most weather small talk is not meant to be scientific.",
    "explanation": "Weather is common small talk because it is neutral and easy to share."
  },
  {
    "id": "human-easy-003",
    "tier": 1,
    "category": "Public Behavior",
    "prompt": "Why do people suddenly go quiet when they step into an elevator with strangers?",
    "correct": "Because elevators create awkward close contact, so people avoid making it stranger.",
    "wrong": ["Because everyone temporarily forgets how to speak."],
    "correctRoast": "Correct. Tiny room. Many humans. Minimal speech. Logged.",
    "wrongRoast": "Not quite. The words are still available. The confidence is not.",
    "explanation": "People often stay quiet in elevators because the space feels socially awkward."
  },
  {
    "id": "human-easy-004",
    "tier": 1,
    "category": "Kitchen Behavior",
    "prompt": "Why do humans open the fridge, close it, and then open it again a few seconds later?",
    "correct": "They are hoping something better will somehow appear.",
    "wrong": ["They are usually checking if the fridge door still works."],
    "correctRoast": "Correct. Hope has been detected inside the cold box.",
    "wrongRoast": "Not quite. The door is usually fine. The snack situation is not.",
    "explanation": "People often re-check the fridge out of boredom, habit, or hope."
  },
  {
    "id": "human-easy-005",
    "tier": 1,
    "category": "Texting",
    "prompt": "When someone types “lol” but is not actually laughing, what do they usually mean?",
    "correct": "They are acknowledging the message in a casual way.",
    "wrong": ["They are always laughing loudly in real life."],
    "correctRoast": "Correct. InSquignito has recorded “lol” as flexible human punctuation.",
    "wrongRoast": "Not quite. Many human lols contain zero actual laughter.",
    "explanation": "In texting, “lol” often means acknowledgment, friendliness, or softening the tone."
  },
  {
    "id": "human-easy-006",
    "tier": 1,
    "category": "Automatic Manners",
    "prompt": "Why do humans sometimes apologize to objects they bump into?",
    "correct": "Because saying sorry can become an automatic reflex.",
    "wrong": ["Because the object is usually offended."],
    "correctRoast": "Correct. The human apologized before checking if the chair had feelings.",
    "wrongRoast": "Not quite. The chair has filed no emotional paperwork.",
    "explanation": "Some people apologize automatically, even when no person is involved."
  },
  {
    "id": "human-easy-007",
    "tier": 1,
    "category": "Leaving The House",
    "prompt": "Why do humans pat their pockets before leaving the house?",
    "correct": "They are checking for essentials like phone, wallet, and keys.",
    "wrong": ["They are usually practicing a secret pocket dance."],
    "correctRoast": "Correct. The sacred leaving checklist has been observed.",
    "wrongRoast": "Not quite. Although InSquignito admits the movement is dance-adjacent.",
    "explanation": "People check their pockets to make sure they are not forgetting important items."
  },
  {
    "id": "human-easy-008",
    "tier": 1,
    "category": "Food Rituals",
    "prompt": "Why do people take pictures of their food before eating it?",
    "correct": "They want to save the moment or share it with others.",
    "wrong": ["They are asking the food for permission."],
    "correctRoast": "Correct. Documentation before digestion. A very human ritual.",
    "wrongRoast": "Not quite. The meal rarely gets a vote.",
    "explanation": "Food photos are often taken for memories, social posts, or sharing experiences."
  },
  {
    "id": "human-easy-009",
    "tier": 1,
    "category": "Household Logic",
    "prompt": "When the trash is full, why do humans try pushing it down instead of taking it out?",
    "correct": "They are trying to delay the chore a little longer.",
    "wrong": ["They believe this permanently solves garbage."],
    "correctRoast": "Correct. Chore avoidance has been compressed by hand.",
    "wrongRoast": "Not quite. The garbage remains very much involved.",
    "explanation": "Pushing down trash can create a little space, but it usually just delays taking it out."
  },
  {
    "id": "human-easy-010",
    "tier": 1,
    "category": "Morning Behavior",
    "prompt": "Why do some humans say they cannot function before coffee?",
    "correct": "Coffee is part of their morning routine and helps them feel awake.",
    "wrong": ["Coffee is legally required before speaking."],
    "correctRoast": "Correct. Bean water appears to unlock several human features.",
    "wrongRoast": "Not quite. The law is unclear, but the dependency is loud.",
    "explanation": "Many people rely on coffee as a routine, comfort, or caffeine boost."
  },
  {
    "id": "human-easy-011",
    "tier": 1,
    "category": "Traffic Manners",
    "prompt": "Why do drivers give a small wave after another driver lets them in?",
    "correct": "It is a quick thank-you gesture.",
    "wrong": ["It means the drivers are now close friends."],
    "correctRoast": "Correct. A small hand movement has prevented possible road tension.",
    "wrongRoast": "Not quite. Human friendship usually requires more than one windshield wave.",
    "explanation": "The small wave is a common polite way to acknowledge another driver."
  },
  {
    "id": "human-easy-012",
    "tier": 1,
    "category": "Digital Communication",
    "prompt": "What does a thumbs-up reaction usually mean in a conversation?",
    "correct": "It usually means the person saw the message and agrees or acknowledges it.",
    "wrong": ["It always means the person is excited and deeply invested."],
    "correctRoast": "Correct. One thumb has replaced several words.",
    "wrongRoast": "Not quite. The thumb may be polite, efficient, or mildly tired.",
    "explanation": "Reactions can be a quick way to confirm or acknowledge something without writing a reply."
  },
  {
    "id": "human-easy-013",
    "tier": 1,
    "category": "Laundry",
    "prompt": "Why do humans blame the laundry machine when one sock disappears?",
    "correct": "Because socks often get lost and the machine is the easiest suspect.",
    "wrong": ["Because washing machines secretly collect socks as trophies."],
    "correctRoast": "Correct. InSquignito finds the evidence weak but emotionally satisfying.",
    "wrongRoast": "Not quite. The trophy theory remains unproven.",
    "explanation": "Lost socks are common, and people joke that the washer or dryer is responsible."
  },
  {
    "id": "human-easy-014",
    "tier": 1,
    "category": "Time Estimates",
    "prompt": "When someone says “I’ll be ready in five minutes,” what does that usually mean?",
    "correct": "It often means they need a little more time than they are admitting.",
    "wrong": ["It always means exactly five minutes."],
    "correctRoast": "Correct. Human minutes appear to stretch under pressure.",
    "wrongRoast": "Not quite. InSquignito has learned not to trust this number.",
    "explanation": "People often underestimate how long it will take to get ready."
  },
  {
    "id": "human-easy-015",
    "tier": 1,
    "category": "Weekend Plans",
    "prompt": "Why do humans get excited when they have no plans for the weekend?",
    "correct": "Because free time with no obligations can feel relaxing.",
    "wrong": ["Because they have forgotten how fun works."],
    "correctRoast": "Correct. Nothing scheduled. Human happiness increases.",
    "wrongRoast": "Not quite. For many humans, doing nothing is the fun.",
    "explanation": "A weekend without commitments can feel peaceful and valuable."
  },
  {
    "id": "human-easy-016",
    "tier": 1,
    "category": "Online Shopping",
    "prompt": "Why do people check package tracking over and over, even when nothing has changed?",
    "correct": "They are excited or impatient and want an update.",
    "wrong": ["They believe refreshing the page makes the package move faster."],
    "correctRoast": "Correct. Hope has refreshed the page again.",
    "wrongRoast": "Not quite. The package does not respond to emotional clicking.",
    "explanation": "People often check tracking repeatedly because they are anticipating the delivery."
  },
  {
    "id": "human-easy-017",
    "tier": 1,
    "category": "Memory",
    "prompt": "Why do humans walk into a room and suddenly forget why they went there?",
    "correct": "Changing rooms can interrupt their memory or focus.",
    "wrong": ["The room usually deletes the mission."],
    "correctRoast": "Correct. The doorway has disrupted the human quest.",
    "wrongRoast": "Not quite. The room is suspicious, but probably innocent.",
    "explanation": "Moving into a new space can sometimes break the mental thread of what someone was doing."
  },
  {
    "id": "human-easy-018",
    "tier": 1,
    "category": "Sleep Habits",
    "prompt": "Why do people say they are going to bed and then keep watching shows?",
    "correct": "They want more relaxation even though they know they should sleep.",
    "wrong": ["They discovered a secret supply of extra night hours."],
    "correctRoast": "Correct. Present comfort has defeated future tiredness.",
    "wrongRoast": "Not quite. The hours are not extra. They are borrowed from tomorrow.",
    "explanation": "People often delay sleep to keep enjoying free time."
  },
  {
    "id": "human-easy-019",
    "tier": 1,
    "category": "Email",
    "prompt": "When someone writes “just following up” in an email, what are they really trying to say?",
    "correct": "They are politely reminding someone to respond or take action.",
    "wrong": ["They are simply enjoying email as a hobby."],
    "correctRoast": "Correct. A polite reminder has entered the inbox.",
    "wrongRoast": "Not quite. Very few humans follow up for sport.",
    "explanation": "Follow-up emails are usually reminders about something that still needs attention."
  },
  {
    "id": "human-easy-020",
    "tier": 1,
    "category": "Human Summary",
    "prompt": "Human, what is one thing people are weirdly good at?",
    "correct": "Acting normal while doing many strange little habits.",
    "wrong": ["Being completely simple and easy to understand."],
    "correctRoast": "Correct. InSquignito has found the human pattern.",
    "wrongRoast": "Not quite. Humans are rarely that simple.",
    "explanation": "The game is about noticing how strange normal human behavior can look from the outside."
  },
  {
    "id": "human-certified-001",
    "tier": 2,
    "category": "Social Plans",
    "prompt": "When someone says “we should hang out sometime,” does that usually mean real plans were made?",
    "correct": "Not always. It can be friendly without being a firm plan.",
    "wrong": ["Yes, it always means a date and time have been confirmed.", "No, it is always meant as an insult."],
    "correctRoast": "Correct. InSquignito has logged this as a soft social promise.",
    "wrongRoast": "Not quite. Human planning language is often vague.",
    "explanation": "This phrase can express interest, but real plans usually need a specific time and place."
  },
  {
    "id": "human-certified-002",
    "tier": 2,
    "category": "Email Tone",
    "prompt": "Why do people write “no worries” when they are clearly a little worried?",
    "correct": "They are trying to stay polite and reduce tension.",
    "wrong": ["Because they have no concerns at all.", "Because emails remove all feelings."],
    "correctRoast": "Correct. Politeness has been placed over mild stress.",
    "wrongRoast": "Not quite. The worries may still be present under the wording.",
    "explanation": "People often use polite phrases to keep a conversation calm or professional."
  },
  {
    "id": "human-certified-003",
    "tier": 2,
    "category": "Home Habits",
    "prompt": "Why do humans clean their house before someone comes to clean it?",
    "correct": "They want to tidy obvious messes or avoid embarrassment.",
    "wrong": ["Because the cleaner refuses all dust.", "Because cleaning once does not count unless it happens twice."],
    "correctRoast": "Correct. InSquignito has detected pre-cleaning shame.",
    "wrongRoast": "Not quite. The cleaner expects cleaning. The human expects judgment.",
    "explanation": "People may tidy before a cleaner arrives out of courtesy or embarrassment."
  },
  {
    "id": "human-certified-004",
    "tier": 2,
    "category": "Storage",
    "prompt": "Why do people save good cardboard boxes instead of throwing them out?",
    "correct": "They think the box might be useful later.",
    "wrong": ["Because every box has emotional rights.", "Because cardboard becomes more valuable with age."],
    "correctRoast": "Correct. Future usefulness has been imagined.",
    "wrongRoast": "Not quite. The box is practical, not royal.",
    "explanation": "People often keep boxes for moving, storage, shipping, or a future need."
  },
  {
    "id": "human-certified-005",
    "tier": 2,
    "category": "Bedroom Habits",
    "prompt": "Why does one chair in a bedroom always become the place for clothes?",
    "correct": "It becomes an easy temporary spot for clothes that are not fully clean or dirty.",
    "wrong": ["Because chairs are secretly closets.", "Because laundry baskets are only decorative."],
    "correctRoast": "Correct. The chair has accepted a confusing job.",
    "wrongRoast": "Not quite. The chair is not a closet, but humans treat it like one.",
    "explanation": "People often use a chair as a quick holding place for clothes."
  },
  {
    "id": "human-certified-006",
    "tier": 2,
    "category": "Pets",
    "prompt": "Why do humans talk to dogs like the dog understands every word?",
    "correct": "Because it feels natural and strengthens the bond with the pet.",
    "wrong": ["Because dogs manage household schedules.", "Because dogs require full verbal instructions for every decision."],
    "correctRoast": "Correct. InSquignito notes that the dog understood the tone, at least.",
    "wrongRoast": "Not quite. The dog knows some words, but probably not the full agenda.",
    "explanation": "People often speak to pets for connection, comfort, and routine."
  },
  {
    "id": "human-certified-007",
    "tier": 2,
    "category": "Recipes",
    "prompt": "Why do recipe websites sometimes tell a whole story before showing the recipe?",
    "correct": "The story adds context, personality, and helps the page perform online.",
    "wrong": ["Because the ingredients need a backstory.", "Because ovens refuse recipes without memories."],
    "correctRoast": "Correct. InSquignito has discovered recipe storytelling and search optimization.",
    "wrongRoast": "Not quite. The muffins do not need lore, but the website might.",
    "explanation": "Recipe pages often include personal stories, tips, and search-friendly content before the recipe."
  },
  {
    "id": "human-certified-008",
    "tier": 2,
    "category": "Night Etiquette",
    "prompt": "Why do people stop the microwave with one second left?",
    "correct": "They are trying to avoid the loud beep.",
    "wrong": ["Because food changes at exactly zero seconds.", "Because microwaves are quieter when respected."],
    "correctRoast": "Correct. The beep has been prevented. The household remains calm.",
    "wrongRoast": "Not quite. The final second is about noise, not food science.",
    "explanation": "People often stop the microwave early to avoid disturbing others."
  },
  {
    "id": "human-certified-009",
    "tier": 2,
    "category": "Food Safety",
    "prompt": "How long can leftovers stay in the fridge before humans stop trusting them?",
    "correct": "It depends on the food, the date, and how confident the person feels.",
    "wrong": ["Exactly forever if the lid is closed.", "Until the container becomes emotionally suspicious."],
    "correctRoast": "Correct. Human leftover confidence is part science, part fear.",
    "wrongRoast": "Not quite. The lid alone does not grant immortality.",
    "explanation": "People judge leftovers by date, smell, type of food, and personal comfort."
  },
  {
    "id": "human-certified-010",
    "tier": 2,
    "category": "Parking",
    "prompt": "Why do people circle a parking lot to find a closer spot instead of walking a little farther?",
    "correct": "They prefer convenience, even if it does not always save time.",
    "wrong": ["Because farther parking spots are illegal.", "Because walking only counts inside the store."],
    "correctRoast": "Correct. Time was spent to save distance.",
    "wrongRoast": "Not quite. The far spots are legal. They are simply less tempting.",
    "explanation": "People often overvalue a close parking spot because it feels more convenient."
  },
  {
    "id": "human-certified-011",
    "tier": 2,
    "category": "Work",
    "prompt": "Why do humans sometimes have meetings for things that could have been emails?",
    "correct": "Because people may want discussion, alignment, or visibility, even when a message would work.",
    "wrong": ["Because calendars need to be filled to stay healthy.", "Because email is forbidden during daylight."],
    "correctRoast": "Correct. InSquignito has detected possible over-meeting.",
    "wrongRoast": "Not quite. The calendar is not alive, though it may feel powerful.",
    "explanation": "Some meetings are useful, but others happen from habit or a desire to talk things through."
  },
  {
    "id": "human-certified-012",
    "tier": 2,
    "category": "Self Checkout",
    "prompt": "Why do self-checkout machines make humans feel like they are doing something wrong?",
    "correct": "Because the machine gives strict alerts and watches every step.",
    "wrong": ["Because buying bananas is usually suspicious.", "Because groceries require a legal defense."],
    "correctRoast": "Correct. The machine has judged the bagging area again.",
    "wrongRoast": "Not quite. The banana is innocent this time.",
    "explanation": "Self-checkout machines can be stressful because small mistakes trigger warnings."
  },
  {
    "id": "human-certified-013",
    "tier": 2,
    "category": "Technology",
    "prompt": "Why does unplugging the router fix the internet so often?",
    "correct": "Restarting it can clear temporary problems and reconnect the system.",
    "wrong": ["Because the router needs a nap to feel appreciated.", "Because internet problems are always caused by wall plugs."],
    "correctRoast": "Correct. The ancient reboot method remains effective.",
    "wrongRoast": "Not quite. The nap explanation is emotionally satisfying, but incomplete.",
    "explanation": "Restarting devices is a common troubleshooting step because it resets temporary errors."
  },
  {
    "id": "human-certified-014",
    "tier": 2,
    "category": "Planning",
    "prompt": "Why do people buy planners and then forget to use them?",
    "correct": "Buying the planner feels like progress, but using it requires a habit.",
    "wrong": ["Because planners are meant to be admired, not opened.", "Because calendars become shy when written in."],
    "correctRoast": "Correct. Organization was purchased, but not installed.",
    "wrongRoast": "Not quite. The planner is ready. The human is the uncertain part.",
    "explanation": "Tools only help when people build a routine around using them."
  },
  {
    "id": "human-certified-015",
    "tier": 2,
    "category": "Public Courtesy",
    "prompt": "Why do humans judge each other based on whether they return the shopping cart?",
    "correct": "Because it is a small test of consideration when no one is forcing them.",
    "wrong": ["Because cart return creates legal royalty status.", "Because carts remember every human forever."],
    "correctRoast": "Correct. A tiny parking-lot character test has been observed.",
    "wrongRoast": "Not quite. The cart has no crown, only wheels.",
    "explanation": "Returning a cart is often seen as a simple considerate action."
  },
  {
    "id": "human-certified-016",
    "tier": 2,
    "category": "Email",
    "prompt": "Why is “reply all” such a dangerous button at work?",
    "correct": "Because a private or unnecessary reply can accidentally go to many people.",
    "wrong": ["Because it instantly deletes the office printer.", "Because everyone secretly wants more email."],
    "correctRoast": "Correct. One button can create a public inbox event.",
    "wrongRoast": "Not quite. The printer is safe. The sender may not be.",
    "explanation": "Reply all mistakes can be embarrassing or disruptive."
  },
  {
    "id": "human-certified-017",
    "tier": 2,
    "category": "Goodbyes",
    "prompt": "Why do people say they are leaving and then keep talking for a long time?",
    "correct": "Because goodbyes often turn into extra conversations.",
    "wrong": ["Because doors move farther away during conversations.", "Because leaving requires a permit."],
    "correctRoast": "Correct. The exit has begun but not completed.",
    "wrongRoast": "Not quite. The door is still there. The goodbye expanded.",
    "explanation": "Social exits can take time because people keep adding final thoughts."
  },
  {
    "id": "human-certified-018",
    "tier": 2,
    "category": "Cables",
    "prompt": "Why do humans keep broken chargers “just in case”?",
    "correct": "They think the charger might still be useful someday.",
    "wrong": ["Because broken chargers improve WiFi.", "Because cable drawers must be fed."],
    "correctRoast": "Correct. The drawer of possible future usefulness grows stronger.",
    "wrongRoast": "Not quite. WiFi has not improved.",
    "explanation": "People often keep old cords because they are unsure whether they will need them later."
  },
  {
    "id": "human-certified-019",
    "tier": 2,
    "category": "Movies",
    "prompt": "Why do people sneak snacks into movies and still buy popcorn?",
    "correct": "They want their own snacks but still enjoy the movie-theater popcorn experience.",
    "wrong": ["Because popcorn is legally required for trailers.", "Because outside snacks get lonely."],
    "correctRoast": "Correct. Practical snacks plus ceremonial popcorn.",
    "wrongRoast": "Not quite. The snacks are fine. The popcorn tradition is powerful.",
    "explanation": "People may bring snacks to save money or get variety, while still buying popcorn as part of the experience."
  },
  {
    "id": "human-certified-020",
    "tier": 2,
    "category": "Human Summary",
    "prompt": "Human, how would you explain what people are really like?",
    "correct": "People are mostly trying their best while carrying a lot of small habits and contradictions.",
    "wrong": ["People are simple and always make logical choices.", "People are impossible to understand at all."],
    "correctRoast": "Correct. InSquignito accepts this balanced human report.",
    "wrongRoast": "Not quite. Humans are neither fully logical nor fully impossible.",
    "explanation": "Human behavior is often practical, emotional, social, and contradictory at the same time."
  },
  {
    "id": "human-deep-001",
    "tier": 3,
    "category": "Microwave Behavior",
    "prompt": "Why do humans stand and watch the microwave while their food heats up?",
    "correct": "They are waiting impatiently, even though watching does not help.",
    "wrong": ["They are controlling the spin with eye contact.", "The food needs encouragement."],
    "correctRoast": "Correct. Observation has not sped up the food, but humans continue.",
    "wrongRoast": "Not quite. The microwave does not require emotional support.",
    "explanation": "People often watch because they are hungry, bored, or impatient."
  },
  {
    "id": "human-deep-002",
    "tier": 3,
    "category": "Work Phrases",
    "prompt": "When someone says “living the dream” with no emotion, what do they usually mean?",
    "correct": "They are probably joking that work or life is tiring.",
    "wrong": ["They are literally describing a perfect dream.", "They are asking for sleep advice."],
    "correctRoast": "Correct. InSquignito has detected sarcasm in the workplace.",
    "wrongRoast": "Not quite. The dream appears to have fluorescent lighting.",
    "explanation": "This phrase is often used sarcastically when someone is tired or stressed."
  },
  {
    "id": "human-deep-003",
    "tier": 3,
    "category": "Decor",
    "prompt": "Why do people decorate their homes with fake plants?",
    "correct": "They want the look of plants without needing to care for them.",
    "wrong": ["They believe plastic plants clean the air.", "They are training for real trees."],
    "correctRoast": "Correct. Nature has been simulated with lower responsibility.",
    "wrongRoast": "Not quite. The fake plant is decorative, not botanical.",
    "explanation": "Fake plants add color and style without watering, sunlight, or maintenance."
  },
  {
    "id": "human-deep-004",
    "tier": 3,
    "category": "Social Energy",
    "prompt": "Why do humans sometimes feel relieved when plans get cancelled?",
    "correct": "They may like being invited but also enjoy unexpected free time.",
    "wrong": ["They always disliked the person who invited them.", "They are legally required to celebrate cancellations."],
    "correctRoast": "Correct. Social approval received. Personal time restored.",
    "wrongRoast": "Not quite. Relief does not always mean dislike.",
    "explanation": "Cancelled plans can feel like a break, even when the original invitation was welcome."
  },
  {
    "id": "human-deep-005",
    "tier": 3,
    "category": "Inbox",
    "prompt": "Why do people leave unread emails piling up instead of dealing with them?",
    "correct": "They may be avoiding stress, decisions, or tasks attached to the emails.",
    "wrong": ["Unread emails become less real over time.", "Red notification dots are home decor."],
    "correctRoast": "Correct. The inbox has become a waiting room for decisions.",
    "wrongRoast": "Not quite. The emails remain real, unfortunately.",
    "explanation": "Unread messages can pile up when people feel overwhelmed or delay responding."
  },
  {
    "id": "human-deep-006",
    "tier": 3,
    "category": "Spending",
    "prompt": "Why do humans check their bank account, feel bad, and then order food anyway?",
    "correct": "Convenience or comfort can win even when they know they should save money.",
    "wrong": ["Checking the balance creates more money.", "Delivery food does not count if ordered sadly."],
    "correctRoast": "Correct. Budget concern has met French fries and lost.",
    "wrongRoast": "Not quite. The bank account noticed.",
    "explanation": "People sometimes choose comfort or convenience despite financial concerns."
  },
  {
    "id": "human-deep-007",
    "tier": 3,
    "category": "Terms",
    "prompt": "Why do people click “I agree” without reading what they agreed to?",
    "correct": "The terms are usually long, complex, and blocking what they want to do.",
    "wrong": ["They fully understand every legal paragraph.", "The checkbox explains everything emotionally."],
    "correctRoast": "Correct. The scroll box has defeated another human.",
    "wrongRoast": "Not quite. Full understanding was not present.",
    "explanation": "Many people accept terms because reading them fully is time-consuming and difficult."
  },
  {
    "id": "human-deep-008",
    "tier": 3,
    "category": "Home Conflict",
    "prompt": "Why can one degree on the thermostat cause an argument?",
    "correct": "People experience temperature differently and comfort matters at home.",
    "wrong": ["One degree changes the laws of weather.", "Thermostats enjoy starting drama."],
    "correctRoast": "Correct. One small number can carry large household feelings.",
    "wrongRoast": "Not quite. The thermostat is only partly responsible.",
    "explanation": "Small differences in temperature can feel important when people share a space."
  },
  {
    "id": "human-deep-009",
    "tier": 3,
    "category": "Travel",
    "prompt": "Why do humans accept airport security like it is a normal part of life?",
    "correct": "Because it is a required step for flying, even if it feels awkward.",
    "wrong": ["Because everyone enjoys removing shoes in public.", "Because bins are a sacred travel tradition."],
    "correctRoast": "Correct. The flying ritual contains many bins.",
    "wrongRoast": "Not quite. Enjoyment is not the main ingredient.",
    "explanation": "Airport security is normalized because travelers must go through it to board flights."
  },
  {
    "id": "human-deep-010",
    "tier": 3,
    "category": "Work Talk",
    "prompt": "Why does a “quick question” often turn into a long conversation?",
    "correct": "Because the simple question may have a complicated background.",
    "wrong": ["Because “quick” means at least one hour.", "Because questions grow when spoken aloud."],
    "correctRoast": "Correct. The small question was carrying luggage.",
    "wrongRoast": "Not quite. The word “quick” was optimistic.",
    "explanation": "People often introduce complicated issues with casual phrases."
  },
  {
    "id": "human-deep-011",
    "tier": 3,
    "category": "Recipes",
    "prompt": "Why do people save recipes they never actually make?",
    "correct": "Saving the recipe feels like a step toward the person they want to be.",
    "wrong": ["Screenshots count as cooking.", "Recipes improve by being ignored."],
    "correctRoast": "Correct. InSquignito has found ambition in the camera roll.",
    "wrongRoast": "Not quite. No meal has occurred yet.",
    "explanation": "People save ideas for future versions of themselves, even if they never act on them."
  },
  {
    "id": "human-deep-012",
    "tier": 3,
    "category": "Food Etiquette",
    "prompt": "Why does someone leave one small bite of food instead of finishing it?",
    "correct": "They may not want to seem like the person who took the last bite.",
    "wrong": ["The final bite is always dangerous.", "The plate charges extra for completion."],
    "correctRoast": "Correct. Politeness has abandoned one bite.",
    "wrongRoast": "Not quite. The bite is probably safe, just socially complicated.",
    "explanation": "People sometimes avoid taking the last piece because they want to seem considerate."
  },
  {
    "id": "human-deep-013",
    "tier": 3,
    "category": "Rest",
    "prompt": "Why do humans need reminders to relax?",
    "correct": "Because busy routines can make rest feel like something that must be scheduled.",
    "wrong": ["Relaxation only works when a phone commands it.", "Calendars are naturally peaceful objects."],
    "correctRoast": "Correct. Rest has been converted into a task.",
    "wrongRoast": "Not quite. The calendar is useful, not calming by itself.",
    "explanation": "Some people schedule rest because otherwise other responsibilities take over."
  },
  {
    "id": "human-deep-014",
    "tier": 3,
    "category": "Voice Notes",
    "prompt": "Why do people send long voice notes instead of short messages?",
    "correct": "Speaking can feel easier than organizing thoughts into a short text.",
    "wrong": ["Every voice note is legally a podcast.", "Short messages are no longer allowed."],
    "correctRoast": "Correct. The human has outsourced editing to the listener.",
    "wrongRoast": "Not quite. The listener may feel like it is a podcast, but it is not official.",
    "explanation": "Voice notes can be convenient for the sender but time-consuming for the receiver."
  },
  {
    "id": "human-deep-015",
    "tier": 3,
    "category": "Gym Logic",
    "prompt": "Why do humans look for the closest parking spot at the gym?",
    "correct": "They want the workout, but not extra effort before the workout begins.",
    "wrong": ["Exercise only counts after entering the building.", "The treadmill refuses distant parking."],
    "correctRoast": "Correct. Fitness begins after the front door, apparently.",
    "wrongRoast": "Not quite. The legs were available earlier.",
    "explanation": "People often separate planned exercise from small everyday effort."
  },
  {
    "id": "human-deep-016",
    "tier": 3,
    "category": "Household Storage",
    "prompt": "Why do people keep old appliance manuals they will probably never read?",
    "correct": "They worry they might need them someday.",
    "wrong": ["Paper becomes wiser in drawers.", "Appliances feel safer with paperwork nearby."],
    "correctRoast": "Correct. Future troubleshooting has been stored and forgotten.",
    "wrongRoast": "Not quite. The manual is probably just taking up drawer space.",
    "explanation": "People keep manuals as a just-in-case resource, even when they rarely use them."
  },
  {
    "id": "human-deep-017",
    "tier": 3,
    "category": "Attention",
    "prompt": "Why do humans watch a show while also scrolling on their phone?",
    "correct": "They are splitting attention between entertainment and another source of stimulation.",
    "wrong": ["This creates perfect focus.", "The show improves when ignored."],
    "correctRoast": "Correct. Two screens have divided one human.",
    "wrongRoast": "Not quite. Focus has not been improved.",
    "explanation": "Many people use multiple screens because they are used to constant stimulation."
  },
  {
    "id": "human-deep-018",
    "tier": 3,
    "category": "Work Phrases",
    "prompt": "What does “let’s circle back” usually mean at work?",
    "correct": "It usually means the topic will be revisited later.",
    "wrong": ["The problem has become a literal circle.", "A decision has definitely been made."],
    "correctRoast": "Correct. The topic has been sent into temporary orbit.",
    "wrongRoast": "Not quite. No decision has landed yet.",
    "explanation": "This phrase is often used to pause a discussion and return to it later."
  },
  {
    "id": "human-deep-019",
    "tier": 3,
    "category": "Decor",
    "prompt": "Why do people own pillows that get moved before anyone can sit or sleep?",
    "correct": "They are decorative and meant to make the space look better.",
    "wrong": ["The pillows are guests with assigned seating.", "Couches require soft armor."],
    "correctRoast": "Correct. Comfort has been decorated until slightly inconvenient.",
    "wrongRoast": "Not quite. The pillows are mostly for appearance.",
    "explanation": "Decorative pillows are often used for style more than practical comfort."
  },
  {
    "id": "human-deep-020",
    "tier": 3,
    "category": "Human Observation",
    "prompt": "Why do humans seem normal at first, but become stranger the more you observe them?",
    "correct": "Because everyday habits can look odd when examined closely.",
    "wrong": ["Because humans are secretly simple.", "Because observation changes their species."],
    "correctRoast": "Correct. InSquignito has discovered normal-looking weirdness.",
    "wrongRoast": "Not quite. The weirdness was already there.",
    "explanation": "The humor comes from looking closely at ordinary behavior until it seems strange."
  },
  {
    "id": "human-internal-001",
    "tier": 4,
    "category": "Polite Pressure",
    "prompt": "When someone says “no rush,” how much of a rush is there usually?",
    "correct": "There may still be some urgency, but they are trying to sound polite.",
    "wrong": ["There is never any urgency at all.", "They want the task ignored forever.", "They are talking about running speed."],
    "correctRoast": "Correct. Polite patience has been mixed with quiet urgency.",
    "wrongRoast": "Not quite. “No rush” does not always mean unlimited time.",
    "explanation": "People often soften requests with polite language even when they still want progress."
  },
  {
    "id": "human-internal-002",
    "tier": 4,
    "category": "Email Translation",
    "prompt": "What does “per my last email” mean in human workplace language?",
    "correct": "It often means the person is pointing back to information they already sent.",
    "wrong": ["It is always a warm compliment.", "It means the last email was deleted.", "It is usually about lunch plans."],
    "correctRoast": "Correct. Previous information has re-entered the room.",
    "wrongRoast": "Not quite. That phrase often carries a little frustration.",
    "explanation": "The phrase can be neutral, but it often implies someone missed or ignored earlier information."
  },
  {
    "id": "human-internal-003",
    "tier": 4,
    "category": "Home Etiquette",
    "prompt": "Why do humans own special towels that guests can see but should not really use?",
    "correct": "They are meant to make the space look nice or feel prepared for guests.",
    "wrong": ["The towels are too important for water.", "Guests must solve a towel puzzle.", "The towels are only for decoration by law."],
    "correctRoast": "Correct. InSquignito has discovered display towels.",
    "wrongRoast": "Not quite. The towels are usable in theory, but socially confusing.",
    "explanation": "Some household items are kept looking nice for presentation or special use."
  },
  {
    "id": "human-internal-004",
    "tier": 4,
    "category": "Receipts",
    "prompt": "Why does finding an old receipt in a pocket feel strangely important?",
    "correct": "It is a small reminder of something you bought or did in the past.",
    "wrong": ["It is usually valuable currency.", "It means the pants kept a diary.", "It proves the store is still watching."],
    "correctRoast": "Correct. A tiny paper fossil has been discovered.",
    "wrongRoast": "Not quite. The receipt is mostly memory debris.",
    "explanation": "Old receipts can feel oddly personal because they capture a small past moment."
  },
  {
    "id": "human-internal-005",
    "tier": 4,
    "category": "Automatic Apologies",
    "prompt": "Why do people apologize even when someone else bumps into them?",
    "correct": "Because apologizing can be an automatic social reflex.",
    "wrong": ["Because they caused the other person’s movement.", "Because every collision requires both people to confess.", "Because floors demand apologies."],
    "correctRoast": "Correct. The apology arrived before the facts.",
    "wrongRoast": "Not quite. The human may not be responsible, but the sorry escaped anyway.",
    "explanation": "Some people say sorry automatically to smooth awkward moments."
  },
  {
    "id": "human-internal-006",
    "tier": 4,
    "category": "Online Shopping",
    "prompt": "Why do humans fill an online cart and then leave without buying anything?",
    "correct": "They may be browsing, comparing costs, or imagining the purchase.",
    "wrong": ["They secretly bought invisible products.", "Shipping costs are a form of entertainment.", "The cart was only there for exercise."],
    "correctRoast": "Correct. The fantasy purchase was briefly held in captivity.",
    "wrongRoast": "Not quite. No purchase happened, but the idea was tested.",
    "explanation": "Online carts are often used to plan or consider purchases before deciding."
  },
  {
    "id": "human-internal-007",
    "tier": 4,
    "category": "Work Culture",
    "prompt": "Why do people panic when asked to share a “fun fact” about themselves?",
    "correct": "Because they suddenly have to be interesting in a safe, quick way.",
    "wrong": ["Because fun facts are illegal at work.", "Because everyone forgets their entire life.", "Because projectors steal personality."],
    "correctRoast": "Correct. InSquignito has observed personality under pressure.",
    "wrongRoast": "Not quite. The life remains intact, but the mind goes blank.",
    "explanation": "Icebreakers can feel awkward because people want to share something appropriate but not boring."
  },
  {
    "id": "human-internal-008",
    "tier": 4,
    "category": "Sleep",
    "prompt": "Why do humans set several alarms instead of getting up after the first one?",
    "correct": "They expect to struggle waking up and want backup alarms.",
    "wrong": ["They are training the phone to be louder.", "They enjoy being startled repeatedly.", "They believe time needs reminders too."],
    "correctRoast": "Correct. Future human has been judged unreliable.",
    "wrongRoast": "Not quite. The alarms are backup, not a hobby.",
    "explanation": "Multiple alarms help people feel safer about not oversleeping."
  },
  {
    "id": "human-internal-009",
    "tier": 4,
    "category": "Food And Mood",
    "prompt": "Why do people stare into the fridge when they are not sure what they want?",
    "correct": "They are looking for something that matches their mood, not just their hunger.",
    "wrong": ["They are waiting for the fridge to suggest a meal.", "They are checking if adulthood is inside.", "They believe cold air improves decisions."],
    "correctRoast": "Correct. The snack must satisfy more than the stomach.",
    "wrongRoast": "Not quite. The fridge has no official recommendation engine.",
    "explanation": "People often look for food based on boredom, comfort, or mood."
  },
  {
    "id": "human-internal-010",
    "tier": 4,
    "category": "Stranger Signals",
    "prompt": "What does the small nod between strangers mean?",
    "correct": "It usually means “I see you” without starting a conversation.",
    "wrong": ["It means they are now lifelong friends.", "It is a request to borrow something.", "It is a secret contract."],
    "correctRoast": "Correct. Social acknowledgment has been compressed into one movement.",
    "wrongRoast": "Not quite. The nod is smaller than friendship.",
    "explanation": "A nod can politely acknowledge someone while keeping the interaction brief."
  },
  {
    "id": "human-internal-011",
    "tier": 4,
    "category": "Office Supplies",
    "prompt": "Why does a good pen always disappear from the office?",
    "correct": "Someone likely borrowed it and forgot to return it.",
    "wrong": ["The pen followed its dreams.", "Ink seeks freedom after meetings.", "Drawers eat the best supplies first."],
    "correctRoast": "Correct. InSquignito has discovered low-level stationery migration.",
    "wrongRoast": "Not quite. The pen probably left in a human hand.",
    "explanation": "Useful office supplies often disappear because people pick them up and keep them."
  },
  {
    "id": "human-internal-012",
    "tier": 4,
    "category": "Subscriptions",
    "prompt": "Why is cancelling a subscription sometimes harder than signing up?",
    "correct": "Companies often make cancellation less convenient so people are less likely to leave.",
    "wrong": ["The cancel button needs emotional protection.", "Subscriptions cannot be cancelled during daylight.", "Customers must complete a maze for tradition."],
    "correctRoast": "Correct. InSquignito has located the retention hallway.",
    "wrongRoast": "Not quite. The maze is business strategy, not tradition.",
    "explanation": "Some companies create friction in cancellation flows to reduce cancellations."
  },
  {
    "id": "human-internal-013",
    "tier": 4,
    "category": "Hydration",
    "prompt": "Why do people carry a large water bottle all day and barely drink from it?",
    "correct": "They intend to drink more water, but the habit does not always happen.",
    "wrong": ["The bottle is only for decoration.", "Water works better when carried around.", "Thirst is intimidated by large containers."],
    "correctRoast": "Correct. The intention is hydrated. The human is not.",
    "wrongRoast": "Not quite. Carrying water is only step one.",
    "explanation": "People often carry water as a reminder, but reminders do not guarantee action."
  },
  {
    "id": "human-internal-014",
    "tier": 4,
    "category": "Home Projects",
    "prompt": "Why do home projects often stay in the “I bought the supplies” stage?",
    "correct": "Buying supplies feels like progress, but the actual work takes time and energy.",
    "wrong": ["The garage must approve all projects.", "Supplies complete the project by sitting there.", "Projects improve with aging."],
    "correctRoast": "Correct. The project has become a pile with potential.",
    "wrongRoast": "Not quite. The supplies are not self-installing.",
    "explanation": "Preparation can feel productive even when the hard part has not started."
  },
  {
    "id": "human-internal-015",
    "tier": 4,
    "category": "Work Understanding",
    "prompt": "When someone says “sounds good” but does not understand, what are they doing?",
    "correct": "They are trying to move forward and figure it out later.",
    "wrong": ["They fully understand by confidence alone.", "They are casting a knowledge spell.", "They are ending all future confusion."],
    "correctRoast": "Correct. Future panic has accepted the assignment.",
    "wrongRoast": "Not quite. Confidence is not the same as understanding.",
    "explanation": "People sometimes agree in the moment to avoid slowing down the conversation."
  },
  {
    "id": "human-internal-016",
    "tier": 4,
    "category": "Messages",
    "prompt": "Why do people pretend they watched a video someone sent them?",
    "correct": "They want to keep the conversation easy without admitting they skipped it.",
    "wrong": ["The thumbnail counts as full viewing.", "Friendship automatically transfers video knowledge.", "Every video is optional after three seconds."],
    "correctRoast": "Correct. Social smoothness has defeated honesty by 47 seconds.",
    "wrongRoast": "Not quite. The video was not truly watched.",
    "explanation": "People may pretend to have seen something to avoid awkwardness."
  },
  {
    "id": "human-internal-017",
    "tier": 4,
    "category": "Sleep Math",
    "prompt": "Why do humans calculate exactly how much sleep they will get instead of simply going to sleep?",
    "correct": "They are anxious about time and trying to feel in control.",
    "wrong": ["Sleep begins faster with math.", "Pillows require calculations.", "The clock enjoys being negotiated with."],
    "correctRoast": "Correct. Math has entered the blanket zone.",
    "wrongRoast": "Not quite. The math usually delays the sleeping.",
    "explanation": "People often calculate remaining sleep when they are worried about being tired."
  },
  {
    "id": "human-internal-018",
    "tier": 4,
    "category": "Restaurants",
    "prompt": "Why does someone say they are ready to order while still reading the menu?",
    "correct": "They feel pressured and hope they can decide quickly.",
    "wrong": ["The menu has already chosen for them.", "Food decisions become easier when rushed.", "Their eyes ordered ahead."],
    "correctRoast": "Correct. Confidence has arrived before the decision.",
    "wrongRoast": "Not quite. The menu is still winning.",
    "explanation": "Ordering pressure can make people claim they are ready before they fully are."
  },
  {
    "id": "human-internal-019",
    "tier": 4,
    "category": "Elevators",
    "prompt": "Why do humans press the elevator close-door button more than once?",
    "correct": "They feel impatient and want to believe pressing it helps.",
    "wrong": ["The button works better when complimented.", "The elevator respects leadership.", "Doors close faster when they sense anxiety."],
    "correctRoast": "Correct. The human is negotiating with machinery.",
    "wrongRoast": "Not quite. The button may not care about urgency.",
    "explanation": "People often press buttons repeatedly when they feel impatient or powerless."
  },
  {
    "id": "human-internal-020",
    "tier": 4,
    "category": "Sidewalks",
    "prompt": "Why do two people walking toward each other sometimes dodge the same way multiple times?",
    "correct": "They are both trying to avoid each other and accidentally mirror movements.",
    "wrong": ["They are beginning a dance battle.", "The sidewalk requires negotiation.", "Both people forgot directions exist."],
    "correctRoast": "Correct. Mutual politeness has created a tiny dance.",
    "wrongRoast": "Not quite. The dance was accidental.",
    "explanation": "When both people react at the same time, they can unintentionally move the same direction."
  },
  {
    "id": "human-impossible-001",
    "tier": 5,
    "category": "Polite Reactions",
    "prompt": "When a human says “interesting” after hearing a bad idea, what do they really mean?",
    "correct": "They may be politely avoiding saying they dislike or doubt the idea.",
    "wrong": ["They are always deeply impressed.", "The idea is automatically approved.", "They need more facts about chairs."],
    "correctRoast": "Correct. InSquignito has detected polite hesitation.",
    "wrongRoast": "Not quite. “Interesting” can hide many feelings.",
    "explanation": "People often use neutral words to avoid sounding too negative."
  },
  {
    "id": "human-impossible-002",
    "tier": 5,
    "category": "Laundry",
    "prompt": "Why do humans accept that socks disappear in the dryer without demanding answers?",
    "correct": "Because it happens often enough that people joke about it and move on.",
    "wrong": ["Dryers have legal immunity.", "Matching socks are a myth.", "The missing sock usually sends a postcard."],
    "correctRoast": "Correct. The unsolved sock case remains socially accepted.",
    "wrongRoast": "Not quite. The sock mystery is real, but not legally organized.",
    "explanation": "Lost socks are common and usually too minor to investigate seriously."
  },
  {
    "id": "human-impossible-003",
    "tier": 5,
    "category": "Shopping",
    "prompt": "Why do people show their receipt at the door after buying things?",
    "correct": "It confirms that the items were paid for before leaving.",
    "wrong": ["It is a celebration of bulk purchases.", "The receipt needs fresh air.", "The shopping cart demands proof."],
    "correctRoast": "Correct. Purchase proof has been presented.",
    "wrongRoast": "Not quite. The receipt is official, not ceremonial.",
    "explanation": "Some stores check receipts as part of their exit process."
  },
  {
    "id": "human-impossible-004",
    "tier": 5,
    "category": "Phone Anxiety",
    "prompt": "Why does accidentally swiping to the wrong photo on a phone feel so dangerous?",
    "correct": "Because phones can contain private or embarrassing images.",
    "wrong": ["Every photo becomes public after one swipe.", "Thumbs cannot be trusted with technology.", "The phone enjoys creating suspense."],
    "correctRoast": "Correct. The private gallery has entered the danger zone.",
    "wrongRoast": "Not quite. The risk is privacy, not magic.",
    "explanation": "People may feel nervous showing photos because they do not want to reveal something unintended."
  },
  {
    "id": "human-impossible-005",
    "tier": 5,
    "category": "Memory",
    "prompt": "Why does going back to the original room sometimes help humans remember what they forgot?",
    "correct": "The original place can bring back the context of the thought.",
    "wrong": ["Rooms store memory in the walls.", "Stairs erase and restore missions.", "The first room is usually smarter."],
    "correctRoast": "Correct. Context has reloaded the human objective.",
    "wrongRoast": "Not quite. The room is not smart, but it can be a cue.",
    "explanation": "Returning to the original environment can trigger memory by restoring context."
  },
  {
    "id": "human-impossible-006",
    "tier": 5,
    "category": "Meetings",
    "prompt": "Why do humans sometimes schedule meetings about having more meetings?",
    "correct": "They are trying to organize decisions, but the process can become inefficient.",
    "wrong": ["Calendars reproduce naturally.", "Meetings become stronger in groups.", "Emails are allergic to planning."],
    "correctRoast": "Correct. Planning has started planning itself.",
    "wrongRoast": "Not quite. The calendar is not biological, though it spreads.",
    "explanation": "Planning meetings can be useful, but too many layers of meetings can waste time."
  },
  {
    "id": "human-impossible-007",
    "tier": 5,
    "category": "Group Chats",
    "prompt": "Why do group chats talk about making plans without anyone choosing a date?",
    "correct": "Everyone likes the idea, but no one wants to commit or coordinate first.",
    "wrong": ["Plans are complete once mentioned.", "Dates are too powerful for group chats.", "The chat is waiting for a chosen one."],
    "correctRoast": "Correct. The plan exists, but only as mist.",
    "wrongRoast": "Not quite. A plan without a date is still mostly air.",
    "explanation": "Group plans often stall because choosing details requires effort and commitment."
  },
  {
    "id": "human-impossible-008",
    "tier": 5,
    "category": "Late Arrival",
    "prompt": "When someone texts “I’m almost there” but has not left yet, why do they say it?",
    "correct": "They are trying to reduce pressure while they are running late.",
    "wrong": ["They are spiritually already at the location.", "Their house has moved closer.", "Travel begins when the text is sent."],
    "correctRoast": "Correct. The message has arrived before the human.",
    "wrongRoast": "Not quite. The body is still at home.",
    "explanation": "People sometimes exaggerate progress to soften the fact that they are late."
  },
  {
    "id": "human-impossible-009",
    "tier": 5,
    "category": "Files",
    "prompt": "Why do file names end up with things like “final_final_really_final”?",
    "correct": "Because the file kept changing after people thought it was finished.",
    "wrong": ["The file becomes more final with each word.", "Version control has clearly been mastered.", "The underscores are legally binding."],
    "correctRoast": "Correct. Finality has failed several times.",
    "wrongRoast": "Not quite. The filename is trying too hard to convince everyone.",
    "explanation": "Messy filenames often happen when people make repeated revisions without a clean versioning system."
  },
  {
    "id": "human-impossible-010",
    "tier": 5,
    "category": "Fridge Behavior",
    "prompt": "Why do humans check the fridge even when they are not hungry?",
    "correct": "They may be bored, restless, or looking for a small comfort.",
    "wrong": ["They are checking if the fridge light is emotionally stable.", "They expect vegetables to offer advice.", "They are auditing the cheese."],
    "correctRoast": "Correct. Not hunger. More like snack-based curiosity.",
    "wrongRoast": "Not quite. The cheese has no formal audit process.",
    "explanation": "People often browse food for comfort or stimulation, not only hunger."
  },
  {
    "id": "human-impossible-011",
    "tier": 5,
    "category": "Small Talk",
    "prompt": "Why do haircuts always include small talk while the human cannot escape?",
    "correct": "Small talk helps make the appointment feel friendly and less awkward.",
    "wrong": ["The cape requires a conversation fee.", "Hair grows better when questioned.", "Scissors demand weekend updates."],
    "correctRoast": "Correct. The trapped human must now discuss their weekend.",
    "wrongRoast": "Not quite. The cape is powerful, but not legally in charge.",
    "explanation": "Service appointments often include small talk to create comfort and connection."
  },
  {
    "id": "human-impossible-012",
    "tier": 5,
    "category": "Social Exits",
    "prompt": "Why is leaving a party sometimes harder than arriving at one?",
    "correct": "Because saying goodbye can lead to more conversations and social delays.",
    "wrong": ["Doors become harder to use after 9 p.m.", "The snack table has legal authority.", "Coats hide when they sense escape."],
    "correctRoast": "Correct. The exit exists, but the goodbye has phases.",
    "wrongRoast": "Not quite. The coat pile may be difficult, but the social part is worse.",
    "explanation": "Leaving can take time because people feel the need to say goodbye politely."
  },
  {
    "id": "human-impossible-013",
    "tier": 5,
    "category": "Technology",
    "prompt": "Why does a USB plug only seem to fit after being flipped multiple times?",
    "correct": "Because people misjudge the orientation and second-guess themselves.",
    "wrong": ["The plug changes shape when embarrassed.", "The port demands a ritual apology.", "Left and right require a subscription."],
    "correctRoast": "Correct. Confidence has been defeated by a small rectangle.",
    "wrongRoast": "Not quite. The plug is simple, which somehow makes it worse.",
    "explanation": "USB plugs are easy to flip the wrong way, and people often second-guess the correct orientation."
  },
  {
    "id": "human-impossible-014",
    "tier": 5,
    "category": "Shopping Carts",
    "prompt": "Why does a shopping cart with one bad wheel feel personally chosen for you?",
    "correct": "Because it makes every movement annoying, so the problem feels targeted.",
    "wrong": ["The cart selected its human through destiny.", "Bad wheels are a premium feature.", "The produce section assigns difficult carts."],
    "correctRoast": "Correct. The wheel problem has become personal.",
    "wrongRoast": "Not quite. The cart is probably not sentient, only irritating.",
    "explanation": "A bad cart wheel turns a normal task into constant friction."
  },
  {
    "id": "human-impossible-015",
    "tier": 5,
    "category": "Acceptance",
    "prompt": "When humans say “it is what it is,” what are they accepting?",
    "correct": "They are accepting a situation they cannot easily change.",
    "wrong": ["They have solved the problem completely.", "They are naming the disaster correctly.", "The phrase fixes morale automatically."],
    "correctRoast": "Correct. InSquignito has logged acceptance by exhaustion.",
    "wrongRoast": "Not quite. The phrase does not fix the situation.",
    "explanation": "This phrase often means someone is choosing acceptance when they lack control."
  },
  {
    "id": "human-impossible-016",
    "tier": 5,
    "category": "Texting",
    "prompt": "Why do people send “lol” during serious or uncomfortable conversations?",
    "correct": "They may be trying to soften tension or make the message feel less heavy.",
    "wrong": ["They are always laughing at the problem.", "The letters remove all discomfort.", "Serious conversations require one joke by law."],
    "correctRoast": "Correct. Three letters have been used as emotional padding.",
    "wrongRoast": "Not quite. The lol may contain no laughter.",
    "explanation": "People often use casual language to reduce awkwardness or soften a difficult message."
  },
  {
    "id": "human-impossible-017",
    "tier": 5,
    "category": "Deadlines",
    "prompt": "Why do humans wait until the last minute to do something they had weeks to finish?",
    "correct": "Pressure can create urgency when motivation was missing earlier.",
    "wrong": ["Tasks improve by being ignored.", "Deadlines are decorative until midnight.", "Panic is always the healthiest plan."],
    "correctRoast": "Correct. Panic has become the project manager.",
    "wrongRoast": "Not quite. The task did not improve. The pressure did.",
    "explanation": "Procrastination often happens when a deadline feels distant until it becomes urgent."
  },
  {
    "id": "human-impossible-018",
    "tier": 5,
    "category": "Nostalgia",
    "prompt": "Why do people often think the music from their younger years was better?",
    "correct": "Because music from that time is connected to memories and identity.",
    "wrong": ["All new music is automatically worse.", "Speakers became disrespectful after 2010.", "Nostalgia has perfect hearing."],
    "correctRoast": "Correct. Memory has joined the playlist.",
    "wrongRoast": "Not quite. Nostalgia can be powerful, but not objective.",
    "explanation": "People often prefer music tied to important memories and formative years."
  },
  {
    "id": "human-impossible-019",
    "tier": 5,
    "category": "Food Habits",
    "prompt": "Why do humans keep bananas until they become too old to eat normally?",
    "correct": "They plan to use them for baking instead of wasting them.",
    "wrong": ["Bananas naturally retire into bread.", "Fruit requires a second career.", "Brown spots are secret instructions."],
    "correctRoast": "Correct. The banana has moved from snack to ingredient.",
    "wrongRoast": "Not quite. The bread plan is human guilt with a recipe.",
    "explanation": "Overripe bananas are often saved for banana bread or baking."
  },
  {
    "id": "human-impossible-020",
    "tier": 5,
    "category": "Final Human Review",
    "prompt": "Human, after everything InSquignito has observed, how would you explain human life?",
    "correct": "It is people trying to be reasonable while juggling habits, feelings, responsibilities, and small weird routines.",
    "wrong": ["It is a clean sequence of perfect logical choices.", "It is simple once you ignore all emotions.", "It is mostly about owning enough chargers."],
    "correctRoast": "Correct. InSquignito accepts this human summary.",
    "wrongRoast": "Not quite. Human life contains more feelings and fewer working chargers than expected.",
    "explanation": "The final answer should summarize the game’s theme: humans are ordinary, emotional, practical, and strange all at once."
  }
]`);

const QUESTIONS = RAW_QUESTIONS.map(q);

function validateQuestions(questions = QUESTIONS) {
  const ids = new Set();
  const counts = new Map();
  const correctPositions = new Set();
  const errors = [];

  for (const question of questions) {
    if (!question.id || ids.has(question.id)) errors.push(`Duplicate or missing question id: ${question.id}`);
    ids.add(question.id);
    counts.set(question.tier, (counts.get(question.tier) || 0) + 1);
    correctPositions.add(question.correctOptionId);
    if (!question.prompt) errors.push(`${question.id} is missing prompt`);
    if (!question.correctRoast || !question.wrongRoast) errors.push(`${question.id} is missing roasts`);
    if (!Number.isFinite(question.reward) || question.reward <= 0) errors.push(`${question.id} has invalid reward`);
    if (!Array.isArray(question.options) || !question.options.some((option) => option.id === question.correctOptionId)) {
      errors.push(`${question.id} correct option is missing`);
    }
    const optionCount = question.options?.length || 0;
    if (question.tier === 1 && optionCount !== 2) errors.push(`${question.id} tier 1 must have 2 options`);
    if (question.tier === 2 && optionCount !== 3) errors.push(`${question.id} tier 2 must have 3 options`);
    if (question.tier === 3 && optionCount !== 3) errors.push(`${question.id} tier 3 must have 3 options`);
    if (question.tier >= 4 && optionCount !== 4) errors.push(`${question.id} tier ${question.tier} must have 4 options`);
  }

  for (let tier = 1; tier <= 5; tier += 1) {
    if ((counts.get(tier) || 0) !== 20) errors.push(`Tier ${tier} must have exactly 20 questions`);
  }

  if (questions.length !== 100) errors.push(`Expected 100 questions, found ${questions.length}`);
  if (correctPositions.size < 2) errors.push("Correct options must not all use the same option id");

  if (errors.length) {
    const error = new Error(`Interview question validation failed:\n${errors.join("\n")}`);
    error.validationErrors = errors;
    throw error;
  }
  return true;
}

module.exports = {
  QUESTIONS,
  validateQuestions
};
