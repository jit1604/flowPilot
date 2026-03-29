import { listProjects } from "@/lib/services/projects-service";
import { InboxCapture } from "@/components/inbox/inbox-capture";

export default async function InboxPage() {
  const projects = await listProjects();
  return <InboxCapture projects={projects} />;
}
