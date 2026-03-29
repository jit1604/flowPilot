import { actionSaveWeeklyIntention } from "@/app/actions/intention";
import {
  currentWeekKey,
  getWeeklyIntentionForWeek,
} from "@/lib/services/intention-service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export async function WeeklyIntentionCard() {
  const weekKey = currentWeekKey();
  const row = await getWeeklyIntentionForWeek(weekKey);

  return (
    <Card className="border-primary/15 shadow-md shadow-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Weekly intention</CardTitle>
        <CardDescription>
          One line for why this week matters ({weekKey}). FlowPilot surfaces it
          so tasks don’t float without a narrative.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={actionSaveWeeklyIntention} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="weekly-intention" className="sr-only">
              Intention
            </Label>
            <Input
              id="weekly-intention"
              name="statement"
              placeholder="e.g. Ship the demo, protect deep work Tue/Thu, clear admin on Friday"
              defaultValue={row?.statement ?? ""}
              className="bg-background"
            />
          </div>
          <Button type="submit" variant="secondary">
            Save
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
