import { useTrip, useTogglePackingItem } from "@/hooks/use-trips";
import { useRoute } from "wouter";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SafetyWidget } from "@/components/SafetyWidget";
import { MapPin, Calendar, CheckCircle2, Circle, Bus, Utensils, Camera, Hotel, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

export default function TripDetail() {
  const [match, params] = useRoute("/trips/:id");
  const tripId = parseInt(params?.id || "0");
  const { data: trip, isLoading } = useTrip(tripId);
  const { mutate: toggleItem } = useTogglePackingItem();

  if (isLoading || !trip) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  // Group itinerary by day
  const days = Array.from(new Set(trip.itinerary.map(i => i.dayNumber))).sort((a, b) => a - b);

  // Group packing list by category
  const packingCategories = Array.from(new Set(trip.packingList.map(i => i.category)));

  return (
    <div className="container mx-auto px-4 py-8 lg:px-8 max-w-6xl">
      {/* Header */}
      <div className="relative rounded-3xl overflow-hidden bg-foreground text-white mb-8 shadow-2xl">
        <div className="absolute inset-0">
          <img
            src={trip.coverImage || `https://images.unsplash.com/photo-${trip.id % 2 === 0 ? '1476514525535-07fb3b4ae5f1' : '1502791451864-ddca869792ab'}?w=1600&h=600&fit=crop`}
            alt="Cover"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>

        <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider">
              {trip.personality} Trip
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold">{trip.title}</h1>
            <div className="flex flex-wrap gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>{trip.destination}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>
                  {trip.startDate ? `${format(new Date(trip.startDate), "MMM d")} - ${format(new Date(trip.endDate!), "MMM d, yyyy")}` : trip.month}
                </span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto">
            <SafetyWidget score={trip.safetyScore || 9} warnings={trip.safetyScore && trip.safetyScore < 7 ? ["Rainy season expected", "Moderate theft risk in downtown"] : []} />
          </div>
        </div>
      </div>

      <Tabs defaultValue="itinerary" className="space-y-8">
        <TabsList className="bg-white p-1 rounded-xl border border-border/50 shadow-sm h-14 w-full md:w-auto grid grid-cols-3 md:inline-flex">
          <TabsTrigger value="itinerary" className="rounded-lg h-12 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-medium">Itinerary</TabsTrigger>
          <TabsTrigger value="packing" className="rounded-lg h-12 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-medium">Packing List</TabsTrigger>
          <TabsTrigger value="assistant" className="rounded-lg h-12 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-medium">AI Assistant</TabsTrigger>
        </TabsList>

        {/* Itinerary Tab */}
        <TabsContent value="itinerary" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Accordion type="single" collapsible defaultValue={`day-1`} className="space-y-4">
                {days.map((day) => (
                  <AccordionItem key={day} value={`day-${day}`} className="border border-border/50 rounded-2xl bg-white shadow-sm overflow-hidden px-2">
                    <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/30 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          D{day}
                        </div>
                        <span className="font-bold text-lg">Day {day}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 px-4 pb-4">
                      <div className="relative pl-8 space-y-8 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border">
                        {trip.itinerary.filter(i => i.dayNumber === day).sort((a, b) => (a.timeSlot || "").localeCompare(b.timeSlot || "")).map((item, idx) => (
                          <div key={idx} className="relative group">
                            <div className="absolute -left-[39px] top-0 w-10 h-10 rounded-full border-4 border-white bg-secondary flex items-center justify-center z-10 shadow-sm group-hover:scale-110 transition-transform">
                              {getIconForType(item.activityType || "activity")}
                            </div>
                            <div className="bg-muted/30 p-5 rounded-2xl border border-border/30 hover:border-primary/20 hover:bg-white hover:shadow-lg transition-all duration-300">
                              <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 space-y-2">
                                  <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-foreground text-lg">{item.placeName}</h4>
                                    <span className="text-xs font-mono font-medium bg-primary/10 text-primary px-2 py-1.5 rounded-md border border-primary/10 whitespace-nowrap">{item.timeSlot}</span>
                                  </div>
                                  <p className="text-muted-foreground leading-relaxed text-sm">"{item.description}"</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-primary to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
                <h3 className="font-bold text-xl mb-2 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" /> Trip Tips
                </h3>
                <p className="text-white/80 text-sm mb-4">
                  Consider downloading offline maps for {trip.destination}. The local currency rate is favorable right now.
                </p>
                <Button variant="secondary" className="w-full bg-white/10 hover:bg-white/20 border-0 text-white">
                  Get More Tips
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Packing List Tab */}
        <TabsContent value="packing" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-3xl p-8 border border-border/50 shadow-sm">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {packingCategories.map(category => (
                <div key={category} className="space-y-4">
                  <h3 className="font-display font-bold text-lg capitalize flex items-center gap-2 pb-2 border-b">
                    {category}
                  </h3>
                  <div className="space-y-3">
                    {trip.packingList.filter(i => i.category === category).map(item => (
                      <div key={item.id} className="flex items-start gap-3 group">
                        <Checkbox
                          id={`item-${item.id}`}
                          checked={item.isChecked || false}
                          onCheckedChange={(checked) => toggleItem({ id: item.id, isChecked: checked as boolean })}
                          className="mt-0.5"
                        />
                        <label
                          htmlFor={`item-${item.id}`}
                          className={`text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer select-none transition-all ${item.isChecked ? "text-muted-foreground line-through decoration-primary/50" : "text-foreground"}`}
                        >
                          {item.item}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* AI Assistant Tab (Mock) */}
        <TabsContent value="assistant" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="h-[500px] bg-white rounded-3xl border border-border/50 shadow-sm flex flex-col items-center justify-center text-center p-8">
            <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mb-6">
              <MessageSquare className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold font-display mb-2">AI Travel Companion</h3>
            <p className="text-muted-foreground max-w-md mb-8">
              Ask about local customs, quick translations, or find hidden gem restaurants near your current location.
            </p>
            <Button disabled className="opacity-50">Coming Soon</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getIconForType(type: string) {
  switch (type) {
    case "food": return <Utensils className="w-4 h-4 text-primary" />;
    case "transport": return <Bus className="w-4 h-4 text-primary" />;
    case "hotel": return <Hotel className="w-4 h-4 text-primary" />;
    default: return <Camera className="w-4 h-4 text-primary" />;
  }
}
