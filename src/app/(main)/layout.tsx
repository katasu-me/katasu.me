import Footer from "@/components/Footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Footer className="col-start-2" />
    </>
  );
}
