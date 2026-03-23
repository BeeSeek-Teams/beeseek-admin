"use client";

import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { WarningCircle, ArrowClockwise } from "@phosphor-icons/react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] p-8">
          <div className="text-center">
            <WarningCircle size={48} weight="duotone" className="text-black/10 mx-auto" />
            <p className="text-sm font-bold text-black/30 mt-3">Something went wrong</p>
            <p className="text-xs text-black/20 mt-1 max-w-sm mx-auto">
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-xs mt-5 hover:opacity-90 transition-opacity"
            >
              <ArrowClockwise size={14} weight="bold" />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
