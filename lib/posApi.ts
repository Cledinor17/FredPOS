import { ApiError, apiFetch } from "./api";

export type PosCartItem = {
  productId: string;
  name: string;
  sku: string;
  price: number;
  qty: number;
  type: "product" | "service";
  stock: number;
  taxRate: number;
  imagePath: string | null;
};

export type PosParkedCart = {
  id: string;
  note: string;
  createdAt: string;
  items: PosCartItem[];
};

export type PosPaymentMethodConfig = {
  id: string;
  label: string;
  active: boolean;
};

export type PosCheckoutLine = {
  productId: string;
  qty: number;
  unitPrice: number;
  taxRate: number;
  type: "product" | "service";
  name?: string;
  sku?: string;
};

export type PosCheckoutInput = {
  cashierId?: string | number;
  customerId?: string | number | null;
  note?: string;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  cashReceived?: number;
  changeAmount?: number;
  items: PosCheckoutLine[];
};

export type PosCheckoutResult = {
  saleId: string;
  receiptNo: string;
  createdAt: string;
};

type Dict = Record<string, unknown>;

function isObject(value: unknown): value is Dict {
  return typeof value === "object" && value !== null;
}

function toString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return fallback;
}

function toBool(value: unknown, fallback = true): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1" || normalized === "active") return true;
    if (normalized === "false" || normalized === "0" || normalized === "inactive") return false;
  }
  return fallback;
}

function isEndpointMissing(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 404 || error.status === 405 || error.status === 501);
}

function basePath(business: string): string {
  return `/api/app/${encodeURIComponent(business)}`;
}

function getCollection(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (!isObject(raw)) return [];

  const data = raw.data;
  if (Array.isArray(data)) return data;
  if (isObject(data)) {
    const maybeArrays = ["items", "sales", "parked_carts", "parkedCarts", "payment_methods", "methods"];
    for (const key of maybeArrays) {
      if (Array.isArray(data[key])) return data[key] as unknown[];
    }
  }

  const directArrays = ["items", "sales", "parked_carts", "parkedCarts", "payment_methods", "methods"];
  for (const key of directArrays) {
    if (Array.isArray(raw[key])) return raw[key] as unknown[];
  }

  return [];
}

function getResource(raw: unknown, nestedKeys: string[] = []): unknown {
  if (isObject(raw) && isObject(raw.data)) {
    const data = raw.data;
    for (const key of nestedKeys) {
      if (isObject(data[key])) return data[key];
    }
    return data;
  }

  if (isObject(raw)) {
    for (const key of nestedKeys) {
      if (isObject(raw[key])) return raw[key];
    }
  }

  return raw;
}

async function tryApiFetch<T>(
  paths: string[],
  options?: RequestInit & { json?: unknown }
): Promise<T | null> {
  for (const path of paths) {
    try {
      return await apiFetch<T>(path, options);
    } catch (error) {
      if (isEndpointMissing(error)) continue;
      throw error;
    }
  }
  return null;
}

function normalizePaymentMethod(raw: unknown): PosPaymentMethodConfig {
  const obj = isObject(raw) ? raw : {};
  const id = toString(obj.id ?? obj.code ?? obj.method ?? obj.slug, "");
  const label = toString(obj.label ?? obj.name ?? obj.title, id);
  const active = toBool(obj.active ?? obj.is_active ?? obj.enabled, true);

  return { id, label, active };
}

function normalizeParkedItem(raw: unknown): PosCartItem {
  const obj = isObject(raw) ? raw : {};
  return {
    productId: toString(obj.product_id ?? obj.productId ?? obj.id, ""),
    name: toString(obj.name, "Produit"),
    sku: toString(obj.sku, ""),
    price: toNumber(obj.price ?? obj.unit_price ?? obj.selling_price, 0),
    qty: toNumber(obj.qty ?? obj.quantity, 1),
    type: toString(obj.type, "product") === "service" ? "service" : "product",
    stock: toNumber(obj.stock ?? obj.stock_quantity, 0),
    taxRate: toNumber(obj.tax_rate ?? obj.taxRate, 0),
    imagePath: toString(obj.image_path ?? obj.imagePath, "") || null,
  };
}

function normalizeParkedCart(raw: unknown): PosParkedCart {
  const obj = isObject(raw) ? raw : {};
  const itemsRaw = Array.isArray(obj.items) ? obj.items : Array.isArray(obj.lines) ? obj.lines : [];
  return {
    id: toString(obj.id ?? obj.uuid ?? obj.reference, `P-${Date.now()}`),
    note: toString(obj.note ?? obj.label ?? obj.title, "Panier en attente"),
    createdAt: toString(obj.created_at ?? obj.createdAt, new Date().toISOString()),
    items: itemsRaw.map(normalizeParkedItem),
  };
}

function normalizeCheckoutResult(raw: unknown): PosCheckoutResult {
  const resource = getResource(raw, ["sale", "order"]);
  const obj = isObject(resource) ? resource : {};
  const saleId = toString(obj.id ?? obj.sale_id ?? obj.order_id, `S-${Date.now()}`);
  const receiptNo = toString(
    obj.receipt_no ?? obj.receiptNo ?? obj.invoice_no ?? obj.reference_no,
    `TKT-${Date.now()}`
  );
  const createdAt = toString(obj.created_at ?? obj.createdAt, new Date().toISOString());
  return { saleId, receiptNo, createdAt };
}

function paymentMethodPaths(business: string): string[] {
  const base = basePath(business);
  return [`${base}/pos/payment-methods`, `${base}/payment-methods`, `${base}/settings/payment-methods`];
}

function parkedCartPaths(business: string): string[] {
  const base = basePath(business);
  return [`${base}/parked-carts`, `${base}/pos/parked-carts`, `${base}/sales/parked-carts`];
}

function salePaths(business: string): string[] {
  const base = basePath(business);
  return [`${base}/sales`, `${base}/pos/sales`, `${base}/checkout`];
}

export async function getPosPaymentMethods(
  business: string
): Promise<PosPaymentMethodConfig[] | null> {
  const raw = await tryApiFetch<unknown>(paymentMethodPaths(business));
  if (raw === null) return null;

  const list = getCollection(raw).map(normalizePaymentMethod).filter((item) => item.id.length > 0);
  return list;
}

export async function listPosParkedCarts(business: string): Promise<PosParkedCart[] | null> {
  const raw = await tryApiFetch<unknown>(parkedCartPaths(business));
  if (raw === null) return null;

  return getCollection(raw).map(normalizeParkedCart);
}

export async function createPosParkedCart(
  business: string,
  input: Pick<PosParkedCart, "note" | "items">
): Promise<PosParkedCart | null> {
  const payload = {
    note: input.note,
    items: input.items.map((item) => ({
      product_id: item.productId,
      productId: item.productId,
      name: item.name,
      sku: item.sku,
      qty: item.qty,
      quantity: item.qty,
      unit_price: item.price,
      price: item.price,
      tax_rate: item.taxRate,
      type: item.type,
      stock_quantity: item.stock,
      image_path: item.imagePath,
    })),
  };

  const raw = await tryApiFetch<unknown>(parkedCartPaths(business), { method: "POST", json: payload });
  if (raw === null) return null;
  return normalizeParkedCart(getResource(raw, ["parked_cart", "parkedCart"]));
}

export async function deletePosParkedCart(business: string, parkedId: string): Promise<boolean> {
  const encoded = encodeURIComponent(parkedId);
  const paths = parkedCartPaths(business).map((path) => `${path}/${encoded}`);

  const result = await tryApiFetch<unknown>(paths, { method: "DELETE" });
  return result !== null;
}

export async function checkoutPosSale(
  business: string,
  input: PosCheckoutInput
): Promise<PosCheckoutResult | null> {
  const payload = {
    cashier_id: input.cashierId ?? null,
    customer_id: input.customerId ?? null,
    note: input.note ?? null,
    subtotal: input.subtotal,
    tax: input.tax,
    tax_total: input.tax,
    total: input.total,
    grand_total: input.total,
    payment_method: input.paymentMethod,
    cash_received: input.cashReceived ?? null,
    change_amount: input.changeAmount ?? null,
    payment: {
      method: input.paymentMethod,
      amount: input.total,
      cash_received: input.cashReceived ?? null,
      change_amount: input.changeAmount ?? null,
    },
    items: input.items.map((item) => ({
      product_id: item.productId,
      productId: item.productId,
      qty: item.qty,
      quantity: item.qty,
      unit_price: item.unitPrice,
      selling_price: item.unitPrice,
      price: item.unitPrice,
      tax_rate: item.taxRate,
      line_total: item.unitPrice * item.qty,
      total: item.unitPrice * item.qty,
      type: item.type,
      name: item.name,
      sku: item.sku,
    })),
  };

  const raw = await tryApiFetch<unknown>(salePaths(business), { method: "POST", json: payload });
  if (raw === null) return null;
  return normalizeCheckoutResult(raw);
}
