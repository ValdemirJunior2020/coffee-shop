// src/lib/cartStore.ts
import type { CartItem, Product } from "./types";

const CART_KEY = "coffee_shop_cart_v1";

function read(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

function write(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function getCart(): CartItem[] {
  return read();
}

export function clearCart() {
  write([]);
}

export function cartCount(): number {
  return read().reduce((s, i) => s + (Number(i.qty) || 0), 0);
}

export function addToCart(product: Product, qty = 1) {
  const q = Math.max(1, Number(qty) || 1);
  const items = read();
  const idx = items.findIndex((x) => x.id === product.id);

  if (idx >= 0) {
    items[idx] = { ...items[idx], qty: items[idx].qty + q };
  } else {
    items.push({ ...product, qty: q });
  }
  write(items);
}

export function setQty(productId: string, qty: number) {
  const q = Math.max(1, Number(qty) || 1);
  const items = read().map((x) => (x.id === productId ? { ...x, qty: q } : x));
  write(items);
}

export function removeFromCart(productId: string) {
  const items = read().filter((x) => x.id !== productId);
  write(items);
}
