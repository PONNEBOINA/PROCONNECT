import { Link } from 'react-router-dom';
import { ExternalLink, Github, MoreVertical } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Project } from '@/contexts/ProjectContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';

interface ProjectCardProps {
  project: Project;
  onDelete?: (id: string) => void;
}

export const ProjectCard = ({ project, onDelete }: ProjectCardProps) => {
  const { user } = useAuth();
  const isOwner = user?.id === project.ownerId;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="overflow-hidden group hover-lift animate-slide-up bg-gradient-to-b from-card to-card/50 backdrop-blur-sm border-2">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Link to={`/user/${project.ownerId}`} className="flex items-center space-x-3 group/header">
          <Avatar className="h-10 w-10 ring-2 ring-primary/20 transition-all group-hover/header:ring-primary/40 group-hover/header:scale-105">
            <AvatarImage src={project.ownerAvatar} />
            <AvatarFallback>{project.ownerName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm group-hover/header:text-primary transition-colors">{project.ownerName}</p>
            <p className="text-xs text-muted-foreground">{formatDate(project.createdAt)}</p>
          </div>
        </Link>

        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors">
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="animate-scale-in">
              <DropdownMenuItem
                onClick={() => onDelete?.(project.id)}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Image */}
      <div className="relative aspect-video bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
        <img
          src={project.imageUrl}
          alt={project.title}
          className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <a 
            href={project.githubUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all hover:scale-110"
          >
            <Github size={16} className="text-foreground" />
          </a>
          <a 
            href={project.projectUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center hover:scale-110 transition-transform"
          >
            <ExternalLink size={16} className="text-white" />
          </a>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-lg font-bold mb-1 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">{project.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {project.techStack.map((tech, index) => (
            <Badge 
              key={tech} 
              variant="secondary" 
              className="text-xs font-medium hover:bg-primary/20 hover:text-primary transition-all cursor-default animate-fade-in hover:scale-105"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {tech}
            </Badge>
          ))}
        </div>

        <div className="flex space-x-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all group/btn"
            asChild
          >
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
              <Github size={16} className="mr-2 transition-transform group-hover/btn:rotate-12" />
              Code
            </a>
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/50 transition-all group/btn"
            asChild
          >
            <a href={project.projectUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={16} className="mr-2 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
              Live Demo
            </a>
          </Button>
        </div>
      </div>
    </Card>
  );
};
