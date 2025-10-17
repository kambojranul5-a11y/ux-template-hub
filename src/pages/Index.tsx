import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Download, Users } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const templateCategories = [
    {
      title: "Research Templates",
      description: "Interview guides, survey designs, and research planning templates to streamline your discovery process.",
      icon: Users,
      count: 6,
    },
    {
      title: "Testing Protocols",
      description: "Usability testing scripts, observation frameworks, and evaluation checklists.",
      icon: BookOpen,
      count: 4,
    },
    {
      title: "Analysis & Reporting",
      description: "Persona templates, journey maps, and professional research report formats.",
      icon: Download,
      count: 5,
    },
  ];

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="hero-section pt-20 pb-12 sm:pt-32 sm:pb-16 border-b-4 border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight">
              HI! I AM RANUL
            </h1>
            <p className="text-lg sm:text-xl max-w-2xl mx-auto opacity-90">
              A UX Researcher specializing in qualitative and quantitative research methods to create user-centered digital products. I help teams understand their users deeply and transform insights into exceptional experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link to="/about">
            <Button size="lg" className="gap-2 group border-2">
              Browse Templates
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content - Vertical */}
      <section className="pt-12 pb-20 sm:pt-16 sm:pb-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-20 max-w-4xl mx-auto">
            
            {/* About Section */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl sm:text-4xl font-bold">
                  ABOUT ME
                </h2>
                <p className="text-lg text-muted-foreground">
                  Passionate about understanding users and solving complex problems
                </p>
              </div>
              
              <div className="space-y-4 text-foreground/80">
                <p>
                  I'm a UX researcher helping companies build products that people love. 
                  My approach combines rigorous research methodology with creative problem-solving to uncover actionable insights.
                </p>
                <p>
                  I specialize in user interviews, usability testing, survey design, and journey mapping. 
                  My work has helped organizations improve their products, increase user satisfaction, and drive business results.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 pt-4">
                <div className="flex items-center gap-4 p-4 border-2 border-border">
                  <div className="w-12 h-12 border-2 border-foreground flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">200+</div>
                    <div className="text-sm text-muted-foreground">USER INTERVIEWS</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 border-2 border-border">
                  <div className="w-12 h-12 border-2 border-foreground flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">50+</div>
                    <div className="text-sm text-muted-foreground">RESEARCH PROJECTS</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 border-2 border-border">
                  <div className="w-12 h-12 border-2 border-foreground flex items-center justify-center flex-shrink-0">
                    <Download className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">15+</div>
                    <div className="text-sm text-muted-foreground">FREE TEMPLATES</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Templates Section */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl sm:text-4xl font-bold">
                  FREE UX RESEARCH TEMPLATES
                </h2>
                <p className="text-lg text-muted-foreground">
                  Download professionally crafted templates to accelerate your research workflow.
                </p>
              </div>
              
              <div className="space-y-6">
                {templateCategories.map((category, index) => (
                  <Card key={index} className="card-hover border-2">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 border-2 border-foreground flex items-center justify-center flex-shrink-0">
                          <category.icon className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                          <CardTitle className="text-lg uppercase">{category.title}</CardTitle>
                          <CardDescription>{category.description}</CardDescription>
                          <div className="text-xs font-bold pt-1">
                            {category.count} TEMPLATES
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>

              <Link to="/">
                <Button size="lg" className="gap-2 group w-full border-2">
                  Browse All Templates
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* CTA Section */}
            <div className="space-y-6 pt-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-center">
                LET'S WORK TOGETHER
              </h2>
              <p className="text-lg text-muted-foreground text-center">
                Looking for a UX researcher to help improve your product? 
                I'd love to hear about your project and discuss how research can make a difference.
              </p>
              <div className="flex justify-center">
                <Button size="lg" className="gap-2">
                  Get in Touch
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
