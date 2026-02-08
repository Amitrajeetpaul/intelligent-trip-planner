import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Compass, Mail, Lock, Sparkles, Chrome } from "lucide-react";
import { motion } from "framer-motion";

export default function AuthPage() {
    const { login, isLoggingIn } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        login();
    };

    const handleGoogleLogin = () => {
        login();
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Abstract Background Shapes */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px] -z-10" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/5 rounded-full blur-[120px] -z-10" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md"
            >
                <div className="flex flex-col items-center mb-10 text-center">
                    <div className="p-3 bg-primary text-primary-foreground rounded-2xl shadow-xl shadow-primary/20 mb-4 scale-110">
                        <Compass className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl font-display font-bold text-foreground tracking-tighter mb-2">TRIPSYNC</h1>
                    <p className="text-muted-foreground font-medium flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-accent" />
                        Plan smarter. Travel safer.
                    </p>
                </div>

                <Card className="border border-border/50 shadow-2xl shadow-primary/5 backdrop-blur-sm bg-white/50 overflow-hidden rounded-3xl">
                    <CardHeader className="space-y-1 pb-8">
                        <CardTitle className="text-2xl font-display font-bold text-center">Welcome Back</CardTitle>
                        <CardDescription className="text-center text-muted-foreground">
                            Enter your credentials to access your trips
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Button
                            variant="outline"
                            className="w-full h-12 rounded-xl border-border hover:bg-muted font-medium transition-all flex items-center justify-center gap-3"
                            onClick={handleGoogleLogin}
                            disabled={isLoggingIn}
                        >
                            <Chrome className="w-5 h-5 text-[#4285F4]" />
                            Login with Google
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-4 text-muted-foreground font-semibold">Or</span>
                            </div>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        className="pl-10 h-10 rounded-xl"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <Button variant="link" className="px-0 font-medium text-xs text-primary h-auto">
                                        Forgot password?
                                    </Button>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        className="pl-10 h-10 rounded-xl"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <Button
                                type="submit"
                                className="w-full h-12 rounded-xl shadow-lg shadow-primary/20 font-bold text-base mt-2"
                                disabled={isLoggingIn}
                            >
                                {isLoggingIn ? "Logging in..." : "Login"}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col border-t border-border/30 bg-muted/20 pt-6">
                        <p className="text-sm text-muted-foreground text-center">
                            Don’t have an account?{" "}
                            <Button variant="link" className="p-0 font-bold text-primary">
                                Sign Up
                            </Button>
                        </p>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}
