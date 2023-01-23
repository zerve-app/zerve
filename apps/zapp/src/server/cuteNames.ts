// name generator - ADORABLE NAMES ONLY

const CHARACTER_ADJ = [
  'heroic',
  'happy',
  'generous',
  'cautious',
  'friendly',
  'courageous',
  'brave',
  'creative',
  'curious',
  'determined',
  'energetic',
  'excited',
  'spunky',
  'funny',
  'kind',
  'loving',
  'loyal',
  'optimistic',
  'playful',
  'proud',
  'smart',
  'strong',
  'thoughtful',
  'witty',
]
const SIZE_ADJ = [
  'tiny',
  'pocket',
  'small',
  'little',
  'medium',
  'big',
  'colossal',
  'giant',
  'cute',
  'adorable',
]
const ADVERB = [
  'running',
  'swimming',
  'growing',
  'falling',
  'jumping',
  'singing',
  'dancing',
  'sleeping',
  'crawling',
  'sitting',
  'standing',
  'walking',
  'flying',
  'hopping',
  'sneaking',
  'sprinting',
  'screaming',
  'shouting',
  'performing',
  'playing',
  'hunting',
  'hiding',
  'practicing',
]
const NOUN = [
  'monkey',
  'seahorse',
  'puppy',
  'kitten',
  'panda',
  'poodle',
  'labrador',
  'pug',
  'pomeranian',
  'bear',
  'mouse',
  'rabbit',
  'squirrel',
  'chipmunk',
  'hamster',
  'lizard',
]

function getRandomItem(list: string[]) {
  return list[Math.floor(Math.random() * list.length)]
}

export function getAdorableName(): string {
  return `${getRandomItem(CHARACTER_ADJ)}-${getRandomItem(SIZE_ADJ)}-${getRandomItem(
    ADVERB
  )}-${getRandomItem(NOUN)}`
}
