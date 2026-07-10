import type { Metadata } from "next";
import { DashboardApp } from "@/components/dashboard/DashboardApp";

export const metadata: Metadata = {
  title: "EasyVariants · Variant Studio",
  description:
    "Convert multi-view product images into production-ready 3D assets. Interactive dashboard for multi-view reconstruction, PBR variants, virtual try-on and export.",
};

export default function DashboardPage() {
  return <DashboardApp />;
}
