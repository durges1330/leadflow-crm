import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  Bot,
  FileText,
  Kanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Target,
  Users,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { NAV_ITEMS, type NavItem, ROLE_CONFIG } from "../constants";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import type { RouteId, UserProfile } from "../types";
import { RoleBadge } from "./shared/RoleBadge";
import { SearchBar } from "./shared/SearchBar";
import { ThemeToggle } from "./shared/ThemeToggle";

const NAV_ICONS: Record<
  RouteId,
  React.ComponentType<{ className?: string }>
> = {
  dashboard: LayoutDashboard,
  leads: Users,
  pipeline: Kanban,
  tasks: Target,
  documents: FileText,
  "ai-insights": Bot,
  "lead-detail": Users,
  settings: Settings,
};

interface LayoutProps {
  activeRoute: RouteId;
  onNavigate: (route: RouteId) => void;
  profile: UserProfile;
  children: React.ReactNode;
}

const SidebarNavItem: React.FC<{
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}> = ({ item, isActive, onClick }) => {
  const Icon = NAV_ICONS[item.id];
  return (
    <button
      type="button"
      onClick={onClick}
      data-ocid={`nav.${item.id}.link`}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150",
        isActive
          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
          : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
      )}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="truncate">{item.label}</span>
    </button>
  );
};

export const Layout: React.FC<LayoutProps> = ({
  activeRoute,
  onNavigate,
  profile,
  children,
}) => {
  const queryClient = useQueryClient();
  const { clear } = useInternetIdentity();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    queryClient.clear();
    clear();
  };

  const mainNav = NAV_ITEMS.filter((n) => n.section === "main");
  const toolNav = NAV_ITEMS.filter((n) => n.section === "tools");

  const renderNavSection = (
    items: NavItem[],
    onClickFn: (id: RouteId) => void,
  ) =>
    items.map((item) => (
      <SidebarNavItem
        key={item.id}
        item={item}
        isActive={activeRoute === item.id}
        onClick={() => onClickFn(item.id)}
      />
    ));

  const SidebarContent = ({
    onClickFn,
  }: { onClickFn: (id: RouteId) => void }) => (
    <>
      {/* Logo */}
      <div className="h-14 flex items-center gap-3 px-4 border-b border-sidebar-border flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
          <BarChart3 className="w-4 h-4 text-sidebar-primary-foreground" />
        </div>
        <span className="font-bold text-sidebar-foreground text-base tracking-tight">
          Atlas CRM
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <p className="text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider px-3 py-2">
          Main
        </p>
        {renderNavSection(mainNav, onClickFn)}
        <p className="text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider px-3 pt-4 pb-2">
          Tools
        </p>
        {renderNavSection(toolNav, onClickFn)}
      </nav>

      {/* User info */}
      <div className="p-3 border-t border-sidebar-border flex-shrink-0">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center text-sm font-bold text-sidebar-primary-foreground flex-shrink-0">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-sidebar-foreground truncate">
              {profile.name}
            </p>
            <RoleBadge role={profile.role} size="xs" />
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col w-60 bg-sidebar fixed h-full z-30 border-r border-sidebar-border">
        <SidebarContent onClickFn={setActiveAndNav} />
      </aside>

      {/* Top header */}
      <header className="fixed top-0 right-0 left-0 md:left-60 h-14 bg-card border-b border-border z-40 shadow-sm">
        <div className="flex items-center justify-between h-full px-4 gap-4">
          {/* Mobile menu btn */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            data-ocid="nav.menu_toggle"
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Search */}
          <div className="flex-1 max-w-md hidden sm:block">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search leads, contacts..."
            />
          </div>

          <div className="flex-1 sm:hidden" />

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-2 h-9"
                  data-ocid="nav.profile_dropdown"
                >
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-medium leading-none">
                      {profile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {ROLE_CONFIG[profile.role]?.label}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium">{profile.name}</p>
                    <p className="text-xs text-muted-foreground font-normal">
                      {profile.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setActiveAndNav("settings");
                  }}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={handleLogout}
                  data-ocid="nav.logout_button"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="w-60 p-0 bg-sidebar border-sidebar-border"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col h-full">
            <SidebarContent
              onClickFn={(id) => {
                setActiveAndNav(id);
                setMobileOpen(false);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <main className="flex-1 md:ml-60 pt-14">
        <div className="p-4 md:p-6 min-h-[calc(100vh-3.5rem)]">{children}</div>
      </main>
    </div>
  );

  function setActiveAndNav(id: RouteId) {
    onNavigate(id);
  }
};
