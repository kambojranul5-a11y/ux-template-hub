import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TemplatePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: string;
  title: string;
}

const TemplatePreviewDialog = ({ open, onOpenChange, templateId, title }: TemplatePreviewDialogProps) => {
  const getTemplateContent = () => {
    if (templateId === "1") {
      return (
        <div className="space-y-6">
          <section className="space-y-3">
            <h3 className="text-lg font-bold border-b pb-2">1. Request Information</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Date Submitted:</strong></p>
              <p><strong>Requestor Name & Role:</strong></p>
              <p><strong>Team / Scrum Group:</strong></p>
              <p><strong>Status:</strong> (Submitted, In Review, Approved, Scheduled, Completed)</p>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold border-b pb-2">2. Project Background</h3>
            <div className="space-y-2 text-sm">
              <p><strong>What led you to request research now?</strong></p>
              <p><strong>Have you or your team conducted user research before?</strong></p>
              <p><strong>What customer problem/need is your proposed solution trying to solve?</strong></p>
              <p><strong>How do we know this is a customer problem/need?</strong> (evidence, data, past research, analytics, market insights)</p>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold border-b pb-2">3. Strategic Fit</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Organizational or Strategic Impact:</strong></p>
              <p className="text-muted-foreground">(How could this research benefit the wider org? Which teams will it help?)</p>
              <p><strong>Expected Outcome:</strong></p>
              <p className="text-muted-foreground">(What decisions or actions should the research inform?)</p>
              <p><strong>How will you act on the insights? Who is ready to take action?</strong></p>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold border-b pb-2">4. Research Focus</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Components / Features to Test:</strong></p>
              <p className="text-muted-foreground">(e.g., Fraction Pieces mTool, Area Model mTool, Show More/Show Less Answer Reveal)</p>
              <p><strong>Research Questions / Objectives:</strong></p>
              <p className="text-muted-foreground">What exactly do you want to learn?</p>
              <p className="text-muted-foreground">What hypotheses are being tested?</p>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold border-b pb-2">5. Participants</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Target Population:</strong></p>
              <p className="text-muted-foreground">(e.g., mix of intervention and on-level students, specific teacher types, accessibility needs)</p>
              <p><strong>Recruitment Criteria:</strong></p>
              <p className="text-muted-foreground">(demographics, experience level, grade, segment)</p>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold border-b pb-2">6. Method & Interaction</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Study Approach:</strong></p>
              <p className="text-muted-foreground">(usability testing, concept testing, interviews, diary study, card sorting, etc.)</p>
              <p><strong>User Interaction Plan:</strong></p>
              <p className="text-muted-foreground">(prototype walkthrough, live product tasks, hybrid Figma + interactive prototype)</p>
              <p><strong>Prototype Platform / Materials:</strong></p>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold border-b pb-2">7. Timeline & Logistics</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Target Date(s):</strong></p>
              <p><strong>Lead Researcher / Designer:</strong></p>
              <p><strong>Supporting Stakeholders:</strong></p>
              <p><strong>Level of Support Needed:</strong> (full research partnership vs. quick deliverable like interview guide review)</p>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold border-b pb-2">8. Previous & Related Work</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Prior Research Conducted:</strong></p>
              <p className="text-muted-foreground">(link to user research, market research, A/B testing, analytics, BI)</p>
              <p><strong>Unanswered Questions Remaining:</strong></p>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold border-b pb-2">9. Additional Notes</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Other Solutions Considered:</strong></p>
              <p><strong>Special Considerations:</strong> (accessibility, technical constraints, deadlines)</p>
              <p><strong>Other Information Important to Share:</strong></p>
            </div>
          </section>

          <section className="space-y-3 bg-muted p-4 rounded-lg">
            <h3 className="text-lg font-bold">Why This Template Helps</h3>
            <ul className="space-y-2 text-sm list-disc list-inside">
              <li><strong>Prioritization:</strong> Makes it clear which studies align with strategy and have broad org impact.</li>
              <li><strong>Efficiency:</strong> Reduces redundant meetings by front-loading details.</li>
              <li><strong>Education:</strong> Shows stakeholders the real scope of user research, beyond "just usability testing."</li>
              <li><strong>Time Management:</strong> Protects researcher time by filtering and focusing requests.</li>
            </ul>
          </section>
        </div>
      );
    }
    
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Preview content coming soon for this template.</p>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{title}</DialogTitle>
          <DialogDescription>
            Preview the template structure and content
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          {getTemplateContent()}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TemplatePreviewDialog;
