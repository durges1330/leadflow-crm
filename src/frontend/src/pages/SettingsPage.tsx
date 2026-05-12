import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Bot,
  Check,
  ChevronDown,
  ExternalLink,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Moon,
  Shield,
  Sun,
  Trash2,
  Users,
} from "lucide-react";
import { useTheme } from "next-themes";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { PageCard } from "../components/shared/PageCard";
import { RoleBadge } from "../components/shared/RoleBadge";
import { ROLE_CONFIG } from "../constants";
import {
  useGenerateSampleData,
  useListAllUsers,
  useSetMyAiApiKey,
  useSetUserRole,
  useUpdateMyProfile,
} from "../hooks/useQueries";
import type { Role, UserProfile } from "../types";

const ROLES: Role[] = ["Admin", "SalesManager", "Counselor", "Telecaller"];

const AVATAR_COLORS = [
  { value: "bg-indigo-500", label: "Indigo" },
  { value: "bg-violet-500", label: "Violet" },
  { value: "bg-blue-500", label: "Blue" },
  { value: "bg-emerald-500", label: "Emerald" },
  { value: "bg-amber-500", label: "Amber" },
  { value: "bg-rose-500", label: "Rose" },
  { value: "bg-cyan-500", label: "Cyan" },
  { value: "bg-pink-500", label: "Pink" },
];

const PERMISSION_MATRIX: {
  permission: string;
  Admin: boolean;
  SalesManager: boolean;
  Counselor: boolean;
  Telecaller: boolean;
}[] = [
  {
    permission: "View all leads",
    Admin: true,
    SalesManager: true,
    Counselor: false,
    Telecaller: false,
  },
  {
    permission: "Create & edit leads",
    Admin: true,
    SalesManager: true,
    Counselor: true,
    Telecaller: true,
  },
  {
    permission: "Delete leads",
    Admin: true,
    SalesManager: false,
    Counselor: false,
    Telecaller: false,
  },
  {
    permission: "Assign leads",
    Admin: true,
    SalesManager: true,
    Counselor: false,
    Telecaller: false,
  },
  {
    permission: "Manage team members",
    Admin: true,
    SalesManager: true,
    Counselor: false,
    Telecaller: false,
  },
  {
    permission: "Assign roles",
    Admin: true,
    SalesManager: false,
    Counselor: false,
    Telecaller: false,
  },
  {
    permission: "View analytics",
    Admin: true,
    SalesManager: true,
    Counselor: false,
    Telecaller: false,
  },
  {
    permission: "Access AI insights",
    Admin: true,
    SalesManager: true,
    Counselor: true,
    Telecaller: false,
  },
  {
    permission: "Manage documents",
    Admin: true,
    SalesManager: true,
    Counselor: true,
    Telecaller: false,
  },
  {
    permission: "Clear all data",
    Admin: true,
    SalesManager: false,
    Counselor: false,
    Telecaller: false,
  },
];

// ==================== Profile Tab ====================
const ProfileTab: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [avatarColor, setAvatarColor] = useState("bg-indigo-500");
  const { mutate: updateProfile, isPending } = useUpdateMyProfile();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(
      { name, email, phone },
      {
        onSuccess: () => toast.success("Profile updated successfully"),
        onError: (err) =>
          toast.error(`Failed to update profile: ${err.message}`),
      },
    );
  };

  return (
    <div className="space-y-6">
      {/* Profile header */}
      <PageCard>
        <div className="flex items-start gap-6">
          <div className="relative flex-shrink-0">
            <div
              className={cn(
                "w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-md",
                avatarColor,
              )}
            >
              {profile.name.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-foreground truncate">
                {profile.name}
              </h2>
              <RoleBadge role={profile.role} />
            </div>
            <p className="text-sm text-muted-foreground mt-1 truncate">
              {profile.email}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Principal ID: {profile.principal.slice(0, 20)}…
            </p>
          </div>
        </div>

        {/* Avatar color picker */}
        <div className="mt-5">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Avatar color
          </p>
          <div className="flex gap-2 flex-wrap">
            {AVATAR_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                aria-label={c.label}
                onClick={() => setAvatarColor(c.value)}
                data-ocid={`settings.avatar_color.${c.label.toLowerCase()}`}
                className={cn(
                  "w-7 h-7 rounded-full transition-all duration-150",
                  c.value,
                  avatarColor === c.value
                    ? "ring-2 ring-offset-2 ring-primary scale-110"
                    : "hover:scale-105 opacity-70 hover:opacity-100",
                )}
              />
            ))}
          </div>
        </div>
      </PageCard>

      {/* Edit form */}
      <PageCard
        title="Personal Information"
        description="Update your display name, email, and phone"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="settings-name">Full Name</Label>
              <Input
                id="settings-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                data-ocid="settings.name_input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="settings-email">Email Address</Label>
              <Input
                id="settings-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                data-ocid="settings.email_input"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="settings-phone">Phone Number</Label>
            <Input
              id="settings-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 234 567 8901"
              data-ocid="settings.phone_input"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <div className="flex items-center gap-2 h-9 px-3 border border-border rounded-md bg-muted text-sm text-muted-foreground">
              <RoleBadge role={profile.role} />
              <span className="text-xs ml-1">
                Your role is managed by an Admin
              </span>
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isPending}
              data-ocid="settings.save_button"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              {isPending ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </PageCard>

      {/* Permission matrix */}
      <PageCard
        title="Permission Matrix"
        description="What each role can do across the platform"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left font-semibold text-foreground pb-3 pr-4 min-w-[180px]">
                  Permission
                </th>
                {ROLES.map((role) => (
                  <th key={role} className="pb-3 px-3 text-center">
                    <RoleBadge role={role} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {PERMISSION_MATRIX.map((row) => (
                <tr
                  key={row.permission}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="py-2.5 pr-4 text-foreground font-medium text-xs">
                    {row.permission}
                  </td>
                  {ROLES.map((role) => (
                    <td key={role} className="py-2.5 px-3 text-center">
                      {row[role] ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                          <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-muted">
                          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageCard>
    </div>
  );
};

// ==================== Team Members Tab ====================
const TeamMembersTab: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  const { data: users, isLoading } = useListAllUsers();
  const { mutate: setUserRole, isPending: isSettingRole } = useSetUserRole();
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const isAdmin = profile.role === "Admin";
  const canView = profile.role === "Admin" || profile.role === "SalesManager";

  if (!canView) {
    return (
      <PageCard>
        <div
          className="flex flex-col items-center justify-center py-12 gap-3"
          data-ocid="settings.team.no_access_state"
        >
          <Shield className="w-10 h-10 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">
            Access Restricted
          </p>
          <p className="text-xs text-muted-foreground text-center max-w-xs">
            Only Admins and Sales Managers can view team members.
          </p>
        </div>
      </PageCard>
    );
  }

  const roleCounts: Record<Role, number> | null = users
    ? {
        Admin: users.filter((u) => u.role === "Admin").length,
        SalesManager: users.filter((u) => u.role === "SalesManager").length,
        Counselor: users.filter((u) => u.role === "Counselor").length,
        Telecaller: users.filter((u) => u.role === "Telecaller").length,
      }
    : null;

  const handleRoleChange = (userId: string, newRole: Role) => {
    setUpdatingUserId(userId);
    setUserRole(
      { userId, role: newRole },
      {
        onSuccess: () => {
          toast.success("Role updated");
          setUpdatingUserId(null);
        },
        onError: (err) => {
          toast.error(`Failed: ${err.message}`);
          setUpdatingUserId(null);
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ROLES.map((role) => {
          const count = roleCounts?.[role] ?? 0;
          const cfg = ROLE_CONFIG[role];
          return (
            <div
              key={role}
              className="bg-card border border-border rounded-xl p-4 shadow-sm"
            >
              <p className={cn("text-xl font-bold", cfg.color)}>
                {isLoading ? "—" : count}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {cfg.label}s
              </p>
            </div>
          );
        })}
      </div>

      {/* Users list */}
      <PageCard
        title="Team Members"
        description={users ? `${users.length} total users` : "Loading…"}
      >
        {isLoading ? (
          <div className="space-y-3" data-ocid="settings.team.loading_state">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-9 h-9 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-8 w-36" />
              </div>
            ))}
          </div>
        ) : !users?.length ? (
          <div
            className="flex flex-col items-center gap-2 py-10"
            data-ocid="settings.team.empty_state"
          >
            <Users className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No team members found
            </p>
          </div>
        ) : (
          <div className="space-y-1" data-ocid="settings.team.list">
            {users.map((user, idx) => (
              <div
                key={user.id}
                className="flex items-center gap-3 py-2.5 px-1 rounded-lg hover:bg-muted/40 transition-colors"
                data-ocid={`settings.team.item.${idx + 1}`}
              >
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground flex-shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">
                      {user.name}
                    </p>
                    {user.id === profile.id && (
                      <Badge
                        variant="outline"
                        className="text-[10px] py-0 px-1.5"
                      >
                        You
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
                {isAdmin && user.id !== profile.id ? (
                  <div className="flex-shrink-0 w-40">
                    <Select
                      defaultValue={user.role}
                      onValueChange={(val) =>
                        handleRoleChange(user.id, val as Role)
                      }
                      disabled={isSettingRole && updatingUserId === user.id}
                    >
                      <SelectTrigger
                        className="h-8 text-xs"
                        data-ocid={`settings.team.role_select.${idx + 1}`}
                      >
                        <SelectValue />
                        {isSettingRole && updatingUserId === user.id && (
                          <Loader2 className="ml-1 h-3 w-3 animate-spin" />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => (
                          <SelectItem key={r} value={r} className="text-xs">
                            {ROLE_CONFIG[r].label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="flex-shrink-0">
                    <RoleBadge role={user.role} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </PageCard>
    </div>
  );
};

// ==================== AI Settings Tab ====================
const AiSettingsTab: React.FC = () => {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const { mutate: saveKey, isPending } = useSetMyAiApiKey();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      toast.error("Please enter a valid API key");
      return;
    }
    saveKey(
      { apiKey },
      {
        onSuccess: () => {
          toast.success("API key saved securely");
          setApiKey("");
        },
        onError: (err) => toast.error(`Failed: ${err.message}`),
      },
    );
  };

  return (
    <div className="space-y-6">
      {/* AI Key */}
      <PageCard
        title="OpenAI API Key"
        description="Your key is encrypted and stored securely per user — never shared across accounts"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-muted/40 rounded-xl border border-border">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <KeyRound className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Why add your API key?
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Atlas CRM uses OpenAI to power lead scoring, sentiment analysis,
                next-action recommendations, and message generation. Your key is
                stored per-user on the blockchain and never visible to others.
              </p>
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                data-ocid="settings.ai.openai_docs_link"
              >
                Get your API key from OpenAI
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="ai-api-key">API Key</Label>
              <div className="relative">
                <Input
                  id="ai-api-key"
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-proj-…"
                  className="pr-10 font-mono text-sm"
                  autoComplete="off"
                  data-ocid="settings.ai.api_key_input"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((s) => !s)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showKey ? "Hide API key" : "Show API key"}
                  data-ocid="settings.ai.toggle_key_button"
                >
                  {showKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Starts with{" "}
                <code className="font-mono bg-muted px-1 rounded">sk-</code>.
                Your key is never logged or exposed.
              </p>
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isPending || !apiKey.trim()}
                data-ocid="settings.ai.save_key_button"
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <KeyRound className="mr-2 h-4 w-4" />
                )}
                {isPending ? "Saving…" : "Save API Key"}
              </Button>
            </div>
          </form>
        </div>
      </PageCard>

      {/* AI Capabilities */}
      <PageCard
        title="AI Capabilities"
        description="Features powered by your OpenAI key"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              icon: "🎯",
              title: "Lead Scoring",
              desc: "Score leads 0-100 based on engagement and profile data",
            },
            {
              icon: "💬",
              title: "Message Generation",
              desc: "Craft personalized email, WhatsApp, and SMS follow-ups",
            },
            {
              icon: "📊",
              title: "Sentiment Analysis",
              desc: "Detect urgency and sentiment from conversation notes",
            },
            {
              icon: "⚡",
              title: "Next Action Recommendations",
              desc: "AI-driven suggestions for the best next step",
            },
            {
              icon: "🔮",
              title: "Conversion Prediction",
              desc: "Predict the likelihood of a lead converting",
            },
            {
              icon: "📝",
              title: "Note Summarization",
              desc: "Auto-summarize long conversation threads",
            },
          ].map((cap) => (
            <div
              key={cap.title}
              className="flex gap-3 p-3 rounded-lg bg-muted/30 border border-border"
            >
              <span className="text-xl flex-shrink-0">{cap.icon}</span>
              <div>
                <p className="text-xs font-semibold text-foreground">
                  {cap.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {cap.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </PageCard>
    </div>
  );
};

// ==================== Main SettingsPage ====================
interface SettingsPageProps {
  profile: UserProfile;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ profile }) => {
  const { theme, setTheme } = useTheme();
  const { mutate: generateSample, isPending: isGenerating } =
    useGenerateSampleData();
  const isAdmin = profile.role === "Admin";

  return (
    <div className="space-y-6 max-w-4xl" data-ocid="settings.page">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Settings
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Manage your profile, team, and application preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RoleBadge role={profile.role} />
        </div>
      </div>

      {/* Main tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList
          className="grid w-full grid-cols-3 max-w-md"
          data-ocid="settings.tabs"
        >
          <TabsTrigger value="profile" data-ocid="settings.profile_tab">
            Profile
          </TabsTrigger>
          <TabsTrigger value="team" data-ocid="settings.team_tab">
            Team Members
          </TabsTrigger>
          <TabsTrigger value="ai" data-ocid="settings.ai_tab">
            <Bot className="w-3.5 h-3.5 mr-1.5" />
            AI Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6 mt-0">
          <ProfileTab profile={profile} />
        </TabsContent>

        <TabsContent value="team" className="mt-0">
          <TeamMembersTab profile={profile} />
        </TabsContent>

        <TabsContent value="ai" className="mt-0">
          <AiSettingsTab />
        </TabsContent>
      </Tabs>

      <Separator />

      {/* Appearance section */}
      <PageCard
        title="Appearance"
        description="Choose your preferred visual theme"
      >
        <div className="flex items-center gap-3 flex-wrap">
          {[
            { value: "light", icon: Sun, label: "Light" },
            { value: "dark", icon: Moon, label: "Dark" },
            { value: "system", icon: ChevronDown, label: "System" },
          ].map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              data-ocid={`settings.theme.${value}_button`}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-150",
                theme === value
                  ? "border-primary bg-primary/10 text-primary shadow-sm"
                  : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-border hover:bg-muted/50",
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
              {theme === value && <Check className="w-3 h-3" />}
            </button>
          ))}
        </div>
      </PageCard>

      {/* Developer tools */}
      <PageCard
        title="Developer Tools"
        description="Testing and data management"
      >
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Generate sample leads, tasks, and activities to preview the CRM with
            realistic data.
          </p>
          <Button
            type="button"
            variant="outline"
            disabled={isGenerating}
            onClick={() =>
              generateSample(undefined, {
                onSuccess: () => toast.success("Sample data generated!"),
                onError: (e) => toast.error(`Failed: ${e.message}`),
              })
            }
            data-ocid="settings.generate_sample_button"
          >
            {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isGenerating ? "Generating…" : "Generate Sample Data"}
          </Button>
        </div>
      </PageCard>

      {/* Danger zone — Admin only */}
      {isAdmin && (
        <div
          className="bg-card border-2 border-destructive/30 rounded-xl shadow-sm overflow-hidden"
          data-ocid="settings.danger_zone.panel"
        >
          <div className="flex items-center gap-2 px-5 py-4 bg-destructive/5 border-b border-destructive/20">
            <Trash2 className="w-4 h-4 text-destructive" />
            <h2 className="text-sm font-semibold text-destructive">
              Danger Zone
            </h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Clear All Data
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Permanently delete all leads, tasks, documents, and
                  activities. This cannot be undone.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    data-ocid="settings.danger.clear_data_button"
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Clear All Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent data-ocid="settings.danger.dialog">
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will permanently delete{" "}
                      <strong>
                        all leads, tasks, documents, and activity logs
                      </strong>{" "}
                      from the system. This cannot be undone and there is no
                      backup.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel data-ocid="settings.danger.cancel_button">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                      data-ocid="settings.danger.confirm_button"
                      onClick={() =>
                        toast.error(
                          "Data clearing is restricted in this environment",
                        )
                      }
                    >
                      Yes, clear everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
