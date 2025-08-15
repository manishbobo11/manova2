# Articles Feature Implementation

This implementation provides a dynamic article system for the Manova Next.js application using Firebase Firestore.

## Files Created

### 1. Firebase Configuration
- `src/lib/firebase.ts` - Firebase client configuration for Next.js

### 2. Dynamic Article Route
- `src/app/articles/[slug]/page.tsx` - Dynamic route for individual articles
- `src/app/articles/page.tsx` - Articles index page with examples

### 3. Helper Component
- `src/components/ArticleLink.tsx` - Reusable link component for articles

## Features

### Dynamic Article Pages
- **URL Structure**: `/articles/[slug]` where `[slug]` can be either:
  - A custom slug (e.g., `mental-health-tips`)
  - A document ID (fallback)
- **Server-Side Rendering**: Articles are fetched on the server for better SEO
- **Metadata Generation**: Dynamic meta tags for each article
- **Error Handling**: Graceful handling of missing articles

### ArticleLink Component
- **Usage**: Wrap any content to make it link to an article
- **Props**:
  - `slugOrId`: The article slug or document ID
  - `children`: The content to be wrapped
  - `className`: Optional CSS classes

## Environment Variables

Add these to your `.env.local` file:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Usage Examples

### Using ArticleLink Component

```tsx
import { ArticleLink } from '../components/ArticleLink';

// In your component
<ArticleLink slugOrId="mental-health-tips">
  <div className="article-card">
    <h3>Mental Health Tips</h3>
    <p>Click to read more...</p>
  </div>
</ArticleLink>
```

### Article Data Structure

Articles in Firebase should have this structure:

```typescript
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
```

## Firebase Collection

Create a collection called `articles` in your Firestore database with documents containing the article data.

## Testing

1. Start the development server: `npm run dev`
2. Visit `/articles` to see the example articles
3. Click on any article to test the dynamic routing
4. Try accessing `/articles/mental-health-tips` directly

## SEO Benefits

- Server-side rendering for better search engine indexing
- Dynamic meta tags for each article
- Clean URLs with meaningful slugs
- Proper heading structure and semantic HTML
