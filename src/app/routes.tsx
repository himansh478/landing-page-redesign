import { createBrowserRouter } from 'react-router';
import { lazy, Suspense } from 'react';

// lazy loaded pages - only downloads when user visits that route
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const MasterfulEditingPage = lazy(() => import('./pages/MasterfulEditingPage').then(m => ({ default: m.MasterfulEditingPage })));
const ThemeBasedPage = lazy(() => import('./pages/ThemeBasedPage').then(m => ({ default: m.ThemeBasedPage })));
const ProfessionalShootPage = lazy(() => import('./pages/ProfessionalShootPage').then(m => ({ default: m.ProfessionalShootPage })));
const VlogEditPortfolioPage = lazy(() => import('./pages/VlogEditPortfolioPage').then(m => ({ default: m.VlogEditPortfolioPage })));
const CorporateShootPortfolioPage = lazy(() => import('./pages/CorporateShootPortfolioPage').then(m => ({ default: m.CorporateShootPortfolioPage })));
const DocumentaryPortfolioPage = lazy(() => import('./pages/DocumentaryPortfolioPage').then(m => ({ default: m.DocumentaryPortfolioPage })));
const ReelPortfolioPage = lazy(() => import('./pages/ReelPortfolioPage').then(m => ({ default: m.ReelPortfolioPage })));
const AIEditPortfolioPage = lazy(() => import('./pages/AIEditPortfolioPage').then(m => ({ default: m.AIEditPortfolioPage })));
const WeddingPortfolioPage = lazy(() => import('./pages/WeddingPortfolioPage').then(m => ({ default: m.WeddingPortfolioPage })));
const SocialMediaManagementPage = lazy(() => import('./pages/SocialMediaManagementPage').then(m => ({ default: m.SocialMediaManagementPage })));
const TechnicalSolutionsPage = lazy(() => import('./pages/TechnicalSolutionsPage').then(m => ({ default: m.TechnicalSolutionsPage })));
const PackagesPage = lazy(() => import('./pages/PackagesPage').then(m => ({ default: m.PackagesPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const AiPhotoSharingPage = lazy(() => import('./pages/AiPhotoSharingPage').then(m => ({ default: m.AiPhotoSharingPage })));
const AboutUsPage = lazy(() => import('./pages/AboutUsPage').then(m => ({ default: m.AboutUsPage })));
const ContactUsPage = lazy(() => import('./pages/ContactUsPage').then(m => ({ default: m.ContactUsPage })));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })));
const TermsConditionsPage = lazy(() => import('./pages/TermsConditionsPage').then(m => ({ default: m.TermsConditionsPage })));
const BlogPage = lazy(() => import('./pages/BlogPage').then(m => ({ default: m.BlogPage })));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage').then(m => ({ default: m.BlogPostPage })));
const CommercialPortfolioPage = lazy(() => import('./pages/CommercialPortfolioPage').then(m => ({ default: m.CommercialPortfolioPage })));
const MarketingPortfolioPage = lazy(() => import('./pages/MarketingPortfolioPage').then(m => ({ default: m.MarketingPortfolioPage })));
const ReligiousPortfolioPage = lazy(() => import('./pages/ReligiousPortfolioPage').then(m => ({ default: m.ReligiousPortfolioPage })));
const PoliticalPortfolioPage = lazy(() => import('./pages/PoliticalPortfolioPage').then(m => ({ default: m.PoliticalPortfolioPage })));
const CinematicPortfolioPage = lazy(() => import('./pages/CinematicPortfolioPage').then(m => ({ default: m.CinematicPortfolioPage })));
const SocialVideoPortfolioPage = lazy(() => import('./pages/SocialVideoPortfolioPage').then(m => ({ default: m.SocialVideoPortfolioPage })));

// loading spinner while page chunk downloads
function PageLoader() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-slate-400 font-medium text-sm">Loading...</p>
      </div>
    </div>
  );
}

function withSuspense(Component: React.ComponentType) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  { path: '/', element: withSuspense(HomePage) },
  { path: '/masterful-editing', element: withSuspense(MasterfulEditingPage) },
  { path: '/theme-based', element: withSuspense(ThemeBasedPage) },
  { path: '/professional-shoots', element: withSuspense(ProfessionalShootPage) },
  { path: '/vlog-edit-portfolio', element: withSuspense(VlogEditPortfolioPage) },
  { path: '/corporate-shoot-portfolio', element: withSuspense(CorporateShootPortfolioPage) },
  { path: '/documentary-portfolio', element: withSuspense(DocumentaryPortfolioPage) },
  { path: '/reel-portfolio', element: withSuspense(ReelPortfolioPage) },
  { path: '/ai-edit-portfolio', element: withSuspense(AIEditPortfolioPage) },
  { path: '/wedding-portfolio', element: withSuspense(WeddingPortfolioPage) },
  { path: '/social-media-management', element: withSuspense(SocialMediaManagementPage) },
  { path: '/technical-solutions', element: withSuspense(TechnicalSolutionsPage) },
  { path: '/packages', element: withSuspense(PackagesPage) },
  { path: '/ai-photo-sharing', element: withSuspense(AiPhotoSharingPage) },
  { path: '/about-us', element: withSuspense(AboutUsPage) },
  { path: '/contact-us', element: withSuspense(ContactUsPage) },
  { path: '/privacy-policy', element: withSuspense(PrivacyPolicyPage) },
  { path: '/terms-conditions', element: withSuspense(TermsConditionsPage) },
  { path: '/blog', element: withSuspense(BlogPage) },
  { path: '/blog/:slug', element: withSuspense(BlogPostPage) },
  { path: '/commercial-portfolio', element: withSuspense(CommercialPortfolioPage) },
  { path: '/marketing-portfolio', element: withSuspense(MarketingPortfolioPage) },
  { path: '/religious-portfolio', element: withSuspense(ReligiousPortfolioPage) },
  { path: '/political-portfolio', element: withSuspense(PoliticalPortfolioPage) },
  { path: '/cinematic-portfolio', element: withSuspense(CinematicPortfolioPage) },
  { path: '/social-video-portfolio', element: withSuspense(SocialVideoPortfolioPage) },
  { path: '*', element: withSuspense(NotFoundPage) },
]);
