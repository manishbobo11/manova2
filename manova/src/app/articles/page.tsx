import { ArticleLink } from '../../components/ArticleLink';

export default function ArticlesPage() {
  // Example articles - in a real app, these would come from Firebase
  const exampleArticles = [
    {
      id: 'article-1',
      slug: 'mental-health-tips',
      title: '10 Essential Mental Health Tips for Daily Wellness',
      summary: 'Discover practical strategies to maintain your mental well-being every day.',
      author: 'Dr. Sarah Johnson'
    },
    {
      id: 'article-2', 
      slug: 'stress-management',
      title: 'Effective Stress Management Techniques',
      summary: 'Learn proven methods to reduce stress and improve your quality of life.',
      author: 'Dr. Michael Chen'
    }
  ];

  return (
    <main style={{ maxWidth: 800, margin: '3rem auto', padding: '0 1rem' }}>
      <h1>Articles</h1>
      <p>Explore our collection of wellness and mental health articles.</p>
      
      <div style={{ display: 'grid', gap: '2rem', marginTop: '2rem' }}>
        {exampleArticles.map((article) => (
          <ArticleLink key={article.id} slugOrId={article.slug || article.id}>
            <article style={{ 
              border: '1px solid #e5e7eb', 
              borderRadius: 8, 
              padding: '1.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              ':hover': {
                borderColor: '#3b82f6',
                transform: 'translateY(-2px)'
              }
            }}>
              <h2 style={{ marginBottom: '0.5rem', color: '#1f2937' }}>
                {article.title}
              </h2>
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                {article.summary}
              </p>
              {article.author && (
                <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                  By {article.author}
                </p>
              )}
            </article>
          </ArticleLink>
        ))}
      </div>
    </main>
  );
}
