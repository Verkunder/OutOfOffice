import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";
import "antd/dist/reset.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Out Of Office",
  description: "A Pattaya travel journal with photos, places, ideas, and emotions.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: "#0e6f68",
              colorInfo: "#2f5e8f",
              colorBgBase: "#f3f5ef",
              colorTextBase: "#18243a",
              colorBorderSecondary: "#dde5dd",
              borderRadius: 8,
              fontFamily:
                "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
            },
            components: {
              Layout: {
                bodyBg: "#f3f5ef",
                headerBg: "#ffffff",
                siderBg: "#ffffff",
                triggerBg: "#eef3ee"
              },
              Card: {
                colorBgContainer: "#ffffff",
                colorBorderSecondary: "#dde5dd",
                borderRadiusLG: 8
              },
              Menu: {
                itemBg: "#ffffff",
                itemSelectedBg: "#e7f4f0",
                itemSelectedColor: "#0e6f68",
                itemColor: "#53635f",
                itemHoverColor: "#0e6f68"
              }
            }
          }}
        >
          <AntdRegistry>{children}</AntdRegistry>
        </ConfigProvider>
      </body>
    </html>
  );
}
