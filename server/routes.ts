import type { Express } from "express";
import { storage } from "./storage";
import { api } from "@shared/routes";
import express from "express";
import OpenAI from "openai";

// OpenRouter integration
const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENAI_API_KEY,
});

export async function registerRoutes(httpServer: any, app: Express) {
  app.use(express.json({ limit: '10mb' }));
  
  app.post(api.enhance.path, async (req, res) => {
    try {
      const { text, useAI } = req.body;
      
      let finalOutput: string;

      if (useAI) {
        const response = await openrouter.chat.completions.create({
          model: "openai/gpt-oss-120b:free",
          messages: [
            {
              role: "system",
              content: "You are a Markdown styling expert. Transform the provided raw text into professional GitHub-flavored Markdown. Follow these rules:\n1. First line is a # heading.\n2. Sections use ## headings.\n3. URLs as bullet points.\n4. UI elements (Terminal, Explorer, file names like index.js) in **bold**.\n5. Detect code languages (js, ts, python, etc.) and wrap in code blocks.\n6. Detect terminal commands and wrap in bash code blocks.\n7. Redact secrets (API keys, tokens) with '...'.\n8. Match the professional style of Claude's README outputs."
            },
            {
              role: "user",
              content: text
            }
          ],
          max_tokens: 4096,
        });
        finalOutput = response.choices[0]?.message?.content || "";
      } else {
        const lines = text.split('\n');
        let enhancedText = "";
        let currentBlock: string[] = [];
        let currentBlockType: 'code' | 'terminal' | 'text' | null = null;
        
        // Helper: Detect if line contains code patterns
        const isCodeLine = (line: string): boolean => {
          const codePatterns = [
            /\{[\s\S]*\}/,           // curly braces
            /function\s+\w+/,         // function declarations
            /const\s+\w+\s*=/,        // const declarations
            /let\s+\w+\s*=/,          // let declarations
            /var\s+\w+\s*=/,          // var declarations
            /=>/,                     // arrow functions
            /import\s+.*from/,        // ES6 imports
            /require\(['"]/,          // CommonJS require
            /export\s+(default|const|function)/, // exports
            /<\/?\w+[^>]*>/,          // HTML/JSX tags
            /interface\s+\w+/,        // TypeScript interfaces
            /type\s+\w+\s*=/,         // TypeScript types
          ];
          return codePatterns.some(pattern => pattern.test(line));
        };
        
        // Helper: Detect if line is a terminal command
        const isTerminalLine = (line: string): boolean => {
          const trimmed = line.trim();
          const terminalPatterns = [
            /^(npm|yarn|npx|pnpm)\s+/,
            /^(node|git|docker|kubectl)\s+/,
            /^(cd|ls|mkdir|cp|mv|rm)\s+/,
            /^\$\s+/,                  // shell prompt
            /^C:\\.*>/,                // Windows prompt
            /^[a-zA-Z]:\\.*>/,         // Windows path prompt
          ];
          return terminalPatterns.some(pattern => pattern.test(trimmed));
        };
        
        // Helper: Detect code language from content
        const detectLanguage = (content: string): string => {
          if (content.includes('<!DOCTYPE') || content.includes('<html')) return 'html';
          if (content.includes('.class {') || content.includes('background:')) return 'css';
          if (content.includes('interface ') || content.includes('type ')) return 'typescript';
          if (content.includes('resource "') || content.includes('provider "')) return 'hcl';
          if (content.includes('def ') || content.includes('import numpy')) return 'python';
          if (content.includes('API_KEY=') || content.includes('DATABASE_URL=')) return 'env';
          if (content.includes('{') && content.includes('"')) return 'json';
          return 'javascript';
        };
        
        // Helper: Redact secrets and sensitive data
        const redactSecrets = (line: string): string => {
          let redacted = line;
          
          // API Keys and Tokens
          redacted = redacted.replace(/(API_KEY|TOKEN|SECRET|PASSWORD|PASS)\s*=\s*["']?[^"'\s]+["']?/gi, 
            (match) => match.split('=')[0] + '=...');
          
          // Database URLs
          redacted = redacted.replace(/DATABASE_URL\s*=\s*.+/gi, 'DATABASE_URL=...');
          
          // Bearer tokens
          redacted = redacted.replace(/Bearer\s+[A-Za-z0-9\-_]+/gi, 'Bearer ...');
          
          // AWS keys (starts with AKIA)
          redacted = redacted.replace(/AKIA[A-Z0-9]{16}/g, '...');
          
          // OpenAI keys (starts with sk-)
          redacted = redacted.replace(/sk-[A-Za-z0-9]{48}/g, '...');
          
          // GitHub tokens (ghp_, gho_)
          redacted = redacted.replace(/gh[po]_[A-Za-z0-9]{36}/g, '...');
          
          // Generic long alphanumeric strings (likely secrets)
          redacted = redacted.replace(/[A-Za-z0-9]{32,}/g, (match) => {
            // Don't redact if it's a URL or common words
            if (match.includes('http') || match.includes('www')) return match;
            return '...';
          });
          
          return redacted;
        };
        
        // Helper: Flush accumulated block
        const flushBlock = () => {
          if (currentBlock.length === 0) return;
          
          const content = currentBlock.join('\n');
          
          if (currentBlockType === 'code') {
            const lang = detectLanguage(content);
            enhancedText += `\`\`\`${lang}\n${content}\n\`\`\`\n\n`;
          } else if (currentBlockType === 'terminal') {
            enhancedText += `\`\`\`bash\n${content}\n\`\`\`\n\n`;
          } else {
            // Regular text block
            enhancedText += content + "\n\n";
          }
          
          currentBlock = [];
          currentBlockType = null;
        };
        
        // Main processing loop
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const trimmed = line.trim();
          
          // Handle empty lines
          if (trimmed === "") {
            flushBlock();
            continue;
          }
          
          // Redact any secrets in the line
          const redactedLine = redactSecrets(line);
          
          // Pattern 1: First line is always the main title
          if (i === 0 && !trimmed.startsWith('#')) {
            flushBlock();
            enhancedText += `# ${redactedLine}\n\n`;
            continue;
          }
          
          // Pattern 2: URLs should be in bullet lists
          if (/^https?:\/\//.test(trimmed)) {
            flushBlock();
            enhancedText += `- ${trimmed}\n`;
            continue;
          }
          
          // Pattern 3: File names and UI elements in bold
          const uiElements = [
            'Terminal', 'Explorer', 'Visual Studio Code', 'Web Browser',
            'AWS UI', 'AWS Console', 'Services', 'Resources',
          ];
          
          const isFileName = /\.(js|ts|jsx|tsx|html|css|json|env|md|py|java|go|rs)$/i.test(trimmed);
          
          if (uiElements.includes(trimmed) || isFileName) {
            flushBlock();
            enhancedText += `**${trimmed}**\n\n`;
            continue;
          }
          
          // Pattern 4: Section headers (words followed by colon or standalone caps)
          if (/^[A-Z][A-Za-z\s]+:?$/.test(trimmed) && trimmed.length < 50) {
            flushBlock();
            enhancedText += `## ${trimmed.replace(/:$/, '')}\n\n`;
            continue;
          }
          
          // Pattern 5: Detect code blocks
          if (isCodeLine(redactedLine)) {
            if (currentBlockType !== 'code') {
              flushBlock();
              currentBlockType = 'code';
            }
            currentBlock.push(redactedLine);
            continue;
          }
          
          // Pattern 6: Detect terminal commands
          if (isTerminalLine(redactedLine)) {
            if (currentBlockType !== 'terminal') {
              flushBlock();
              currentBlockType = 'terminal';
            }
            currentBlock.push(redactedLine);
            continue;
          }
          
          // Pattern 7: Horizontal separators
          if (trimmed === '---' || trimmed === '___') {
            flushBlock();
            enhancedText += `---\n\n`;
            continue;
          }
          
          // Pattern 8: Timestamps/Course sections (parentheses with time)
          if (/^\(\d+:\d+:\d+\)/.test(trimmed)) {
            flushBlock();
            enhancedText += `${redactedLine}\n\n`;
            continue;
          }
          
          // Default: Add to current text block
          if (currentBlockType !== 'text' && currentBlockType !== null) {
            flushBlock();
          }
          if (currentBlockType === null) {
            currentBlockType = 'text';
          }
          currentBlock.push(redactedLine);
        }
        
        // Flush any remaining content
        flushBlock();
        
        finalOutput = enhancedText.trim().replace(/\n{3,}/g, '\n\n');
      }

      await storage.createDocument({
        originalText: text,
        enhancedText: finalOutput
      });

      res.json({ enhancedText: finalOutput });
      
    } catch (err) {
      console.error('Enhancement error:', err);
      res.status(500).send("Error processing markdown");
    }
  });

  return httpServer;
}
