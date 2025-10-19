import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import Navigation from "@/components/Navigation";
import TemplateCard, { Template } from "@/components/TemplateCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import templateInterview from "@/assets/template-interview.png";
import templateUsability from "@/assets/template-usability.png";
import templateSurvey from "@/assets/template-survey.png";
import templatePersona from "@/assets/template-persona.png";
import templateJourney from "@/assets/template-journey.png";
import templateResearchPlan from "@/assets/template-research-plan.png";

// Mock data - replace with actual data source later
const mockTemplates: Template[] = [
  {
    id: "1",
    title: "UX Research Intake Template",
    description: "Comprehensive intake form for UX research requests - includes project background, strategic fit, research focus, timeline, and success criteria to prioritize and scope research effectively.",
    category: "Research",
    downloadCount: 234,
    imageUrl: templateInterview,
  },
  {
    id: "2",
    title: "Usability Testing Protocol",
    description: "Complete testing protocol including task scenarios, success metrics, and observation guidelines.",
    category: "Testing",
    downloadCount: 189,
    imageUrl: templateUsability,
  },
  {
    id: "3",
    title: "Persona Development Template",
    description: "Create detailed user personas with demographics, goals, pain points, and behavioral patterns.",
    category: "Analysis",
    downloadCount: 312,
    imageUrl: templatePersona,
  },
  {
    id: "4",
    title: "Journey Mapping Framework",
    description: "Map out user journeys with touchpoints, emotions, and opportunities for improvement.",
    category: "Mapping",
    downloadCount: 267,
    imageUrl: templateJourney,
  },
  {
    id: "5",
    title: "Research Findings Report",
    description: "Professional template for presenting research insights and actionable recommendations.",
    category: "Reporting",
    downloadCount: 156,
    imageUrl: templateResearchPlan,
  },
  {
    id: "6",
    title: "Survey Design Template",
    description: "Best practices and structure for creating effective user surveys with various question types.",
    category: "Research",
    downloadCount: 198,
    imageUrl: templateSurvey,
  },
];

const Templates = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [templates, setTemplates] = useState<Template[]>(mockTemplates);

  // Fetch download counts from database
  useEffect(() => {
    const fetchDownloadCounts = async () => {
      const { data, error } = await supabase
        .from('template_downloads')
        .select('template_id');

      if (error) {
        console.error('Error fetching downloads:', error);
        return;
      }

      // Count downloads per template
      const downloadCounts: Record<string, number> = {};
      data.forEach((download) => {
        downloadCounts[download.template_id] = (downloadCounts[download.template_id] || 0) + 1;
      });

      // Update templates with real download counts
      setTemplates(mockTemplates.map(template => ({
        ...template,
        downloadCount: downloadCounts[template.id] || 0
      })));
    };

    fetchDownloadCounts();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('template-downloads')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'template_downloads'
        },
        () => {
          fetchDownloadCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const categories = ["All", ...Array.from(new Set(templates.map((t) => t.category)))];

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section className="hero-section py-20 border-b-4 border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold">
              HI! I AM RANUL
            </h1>
            <p className="text-lg sm:text-xl opacity-90">
              Here are free UX research templates to streamline your research process
            </p>
          </div>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="section-alt py-8 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Templates Grid */}
      <section className="flex-1 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {filteredTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No templates found matching your criteria.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="section-alt border-t border-border py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold">NEED A CUSTOM TEMPLATE?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Can't find what you're looking for? Get in touch and I'll create a template tailored to your needs.
          </p>
          <Button size="lg" variant="default" className="gap-2 border-2">
            Contact Me
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Templates;
