import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, MapPin, Building2, TrendingUp, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CollegeCard } from "@/components/college-card";
// API hooks imports to be added once they are in the generated api.ts, assuming they exist
// import { useGetStatsSummary, useGetTopColleges } from "@workspace/api-client-react";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/colleges?search=${encodeURIComponent(searchQuery)}`);
    } else {
      setLocation('/colleges');
    }
  };

  return (
    <div className="flex flex-col gap-12 pb-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl bg-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-foreground/10 to-transparent pointer-events-none"></div>
        <div className="relative px-6 py-20 md:py-32 flex flex-col items-center text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-balance">
            Find the college that fits your ambition.
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl">
            Data-driven insights, verified placement records, and honest reviews to help Indian students make the most important decision of their careers.
          </p>
          
          <form onSubmit={handleSearch} className="w-full max-w-2xl relative flex items-center bg-background rounded-full p-1.5 shadow-xl">
            <div className="pl-4 pr-2 text-muted-foreground">
              <SearchIcon className="w-5 h-5" />
            </div>
            <Input 
              className="flex-1 border-0 shadow-none focus-visible:ring-0 text-foreground bg-transparent text-lg h-12" 
              placeholder="Search by college name, city, or course..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" size="lg" className="rounded-full px-8 h-12">
              Search
            </Button>
          </form>
          
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm font-medium text-primary-foreground/70">
            <span>Popular:</span>
            <Link href="/colleges?type=IIT" className="hover:text-primary-foreground hover:underline">IITs</Link>
            <Link href="/colleges?type=NIT" className="hover:text-primary-foreground hover:underline">NITs</Link>
            <Link href="/colleges?city=Delhi" className="hover:text-primary-foreground hover:underline">Delhi</Link>
            <Link href="/colleges?city=Bangalore" className="hover:text-primary-foreground hover:underline">Bangalore</Link>
          </div>
        </div>
      </section>

      {/* Features/Stats Section - Mocked for now */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border rounded-2xl p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-3xl font-bold mb-1">500+</h3>
          <p className="text-muted-foreground">Top Colleges</p>
        </div>
        <div className="bg-card border rounded-2xl p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h3 className="text-3xl font-bold mb-1">Detailed</h3>
          <p className="text-muted-foreground">Placement Data</p>
        </div>
        <div className="bg-card border rounded-2xl p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-3xl font-bold mb-1">Smart</h3>
          <p className="text-muted-foreground">Predictor Tool</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-secondary rounded-3xl p-8 md:p-12 text-center flex flex-col items-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Not sure where you stand?</h2>
        <p className="text-muted-foreground mb-8 max-w-xl">
          Use our advanced predictor tool to estimate your chances of admission in top colleges based on your JEE, NEET, or CUET rank.
        </p>
        <Button size="lg" asChild>
          <Link href="/predictor">Try Predictor Tool</Link>
        </Button>
      </section>
    </div>
  );
}
