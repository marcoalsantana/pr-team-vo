// app/layout.js
import './globals.css';
import ClientWrapper from './ClientWrapper';

export const metadata = {
  title: 'PR TEAM • Área do Aluno',
  description: 'Treinador Pedro Ratton',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}