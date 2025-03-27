import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArticleIcon, VideoIcon, QaIcon } from "@/components/icons";
import { Resource } from "@/types";
import { RESOURCE_CATEGORIES } from "@/lib/constants";

const ResourcesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Fetch resources
  const { data: resources = [], isLoading } = useQuery({
    queryKey: ["/api/resources"],
    queryFn: async () => {
      const res = await fetch("/api/resources");
      if (!res.ok) throw new Error('Failed to fetch resources');
      return res.json();
    }
  });

  // Filter resources based on search and category
  const filteredResources = resources.filter((resource: Resource) => {
    const matchesSearch = searchQuery === "" || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Helper function to get the appropriate icon
  const getResourceIcon = (category: string, className: string = "h-5 w-5") => {
    switch (category) {
      case 'article':
        return <ArticleIcon className={className} />;
      case 'video':
        return <VideoIcon className={className} />;
      case 'qa':
        return <QaIcon className={className} />;
      default:
        return <ArticleIcon className={className} />;
    }
  };

  // Helper function to get display category
  const getCategoryDisplay = (category: string) => {
    switch (category) {
      case 'article':
        return 'Article';
      case 'video':
        return 'Video';
      case 'qa':
        return 'Q&A';
      default:
        return 'Resource';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-neutral-800 mb-2">Educational Resources</h1>
        <p className="text-neutral-500">Learn about menstrual health, hormonal balance, and reproductive wellness</p>
      </div>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-grow">
            <Input
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full sm:w-auto">
            <TabsList className="grid grid-cols-4 w-full sm:w-[400px]">
              {RESOURCE_CATEGORIES.map(category => (
                <TabsTrigger key={category.value} value={category.value}>
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-neutral-600">Loading resources...</p>
        </div>
      ) : filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource: Resource) => (
            <Card key={resource.id} className="overflow-hidden flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs capitalize">
                    {getCategoryDisplay(resource.category)}
                  </Badge>
                  <div className="text-neutral-400">
                    {getResourceIcon(resource.category)}
                  </div>
                </div>
                <CardTitle className="text-lg">{resource.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {resource.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2 flex-grow">
                <div className="text-sm text-neutral-600 line-clamp-3">
                  {resource.content.substring(0, 150)}...
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {resource.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-neutral-100 text-neutral-600 hover:bg-neutral-200">
                      {tag.replace(/-/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Read More</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-neutral-50 rounded-lg border border-neutral-200">
          <div className="mx-auto h-12 w-12 text-neutral-400 mb-4">
            <i className="ri-file-search-line text-4xl"></i>
          </div>
          <h3 className="text-lg font-medium text-neutral-700">No resources found</h3>
          <p className="mt-2 text-sm text-neutral-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}

      <div className="mt-12 bg-gradient-to-r from-secondary/90 to-primary/90 rounded-xl shadow-sm p-8 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl font-semibold mb-3">Have questions about your menstrual health?</h2>
          <p className="text-white/90 text-sm mb-6">
            Connect with licensed healthcare professionals for personalized advice and guidance.
          </p>
          <Button className="bg-white text-primary hover:bg-neutral-100">
            Book a Consultation
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;
