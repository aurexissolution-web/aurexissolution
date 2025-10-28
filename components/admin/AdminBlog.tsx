import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import type { Post } from '../../types';
import { Plus, Edit, Trash2, Sparkles, Eye, EyeOff } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import { formatBlogContent } from '../../utils/blogFormatter';
import RichTextEditor from './RichTextEditor';

const getStatusColor = (status: Post['status']) => {
    switch (status) {
        case 'Published': return 'bg-green-100 text-green-800';
        case 'Draft': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const AdminBlog: React.FC = () => {
    const { posts, addPost, updatePost, deletePost, generateBlogPostFromPrompt } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPost, setCurrentPost] = useState<Post | Omit<Post, 'id' | 'createdAt'> | null>(null);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiError, setAiError] = useState('');
    const [showPreview, setShowPreview] = useState(false);

    const createSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric with -
            .replace(/^-+|-+$/g, ''); // remove leading/trailing hyphens
    };

    const openModal = (post: Post | null = null) => {
        const newPostTemplate = {
            title: '',
            slug: '',
            content: '',
            excerpt: '',
            imageUrl: `https://picsum.photos/seed/${Date.now()}/600/400`,
            author: 'Aurexis Solution',
            status: 'Draft' as Post['status'],
        };
        setCurrentPost(post ? { ...post } : newPostTemplate);
        setIsModalOpen(true);
        setAiPrompt('');
        setAiError('');
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentPost(null);
    };

    const handleSave = () => {
        if (!currentPost) return;

        // Ensure slug is set, create from title if empty
        const postToSave = { ...currentPost };
        if (!postToSave.slug && postToSave.title) {
            postToSave.slug = createSlug(postToSave.title);
        }

        if ('id' in postToSave) {
            updatePost(postToSave as Post);
        } else {
            addPost(postToSave as Omit<Post, 'id' | 'createdAt'>);
        }
        closeModal();
    };
    
    const handleGenerateContent = async () => {
        if (!aiPrompt.trim() || !currentPost) return;
        setIsGenerating(true);
        setAiError('');
        
        try {
            const generatedContent = await generateBlogPostFromPrompt(aiPrompt);
            
            if (generatedContent) {
                setCurrentPost({
                    ...currentPost,
                    title: generatedContent.title || currentPost.title,
                    content: generatedContent.content || currentPost.content,
                    excerpt: generatedContent.excerpt || currentPost.excerpt,
                    slug: generatedContent.title ? createSlug(generatedContent.title) : currentPost.slug,
                });
                setAiError('');
            } else {
                setAiError('⚠️ AI content generation failed. Please check:\n1. API keys are configured in Admin Panel > AI Settings\n2. You have sufficient API credits\n3. Your internet connection is stable');
            }
        } catch (error: any) {
            console.error('AI generation error:', error);
            if (error.message?.includes('API keys')) {
                setAiError('❌ AI API keys not configured. Please go to Admin Panel > AI Settings and add your Perplexity or Gemini API key.');
            } else {
                setAiError(`❌ Failed to generate content: ${error.message || 'Please try again.'}`);
            }
        } finally {
            setIsGenerating(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        if (!currentPost) return;
        const { name, value } = e.target;
        
        let newSlug = currentPost.slug;
        if (name === 'title') {
            newSlug = createSlug(value);
        }

        setCurrentPost({ ...currentPost, [name]: value, slug: newSlug });
    };

    const createTestPost = () => {
        const testPost = {
            title: 'Test HTML Blog Post',
            slug: 'test-html-blog-post',
            content: `# Welcome to Our Test Blog Post

This is a **test blog post** to verify that HTML content is rendering correctly on the website.

## Key Features

Here are some important features:

- **HTML Support:** Direct HTML rendering
- *Rich Formatting:* Bold, italic, and other text styles
- Proper Structure: Headings, paragraphs, and lists

## Code Example

Here's a simple code example:

\`\`\`
console.log('Hello, World!');
\`\`\`

### Conclusion

This test post should display with proper **HTML formatting** and *styling* on the published website.

> "This is a beautiful blockquote that should stand out from the rest of the content."

1. First numbered item
2. Second numbered item
3. Third numbered item`,
            excerpt: 'A test blog post to verify HTML rendering works correctly.',
            imageUrl: 'https://picsum.photos/1200/600',
            author: 'Test Author',
            status: 'Published' as const,
            publishedAt: new Date()
        };
        
        setCurrentPost(testPost);
        setIsModalOpen(true);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-neutral">Manage Blog Posts</h2>
                <div className="flex gap-2">
                    <button onClick={createTestPost} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center">
                        <Sparkles size={18} className="mr-2" /> Test HTML Post
                    </button>
                    <button onClick={() => openModal()} className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg flex items-center">
                        <Plus size={18} className="mr-2" /> Add Post
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md">
                <table className="w-full">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left p-3">Title</th>
                            <th className="text-left p-3">Author</th>
                            <th className="text-left p-3">Date Created</th>
                            <th className="text-left p-3">Status</th>
                            <th className="text-right p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.map(post => (
                            <tr key={post.id} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-medium">{post.title}</td>
                                <td className="p-3 text-neutral-light">{post.author}</td>
                                <td className="p-3 text-neutral-light">{post.createdAt ? formatDate(post.createdAt.toDate().toISOString().split('T')[0]) : 'N/A'}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(post.status)}`}>
                                        {post.status}
                                    </span>
                                </td>
                                <td className="p-3 text-right">
                                    <button onClick={() => openModal(post)} className="text-blue-600 hover:text-blue-800 p-2"><Edit size={18} /></button>
                                    <button onClick={() => deletePost(post.id)} className="text-red-600 hover:text-red-800 p-2"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && currentPost && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-6">{'id' in currentPost ? 'Edit' : 'Add'} Post</h3>

                        <div className="mb-6 p-4 border border-primary/20 rounded-lg bg-primary/5">
                            <label className="flex items-center text-md font-semibold text-text-primary mb-2"><Sparkles className="w-5 h-5 mr-2 text-primary" />Generate Content with AI</label>
                            <p className="text-sm text-text-secondary mb-3">Provide a topic for the blog post, e.g., "The top 5 cybersecurity trends in 2024".</p>
                            <textarea 
                                value={aiPrompt} 
                                onChange={(e) => setAiPrompt(e.target.value)} 
                                placeholder="Enter a detailed prompt for AI blog generation. Example: 'Write a comprehensive blog post about the top 5 AI tools for 2025, including detailed explanations, use cases, and future predictions. Make it engaging and informative with proper headings, bullet points, and examples.'" 
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent mb-3" 
                                rows={4} 
                                disabled={isGenerating}
                            />
                            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg mb-3">
                                <strong>💡 Pro Tips for Better AI Generation:</strong>
                                <ul className="mt-2 space-y-1">
                                    <li>• Be specific about the topic and target audience</li>
                                    <li>• Request specific sections (introduction, main points, conclusion)</li>
                                    <li>• Ask for examples, case studies, or use cases</li>
                                    <li>• Specify the tone (professional, casual, technical)</li>
                                    <li>• Request bullet points, numbered lists, or blockquotes</li>
                                    <li>• <strong>NEW:</strong> AI now generates clean HTML with proper formatting</li>
                                    <li>• <strong>NEW:</strong> Content will display perfectly on your website</li>
                                </ul>
                            </div>
                             <button type="button" onClick={handleGenerateContent} disabled={isGenerating || !aiPrompt.trim()} className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg flex items-center transition-opacity disabled:opacity-50">
                                {isGenerating ? 'Generating...' : 'Generate with AI'}
                            </button>
                            {aiError && (
                                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-600 text-sm whitespace-pre-line">{aiError}</p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-light mb-1">Title</label>
                                    <input name="title" value={currentPost.title} onChange={handleChange} className="w-full p-2 border rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-light mb-1">Slug (auto-generated)</label>
                                    <input name="slug" value={currentPost.slug} onChange={handleChange} className="w-full p-2 border rounded-md bg-gray-100" />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-neutral-light">Content</label>
                                    <button
                                        type="button"
                                        onClick={() => setShowPreview(!showPreview)}
                                        className="flex items-center text-sm text-primary hover:text-primary-dark"
                                    >
                                        {showPreview ? <EyeOff size={16} className="mr-1" /> : <Eye size={16} className="mr-1" />}
                                        {showPreview ? 'Edit' : 'Preview'}
                                    </button>
                                </div>
                                
                                    {showPreview ? (
                                        <div className="border border-gray-300 rounded-lg p-4 bg-white min-h-[300px] max-w-none leading-relaxed">
                                            <div dangerouslySetInnerHTML={{ 
                                                __html: formatBlogContent(currentPost.content || '')
                                            }} />
                                        </div>
                                    ) : (
                                    <RichTextEditor
                                        value={currentPost.content}
                                        onChange={(content) => setCurrentPost({ ...currentPost, content })}
                                        placeholder="Start writing your blog post..."
                                        className="w-full"
                                    />
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-light mb-1">Excerpt</label>
                                <textarea name="excerpt" value={currentPost.excerpt} onChange={handleChange} className="w-full p-2 border rounded-md" rows={3}></textarea>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-light mb-1">Image URL</label>
                                    <input name="imageUrl" value={currentPost.imageUrl} onChange={handleChange} className="w-full p-2 border rounded-md" />
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-neutral-light mb-1">Author</label>
                                    <input name="author" value={currentPost.author} onChange={handleChange} className="w-full p-2 border rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-light mb-1">Status</label>
                                    <select name="status" value={currentPost.status} onChange={handleChange} className="w-full p-2 border rounded-md">
                                        <option>Draft</option>
                                        <option>Published</option>
                                    </select>
                                </div>
                             </div>
                        </div>

                        <div className="mt-8 flex justify-end space-x-3 border-t pt-4">
                            <button onClick={closeModal} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
                            <button onClick={handleSave} className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg">Save Post</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBlog;
