const exactEvents: Record<string, string> = {
  "Game created. Roll to begin.": "המשחק נוצר. זרקו את הקובייה כדי להתחיל.",
  "Game reset.": "המשחק אופס."
};

export function translateGameEvent(event: string): string {
  if (exactEvents[event]) return exactEvents[event];

  const rules: Array<[RegExp, (...parts: string[]) => string]> = [
    [/^(.+) rolled (\d+) and moved to (\d+)\.$/, (name, roll, position) => `${name} זרק/ה ${roll} והתקדם/ה למשבצת ${position}.`],
    [/^(.+) rolled (\d+), moved to (\d+), and received 200 for Start\.$/, (name, roll, position) => `${name} זרק/ה ${roll}, הגיע/ה למשבצת ${position} וקיבל/ה 200 על מעבר בנקודת היציאה.`],
    [/^(.+) landed on unowned (.+)\.$/, (name, place) => `${name} נחת/ה על ${place}, שעדיין אינו בבעלות איש.`],
    [/^(.+) landed on their own (.+)\.$/, (name, place) => `${name} נחת/ה על הנכס שבבעלותו/ה: ${place}.`],
    [/^(.+) landed on (.+)\.$/, (name, place) => `${name} נחת/ה על ${place}.`],
    [/^(.+) received (\d+) from (.+)\.$/, (name, amount, source) => `${name} קיבל/ה ${amount} מ-${source}.`],
    [/^(.+) paid (\d+) for (.+)\.$/, (name, amount, reason) => `${name} שילם/ה ${amount} עבור ${reason}.`],
    [/^(.+) bought (.+) for (\d+)\.$/, (name, place, price) => `${name} רכש/ה את ${place} במחיר ${price}.`],
    [/^(.+) paid (\d+) rent to (.+) for (.+)\.$/, (name, rent, owner, place) => `${name} שילם/ה ${rent} דמי שכירות ל-${owner} עבור ${place}.`],
    [/^It is now (.+)'s turn\.$/, (name) => `כעת תורו/ה של ${name}.`],
    [/^(.+) wins the game\.$/, (name) => `${name} ניצח/ה במשחק.`],
    [/^Surprise: (.+) received (\d+)\.$/, (name, amount) => `הפתעה: ${name} קיבל/ה ${amount}.`],
    [/^Surprise: (.+) paid (\d+)\.$/, (name, amount) => `הפתעה: ${name} שילם/ה ${amount}.`],
    [/^Surprise: (.+) received (\d+) from every player\.$/, (name, amount) => `הפתעה: ${name} קיבל/ה ${amount} מכל שחקן.`],
    [/^Surprise: (.+) paid (\d+) to every player\.$/, (name, amount) => `הפתעה: ${name} שילם/ה ${amount} לכל שחקן.`],
    [/^Surprise: (.+) moved forward (\d+)\.$/, (name, steps) => `הפתעה: ${name} התקדם/ה ${steps} משבצות.`],
    [/^Surprise: (.+) moved backward (\d+)\.$/, (name, steps) => `הפתעה: ${name} חזר/ה ${steps} משבצות.`]
  ];

  for (const [pattern, translate] of rules) {
    const match = event.match(pattern);
    if (match) return translate(...match.slice(1));
  }
  return event;
}
