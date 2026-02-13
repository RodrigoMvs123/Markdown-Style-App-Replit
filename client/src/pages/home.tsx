import { useState } from "react";
import { useEnhanceMarkdown } from "@/hooks/use-enhance";
import { MarkdownPreview } from "@/components/markdown/MarkdownPreview";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Sparkles, 
  Copy, 
  RefreshCw, 
  PenTool, 
  ArrowRight,
  Zap
} from "lucide-react";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [useAI, setUseAI] = useState(false);
  const { mutate: enhance, isPending } = useEnhanceMarkdown();
  const { toast } = useToast();

  const handleEnhance = () => {
    if (!inputText.trim()) {
      toast({
        title: "Input Required",
        description: "Please paste some text to transform.",
        variant: "destructive",
      });
      return;
    }

    enhance(
      { text: inputText, useAI },
      {
        onSuccess: (data) => {
          setOutputText(data.enhancedText);
          toast({
            title: "Success",
            description: useAI ? "AI enhancement complete." : "Styles applied successfully.",
          });
        },
      }
    );
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(outputText);
      toast({
        title: "Copied",
        description: "Markdown copied to clipboard.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy text to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] font-sans flex flex-col">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/5 p-2 rounded-lg">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <h1 className="font-serif text-xl font-semibold text-foreground tracking-tight">
              Stylist AI
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-1 rounded-md">
              v2.0.0
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden h-[calc(100vh-164px)]">
        <div className="flex-1 flex flex-col border-r border-border/50 bg-white/50 relative group">
          <div className="p-4 border-b border-border/50 flex items-center justify-between bg-white/30 backdrop-blur-sm gap-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <PenTool className="w-4 h-4" />
              <span>Input Text</span>
            </div>
            <div className="flex items-center gap-3 bg-secondary/30 px-3 py-1.5 rounded-full border border-border/50 transition-all hover:bg-secondary/50">
              <Zap className={`w-3.5 h-3.5 ${useAI ? "text-primary fill-primary/20" : "text-muted-foreground"}`} />
              <Label htmlFor="ai-mode" className="text-[10px] font-bold uppercase tracking-wider cursor-pointer">AI Enhancement</Label>
              <Switch 
                id="ai-mode" 
                checked={useAI} 
                onCheckedChange={setUseAI}
                className="scale-75"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your raw text here..."
              className="w-full h-full p-6 resize-none bg-transparent border-none focus:ring-0 text-base leading-relaxed placeholder:text-muted-foreground/40 font-mono"
              spellCheck={false}
            />
          </div>

          <div className="p-6 border-t border-border/50 bg-white/80 backdrop-blur-md space-y-4">
            <Button 
              onClick={handleEnhance} 
              disabled={isPending || !inputText}
              className="w-full h-12 text-base shadow-lg shadow-primary/10 transition-all hover:scale-[1.01]"
              variant="claude"
            >
              {isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Applying Changes...
                </>
              ) : (
                <>
                  Apply Changes
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-white relative">
          <div className="p-4 border-b border-border/50 flex items-center justify-between bg-white/80 backdrop-blur-sm z-10">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Sparkles className="w-4 h-4 text-accent-foreground/70" />
              <span>Preview</span>
            </div>
            {outputText && (
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="gap-2 h-8 text-xs font-medium hover:bg-secondary/80 hover:text-primary transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Markdown
              </Button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-8 md:p-12">
            <div className="max-w-3xl mx-auto">
              {isPending ? (
                <div className="space-y-8 animate-pulse opacity-50">
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-5/6"></div>
                  </div>
                  <div className="h-32 bg-muted rounded"></div>
                </div>
              ) : (
                <MarkdownPreview content={outputText} />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
