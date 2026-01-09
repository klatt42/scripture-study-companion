'use client';

import { useState, useEffect } from 'react';
import DashboardHeader from '@/components/DashboardHeader';
import { Brain, Eye, EyeOff, ThumbsUp, ThumbsDown, RotateCcw, Trophy, ChevronRight } from 'lucide-react';

interface MemoryVerse {
  id: string;
  reference: string;
  text: string;
  translation: string;
  ease_factor: number;
  interval: number;
  repetitions: number;
  next_review: string;
}

// SM-2 Algorithm implementation
function calculateSM2(
  quality: number, // 0-5 rating
  repetitions: number,
  easeFactor: number,
  interval: number
): { repetitions: number; easeFactor: number; interval: number; nextReview: Date } {
  let newRepetitions = repetitions;
  let newEaseFactor = easeFactor;
  let newInterval = interval;

  if (quality >= 3) {
    // Correct response
    if (repetitions === 0) {
      newInterval = 1;
    } else if (repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * easeFactor);
    }
    newRepetitions = repetitions + 1;
  } else {
    // Incorrect response - reset
    newRepetitions = 0;
    newInterval = 1;
  }

  // Update ease factor
  newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEaseFactor < 1.3) newEaseFactor = 1.3;

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);

  return {
    repetitions: newRepetitions,
    easeFactor: newEaseFactor,
    interval: newInterval,
    nextReview,
  };
}

// Sample verses for demo
const SAMPLE_DUE_VERSES: MemoryVerse[] = [
  {
    id: '1',
    reference: 'John 3:16',
    text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
    translation: 'NIV',
    ease_factor: 2.5,
    interval: 1,
    repetitions: 3,
    next_review: new Date().toISOString(),
  },
  {
    id: '2',
    reference: 'Philippians 4:13',
    text: 'I can do all things through Christ who strengthens me.',
    translation: 'NKJV',
    ease_factor: 2.3,
    interval: 3,
    repetitions: 5,
    next_review: new Date().toISOString(),
  },
  {
    id: '3',
    reference: 'Romans 8:28',
    text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
    translation: 'NIV',
    ease_factor: 2.1,
    interval: 1,
    repetitions: 2,
    next_review: new Date().toISOString(),
  },
];

type ReviewQuality = 'again' | 'hard' | 'good' | 'easy';

export default function MemoryPracticePage() {
  const [verses, setVerses] = useState<MemoryVerse[]>(SAMPLE_DUE_VERSES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    total: SAMPLE_DUE_VERSES.length,
    correct: 0,
    incorrect: 0,
  });

  const currentVerse = verses[currentIndex];

  const handleReview = (quality: ReviewQuality) => {
    const qualityMap: Record<ReviewQuality, number> = {
      again: 0,
      hard: 2,
      good: 4,
      easy: 5,
    };

    const q = qualityMap[quality];
    const isCorrect = q >= 3;

    // Update stats
    setSessionStats((prev) => ({
      ...prev,
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1),
    }));

    // Calculate SM-2 and update verse
    const sm2Result = calculateSM2(
      q,
      currentVerse.repetitions,
      currentVerse.ease_factor,
      currentVerse.interval
    );

    // Update verse in list
    setVerses((prev) =>
      prev.map((v) =>
        v.id === currentVerse.id
          ? {
              ...v,
              repetitions: sm2Result.repetitions,
              ease_factor: sm2Result.easeFactor,
              interval: sm2Result.interval,
              next_review: sm2Result.nextReview.toISOString(),
            }
          : v
      )
    );

    // Move to next verse or complete session
    if (currentIndex < verses.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    } else {
      setSessionComplete(true);
    }
  };

  const getIntervalText = (quality: ReviewQuality): string => {
    const qualityMap: Record<ReviewQuality, number> = {
      again: 0,
      hard: 2,
      good: 4,
      easy: 5,
    };
    const result = calculateSM2(
      qualityMap[quality],
      currentVerse.repetitions,
      currentVerse.ease_factor,
      currentVerse.interval
    );
    if (result.interval === 1) return '1 day';
    if (result.interval < 30) return `${result.interval} days`;
    if (result.interval < 365) return `${Math.round(result.interval / 30)} months`;
    return `${Math.round(result.interval / 365)} years`;
  };

  if (sessionComplete) {
    const accuracy = Math.round((sessionStats.correct / sessionStats.total) * 100);
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader
          showBackLink
          backLinkHref="/dashboard/memory"
          pageTitle="Session Complete"
          pageIcon="🎉"
          colorScheme="gold"
        />

        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-amber-600" />
            </div>

            <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Georgia, serif' }}>
              Great Work!
            </h2>
            <p className="text-gray-600 mb-8">You've completed your practice session.</p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-gray-900">{sessionStats.total}</div>
                <div className="text-sm text-gray-500">Verses Reviewed</div>
              </div>
              <div className="p-4 bg-green-50 rounded-xl">
                <div className="text-2xl font-bold text-green-600">{sessionStats.correct}</div>
                <div className="text-sm text-gray-500">Correct</div>
              </div>
              <div className="p-4 bg-red-50 rounded-xl">
                <div className="text-2xl font-bold text-red-600">{sessionStats.incorrect}</div>
                <div className="text-sm text-gray-500">Need Review</div>
              </div>
            </div>

            <div className="mb-8">
              <div className="text-sm text-gray-500 mb-2">Session Accuracy</div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    accuracy >= 80 ? 'bg-green-500' : accuracy >= 60 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${accuracy}%` }}
                />
              </div>
              <div className="text-2xl font-bold mt-2">{accuracy}%</div>
            </div>

            <div className="flex gap-4">
              <a
                href="/dashboard/memory"
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Back to Memory
              </a>
              <button
                onClick={() => {
                  setSessionComplete(false);
                  setCurrentIndex(0);
                  setShowAnswer(false);
                  setSessionStats({ total: verses.length, correct: 0, incorrect: 0 });
                }}
                className="flex-1 py-3 px-4 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Practice Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        showBackLink
        backLinkHref="/dashboard/memory"
        pageTitle="Practice Session"
        pageIcon="🧠"
        colorScheme="gold"
      />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>
              {currentIndex + 1} of {verses.length}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / verses.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Flashcard */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>
                  {currentVerse.reference}
                </h2>
                <span className="text-amber-100 text-sm">{currentVerse.translation}</span>
              </div>
              <div className="text-right text-sm text-amber-100">
                <div>Reviews: {currentVerse.repetitions}</div>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-8">
            {!showAnswer ? (
              <div className="text-center py-12">
                <Brain className="w-16 h-16 mx-auto mb-6 text-gray-300" />
                <p className="text-gray-600 mb-8">
                  Try to recall the verse from memory...
                </p>
                <button
                  onClick={() => setShowAnswer(true)}
                  className="px-8 py-4 bg-amber-100 text-amber-700 rounded-xl font-medium hover:bg-amber-200 transition flex items-center gap-2 mx-auto"
                >
                  <Eye className="w-5 h-5" />
                  Show Answer
                </button>
              </div>
            ) : (
              <div>
                <p
                  className="text-xl text-gray-800 leading-relaxed text-center italic"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  "{currentVerse.text}"
                </p>
              </div>
            )}
          </div>

          {/* Rating Buttons */}
          {showAnswer && (
            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center mb-4">
                How well did you remember this verse?
              </p>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => handleReview('again')}
                  className="p-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition flex flex-col items-center"
                >
                  <ThumbsDown className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">Again</span>
                  <span className="text-[10px] text-red-500">{getIntervalText('again')}</span>
                </button>
                <button
                  onClick={() => handleReview('hard')}
                  className="p-3 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition flex flex-col items-center"
                >
                  <span className="text-lg mb-1">😐</span>
                  <span className="text-xs font-medium">Hard</span>
                  <span className="text-[10px] text-orange-500">{getIntervalText('hard')}</span>
                </button>
                <button
                  onClick={() => handleReview('good')}
                  className="p-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition flex flex-col items-center"
                >
                  <ThumbsUp className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">Good</span>
                  <span className="text-[10px] text-green-500">{getIntervalText('good')}</span>
                </button>
                <button
                  onClick={() => handleReview('easy')}
                  className="p-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition flex flex-col items-center"
                >
                  <span className="text-lg mb-1">🎯</span>
                  <span className="text-xs font-medium">Easy</span>
                  <span className="text-[10px] text-blue-500">{getIntervalText('easy')}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <h4 className="font-medium text-amber-900 mb-2">Memory Tips</h4>
          <ul className="text-sm text-amber-800 space-y-1">
            <li>• Visualize the scene or concept in the verse</li>
            <li>• Say the verse out loud while reviewing</li>
            <li>• Connect new verses to ones you already know</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
