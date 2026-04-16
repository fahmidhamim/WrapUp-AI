import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Calendar, ArrowRight } from "lucide-react";
import LandingNavbar from "@/components/landing/LandingNavbar";
import Footer from "@/components/landing/Footer";
import { blogCategories, blogPosts } from "@/data/blogData";

export default function BlogPage() {
  const { category } = useParams<{ category?: string }>();
  const activeSlug = category || "all";

  const activeCategory = blogCategories.find((c) => c.slug === activeSlug);
  const filtered = activeSlug === "all" ? blogPosts : blogPosts.filter((p) => p.category === activeSlug);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNavbar />

      <div className="pt-28 pb-20 px-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5 mb-6">
            <ArrowLeft size={14} /> Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            {activeCategory?.label || "Blog"}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {activeCategory?.description || "Insights, updates, and stories from the WrapUp team."}
          </p>
        </motion.div>

        {/* Category pills */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-wrap gap-2 mb-12">
          {blogCategories.map((cat) => (
            <Link
              key={cat.slug}
              to={cat.slug === "all" ? "/blog" : `/blog/${cat.slug}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                activeSlug === cat.slug
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card/60 text-muted-foreground border-border/40 hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {cat.label}
            </Link>
          ))}
        </motion.div>

        {/* Posts grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
            >
              <Link
                to={`/blog/post/${post.id}`}
                className="group block h-full rounded-xl border border-border/30 bg-card/60 backdrop-blur-sm overflow-hidden hover:border-primary/40 hover:shadow-[0_0_30px_-8px_hsl(var(--primary)/0.25)] transition-all duration-300"
              >
                {/* Card cover image */}
                <div className="relative h-48 overflow-hidden">
                  {post.image ? (
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${post.gradient ? `bg-gradient-to-br ${post.gradient}` : "bg-accent/30"}`}>
                      <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                        {(() => {
                          const cat = blogCategories.find((c) => c.slug === post.category);
                          if (cat) {
                            const Icon = cat.icon;
                            return <Icon size={24} className="text-primary" />;
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                  )}
                  {/* Category label overlay */}
                  <div className="absolute bottom-3 left-3">
                    <span className="px-2.5 py-1 rounded-md bg-background/80 backdrop-blur-sm text-xs font-medium text-foreground border border-border/30">
                      {blogCategories.find((c) => c.slug === post.category)?.label || post.category}
                    </span>
                  </div>
                  {post.featured && (
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-md bg-primary text-primary-foreground text-xs font-semibold">
                        Featured
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {post.date}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {post.readTime}</span>
                    </div>
                    <span className="text-primary font-medium group-hover:underline">Read Article →</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">No posts found in this category yet.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
