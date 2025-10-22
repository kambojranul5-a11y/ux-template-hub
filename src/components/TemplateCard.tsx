import { useState } from "react";
import { Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import TemplatePreviewDialog from "./TemplatePreviewDialog";

export interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  downloadCount: number;
  imageUrl?: string;
}

interface TemplateCardProps {
  template: Template;
}

const TemplateCard = ({ template }: TemplateCardProps) => {
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleDownload = async () => {
    try {
      let blob: Blob;
      let filename: string;

      // Special handling for UX Research Intake Template
      if (template.id === "1") {
        const content = `UX RESEARCH REQUEST INTAKE TEMPLATE

1. REQUEST INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Date Submitted: _______________________________________________

Requestor Name & Role: ________________________________________

Team / Scrum Group: ____________________________________________

Status: ☐ Submitted  ☐ In Review  ☐ Approved  ☐ Scheduled  ☐ Completed


2. PROJECT BACKGROUND
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

What led you to request research now?
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

Have you or your team conducted user research before?
_________________________________________________________________
_________________________________________________________________

What customer problem/need is your proposed solution trying to solve?
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

How do we know this is a customer problem/need? 
(evidence, data, past research, analytics, market insights)
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________


3. STRATEGIC FIT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Organizational or Strategic Impact:
(How could this research benefit the wider org? Which teams will it help?)
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

Expected Outcome:
(What decisions or actions should the research inform?)
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

How will you act on the insights? Who is ready to take action?
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________


4. RESEARCH FOCUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Components / Features to Test:
(e.g., Fraction Pieces mTool, Area Model mTool, Show More/Show Less Answer Reveal)
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

Research Questions / Objectives:

What exactly do you want to learn?
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

What hypotheses are being tested?
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________


5. PARTICIPANTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Target Population:
(e.g., mix of intervention and on-level students, specific teacher types, accessibility needs)
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

Recruitment Criteria:
(demographics, experience level, grade, segment)
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________


6. METHOD & INTERACTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Study Approach:
(usability testing, concept testing, interviews, diary study, card sorting, etc.)
_________________________________________________________________
_________________________________________________________________

User Interaction Plan:
(prototype walkthrough, live product tasks, hybrid Figma + interactive prototype)
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

Prototype Platform / Materials:
_________________________________________________________________
_________________________________________________________________


7. TIMELINE & LOGISTICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Target Date(s): _______________________________________________

Lead Researcher / Designer: ___________________________________

Supporting Stakeholders: ______________________________________

Level of Support Needed:
☐ Full research partnership  ☐ Quick deliverable (e.g., interview guide review)


8. PREVIOUS & RELATED WORK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Prior Research Conducted:
(link to user research, market research, A/B testing, analytics, BI)
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

Unanswered Questions Remaining:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________


9. ADDITIONAL NOTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Other Solutions Considered:
_________________________________________________________________
_________________________________________________________________

Special Considerations:
(accessibility, technical constraints, deadlines)
_________________________________________________________________
_________________________________________________________________

Other Information Important to Share:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHY THIS TEMPLATE HELPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ PRIORITIZATION: Makes it clear which studies align with strategy and have 
  broad org impact.

✓ EFFICIENCY: Reduces redundant meetings by front-loading details.

✓ EDUCATION: Shows stakeholders the real scope of user research, beyond 
  "just usability testing."

✓ TIME MANAGEMENT: Protects researcher time by filtering and focusing requests.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
        blob = new Blob([content], { type: 'text/plain' });
        filename = 'ux-research-intake-template.txt';
      } else {
        // For other templates, download the image
        if (!template.imageUrl) return;
        
        const response = await fetch(template.imageUrl);
        blob = await response.blob();
        filename = `${template.title.toLowerCase().replace(/\s+/g, '-')}.png`;
      }
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Track download in database
      console.log('📊 Tracking download for template ID:', template.id);
      const { data: insertData, error } = await supabase
        .from('template_downloads')
        .insert({ template_id: template.id })
        .select();

      if (error) {
        console.error('❌ Failed to track download:', error);
        console.error('❌ Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        toast({
          title: "Download Complete",
          description: "Template downloaded successfully!",
        });
      } else {
        console.log('✅ Download tracked successfully:', insertData);
        toast({
          title: "Success",
          description: "Template downloaded successfully!",
        });
      }
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "Error",
        description: "Failed to download template",
        variant: "destructive",
      });
    }
  };

  const handlePreview = async () => {
    setPreviewOpen(true);
    
    // Track preview click in database
    try {
      console.log('👁️ Tracking preview click for template ID:', template.id);
      const { data, error } = await supabase
        .from('template_clicks')
        .insert({ template_id: template.id })
        .select();

      if (error) {
        console.error('❌ Failed to track click:', error);
      } else {
        console.log('✅ Click tracked successfully:', data);
      }
    } catch (error) {
      console.error('Click tracking failed:', error);
    }
  };

  return (
    <>
      <TemplatePreviewDialog 
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        templateId={template.id}
        title={template.title}
      />
      <Card className="card-hover group border-2">
        <CardHeader className="space-y-3">
          <div className="aspect-video w-full border-2 border-border flex items-center justify-center overflow-hidden bg-muted">
            {template.imageUrl ? (
              <img 
                src={template.imageUrl} 
                alt={template.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <FileText className="h-16 w-16 text-muted-foreground/50" />
            )}
          </div>
          <div className="space-y-2">
            <Badge variant="secondary" className="w-fit border">
              {template.category}
            </Badge>
            <CardTitle className="text-xl uppercase">{template.title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="line-clamp-2">{template.description}</CardDescription>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground uppercase">
            {template.downloadCount} downloads
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePreview} className="border-2">
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
            <Button size="sm" className="gap-1 border-2" onClick={handleDownload}>
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </CardFooter>
      </Card>
    </>
  );
};

// Missing import added
import { FileText } from "lucide-react";

export default TemplateCard;
