import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function App() {
  return (
    <div className={cn("min-h-screen", "flex flex-col items-center justify-center gap-4", "bg-background")}>
      <h1 className="text-4xl font-bold text-foreground">AList Gateway</h1>
      <p className="text-muted-foreground">
        Multi-protocol file mount platform
      </p>
      <Button onClick={() => window.open("/api/public/settings", "_self")}>
        Get Started
      </Button>
    </div>
  )
}

export default App
