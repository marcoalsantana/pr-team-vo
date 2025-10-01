"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function BottomTabs({ current }) {
  const router = useRouter();

  const tabs = [
    { key: "inicio", label: "Início", emoji: "🏠" },
    { key: "mobilidades", label: "Mobilidades", emoji: "🤸" },
    { key: "treino", label: "Treino", emoji: "🏋️" },
    { key: "alimentar", label: "Alimentar", emoji: "🥗" },
    { key: "evolucao", label: "Evolução", emoji: "📈" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black text-white flex justify-around py-2 shadow-lg">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => router.push(`/${tab.key}`)}
          className={`flex flex-col items-center ${
            current === tab.key ? "text-red-500 font-bold" : "text-gray-400"
          }`}
        >
          <span className="text-lg">{tab.emoji}</span>
          <span className="text-xs">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}