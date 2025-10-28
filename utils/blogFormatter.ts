/**
 * Comprehensive blog content formatter
 * Ensures consistent HTML rendering between admin preview and published blog
 */

export interface BlogContent {
  content: string;
  title?: string;
}

export const formatBlogContent = (content: string): string => {
  if (!content) return '';

  // Check if content is already HTML
  const isHtml = /<[^>]+>/.test(content);
  
  // Force conversion if content looks like it should be formatted but isn't HTML
  const shouldForceConversion = !isHtml && (
    content.includes('**') || 
    content.includes('*') || 
    content.includes('"') ||
    content.includes('1.') ||
    content.includes('- ') ||
    content.includes('•') ||
    content.includes('##') ||
    content.includes('###') ||
    content.includes('####')
  );

  let htmlContent = content;

  // Convert to HTML if needed
  if (!isHtml || shouldForceConversion) {
    console.log('Formatting blog content:', { isHtml, shouldForceConversion });
    
    htmlContent = content
      // Headers (order matters - do more specific first)
      .replace(/^#### (.*$)/gim, '<h4 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 mt-5">$1</h4>')
      .replace(/^### (.*$)/gim, '<h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 mt-6">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-5 mt-8 border-b border-gray-200 dark:border-gray-600 pb-2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-4xl font-bold text-black dark:text-white mb-6 mt-8">$1</h1>')
      
      // Bold and italic (order matters - do bold first)
      .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-black dark:text-white">$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em class="italic text-gray-900 dark:text-gray-200">$1</em>')
      
      // Code blocks (do before inline code)
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-900 dark:bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm">$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-sm font-mono">$1</code>')
      
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline decoration-2 underline-offset-2">$1</a>')
      
      // Blockquotes
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 pl-6 py-4 rounded-r my-6 text-lg italic text-gray-700 dark:text-gray-300">$1</blockquote>')
      
      // Lists - handle both unordered and ordered
      .replace(/^(\d+)\. (.*$)/gim, '<li class="mb-2 text-gray-900 dark:text-gray-300">$2</li>')
      .replace(/^\* (.*$)/gim, '<li class="mb-2 text-gray-900 dark:text-gray-300">$1</li>')
      .replace(/^- (.*$)/gim, '<li class="mb-2 text-gray-900 dark:text-gray-300">$1</li>')
      
      // Handle numbered lists with text after the number
      .replace(/^(\d+)\.\s+(.*$)/gim, '<li class="mb-2 text-gray-900 dark:text-gray-300">$2</li>')
      
      // Handle numbered sections (like "1. OpenAI's Assistant API Ecosystem")
      .replace(/^(\d+)\.\s+([A-Z][^:]+:.*$)/gim, '<h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 mt-6">$2</h3>')
      
      // Handle subsections with colons (like "Key Features:")
      .replace(/^([A-Z][^:]+:.*$)/gim, '<h4 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 mt-5">$1</h4>')
      
      // Handle bullet points that start with dashes or asterisks
      .replace(/^[-*]\s+(.*$)/gim, '<li class="mb-2 text-gray-900 dark:text-gray-300">$1</li>')
      
      // Handle quoted text (lines that start with quotes)
      .replace(/^"([^"]+)"$/gim, '<blockquote class="border-l-4 border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 pl-6 py-4 rounded-r my-6 text-lg italic text-gray-700 dark:text-gray-300">$1</blockquote>')
      
      // Handle specific patterns from content
      .replace(/^([A-Z][^.!?]*[.!?])\s*$/gm, '<p class="text-gray-900 dark:text-gray-300 leading-relaxed mb-4">$1</p>') // Paragraphs that end with punctuation
      .replace(/^([A-Z][^:]*:)\s*$/gm, '<h4 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 mt-5">$1</h4>') // Lines ending with colon
      .replace(/^(\d+\.\s+[A-Z][^:]*:)\s*$/gm, '<h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 mt-6">$1</h3>') // Numbered lines ending with colon
      
      // Line breaks and paragraphs
      .replace(/\n\n/g, '</p><p class="text-gray-900 dark:text-gray-300 leading-relaxed mb-4">')
      .replace(/\n/g, '<br>');
    
    // Wrap consecutive list items in proper list tags
    htmlContent = htmlContent
      .replace(/(<li class="mb-2 text-gray-900 dark:text-gray-300">.*?<\/li>(?:\s*<li class="mb-2 text-gray-900 dark:text-gray-300">.*?<\/li>)*)/g, (match) => {
        const hasNumbers = /^\d+\./.test(content);
        return hasNumbers ? `<ol class="list-decimal list-inside space-y-2 mb-6">${match}</ol>` : `<ul class="list-disc list-inside space-y-2 mb-6">${match}</ul>`;
      });
    
    // Wrap in paragraphs if not already wrapped
    if (!htmlContent.includes('<p class=') && !htmlContent.includes('<h1') && !htmlContent.includes('<h2') && !htmlContent.includes('<h3') && !htmlContent.includes('<h4')) {
      htmlContent = '<p class="text-gray-900 dark:text-gray-300 leading-relaxed mb-4">' + htmlContent + '</p>';
    }
  }

  return htmlContent;
};

export const sanitizeHtml = (html: string): string => {
  // Basic HTML sanitization - in a real app, you'd use DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframes
    .replace(/on\w+="[^"]*"/gi, ''); // Remove event handlers
};
