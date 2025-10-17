import { Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  const handleDownload = () => {
    // Placeholder for download functionality
    console.log("Downloading template:", template.id);
  };

  const handlePreview = () => {
    // Placeholder for preview functionality
    console.log("Previewing template:", template.id);
  };

  return (
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
  );
};

// Missing import added
import { FileText } from "lucide-react";

export default TemplateCard;
