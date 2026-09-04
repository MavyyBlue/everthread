export interface SeededRng {
  next(): number;
  int(min: number, max: number): number;
  chance(probability: number): boolean;
  pick<T>(items: readonly T[]): T;
  weighted<T>(items: readonly { item: T; weight: number }[]): T;
  shuffle<T>(items: readonly T[]): T[];
  counter(): number;
}

function xmur3(str: string) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

function mulberry32(a: number) {
  return () => {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createRng(seed: string, initialCounter = 0): SeededRng {
  const seedFn = xmur3(seed);
  const random = mulberry32(seedFn());
  let count = 0;
  for (let i = 0; i < initialCounter; i++) {
    random();
    count++;
  }

  return {
    next() {
      count++;
      return random();
    },
    int(min, max) {
      if (max < min) [min, max] = [max, min];
      return Math.floor(this.next() * (max - min + 1)) + min;
    },
    chance(probability) {
      return this.next() < Math.max(0, Math.min(1, probability));
    },
    pick(items) {
      if (!items.length) throw new Error('Cannot pick from an empty collection');
      return items[this.int(0, items.length - 1)]!;
    },
    weighted(items) {
      if (!items.length) throw new Error('Cannot pick from an empty weighted collection');
      const total = items.reduce((sum, entry) => sum + Math.max(0, entry.weight), 0);
      if (total <= 0) return items[0]!.item;
      let roll = this.next() * total;
      for (const entry of items) {
        roll -= Math.max(0, entry.weight);
        if (roll <= 0) return entry.item;
      }
      return items[items.length - 1]!.item;
    },
    shuffle(items) {
      const copy = [...items];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = this.int(0, i);
        [copy[i], copy[j]] = [copy[j]!, copy[i]!];
      }
      return copy;
    },
    counter() {
      return count;
    },
  };
}

export function randomSeed(): string {
  const cryptoPart = globalThis.crypto?.getRandomValues
    ? Array.from(globalThis.crypto.getRandomValues(new Uint32Array(4))).join('-')
    : `${Date.now()}-${Math.random()}`;
  return `everthread-${cryptoPart}`;
}
