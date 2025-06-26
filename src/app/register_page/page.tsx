"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Stethoscope, Eye, EyeOff, Loader2, UserPlus, Heart, Activity, Shield, Zap, Plus } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    specialization: "",
    licenseNumber: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          specialization: formData.specialization,
          licenseNumber: formData.licenseNumber,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Registration successful! Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-slate-800">
      {/* Enhanced Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Enhanced Floating Medical Icons */}
        <div className="absolute top-16 left-16 opacity-30 dark:opacity-10 animate-bounce" style={{ animationDuration: '1.4s' }}>
          <UserPlus className="h-16 w-16 text-blue-600 animate-pulse" style={{ animationDuration: '1s' }} />
        </div>
        <div className="absolute top-32 right-12 opacity-30 dark:opacity-10 animate-bounce" style={{ animationDuration: '1.7s', animationDelay: '0.4s' }}>
          <Heart className="h-14 w-14 text-blue-500 animate-pulse" style={{ animationDuration: '1.2s' }} />
        </div>
        <div className="absolute top-1/2 left-8 opacity-30 dark:opacity-10 animate-bounce" style={{ animationDuration: '1.9s', animationDelay: '0.8s' }}>
          <Activity className="h-18 w-18 text-blue-700 animate-pulse" style={{ animationDuration: '0.9s' }} />
        </div>
        <div className="absolute bottom-40 right-24 opacity-30 dark:opacity-10 animate-bounce" style={{ animationDuration: '1.5s', animationDelay: '0.2s' }}>
          <Shield className="h-16 w-16 text-blue-600 animate-pulse" style={{ animationDuration: '1.3s' }} />
        </div>
        <div className="absolute bottom-24 left-32 opacity-30 dark:opacity-10 animate-bounce" style={{ animationDuration: '1.6s', animationDelay: '0.6s' }}>
          <Zap className="h-12 w-12 text-blue-500 animate-pulse" style={{ animationDuration: '1.1s' }} />
        </div>
        <div className="absolute top-3/4 right-1/4 opacity-30 dark:opacity-10 animate-bounce" style={{ animationDuration: '1.8s', animationDelay: '0.9s' }}>
          <Plus className="h-14 w-14 text-blue-600 animate-pulse" style={{ animationDuration: '0.8s' }} />
        </div>
        <div className="absolute top-1/6 left-1/2 opacity-30 dark:opacity-10 animate-bounce" style={{ animationDuration: '2s', animationDelay: '1.2s' }}>
          <Stethoscope className="h-13 w-13 text-indigo-600 animate-pulse" style={{ animationDuration: '1.4s' }} />
        </div>
        <div className="absolute bottom-1/6 right-1/6 opacity-30 dark:opacity-10 animate-bounce" style={{ animationDuration: '1.3s', animationDelay: '0.3s' }}>
          <Heart className="h-11 w-11 text-blue-800 animate-pulse" style={{ animationDuration: '1.5s' }} />
        </div>
        
        {/* Enhanced Animated Circles with Higher Opacity */}
        <div className="absolute top-1/6 left-1/6 w-72 h-72 bg-blue-300/35 dark:bg-blue-800/15 rounded-full animate-pulse blur-xl" style={{ animationDuration: '2s' }}></div>
        <div className="absolute bottom-1/6 right-1/6 w-80 h-80 bg-indigo-300/40 dark:bg-indigo-800/18 rounded-full animate-pulse blur-xl" style={{ animationDuration: '2.3s', animationDelay: '0.7s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-blue-400/30 dark:bg-blue-700/12 rounded-full animate-pulse blur-xl" style={{ animationDuration: '1.8s', animationDelay: '0.3s' }}></div>
        <div className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-blue-200/30 dark:bg-blue-900/15 rounded-full animate-pulse blur-2xl" style={{ animationDuration: '2.8s', animationDelay: '1s' }}></div>
        <div className="absolute top-2/3 left-1/4 w-52 h-52 bg-cyan-300/32 dark:bg-cyan-800/16 rounded-full animate-pulse blur-lg" style={{ animationDuration: '2.1s', animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-2/3 right-1/3 w-44 h-44 bg-sky-300/28 dark:bg-sky-800/14 rounded-full animate-pulse blur-xl" style={{ animationDuration: '1.9s', animationDelay: '0.8s' }}></div>
        
        {/* Enhanced Medical Cross Pattern */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-20 left-1/3 w-2 h-32 bg-gradient-to-b from-blue-400/40 via-blue-300/30 to-transparent dark:from-blue-700/25 dark:via-blue-600/15 animate-pulse transform rotate-45" style={{ animationDuration: '1.5s' }}></div>
          <div className="absolute top-20 left-1/3 w-32 h-2 bg-gradient-to-r from-blue-400/40 via-blue-300/30 to-transparent dark:from-blue-700/25 dark:via-blue-600/15 animate-pulse transform rotate-45" style={{ animationDuration: '1.5s' }}></div>
          <div className="absolute bottom-40 right-1/3 w-2 h-24 bg-gradient-to-b from-indigo-400/40 via-indigo-300/30 to-transparent dark:from-indigo-700/25 dark:via-indigo-600/15 animate-pulse transform -rotate-45" style={{ animationDuration: '1.8s', animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-40 right-1/3 w-24 h-2 bg-gradient-to-r from-indigo-400/40 via-indigo-300/30 to-transparent dark:from-indigo-700/25 dark:via-indigo-600/15 animate-pulse transform -rotate-45" style={{ animationDuration: '1.8s', animationDelay: '0.5s' }}></div>
          
          {/* Additional Cross Elements */}
          <div className="absolute top-1/2 left-16 w-1 h-20 bg-gradient-to-b from-cyan-400/35 to-transparent dark:from-cyan-700/20 animate-pulse transform rotate-30" style={{ animationDuration: '2.2s', animationDelay: '0.3s' }}></div>
          <div className="absolute top-1/2 left-16 w-20 h-1 bg-gradient-to-r from-cyan-400/35 to-transparent dark:from-cyan-700/20 animate-pulse transform rotate-30" style={{ animationDuration: '2.2s', animationDelay: '0.3s' }}></div>
        </div>
        
        {/* Enhanced Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(18)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2.5 h-2.5 bg-blue-500/45 dark:bg-blue-600/25 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 1.5}s`
              }}
            />
          ))}
        </div>
        
        {/* Enhanced Pulse Rings */}
        <div className="absolute top-1/4 right-1/4 w-32 h-32 border-3 border-blue-400/35 dark:border-blue-700/25 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
        <div className="absolute bottom-1/4 left-1/4 w-24 h-24 border-3 border-indigo-400/35 dark:border-indigo-700/25 rounded-full animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}></div>
        <div className="absolute top-1/6 right-1/6 w-20 h-20 border-2 border-cyan-400/30 dark:border-cyan-700/20 rounded-full animate-ping" style={{ animationDuration: '1.8s', animationDelay: '0.8s' }}></div>
        <div className="absolute bottom-1/6 left-1/6 w-28 h-28 border-2 border-sky-400/30 dark:border-sky-700/20 rounded-full animate-ping" style={{ animationDuration: '2.2s', animationDelay: '0.3s' }}></div>
        
        {/* Moving Wave Effects */}
        <div className="absolute inset-0">
          <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-blue-400/35 to-transparent dark:via-blue-600/25 animate-pulse top-1/3" style={{ animationDuration: '2.5s' }}></div>
          <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-indigo-400/35 to-transparent dark:via-indigo-600/25 animate-pulse bottom-1/3" style={{ animationDuration: '3s', animationDelay: '0.8s' }}></div>
          <div className="absolute h-full w-1 bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent dark:via-cyan-600/20 animate-pulse left-1/4" style={{ animationDuration: '2.8s', animationDelay: '0.4s' }}></div>
          <div className="absolute h-full w-1 bg-gradient-to-b from-transparent via-sky-400/30 to-transparent dark:via-sky-600/20 animate-pulse right-1/4" style={{ animationDuration: '3.2s', animationDelay: '1.2s' }}></div>
        </div>
        
        {/* Enhanced Orbiting Elements */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80">
          <div className="absolute top-0 left-1/2 w-4 h-4 bg-blue-500/50 dark:bg-blue-600/30 rounded-full animate-spin" style={{ animationDuration: '6s', transformOrigin: '0 160px' }}></div>
          <div className="absolute top-0 left-1/2 w-3 h-3 bg-indigo-500/50 dark:bg-indigo-600/30 rounded-full animate-spin" style={{ animationDuration: '8s', animationDirection: 'reverse', transformOrigin: '0 120px' }}></div>
          <div className="absolute top-0 left-1/2 w-2 h-2 bg-cyan-500/50 dark:bg-cyan-600/30 rounded-full animate-spin" style={{ animationDuration: '10s', transformOrigin: '0 80px' }}></div>
        </div>
      </div>

      {/* Main Content */}
      <Card className="w-full max-w-md mx-auto shadow-2xl backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-blue-200/50 dark:border-blue-800/50 relative z-10 animate-in fade-in-50 slide-in-from-bottom-10 duration-500"
        style={{ maxWidth: "28rem" }}>
        <CardHeader className="text-center space-y-0">
        
          <Link
            href="/login"
            className="or mb-0 w-30 px-4 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white shadow-lg hover:shadow-xl transition text-center block mx-auto"
          >
            Go back
          </Link>
          <p className="or text-[80px] sm:text-base text-gray-600 dark:text-gray-400 font-bold">
            or
          </p>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Create Doctor Account
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400">
            Register for the Doctor Care System
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20">
                <AlertDescription className="text-red-700 dark:text-red-400">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20 text-green-800 dark:text-green-400">
                <AlertDescription className="text-green-700 dark:text-green-400">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Full Name
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Dr. John Smith"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="bg-white/50 dark:bg-slate-800/50 border-blue-200 dark:border-blue-800 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 hover:shadow-md"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="doctor@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="bg-white/50 dark:bg-slate-800/50 border-blue-200 dark:border-blue-800 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 hover:shadow-md"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="specialization"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Specialization
              </label>
              <Input
                id="specialization"
                name="specialization"
                type="text"
                placeholder="General Medicine, Cardiology, etc."
                value={formData.specialization}
                onChange={handleChange}
                disabled={isLoading}
                className="bg-white/50 dark:bg-slate-800/50 border-blue-200 dark:border-blue-800 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 hover:shadow-md"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="licenseNumber"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Medical License Number
              </label>
              <Input
                id="licenseNumber"
                name="licenseNumber"
                type="text"
                placeholder="Optional"
                value={formData.licenseNumber}
                onChange={handleChange}
                disabled={isLoading}
                className="bg-white/50 dark:bg-slate-800/50 border-blue-200 dark:border-blue-800 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 hover:shadow-md"
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
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="pr-10 bg-white/50 dark:bg-slate-800/50 border-blue-200 dark:border-blue-800 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 hover:shadow-md"
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

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="pr-10 bg-white/50 dark:bg-slate-800/50 border-blue-200 dark:border-blue-800 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 hover:shadow-md"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
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
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>

            <div className="text-center pt-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <Link
                  href="/login_page"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-200"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}