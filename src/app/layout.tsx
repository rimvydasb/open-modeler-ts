import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import MuiProvider from '@/providers/MuiProvider';
import QueryProvider from '@/providers/QueryProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'EdgeRules Modeler',
    description: 'Web-based tool for creating and testing EdgeRules rulesets',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <QueryProvider>
                    <MuiProvider>
                        {children}
                    </MuiProvider>
                </QueryProvider>
            </body>
        </html>
    );
}
