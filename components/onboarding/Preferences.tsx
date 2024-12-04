import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PreferenceFields } from "./PreferenceFields";
import { PreferencesProps } from "@/lib/types/onboarding";

export function Preferences({ onComplete }: PreferencesProps) {
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    darkMode: false,
  });

  const handleToggle = (key: string) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(preferences);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <PreferenceFields preferences={preferences} onToggle={handleToggle} />
          <Button type="submit" className="w-full">
            Complete
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
