import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PreferenceFields } from "./PreferenceFields";
import { UserRole } from "@/lib/types";

interface PreferencesProps {
  role: UserRole;
  onComplete: (data: Record<string, any>) => void;
  data?: Record<string, any>;
}

export function Preferences({ role, onComplete, data }: PreferencesProps) {
  const [preferences, setPreferences] = useState(data || {
    emailNotifications: true,
    smsNotifications: false,
    darkMode: false,
  });

  const handleToggle = (key: string) => {
    const updatedPreferences = {
      ...preferences,
      [key]: !preferences[key as keyof typeof preferences],
    };
    setPreferences(updatedPreferences);
    onComplete(updatedPreferences);
  };

  useEffect(() => {
    onComplete(preferences);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <PreferenceFields preferences={preferences} onToggle={handleToggle} />
        </div>
      </CardContent>
    </Card>
  );
}

