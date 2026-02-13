import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { EnhanceMarkdownRequest, EnhanceMarkdownResponse } from "@shared/schema";

export function useEnhanceMarkdown() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: EnhanceMarkdownRequest) => {
      const res = await apiRequest(
        "POST",
        "/api/enhance-markdown",
        data
      );
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to enhance markdown");
      }
      
      const responseData = await res.json();
      return responseData as EnhanceMarkdownResponse;
    },
    onError: (error: Error) => {
      toast({
        title: "Enhancement Failed",
        description: error.message || "Failed to enhance markdown. Please try again.",
        variant: "destructive",
      });
    },
  });
}
