import { DEFAULT_PRODUCTS, type LocalProduct } from "../data/products";

const KEY = "coffee_shop_products_v1";

function safeParse(json: string | null): LocalProduct[] | null {
  if (!json) return null;
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return null;
    return parsed as LocalProduct[];
  } catch {
    return null;
  }
}

export function getProducts(): LocalProduct[] {
  const stored = safeParse(localStorage.getItem(KEY));
  return stored && stored.length ? stored : DEFAULT_PRODUCTS;
}

export function saveProducts(products: LocalProduct[]) {
  localStorage.setItem(KEY, JSON.stringify(products));
}

export function resetProductsToDefault() {
  localStorage.removeItem(KEY);
}

export function addProduct(p: Omit<LocalProduct, "id">): LocalProduct {
  const products = getProducts();
  const created: LocalProduct = { ...p, id: `p_${Date.now()}` };
  const next = [created, ...products];
  saveProducts(next);
  return created;
}

export function updateProduct(id: string, patch: Partial<Omit<LocalProduct, "id">>) {
  const products = getProducts();
  const next = products.map((p) => (p.id === id ? { ...p, ...patch } : p));
  saveProducts(next);
}

export function deleteProduct(id: string) {
  const products = getProducts();
  const next = products.filter((p) => p.id !== id);
  saveProducts(next);
}
