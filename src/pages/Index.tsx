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

      {/* Templates Showcase */}
      <section className="section-alt py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                Free UX Research Templates
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Download professionally crafted templates to accelerate your research workflow. 
                All templates are free and ready to use.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {templateCategories.map((category, index) => (
                <Card key={index} className="card-hover text-center">
                  <CardHeader className="space-y-4">
                    <div className="w-16 h-16 rounded-full hero-gradient mx-auto flex items-center justify-center">
                      <category.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl">{category.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription className="text-base">{category.description}</CardDescription>
                    <div className="text-sm font-medium text-primary">
                      {category.count} templates available
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center pt-6">
              <Link to="/templates">
                <Button size="lg" className="gap-2 group">
                  Browse All Templates
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Brief Experience Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <p className="text-lg text-muted-foreground">
              With 5+ years of experience in UX research across e-commerce, healthcare, and SaaS industries, 
              I've conducted hundreds of user interviews and usability tests to help teams build better products.
            </p>
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
