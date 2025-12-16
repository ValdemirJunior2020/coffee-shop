export type CartItem = {
  productId: string;
  title: string;
  image: string;
  basePrice: number; // Temu/base
  qty: number;
};

const CART_KEY = "coffee_shop_cart_v1";

export function getCart(): CartItem[] {
  const raw = localStorage.getItem(CART_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  // notify current tab listeners too
  window.dispatchEvent(new Event("cart:changed"));
}

export function cartCount(): number {
  return getCart().reduce((sum, i) => sum + i.qty, 0);
}

export function addToCart(item: Omit<CartItem, "qty">, qty = 1) {
  const cart = getCart();
  const found = cart.find((c) => c.productId === item.productId);
  if (found) found.qty += qty;
  else cart.push({ ...item, qty });
  saveCart(cart);
}

export function removeFromCart(productId: string) {
  const cart = getCart().filter((c) => c.productId !== productId);
  saveCart(cart);
}

export function setQty(productId: string, qty: number) {
  const cart = getCart();
  const it = cart.find((c) => c.productId === productId);
  if (!it) return;
  it.qty = Math.max(1, Math.floor(qty));
  saveCart(cart);
}

export function clearCart() {
  saveCart([]);
}
