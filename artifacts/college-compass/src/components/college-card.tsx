import React from "react";
import { Link } from "wouter";
import { Star, MapPin, Briefcase } from "lucide-react";
import { College } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function CollegeCard({ college }: { college: College }) {
  return (
    <Card className="flex flex-col h-full overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="p-0">
        <div className="h-32 bg-primary/10 relative">
          {college.logoUrl && (
            <div className="absolute -bottom-6 left-4 p-1 bg-card rounded-md border shadow-sm">
              <img src={college.logoUrl} alt={`${college.name} logo`} className="w-12 h-12 object-contain" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-5 pt-8">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="font-bold text-lg leading-tight line-clamp-2">
            <Link href={`/colleges/${college.id}`} className="hover:text-primary">
              {college.name}
            </Link>
          </h3>
          <Badge variant="secondary" className="flex items-center gap-1 font-semibold">
            <Star className="w-3 h-3 fill-primary text-primary" />
            {college.rating.toFixed(1)}
          </Badge>
        </div>
        
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
          <MapPin className="w-4 h-4" />
          {college.city}, {college.state}
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline">{college.type}</Badge>
          <Badge variant="outline">₹{(college.fees / 100000).toFixed(1)}L / year</Badge>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2">
          {college.shortDescription}
        </p>
      </CardContent>
      <CardFooter className="p-5 pt-0 mt-auto border-t border-border/50 pt-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm font-medium">
          <Briefcase className="w-4 h-4 text-primary" />
          <span>Avg: {(college as any).avgPackage ? `${(college as any).avgPackage} LPA` : "N/A"}</span>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/colleges/${college.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
