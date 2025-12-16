// src/lib/types.ts
export type Product = {
  id: string;
  name: string;
  description: string;
  image?: string;
  category: string;
  basePrice: number; // COST
};

export type CartItem = Product & {
  qty: number;
};
