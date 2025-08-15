import { Metadata } from 'next';
import { db } from '../../../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, DocumentData } from 'firebase/firestore';

type Article = {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  author?: string;
  category?: string;
  createdAt?: string | number;
  slug?: string;
  coverImageUrl?: string;
};

type Props = {
  params: { slug: string };
};

// Generate metadata for the page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params.slug;
  
  // Try to fetch article data for metadata
  try {
    // 1) Try by slug
    const qBySlug = query(collection(db, 'articles'), where('slug', '==', slug));
    const snapBySlug = await getDocs(qBySlug);
    
    let article: Article | null = null;
    
    if (!snapBySlug.empty) {
      const docSnap = snapBySlug.docs[0];
      article = { id: docSnap.id, ...(docSnap.data() as DocumentData) };
    } else {
      // 2) Fallback: treat slug as doc id
      const byId = await getDoc(doc(db, 'articles', slug));
      if (byId.exists()) {
        article = { id: byId.id, ...(byId.data() as DocumentData) };
      }
    }
    
    if (article) {
      return {
        title: `${article.title} • Manova`,
        description: article.summary || `Read ${article.title} on Manova`,
      };
    }
  } catch (error) {
    console.error('Error fetching article for metadata:', error);
  }
  
  return {
    title: 'Article Not Found • Manova',
    description: 'The requested article could not be found.',
  };
}

export default async function ArticlePage({ params }: Props) {
  const slug = params.slug;
  
  let article: Article | null = null;
  
  try {
    // 1) Try by slug
    const qBySlug = query(collection(db, 'articles'), where('slug', '==', slug));
    const snapBySlug = await getDocs(qBySlug);

    if (!snapBySlug.empty) {
      const docSnap = snapBySlug.docs[0];
      article = { id: docSnap.id, ...(docSnap.data() as DocumentData) };
    } else {
      // 2) Fallback: treat slug as doc id
      const byId = await getDoc(doc(db, 'articles', slug));
      if (byId.exists()) {
        article = { id: byId.id, ...(byId.data() as DocumentData) };
      }
    }
  } catch (error) {
    console.error('Error fetching article:', error);
  }

  if (!article) {
    return (
      <main style={{ maxWidth: 800, margin: '4rem auto', padding: '0 1rem' }}>
        <h1>Article not found</h1>
        <p>We couldn't find an article for "{slug}".</p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 900, margin: '3rem auto', padding: '0 1rem' }}>
      {article.coverImageUrl && (
        <img
          src={article.coverImageUrl}
          alt={article.title}
          style={{ width: '100%', borderRadius: 12, marginBottom: 24 }}
        />
      )}
      <h1 style={{ marginBottom: 8 }}>{article.title}</h1>
      {article.author && <p style={{ opacity: 0.7, marginBottom: 24 }}>By {article.author}</p>}
      {article.content ? (
        <article
          style={{ lineHeight: 1.7 }}
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      ) : (
        <p>No content provided.</p>
      )}
    </main>
  );
}
