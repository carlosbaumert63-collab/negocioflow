"use client";
import React, { useEffect, useState } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { fmtCLP, PAYMENT_METHODS, type Business, type Product, type Sale, type SaleItem } from "../lib/types";

export default function Ventas({ business }: { business: Business }) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const load = async () => {
    const [salesRes, productsRes] = await Promise.all([
      supabase
        .from("sales")
        .select("*, sale_items(*)")
        .eq("business_id", business.id)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase.from("products").select("*").eq("business_id", business.id).order("name"),
    ]);
    setSales((salesRes.data as Sale[]) || []);
    setProducts((productsRes.data as Product[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business.id]);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold">Ventas</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-brand-500 text-white text-sm font-semibold px-4 py-2 rounded-lg"
        >
          <Plus size={16} /> Nueva venta
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-muted py-8 text-center">Cargando…</div>
      ) : sales.length === 0 ? (
        <div className="text-sm text-muted py-8 text-center">Aún no tienes ventas registradas.</div>
      ) : (
        <div className="bg-white border border-line rounded-xl overflow-hidden">
          {sales.map((s) => (
            <div key={s.id} className="px-4 py-3 border-b border-line last:border-0">
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-medium">{fmtCLP(s.total)}</span>
                  <span className="text-muted"> · {new Date(s.sale_date).toLocaleDateString("es-CL")}</span>
                  <span className="text-muted capitalize"> · {s.payment_method}</span>
                </div>
                <div className="text-xs text-brand-600 font-medium">+{fmtCLP(s.profit)} ganancia</div>
              </div>
              <div className="text-xs text-muted mt-1 truncate">
                {(s.sale_items || []).map((i) => `${i.quantity}× ${i.product_name}`).join(", ")}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <NuevaVentaModal
          business={business}
          products={products}
          onClose={() => setShowModal(false)}
          onSaved={() => {
            setShowModal(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function NuevaVentaModal({
  business,
  products,
  onClose,
  onSaved,
}: {
  business: Business;
  products: Product[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [items, setItems] = useState<SaleItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || "");
  const [quantity, setQuantity] = useState("1");
  const [discount, setDiscount] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const addItem = () => {
    const product = products.find((p) => p.id === selectedProductId);
    const qty = Number(quantity);
    if (!product) return setError("Selecciona un producto.");
    if (!Number.isFinite(qty) || qty <= 0) return setError("Cantidad inválida.");
    setError("");
    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === product.id);
      if (existing) {
        return prev.map((i) => (i.product_id === product.id ? { ...i, quantity: i.quantity + qty } : i));
      }
      return [
        ...prev,
        { product_id: product.id, product_name: product.name, quantity: qty, unit_price: product.sale_price, unit_cost: product.cost },
      ];
    });
    setQuantity("1");
  };

  const removeItem = (productId: string | null) => {
    setItems((prev) => prev.filter((i) => i.product_id !== productId));
  };

  const subtotal = items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
  const discountNum = Number(discount) || 0;
  const total = Math.max(0, subtotal - discountNum);
  const costTotal = items.reduce((s, i) => s + i.unit_cost * i.quantity, 0);
  const profit = total - costTotal;

  const finalize = async () => {
    setError("");
    if (items.length === 0) return setError("Agrega al menos un producto.");
    setSaving(true);

    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .insert({
        business_id: business.id,
        sale_date: new Date().toISOString().slice(0, 10),
        payment_method: paymentMethod,
        subtotal,
        discount: discountNum,
        total,
        cost_total: costTotal,
        profit,
      })
      .select()
      .single();

    if (saleError || !sale) {
      setSaving(false);
      return setError("No se pudo guardar la venta: " + (saleError?.message || ""));
    }

    const { error: itemsError } = await supabase.from("sale_items").insert(
      items.map((i) => ({
        sale_id: sale.id,
        product_id: i.product_id,
        product_name: i.product_name,
        quantity: i.quantity,
        unit_price: i.unit_price,
        unit_cost: i.unit_cost,
      }))
    );

    if (itemsError) {
      setSaving(false);
      return setError("Venta creada pero hubo un error al guardar los productos: " + itemsError.message);
    }

    for (const i of items) {
      if (!i.product_id) continue;
      const product = products.find((p) => p.id === i.product_id);
      if (!product) continue;
      await supabase
        .from("products")
        .update({ stock: product.stock - i.quantity })
        .eq("id", i.product_id);
    }

    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="font-bold text-lg">Nueva venta</div>
          <button onClick={onClose} className="text-muted">
            <X size={20} />
          </button>
        </div>

        {products.length === 0 ? (
          <div className="text-sm text-muted py-6 text-center">
            Primero agrega productos en la sección "Productos" para poder venderlos.
          </div>
        ) : (
          <>
            <div className="flex gap-2 mb-3">
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="flex-1 px-3 py-2 border border-line rounded-lg text-sm"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {fmtCLP(p.sale_price)}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-20 px-3 py-2 border border-line rounded-lg text-sm"
              />
              <button onClick={addItem} className="bg-brand-500 text-white px-3 rounded-lg">
                <Plus size={18} />
              </button>
            </div>

            {items.length > 0 && (
              <div className="border border-line rounded-lg divide-y divide-line mb-4">
                {items.map((i) => (
                  <div key={i.product_id} className="flex items-center justify-between px-3 py-2 text-sm">
                    <span>
                      {i.quantity} × {i.product_name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{fmtCLP(i.unit_price * i.quantity)}</span>
                      <button onClick={() => removeItem(i.product_id)} className="text-muted hover:text-red-600">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs text-muted">Descuento</label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-line rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted">Método de pago</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-line rounded-lg text-sm"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-surface rounded-lg p-3 text-sm space-y-1 mb-4">
              <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{fmtCLP(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted">Descuento</span><span>-{fmtCLP(discountNum)}</span></div>
              <div className="flex justify-between font-bold text-base"><span>Total</span><span>{fmtCLP(total)}</span></div>
            </div>

            {error && <div className="text-sm text-red-600 mb-3">{error}</div>}

            <button
              onClick={finalize}
              disabled={saving}
              className="w-full bg-brand-500 text-white font-semibold py-3 rounded-lg disabled:opacity-60"
            >
              {saving ? "Guardando…" : `Registrar venta — ${fmtCLP(total)}`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
