# Leon's Art Gallery - Next.js + Supabase Setup

A modern Next.js 16 art gallery portfolio with Supabase backend integration, deployed on Vercel.

## 🚀 Features

- **Next.js 16 App Router** - Latest React and Next.js patterns
- **Supabase Integration** - Dynamic artwork management
- **Optimized Images** - Next.js Image component with responsive loading
- **Loading States** - Skeleton loaders with React Suspense
- **Error Handling** - Graceful error messages and retry logic
- **Responsive Design** - Mobile-first clean gallery design
- **TypeScript** - Fully typed for safety
- **Production Ready** - Optimized for Vercel deployment

## 📋 Prerequisites

- Node.js 18+ installed
- Supabase project created ([create one here](https://supabase.com))
- Vercel account for deployment ([sign up here](https://vercel.com))

## 🛠️ Installation & Setup

### 1. Clone and Install Dependencies

```bash
cd leonhong.art
npm install
```

### 2. Set Up Supabase Database

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Create a new table named **artworks** with these columns:

```sql
CREATE TABLE artworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  year INT,
  medium TEXT,
  size TEXT,
  description TEXT,
  image_url TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for sorting
CREATE INDEX idx_artworks_sort_order ON artworks(sort_order ASC);
```

Or use Supabase Studio:

| Column | Type | Settings |
|--------|------|----------|
| id | uuid | Primary key, default: `gen_random_uuid()` |
| title | text | Not null |
| year | int | - |
| medium | text | - |
| size | text | - |
| description | text | - |
| image_url | text | - |
| sort_order | int | Default: `0` |
| created_at | timestamptz | Default: `now()` |

### 3. Upload Images to Supabase Storage

1. In your Supabase project, go to **Storage**
2. Create a new bucket named **artworks**
3. Upload your artwork images
4. Update the `image_url` in your artworks records with the public URL from Supabase

Example image URL format:
```
https://YOUR_PROJECT_ID.supabase.co/storage/v1/object/public/artworks/image-name.jpg
```

### 4. Configure Environment Variables

Create a `.env.local` file (add to `.gitignore`) with your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

Get these values from:
- **Project URL**: Supabase Dashboard → Settings → API
- **Anon Key**: Supabase Dashboard → Settings → API → `anon` key

### 5. Run Locally

```bash
npm run dev
```

Visit `http://localhost:3000` to see your portfolio.

## 📁 Project Structure

```
app/
├── artworks/
│   ├── page.tsx          # Main artworks gallery page
│   └── loading.tsx       # Loading skeleton UI
├── page.tsx              # Home page with navigation
├── layout.tsx            # Root layout
└── globals.css          # Global styles

components/
├── ArtworkGrid.tsx       # Grid container component
└── ArtworkCard.tsx       # Individual artwork card

lib/
└── supabaseClient.ts     # Supabase client setup

styles/
├── home.module.css       # Home page styles
└── artworks.module.css   # Gallery page styles

public/
├── placeholder.png       # Fallback image
└── css/
    └── style.css         # Static site styles
```

## 🔧 API Structure

### Supabase Client (`lib/supabaseClient.ts`)

```typescript
import { supabase } from '@/lib/supabaseClient'

// Fetch all artworks ordered by sort_order
const { data, error } = await supabase
  .from('artworks')
  .select('*')
  .order('sort_order', { ascending: true })
```

### Artwork Type

```typescript
type Artwork = {
  id: string
  title: string
  year?: number
  medium?: string
  size?: string
  description?: string
  image_url?: string
  sort_order: number
  created_at: string
}
```

## 🎨 Key Components

### ArtworkGrid Component
- Client component that renders a responsive grid
- Uses CSS Grid with auto-fit for responsive columns
- Passes artworks to ArtworkCard components

### ArtworkCard Component
- Displays individual artwork with image
- Shows title, year, medium, size, and description
- Uses Next.js Image for optimized loading
- Responsive meta information display

### Artworks Page (Server Component)
- Server-side data fetching with async/await
- Error handling with try/catch
- Empty state messaging
- Metadata for SEO

## ⚡ Performance Features

1. **Server-Side Rendering** - Fetches data on server for better SEO
2. **Image Optimization** - Next.js Image component with:
   - Responsive sizing with `sizes` prop
   - WebP format support
   - Lazy loading for images below the fold
3. **Skeleton Loading** - Suspense boundary with loading.tsx
4. **CSS Modules** - Scoped styles prevent conflicts
5. **Font Optimization** - System fonts for faster load time

## 🚀 Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Add Supabase integration and artworks gallery"
git push origin main
```

### 2. Deploy on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Set Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click "Deploy"

### 3. Update Supabase CORS (if needed)

If you get CORS errors, update your Supabase project settings:

```
Project Settings → API → CORS Configuration
Add your Vercel domain:
https://your-domain.vercel.app
```

## 📝 Adding Artworks

### Via Supabase Studio (Easiest)

1. Go to Supabase Dashboard → Data
2. Click the `artworks` table
3. Click "+ Insert row"
4. Fill in the fields:
   - **title**: "My Artwork Title"
   - **year**: 2026
   - **medium**: "Oil on Canvas"
   - **size**: "100cm x 150cm"
   - **description**: "Artwork description..."
   - **image_url**: (URL from Supabase Storage)
   - **sort_order**: 0 (lower numbers appear first)

### Via SQL

```sql
INSERT INTO artworks (title, year, medium, size, description, image_url, sort_order)
VALUES (
  'Sunset Over Mountains',
  2026,
  'Oil Painting',
  '120x80cm',
  'A beautiful sunset landscape',
  'https://YOUR_PROJECT_ID.supabase.co/storage/v1/object/public/artworks/sunset.jpg',
  1
);
```

## 🐛 Troubleshooting

### Images Not Loading

1. Check the `image_url` is correct and public
2. Verify Supabase Storage bucket permissions are set to public
3. Check `next.config.js` includes Supabase domain in `remotePatterns`

### Supabase Connection Error

1. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
2. Check variables are in `.env.local` for local dev
3. Check Vercel Environment Variables for production
4. Ensure project is not in sleep mode (upgrade to prod if needed)

### Loading State Never Completes

- Check browser console for errors in Network tab
- Verify Supabase project is active
- Check for firewall/network issues

## 🔒 Security Notes

- **NEXT_PUBLIC_** variables are public (safe to expose)
- For admin operations, use Supabase service key in API routes (not in this setup)
- Consider implementing Row Level Security (RLS) for user-specific content
- Use environment variables for all sensitive data

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Image Component](https://nextjs.org/docs/app/api-reference/components/image)
- [Vercel Deployment](https://vercel.com/docs)

## 📄 License

Proprietary - Leon's Art Studio 2026

---

**Need help?** Check the component comments or review the TypeScript types for guidance.
