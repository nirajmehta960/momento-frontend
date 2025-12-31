"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // In production, log to error reporting service
    if (process.env.NODE_ENV === "development") {
      // Error details available for debugging
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex-center min-h-screen w-full bg-dark-1">
          <div className="flex-center flex-col gap-4 p-6 max-w-md text-center">
            <AlertTriangle className="w-16 h-16 text-red-500" />
            <h2 className="h2-bold text-light-1">Something went wrong</h2>
            <p className="text-light-3 text-sm">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <div className="flex gap-4 mt-4">
              <Button
                onClick={this.handleReset}
                variant="default"
                className="shad-button_primary"
              >
                Try Again
              </Button>
              <Button
                onClick={() => window.location.href = "/"}
                variant="outline"
                className="shad-button_dark_4"
              >
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

