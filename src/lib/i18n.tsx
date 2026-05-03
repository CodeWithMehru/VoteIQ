'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export const ENGLISH_STRINGS = {
  // Common / Language Switcher
  loading: 'Translating...',

  // MockEVM
  simulator_badge: 'SIMULATION',
  simulator_title: 'Interactive EVM Simulator',
  simulator_desc: 'Experience the process of casting a digital ballot securely.',
  secured_by: 'Secured by Firebase',
  id_verification: 'ID Verification',
  id_desc: 'Enter your details to access the ballot.',
  full_name: 'Full Name',
  voter_id: 'Voter ID Number',
  verify_proceed: 'Verify & Proceed',
  digital_ballot: 'Digital Ballot',
  select_candidate: 'Select one candidate',
  vote_cast_success: 'Vote Cast Successfully!',
  duty_complete: 'Your democratic duty is complete.',
  official_receipt: 'Official Receipt',
  transaction: 'Transaction',
  verifiability_hash: 'Verifiability Hash',
  time: 'Time',
  resetting: 'Resetting terminal for next voter in 4 seconds...',

  // Dashboard
  secure_dashboard: 'SECURE DASHBOARD',
  officer_control: 'Officer Control Center',
  welcome_officer: 'Welcome, Officer. Monitor election infrastructure.',
  reset_election: 'Reset Election Data',
  resetting_btn: 'Resetting...',
  total_turnout: 'Total Turnout',
  party_a_share: 'Party A Share',
  party_b_share: 'Party B Share',
  party_c_share: 'Party C Share',
  live_vote_tallies: 'Live Vote Tallies (Firestore)',
  live: 'Live',
  party: 'Party',
  votes: 'Votes',
  percentage: 'Percentage',
  system_broadcast: 'System Broadcast',
  push_alerts: 'Push alerts to all active mock EVMs and citizen dashboards.',
  send_alert: 'Send Network Alert',
  broadcasting: 'Broadcasting...',
  live_voter_log: 'Live Voter Log (Strict Tracking)',
  admin_view: 'Admin View',
  voter_name: 'Voter Name',
  party_voted: 'Party Voted For',
  timestamp: 'Timestamp',
  no_votes: 'No votes cast yet. Waiting for voters...',
};

type StringsType = typeof ENGLISH_STRINGS;

type LanguageContextType = {
  language: string;
  setLanguage: (lang: string) => void;
  strings: StringsType;
  isTranslating: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState('en');
  const [strings, setStrings] = useState<StringsType>(ENGLISH_STRINGS);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (language === 'en') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStrings(ENGLISH_STRINGS);
      return;
    }

    const translateUI = async () => {
      setIsTranslating(true);
      try {
        const keys = Object.keys(ENGLISH_STRINGS) as (keyof StringsType)[];
        const texts = keys.map((k) => ENGLISH_STRINGS[k]);

        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ texts, targetLanguage: language }),
        });

        const data = await res.json();

        if (data.translations && data.translations.length === texts.length) {
          const newStrings: Record<string, string> = {};
          keys.forEach((key, idx) => {
            newStrings[key] = data.translations[idx];
          });
          setStrings(newStrings as StringsType);
        }
      } catch (err) {
        console.error('Translation failed:', err);
      } finally {
        setIsTranslating(false);
      }
    };

    translateUI();
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, strings, isTranslating }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
