import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { CommunityPost } from "@/types";

interface CommunityCardProps {
  posts: CommunityPost[];
}

const CommunityCard: React.FC<CommunityCardProps> = ({ posts }) => {
  if (posts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Community Conversations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-600">No community posts available at the moment.</p>
        </CardContent>
      </Card>
    );
  }

  // Helper function to get time difference
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "m ago";
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    
    return Math.floor(seconds) + "s ago";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Community Conversations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {posts.slice(0, 2).map((post) => (
            <a 
              key={post.id} 
              href={`/community/${post.id}`} 
              className="block rounded-lg border border-neutral-200 p-4 hover:border-primary/30 hover:bg-neutral-50 group transition-colors"
            >
              <h3 className="text-sm font-medium text-neutral-800 group-hover:text-primary">
                {post.title}
              </h3>
              <div className="flex items-center mt-2 text-xs text-neutral-500">
                <span>{post.responseCount} responses</span>
                <span className="mx-2">•</span>
                <span>Active {getTimeAgo(post.updatedAt)}</span>
              </div>
            </a>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <a href="/community" className="text-primary hover:text-primary-dark text-sm font-medium flex items-center">
          Join the community
          <i className="ri-arrow-right-line ml-1"></i>
        </a>
      </CardFooter>
    </Card>
  );
};

export default CommunityCard;
