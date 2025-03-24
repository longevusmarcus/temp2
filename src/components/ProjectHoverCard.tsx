import React from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { cn } from "../lib/utils";
import { ExternalLink } from "lucide-react";

interface ProjectHoverCardProps {
  projectName?: string;
  developerName?: string;
  developerAvatar?: string;
  description?: string;
  websiteUrl?: string;
  thumbnailUrl?: string;
  blockSize?: { width: number; height: number };
  children?: React.ReactNode;
}

const ProjectHoverCard = ({
  projectName = "Awesome Project",
  developerName = "Jane Developer",
  developerAvatar = "",
  description = "A cutting-edge web application showcasing the latest in frontend development techniques and design patterns.",
  websiteUrl = "https://example.com",
  thumbnailUrl = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&q=80",
  blockSize = { width: 50, height: 50 },
  children,
}: ProjectHoverCardProps) => {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div
          className={cn(
            "relative cursor-pointer overflow-hidden bg-gray-900",
            children
              ? ""
              : `w-[${blockSize.width}px] h-[${blockSize.height}px]`,
          )}
        >
          {children || (
            <div
              className="w-full h-full bg-cover bg-center transition-transform hover:scale-105"
              style={{ backgroundImage: `url(${thumbnailUrl})` }}
            />
          )}
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 bg-gray-900 border border-gray-800 text-white p-4 shadow-lg shadow-purple-900/20">
        <div className="flex justify-between space-x-4">
          <Avatar>
            <AvatarImage src={developerAvatar} />
            <AvatarFallback className="bg-purple-700 text-white">
              {developerName
                .split(" ")
                .map((name) => name[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1 flex-1">
            <h4 className="text-lg font-semibold text-purple-400">
              {projectName}
            </h4>
            <p className="text-sm text-gray-300">by {developerName}</p>
            <p className="text-xs text-gray-400 line-clamp-3">{description}</p>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors"
          >
            Visit Project <ExternalLink size={12} />
          </a>
        </div>

        <div className="mt-2 text-xs text-gray-500">
          Block size: {blockSize.width}×{blockSize.height} pixels
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default ProjectHoverCard;
