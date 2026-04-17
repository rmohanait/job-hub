import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Constants } from "@/integrations/supabase/types";
import type { Database } from "@/integrations/supabase/types";

type AppStatus = Database["public"]["Enums"]["application_status"];
const STATUSES = Constants.public.Enums.application_status;

const AddApplication = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState<AppStatus>("Applied");
  const [dateApplied, setDateApplied] = useState(new Date().toISOString().split("T")[0]);
  const [jobLink, setJobLink] = useState("");
  const [notes, setNotes] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [salaryGbpInput, setSalaryGbpInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      let imageUrl: string | null = null;

      if (imageFile && user) {
        const ext = imageFile.name.split(".").pop();
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("application-images")
          .upload(path, imageFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage
          .from("application-images")
          .getPublicUrl(path);
        imageUrl = publicUrl;
      }

      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const salaryTrim = salaryGbpInput.trim();
      let salary_gbp: number | null = null;
      if (salaryTrim) {
        const n = Math.floor(Number(salaryTrim));
        if (!Number.isFinite(n) || n < 0) {
          throw new Error("Salary must be a non-negative whole number (GBP per year), or leave blank.");
        }
        salary_gbp = n;
      }

      const { error } = await supabase.from("applications").insert({
        user_id: user!.id,
        company,
        role,
        status,
        date_applied: dateApplied,
        job_link: jobLink || null,
        notes: notes || null,
        tags: tags.length > 0 ? tags : null,
        image_url: imageUrl,
        salary_gbp,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast({ title: "Application added!" });
      navigate("/applications");
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  return (
    <div className="min-h-screen bg-muted/30">
      <AppHeader />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Add New Application</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company">Company *</Label>
                  <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} required placeholder="Google" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} required placeholder="Frontend Developer" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as AppStatus)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date Applied</Label>
                  <Input id="date" type="date" value={dateApplied} onChange={(e) => setDateApplied(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobLink">Job Link</Label>
                <Input id="jobLink" type="url" value={jobLink} onChange={(e) => setJobLink(e.target.value)} placeholder="https://..." />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salaryGbp">Salary (GBP / year, optional)</Label>
                <Input
                  id="salaryGbp"
                  type="number"
                  min={0}
                  step={1}
                  value={salaryGbpInput}
                  onChange={(e) => setSalaryGbpInput(e.target.value)}
                  placeholder="e.g. 55000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Interview prep notes, contacts..." rows={3} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input id="tags" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="remote, frontend, startup" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Image</Label>
                <Input id="image" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  disabled={mutation.isPending}
                  onClick={() => navigate("/applications")}
                >
                  Cancel
                </Button>
                <Button type="submit" className="w-full sm:w-auto sm:min-w-[160px]" disabled={mutation.isPending}>
                  {mutation.isPending ? "Adding..." : "Add Application"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AddApplication;
