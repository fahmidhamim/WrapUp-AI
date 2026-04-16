import { BookOpen, Newspaper, TrendingUp, Lightbulb, Mic, Brain, Shield, Zap } from "lucide-react";

import blogMeetingAi from "@/assets/blog/blog-meeting-ai.jpg";
import blogAiInnovation from "@/assets/blog/blog-ai-innovation.jpg";
import blogCaseStudy from "@/assets/blog/blog-case-study.jpg";
import blogProductivity from "@/assets/blog/blog-productivity.jpg";
import blogCollaboration from "@/assets/blog/blog-collaboration.jpg";
import blogProductUpdate from "@/assets/blog/blog-product-update.jpg";
import blogRemoteWork from "@/assets/blog/blog-remote-work.jpg";
import blogEnterprise from "@/assets/blog/blog-enterprise.jpg";
import blogAnalytics from "@/assets/blog/blog-analytics.jpg";
import blogHybridMeeting from "@/assets/blog/blog-hybrid-meeting.jpg";
import blogAgenda from "@/assets/blog/blog-agenda.jpg";
import blogFinserv from "@/assets/blog/blog-finserv.jpg";
import blogLaunch from "@/assets/blog/blog-launch.jpg";
import blogCost from "@/assets/blog/blog-cost.jpg";
import blogEdgeComputing from "@/assets/blog/blog-edge-computing.jpg";
import blogZeroKnowledge from "@/assets/blog/blog-zero-knowledge.jpg";
import blogAsync from "@/assets/blog/blog-async.jpg";
import blogNlp from "@/assets/blog/blog-nlp.jpg";
import blogVocabulary from "@/assets/blog/blog-vocabulary.jpg";
import blogFutureWork from "@/assets/blog/blog-future-work.jpg";
import blogNlpContext from "@/assets/blog/blog-nlp-context.jpg";
import blogPrivacyVault from "@/assets/blog/blog-privacy-vault.jpg";
import blogFutureWorkplace from "@/assets/blog/blog-future-workplace.jpg";
import blogAudioEdge from "@/assets/blog/blog-audio-edge.jpg";
import blogVideoConf from "@/assets/blog/blog-video-conf.jpg";
import blogAiCollab from "@/assets/blog/blog-ai-collab.jpg";
import blogDashboardInsights from "@/assets/blog/blog-dashboard-insights.jpg";
import blogGlobalTeams from "@/assets/blog/blog-global-teams.jpg";
import blogFocusTime from "@/assets/blog/blog-focus-time.jpg";
import blogSpeechText from "@/assets/blog/blog-speech-text.jpg";
import blogHealthcare from "@/assets/blog/blog-healthcare.jpg";
import blogIntegrations from "@/assets/blog/blog-integrations.jpg";
import blogEducation from "@/assets/blog/blog-education.jpg";
import blogStartupGrowth from "@/assets/blog/blog-startup-growth.jpg";


export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  featured?: boolean;
  gradient?: string;
  headlineOnly?: boolean;
  image?: string;
}

export interface BlogCategory {
  icon: React.ElementType;
  label: string;
  description: string;
  slug: string;
}

export const blogCategories: BlogCategory[] = [
  { icon: BookOpen, label: "All Posts", description: "Browse our complete library", slug: "all" },
  { icon: Newspaper, label: "Product Updates", description: "Latest feature releases", slug: "product-updates" },
  { icon: TrendingUp, label: "Industry Trends", description: "Meeting productivity insights", slug: "industry-trends" },
  { icon: Lightbulb, label: "Tips & Tricks", description: "Get more from WrapUp", slug: "tips-tricks" },
  { icon: Mic, label: "Case Studies", description: "Real customer stories", slug: "case-studies" },
  { icon: Brain, label: "AI & Innovation", description: "Behind the technology", slug: "ai-innovation" },
  { icon: Shield, label: "Security & Privacy", description: "Enterprise trust & compliance", slug: "security-privacy" },
  { icon: Zap, label: "Engineering", description: "Deep dives into our stack", slug: "engineering" },
];

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "WrapUp: Revolutionizing Meeting Intelligence with AI",
    excerpt: "In today's fast-paced business world, meetings are essential but often inefficient. Traditional note-taking is slow and error-prone. WrapUp uses cutting-edge AI to transform how teams capture, organize, and act on meeting insights.",
    category: "product-updates",
    date: "Feb 10, 2026",
    readTime: "5 min read",
    featured: true,
    image: blogMeetingAi,
  },
  {
    id: "2",
    title: "Simple. Fast. Secure.",
    excerpt: "The world of meeting productivity is evolving fast, and AI is leading the charge. Traditional tools fall short when it comes to real-time transcription and intelligent summarization. Here's how WrapUp is changing the game.",
    category: "ai-innovation",
    date: "Feb 8, 2026",
    readTime: "4 min read",
    featured: true,
    image: blogAiInnovation,
  },
  {
    id: "3",
    title: "How Acme Corp Reduced Meeting Follow-ups by 90%",
    excerpt: "Acme Corp's engineering team was drowning in meeting overhead. With WrapUp, they automated summaries, action items, and follow-ups — saving 12 hours per team member every month.",
    category: "case-studies",
    date: "Feb 5, 2026",
    readTime: "7 min read",
    image: blogCaseStudy,
  },
  {
    id: "4",
    title: "5 Tips for Running Highly Productive Remote Meetings",
    excerpt: "Remote meetings don't have to be painful. From structured agendas to AI-assisted note-taking, here are five proven strategies to make every virtual meeting count.",
    category: "tips-tricks",
    date: "Feb 3, 2026",
    readTime: "4 min read",
    image: blogProductivity,
  },
  {
    id: "5",
    title: "The Rise of AI Meeting Assistants: 2026 Industry Report",
    excerpt: "Our latest research shows that 78% of enterprises plan to adopt AI meeting assistants by the end of 2026. We break down the trends, challenges, and opportunities shaping this fast-growing market.",
    category: "industry-trends",
    date: "Jan 30, 2026",
    readTime: "8 min read",
    image: blogCollaboration,
  },
  {
    id: "6",
    title: "Introducing Real-Time Translation in WrapUp",
    excerpt: "WrapUp now supports live translation across 40+ languages during meetings. Break down language barriers and collaborate with global teams effortlessly.",
    category: "product-updates",
    date: "Jan 28, 2026",
    readTime: "3 min read",
    image: blogProductUpdate,
  },
  {
    id: "7",
    title: "End-to-End Encryption: How WrapUp Keeps Your Data Safe",
    excerpt: "Security isn't optional — it's foundational. Learn about WrapUp's multi-layered encryption architecture, SOC 2 compliance, and zero-trust approach to meeting data.",
    category: "security-privacy",
    date: "Jan 25, 2026",
    readTime: "6 min read",
    image: blogEnterprise,
  },
  {
    id: "8",
    title: "Building WrapUp's Real-Time Transcription Engine",
    excerpt: "A deep dive into the engineering challenges behind sub-200ms transcription latency, custom speech models, and how we handle noisy audio in real-world environments.",
    category: "engineering",
    date: "Jan 22, 2026",
    readTime: "10 min read",
    image: blogRemoteWork,
  },
  {
    id: "9",
    title: "How AI Summaries Actually Work Under the Hood",
    excerpt: "We pull back the curtain on WrapUp's summarization pipeline — from raw transcript to structured action items. Includes our approach to hallucination prevention and factual grounding.",
    category: "ai-innovation",
    date: "Jan 18, 2026",
    readTime: "7 min read",
    image: blogNlp,
  },
  {
    id: "10",
    title: "Why Your Team Needs a Meeting Intelligence Platform",
    excerpt: "Meetings consume 15% of an organization's time. Without proper tooling, critical decisions fall through the cracks. Here's the business case for meeting intelligence.",
    category: "industry-trends",
    date: "Jan 15, 2026",
    readTime: "5 min read",
    image: blogAnalytics,
  },
  {
    id: "11",
    title: "From Startup to Enterprise: Scaling WrapUp's Infrastructure",
    excerpt: "How we scaled from 100 to 100,000 concurrent meetings without sacrificing latency. A look at our Kubernetes architecture, edge computing strategy, and database sharding approach.",
    category: "engineering",
    date: "Jan 12, 2026",
    readTime: "9 min read",
    image: blogEdgeComputing,
  },
  {
    id: "12",
    title: "GDPR, HIPAA, and Beyond: WrapUp's Compliance Journey",
    excerpt: "Navigating the complex landscape of data privacy regulations across 30+ countries. How we built a compliance-first culture and what it means for our customers.",
    category: "security-privacy",
    date: "Jan 8, 2026",
    readTime: "6 min read",
    image: blogZeroKnowledge,
  },
  {
    id: "13",
    title: "How to Write Better Meeting Agendas with AI",
    excerpt: "A well-structured agenda is the foundation of a productive meeting. Learn how WrapUp's AI can help you craft focused agendas that keep discussions on track and outcomes clear.",
    category: "tips-tricks",
    date: "Jan 5, 2026",
    readTime: "4 min read",
    image: blogAgenda,
  },
  {
    id: "14",
    title: "WrapUp vs. Traditional Note-Taking: A Data-Driven Comparison",
    excerpt: "We analyzed 50,000 meetings to compare AI-generated summaries against manual notes. The results reveal striking differences in accuracy, completeness, and time savings.",
    category: "ai-innovation",
    date: "Jan 2, 2026",
    readTime: "6 min read",
    image: blogHybridMeeting,
  },
  {
    id: "15",
    title: "How FinServ Global Achieved 100% Meeting Compliance",
    excerpt: "In the heavily regulated financial services industry, every meeting must be documented. FinServ Global turned to WrapUp to automate compliance-grade records across 5,000+ weekly meetings.",
    category: "case-studies",
    date: "Dec 28, 2025",
    readTime: "8 min read",
    image: blogFinserv,
  },
  {
    id: "16",
    title: "Announcing WrapUp 3.0: The Biggest Update Yet",
    excerpt: "WrapUp 3.0 brings a redesigned dashboard, multi-meeting analytics, custom AI models, and Slack/Teams deep integrations. Here's everything you need to know about the release.",
    category: "product-updates",
    date: "Dec 22, 2025",
    readTime: "5 min read",
    featured: true,
    image: blogLaunch,
  },
  {
    id: "17",
    title: "The Hidden Cost of Unproductive Meetings",
    excerpt: "Research shows the average enterprise wastes $25,000 per employee annually on poorly run meetings. We break down where the money goes and how AI meeting tools deliver measurable ROI.",
    category: "industry-trends",
    date: "Dec 18, 2025",
    readTime: "7 min read",
    image: blogCost,
  },
  {
    id: "18",
    title: "Optimizing Audio Processing at the Edge",
    excerpt: "How we moved audio processing closer to users with edge computing, reducing latency by 60% and improving transcription accuracy in low-bandwidth environments.",
    category: "engineering",
    date: "Dec 15, 2025",
    readTime: "11 min read",
    image: blogAudioEdge,
  },
  {
    id: "19",
    title: "10 Meeting Etiquette Rules for Hybrid Teams",
    excerpt: "Hybrid meetings have unique challenges. From camera-on policies to inclusive facilitation techniques, here are 10 rules that top-performing hybrid teams swear by.",
    category: "tips-tricks",
    date: "Dec 12, 2025",
    readTime: "5 min read",
    image: blogAsync,
  },
  {
    id: "20",
    title: "Zero-Knowledge Architecture: WrapUp's Privacy-First Approach",
    excerpt: "We explain our zero-knowledge encryption model where even WrapUp engineers cannot access your meeting data. A technical deep dive into our privacy-first architecture.",
    category: "security-privacy",
    date: "Dec 8, 2025",
    readTime: "8 min read",
    image: blogPrivacyVault,
  },
  {
    id: "21",
    title: "NovaTech's Journey to Async-First Culture with WrapUp",
    excerpt: "NovaTech eliminated 40% of their recurring meetings by enabling async catch-ups through WrapUp's AI summaries. Employee satisfaction scores jumped 35% in just one quarter.",
    category: "case-studies",
    date: "Dec 5, 2025",
    readTime: "6 min read",
    image: blogFutureWork,
  },
  {
    id: "22",
    title: "Natural Language Processing in Meeting Contexts",
    excerpt: "Meeting conversations differ fundamentally from written text. We explore how WrapUp fine-tunes NLP models specifically for spoken dialogue, interruptions, and multi-speaker environments.",
    category: "ai-innovation",
    date: "Dec 1, 2025",
    readTime: "9 min read",
    image: blogNlpContext,
  },
  {
    id: "23",
    title: "New: Custom Vocabulary & Industry-Specific Models",
    excerpt: "WrapUp now lets you train custom vocabulary for your industry jargon, acronyms, and product names. Medical, legal, and engineering teams see up to 40% accuracy improvement.",
    category: "product-updates",
    date: "Nov 28, 2025",
    readTime: "4 min read",
    image: blogVocabulary,
  },
  {
    id: "24",
    title: "The Future of Work: Predictions for 2026 and Beyond",
    excerpt: "AI assistants, async workflows, and intelligent automation are reshaping how teams collaborate. Industry leaders share their predictions for the next wave of workplace transformation.",
    category: "industry-trends",
    date: "Nov 25, 2025",
    readTime: "7 min read",
    image: blogFutureWorkplace,
  },
  {
    id: "25",
    title: "How Video Conferencing Evolved in the AI Era",
    excerpt: "From simple webcam calls to AI-powered immersive rooms — we trace the evolution of video conferencing and explain why intelligent meeting tools are the next frontier.",
    category: "industry-trends",
    date: "Nov 20, 2025",
    readTime: "6 min read",
    image: blogVideoConf,
  },
  {
    id: "26",
    title: "Human + AI: The Perfect Meeting Partnership",
    excerpt: "AI doesn't replace humans in meetings — it amplifies them. Learn how the best teams combine human creativity with AI efficiency to run meetings that actually drive results.",
    category: "ai-innovation",
    date: "Nov 17, 2025",
    readTime: "5 min read",
    image: blogAiCollab,
  },
  {
    id: "27",
    title: "Unlocking Meeting ROI with Advanced Analytics",
    excerpt: "WrapUp's new analytics dashboard reveals patterns you never knew existed — from speaking time imbalances to recurring topics. Turn meeting data into actionable business intelligence.",
    category: "product-updates",
    date: "Nov 14, 2025",
    readTime: "5 min read",
    image: blogDashboardInsights,
  },
  {
    id: "28",
    title: "Managing Meetings Across 15 Time Zones",
    excerpt: "Global teams face unique scheduling and collaboration challenges. We share strategies and tools that help distributed organizations stay aligned without burning out.",
    category: "tips-tricks",
    date: "Nov 10, 2025",
    readTime: "6 min read",
    image: blogGlobalTeams,
  },
  {
    id: "29",
    title: "The Science of Deep Focus Between Meetings",
    excerpt: "Back-to-back meetings destroy productivity. Research shows you need at least 25 minutes of uninterrupted time for deep work. Here's how to reclaim your focus hours.",
    category: "tips-tricks",
    date: "Nov 7, 2025",
    readTime: "4 min read",
    image: blogFocusTime,
  },
  {
    id: "30",
    title: "How WrapUp Achieves 99.2% Transcription Accuracy",
    excerpt: "A behind-the-scenes look at our speech-to-text pipeline: custom acoustic models, speaker diarization, and real-time error correction that sets a new industry benchmark.",
    category: "engineering",
    date: "Nov 4, 2025",
    readTime: "8 min read",
    image: blogSpeechText,
  },
  {
    id: "31",
    title: "MedCore Health: HIPAA-Compliant Meeting Records at Scale",
    excerpt: "How a 2,000-physician health network uses WrapUp to automatically generate compliant clinical meeting documentation, saving 30 hours per department each month.",
    category: "case-studies",
    date: "Nov 1, 2025",
    readTime: "7 min read",
    image: blogHealthcare,
  },
  {
    id: "32",
    title: "New: 50+ App Integrations Now Available",
    excerpt: "Connect WrapUp to your favorite tools — Jira, Notion, Asana, HubSpot, Salesforce, and more. Meeting action items now flow directly into your team's existing workflows.",
    category: "product-updates",
    date: "Oct 28, 2025",
    readTime: "4 min read",
    image: blogIntegrations,
  },
  {
    id: "33",
    title: "AI Meeting Tools in Education: A New Paradigm",
    excerpt: "Universities and schools are adopting AI meeting assistants for faculty meetings, parent-teacher conferences, and administrative coordination. The results are transformative.",
    category: "industry-trends",
    date: "Oct 25, 2025",
    readTime: "6 min read",
    image: blogEducation,
  },
  {
    id: "34",
    title: "How Startups Use WrapUp to Move Faster",
    excerpt: "Speed is everything in a startup. Three YC-backed founders share how WrapUp eliminated meeting overhead, accelerated decision-making, and helped them ship 2× faster.",
    category: "case-studies",
    date: "Oct 22, 2025",
    readTime: "5 min read",
    image: blogStartupGrowth,
  },
];
