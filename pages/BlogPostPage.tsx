import React from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import Header from '../components/public/Header';
import Footer from '../components/public/Footer';
import { useAppContext } from '../hooks/useAppContext';
import { formatDate } from '../utils/formatters';
import { formatBlogContent, sanitizeHtml } from '../utils/blogFormatter';
import { ArrowLeft, User, Calendar } from 'lucide-react';
import DOMPurify from 'dompurify';

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { posts } = useAppContext();
  const post = posts.find(p => p.slug === slug && p.status === 'Published');

  if (!post) {
    // This could also redirect to a 404 page in a more complex setup
    return <Navigate to="/blog" replace />;
  }

  // Format blog content using shared formatter
  const getHtmlContent = () => {
    if (!post.content) return { __html: '' };
    
    // Use shared formatter for consistent rendering
    const formattedContent = formatBlogContent(post.content);
    
    // Sanitize HTML content to prevent XSS vulnerabilities
    const sanitized = DOMPurify.sanitize(formattedContent, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'code', 'pre', 'blockquote', 'span', 'div'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel']
    });
    
    return { __html: sanitized };
  };

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <article className="py-20">
          <div className="container mx-auto px-6 max-w-4xl">
            {/* Back to Blog link */}
            <div className="mb-8">
              <Link to="/blog" className="inline-flex items-center text-primary hover:underline">
                <ArrowLeft size={18} className="mr-2" />
                Back to all articles
              </Link>
            </div>

            {/* Post Header */}
            <header className="mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-text-primary leading-tight mb-4">{post.title}</h1>
              <div className="flex items-center space-x-6 text-sm text-text-secondary">
                <div className="flex items-center">
                  <User size={14} className="mr-2" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center">
                  <Calendar size={14} className="mr-2" />
                  <time dateTime={post.publishedAt.toDate().toISOString()}>
                    {formatDate(post.publishedAt.toDate().toISOString().split('T')[0])}
                  </time>
                </div>
              </div>
            </header>
            
            {/* Featured Image */}
            <div className="mb-12">
                <img src={post.imageUrl || 'https://picsum.photos/seed/post/1200/600'} alt={post.title} className="w-full h-auto rounded-lg shadow-lg object-cover" />
            </div>

                {/* Post Content */}
                <div 
                    className="max-w-none leading-relaxed" 
                    dangerouslySetInnerHTML={getHtmlContent()}
                />
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPostPage;
