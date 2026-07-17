# Portfolio Website

A modern, responsive portfolio website built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Dark/Light mode** toggle
- **Fully responsive** design
- **SEO optimized**
- **Accessible** components

## 📁 Project Structure

```
portfolio-website/
├── app/                    # Next.js App Router pages
│   ├── about/             # About page
│   ├── contact/           # Contact page
│   ├── projects/          # Projects page
│   ├── tech/              # Tech stack page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── navbar.tsx         # Navigation component
│   ├── footer.tsx         # Footer component
│   └── project-card.tsx   # Project card component
├── lib/                   # Utility libraries
│   └── theme-provider.tsx # Theme context provider
└── public/               # Static assets
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Icon library

### Featured Technologies (as showcased)
- **Jetpack Compose** - Modern Android UI toolkit
- **Firebase** - Backend-as-a-Service platform
- **Kotlin** - Programming language for Android
- **Firestore** - NoSQL document database
- **MongoDB** - Document database

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd portfolio-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🌐 Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy to Vercel**
   ```bash
   vercel
   ```

3. **Follow the prompts** to configure your deployment

### Alternative Deployment Options

#### Netlify
1. Build the project: `npm run build`
2. Deploy the `out` folder to Netlify

#### Traditional Hosting
1. Build the project: `npm run build`
2. Upload the generated files to your hosting provider

## 🎨 Customization

### Updating Content

1. **Personal Information**
   - Edit contact details in `app/contact/page.tsx`
   - Update social links in `components/footer.tsx`

2. **Projects**
   - Modify the projects array in `app/projects/page.tsx`
   - Add your own project images and descriptions

3. **Tech Stack**
   - Update technology categories in `app/tech/page.tsx`
   - Adjust skill levels and add new technologies

4. **About Page**
   - Customize your story in `app/about/page.tsx`
   - Update statistics and values

### Styling

1. **Colors**
   - Modify CSS variables in `app/globals.css`
   - Update Tailwind config in `tailwind.config.js`

2. **Typography**
   - Change fonts in `app/layout.tsx`
   - Adjust text styles throughout components

3. **Animations**
   - Customize Framer Motion animations in components
   - Add new animation variants as needed

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file for environment-specific variables:

```env
# Add your environment variables here
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### SEO Configuration
Update metadata in `app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  title: 'Your Name - Full Stack Developer',
  description: 'Your custom description',
  // ... other metadata
}
```

## 📱 Responsive Design

The portfolio is fully responsive and optimized for:
- **Desktop** (1024px+)
- **Tablet** (768px - 1023px)
- **Mobile** (320px - 767px)

## ♿ Accessibility

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast support

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**
   - Ensure all dependencies are installed
   - Check for TypeScript errors
   - Verify image paths and imports

2. **Styling Issues**
   - Clear browser cache
   - Check Tailwind CSS configuration
   - Verify CSS variable definitions

3. **Animation Problems**
   - Check Framer Motion version compatibility
   - Verify animation variants syntax

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For questions or support, please contact:
- Email: contact@example.com
- GitHub: [Your GitHub Profile]

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS

"# Portfolio" 
"# Portfolio" 
