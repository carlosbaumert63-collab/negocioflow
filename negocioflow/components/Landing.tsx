"use client";
import React from "react";
import { BarChart3, Package, Receipt, TrendingUp, CheckCircle2 } from "lucide-react";

const FEATURES = [
  {
    icon: Receipt,
    title: "Registro rápido de ventas",
    body: "Agrega varios productos a una venta en segundos, con el botón + Nueva venta siempre a mano.",
  },
  {
    icon: Package,
    title: "Inventario en tiempo real",
    body: "El stock se descuenta solo con cada venta. Alertas cuando un producto está por agotarse.",
  },
  {
    icon: TrendingUp,
    title: "Ganancia real, no solo ventas",
    body: "Separamos ventas, costo de productos y gastos para mostrarte lo que de verdad te queda.",
  },
  {
    icon: BarChart3,
    title: "Reportes que se entienden",
    body: "Qué productos son más rentables, cómo evolucionan tus gastos, y cómo va tu mes vs. el anterior.",
  },
];

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "",
    features: ["50 ventas al mes", "20 productos", "Dashboard básico", "Inventario básico", "Reportes básicos"],
  },
  {
    name: "Pro",
    price: "$6.990",
    period: "/mes",
    highlight: true,
    features: [
      "Ventas ilimitadas",
      "Productos ilimitados",
      "Inventario completo",
      "Reportes avanzados",
      "Flujo de caja",
      "Clientes y proveedores",
      "Exportación de datos",
    ],
  },
];

export default function Landing({
  onGetStarted,
  onLogin,
}: {
  onGetStarted: () => void;
  onLogin: () => void;
}) {
  return (
    <div className="min-h-screen bg-white text-ink">
      {/* nav */}
      <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-5">
        <div className="font-bold text-lg">NegocioFlow</div>
        <button onClick={onLogin} className="text-sm text-muted border border-line rounded-full px-4 py-1.5">
          Iniciar sesión
        </button>
      </div>

      {/* hero */}
      <div className="max-w-3xl mx-auto text-center px-6 pt-10 pb-6">
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
          Entiende cuánto <span className="text-brand-500">realmente</span> gana tu negocio.
        </h1>
        <p className="text-muted text-lg mt-5 max-w-xl mx-auto">
          Registra tus ventas, controla tus gastos y descubre dónde está realmente tu dinero.
        </p>
        <button
          onClick={onGetStarted}
          className="mt-8 bg-brand-500 hover:bg-brand-600 transition text-white font-semibold px-7 py-3 rounded-xl text-base"
        >
          Comenzar gratis
        </button>
        <div className="text-xs text-muted mt-3">Sin tarjeta de crédito. Empieza en 2 minutos.</div>
      </div>

      {/* dashboard preview mockup */}
      <div className="max-w-3xl mx-auto px-6 mt-8">
        <div className="bg-surface border border-line rounded-2xl p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Ventas del mes", value: "$2.450.000", color: "text-ink" },
            { label: "Costos", value: "$1.200.000", color: "text-muted" },
            { label: "Gastos", value: "$350.000", color: "text-muted" },
            { label: "Ganancia neta", value: "$900.000", color: "text-brand-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-line rounded-xl p-4">
              <div className="text-xs text-muted">{s.label}</div>
              <div className={`text-lg font-bold mt-1 ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* features */}
      <div className="max-w-5xl mx-auto px-6 py-16 grid sm:grid-cols-2 gap-5">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="border border-line rounded-2xl p-6">
              <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
                <Icon size={20} className="text-brand-600" />
              </div>
              <div className="font-semibold mt-4">{f.title}</div>
              <div className="text-sm text-muted mt-2 leading-relaxed">{f.body}</div>
            </div>
          );
        })}
      </div>

      {/* pricing */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-center mb-8">Planes</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={`rounded-2xl p-7 border ${
                p.highlight ? "border-brand-500 bg-brand-50" : "border-line bg-white"
              }`}
            >
              <div className="font-semibold text-lg">{p.name}</div>
              <div className="mt-2">
                <span className="text-3xl font-bold">{p.price}</span>
                <span className="text-muted text-sm"> CLP{p.period}</span>
              </div>
              <ul className="mt-5 space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted">
                    <CheckCircle2 size={16} className="text-brand-500 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={onGetStarted}
                className={`mt-6 w-full py-2.5 rounded-lg font-semibold text-sm ${
                  p.highlight ? "bg-brand-500 text-white" : "border border-line text-ink"
                }`}
              >
                Comenzar gratis
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center text-xs text-muted py-8 border-t border-line">
        NegocioFlow — Hecho para pequeños negocios en Chile.
      </div>
    </div>
  );
}
