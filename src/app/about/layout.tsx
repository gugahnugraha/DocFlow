import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn more about the mission behind DocFlow.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
