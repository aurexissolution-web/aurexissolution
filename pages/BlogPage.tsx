import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/public/Header';
import Footer from '../components/public/Footer';
import { useAppContext } from '../hooks/useAppContext';
import { formatDate } from '../utils/formatters';
import { ArrowRight } from 'lucide-react';

const BlogPage: React.FC = () => {
  const { posts } = useAppContext();
  const publishedPosts = posts.filter(p => p.status === 'Published');

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="relative py-28 bg-surface text-center">
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          <div className="container mx-auto px-6 relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary animate-fade-in-down">Insights & Articles</h1>
            <p className="text-text-secondary mt-4 max-w-3xl mx-auto animate-fade-in-up">
              Explore the latest in technology, industry trends, and expert opinions from the Aurexis Solution team.
            </p>
            <div className="w-24 h-1 bg-primary mx-auto mt-6"></div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-6">
            {publishedPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {publishedPosts.map(post => (
                  <Link key={post.id} to={`/blog/${post.slug}`} className="block bg-surface/50 backdrop-blur-lg border border-neutral rounded-lg shadow-lg overflow-hidden group transition-transform duration-300 hover:-translate-y-2">
                    <div className="relative">
                      <img src={post.imageUrl || 'https://picsum.photos/seed/blog/600/400'} alt={post.title} className="w-full h-56 object-cover" />
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <p className="text-sm text-primary mb-2 font-semibold">{post.author}</p>
                      <h3 className="text-xl font-bold text-text-primary mb-3 group-hover:text-primary transition-colors">{post.title}</h3>
                      <p className="text-text-secondary text-sm flex-grow">{post.excerpt}</p>
                      <div className="mt-4 flex justify-between items-center">
                         <span className="text-xs text-text-secondary">{formatDate(post.publishedAt.toDate().toISOString().split('T')[0])}</span>
                         <span className="inline-flex items-center font-semibold text-primary">
                            Read More <ArrowRight size={16} className="ml-1" />
                         </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <h2 className="text-2xl font-bold text-text-primary">No articles published yet.</h2>
                <p className="text-text-secondary mt-2">Please check back later for updates and insights.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPage;
