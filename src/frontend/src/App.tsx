import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import type React from "react";
import { AuthenticatedApp } from "./components/AuthenticatedApp";
import { LandingPage } from "./components/LandingPage";
import { LoadingScreen } from "./components/LoadingScreen";
import { OnboardingProfile } from "./components/OnboardingProfile";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetMyProfile } from "./hooks/useQueries";

const App: React.FC = () => {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { isFetching: isActorFetching } = useActor();
  const { data: profile, isLoading: isLoadingProfile } = useGetMyProfile();

  let content: React.ReactNode;

  if (isInitializing) {
    content = <LoadingScreen />;
  } else if (!isAuthenticated) {
    content = <LandingPage />;
  } else if (isActorFetching || isLoadingProfile) {
    content = <LoadingScreen />;
  } else if (!profile) {
    // Authenticated but no profile — onboarding
    content = <OnboardingProfile key={identity?.getPrincipal().toString()} />;
  } else {
    content = (
      <AuthenticatedApp
        key={identity?.getPrincipal().toString()}
        profile={profile}
      />
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      {content}
      <Toaster position="bottom-right" richColors />
    </ThemeProvider>
  );
};

export default App;
