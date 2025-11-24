export interface CardDimensions {
  width: number;  // mm
  height: number; // mm
  thickness: number; // mm
}

export interface Card {
  name: string;
  count: number;
  castingCost?: string;
}

export interface Set {
  id: string;
  name: string;
}

export interface Theme {
  id: string;
  name: string;
  setId: string;
  imageUrl: string;
  cardList: Card[];
  nr: string;
  colors: string;
  variant?: string;
}

export interface SleeveConfig {
  theme: Theme;
  dimensions: CardDimensions;
}

export const CARD_PRESETS: Record<string, CardDimensions> = {
  unsleeved: {
    width: 57,
    height: 88,
    thickness: 0.3,
  },
  sleeved: {
    width: 57,
    height: 91.3,
    thickness: 0.6,
  },
};
