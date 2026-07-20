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
  COMMON: "border-ssyu-brown/8",
  RARE: "border-ssyu-sky/70",
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
      <h1 className="font-display text-xl">쓔 꾸미기</h1>

      <div className="card p-4 flex flex-col items-center">
        <div className="rounded-full p-1.5 bg-gradient-to-b from-ssyu-yellow/60 to-ssyu-orange/30">
          <SsyuAvatar level={me?.level ?? 1} items={previewItems} teamName={me?.name} size={160} className="!rounded-full" />
        </div>
        <div className="mt-2.5 font-display text-sm bg-ssyu-yellow/20 border border-ssyu-yellow/50 px-3 py-1 rounded-full">
          🪙 {me?.coins?.toLocaleString() ?? 0}
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full font-display text-sm transition ${
              tab === t.value ? "bg-ssyu-brown text-white shadow-sm" : "bg-white border border-ssyu-brown/10 text-ssyu-brown/45"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {message && <p className="text-sm text-red-500">{message}</p>}

      <div className="grid grid-cols-2 gap-3">
        {visible.map((item) => (
          <div key={item.id} className={`card p-3 !border-2 ${RARITY_STYLE[item.rarity]}`}>
            <div
              className="mx-auto mb-2 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{ background: `${item.color}22` }}
            >
              {item.emoji}
            </div>
            <div className="text-center font-display text-[13px]">{item.name}</div>
            {!item.owned ? (
              <button
                disabled={busyId === item.id}
                onClick={() => buy(item)}
                className="w-full mt-2 btn-game bg-ssyu-orange text-white text-xs py-2"
              >
                🪙 {item.price.toLocaleString()}
              </button>
            ) : (
              <button
                disabled={busyId === item.id}
                onClick={() => toggleEquip(item)}
                className={`w-full mt-2 btn-game text-xs py-2 ${
                  item.equipped ? "bg-ssyu-mint text-white" : "bg-ssyu-brown/5 !shadow-none border border-ssyu-brown/10 text-ssyu-brown/60"
                }`}
              >
                {item.equipped ? "✓ 착용 중" : "착용하기"}
              </button>
            )}
          </div>
        ))}
        {visible.length === 0 && <p className="col-span-2 text-sm text-ssyu-brown/40 text-center py-8">아이템이 없습니다.</p>}
      </div>
    </div>
  );
}
