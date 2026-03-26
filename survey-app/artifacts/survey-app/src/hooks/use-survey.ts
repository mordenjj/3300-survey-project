import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, type SurveyResult } from "@/lib/supabase";

export type InsertSurveyResult = Omit<SurveyResult, 'id' | 'created_at'>;

export function useSurveyResults() {
  return useQuery({
    queryKey: ['survey_results'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('study_survey_results')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return data as SurveyResult[];
    },
  });
}

export function useSubmitSurvey() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (surveyData: InsertSurveyResult) => {
      const { data, error } = await supabase
        .from('study_survey_results')
        .insert([surveyData])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as SurveyResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['survey_results'] });
    },
  });
}
