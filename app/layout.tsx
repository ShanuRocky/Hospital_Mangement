import './globals.css';
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';


export const metadata: Metadata = {
  title: 'Hospital Food Management System',
  description: 'Manage patient meals and food delivery efficiently',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}