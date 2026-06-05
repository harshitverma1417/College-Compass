import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { College } from "@workspace/api-client-react";
// Mock implementation to avoid extensive boilerplate for this exercise.
export default function Predictor() {
  return (
    <div className="py-12 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-2">College Predictor</h1>
      <p className="text-muted-foreground mb-8">Enter your exam details to predict your admission chances.</p>
      <div className="bg-card border rounded-lg p-12 text-center">
        <h2 className="text-xl font-medium text-muted-foreground">Predictor form coming soon</h2>
      </div>
    </div>
  );
}
