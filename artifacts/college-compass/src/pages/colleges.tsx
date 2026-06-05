import React, { useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { 
  useListColleges, 
  getListCollegesQueryKey 
} from "@workspace/api-client-react";
import { CollegeCard } from "@/components/college-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Search, SlidersHorizontal, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Colleges() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [type, setType] = useState(searchParams.get("type") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "rating");
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data, isLoading, isError } = useListColleges(
    { 
      search: search || undefined, 
      type: type || undefined,
      city: city || undefined,
      sortBy: sortBy as any, 
      sortOrder: sortBy === "fees" ? "asc" : "desc",
      page, 
      limit 
    },
    { query: { queryKey: getListCollegesQueryKey({ search, type, city, sortBy: sortBy as any, page, limit }) } }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Explore Colleges</h1>
          <p className="text-muted-foreground mt-1">Discover and compare top colleges across India.</p>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-4 flex flex-col md:flex-row gap-4 items-end md:items-center shadow-sm">
        <form onSubmit={handleSearch} className="flex-1 w-full relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            placeholder="Search colleges, courses, or cities..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
        
        <div className="flex w-full md:w-auto gap-4">
          <Select value={type} onValueChange={(v) => { setType(v === "all" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-full md:w-[140px]">
              <SelectValue placeholder="Institute Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="IIT">IIT</SelectItem>
              <SelectItem value="NIT">NIT</SelectItem>
              <SelectItem value="IIIT">IIIT</SelectItem>
              <SelectItem value="Private">Private</SelectItem>
              <SelectItem value="Government">Government</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }}>
            <SelectTrigger className="w-full md:w-[160px]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                <SelectValue placeholder="Sort By" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="fees">Lowest Fees</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col h-[380px] rounded-xl border bg-card overflow-hidden">
              <Skeleton className="h-32 w-full rounded-none" />
              <div className="p-5 flex-1 flex flex-col gap-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2 mt-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <Skeleton className="h-4 w-full mt-auto" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-12 bg-card border rounded-lg">
          <p className="text-destructive font-medium">Failed to load colleges. Please try again.</p>
        </div>
      ) : data?.colleges.length === 0 ? (
        <div className="text-center py-20 bg-card border rounded-lg flex flex-col items-center">
          <Search className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No colleges found</h3>
          <p className="text-muted-foreground max-w-md">
            We couldn't find any colleges matching your current filters. Try adjusting your search or clearing filters.
          </p>
          <Button 
            variant="outline" 
            className="mt-6"
            onClick={() => { setSearch(""); setType(""); setCity(""); setPage(1); }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data?.colleges.map((college) => (
              <CollegeCard key={college.id} college={college} />
            ))}
          </div>
          
          {data && data.totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-2">
              <Button 
                variant="outline" 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <div className="flex items-center px-4 font-medium">
                Page {page} of {data.totalPages}
              </div>
              <Button 
                variant="outline" 
                disabled={page === data.totalPages}
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
