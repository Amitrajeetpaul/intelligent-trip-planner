import { useTrips, useDeleteTrip } from "@/hooks/use-trips";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, MapPin, Trash2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Dashboard() {
  const { data: trips, isLoading } = useTrips();
  const { mutate: deleteTrip } = useDeleteTrip();

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 rounded-2xl bg-muted/50 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">My Trips</h1>
          <p className="text-muted-foreground mt-1">Manage your upcoming adventures and past journeys.</p>
        </div>
        <Button asChild className="rounded-xl px-6 h-12 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 transition-all">
          <Link href="/plan">
            <Plus className="w-5 h-5 mr-2" />
            Plan New Trip
          </Link>
        </Button>
      </div>

      {!trips?.length ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white border border-border/50 rounded-3xl shadow-sm text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <MapPin className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-bold font-display text-foreground mb-2">No trips planned yet</h3>
          <p className="text-muted-foreground max-w-md mb-8">
            Ready to explore the world? Start planning your next adventure with our AI assistant.
          </p>
          <Button asChild size="lg" className="rounded-full">
            <Link href="/plan">Start Planning</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group bg-white rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
            >
              <div className="relative h-48 bg-muted overflow-hidden">
                {/* Random travel image based on trip ID for visual variety */}
                <img
                  src={`https://images.unsplash.com/photo-${trip.id % 2 === 0 ? '1476514525535-07fb3b4ae5f1' : '1502791451864-ddca869792ab'}?w=800&h=600&fit=crop`}
                  alt={trip.destination || "Trip destination"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold shadow-md uppercase tracking-wider text-foreground">
                  {trip.status}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold font-display text-foreground mb-2 group-hover:text-primary transition-colors">
                  {trip.title}
                </h3>
                
                <div className="space-y-2 mb-6 flex-1">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2 text-primary/70" />
                    {trip.destination || "Destination TBD"}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2 text-primary/70" />
                    {trip.startDate ? format(new Date(trip.startDate), "MMM d, yyyy") : trip.month || "Date TBD"}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full h-8 w-8">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Trip?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your trip and all associated data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => deleteTrip(trip.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Button asChild variant="outline" size="sm" className="rounded-lg border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/50 group/btn">
                    <Link href={`/trips/${trip.id}`}>
                      View Details
                      <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
