# Quick Reference Guide

## 🚀 Common Commands

```bash
# Development
npm run dev         # Start dev server (http://localhost:3000)

# Production
npm run build       # Create optimized production build
npm start          # Start production server

# Database
# Use Supabase Studio dashboard at https://app.supabase.com
```

## 🗄️ Adding Artworks to Supabase

### Via SQL (Fastest)

```sql
INSERT INTO artworks (title, year, medium, size, description, image_url, sort_order)
VALUES (
  'Sunset Over Mountains',
  2026,
  'Oil Painting',
  '120x80cm',
  'A beautiful sunset landscape painting',
  'https://YOUR_PROJECT_ID.supabase.co/storage/v1/object/public/artworks/sunset.jpg',
  1
);
```

### Via Supabase Studio (GUI)

1. Go to Supabase Dashboard
2. Click "Data" → "artworks" table
3. Click "+ Insert row"
4. Fill in the fields
5. Click "Save"

## 🖼️ Uploading Images to Supabase Storage

1. Go to Supabase Dashboard → "Storage"
2. Click on "artworks" bucket
3. Click "Upload file"
4. Select your image
5. Copy the public URL
6. Paste into artwork's `image_url` field

## 📝 Field Reference

| Field | Required | Example |
|-------|----------|---------|
| title | ✅ | "Sunset Landscape" |
| year | ❌ | 2026 |
| medium | ❌ | "Oil on Canvas" |
| size | ❌ | "100x150cm" |
| description | ❌ | "Beautiful sunset..." |
| image_url | ❌ | "https://..." |
| sort_order | ✅ | 1 |

## 🌐 Environment Variables

```env
# .env.local (never commit this)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx

# Vercel: Add these in Project Settings → Environment Variables
```

## 📱 Page URLs

| Page | URL |
|------|-----|
| Next.js Home | `/` |
| Artworks Gallery | `/artworks` |
| Static Home | `/index.html` |
| Static About | `/about.html` |
| Static Portfolio | `/portfolio.html` |

## 🎨 Component Structure

```
ArtworkGrid (client)
  └── ArtworkCard (client)
      └── Image (Next.js optimized)

ArtworksPage (server)
  ├── getArtworks() [server function]
  ├── Loading state
  └── Error handling
```

## 🔧 Supabase Client Usage

```typescript
import { supabase } from '@/lib/supabaseClient'

// Fetch data
const { data, error } = await supabase
  .from('artworks')
  .select('*')
  .order('sort_order', { ascending: true })

// With filtering
const { data } = await supabase
  .from('artworks')
  .select('*')
  .eq('year', 2026)
  .order('sort_order')
```

## 🚀 Deploying to Vercel

```bash
# Option 1: Using Vercel CLI
npm i -g vercel
vercel

# Option 2: GitHub integration
# 1. Push to GitHub
# 2. Go to vercel.com/new
# 3. Import repository
# 4. Add environment variables
# 5. Deploy
```

## 🐛 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Images not showing | Check image_url is valid, bucket is public |
| "Missing env variables" | Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY |
| CORS errors | Add your domain to Supabase CORS settings |
| No data loading | Check Supabase project is active (not sleeping) |
| Build fails | Run `npm install` and `npm run build` locally first |

## 📊 Supabase Dashboard

- **Data Editor**: https://app.supabase.com → Data
- **Storage**: https://app.supabase.com → Storage
- **API Settings**: https://app.supabase.com → Settings → API
- **Database**: https://app.supabase.com → SQL Editor

## 🔐 Security Checklist

- ✅ Never commit `.env.local` to Git
- ✅ Use NEXT_PUBLIC_* only for public variables
- ✅ Vercel env vars set separately from local .env.local
- ✅ Supabase anon key is public (Row Level Security for sensitive data)
- ✅ Image URLs from Supabase Storage need public permissions

## 🎯 Next Steps

1. Set up Supabase project
2. Create artworks table
3. Add NEXT_PUBLIC_* variables to Vercel & .env.local
4. Upload sample artwork and image
5. Test locally: `npm run dev`
6. Deploy to Vercel
7. Add more artworks via Supabase Studio

## 📞 Support

- **Next.js Issues**: https://github.com/vercel/next.js
- **Supabase Help**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
