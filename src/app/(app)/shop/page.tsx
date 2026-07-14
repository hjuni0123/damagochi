"use client";

import { useEffect, useMemo, useState } from "react";
import SsyuAvatar from "@/components/SsyuAvatar";
import { useMe } from "@/lib/meContext";

type ShopItem = {
  id: string;
  name: string;
  category: "OUTFIT" | "HAT" | "FACE" | "ACCESSORY" | "BACKGROUND" | "EMOTION";
  price: number;
  emoji: string;
  color: string;
  rarity: "COMMON" | "RARE" | "EPIC";
  owned: boolean;
  equipped: boolean;
};

const TABS: { value: ShopItem["category"]; label: string }[] = [
  { value: "OUTFIT", label: "의상" },
  { value: "HAT", label: "모자" },
  { value: "FACE", label: "얼굴" },
  { value: "ACCESSORY", label: "소품" },
  { value: "BACKGROUND", label: "배경" },
  { value: "EMOTION", label: "이모션" },
];

const RARITY_STYLE: Record<string, string> = {
  COMMON: "border-black/10",
  RARE: "border-ssyu-sky",
  EPIC: "border-ssyu-purple ring-2 ring-ssyu-purple/30",
};

export default function ShopPage() {
  const { me, refresh } = useMe();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [tab, setTab] = useState<ShopItem["category"]>("OUTFIT");
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/shop");
    const data = await res.json();
    setItems(data.items ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(() => items.filter((i) => i.category === tab), [items, tab]);

  const previewItems = useMemo(() => {
    const equippedByCategory = new Map<string, ShopItem>();
    for (const i of items) if (i.equipped) equippedByCategory.set(i.category, i);
    return Array.from(equippedByCategory.values()).map((i) => ({
      category: i.category,
      emoji: i.emoji,
      color: i.color,
      name: i.name,
    }));
  }, [items]);

  async function buy(item: ShopItem) {
    setMessage("");
    setBusyId(item.id);
    const res = await fetch("/api/shop/buy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: item.id }),
    });
    const data = await res.json();
    setBusyId(null);
    if (!res.ok) {
      setMessage(data.error ?? "구매에 실패했습니다.");
      return;
    }
    await load();
    await refresh();
  }

  async function toggleEquip(item: ShopItem) {
    setBusyId(item.id);
    await fetch("/api/shop/equip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: item.id, equipped: !item.equipped }),
    });
    setBusyId(null);
    await load();
    await refresh();
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">쓔 꾸미기</h1>

      <div className="rounded-3xl bg-white shadow-sm p-4 flex flex-col items-center">
        <SsyuAvatar level={me?.level ?? 1} items={previewItems} teamName={me?.name} size={170} />
        <div className="mt-2 text-sm font-bold">🪙 {me?.coins ?? 0}</div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-sm font-bold transition ${
              tab === t.value ? "bg-ssyu-brown text-white" : "bg-white text-black/50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {message && <p className="text-sm text-red-500">{message}</p>}

      <div className="grid grid-cols-2 gap-3">
        {visible.map((item) => (
          <div key={item.id} className={`rounded-2xl bg-white shadow-sm p-3 border-2 ${RARITY_STYLE[item.rarity]}`}>
            <div className="text-3xl text-center mb-1">{item.emoji}</div>
            <div className="text-center font-bold text-sm">{item.name}</div>
            {!item.owned ? (
              <button
                disabled={busyId === item.id}
                onClick={() => buy(item)}
                className="w-full mt-2 rounded-xl bg-ssyu-orange text-white text-xs font-bold py-2 disabled:opacity-50"
              >
                🪙 {item.price}
              </button>
            ) : (
              <button
                disabled={busyId === item.id}
                onClick={() => toggleEquip(item)}
                className={`w-full mt-2 rounded-xl text-xs font-bold py-2 disabled:opacity-50 ${
                  item.equipped ? "bg-ssyu-mint text-white" : "bg-black/5 text-ssyu-brown"
                }`}
              >
                {item.equipped ? "착용 중" : "착용하기"}
              </button>
            )}
          </div>
        ))}
        {visible.length === 0 && <p className="col-span-2 text-sm text-black/40 text-center py-8">아이템이 없습니다.</p>}
      </div>
    </div>
  );
}
