import type { Metadata } from "next";
import { ThemeProvider } from "@mui/material";
import theme from "@/theme";

export const metadata: Metadata = {
    title: "Youtube Downloader",
    description: "Youtube Downloader",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#1976d2" />
                <link rel="manifest" href="/manifest.json" />
                <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
            </head>
            <body className="flex w-screen h-screen">
                <ThemeProvider theme={theme}>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
