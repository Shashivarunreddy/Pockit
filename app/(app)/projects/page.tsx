import type { Metadata } from 'next';
import { FolderKanban } from 'lucide-react';

import { getProjects } from '@/server/queries/projects';
import { PageHeader } from '@/components/pm/page-header';
import { ProjectCard } from '@/components/pm/project-card';
import { NewProjectDialog } from '@/components/pm/new-project-dialog';

export const metadata: Metadata = { title: 'Projects' };

export default async function ProjectsPage() {
   const projects = await getProjects();

   return (
      <div className="flex flex-col">
         <PageHeader
            title="Projects"
            subtitle={`${projects.length} ${projects.length === 1 ? 'project' : 'projects'}`}
            action={<NewProjectDialog />}
         />

         {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 px-6 py-24 text-center">
               <div className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
                  <FolderKanban className="size-6" />
               </div>
               <div>
                  <p className="font-medium">No projects yet</p>
                  <p className="text-muted-foreground text-sm">
                     Create your first project to start tracking tasks.
                  </p>
               </div>
               <NewProjectDialog />
            </div>
         ) : (
            <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
               {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
               ))}
            </div>
         )}
      </div>
   );
}
