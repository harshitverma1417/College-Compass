import React from "react";
import { useParams } from "wouter";
import { useGetCollege, getGetCollegeQueryKey } from "@workspace/api-client-react";

export default function CollegeDetail() {
  const { id } = useParams();
  const collegeId = parseInt(id || "0", 10);
  
  const { data: college, isLoading } = useGetCollege(collegeId, {
    query: { enabled: !!collegeId, queryKey: getGetCollegeQueryKey(collegeId) }
  });

  if (isLoading) {
    return <div className="py-12 text-center">Loading...</div>;
  }

  if (!college) {
    return <div className="py-12 text-center">College not found.</div>;
  }

  return (
    <div className="py-6">
      <div className="bg-card border rounded-lg p-8 mb-8">
        <div className="flex gap-6 items-start">
          {college.logoUrl && (
            <div className="w-24 h-24 p-2 bg-white rounded-lg border flex-shrink-0 flex items-center justify-center">
              <img src={college.logoUrl} alt={college.name} className="max-w-full max-h-full" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold mb-2">{college.name}</h1>
            <p className="text-lg text-muted-foreground">{college.city}, {college.state}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">About</h2>
            <div className="prose max-w-none text-muted-foreground">
              {college.about || college.shortDescription}
            </div>
          </section>
        </div>
        <div>
          <div className="bg-card border rounded-lg p-6 sticky top-24">
            <h3 className="font-semibold text-lg mb-4">Key Stats</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Rating</p>
                <p className="font-medium text-lg">{college.rating} / 5.0</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Highest Package</p>
                <p className="font-medium text-lg">{college.highestPackage ? `${college.highestPackage} LPA` : 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Package</p>
                <p className="font-medium text-lg">{college.avgPackage ? `${college.avgPackage} LPA` : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
