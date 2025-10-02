"use client";
import React from "react";

export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10_000,
        display: "flex",
        alignItems: "center",   // CENTRALIZADO VERTICAL
        justifyContent: "center", // CENTRALIZADO HORIZONTAL
        background: "rgba(0,0,0,0.60)",
        backdropFilter: "blur(4px)",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#121214",
          color: "#fff",
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 20px 50px rgba(0,0,0,.45)",
          padding: 16,
          position: "relative",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          style={{
            position: "absolute",
            top: 8,
            right: 10,
            background: "transparent",
            border: "none",
            color: "rgba(255,255,255,0.6)",
            fontSize: 20,
            cursor: "pointer",
          }}
        >
          ✖
        </button>

        {title && (
          <h2
            style={{
              fontSize: 18,
              fontWeight: 900,
              margin: "0 24px 10px 0",
              letterSpacing: 0.3,
            }}
          >
            {title}
          </h2>
        )}

        <div>{children}</div>
      </div>
    </div>
  );
}