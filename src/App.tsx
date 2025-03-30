
import { ImageConverter } from "./components/ImageConverter";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <ImageConverter />
      </main>
      <Footer />
    </div>
  );
}