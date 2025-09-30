// app/layout.js
import './globals.css';

export const metadata = { title: 'PR TEAM • Área do Aluno', description: 'Treinador Pedro Ratton' };

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}