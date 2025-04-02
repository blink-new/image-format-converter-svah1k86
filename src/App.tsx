
import { ImageConverter } from "./components/ImageConverter";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <ImageConverter />
      </main>
      <footer className="py-6 border-t">
        <div className="container flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Built with ❤️ by Blink
          </p>
          <p className="text-sm text-muted-foreground">
            Version 1.0.0
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;