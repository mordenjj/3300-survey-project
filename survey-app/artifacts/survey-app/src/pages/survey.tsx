import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useSubmitSurvey, type InsertSurveyResult } from "@/hooks/use-survey";
import { Footer } from "@/components/layout/Footer";

const surveySchema = z.object({
  favorite_study_place: z.string().min(1, "Please enter your favorite study place."),
  grade_level: z.string().min(1, "Please select your grade level."),
  study_hours: z.string().min(1, "Please select how many hours you study."),
  study_methods: z.array(z.string()).min(1, "Please select at least one study method."),
  other_study_method: z.string().optional(),
}).refine(data => {
  if (data.study_methods.includes("Other") && (!data.other_study_method || data.other_study_method.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "Please describe your other study method.",
  path: ["other_study_method"],
});

type SurveyFormData = z.infer<typeof surveySchema>;

const GRADE_LEVELS = ["Freshman", "Sophomore", "Junior", "Senior"];
const STUDY_HOURS = ["Less than 1 hour", "1–2 hours", "2–3 hours", "More than 3 hours"];
const STUDY_METHODS = ["Flashcards", "Rewriting notes", "Practice tests", "Group study", "Watching videos", "Other"];

export default function Survey() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<SurveyFormData | null>(null);
  const submitSurvey = useSubmitSurvey();

  const { register, handleSubmit, watch, control, formState: { errors }, setFocus } = useForm<SurveyFormData>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      favorite_study_place: "",
      grade_level: "",
      study_hours: "",
      study_methods: [],
      other_study_method: "",
    }
  });

  const selectedMethods = watch("study_methods") || [];
  const hasOtherSelected = selectedMethods.includes("Other");

  // Auto-focus "Other" input when checked
  useEffect(() => {
    if (hasOtherSelected) {
      setTimeout(() => {
        setFocus("other_study_method");
      }, 50);
    }
  }, [hasOtherSelected, setFocus]);

  const onSubmit = async (data: SurveyFormData) => {
    try {
      const payload: InsertSurveyResult = {
        favorite_study_place: data.favorite_study_place,
        grade_level: data.grade_level,
        study_hours: data.study_hours,
        study_methods: data.study_methods,
        other_study_method: hasOtherSelected ? data.other_study_method || null : null,
      };
      
      await submitSurvey.mutateAsync(payload);
      setSubmittedData(data);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Submission failed", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 w-full bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <h1 className="font-display font-bold text-xl text-foreground">Study Habits Survey</h1>
          <Link 
            href="/results" 
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">View Results</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              {submitSurvey.isError && (
                <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3 text-destructive">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Submission Failed</h3>
                    <p className="text-sm opacity-90 mt-1">{submitSurvey.error?.message || "An unknown error occurred while saving your response. Please try again."}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 bg-card rounded-2xl p-6 sm:p-8 shadow-sm border border-border">
                
                {/* Q1: Favorite Place */}
                <div className="space-y-3">
                  <label htmlFor="favorite_study_place" className="block text-base font-semibold text-foreground">
                    1. What is your favorite place to study? <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="favorite_study_place"
                    type="text"
                    autoFocus
                    placeholder="e.g. Main Library, Coffee Shop, Dorm Room"
                    aria-describedby={errors.favorite_study_place ? "q1-error" : undefined}
                    className={`w-full px-4 py-3 rounded-xl bg-background border-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-4 transition-all duration-200 ${
                      errors.favorite_study_place 
                        ? "border-destructive focus:border-destructive focus:ring-destructive/10" 
                        : "border-border focus:border-primary focus:ring-primary/10 hover:border-primary/50"
                    }`}
                    {...register("favorite_study_place")}
                  />
                  {errors.favorite_study_place && (
                    <p id="q1-error" className="text-sm font-medium text-destructive flex items-center gap-1.5 mt-2">
                      <AlertCircle className="w-4 h-4" /> {errors.favorite_study_place.message}
                    </p>
                  )}
                </div>

                {/* Q2: Grade Level */}
                <div className="space-y-3">
                  <label htmlFor="grade_level" className="block text-base font-semibold text-foreground">
                    2. What is your grade level? <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="grade_level"
                      aria-describedby={errors.grade_level ? "q2-error" : undefined}
                      className={`w-full appearance-none px-4 py-3 rounded-xl bg-background border-2 text-foreground focus:outline-none focus:ring-4 transition-all duration-200 ${
                        errors.grade_level 
                          ? "border-destructive focus:border-destructive focus:ring-destructive/10" 
                          : "border-border focus:border-primary focus:ring-primary/10 hover:border-primary/50"
                      }`}
                      {...register("grade_level")}
                    >
                      <option value="" disabled>-- Select your year --</option>
                      {GRADE_LEVELS.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                  {errors.grade_level && (
                    <p id="q2-error" className="text-sm font-medium text-destructive flex items-center gap-1.5 mt-2">
                      <AlertCircle className="w-4 h-4" /> {errors.grade_level.message}
                    </p>
                  )}
                </div>

                {/* Q3: Study Hours */}
                <div className="space-y-4">
                  <fieldset>
                    <legend className="block text-base font-semibold text-foreground mb-3">
                      3. How many hours do you study per day? <span className="text-destructive">*</span>
                    </legend>
                    <div className="space-y-3" role="radiogroup" aria-describedby={errors.study_hours ? "q3-error" : undefined}>
                      {STUDY_HOURS.map((hours) => (
                        <label key={hours} className="flex items-center gap-3 p-3 rounded-xl border border-border cursor-pointer hover:bg-muted/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                          <input
                            type="radio"
                            value={hours}
                            className="w-5 h-5 text-primary bg-background border-border focus:ring-primary focus:ring-offset-background"
                            {...register("study_hours")}
                          />
                          <span className="text-foreground font-medium">{hours}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  {errors.study_hours && (
                    <p id="q3-error" className="text-sm font-medium text-destructive flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" /> {errors.study_hours.message}
                    </p>
                  )}
                </div>

                {/* Q4: Study Methods */}
                <div className="space-y-4">
                  <fieldset>
                    <legend className="block text-base font-semibold text-foreground mb-3">
                      4. What study methods do you use regularly? (select all that apply) <span className="text-destructive">*</span>
                    </legend>
                    <div className="grid sm:grid-cols-2 gap-3" aria-describedby={errors.study_methods ? "q4-error" : undefined}>
                      <Controller
                        name="study_methods"
                        control={control}
                        render={({ field }) => (
                          <>
                            {STUDY_METHODS.map((method) => {
                              const isChecked = field.value.includes(method);
                              return (
                                <label key={method} className="flex items-start gap-3 p-3 rounded-xl border border-border cursor-pointer hover:bg-muted/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                                  <div className="flex items-center h-6">
                                    <input
                                      type="checkbox"
                                      value={method}
                                      checked={isChecked}
                                      onChange={(e) => {
                                        const currentValues = field.value || [];
                                        if (e.target.checked) {
                                          field.onChange([...currentValues, method]);
                                        } else {
                                          field.onChange(currentValues.filter(val => val !== method));
                                        }
                                      }}
                                      className="w-5 h-5 rounded text-primary bg-background border-border focus:ring-primary focus:ring-offset-background"
                                    />
                                  </div>
                                  <span className="text-foreground font-medium leading-tight pt-0.5">{method}</span>
                                </label>
                              );
                            })}
                          </>
                        )}
                      />
                    </div>
                  </fieldset>
                  {errors.study_methods && (
                    <p id="q4-error" className="text-sm font-medium text-destructive flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" /> {errors.study_methods.message}
                    </p>
                  )}

                  {/* Conditional "Other" input */}
                  <AnimatePresence>
                    {hasOtherSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
                          <label htmlFor="other_study_method" className="block text-sm font-medium text-foreground">
                            Please describe your other study method <span className="text-destructive">*</span>
                          </label>
                          <input
                            id="other_study_method"
                            type="text"
                            placeholder="Describe your method..."
                            aria-describedby={errors.other_study_method ? "q4-other-error" : undefined}
                            className={`w-full px-4 py-2.5 rounded-lg bg-background border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-4 transition-all duration-200 ${
                              errors.other_study_method 
                                ? "border-destructive focus:border-destructive focus:ring-destructive/10" 
                                : "border-border focus:border-primary focus:ring-primary/10"
                            }`}
                            {...register("other_study_method")}
                          />
                          {errors.other_study_method && (
                            <p id="q4-other-error" className="text-sm font-medium text-destructive flex items-center gap-1.5 mt-1">
                              <AlertCircle className="w-4 h-4" /> {errors.other_study_method.message}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="pt-6 border-t border-border">
                  <button
                    type="submit"
                    disabled={submitSurvey.isPending}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200"
                  >
                    {submitSurvey.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Survey"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card rounded-2xl p-8 sm:p-12 shadow-lg border border-border text-center"
            >
              <div className="inline-flex items-center justify-center p-4 bg-green-100 dark:bg-green-900/30 rounded-full mb-6 ring-8 ring-green-50 dark:ring-green-900/10">
                <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
              
              <h2 className="text-3xl font-display font-bold text-foreground mb-4">
                Thank You!
              </h2>
              
              <p className="text-lg text-muted-foreground max-w-lg mx-auto mb-8">
                Your response has been recorded successfully. We appreciate your time helping us understand student study habits.
              </p>

              <div className="bg-muted/50 rounded-xl p-6 text-left max-w-lg mx-auto mb-8 space-y-4">
                <h3 className="font-semibold text-foreground border-b border-border/50 pb-2">Your Answers Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <span className="text-muted-foreground">Favorite Place:</span>
                    <span className="font-medium text-foreground">{submittedData?.favorite_study_place}</span>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <span className="text-muted-foreground">Grade Level:</span>
                    <span className="font-medium text-foreground">{submittedData?.grade_level}</span>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <span className="text-muted-foreground">Study Hours:</span>
                    <span className="font-medium text-foreground">{submittedData?.study_hours}</span>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <span className="text-muted-foreground">Methods:</span>
                    <span className="font-medium text-foreground">
                      {submittedData?.study_methods.map(m => m === 'Other' ? `Other (${submittedData.other_study_method})` : m).join(', ')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Link 
                  href="/results" 
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-medium bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all"
                >
                  View Results
                  <BarChart3 className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      <Footer />
    </div>
  );
}
