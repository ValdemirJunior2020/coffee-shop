export type LocalProduct = {
  id: string;
  name: string;
  description: string;
  price: number;      // your SELL price
  image: string;      // public path like "/first.png"
  category?: string;
};

export const DEFAULT_PRODUCTS: LocalProduct[] = [
  {
    id: "p1",
    name: "Brazilian Dark Roast",
    description: "Bold, chocolate notes, strong finish.",
    price: 19.99,
    image: "/first.png",
    category: "Coffee",
  },
  {
    id: "p2",
    name: "Colombian Medium Roast",
    description: "Smooth, balanced, everyday coffee.",
    price: 17.99,
    image: "/second.png",
    category: "Coffee",
  },
  {
    id: "p3",
    name: "Espresso Blend",
    description: "Rich crema, perfect espresso shot.",
    price: 21.99,
    image: "/third.png",
    category: "Coffee",
  },
];
