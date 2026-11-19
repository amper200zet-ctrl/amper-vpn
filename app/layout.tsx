import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'AMPER VPN — личный портал', description: 'Личный кабинет и управление подпиской AMPER VPN.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>{children}</body></html>;
}
