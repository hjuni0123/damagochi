"use client";

import { useEffect, useState } from "react";

type Item = { id: string; name: string; category: string; price: number; emoji: string; color: string; rarity: string };

const CATEGORIES = [
  { value: "OUTFIT", label: "의상" },
  { value: "HAT", label: "모자" },
  { value: "FACE", label: "얼굴" },
  { value: "ACCESSORY", label: "소품" },
  { value: "BACKGROUND", label: "배경" },
  { value: "EMOTION", label: "이모션" },
];

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [form, setForm] = useState({ name: "", category: "OUTFIT", price: 100, emoji: "✨", color: "#FFD166", rarity: "COMMON" });

  async function load() {
    const res = await fetch("/api/admin/items");
    const data = await res.json();
    setItems(data.items ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", category: "OUTFIT", price: 100, emoji: "✨", color: "#FFD166", rarity: "COMMON" });
    load();
  }

  async function updatePrice(id: string, price: number) {
    await fetch(`/api/admin/items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price }),
    });
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/admin/items/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">상점 아이템 관리</h1>

      <form onSubmit={create} className="rounded-2xl bg-white p-4 shadow space-y-3">
        <h2 className="font-bold">새 아이템 추가</h2>
        <div className="grid sm:grid-cols-3 gap-2">
          <input className="rounded-lg border px-3 py-2" placeholder="이름" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select className="rounded-lg border px-3 py-2" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <input type="number" className="rounded-lg border px-3 py-2" placeholder="가격" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
          <input className="rounded-lg border px-3 py-2" placeholder="이모지" value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} />
          <input type="color" className="rounded-lg border h-10" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
          <select className="rounded-lg border px-3 py-2" value={form.rarity} onChange={(e) => setForm({ ...form, rarity: e.target.value })}>
            <option value="COMMON">일반</option>
            <option value="RARE">희귀</option>
            <option value="EPIC">에픽</option>
          </select>
        </div>
        <button className="rounded-xl bg-ssyu-brown text-white font-bold px-4 py-2">추가</button>
      </form>

      <div className="grid sm:grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl bg-white shadow p-4 flex items-center gap-3">
            <span className="text-2xl">{item.emoji}</span>
            <div className="flex-1">
              <div className="font-bold">{item.name}</div>
              <div className="text-xs text-black/50">{CATEGORIES.find((c) => c.value === item.category)?.label} · {item.rarity}</div>
            </div>
            <input
              type="number"
              defaultValue={item.price}
              className="w-20 rounded border px-2 py-1 text-sm"
              onBlur={(e) => updatePrice(item.id, Number(e.target.value))}
            />
            <button onClick={() => remove(item.id)} className="text-xs font-bold px-3 py-1.5 rounded-full bg-red-50 text-red-500">
              삭제
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
