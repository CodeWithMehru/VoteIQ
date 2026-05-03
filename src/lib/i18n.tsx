'use client';

import * as React from 'react';
import { z } from 'zod';

const _DictionarySchema = z.record(z.string(), z.string());
type Dictionary = z.infer<typeof _DictionarySchema>;

interface LanguageContextType {
  readonly language: string;
  readonly setLanguage: (lang: string) => void;
  readonly strings: Dictionary;
}

const LanguageContext = React.createContext<LanguageContextType | undefined>(undefined);

const DEFAULT_STRINGS: Dictionary = {
  simulator_title: 'EVM Simulator',
  voter_id: 'Voter ID',
  verify_proceed: 'Verify & Proceed',
  vote_cast_success: 'Vote Cast Successfully',
  duty_complete: 'Your civic duty is complete.',
  language_name: 'English',
  secure_dashboard: 'Secure Officer Dashboard',
  officer_control: 'Election Officer Control',
  welcome_officer: 'Welcome, Officer. Manage election state and monitor live tallies.',
  reset_election: 'Reset Election Data',
  resetting_btn: 'Resetting...',
  total_turnout: 'Total Turnout',
  party_a_share: 'Party A Share',
  party_b_share: 'Party B Share',
  party_c_share: 'Party C Share',
  live_vote_tallies: 'Live Vote Tallies',
  live: 'LIVE',
  party: 'Party',
  votes: 'Votes',
  percentage: 'Percentage',
  system_broadcast: 'System Broadcast',
  push_alerts: 'Push emergency alerts to all active EVM terminals.',
  send_alert: 'Send System Alert',
  broadcasting: 'Broadcasting...',
  live_voter_log: 'Live Voter Log',
  admin_view: 'ADMIN VIEW',
  voter_name: 'Voter Name',
  party_voted: 'Party Voted',
  timestamp: 'Timestamp',
  no_votes: 'No votes have been cast yet.',
} as const satisfies Dictionary;

/**
 * Singularity Architecture: I18n Provider with Zod Validation
 */
export function LanguageProvider({ children }: { readonly children: React.ReactNode }): React.ReactNode {
  const [language, setLanguage] = React.useState<string>('en');
  const [strings, setStrings] = React.useState<Dictionary>(DEFAULT_STRINGS);

  React.useEffect((): void => {
    const loadStrings = async (): Promise<void> => {
      if (language === 'en') {
        setStrings(DEFAULT_STRINGS);
        return;
      }

      try {
        const res: Response = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            texts: Object.values(DEFAULT_STRINGS), 
            targetLanguage: language 
          }),
        });
        
        const rawData: unknown = await res.json();
        const payloadSchema = z.object({
          data: z.object({
            translations: z.array(z.string()),
          }),
        });

        const parsed = payloadSchema.safeParse(rawData);
        if (parsed.success) {
          const newStrings: Dictionary = {};
          const keys: string[] = Object.keys(DEFAULT_STRINGS);
          parsed.data.data.translations.forEach((translation: string, idx: number): void => {
            const key: string | undefined = keys[idx];
            if (key) {
              newStrings[key] = translation;
            }
          });
          setStrings(newStrings);
        }
      } catch (error: unknown) {
        console.error('Translation failed:', error);
        setStrings(DEFAULT_STRINGS);
      }
    };

    void loadStrings();
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, strings } satisfies LanguageContextType}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = React.useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
