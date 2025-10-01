"use client";
import React from "react";

export default function TopBar({ title, subtitle, rightContent }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-800 to-red-600 text-white rounded-b-lg shadow-md">
      <div>
        <h1 className="text-lg font-bold">{title}</h1>
        {subtitle && <p className="text-sm opacity-80">{subtitle}</p>}
      </div>
      <div>{rightContent}</div>
    </div>
  );
}