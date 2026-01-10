import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { Applicant } from "@/lib/api";
import { toast } from "sonner";

export interface SearchHistoryItem {
  id: string;
  user_id: string;
  applicant_email: string;
  applicant_name: string;
  apex_score: number;
  risk_level: string;
  applicant_data: Applicant;
  searched_at: string;
  created_at: string;
}

export const useSearchHistory = () => {
  const { user } = useAuth();
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSearchHistory = async () => {
    if (!user) {
      setSearchHistory([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("search_history")
        .select("*")
        .eq("user_id", user.id)
        .order("searched_at", { ascending: false });

      if (error) {
        console.error("Error fetching search history:", error);
        toast.error("Failed to load search history");
        return;
      }

      // Transform the data to match our interface
      const transformedData = (data || []).map(item => ({
        ...item,
        applicant_data: item.applicant_data as unknown as Applicant
      }));

      setSearchHistory(transformedData);
    } catch (error) {
      console.error("Error fetching search history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToHistory = async (applicant: Applicant) => {
    if (!user) {
      console.warn("User not authenticated, cannot save to history");
      return;
    }

    try {
      const { error } = await supabase
        .from("search_history")
        .insert([{
          user_id: user.id,
          applicant_email: applicant.email,
          applicant_name: applicant.name.full,
          apex_score: applicant.apex_score,
          risk_level: applicant.risk_level as string,
          applicant_data: JSON.parse(JSON.stringify(applicant))
        }]);

      if (error) {
        console.error("Error saving to history:", error);
        return;
      }

      // Refresh history after adding
      await fetchSearchHistory();
    } catch (error) {
      console.error("Error adding to history:", error);
    }
  };

  const deleteFromHistory = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("search_history")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error deleting from history:", error);
        toast.error("Failed to delete item");
        return;
      }

      setSearchHistory(prev => prev.filter(item => item.id !== id));
      toast.success("Item deleted");
    } catch (error) {
      console.error("Error deleting from history:", error);
    }
  };

  const clearHistory = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("search_history")
        .delete()
        .eq("user_id", user.id);

      if (error) {
        console.error("Error clearing history:", error);
        toast.error("Failed to clear history");
        return;
      }

      setSearchHistory([]);
      toast.success("History cleared");
    } catch (error) {
      console.error("Error clearing history:", error);
    }
  };

  useEffect(() => {
    fetchSearchHistory();
  }, [user]);

  return {
    searchHistory,
    isLoading,
    addToHistory,
    deleteFromHistory,
    clearHistory,
    refreshHistory: fetchSearchHistory
  };
};
