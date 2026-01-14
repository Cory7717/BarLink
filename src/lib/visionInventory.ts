type Detection = {
  nameGuess: string;
  remainingBucket: "FULL" | "THREE_QUARTER" | "HALF" | "QUARTER" | "LOW";
  confidence: number;
  sizeMlGuess?: number;
};

export async function analyzeInventoryPhoto(imageUrl: string): Promise<{ items: Detection[] }> {
  void imageUrl; // placeholder until vision API is wired
  // Stubbed response; replace with vision API call later
  return {
    items: [
      { nameGuess: "Vodka 750ml", remainingBucket: "HALF", confidence: 0.0, sizeMlGuess: 750 },
      { nameGuess: "Whiskey 1L", remainingBucket: "THREE_QUARTER", confidence: 0.0, sizeMlGuess: 1000 },
    ],
  };
}
