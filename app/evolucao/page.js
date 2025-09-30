"use client";
import { useState } from "react";

export default function EvolucaoPage() {
  const [selectedImage, setSelectedImage] = useState(null);

  const photos = [
    { id: 1, label: "Frente", url: "/placeholder-front.jpg" },
    { id: 2, label: "Lado Direito", url: "/placeholder-right.jpg" },
    { id: 3, label: "Costas", url: "/placeholder-back.jpg" },
    { id: 4, label: "Lado Esquerdo", url: "/placeholder-left.jpg" },
  ];

  return (
    <div className="min-h-screen bg-[#1C1C1C] text-white p-4">
      {/* Cabeçalho */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-red-600">Sua Evolução</h1>
        <p className="text-gray-300 text-sm">
          Acompanhe suas fotos e progresso
        </p>
      </header>

      {/* Grid de Fotos */}
      <section className="grid grid-cols-2 gap-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            onClick={() => setSelectedImage(photo)}
            className="bg-[#2A2A2A] rounded-xl p-2 flex flex-col items-center cursor-pointer hover:scale-105 transition"
          >
            <div className="w-full h-40 bg-gray-700 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-sm">Foto {photo.label}</span>
            </div>
            <span className="mt-2 text-sm text-gray-300">{photo.label}</span>
          </div>
        ))}
      </section>

      {/* Estatísticas */}
      <section className="mt-8 bg-[#2A2A2A] rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-2">Resumo do Progresso</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#1C1C1C] rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-red-600">12</p>
            <p className="text-sm text-gray-300">Treinos este mês</p>
          </div>
          <div className="bg-[#1C1C1C] rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-red-600">58</p>
            <p className="text-sm text-gray-300">Treinos no total</p>
          </div>
        </div>
      </section>

      {/* Modal para abrir fotos */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="bg-[#2A2A2A] rounded-xl p-4 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">
              Foto {selectedImage.label}
            </h3>
            <div className="w-full h-80 bg-gray-700 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">Preview {selectedImage.label}</span>
            </div>
            <button
              onClick={() => setSelectedImage(null)}
              className="mt-4 w-full bg-red-600 hover:bg-red-700 py-2 rounded-lg"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}