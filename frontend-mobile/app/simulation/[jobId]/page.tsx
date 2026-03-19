'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import jobsData from '@/data/jobs.json';
import simulationsData from '@/data/simulations.json';
import type { Job, DaySimulation } from '@/lib/types';
import { storage } from '@/lib/storage';
import { ArrowRight, Clock } from 'lucide-react';

export default function SimulationPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [job, setJob] = useState<Job | null>(null);
  const [simulation, setSimulation] = useState<DaySimulation | null>(null);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);

  useEffect(() => {
    const foundJob = (jobsData as unknown as Job[]).find((j) => j.id === jobId);
    setJob(foundJob || null);

    const foundSim = (simulationsData as unknown as DaySimulation[]).find(
      (s) => s.jobId === jobId
    );
    setSimulation(foundSim || null);
  }, [jobId]);

  if (!job || !simulation) return null;

  const currentScene = simulation.scenes[currentSceneIndex];
  const isLastScene = currentSceneIndex === simulation.scenes.length - 1;
  const progress = ((currentSceneIndex + 1) / simulation.scenes.length) * 100;

  const handleChoiceSelect = (choiceIndex: number) => {
    setSelectedChoice(choiceIndex);
  };

  const handleNext = () => {
    if (selectedChoice === null) return;

    // Award XP for the choice
    const choice = currentScene.choices[selectedChoice];
    storage.xp.add(choice.xpReward, `${job?.name} 시뮬레이션 진행`);

    if (isLastScene) {
      // Complete simulation
      const totalXP = simulation.scenes.reduce(
        (acc, scene) =>
          acc + Math.max(...scene.choices.map((c) => c.xpReward)),
        0
      );
      storage.simulations.add({
        jobId: job?.id || jobId,
        completedAt: new Date().toISOString(),
        earnedXP: totalXP,
      });
      router.push(`/simulation/${jobId}/complete`);
    } else {
      setCurrentSceneIndex(currentSceneIndex + 1);
      setSelectedChoice(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">{job.title}</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            {currentScene.time}
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Scene Content */}
      <div className="flex-1 p-6 space-y-6">
        {/* Scene Image/Illustration */}
        <Card className="glass-card p-8 text-center">
          <div className="text-6xl mb-4">{currentScene.emoji || '💼'}</div>
          <h3 className="text-xl font-bold mb-2">{currentScene.title}</h3>
          <p className="text-muted-foreground">{currentScene.description}</p>
        </Card>

        {/* Choices */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground">
            어떻게 하시겠어요?
          </h4>
          {currentScene.choices.map((choice, idx) => (
            <Card
              key={idx}
              className={`glass-card p-4 cursor-pointer transition-all ${
                selectedChoice === idx
                  ? 'ring-2 ring-primary bg-primary/10'
                  : 'hover:bg-white/5'
              }`}
              onClick={() => handleChoiceSelect(idx)}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    selectedChoice === idx
                      ? 'border-primary bg-primary'
                      : 'border-muted'
                  }`}
                >
                  {selectedChoice === idx && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium mb-1">{choice.text}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>+{choice.xpReward} XP</span>
                    {choice.skillGained && (
                      <span>• {choice.skillGained}</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Next Button */}
      <div className="sticky bottom-0 bg-background/80 backdrop-blur-xl border-t border-border p-4">
        <Button
          size="lg"
          className="w-full gradient-purple"
          disabled={selectedChoice === null}
          onClick={handleNext}
        >
          {isLastScene ? '완료하기' : '다음 장면'}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
