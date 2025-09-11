import type { ReactNode } from "react";
import Footer from "@/components/Layout/Footer";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Footer className="col-start-2" />
    </>
  );
}
