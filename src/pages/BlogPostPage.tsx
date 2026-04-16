import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Calendar, ArrowRight } from "lucide-react";
import LandingNavbar from "@/components/landing/LandingNavbar";
import Footer from "@/components/landing/Footer";
import { blogCategories, blogPosts } from "@/data/blogData";

// Simulated long-form content per post
function getPostContent(id: string): string[] {
  const contents: Record<string, string[]> = {
    "1": [
      "The way we conduct meetings is fundamentally broken. Teams spend hours in discussions, only to lose critical information because nobody captured it properly. Action items fall through the cracks, decisions go undocumented, and the same topics resurface week after week.",
      "WrapUp was built to solve this exact problem. Our AI-powered platform sits quietly in your meetings, capturing every word with sub-200ms transcription latency. But transcription is just the beginning.",
      "Our proprietary summarization engine distills hour-long meetings into concise, structured summaries. It identifies key decisions, extracts action items with assigned owners, and highlights follow-up topics — all in real time.",
      "What sets WrapUp apart is context awareness. Our AI doesn't just transcribe words; it understands the flow of conversation, identifies speakers, detects sentiment shifts, and recognizes when a decision has been made versus when something is still being debated.",
      "Enterprise teams using WrapUp report a 90% reduction in meeting follow-up time and a 3x improvement in action item completion rates. When everyone has access to the same source of truth, alignment happens naturally.",
    ],
    "2": [
      "In a world overflowing with meeting tools, WrapUp stands out by being radically simple to use while delivering enterprise-grade power under the hood.",
      "Simple means one-click recording, automatic speaker identification, and summaries that appear in your inbox before you've even left the meeting room. No configuration, no training — it just works.",
      "Fast means real-time transcription with industry-leading latency. Our edge computing architecture processes audio locally before syncing, ensuring you see words on screen as they're spoken.",
      "Secure means end-to-end encryption, SOC 2 Type II certification, GDPR compliance, and zero-retention policies for audio data. Your conversations stay yours — always.",
      "These aren't just features; they're principles. Every engineering decision we make is filtered through this lens: Is it simple? Is it fast? Is it secure? If the answer to any of these is no, we go back to the drawing board.",
    ],
    "3": [
      "Acme Corp's engineering division was struggling. With 200+ engineers across 8 time zones, they were averaging 45 hours of meetings per person per month. The bigger problem? Only 20% of action items from those meetings were being completed.",
      "The root cause wasn't a people problem — it was an information problem. Meeting notes were scattered across Google Docs, Slack threads, and personal notebooks. Nobody had a single source of truth.",
      "After deploying WrapUp across their engineering org, the transformation was immediate. Every meeting automatically generated a structured summary with tagged action items, shared via their existing Slack channels.",
      "Within 90 days, action item completion jumped from 20% to 87%. Meeting follow-up emails decreased by 90%. And engineers reported feeling significantly less 'meeting fatigue' because they could skip non-essential meetings and catch up via AI summaries.",
      "The ROI was staggering: Acme Corp estimated $2.4M in annual productivity savings from reduced meeting overhead alone. But the real win was cultural — teams felt more aligned, more informed, and more empowered to focus on building.",
    ],
  };

  return contents[id] || [
    "This article explores one of the most important topics in modern meeting productivity. As organizations scale, the challenge of keeping everyone aligned grows exponentially.",
    "Traditional approaches to meeting management — shared documents, manual note-taking, recorded video replays — all fall short in different ways. They're either too slow, too manual, or too cumbersome for busy professionals.",
    "AI-powered meeting intelligence represents a paradigm shift. Instead of relying on human effort to capture and distribute meeting outcomes, intelligent systems can do this automatically, consistently, and at scale.",
    "The implications extend beyond individual productivity. When meeting data is structured and searchable, organizations gain unprecedented visibility into how decisions are made, how projects evolve, and where communication breakdowns occur.",
    "This is the future WrapUp is building toward — a world where meetings are not just tolerated but genuinely valuable. Where every conversation contributes to organizational knowledge. Where no insight is ever lost.",
  ];
}

export default function BlogPostPage() {
  const { id } = useParams<{ id: string }>();
  const post = blogPosts.find((p) => p.id === id);

  if (!post) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Post not found</h1>
          <Link to="/blog" className="text-primary hover:underline">Back to Blog</Link>
        </div>
      </div>
    );
  }

  const category = blogCategories.find((c) => c.slug === post.category);
  const content = getPostContent(post.id);
  const relatedPosts = blogPosts.filter((p) => p.category === post.category && p.id !== post.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNavbar />

      {/* Back to Blog - full width, aligned left */}
      <div className="pt-28 px-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/blog" className="text-lg text-foreground inline-flex items-center gap-3 px-6 py-3 rounded-xl border border-border/40 bg-card/60 hover:border-primary/60 hover:shadow-[0_0_20px_-4px_hsl(var(--primary)/0.35)] transition-all duration-300">
            <ArrowLeft size={18} /> Back to Blog
          </Link>
        </motion.div>
      </div>

      <article className="pt-8 pb-20 px-6 md:px-12 lg:px-20 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

          {/* Category badge */}
          {category && (
            <Link
              to={`/blog/${category.slug}`}
              className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/15 text-primary mb-6 hover:bg-primary/25 transition-colors"
            >
              {category.label}
            </Link>
          )}

          <h1 className="text-3xl md:text-5xl font-bold mb-5 leading-tight">{post.title}</h1>

          <div className="flex items-center gap-5 text-sm text-muted-foreground mb-10">
            <span className="flex items-center gap-1.5"><Calendar size={14} /> {post.date}</span>
            <span className="flex items-center gap-1.5"><Clock size={14} /> {post.readTime}</span>
          </div>

          {/* Hero visual */}
          <div className="w-full h-56 md:h-80 rounded-2xl mb-12 overflow-hidden">
            {post.image ? (
              <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${post.gradient ? `bg-gradient-to-br ${post.gradient}` : "bg-accent/20 border border-border/30"}`}>
                <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                  {category && <category.icon size={32} className="text-primary" />}
                </div>
              </div>
            )}
          </div>

          {/* Article content */}
          <div className="prose-custom space-y-6">
            {content.map((paragraph, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="text-base md:text-lg leading-relaxed text-muted-foreground"
              >
                {paragraph}
              </motion.p>
            ))}
          </div>
        </motion.div>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-20 pt-12 border-t border-border/30">
            <h3 className="text-xl font-bold mb-6">Related Articles</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {relatedPosts.map((rp) => (
                <Link
                  key={rp.id}
                  to={`/blog/post/${rp.id}`}
                  className="group rounded-xl border border-border/30 bg-card/40 p-5 hover:border-primary/40 hover:shadow-[0_0_20px_-6px_hsl(var(--primary)/0.2)] transition-all duration-300"
                >
                  <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">{rp.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{rp.excerpt}</p>
                  <span className="text-xs text-primary flex items-center gap-1">Read more <ArrowRight size={11} /></span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </article>

      <Footer />
    </div>
  );
}
