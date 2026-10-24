import type { Metadata } from "next";
import DexScreen from "@/components/DexScreen";

export const metadata: Metadata = {
  title: "몬스터 도감 - 워드몬",
};

export default function DexPage() {
  return <DexScreen />;
}
