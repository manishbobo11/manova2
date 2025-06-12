import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Brain, Heart, DollarSign, Activity, User, CheckCircle, RotateCcw, MessageCircle, TrendingUp, Calendar, Phone, AlertCircle } from 'lucide-react';
import DeepDiveFollowup from './DeepDiveFollowup';
import mcpService from '../services/mcp';
import { saveDeepDiveInsight } from '../services/firebase';

// Enhanced Wellness Survey with properly aligned questions
const WellnessSurvey = ({ userId = "demo-user-123" }) => {
  const [currentDomain, setCurrentDomain] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState({});
  const [isComplete, setIsComplete] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [wellnessScore, setWellnessScore] = useState(0);
  const [sentiment, setSentiment] = useState({});
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [followUps, setFollowUps] = useState({});
  const [isLoadingFollowUp, setIsLoadingFollowUp] = useState(false);
  const [aiIntroText, setAiIntroText] = useState('');
  const [showDeepDive, setShowDeepDive] = useState(false);
  const [deepDiveDomain, setDeepDiveDomain] = useState('');
  const [deepDiveData, setDeepDiveData] = useState({});
  const [deepDiveFollowup, setDeepDiveFollowup] = useState(null);
  const [isLoadingDeepDive, setIsLoadingDeepDive] = useState(false);
  const typewriterTimeout = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  const feedback = {
    0: {
      msg: "It looks like you haven't had any time to recharge. That's okay—life gets busy. But let's work on creating space for your well-being.",
      tip: "Even 10 minutes a day doing what calms you—walk, music, journaling—can reset your mind."
    },
    1: {
      msg: "You've rarely had time to restore yourself. That might be silently draining your energy.",
      tip: "What's one activity you enjoyed in the past but stopped? Let's reintroduce that this week."
    },
    2: {
      msg: "You're sometimes taking time for yourself. Let's turn this into a routine, not an exception.",
      tip: "Can you protect 30 minutes a week just for you? Call it your 'non-negotiable time.'"
    },
    3: {
      msg: "You're often recharging — that's great! Let's find ways to deepen that routine.",
      tip: "Think about adding small rituals like a mid-week walk, screen detox, or weekend reflection."
    },
    4: {
      msg: "Amazing! You're prioritizing your well-being. That's the kind of balance others strive for.",
      tip: "Want to mentor someone else struggling with stress? Giving back multiplies your peace."
    }
  };

  // Updated questions to better align with frequency-based responses
  const domains = [
    {
      name: 'Work & Career',
      icon: Brain,
      color: 'bg-blue-500',
      questions: [
        {
          id: 'work_1',
          text: 'Over the past two weeks, how often have you felt emotionally drained by the demands of your work?',
          aiIntro: "Let's start by understanding your work experience. This helps me gauge your emotional wellbeing at work."
        },
        {
          id: 'work_2',
          text: 'To what extent do you feel your manager or supervisor genuinely understands and supports your professional challenges?',
          aiIntro: "Now I'm curious about your support system at work. Quality leadership makes such a difference.",
          positive: true
        },
        {
          id: 'work_3',
          text: 'How frequently do you find yourself working beyond your intended hours or taking on responsibilities that feel beyond your capacity?',
          aiIntro: "Let's talk about boundaries. Work-life balance is crucial for sustainable performance."
        },
        {
          id: 'work_4',
          text: 'When you complete meaningful work, how often do you receive acknowledgment or recognition that feels authentic and valued?',
          aiIntro: "Recognition matters more than we often realize. It's about feeling seen and valued.",
          positive: true
        },
        {
          id: 'work_5',
          text: 'How connected do you currently feel to the broader purpose or meaning behind the work you do daily?',
          aiIntro: "Finally, let's explore your sense of purpose. Meaningful work can be incredibly energizing.",
          positive: true
        }
      ]
    },
    {
      name: 'Personal Life',
      icon: Heart,
      color: 'bg-red-500',
      questions: [
        {
          id: 'personal_1',
          text: 'How satisfied are you with the quality of emotional intimacy and connection in your closest relationships?',
          aiIntro: "Now let's shift to your personal relationships. These connections are the foundation of our wellbeing.",
          positive: true
        },
        {
          id: 'personal_2',
          text: 'In the past month, how often have you been able to engage in activities that genuinely restore and energize you?',
          aiIntro: "Self-care isn't selfish—it's essential. Let's see how you're nurturing yourself."
        },
        {
          id: 'personal_3',
          text: "When you're experiencing difficult emotions, how readily available do you feel your support network is to you?",
          aiIntro: "Having people to lean on during tough times makes all the difference. How's your support system?"
        },
        {
          id: 'personal_4',
          text: 'How often do you feel you can be your authentic self without judgment in your personal relationships?',
          aiIntro: "Authenticity in relationships is so important. Being accepted for who you truly are is healing.",
          positive: true
        },
        {
          id: 'personal_5',
          text: 'To what degree do you feel your personal boundaries and needs are respected by those closest to you?',
          aiIntro: "Healthy boundaries create space for healthy relationships. Let's explore this together.",
          positive: true
        }
      ]
    },
    {
      name: 'Financial Stress',
      icon: DollarSign,
      color: 'bg-green-500',
      questions: [
        {
          id: 'financial_1',
          text: 'How often do financial concerns keep you awake at night or intrude on your daily thoughts?',
          aiIntro: "Money stress can be overwhelming. Let's honestly assess how finances are affecting your peace of mind."
        },
        {
          id: 'financial_2',
          text: 'In the past three months, how frequently have you delayed important decisions due to financial uncertainty?',
          aiIntro: "Financial stress can freeze us in place. I want to understand how this might be impacting your life choices."
        },
        {
          id: 'financial_3',
          text: 'How confident do you feel in your ability to handle unexpected financial expenses without significant stress?',
          aiIntro: "Financial confidence is about more than money—it's about peace of mind. How secure do you feel?",
          positive: true
        },
        {
          id: 'financial_4',
          text: 'When making purchases, how often do you experience anxiety or guilt, even for necessary items?',
          aiIntro: "Sometimes money stress shows up in our daily spending habits. Let's explore your relationship with purchases."
        },
        {
          id: 'financial_5',
          text: 'How much do concerns about your financial future affect your ability to enjoy present moments?',
          aiIntro: "Financial worry can steal our joy in the present. I'm curious about how this affects your daily happiness."
        }
      ]
    },
    {
      name: 'Health',
      icon: Activity,
      color: 'bg-orange-500',
      questions: [
        {
          id: 'health_1',
          text: 'Over the past two weeks, how would you rate the overall quality and restfulness of your sleep?',
          aiIntro: "Sleep is the foundation of everything. Let's see how you've been resting lately.",
          positive: true
        },
        {
          id: 'health_2',
          text: 'How often do you feel you have sufficient physical and mental energy to engage fully in your daily activities?',
          aiIntro: "Energy levels tell us so much about our overall wellbeing. How are yours holding up?",
          positive: true
        },
        {
          id: 'health_3',
          text: 'In recent weeks, how frequently have you noticed physical symptoms of stress in your body (tension, headaches, digestive issues)?',
          aiIntro: "Our bodies often signal stress before our minds do. Let's check in with what your body is telling you."
        },
        {
          id: 'health_4',
          text: 'How satisfied are you with your current ability to maintain healthy habits that support your well-being?',
          aiIntro: "Healthy habits are acts of self-love. How are you doing with caring for yourself physically?",
          positive: true
        },
        {
          id: 'health_5',
          text: 'When you think about your overall health, how much anxiety or worry do you experience about potential health problems?',
          aiIntro: "Health anxiety is more common than people think. Let's explore your relationship with health concerns."
        }
      ]
    },
    {
      name: 'Self-Worth & Identity',
      icon: User,
      color: 'bg-purple-500',
      questions: [
        {
          id: 'identity_1',
          text: "How often do you feel like you're simply going through the motions without a clear sense of personal direction?",
          aiIntro: "Let's explore your sense of direction in life. Feeling lost is more common than you might think."
        },
        {
          id: 'identity_2',
          text: 'When you compare yourself to others, how frequently does this leave you feeling inadequate or behind in life?',
          aiIntro: "Comparison can be the thief of joy. I want to understand how social comparison affects your self-worth."
        },
        {
          id: 'identity_3',
          text: "How often do you experience the feeling that you don't deserve your accomplishments or that you're 'fooling' others?",
          aiIntro: "Impostor syndrome is incredibly common among successful people. Let's see if this resonates with you."
        },
        {
          id: 'identity_4',
          text: 'In moments of personal challenge or failure, how kindly and compassionately do you treat yourself?',
          aiIntro: "Self-compassion is a skill we can develop. How gentle are you with yourself during difficult times?",
          positive: true
        },
        {
          id: 'identity_5',
          text: 'How connected do you feel to your core values and authentic identity in your daily choices and actions?',
          aiIntro: "Living authentically aligned with your values is key to fulfillment. Let's explore this connection.",
          positive: true
        }
      ]
    }
  ];

  const responseOptions = [
    { value: 0, label: 'Never', color: 'bg-green-100 text-green-800' },
    { value: 1, label: 'Rarely', color: 'bg-yellow-100 text-yellow-800' },
    { value: 2, label: 'Sometimes', color: 'bg-orange-100 text-orange-800' },
    { value: 3, label: 'Often', color: 'bg-red-100 text-red-800' },
    { value: 4, label: 'Very Often', color: 'bg-red-200 text-red-900' }
  ];

  const getOptionColor = (value, isPositive) => {
    const index = isPositive ? 4 - value : value;
    return responseOptions[index].color;
  };

  // When the question changes, set the intro text
  useEffect(() => {
    if (!isComplete && !showFollowUp) {
      const currentQ = domains[currentDomain]?.questions[currentQuestion];
      if (currentQ && typeof currentQ.aiIntro === 'string') {
        setAiIntroText(currentQ.aiIntro);
      }
    }
  }, [currentDomain, currentQuestion, isComplete, showFollowUp]);

  // Typewriter effect only runs when aiIntroText changes
  useEffect(() => {
    if (!aiIntroText) return;
    setAiMessage('');
    setIsTyping(true);
    let i = 0;
    let current = '';
    if (typewriterTimeout.current) clearTimeout(typewriterTimeout.current);

    function run() {
      current += aiIntroText.charAt(i);
      setAiMessage(current);
      i++;
      if (i < aiIntroText.length) {
        typewriterTimeout.current = setTimeout(run, 30);
      } else {
        setIsTyping(false);
      }
    }
    run();

    return () => {
      if (typewriterTimeout.current) clearTimeout(typewriterTimeout.current);
    };
  }, [aiIntroText]);

  const calculateWellnessScore = () => {
    const allResponses = Object.values(responses);
    const totalPossible = allResponses.length * 4; // 4 is max score per question
    const actualScore = allResponses.reduce((sum, score) => sum + score, 0);
    // Invert the score (lower responses = higher wellness)
    const invertedScore = totalPossible - actualScore;
    const scoreOutOf10 = Math.round((invertedScore / totalPossible) * 10);
    return Math.max(1, scoreOutOf10); // Ensure minimum score of 1
  };

  const analyzeEmotionalState = () => {
    const domainScores = domains.map((domain, index) => {
      const domainResponses = domain.questions.map(q => responses[q.id] || 0);
      const average = domainResponses.reduce((sum, score) => sum + score, 0) / domain.questions.length;
      return { domain: domain.name, score: average };
    });

    // Identify primary concerns (domains with highest stress)
    const concerns = domainScores
      .filter(d => d.score >= 2.5)
      .sort((a, b) => b.score - a.score)
      .map(d => d.domain);

    // Analyze Work & Career sub-domains if it's a primary concern
    const workCareerAnalysis = concerns.includes('Work & Career') ? {
      subDomains: [
        { subDomain: "Manager Support", score: 95 },
        { subDomain: "Recognition", score: 90 },
        { subDomain: "Burnout", score: 80 }
      ]
    } : null;

    // Determine overall sentiment
    const avgScore = domainScores.reduce((sum, d) => sum + d.score, 0) / domainScores.length;
    let mood = 'positive';
    if (avgScore > 3) mood = 'very stressed';
    else if (avgScore > 2.5) mood = 'stressed';
    else if (avgScore > 2) mood = 'moderate';
    else if (avgScore > 1.5) mood = 'managing well';

    return {
      mood,
      primaryConcerns: concerns,
      domainScores,
      needsSupport: avgScore > 2.5,
      workCareerAnalysis
    };
  };

  const handleResponse = async (value) => {
    const questionId = domains[currentDomain].questions[currentQuestion].id;
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));

    setTimeout(async () => {
      if (currentQuestion < domains[currentDomain].questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        // End of domain: check if follow-up is needed
        const avgScore = calculateDomainScore(currentDomain);
        if (avgScore > 2.5) {
          // Prepare data for GPT-4
          setIsLoadingDeepDive(true);
          const domain = domains[currentDomain].name;
          const questionsAndAnswers = domains[currentDomain].questions.map(q => ({
            id: q.id,
            text: q.text,
            answer: responses[q.id] ?? 0
          }));

          try {
            const followup = await mcpService.generateDeepDiveFollowup(domain, questionsAndAnswers);
            setDeepDiveDomain(domain);
            setDeepDiveFollowup(followup);
            setShowDeepDive(true);
          } catch (e) {
            console.error('Error generating deep dive:', e);
            setDeepDiveDomain(domain);
            setDeepDiveFollowup({
              title: `Deep Dive: ${domain}`,
              followupIntro: "Thanks for sharing. Based on your check-in, here are a few things that might be contributing to your stress. Please select all that apply:",
              options: [],
              textboxPrompt: 'Share anything else?',
              rootEmotion: '',
              urgencyLevel: 'medium',
              suggestedTags: []
            });
            setShowDeepDive(true);
          } finally {
            setIsLoadingDeepDive(false);
          }
        } else {
          // No follow-up, move to next domain or finish
          goToNextDomainOrFinish();
        }
      }
    }, 500);
  };

  const calculateDomainScore = (domainIndex) => {
    const domain = domains[domainIndex];
    const domainResponses = domain.questions
      .map(q => responses[q.id])
      .filter(score => score !== undefined && score !== null);
    
    if (domainResponses.length === 0) return null;
    
    const average = domainResponses.reduce((sum, score) => sum + score, 0) / domainResponses.length;
    return Math.round(average * 25); // Convert to percentage
  };

  const getWellnessLevel = (score) => {
    if (score <= 25) return { level: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (score <= 50) return { level: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score <= 75) return { level: 'Moderate Concern', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'High Concern', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const getWellnessFeedback = (score) => {
    if (score >= 7) {
      return {
        message: "You're doing great! Your responses indicate a strong sense of wellbeing across most domains.",
        color: "text-green-600",
        bg: "bg-green-50"
      };
    } else if (score >= 5) {
      return {
        message: "You're managing well overall, though there are some areas that could use attention. Consider focusing on the domains with higher stress levels.",
        color: "text-yellow-600",
        bg: "bg-yellow-50"
      };
    } else {
      return {
        message: "Your responses suggest you're experiencing significant stress. Remember, it's okay to seek support. Consider reaching out to a mental health professional or trusted support system.",
        color: "text-red-600",
        bg: "bg-red-50"
      };
    }
  };

  const goToNextDomainOrFinish = (skipDeepDive = false) => {
    const domainScore = calculateDomainScore(currentDomain);
    if (!skipDeepDive && domainScore >= 60) {  // Stress threshold (adjustable)
      setDeepDiveDomain(domains[currentDomain].name);
      setShowDeepDive(true);
    } else if (currentDomain < domains.length - 1) {
      setCurrentDomain(prev => prev + 1);
      setCurrentQuestion(0);
      setShowFollowUp(false);
      setFollowUpQuestion('');
      setFollowUpAnswer('');
      setShowDeepDive(false);
    } else {
      setIsComplete(true);
      const score = calculateWellnessScore();
      setWellnessScore(score);
      const emotionalAnalysis = analyzeEmotionalState();
      setSentiment(emotionalAnalysis);
      setAiMessage("Thank you for sharing so openly with me. I'm analyzing your responses to provide personalized insights...");
      setTimeout(() => {
        setShowResults(true);
      }, 2000);
    }
  };

  const handleDeepDiveSave = (data) => {
    console.log("✔️ Data received for deep dive save:", data);
    const { userId, domain, reasons } = data || {};

    if (!userId || !domain || !reasons || !reasons.length) {
      console.warn("⚠️ Missing data or userId. Not continuing.");
      return;
    }

    saveDeepDiveInsight(userId, domain, data);

    // Advance to next section if requested
    if (data.continue) {
      goToNextDomainOrFinish(true);
    }
  };

  const resetSurvey = () => {
    setCurrentDomain(0);
    setCurrentQuestion(0);
    setResponses({});
    setIsComplete(false);
    setShowResults(false);
    setAiMessage('');
    setShowFollowUp(false);
    setFollowUpQuestion('');
    setFollowUpAnswer('');
    setFollowUps({});
    setWellnessScore(0);
    setSentiment({});
  };

  if (showResults) {
    const wellnessFeedback = getWellnessFeedback(wellnessScore);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 pt-20 pb-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Wellness Score Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Your Wellness Score</h1>
              <div className="relative inline-flex items-center justify-center">
                <div className={`w-32 h-32 rounded-full ${wellnessFeedback.bg} flex items-center justify-center`}>
                  <span className={`text-5xl font-bold ${wellnessFeedback.color}`}>{wellnessScore}</span>
                  <span className="text-2xl text-gray-600">/10</span>
                </div>
              </div>
              <p className="mt-4 text-lg text-gray-600">{wellnessFeedback.message}</p>
            </div>

            {/* Mood Analysis */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Emotional State Analysis</h3>
              <p className="text-gray-700 mb-2">
                Current mood: <span className="font-semibold capitalize">{sentiment.mood}</span>
              </p>
              {sentiment.primaryConcerns?.length > 0 && (
                <p className="text-gray-700 mb-2">
                  Primary areas of concern: <span className="font-semibold">{sentiment.primaryConcerns.join(', ')}</span>
                </p>
              )}
            </div>

            {/* Domain Scores */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {domains.map((domain, index) => {
                const Icon = domain.icon;
                const score = calculateDomainScore(index);
                if (score === null) return null; // Skip domains with no responses
                
                const wellness = getWellnessLevel(score);
                
                return (
                  <div key={index} className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center mb-4">
                      <div className={`${domain.color} p-3 rounded-lg mr-3`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-800">{domain.name}</h3>
                    </div>
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Stress Level</span>
                        <span>{score}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${score <= 25 ? 'bg-green-500' : score <= 50 ? 'bg-blue-500' : score <= 75 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${score}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${wellness.bg} ${wellness.color}`}>
                      {wellness.level}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Deep Dive Results */}
            {Object.keys(deepDiveData).length > 0 && (
              <div className="bg-white rounded-xl p-6 mb-8 border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Detailed Stress Analysis</h3>
                {Object.entries(deepDiveData).map(([domain, data]) => {
                  const domainMeta = domains.find(d => d.name === domain);
                  if (!domainMeta) return null;

                  return (
                    <div key={domain} className="mb-6 last:mb-0">
                      <div className="flex items-center mb-3">
                        <div className={`${domainMeta.color} p-2 rounded-lg mr-3`}>
                          <domainMeta.icon className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="font-semibold text-gray-800">{domain}</h4>
                        {data.rootEmotion && (
                          <span className="ml-3 inline-block bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium">
                            {data.rootEmotion}
                          </span>
                        )}
                      </div>
                      
                      {data.reasons && data.reasons.length > 0 && (
                        <div className="ml-10">
                          <ul className="list-disc text-gray-700 space-y-1">
                            {data.reasons.map((reason, i) => (
                              <li key={i}>{reason}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {data.summary && (
                        <div className="mt-3 ml-10 bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600 italic">{data.summary}</p>
                        </div>
                      )}
                      
                      {data.suggestedNextSteps && data.suggestedNextSteps.length > 0 && (
                        <div className="mt-3 ml-10">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Suggested Next Steps:</h5>
                          <ul className="list-disc text-gray-600 space-y-1">
                            {data.suggestedNextSteps.map((step, i) => (
                              <li key={i} className="text-sm">{step}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                View Full Dashboard
              </button>
              <button
                onClick={resetSurvey}
                className="inline-flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Take Survey Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center pt-20 pb-8 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full text-center">
          <div className="animate-pulse mb-6">
            <Brain className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
          </div>
          <div className="min-h-[100px]">
            <p className="text-lg text-gray-700 leading-relaxed">
              {aiMessage}
              {isTyping && <span className="animate-pulse">|</span>}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- Follow-up screen ---
  if (showFollowUp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
          <h2 className="text-2xl font-bold mb-4 text-indigo-700">Deep-Dive Follow-Up</h2>
          <p className="mb-6 text-gray-700">{followUpQuestion}</p>
          <form onSubmit={handleDeepDiveSave}>
            <textarea
              className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              rows={4}
              value={followUpAnswer}
              onChange={e => setFollowUpAnswer(e.target.value)}
              placeholder="Type your response here..."
              required
              disabled={isLoadingFollowUp}
            />
            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              disabled={isLoadingFollowUp || !followUpAnswer.trim()}
            >
              {isLoadingFollowUp ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (showDeepDive && deepDiveFollowup) {
    return (
      <DeepDiveFollowup
        domainName={deepDiveDomain}
        userId={userId}
        isLoading={isLoadingDeepDive}
        deepDiveData={deepDiveFollowup}
        onSave={handleDeepDiveSave}
      />
    );
  }

  const currentQ = domains[currentDomain]?.questions[currentQuestion];
  const Icon = domains[currentDomain]?.icon;
  const totalQuestions = domains.reduce((sum, domain) => sum + domain.questions.length, 0);
  const currentQuestionNumber = domains.slice(0, currentDomain).reduce((sum, domain) => sum + domain.questions.length, 0) + currentQuestion + 1;
  const progress = (currentQuestionNumber / totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 pt-16 pb-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Wellness Check-In</h1>
          <p className="text-base text-gray-600">Your personal wellness assistant</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* AI Chat Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-10">
              {/* Domain Header */}
              <div className="flex items-center mb-6">
                <div className={`${domains[currentDomain].color} p-3 rounded-lg mr-4`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{domains[currentDomain].name}</h2>
                  <p className="text-base text-gray-600">Question {currentQuestion + 1} of {domains[currentDomain].questions.length}</p>
                </div>
              </div>

              {/* AI Message */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 mb-8">
                <div className="flex items-start">
                  <Brain className="w-8 h-8 text-indigo-500 mr-3 mt-1 flex-shrink-0" />
                  <div className="min-h-[60px]">
                    <p className="text-base text-gray-700 leading-relaxed">
                      {aiMessage}
                      {isTyping && <span className="animate-pulse">|</span>}
                    </p>
                  </div>
                </div>
              </div>

              {/* Question */}
              {!isTyping && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 leading-relaxed">
                    {currentQ?.text}
                  </h3>

                  {/* Response Options */}
                  <div className="grid gap-3">
                    {responseOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleResponse(option.value)}
                        className={`flex items-center justify-between w-full p-3 rounded-lg transition-colors ${
                          responses[currentQ.id] === option.value
                            ? 'bg-gray-100'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-gray-700">
                          {option.label}
                        </span>
                        <div className={`px-3 py-1 rounded-full text-sm ${getOptionColor(option.value, currentQ?.positive)}`}>
                          {option.value}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Progress Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-8 sticky top-20">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Survey Progress</h3>
              <div className="space-y-4">
                {domains.map((domain, index) => {
                  const Icon = domain.icon;
                  const isActive = index === currentDomain;
                  const isComplete = index < currentDomain;
                  
                  return (
                    <div
                      key={index}
                      className={`flex items-center p-3 rounded-lg transition-all ${
                        isActive ? 'bg-indigo-100 border-2 border-indigo-300' :
                        isComplete ? 'bg-green-50 border-2 border-green-200' :
                        'bg-gray-50 border-2 border-gray-200'
                      }`}
                    >
                      <div className={`p-2 rounded-lg mr-3 ${
                        isActive ? domain.color :
                        isComplete ? 'bg-green-500' :
                        'bg-gray-400'
                      }`}>
                        {isComplete ? (
                          <CheckCircle className="w-5 h-5 text-white" />
                        ) : (
                          <Icon className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          isActive ? 'text-indigo-800' :
                          isComplete ? 'text-green-800' :
                          'text-gray-600'
                        }`}>
                          {domain.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {isComplete ? 'Complete' : isActive ? 'In Progress' : 'Pending'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WellnessSurvey;