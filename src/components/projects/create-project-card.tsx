import { actionCreateProject } from "@/app/actions/projects";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const selectClass =
  "flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function CreateProjectCard() {
  return (
    <Card className="border-dashed shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">New project</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={actionCreateProject} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="p-name">Name</Label>
            <Input
              id="p-name"
              name="name"
              placeholder="e.g. Internship sprint"
              required
              className="bg-background"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="p-goal">Goal (optional)</Label>
            <Input
              id="p-goal"
              name="goal"
              placeholder="One-line outcome"
              className="bg-background"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="p-desc">Description</Label>
            <Textarea
              id="p-desc"
              name="description"
              rows={2}
              className="bg-background"
              placeholder="Context your future agent will use…"
            />
          </div>
          <div className="grid gap-2 sm:max-w-xs">
            <Label htmlFor="p-status">Status</Label>
            <select id="p-status" name="status" className={cn(selectClass)}>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <Button type="submit">Create project</Button>
        </form>
      </CardContent>
    </Card>
  );
}
