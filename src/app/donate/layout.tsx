import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support DocFlow",
  description: "Help us keep DocFlow free forever by supporting us on BuyMeACoffee or Trakteer.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
