import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ArticleIcon, VideoIcon, QaIcon } from "@/components/icons";
import { Resource } from "@/types";

interface ResourceCardProps {
  resources: Resource[];
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resources }) => {
  if (resources.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recommended Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-600">No resources available at the moment.</p>
        </CardContent>
      </Card>
    );
  }

  // Helper function to get the appropriate icon
  const getResourceIcon = (category: string) => {
    switch (category) {
      case 'article':
        return <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
          <i className="ri-article-line text-xl text-secondary"></i>
        </div>;
      case 'video':
        return <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <i className="ri-video-line text-xl text-primary"></i>
        </div>;
      case 'qa':
        return <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
          <i className="ri-question-answer-line text-xl text-accent"></i>
        </div>;
      default:
        return <div className="w-12 h-12 rounded-lg bg-neutral-100 flex items-center justify-center">
          <i className="ri-file-list-line text-xl text-neutral-600"></i>
        </div>;
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
    <Card>
      <CardHeader>
        <CardTitle>Recommended Resources</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {resources.slice(0, 3).map((resource) => (
            <a key={resource.id} href={`/resources/${resource.id}`} className="block group">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {getResourceIcon(resource.category)}
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-neutral-800 group-hover:text-primary">
                    {resource.title}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    {resource.description.length > 50 
                      ? resource.description.substring(0, 50) + '...' 
                      : resource.description}
                    {' • '}
                    {getCategoryDisplay(resource.category)}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <a href="/resources" className="text-primary hover:text-primary-dark text-sm font-medium flex items-center">
          Browse all resources
          <i className="ri-arrow-right-line ml-1"></i>
        </a>
      </CardFooter>
    </Card>
  );
};

export default ResourceCard;
