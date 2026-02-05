import { useState } from "react";
import { useForm } from "react-hook-form";
import { useGenerateTrip } from "@/hooks/use-trips";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, Map, Wallet, User, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

// Types for the form
type WizardData = {
  mode: "specific" | "month";
  destination?: string;
  month?: string;
  startDate?: string;
  endDate?: string;
  budget: string;
  personality: string;
};

export default function Wizard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<WizardData>>({
    budget: "medium",
    personality: "adventure"
  });
  const [, navigate] = useLocation();
  const { mutate: generateTrip, isPending } = useGenerateTrip();

  const handleNext = (data: Partial<WizardData>) => {
    setFormData(prev => ({ ...prev, ...data }));
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    generateTrip(formData as any, {
      onSuccess: () => navigate("/")
    });
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between text-sm font-medium text-muted-foreground mb-4">
            <span className={cn(step >= 1 && "text-primary")}>Mode</span>
            <span className={cn(step >= 2 && "text-primary")}>Details</span>
            <span className={cn(step >= 3 && "text-primary")}>Style</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: "0%" }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-border/50 relative overflow-hidden">
           {/* Abstract decoration */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/30 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2" />

          <AnimatePresence mode="wait">
            {step === 1 && (
              <ModeSelection key="step1" onNext={handleNext} initialValue={formData.mode} />
            )}
            {step === 2 && (
              <TripDetails key="step2" onNext={handleNext} onBack={handleBack} mode={formData.mode!} initialData={formData} />
            )}
            {step === 3 && (
              <PersonalitySelection 
                key="step3" 
                onBack={handleBack} 
                onSubmit={(data) => {
                  setFormData(prev => ({ ...prev, ...data }));
                  // Need to trigger submit after state update, use useEffect or direct call with merged data
                  generateTrip({ ...formData, ...data } as any, {
                    onSuccess: () => navigate("/")
                  });
                }} 
                isPending={isPending}
                initialData={formData}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// --- Step Components ---

function ModeSelection({ onNext, initialValue }: { onNext: (data: any) => void, initialValue?: string }) {
  const [mode, setMode] = useState(initialValue || "specific");

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="text-center">
        <h2 className="text-3xl font-display font-bold text-foreground">How do you want to plan?</h2>
        <p className="text-muted-foreground mt-2">Choose flexibility or precision.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <button
          onClick={() => setMode("specific")}
          className={cn(
            "p-6 rounded-2xl border-2 text-left transition-all hover:shadow-lg group relative overflow-hidden",
            mode === "specific" ? "border-primary bg-primary/5" : "border-border bg-white hover:border-primary/50"
          )}
        >
          <div className="p-3 bg-white shadow-sm rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
            <Map className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-bold text-lg mb-1">I know where & when</h3>
          <p className="text-sm text-muted-foreground">Select a specific destination and date range.</p>
        </button>

        <button
          onClick={() => setMode("month")}
          className={cn(
            "p-6 rounded-2xl border-2 text-left transition-all hover:shadow-lg group relative overflow-hidden",
            mode === "month" ? "border-primary bg-primary/5" : "border-border bg-white hover:border-primary/50"
          )}
        >
          <div className="p-3 bg-white shadow-sm rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
            <CalendarIcon className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-bold text-lg mb-1">Flexible Explorer</h3>
          <p className="text-sm text-muted-foreground">Pick a month and let AI suggest the best spots.</p>
        </button>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => onNext({ mode })} size="lg" className="rounded-xl px-8">
          Next Step <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}

function TripDetails({ onNext, onBack, mode, initialData }: any) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialData
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display font-bold text-foreground">Trip Details</h2>
        <p className="text-muted-foreground mt-2">Tell us a bit more about your plans.</p>
      </div>

      <form onSubmit={handleSubmit(onNext)} className="space-y-6">
        {mode === "specific" ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <Input 
                id="destination" 
                placeholder="e.g. Paris, France" 
                className="h-12 rounded-xl"
                {...register("destination", { required: "Destination is required" })}
              />
              {errors.destination && <span className="text-sm text-destructive">{String(errors.destination.message)}</span>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input 
                  id="startDate" 
                  type="date" 
                  className="h-12 rounded-xl"
                  {...register("startDate", { required: "Start date is required" })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input 
                  id="endDate" 
                  type="date" 
                  className="h-12 rounded-xl"
                  {...register("endDate", { required: "End date is required" })}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="month">Month of Travel</Label>
            <Input 
              id="month" 
              placeholder="e.g. September 2025" 
              className="h-12 rounded-xl"
              {...register("month", { required: "Month is required" })}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>Budget Level</Label>
          <div className="grid grid-cols-3 gap-3">
            {["low", "medium", "high"].map((level) => (
              <label key={level} className="cursor-pointer">
                <input 
                  type="radio" 
                  value={level} 
                  className="peer sr-only"
                  {...register("budget")}
                />
                <div className="h-12 flex items-center justify-center rounded-xl border-2 border-border bg-white peer-checked:border-primary peer-checked:bg-primary/5 capitalize font-medium transition-all hover:border-primary/50">
                  {level}
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onBack} size="lg" className="rounded-xl px-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Button type="submit" size="lg" className="rounded-xl px-8">
            Next Step <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </form>
    </motion.div>
  );
}

function PersonalitySelection({ onBack, onSubmit, isPending, initialData }: any) {
  const [personality, setPersonality] = useState(initialData.personality || "adventure");

  const personalities = [
    { id: "adventure", label: "Adventure Seeker", icon: Map, desc: "Hiking, outdoor activities, and thrill." },
    { id: "budget", label: "Budget Traveler", icon: Wallet, desc: "Cost-effective stays, local food, free spots." },
    { id: "family", label: "Family Vacation", icon: User, desc: "Kid-friendly spots, relaxed pace, comfort." },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="text-center">
        <h2 className="text-3xl font-display font-bold text-foreground">Travel Personality</h2>
        <p className="text-muted-foreground mt-2">Customize the vibe of your trip.</p>
      </div>

      <div className="space-y-4">
        {personalities.map((p) => (
          <button
            key={p.id}
            onClick={() => setPersonality(p.id)}
            className={cn(
              "w-full flex items-center p-4 rounded-2xl border-2 transition-all hover:shadow-md text-left",
              personality === p.id ? "border-primary bg-primary/5" : "border-border bg-white hover:border-primary/30"
            )}
          >
            <div className={cn(
              "p-3 rounded-xl mr-4",
              personality === p.id ? "bg-primary text-white" : "bg-muted text-muted-foreground"
            )}>
              <p.icon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-lg">{p.label}</h4>
              <p className="text-sm text-muted-foreground">{p.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack} size="lg" className="rounded-xl px-6" disabled={isPending}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button 
          onClick={() => onSubmit({ personality })} 
          size="lg" 
          className="rounded-xl px-8 min-w-[160px]"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...
            </>
          ) : (
            "Create Plan"
          )}
        </Button>
      </div>
    </motion.div>
  );
}
