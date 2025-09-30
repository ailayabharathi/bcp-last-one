"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const CustomLoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      showError("Login failed: " + error.message);
    } else {
      showSuccess("Logged in successfully!");
      // SessionContextProvider will handle redirection based on role
    }
    setLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  className="enhanced-input transition-all duration-300 hover:border-primary/50
                             focus:ring-4 focus:ring-primary/20 focus:border-primary
                             hover:shadow-md"
                  {...field}
                  disabled={loading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="enhanced-input pr-12 transition-all duration-300 hover:border-primary/50
                               focus:ring-4 focus:ring-primary/20 focus:border-primary
                               hover:shadow-md"
                    {...field}
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-primary/10
                               transition-all duration-200 hover:scale-110 focus:scale-105
                               group hover:shadow-sm"
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                    )}
                    <span className="sr-only">Toggle password visibility</span>
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full rounded-md font-semibold transition-all duration-300 ease-in-out
                     bg-primary text-primary-foreground relative overflow-hidden group
                     hover:bg-primary/90 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1
                     active:scale-[0.98] active:translate-y-0
                     before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
                     before:translate-x-[-100%] before:transition-transform before:duration-700
                     hover:before:translate-x-[100%]
                     focus:ring-4 focus:ring-primary/30 focus:outline-none"
          disabled={loading}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {loading ? "Logging in..." : "Login"}
            {!loading && (
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            )}
          </span>
        </Button>
        
        {/* Forgot Password Link */}
        <div className="text-center mt-4">
          <Button
            type="button"
            variant="link"
            className="text-sm text-muted-foreground hover:text-primary transition-all duration-300
                       hover:scale-105 hover:underline p-0 h-auto font-medium
                       focus:ring-2 focus:ring-primary/30 focus:outline-none rounded"
            onClick={() => {
              // Add forgot password functionality here
              showError("Forgot password functionality not implemented yet.");
            }}
          >
            Forgot your password?
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CustomLoginForm;