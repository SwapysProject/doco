// File: /components/PatientSearchBar.tsx (or wherever you want to place it)

"use client"; // This component uses client-side hooks

import React, { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";

// Assuming you have these components from shadcn/ui or similar
import { Input } from "@/components/ui/input"; 
import { Search, Loader2 } from "lucide-react";

// Define a type for your patient data for better code safety
interface Patient {
  _id: string;
  name: string;
  email: string;
  // ... other patient fields
}

export function PatientSearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce the search term to prevent API calls on every keystroke
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  // This effect hook fetches data when the user stops typing
  useEffect(() => {
    // We only want to search if the debounced term has 2 or more characters
    if (debouncedSearchTerm.length > 1) {
      setIsLoading(true);

      const fetchSearchResults = async () => {
        try {
          // Fetch from the API route we created above
          const response = await fetch(`/api/search?q=${debouncedSearchTerm}`);
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const data: Patient[] = await response.json();
          setResults(data);
        } catch (error) {
          console.error("Failed to fetch search results:", error);
          setResults([]); // Clear results on error
        } finally {
          setIsLoading(false);
        }
      };

      fetchSearchResults();
    } else {
      setResults([]); // Clear results if the search term is too short
    }
  }, [debouncedSearchTerm]); // The key: this only runs when debouncedSearchTerm changes

  return (
    <div className="flex-1 max-w-lg relative">
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-colors duration-200 ease-in-out group-focus-within:text-blue-500" />
        
        {/* Show a loading spinner during the API call */}
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
        )}
        
        <Input
          type="search"
          placeholder="Search patients, appointments..."
          className="pl-10 pr-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 ease-in-out hover:bg-gray-100 focus:scale-[1.02] transform"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Display search results in a dropdown */}
      {results.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
          {results.map((patient) => (
            <li 
              key={patient._id} 
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <p className="font-semibold">{patient.name}</p>
              <p className="text-sm text-gray-500">{patient.email}</p>
            </li>
          ))}
        </ul>
      )}

      {/* Optional: Show a "no results" message */}
      {!isLoading && debouncedSearchTerm.length > 1 && results.length === 0 && (
         <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4 text-center text-gray-500">
           No results found.
         </div>
      )}
    </div>
  );
}
