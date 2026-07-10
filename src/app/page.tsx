import type { Metadata } from "next";
import { DashboardApp } from "@/components/dashboard/DashboardApp";

export const metadata: Metadata = {
  title: "EasyVariants · Variant Studio",
  description:
    "Convert product images into production-ready 3D assets. Interactive studio for image-to-3D reconstruction, PBR variants, virtual try-on and export.",
};

export default function Home() {
  return <DashboardApp />;
}
