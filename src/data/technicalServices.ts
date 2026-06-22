import { Code, Zap, Bot, MessageSquare } from 'lucide-react';

export interface TechnicalService {
  id: number;
  title: string;
  icon: any;
  description: string;
  features: string[];
  gradient: string;
}

export const technicalServices: TechnicalService[] = [
  {
    id: 1,
    title: 'Website Design',
    icon: Code,
    description: 'Custom website design and development tailored to your brand',
    features: ['Responsive Design', 'SEO Optimized', 'Fast Loading', 'Modern UI/UX'],
    gradient: 'from-blue-600 to-cyan-600',
  },
  {
    id: 2,
    title: 'Automation',
    icon: Zap,
    description: 'Automate your workflow and business processes',
    features: ['Process Automation', 'Time Saving', 'Error Reduction', 'Scalability'],
    gradient: 'from-yellow-600 to-orange-600',
  },
  {
    id: 3,
    title: 'AI Bot',
    icon: Bot,
    description: 'Intelligent chatbots powered by AI for customer support',
    features: ['24/7 Support', 'Smart Responses', 'Multi-language', 'Learning Enabled'],
    gradient: 'from-purple-600 to-pink-600',
  },
  {
    id: 4,
    title: 'Insta Auto Reply',
    icon: MessageSquare,
    description: 'Automated ImageIcon direct message responses',
    features: ['Instant Replies', 'Custom Messages', 'Lead Capture', 'Analytics'],
    gradient: 'from-pink-600 to-rose-600',
  },
];
