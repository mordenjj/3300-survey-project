import { useMemo } from "react";
import { Link } from "wouter";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from "recharts";
import { ArrowLeft, Users, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useSurveyResults } from "@/hooks/use-survey";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";

// Helper to normalize and count items for charting
function countFrequencies(items: string[]): { name: string; count: number }[] {
  const counts: Record<string, number> = {};
  items.forEach(item => {
    const normalized = item.toLowerCase().trim();
    if (!normalized) return;
    counts[normalized] = (counts[normalized] || 0) + 1;
  });
  
  return Object.entries(counts)
    .map(([name, count]) => ({ 
      // Title case the name for display
      name: name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '), 
      count 
    }))
    .sort((a, b) => b.count - a.count); // Sort descending
}

const GRADE_ORDER = ["Freshman", "Sophomore", "Junior", "Senior"];

export default function Results() {
  const { data: results, isLoading, isError, error, refetch } = useSurveyResults();

  // Process data for charts
  const { gradeData, methodsData, locationsData, totalCount } = useMemo(() => {
    if (!results || results.length === 0) {
      return { gradeData: [], methodsData: [], locationsData: [], totalCount: 0 };
    }

    // 1. Total Count
    const totalCount = results.length;

    // 2. Grade Level (Chronological Order)
    const gradeCounts = results.reduce((acc, row) => {
      acc[row.grade_level] = (acc[row.grade_level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const gradeData = GRADE_ORDER.map(grade => ({
      name: grade,
      count: gradeCounts[grade] || 0
    }));

    // 3. Study Methods
    const allMethods: string[] = [];
    results.forEach(row => {
      row.study_methods.forEach(method => {
        if (method === "Other" && row.other_study_method) {
          allMethods.push(row.other_study_method);
        } else {
          allMethods.push(method);
        }
      });
    });
    const methodsData = countFrequencies(allMethods).slice(0, 10); // Top 10

    // 4. Locations
    const allLocations = results.map(row => row.favorite_study_place);
    const locationsData = countFrequencies(allLocations).slice(0, 10); // Top 10

    return { gradeData, methodsData, locationsData, totalCount };
  }, [results]);

  // Custom Tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover text-popover-foreground border border-border shadow-lg p-3 rounded-xl">
          <p className="font-semibold mb-1">{label}</p>
          <p className="text-primary font-medium">
            Count: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 w-full bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <h1 className="font-display font-bold text-xl text-foreground">Survey Results</h1>
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-muted"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="font-medium animate-pulse">Loading survey data from Supabase...</p>
          </div>
        ) : isError ? (
          <div className="bg-destructive/10 border-2 border-destructive/20 rounded-2xl p-8 text-center max-w-md mx-auto mt-12">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Error Loading Results</h2>
            <p className="text-muted-foreground mb-6">{error?.message || "Failed to fetch data from Supabase."}</p>
            <button 
              onClick={() => refetch()} 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-background border-2 border-border hover:border-foreground transition-colors font-medium"
            >
              <RefreshCw className="w-4 h-4" /> Try Again
            </button>
          </div>
        ) : totalCount === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-muted rounded-full mb-6">
              <Users className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">No Responses Yet</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">Be the first to participate in the study habits survey to see aggregated results here.</p>
            <Link 
              href="/survey" 
              className="inline-flex px-8 py-4 rounded-xl font-semibold bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              Take the Survey
            </Link>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-forwards">
            
            {/* KPI Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 sm:p-8 flex items-center gap-6"
            >
              <div className="p-4 bg-primary/10 text-primary rounded-2xl">
                <Users className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <div>
                <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-1">Total Responses</p>
                <p className="text-4xl sm:text-5xl font-extrabold text-foreground font-display">{totalCount}</p>
              </div>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Chart 1: Grade Level */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col">
                <h3 className="text-lg font-bold text-foreground mb-6 font-display">Year in College</h3>
                <div className="flex-1 h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={gradeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 13 }} 
                        tickLine={false} 
                        axisLine={false} 
                        dy={10}
                      />
                      <YAxis 
                        allowDecimals={false} 
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 13 }} 
                        tickLine={false} 
                        axisLine={false} 
                      />
                      <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<CustomTooltip />} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {gradeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill="hsl(var(--primary))" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Methods */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col">
                <h3 className="text-lg font-bold text-foreground mb-6 font-display">Most Popular Study Methods</h3>
                <div className="flex-1 h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={methodsData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                      <XAxis 
                        type="number" 
                        allowDecimals={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 13 }} 
                        tickLine={false} 
                        axisLine={false} 
                      />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        width={110}
                        tick={{ fill: 'hsl(var(--foreground))', fontSize: 13, fontWeight: 500 }} 
                        tickLine={false} 
                        axisLine={false} 
                      />
                      <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<CustomTooltip />} />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={40}>
                        {methodsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill="hsl(var(--primary))" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 3: Locations (Spans full width if odd number of charts, but here we place it nicely) */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col lg:col-span-2">
                <h3 className="text-lg font-bold text-foreground mb-6 font-display">Top Study Locations</h3>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={locationsData} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                      <XAxis 
                        type="number" 
                        allowDecimals={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 13 }} 
                        tickLine={false} 
                        axisLine={false} 
                      />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        width={150}
                        tick={{ fill: 'hsl(var(--foreground))', fontSize: 13, fontWeight: 500 }} 
                        tickLine={false} 
                        axisLine={false} 
                      />
                      <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<CustomTooltip />} />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={40}>
                         {locationsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill="hsl(var(--primary))" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
