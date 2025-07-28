// API endpoint for fetching stress contributors based on question ID
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { qid } = req.query;

  if (!qid) {
    return res.status(400).json({ error: 'Question ID is required' });
  }

  try {
    // Simulate API delay for loading state testing
    await new Promise(resolve => setTimeout(resolve, 500));

    // Enhanced dynamic contributor generation based on question context
    const contributorsByQuestion = {
      // Work & Career domain - Enhanced with more specific and contextual options
      'work_1': [
        'Unrealistic deadlines and constant pressure',
        'Feeling emotionally drained by work demands',
        'Lack of recognition for hard work',
        'Overwhelming workload beyond capacity',
        'Poor communication from management',
        'Absence of career growth opportunities',
        'Toxic workplace culture',
        'Job insecurity and fear of layoffs'
      ],
      'work_2': [
        'Unsupportive or absent manager',
        'Feeling micromanaged and controlled',
        'Lack of autonomy in decision-making',
        'Manager doesn\'t understand my challenges',
        'Inconsistent feedback and expectations',
        'Favoritism and unfair treatment',
        'No mentorship or professional development',
        'Fear of speaking up about concerns'
      ],
      'work_3': [
        'Saying "yes" to everything out of fear',
        'Unable to set healthy boundaries',
        'Taking on others\' responsibilities',
        'Working during personal time regularly',
        'Fear of disappointing others',
        'Perfectionism leading to over-commitment',
        'Guilt when not working overtime',
        'Pressure to be constantly available'
      ],
      'work_4': [
        'Hard work goes unnoticed',
        'Achievements are minimized or ignored',
        'Others take credit for my contributions',
        'No celebration of milestones',
        'Feeling invisible despite efforts',
        'Lack of positive feedback',
        'Efforts are taken for granted',
        'No advancement despite performance'
      ],
      'work_5': [
        'Work feels meaningless and empty',
        'Daily tasks lack personal significance',
        'Disconnect between values and work',
        'No sense of impact or contribution',
        'Feeling like just a cog in the machine',
        'Lost motivation and passion',
        'Questioning career choices',
        'Yearning for more purposeful work'
      ],

      // Personal Life domain - More nuanced and relatable
      'personal_1': [
        'Constant arguments and tension',
        'Feeling misunderstood by loved ones',
        'Lack of emotional support',
        'Difficulty maintaining close friendships',
        'Romantic relationship challenges',
        'Family expectations and pressure',
        'Feeling isolated despite being around people',
        'Trust issues and past relationship wounds'
      ],
      'personal_2': [
        'No time for hobbies or interests',
        'Constant busyness without fulfillment',
        'Guilt when taking time for myself',
        'Difficulty saying no to others\' requests',
        'Always putting others\' needs first',
        'Lost sense of personal identity',
        'Exhaustion from caregiving duties',
        'No energy left for self-care'
      ],
      'personal_3': [
        'Friends seem unavailable when needed',
        'Feeling like a burden to others',
        'Hesitant to ask for help',
        'Support network feels superficial',
        'Geographic distance from loved ones',
        'Difficulty opening up emotionally',
        'Past betrayals affecting trust',
        'Social anxiety preventing connection'
      ],
      'personal_4': [
        'Fear of judgment for being myself',
        'Hiding parts of my personality',
        'Feeling pressure to conform',
        'Others don\'t accept my choices',
        'Criticism for expressing opinions',
        'Having to wear different masks',
        'Fear of rejection if truly known',
        'Cultural or family disapproval'
      ],
      'personal_5': [
        'Others ignore my stated limits',
        'Feeling guilty for having boundaries',
        'People take advantage of my kindness',
        'My needs are dismissed as unimportant',
        'Pressure to be available 24/7',
        'Difficulty enforcing personal rules',
        'Others guilt-trip me into compliance',
        'Fear of conflict when setting limits'
      ],

      // Financial Security domain - Practical and immediate concerns
      'financial_1': [
        'Living paycheck to paycheck',
        'Unexpected expenses causing panic',
        'Unable to save for emergencies',
        'Debt growing faster than income',
        'Fear of financial ruin',
        'Comparing finances to others',
        'Shame about money struggles',
        'Avoiding looking at bank statements'
      ],
      'financial_2': [
        'Fear of making wrong financial choices',
        'Paralyzed by too many options',
        'Putting off important decisions',
        'Analysis paralysis with investments',
        'Fear of financial commitment',
        'Uncertainty about future stability',
        'Avoiding financial planning altogether',
        'Procrastinating on money matters'
      ],
      'financial_3': [
        'No emergency fund buffer',
        'Living in constant financial anxiety',
        'One emergency away from crisis',
        'Unable to handle unexpected costs',
        'Borrowing money regularly',
        'Credit maxed out already',
        'No financial safety net',
        'Fear of asking family for help'
      ],
      'financial_4': [
        'Guilt over every purchase decision',
        'Anxiety even buying necessities',
        'Obsessing over spending choices',
        'Fear of being judged for purchases',
        'Regret after buying anything',
        'Constant money-related worry',
        'Unable to enjoy earned money',
        'Perfectionism with budgeting'
      ],
      'financial_5': [
        'Fear of never having enough',
        'Anxiety about retirement planning',
        'Worry overshadowing present moments',
        'Unable to enjoy current financial state',
        'Catastrophic thinking about money',
        'Future financial doom scenarios',
        'Money anxiety affecting relationships',
        'Stress preventing financial enjoyment'
      ],

      // Health & Wellness domain - Holistic health concerns
      'health_1': [
        'Racing thoughts keeping me awake',
        'Stress preventing restful sleep',
        'Inconsistent sleep schedule',
        'Waking up tired despite hours slept',
        'Sleep anxiety and bedtime worry',
        'Technology interfering with sleep',
        'Physical discomfort disrupting rest',
        'Nightmares or disturbing dreams'
      ],
      'health_2': [
        'Chronic exhaustion and fatigue',
        'No motivation for daily activities',
        'Energy crashes throughout the day',
        'Feeling depleted by simple tasks',
        'Mental fog and lack of clarity',
        'Physical heaviness and lethargy',
        'Unable to maintain consistent energy',
        'Burnout affecting all life areas'
      ],
      'health_3': [
        'Tension headaches and neck pain',
        'Stomach issues and digestive problems',
        'Muscle tightness and body aches',
        'Heart palpitations and chest tightness',
        'Frequent illness and low immunity',
        'Skin problems and stress reactions',
        'Appetite changes and eating issues',
        'Physical symptoms with no clear cause'
      ],
      'health_4': [
        'All-or-nothing approach to health',
        'Guilt over missing workouts',
        'Inconsistent healthy habits',
        'Too busy for self-care routines',
        'Perfectionism sabotaging progress',
        'Lack of motivation for wellness',
        'Overwhelming health information',
        'Social pressure affecting choices'
      ],
      'health_5': [
        'Fear of developing serious illness',
        'Catastrophic thinking about symptoms',
        'Avoiding medical checkups',
        'Health anxiety affecting daily life',
        'Worry about family health history',
        'Fear of aging and decline',
        'Obsessing over health information',
        'Anxiety about medical procedures'
      ],

      // Self-Worth & Identity domain - Deep personal struggles
      'identity_1': [
        'Feeling lost and without direction',
        'Unclear about life goals and purpose',
        'Comparing my journey to others\' success',
        'Feeling behind in life milestones',
        'Uncertainty about career path',
        'Questioning major life decisions',
        'Lacking clear personal values',
        'Feeling adrift without anchor'
      ],
      'identity_2': [
        'Everyone else seems more successful',
        'Social media fueling inadequacy',
        'Feeling inferior to peers',
        'Constant self-comparison',
        'Others\' achievements highlighting my lack',
        'Jealousy over others\' opportunities',
        'Feeling like I\'m falling behind',
        'Imposter syndrome in social settings'
      ],
      'identity_3': [
        'Feeling like a fraud at work',
        'Fear of being "found out"',
        'Attributing success to luck',
        'Downplaying my achievements',
        'Feeling undeserving of recognition',
        'Anxiety about maintaining performance',
        'Comparing myself to "real" experts',
        'Fear that others overestimate my abilities'
      ],
      'identity_4': [
        'Harsh self-criticism and judgment',
        'Perfectionism preventing self-forgiveness',
        'Treating myself worse than enemies',
        'No compassion for my mistakes',
        'Impossible standards for myself',
        'Self-blame for things beyond control',
        'Inner critic constantly attacking',
        'Unable to accept my humanity'
      ],
      'identity_5': [
        'Living according to others\' expectations',
        'Fear of disappointing important people',
        'Compromising values for acceptance',
        'Feeling disconnected from true self',
        'Making choices based on external pressure',
        'Lost touch with personal desires',
        'Living someone else\'s life',
        'Identity crisis and confusion'
      ]
    };

    // Get contributors for the specific question, or return default options
    const contributors = contributorsByQuestion[qid] || [
      'Feeling overwhelmed',
      'Lack of control',
      'Uncertainty about the future',
      'Not feeling supported',
      'High expectations',
      'Difficulty balancing priorities',
      'Time management challenges',
      'Emotional exhaustion'
    ];

    // Return the contributors as an array of strings
    res.status(200).json(contributors);

  } catch (error) {
    console.error('Error fetching contributors:', error);
    res.status(500).json({ 
      error: 'Failed to fetch contributors',
      message: error.message 
    });
  }
} 