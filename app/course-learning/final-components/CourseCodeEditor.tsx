'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { 
  Copy, 
  RefreshCw, 
  Play, 
  MessageCircle, 
  Settings, 
  Maximize2, 
  Minimize2, 
  Download, 
  Upload, 
  Save,
  Eye,
  FileText,
  Terminal,
  GitBranch,
  Search,
  X,
  Check
} from 'lucide-react';

interface CourseEditorProps {
  initialCode?: string;
  language?: string;
  fileName?: string;
  onCodeChange?: (code: string) => void;
  onRun?: (code: string) => void;
  onTalkToMentor?: () => void;
}

function CourseEditor({
  initialCode = `public class Main {
    // Example method
    public static void greet(String name) {
        System.out.println("Hello, " + name + "!");
    }
    
    // Main method - this is where execution starts
    public static void main(String[] args) {
        System.out.println("Hello World!");
        greet("Java Programmer");
    }
}`,
  language = 'java',
  fileName = 'Main.java',
  onCodeChange,
  onRun,
  onTalkToMentor
}: CourseEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('Hello World!');
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showOutput, setShowOutput] = useState(true);
  const [fontSize, setFontSize] = useState(14);
  const [theme, setTheme] = useState('vs-dark');
  const [wordWrap, setWordWrap] = useState(true);
  const [minimap, setMinimap] = useState(false);
  const [lineNumbers] = useState(true);
  const [serverStatus, setServerStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [inputValue, setInputValue] = useState('');
  const [showInput, setShowInput] = useState(false);
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  // Function to programmatically update editor content
  const updateEditorContent = useCallback((newCode: string) => {
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        model.setValue(newCode);
        console.log('[CourseEditor] Editor content updated programmatically');
      }
    }
  }, []);

  const fixJavaCode = useCallback((code: string) => {
    if (language.toLowerCase() === 'java') {
      let fixedCode = code;
      
      // First, replace any public class with "Main" class
      fixedCode = fixedCode.replace(/public\s+class\s+\w+/g, 'public class Main');
      
      // Check if there's a main method (case insensitive)
      const hasMainMethod = /public\s+static\s+void\s+main\s*\(/i.test(fixedCode);
      
      if (!hasMainMethod) {
        // If no main method exists, add one at the end of the class
        const classEndIndex = fixedCode.lastIndexOf('}');
        if (classEndIndex !== -1) {
          // Check if there are any methods that could be called from main
          const hasMethods = /public\s+(?!static\s+void\s+main)/.test(fixedCode);
          
          let mainMethod;
          if (hasMethods) {
            // If there are other methods, create a main method that can call them
            mainMethod = `
    // Main method to run the program
    public static void main(String[] args) {
        // Create an instance of the class to call non-static methods
        Main main = new Main();
        // You can call your methods here
        // Example: main.yourMethod();
    }`;
          } else {
            // Simple main method for basic programs
            mainMethod = `
    // Main method to run the program
    public static void main(String[] args) {
        System.out.println("Program started!");
        // Your code will be executed here
    }`;
          }
          
          fixedCode = fixedCode.slice(0, classEndIndex) + mainMethod + fixedCode.slice(classEndIndex);
        }
      }
      
      return fixedCode;
    }
    return code;
  }, [language]);

  // Update code when initialCode prop changes
  useEffect(() => {
    console.log('[CourseEditor] Props changed:', {
      initialCode: initialCode ? initialCode.substring(0, 100) + '...' : 'none',
      language,
      fileName,
      currentCode: code ? code.substring(0, 100) + '...' : 'none'
    });
    
    if (initialCode && initialCode !== code) {
      console.log('[CourseEditor] Updating code from lesson:', {
        initialCode: initialCode.substring(0, 100) + '...',
        language,
        fileName
      });
      setCode(initialCode);
      // Also update the editor directly if it's mounted
      updateEditorContent(initialCode);
    } else if (!initialCode && code !== '') {
      console.log('[CourseEditor] Clearing code - no initialCode provided');
      setCode('');
      updateEditorContent('');
    }
  }, [initialCode, language, fileName, code, updateEditorContent]);

  // Check server status on mount
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch('http://48.217.184.72:8000/health', {
          method: 'GET',
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          setServerStatus('connected');
        } else {
          setServerStatus('disconnected');
        }
      } catch {
        setServerStatus('disconnected');
      }
    };

    checkServerStatus();
    // Check server status every 30 seconds
    const interval = setInterval(checkServerStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleEditorDidMount: OnMount = useCallback((editor) => {
    editorRef.current = editor;
    editor.focus();
  }, []);

  const handleCodeChange = useCallback((value: string | undefined) => {
    const newCode = value || '';
    setCode(newCode);
    onCodeChange?.(newCode);
  }, [onCodeChange]);

  const handleRun = useCallback(async () => {
    if (isRunning) return;
    
    if (serverStatus !== 'connected') {
      setOutput('Error: Code execution server is not available. Please check your connection.');
      return;
    }
    
    setIsRunning(true);
    setOutput('Running...');
    
    try {
      // Make API call to the real code execution server
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch('http://48.217.184.72:8000/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: language.toLowerCase(),
          code: fixJavaCode(code),
          input: showInput ? inputValue : null
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.error) {
        setOutput(`Error: ${result.error}`);
      } else {
        setOutput(result.output || 'Code executed successfully!');
      }
      
      onRun?.(code);
    } catch (error) {
      console.error('Execution error:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        setOutput('Error: Execution timed out (30 seconds)');
      } else {
        setOutput(`Error: ${error instanceof Error ? error.message : 'Failed to execute code'}`);
      }
    } finally {
      setIsRunning(false);
    }
  }, [code, language, isRunning, onRun, serverStatus, showInput, inputValue, fixJavaCode]);

  const handleCopyOutput = useCallback(() => {
    navigator.clipboard.writeText(output);
  }, [output]);

  const handleClearOutput = useCallback(() => {
    setOutput('');
  }, []);

  const handleTalkToMentor = useCallback(() => {
    onTalkToMentor?.();
  }, [onTalkToMentor]);

  const handleSave = useCallback(() => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }, [code, fileName]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }, [code, fileName]);

  const handleUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.java,.js,.py,.cpp,.c,.html,.css,.ts,.tsx,.jsx';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setCode(content);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, []);

  const getLanguageId = (lang: string) => {
    const languageMap: { [key: string]: string } = {
      'java': 'java',
      'javascript': 'javascript',
      'js': 'javascript',
      'python': 'python',
      'py': 'python',
      'cpp': 'cpp',
      'c++': 'cpp',
      'c': 'c',
      'html': 'html',
      'css': 'css',
      'typescript': 'typescript',
      'ts': 'typescript'
    };
    return languageMap[lang.toLowerCase()] || 'plaintext';
  };

  const getLanguageIcon = (lang: string) => {
    const iconMap: { [key: string]: string } = {
      'java': '☕',
      'javascript': '⚡',
      'js': '⚡',
      'python': '🐍',
      'py': '🐍',
      'cpp': '⚙️',
      'c++': '⚙️',
      'c': '⚙️',
      'html': '🌐',
      'css': '🎨',
      'typescript': '📘',
      'ts': '📘'
    };
    return iconMap[lang.toLowerCase()] || '📄';
  };

  return (
    <div className={`flex flex-col bg-[#1e1e1e] rounded-lg shadow-2xl border border-[#3c3c3c] overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : 'h-full w-full'}`}>
      {/* VS Code-like Title Bar */}
      <div className="flex items-center justify-between bg-[#2d2d30] px-4 py-2 border-b border-[#3c3c3c]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[#cccccc] text-sm font-medium">{getLanguageIcon(language)}</span>
            <span className="text-[#cccccc] text-sm font-medium">{fileName}</span>
            <span className="text-[#6a6a6a] text-xs">●</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
            <div className="w-3 h-3 rounded-full bg-[#27ca3f]"></div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 rounded hover:bg-[#3c3c3c] transition-colors"
            title="Settings"
          >
            <Settings size={16} className="text-[#cccccc]" />
          </button>
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded hover:bg-[#3c3c3c] transition-colors"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={16} className="text-[#cccccc]" /> : <Maximize2 size={16} className="text-[#cccccc]" />}
          </button>
          {isFullscreen && (
            <button 
              onClick={() => setIsFullscreen(false)}
              className="p-1.5 rounded hover:bg-[#3c3c3c] transition-colors"
              title="Close"
            >
              <X size={16} className="text-[#cccccc]" />
            </button>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-[#252526] border-b border-[#3c3c3c] p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[#cccccc] text-xs font-medium">Font Size</label>
              <select 
                value={fontSize} 
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="bg-[#3c3c3c] text-[#cccccc] border border-[#5a5a5a] rounded px-2 py-1 text-sm"
              >
                {[12, 13, 14, 15, 16, 17, 18, 20, 22, 24].map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[#cccccc] text-xs font-medium">Theme</label>
              <select 
                value={theme} 
                onChange={(e) => setTheme(e.target.value)}
                className="bg-[#3c3c3c] text-[#cccccc] border border-[#5a5a5a] rounded px-2 py-1 text-sm"
              >
                <option value="vs-dark">Dark</option>
                <option value="vs-light">Light</option>
                <option value="hc-black">High Contrast</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[#cccccc] text-xs font-medium">Word Wrap</label>
              <button 
                onClick={() => setWordWrap(!wordWrap)}
                className={`px-3 py-1 rounded text-sm flex items-center gap-2 ${wordWrap ? 'bg-[#007acc] text-white' : 'bg-[#3c3c3c] text-[#cccccc]'}`}
              >
                {wordWrap ? <Check size={14} /> : <X size={14} />}
                {wordWrap ? 'On' : 'Off'}
              </button>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[#cccccc] text-xs font-medium">Minimap</label>
              <button 
                onClick={() => setMinimap(!minimap)}
                className={`px-3 py-1 rounded text-sm flex items-center gap-2 ${minimap ? 'bg-[#007acc] text-white' : 'bg-[#3c3c3c] text-[#cccccc]'}`}
              >
                {minimap ? <Check size={14} /> : <X size={14} />}
                {minimap ? 'On' : 'Off'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Bar */}
      <div className="flex items-center bg-[#333333] border-b border-[#3c3c3c] px-3 py-1">
        <div className="flex items-center gap-4">
          <button className="p-2 rounded hover:bg-[#3c3c3c] transition-colors" title="Explorer">
            <FileText size={16} className="text-[#cccccc]" />
          </button>
          <button className="p-2 rounded hover:bg-[#3c3c3c] transition-colors" title="Search">
            <Search size={16} className="text-[#cccccc]" />
          </button>
          <button className="p-2 rounded hover:bg-[#3c3c3c] transition-colors" title="Source Control">
            <GitBranch size={16} className="text-[#cccccc]" />
          </button>
          <button className="p-2 rounded hover:bg-[#3c3c3c] transition-colors" title="Terminal">
            <Terminal size={16} className="text-[#cccccc]" />
          </button>
        </div>
        
        <div className="ml-auto flex items-center gap-2">
          <button 
            onClick={handleUpload}
            className="p-1.5 rounded hover:bg-[#3c3c3c] transition-colors"
            title="Upload file"
          >
            <Upload size={14} className="text-[#cccccc]" />
          </button>
          <button 
            onClick={handleSave}
            className="p-1.5 rounded hover:bg-[#3c3c3c] transition-colors"
            title="Save"
          >
            <Save size={14} className="text-[#cccccc]" />
          </button>
          <button 
            onClick={handleDownload}
            className="p-1.5 rounded hover:bg-[#3c3c3c] transition-colors"
            title="Download"
          >
            <Download size={14} className="text-[#cccccc]" />
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 bg-[#1e1e1e] relative">
        <Editor
          key={`${language}-${fileName}`} // Force re-render when language or fileName changes
          height="100%"
          language={getLanguageId(language)}
          value={code}
          theme={theme}
          onChange={handleCodeChange}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: minimap },
            fontSize: fontSize,
            lineNumbers: lineNumbers ? 'on' : 'off',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: wordWrap ? 'on' : 'off',
            folding: true,
            lineDecorationsWidth: 10,
            lineNumbersMinChars: 3,
            glyphMargin: false,
            foldingStrategy: 'indentation',
            showFoldingControls: 'always',
            selectOnLineNumbers: true,
            renderLineHighlight: 'all',
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible',
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10,
            },
            cursorBlinking: 'blink',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            mouseWheelZoom: true,
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: 'on',
            tabCompletion: 'on',
            parameterHints: {
              enabled: true,
            },
            autoIndent: 'full',
            formatOnPaste: true,
            formatOnType: true,
            bracketPairColorization: {
              enabled: true,
            },
            guides: {
              bracketPairs: true,
              indentation: true,
            },
            renderWhitespace: 'selection',
            insertSpaces: true,
            tabSize: 2,
          }}
        />
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between bg-[#007acc] px-4 py-1 text-white text-xs">
        <div className="flex items-center gap-4">
          <span>{getLanguageId(language).toUpperCase()}</span>
          <span>Ln 1, Col 1</span>
          <span>Spaces: 2</span>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${
              serverStatus === 'connected' ? 'bg-green-300' : 
              serverStatus === 'checking' ? 'bg-yellow-300' : 'bg-red-300'
            }`}></div>
            <span>
              {serverStatus === 'connected' ? 'Server Connected' : 
               serverStatus === 'checking' ? 'Checking...' : 'Server Disconnected'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span>UTF-8</span>
          <span>LF</span>
        </div>
      </div>

      {/* Output Panel */}
      {showOutput && (
        <div className="bg-[#1e1e1e] border-t border-[#3c3c3c]">
          {/* Output Header */}
          <div className="flex items-center justify-between bg-[#2d2d30] px-4 py-2 border-b border-[#3c3c3c]">
            <div className="flex items-center gap-2">
              <Terminal size={16} className="text-[#cccccc]" />
              <span className="text-[#cccccc] font-medium text-sm">OUTPUT</span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowOutput(false)}
                className="p-1 rounded hover:bg-[#3c3c3c] transition-colors"
                title="Hide output"
              >
                <X size={14} className="text-[#cccccc]" />
              </button>
              <button 
                onClick={handleCopyOutput}
                className="p-1 rounded hover:bg-[#3c3c3c] transition-colors"
                title="Copy output"
              >
                <Copy size={14} className="text-[#cccccc]" />
              </button>
              <button 
                onClick={handleClearOutput}
                className="p-1 rounded hover:bg-[#3c3c3c] transition-colors"
                title="Clear output"
              >
                <RefreshCw size={14} className="text-[#cccccc]" />
              </button>
              <button 
                onClick={handleRun}
                disabled={isRunning}
                className="ml-2 px-4 py-1.5 bg-[#007acc] text-white font-medium rounded hover:bg-[#005a9e] transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play size={14} />
                {isRunning ? 'RUNNING...' : 'RUN'}
              </button>
            </div>
          </div>
          
          {/* Input Section */}
          <div className="bg-[#2d2d30] px-4 py-2 border-b border-[#3c3c3c]">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowInput(!showInput)}
                className={`px-3 py-1 rounded text-sm flex items-center gap-2 ${
                  showInput ? 'bg-[#007acc] text-white' : 'bg-[#3c3c3c] text-[#cccccc]'
                }`}
              >
                {showInput ? <Check size={14} /> : <X size={14} />}
                Input
              </button>
              {showInput && (
                <input
                  type="text"
                  placeholder="Enter input for your program..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="flex-1 bg-[#3c3c3c] text-[#cccccc] border border-[#5a5a5a] rounded px-3 py-1 text-sm"
                />
              )}
              {language.toLowerCase() === 'java' && (
                <div className="text-[#cccccc] text-xs ml-2">
                  <div>💡 Java: Use &quot;Main&quot; class name</div>
                  <div>📝 Tip: Include a main method for execution</div>
                </div>
              )}
            </div>
          </div>
          
          {/* Output Content */}
          <div className="bg-[#1e1e1e] h-[200px] text-[#cccccc] text-sm border-b border-[#3c3c3c] font-mono overflow-hidden">
            <div className="h-full overflow-y-auto px-4 py-4">
              <pre className="whitespace-pre-wrap">{output}</pre>
            </div>
          </div>
          
          {/* Talk To Mentor */}
          <div className="bg-[#2d2d30] px-4 py-3 flex justify-end">
            <button 
              onClick={handleTalkToMentor}
              className="px-4 py-2 bg-[#3c3c3c] text-[#cccccc] rounded font-medium hover:bg-[#4c4c4c] transition flex items-center gap-2"
            >
              <MessageCircle size={14} />
              Talk To Mentor
            </button>
          </div>
        </div>
      )}

      {/* Show Output Button (when hidden) */}
      {!showOutput && (
        <div className="bg-[#2d2d30] px-4 py-2 flex justify-center">
          <button 
            onClick={() => setShowOutput(true)}
            className="px-4 py-1 bg-[#3c3c3c] text-[#cccccc] rounded text-sm hover:bg-[#4c4c4c] transition flex items-center gap-2"
          >
            <Eye size={14} />
            Show Output
          </button>
        </div>
      )}
    </div>
  );
}

export default CourseEditor;
