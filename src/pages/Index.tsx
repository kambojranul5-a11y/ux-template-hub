import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Download, Users } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const projects = [
    {
      title: "E-commerce Redesign",
      description: "Led comprehensive UX research for a major retail platform, improving conversion rates by 35%.",
      category: "Usability Testing",
    },
    {
      title: "Healthcare App Study",
      description: "Conducted user interviews and journey mapping for a patient portal, enhancing user satisfaction scores.",
      category: "User Research",
    },
    {
      title: "SaaS Onboarding",
      description: "Researched and optimized onboarding flows, reducing time-to-value by 50% for new users.",
      category: "UX Analysis",
    },
  ];

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="hero-gradient text-white py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight">
              Turning User Insights into
              <span className="block mt-2">Exceptional Experiences</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
              UX Researcher specializing in qualitative and quantitative research methods to create user-centered digital products.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/templates">
                <Button size="lg" variant="secondary" className="gap-2 group">
                  Browse Templates
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="gap-2 bg-white/10 hover:bg-white/20 text-white border-white/30">
                <Download className="h-5 w-5" />
                Download Resume
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                About Me
              </h2>
              <p className="text-lg text-muted-foreground">
                Passionate about understanding users and solving complex problems
              </p>
            </div>
            <div className="prose prose-lg max-w-none space-y-4 text-foreground/80">
              <p>
                I'm a UX researcher with 5+ years of experience helping companies build products that people love. 
                My approach combines rigorous research methodology with creative problem-solving to uncover actionable insights.
              </p>
              <p>
                I specialize in user interviews, usability testing, survey design, and journey mapping. 
                My work has helped organizations improve their products, increase user satisfaction, and drive business results.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full hero-gradient mx-auto flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold">200+</div>
                <div className="text-sm text-muted-foreground">User Interviews</div>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full hero-gradient mx-auto flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold">50+</div>
                <div className="text-sm text-muted-foreground">Research Projects</div>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full hero-gradient mx-auto flex items-center justify-center">
                  <Download className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold">15+</div>
                <div className="text-sm text-muted-foreground">Free Templates</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Work */}
      <section className="section-alt py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                Featured Work
              </h2>
              <p className="text-lg text-muted-foreground">
                Recent projects showcasing research impact
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, index) => (
                <Card key={index} className="card-hover">
                  <CardHeader>
                    <div className="text-sm text-primary font-medium mb-2">{project.category}</div>
                    <CardTitle className="text-xl">{project.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{project.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              Let's Work Together
            </h2>
            <p className="text-lg text-muted-foreground">
              Looking for a UX researcher to help improve your product? 
              I'd love to hear about your project and discuss how research can make a difference.
            </p>
            <Button size="lg" className="gap-2">
              Get in Touch
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
