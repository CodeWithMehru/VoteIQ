'use client';

import { useState } from 'react';

const STEPS = [
  {
    id: 'register',
    title: 'Voter Registration',
    description: 'Ensure you are eligible and registered to vote in your constituency.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  {
    id: 'verify',
    title: 'ID Verification',
    description: 'Bring a valid government-issued ID to the polling booth.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
      </svg>
    )
  },
  {
    id: 'find',
    title: 'Find Polling Booth',
    description: 'Locate your designated polling booth on election day.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  },
  {
    id: 'cast',
    title: 'Cast Your Vote',
    description: 'Use the Electronic Voting Machine (EVM) to securely cast your ballot.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    )
  },
  {
    id: 'results',
    title: 'Election Results',
    description: 'Votes are counted transparently and results are declared.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
      </svg>
    )
  }
];

export default function EducationTimeline() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">The Democratic Journey</h2>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Understand the end-to-end process of exercising your franchise.</p>
      </div>

      <div className="relative" aria-label="Voting Process Timeline">
        {/* Desktop Line */}
        <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gray-200 dark:bg-gray-800 -translate-y-1/2 rounded-full"></div>
        {/* Desktop Progress Line */}
        <div 
          className="hidden md:block absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${(activeStep / (STEPS.length - 1)) * 100}%` }}
        ></div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {STEPS.map((step, index) => {
            const isActive = index === activeStep;
            const isPast = index < activeStep;
            
            return (
              <div 
                key={step.id} 
                className="relative flex flex-col items-center group cursor-pointer"
                onClick={() => setActiveStep(index)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveStep(index) }}
                tabIndex={0}
                role="button"
                aria-current={isActive ? 'step' : undefined}
              >
                {/* Mobile Line */}
                {index !== STEPS.length - 1 && (
                  <div className="md:hidden absolute top-14 left-1/2 w-0.5 h-full bg-gray-200 dark:bg-gray-800 -translate-x-1/2"></div>
                )}
                
                <div 
                  className={`
                    w-16 h-16 rounded-2xl flex items-center justify-center z-10 transition-all duration-300
                    ${isActive 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-110' 
                      : isPast 
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' 
                        : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'}
                  `}
                >
                  {step.icon}
                </div>
                
                <div className={`mt-6 text-center transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                  <h3 className={`font-bold text-lg mb-2 ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                    {step.title}
                  </h3>
                  <p className={`text-sm ${isActive ? 'text-gray-600 dark:text-gray-400' : 'text-gray-500 dark:text-gray-500'} hidden md:block lg:block`}>
                    {step.description}
                  </p>
                  
                  {/* Mobile Description */}
                  {isActive && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 md:hidden">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
