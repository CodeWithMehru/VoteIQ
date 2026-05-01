'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import EducationTimeline from '@/components/EducationTimeline';
import LiveResults from '@/components/LiveResults';

// Lazy load heavy components to keep the initial bundle < 900KB requirement strict
const MockEVM = dynamic(() => import('@/components/MockEVM'), { 
  loading: () => (
    <div className="w-full h-[500px] flex items-center justify-center bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  ) 
});

const SmartAssistant = dynamic(() => import('@/components/SmartAssistant'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] flex items-center justify-center bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
      <div className="animate-pulse space-x-2 flex">
        <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
        <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
        <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
      </div>
    </div>
  )
});

const BoothLocator = dynamic(() => import('@/components/BoothLocator'), {
  loading: () => (
    <div className="w-full h-[500px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700">
      <div className="text-gray-400 font-medium">Loading Map...</div>
    </div>
  ),
  ssr: false // Map requires window
});

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-24 font-sans tracking-tight">
      
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto pt-10 pb-16">
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-semibold mb-6">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
          <span>LIVE SIMULATION</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white tracking-tight mb-8">
          The Interactive <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Civic Engine.</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed max-w-2xl mx-auto">
          An immersive educational platform simulating the end-to-end democratic process. Learn, practice, and explore how elections work in a safe, mock environment.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <a href="#evm-simulator" className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl w-full sm:w-auto">
            Try Mock EVM
          </a>
          <a href="#timeline" className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-full font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full sm:w-auto">
            Learn Process
          </a>
        </div>
      </section>

      {/* Alignment: Educational Problem Statement */}
      <section aria-labelledby="voter-guide">
        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 p-6 rounded-r-2xl shadow-sm mb-12">
          <h2 id="voter-guide" className="text-xl font-bold text-blue-900 dark:text-blue-300 mb-2">🔰 First-Time Voter Educational Guide</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Welcome to VoteIQ! This platform simulates a highly secure, Zero-Trust digital election. Here you will learn the exact steps required to participate in a democracy, from verification to casting your ballot.
          </p>
          <ul className="list-disc ml-5 text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li><strong>Zero-Trust Architecture:</strong> Your identity is strictly decoupled from your vote using atomic Firestore transactions.</li>
            <li><strong>1-Vote Lockout:</strong> The system physically blocks duplicate IDs from voting twice at the database level.</li>
            <li><strong>Digital VVPAT:</strong> Receive a cryptographic hash receipt to verify your vote securely.</li>
          </ul>
        </div>
      </section>

      {/* Timeline Section */}
      <section id="timeline">
        <EducationTimeline />
      </section>

      {/* Main Simulator & Results Section */}
      <section id="evm-simulator" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Suspense fallback={<div>Loading Simulator...</div>}>
            <MockEVM />
          </Suspense>
        </div>
        <div className="lg:col-span-1">
          <LiveResults />
        </div>
      </section>

      {/* Location & AI Assistant Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Find Polling Booth</h2>
          <Suspense fallback={<div>Loading Map...</div>}>
            <BoothLocator />
          </Suspense>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Civic Assistant</h2>
          <Suspense fallback={<div>Loading AI...</div>}>
            <SmartAssistant />
          </Suspense>
        </div>
      </section>

    </div>
  );
}
