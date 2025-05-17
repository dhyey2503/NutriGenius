
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CookingPot, UserCog, BotMessageSquare } from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';

const navItems = [
  { href: '/meal-plan', label: 'AI Meal Plan', icon: CookingPot },
  { href: '/profile', label: 'My Profile', icon: UserCog },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar side="left" variant="sidebar" collapsible="icon">
      <SidebarHeader className="p-4">
        <Link href="/meal-plan" className="flex items-center gap-2 text-primary hover:text-primary/90 transition-colors">
          <BotMessageSquare className="h-8 w-8" />
          <span className="text-2xl font-bold group-data-[collapsible=icon]:hidden">NutriGenius</span>
        </Link>
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href || (item.href !== "/meal-plan" && pathname.startsWith(item.href))}
                  tooltip={{ children: item.label, className: "bg-card text-card-foreground border-border shadow-md" }}
                >
                  <a>
                    <item.icon />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 group-data-[collapsible=icon]:hidden">
        <p className="text-xs text-muted-foreground text-center">
          &copy; {new Date().getFullYear()} NutriGenius
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
