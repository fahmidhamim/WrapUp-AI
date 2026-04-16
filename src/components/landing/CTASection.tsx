import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function CTASection() {
  return (
    <section className="py-32 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-primary/10 blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp} custom={0}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            Ready to transform
            <br />
            <span className="gradient-text">your meetings?</span>
          </h2>
          <p className="text-muted-foreground mb-10 text-lg font-body">
            Join thousands of teams who save hours every week with WrapUp.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/signup" className="group relative inline-flex">
              <div className="absolute -inset-1 rounded-xl bg-primary/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative flex items-center gap-2 px-10 h-12 rounded-xl bg-primary/15 backdrop-blur-md border border-primary/30 text-foreground font-semibold text-base shadow-lg shadow-primary/25 transition-all duration-300 group-hover:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.6)] group-hover:scale-[1.03] group-hover:border-primary/50 group-hover:bg-primary/25">
                Get Started Free <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
