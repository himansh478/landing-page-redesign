import { createBrowserRouter } from 'react-router';
import { HomePage } from './pages/HomePage';
import { MasterfulEditingPage } from './pages/MasterfulEditingPage';
import { TheamBasedPage } from './pages/TheamBasedPage';
import { ProfessionalShootPage } from './pages/ProfessionalShootPage';
import { VlogEditPortfolioPage } from './pages/VlogEditPortfolioPage';
import { CorporateShootPortfolioPage } from './pages/CorporateShootPortfolioPage';
import { DocumentaryPortfolioPage } from './pages/DocumentaryPortfolioPage';
import { ReelPortfolioPage } from './pages/ReelPortfolioPage';
import { AIEditPortfolioPage } from './pages/AIEditPortfolioPage';
import { WeddingPortfolioPage } from './pages/WeddingPortfolioPage';
import { SocialMediaManagementPage } from './pages/SocialMediaManagementPage';
import { TechnicalSolutionsPage } from './pages/TechnicalSolutionsPage';
import { PackagesPage } from './pages/PackagesPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AiPhotoSharingPage } from './pages/AiPhotoSharingPage';
import { AboutUsPage } from './pages/AboutUsPage';
import { ContactUsPage } from './pages/ContactUsPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsConditionsPage } from './pages/TermsConditionsPage';
import { BlogPage } from './pages/BlogPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { CommercialPortfolioPage } from './pages/CommercialPortfolioPage';
import { MarketingPortfolioPage } from './pages/MarketingPortfolioPage';
import { ReligiousPortfolioPage } from './pages/ReligiousPortfolioPage';
import { PoliticalPortfolioPage } from './pages/PoliticalPortfolioPage';
import { CinematicPortfolioPage } from './pages/CinematicPortfolioPage';
import { SocialVideoPortfolioPage } from './pages/SocialVideoPortfolioPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: HomePage,
  },
  {
    path: '/masterful-editing',
    Component: MasterfulEditingPage,
  },
  {
    path: '/theam-based',
    Component: TheamBasedPage,
  },
  {
    path: '/professional-shoots',
    Component: ProfessionalShootPage,
  },
  {
    path: '/vlog-edit-portfolio',
    Component: VlogEditPortfolioPage,
  },
  {
    path: '/corporate-shoot-portfolio',
    Component: CorporateShootPortfolioPage,
  },
  {
    path: '/documentary-portfolio',
    Component: DocumentaryPortfolioPage,
  },
  {
    path: '/reel-portfolio',
    Component: ReelPortfolioPage,
  },
  {
    path: '/ai-edit-portfolio',
    Component: AIEditPortfolioPage,
  },
  {
    path: '/wedding-portfolio',
    Component: WeddingPortfolioPage,
  },
  {
    path: '/social-media-management',
    Component: SocialMediaManagementPage,
  },
  {
    path: '/technical-solutions',
    Component: TechnicalSolutionsPage,
  },
  {
    path: '/packages',
    Component: PackagesPage,
  },
  {
    path: '/ai-photo-sharing',
    Component: AiPhotoSharingPage,
  },
  {
    path: '/about-us',
    Component: AboutUsPage,
  },
  {
    path: '/contact-us',
    Component: ContactUsPage,
  },
  {
    path: '/privacy-policy',
    Component: PrivacyPolicyPage,
  },
  {
    path: '/terms-conditions',
    Component: TermsConditionsPage,
  },
  {
    path: '/blog',
    Component: BlogPage,
  },
  {
    path: '/blog/:slug',
    Component: BlogPostPage,
  },
  {
    path: '/commercial-portfolio',
    Component: CommercialPortfolioPage,
  },
  {
    path: '/marketing-portfolio',
    Component: MarketingPortfolioPage,
  },
  {
    path: '/religious-portfolio',
    Component: ReligiousPortfolioPage,
  },
  {
    path: '/political-portfolio',
    Component: PoliticalPortfolioPage,
  },
  {
    path: '/cinematic-portfolio',
    Component: CinematicPortfolioPage,
  },
  {
    path: '/social-video-portfolio',
    Component: SocialVideoPortfolioPage,
  },
  {
    path: '*',
    Component: NotFoundPage,
  },
]);
