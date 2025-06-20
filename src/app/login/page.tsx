"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Stethoscope, Eye, EyeOff, Loader2, Heart, Activity, Shield, Zap } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.message);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-3 sm:p-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-slate-800">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Enhanced Floating Medical Icons */}
        <div className="absolute top-20 left-10 opacity-25 dark:opacity-10 animate-bounce" style={{ animationDuration: '1.5s' }}>
          <Heart className="h-14 w-14 text-blue-600 animate-pulse" style={{ animationDuration: '1s' }} />
        </div>
        <div className="absolute top-40 right-20 opacity-25 dark:opacity-10 animate-bounce" style={{ animationDuration: '1.8s', animationDelay: '0.3s' }}>
          <Activity className="h-18 w-18 text-blue-500 animate-pulse" style={{ animationDuration: '1.2s' }} />
        </div>
        <div className="absolute bottom-32 left-20 opacity-25 dark:opacity-10 animate-bounce" style={{ animationDuration: '2s', animationDelay: '0.8s' }}>
          <Shield className="h-16 w-16 text-blue-700 animate-pulse" style={{ animationDuration: '0.8s' }} />
        </div>
        <div className="absolute bottom-20 right-32 opacity-25 dark:opacity-10 animate-bounce" style={{ animationDuration: '1.6s', animationDelay: '0.5s' }}>
          <Zap className="h-12 w-12 text-blue-600 animate-pulse" style={{ animationDuration: '1.3s' }} />
        </div>
        <div className="absolute top-32 left-1/2 opacity-25 dark:opacity-10 animate-bounce" style={{ animationDuration: '1.7s', animationDelay: '1s' }}>
          <Stethoscope className="h-15 w-15 text-indigo-600 animate-pulse" style={{ animationDuration: '0.9s' }} />
        </div>
        <div className="absolute bottom-40 left-1/3 opacity-25 dark:opacity-10 animate-bounce" style={{ animationDuration: '1.4s', animationDelay: '0.7s' }}>
          <Heart className="h-10 w-10 text-blue-800 animate-pulse" style={{ animationDuration: '1.1s' }} />
        </div>
        
        {/* Enhanced Animated Circles with Higher Opacity */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-300/30 dark:bg-blue-800/15 rounded-full animate-pulse blur-xl" style={{ animationDuration: '2s' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-300/35 dark:bg-indigo-800/18 rounded-full animate-pulse blur-xl" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-200/25 dark:bg-blue-900/12 rounded-full animate-pulse blur-2xl" style={{ animationDuration: '3s', animationDelay: '1s' }}></div>
        <div className="absolute top-1/6 right-1/3 w-48 h-48 bg-cyan-200/30 dark:bg-cyan-800/15 rounded-full animate-pulse blur-lg" style={{ animationDuration: '1.8s', animationDelay: '0.3s' }}></div>
        <div className="absolute bottom-1/6 left-1/3 w-56 h-56 bg-sky-200/28 dark:bg-sky-800/14 rounded-full animate-pulse blur-xl" style={{ animationDuration: '2.2s', animationDelay: '0.8s' }}></div>
        
        {/* Enhanced DNA Helix Animation */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-10 left-1/4 w-3 h-full bg-gradient-to-b from-blue-400/35 via-blue-300/25 to-transparent dark:from-blue-700/25 dark:via-blue-600/15 animate-pulse transform rotate-12" style={{ animationDuration: '1.5s' }}></div>
          <div className="absolute top-20 right-1/4 w-3 h-full bg-gradient-to-b from-indigo-400/35 via-indigo-300/25 to-transparent dark:from-indigo-700/25 dark:via-indigo-600/15 animate-pulse transform -rotate-12" style={{ animationDuration: '1.8s', animationDelay: '0.5s' }}></div>
          <div className="absolute top-5 left-1/3 w-2 h-3/4 bg-gradient-to-b from-cyan-400/30 to-transparent dark:from-cyan-700/20 animate-pulse transform rotate-45" style={{ animationDuration: '2s', animationDelay: '0.2s' }}></div>
          <div className="absolute bottom-5 right-1/3 w-2 h-3/4 bg-gradient-to-t from-sky-400/30 to-transparent dark:from-sky-700/20 animate-pulse transform -rotate-45" style={{ animationDuration: '2.3s', animationDelay: '0.7s' }}></div>
        </div>
        
        {/* Enhanced Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 bg-blue-500/40 dark:bg-blue-600/25 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 1.5}s`
              }}
            />
          ))}
        </div>
        
        {/* Moving Wave Effect */}
        <div className="absolute inset-0">
          <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent dark:via-blue-600/20 animate-pulse top-1/4" style={{ animationDuration: '3s' }}></div>
          <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent dark:via-indigo-600/20 animate-pulse bottom-1/4" style={{ animationDuration: '3.5s', animationDelay: '1s' }}></div>
        </div>
        
        {/* Orbiting Elements */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80">
          <div className="absolute top-0 left-1/2 w-4 h-4 bg-blue-500/50 dark:bg-blue-600/30 rounded-full animate-spin" style={{ animationDuration: '8s', transformOrigin: '0 160px' }}></div>
          <div className="absolute top-0 left-1/2 w-3 h-3 bg-indigo-500/50 dark:bg-indigo-600/30 rounded-full animate-spin" style={{ animationDuration: '12s', animationDirection: 'reverse', transformOrigin: '0 120px' }}></div>
        </div>
      </div>

      {/* Main Content */}
      <Card className="w-full max-w-md mx-auto shadow-2xl backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-blue-200/50 dark:border-blue-800/50 relative z-10 animate-in fade-in-50 slide-in-from-bottom-10 duration-500"
        style={{ maxWidth: "28rem" }}>
        <CardHeader className="text-center space-y-3 sm:space-y-4 px-4 sm:px-6">
          <div className="flex justify-center">
            <div className="p-2.5 sm:p-3 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-full shadow-lg animate-pulse">
              <Stethoscope className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Doctor Care System
          </CardTitle>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Sign in to your account
          </p>
        </CardHeader>

        <CardContent className="px-4 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20">
                <AlertDescription className="text-sm text-red-700 dark:text-red-400">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="doctor@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full h-11 text-base bg-white/50 dark:bg-slate-800/50 border-blue-200 dark:border-blue-800 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 hover:shadow-md"
              />
            </div>
            
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full pr-10 bg-white/50 dark:bg-slate-800/50 border-blue-200 dark:border-blue-800 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 hover:shadow-md"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
            
            <div className="text-center pt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-200"
                >
                  Register here
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}