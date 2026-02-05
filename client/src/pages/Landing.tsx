import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Compass, MapPin, Shield, Sparkles, Brain, Plane } from "lucide-react";
import { motion } from "framer-motion";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans overflow-hidden">
      {/* Navbar */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center z-50 relative">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary text-primary-foreground rounded-xl">
            <Compass className="w-6 h-6" />
          </div>
          <span className="text-2xl font-display font-bold text-foreground tracking-tight">TRIPSYNC</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">How it Works</a>
          <Button asChild variant="default" className="rounded-full px-6 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
            <a href="/api/login">Start Planning</a>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 container mx-auto px-6 flex flex-col lg:flex-row items-center gap-12 lg:gap-24 pt-12 pb-24 relative">
        {/* Abstract Shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-secondary/30 rounded-full blur-3xl -z-10 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl -z-10" />

        <div className="lg:w-1/2 space-y-8 z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-border shadow-sm mb-6">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-foreground/80">AI-Powered Travel Assistant</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-display font-bold leading-[1.1] text-foreground">
              Travel smarter, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">explore further.</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg mt-6">
              Plan your perfect trip with intelligent itineraries, personalized suggestions, and real-time safety alerts. 
              From budget adventures to luxury escapes, we've got you covered.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button asChild size="lg" className="rounded-full text-base h-12 px-8 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all">
              <a href="/api/login">Plan a Trip Now</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full text-base h-12 px-8 border-2 hover:bg-secondary/50 transition-colors">
              <a href="#features">Learn More</a>
            </Button>
          </motion.div>

          <div className="flex items-center gap-8 pt-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-muted overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="User" />
                </div>
              ))}
            </div>
            <p className="text-sm font-medium text-muted-foreground">Trusted by 10,000+ travelers</p>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="lg:w-1/2 w-full relative"
        >
          <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl shadow-primary/20 border-8 border-white/50 bg-white">
             {/* Scenic mountain landscape - unsplash source */}
            <img 
              src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&h=1000&fit=crop" 
              alt="Travel Adventure" 
              className="w-full h-auto object-cover"
            />
            
            {/* Floating UI Cards */}
            <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg flex items-center gap-3 animate-float" style={{ animationDelay: '0s' }}>
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase">Safety Score</p>
                <p className="text-sm font-bold text-foreground">9.8/10 Excellent</p>
              </div>
            </div>

            <div className="absolute bottom-12 right-8 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg flex items-center gap-3 animate-float" style={{ animationDelay: '1.5s' }}>
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase">AI Suggestion</p>
                <p className="text-sm font-bold text-foreground">Visit Kyoto in April</p>
              </div>
            </div>
          </div>
          
          {/* Decorative Pattern */}
          <div className="absolute -bottom-10 -left-10 w-full h-full border-2 border-primary/10 rounded-3xl -z-10 translate-x-4 translate-y-4" />
        </motion.div>
      </main>
    </div>
  );
}
