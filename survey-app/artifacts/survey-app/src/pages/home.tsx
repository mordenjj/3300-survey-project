import { Link } from "wouter";
import { ArrowRight, BarChart3, GraduationCap } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-2xl text-center space-y-8"
        >
          <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4 ring-8 ring-primary/5">
            <GraduationCap className="w-10 h-10 text-primary" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight">
            Welcome to the <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">
              BAIS:3300
            </span> Study Habits Survey
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Help us understand how undergraduate business students study. This short survey takes about 2 minutes to complete and provides valuable insights into student success.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link 
              href="/survey" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md transition-all duration-200"
            >
              Take the Survey
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            <Link 
              href="/results" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold bg-card text-foreground border-2 border-border shadow-sm hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
            >
              View Results
              <BarChart3 className="w-5 h-5 text-primary" />
            </Link>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
