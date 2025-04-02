
import { ThemeProvider } from "./components/theme-provider"
import { ThemeToggle } from "./components/theme-toggle"
import { ImageConverter } from "./components/ImageConverter"

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="min-h-screen flex flex-col">
        <header className="py-4 border-b">
          <div className="container flex items-center justify-between">
            <h1 className="text-xl font-bold">Image Converter</h1>
            <ThemeToggle />
          </div>
        </header>
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
    </ThemeProvider>
  )
}

export default App