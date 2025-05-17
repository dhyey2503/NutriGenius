import { SidebarProvider } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { UserProfileProvider } from '@/contexts/UserProfileContext';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProfileProvider>
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <div className="flex flex-1 flex-col">
            <AppHeader />
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </UserProfileProvider>
  );
}
