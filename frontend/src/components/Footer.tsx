import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full py-8 border-t border-white/5 bg-background/60 backdrop-blur-lg mt-auto relative z-20">
      <div className="container mx-auto px-4 flex flex-col items-center justify-center space-y-3">
        <a 
          href="https://github.com/srihari-codes" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group flex items-center gap-2 text-muted-foreground hover:text-primary transition-all duration-300"
        >
          <Github className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="font-mono text-xs tracking-widest uppercase">
            © srihari-codes 2026
          </span>
        </a>
        <div className="flex gap-4">
          <div className="h-px w-8 bg-primary/20" />
          <div className="h-px w-8 bg-primary/20" />
        </div>
      </div>
    </footer>
  );
}
