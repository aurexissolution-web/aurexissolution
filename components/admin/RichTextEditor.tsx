import React, { useRef, useEffect, useState } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Link, 
  Image, 
  Heading1, 
  Heading2, 
  Heading3,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Palette,
  Type as FontIcon
} from 'lucide-react';
import './RichTextEditor.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  value, 
  onChange, 
  placeholder = "Start writing...",
  className = ""
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showFontMenu || showColorMenu) {
        setShowFontMenu(false);
        setShowColorMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFontMenu, showColorMenu]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleContentChange();
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          break;
        case 'k':
          e.preventDefault();
          const url = prompt('Enter URL:');
          if (url) execCommand('createLink', url);
          break;
      }
    }
  };

  const insertMarkdown = (markdown: string) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(markdown));
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
      handleContentChange();
    }
  };

  const changeFontSize = (size: string) => {
    execCommand('fontSize', '7');
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.style.fontSize = size;
        range.surroundContents(span);
        handleContentChange();
      }
    }
  };

  const changeFontFamily = (font: string) => {
    execCommand('fontName', font);
  };

  const changeTextColor = (color: string) => {
    execCommand('foreColor', color);
  };

  // Convert Markdown to HTML for better display
  const convertMarkdownToHtml = (markdown: string): string => {
    return markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      // Lists
      .replace(/^\* (.*$)/gim, '<li>$1</li>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>')
      // Blockquotes
      .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
      // Line breaks
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      // Wrap in paragraphs
      .replace(/^(?!<[h1-6]|<li|<blockquote|<pre)(.*)$/gim, '<p>$1</p>');
  };

  const ToolbarButton: React.FC<{
    onClick: () => void;
    icon: React.ReactNode;
    title: string;
    isActive?: boolean;
  }> = ({ onClick, icon, title, isActive = false }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded hover:bg-gray-200 transition-colors ${
        isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
      }`}
    >
      {icon}
    </button>
  );

  return (
    <div className={`border border-gray-300 rounded-lg ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-2 bg-gray-50 rounded-t-lg rich-text-toolbar">
        <div className="flex flex-wrap gap-1">
          {/* Text Formatting */}
          <div className="flex border-r border-gray-300 pr-2 mr-2">
            <ToolbarButton
              onClick={() => execCommand('bold')}
              icon={<Bold size={16} />}
              title="Bold (Ctrl+B)"
            />
            <ToolbarButton
              onClick={() => execCommand('italic')}
              icon={<Italic size={16} />}
              title="Italic (Ctrl+I)"
            />
            <ToolbarButton
              onClick={() => execCommand('underline')}
              icon={<Underline size={16} />}
              title="Underline (Ctrl+U)"
            />
          </div>

          {/* Headings */}
          <div className="flex border-r border-gray-300 pr-2 mr-2">
            <ToolbarButton
              onClick={() => execCommand('formatBlock', 'h1')}
              icon={<Heading1 size={16} />}
              title="Heading 1"
            />
            <ToolbarButton
              onClick={() => execCommand('formatBlock', 'h2')}
              icon={<Heading2 size={16} />}
              title="Heading 2"
            />
            <ToolbarButton
              onClick={() => execCommand('formatBlock', 'h3')}
              icon={<Heading3 size={16} />}
              title="Heading 3"
            />
          </div>

          {/* Lists */}
          <div className="flex border-r border-gray-300 pr-2 mr-2">
            <ToolbarButton
              onClick={() => execCommand('insertUnorderedList')}
              icon={<List size={16} />}
              title="Bullet List"
            />
            <ToolbarButton
              onClick={() => execCommand('insertOrderedList')}
              icon={<ListOrdered size={16} />}
              title="Numbered List"
            />
          </div>

          {/* Alignment */}
          <div className="flex border-r border-gray-300 pr-2 mr-2">
            <ToolbarButton
              onClick={() => execCommand('justifyLeft')}
              icon={<AlignLeft size={16} />}
              title="Align Left"
            />
            <ToolbarButton
              onClick={() => execCommand('justifyCenter')}
              icon={<AlignCenter size={16} />}
              title="Align Center"
            />
            <ToolbarButton
              onClick={() => execCommand('justifyRight')}
              icon={<AlignRight size={16} />}
              title="Align Right"
            />
            <ToolbarButton
              onClick={() => execCommand('justifyFull')}
              icon={<AlignJustify size={16} />}
              title="Justify"
            />
          </div>

          {/* Special Formatting */}
          <div className="flex border-r border-gray-300 pr-2 mr-2">
            <ToolbarButton
              onClick={() => execCommand('formatBlock', 'blockquote')}
              icon={<Quote size={16} />}
              title="Quote"
            />
            <ToolbarButton
              onClick={() => execCommand('formatBlock', 'pre')}
              icon={<Code size={16} />}
              title="Code Block"
            />
          </div>

          {/* Font Options */}
          <div className="flex border-r border-gray-300 pr-2 mr-2 relative">
            <ToolbarButton
              onClick={() => setShowFontMenu(!showFontMenu)}
              icon={<FontIcon size={16} />}
              title="Font Options"
            />
            {showFontMenu && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 p-2 min-w-[200px]">
                <div className="mb-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Font Family</label>
                  <select 
                    onChange={(e) => { changeFontFamily(e.target.value); setShowFontMenu(false); }}
                    className="w-full text-xs border rounded px-2 py-1"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Courier New">Courier New</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Font Size</label>
                  <select 
                    onChange={(e) => { changeFontSize(e.target.value); setShowFontMenu(false); }}
                    className="w-full text-xs border rounded px-2 py-1"
                  >
                    <option value="12px">Small (12px)</option>
                    <option value="14px">Normal (14px)</option>
                    <option value="16px">Medium (16px)</option>
                    <option value="18px">Large (18px)</option>
                    <option value="20px">Extra Large (20px)</option>
                    <option value="24px">Huge (24px)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Color Options */}
          <div className="flex border-r border-gray-300 pr-2 mr-2 relative">
            <ToolbarButton
              onClick={() => setShowColorMenu(!showColorMenu)}
              icon={<Palette size={16} />}
              title="Text Color"
            />
            {showColorMenu && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 p-2">
                <div className="grid grid-cols-6 gap-1">
                  {['#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
                    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
                    '#FFA500', '#800080', '#008000', '#FFC0CB', '#A52A2A', '#808080'].map(color => (
                    <button
                      key={color}
                      onClick={() => { changeTextColor(color); setShowColorMenu(false); }}
                      className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Links and Media */}
          <div className="flex">
            <ToolbarButton
              onClick={() => {
                const url = prompt('Enter URL:');
                if (url) execCommand('createLink', url);
              }}
              icon={<Link size={16} />}
              title="Insert Link (Ctrl+K)"
            />
            <ToolbarButton
              onClick={() => {
                const url = prompt('Enter image URL:');
                if (url) execCommand('insertImage', url);
              }}
              icon={<Image size={16} />}
              title="Insert Image"
            />
          </div>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleContentChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`rich-text-editor min-h-[300px] p-4 focus:outline-none ${
          isFocused ? 'ring-2 ring-blue-500' : ''
        }`}
        style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          lineHeight: '1.6',
          fontSize: '16px'
        }}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />

      {/* Placeholder */}
      {!value && (
        <div className="absolute top-4 left-4 text-gray-400 pointer-events-none">
          {placeholder}
        </div>
      )}

      {/* Markdown Helper */}
      <div className="border-t border-gray-200 p-2 bg-gray-50 rounded-b-lg">
        <div className="text-xs text-gray-600 space-y-1">
          <div><strong>Markdown shortcuts:</strong></div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><code>**bold**</code> - Bold text</div>
            <div><code>*italic*</code> - Italic text</div>
            <div><code># Heading</code> - Main heading</div>
            <div><code>## Subheading</code> - Sub heading</div>
            <div><code>- List item</code> - Bullet list</div>
            <div><code>1. Numbered</code> - Numbered list</div>
            <div><code>[link](url)</code> - Create link</div>
            <div><code>`code`</code> - Inline code</div>
            <div><code>```code block```</code> - Code block</div>
            <div><code>&gt; Quote</code> - Blockquote</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;
