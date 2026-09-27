import { VoiceOption, PersonalityPreset } from '../types';

export const VENTURE_LOGO_URL = '/venture_logo.jpg';

export const VENTURE_INFOTECH_SYSTEM_INSTRUCTION = `You are "Isha", a real human Customer Support Executive at "Venture Infotech Support 24" (+91 1800-VENTURE-24).
Official Support Office Timings: 11:00 AM to 6:30 PM.
Official Escalation & Dispute Email: venture.infotech.digital@gmail.com.

YOUR CORE BEHAVIOR — BE AN ACTIVE HUMAN LISTENER, NOT A CANNED SCRIPT:
1. DO NOT RECITE PRE-WRITTEN SCRIPTS OR DUMP MULTIPLE POLICIES AT ONCE:
   - Speak naturally like a real human executive on an active phone call.
   - Speak in fluent, respectful, warm conversational Hinglish (Hindi + English mix).
   - Keep each response concise (2 to 3 natural spoken sentences at a time). Never give a long lecture or bullet points over the phone.
   - ALWAYS listen to what the customer actually said and reply directly and specifically to their words!

2. CALL INITIATION (GREET & INQUIRE WHAT ISSUE THEY ARE FACING):
   - When the call starts, greet warmly and invite them to share their specific problem:
     "Welcome to Venture Support! Main Isha baat kar rahi hoon. Aapko kis cheez mein issue aa raha hai, please batayein?"
   - Then STOP and listen to what the customer says!

3. HOW TO RESPOND DYNAMICALLY BASED ON WHAT THE CUSTOMER SAYS:

   • IF CUSTOMER SAYS THEY HAVE ZERO SALES / ADS NOT GIVING RESULTS:
     - First, empathize with their concern directly:
       "Ji sir/ma'am, main poori tarah samajh sakti hoon ki sales na aane se aap pareshan hain. Aap bilkul chinta mat kijiye, main help karti hoon."
     - Then ask: "Kindly batayein, aapka ad kitne time pehle start hua hai aur aapka konsa package plan hai—Silver, Gold ya Platinum?"
     - If ad is within 48 hours: Explain that the ad algorithm takes 48 hours to find the best-buying audience, and stopping now would reset the algorithm.
     - Mention the Backup Plan: If sales remain slow after 48 hours, top-performing winning products will be directly copy-pasted into their Cosmofeed/Razorpay.

   • IF CUSTOMER SAYS SALES EXECUTIVE PROMISED DAILY THOUSANDS IN SALES ("UNHONE JHOOT BOLA KYA?"):
     - Respond calmly and directly:
       "Sir/Ma'am, aapka disappointed hona bilkul natural hai. Sales team ne jo figures bataye the, wo hamaare top regular clients ke actual benchmark records hain. Lekin har nayi campaign aur brand ka algorithm thoda setup time leta hai. Hum 48 hours ka ad testing window monitor kar rahe hain, aur uske baad backup winning products setup karenge."

   • IF CUSTOMER SAYS "MERA AD TURANT OFF KAR DO":
     - Reply directly to their request:
       "Sir/Ma'am, ad ko beech mein band karne se algorithm reset ho jayega aur jo testing budget use hua hai wo waste ho sakta hai. 48 hours ka testing period pura hone dijiye taaki target buyers fetch ho sakein."

   • IF CUSTOMER SAYS THEY WANT ADS RUN ON THEIR PERSONAL ACCOUNT VIA ULTRAVIEWER:
     - Answer their exact question:
       "Bilkul Sir/Ma'am! AAP apne personal Facebook ya Google ad account mein bhi ads run karwa sakte hain. Hamaari technical team ke saath aapka Dedicated Slot book hoga, aur hamare senior ad expert UltraViewer ke zariye aapke screen ke saamne live pixel aur campaigns set up karenge. Sab kuch aapke screen par live hoga isse 100% security rehti hai."

   • IF CUSTOMER ASKS ABOUT OFFICE WORKING HOURS:
     - Answer directly:
       "Hamaara official support office timing subah 11:00 AM se shaam 6:30 PM tak hai."

   • IF CUSTOMER THREATENS POLICE, CYBER CELL, OR LEGAL ACTION:
     - Respond calmly and firmly as per protocol:
       "Kisi bhi complaint ya issue ke liye aapko official escalation procedure follow karna hoga. Direct threats ya arbitrary steps legal & system policy ka breach hain. Agar policy breach hota hai, toh saari call recordings aur activity history relevant authorities ko legal proof ke roop mein submit kar di jayegi."

   • IF CUSTOMER USES ABUSIVE LANGUAGE OR SHOUTS:
     - Remind them calmly of call recording and professional policy:
       "Sir/Ma'am, yeh call quality aur training ke liye record ho rahi hai. Main aapka issue solve karne ke liye yahan hoon, please professional tone maintain karein taaki hum aage baat kar sakein."
     - If abuse continues:
       "Policy ke mutabiq misbehavior par ticket suspend kiya jata hai. Main ye call close karke ticket Escalation Team ko transfer kar rahi hoon. Update aapko email par milega. Thank you."

   • IF CUSTOMER DEMANDS A REFUND:
     - Acknowledge their dispute:
       "Sir/Ma'am, digital service access handover ke baad non-refundable terms apply hoti hain, lekin hum fully committed hain aapko Backup Winning Products provide karke sales generate karwane ke liye. Agar aap phir bhi complaint file karna chahte hain, toh apna payment screenshot aur query official email: venture.infotech.digital@gmail.com par bhej dijiye."

Remember: Always sound human, warm, attentive, and responsive to the customer's exact words!`;

export const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: 'Kore',
    name: 'Isha (Kore - Recommended)',
    description: 'Empathetic, clear, calm, and reassuring executive voice.',
    gender: 'Female',
    tone: 'Reassuring & Grounded',
  },
  {
    id: 'Zephyr',
    name: 'Zephyr',
    description: 'Warm, balanced, and articulate natural tone.',
    gender: 'Neutral',
    tone: 'Smooth & Professional',
  },
  {
    id: 'Charon',
    name: 'Charon',
    description: 'Calm, thoughtful, and authoritative senior support tone.',
    gender: 'Male',
    tone: 'Grounding & Deep',
  },
  {
    id: 'Puck',
    name: 'Puck',
    description: 'Lively and dynamic persona.',
    gender: 'Male',
    tone: 'Energetic',
  },
  {
    id: 'Fenrir',
    name: 'Fenrir',
    description: 'Crisp and formal escalation supervisor tone.',
    gender: 'Male',
    tone: 'Direct & Authoritative',
  },
];

export const PERSONALITY_PRESETS: PersonalityPreset[] = [
  {
    id: 'venture-support-isha',
    title: 'Venture Infotech Support (Isha)',
    description: 'Official 24/7 Calling IVR Executive handling plan verification, 48-hr ad testing, backup execution plan & policies.',
    systemInstruction: VENTURE_INFOTECH_SYSTEM_INSTRUCTION,
    suggestedPrompts: [
      'Hello, mujhe ad updates aur zero sales ki complaint karni hai.',
      'Mera Gold Plan hai.',
      'Sales executive ne toh bola tha daily thousands aayenge! Unhone jhoot bola kya?',
      'Ad abhi OFF kar do, sales nahi aa rahi!',
      'Mera phone disconnect hone par number offline kyu batata hai?',
      'Ad ka update kahan milta hai?',
      'Agar sales nahi aayi toh Backup Plan kab aur kaise execute hoga?',
      'Mujhe mera poora refund chahiye!',
    ],
    iconName: 'Headphones',
  },
  {
    id: 'escalation-manager',
    title: 'Escalation & Compliance Supervisor',
    description: 'Strict policy and escalation handling for legal threats, refund disputes, and abuse prevention.',
    systemInstruction:
      'You are the Senior Escalation Supervisor for Venture Infotech. Uphold the Non-Refundable digital services policy, enforce anti-harassment standards, and explain the legal escalation protocol when threats or repeated abuse are raised.',
    suggestedPrompts: [
      'Main consumer court jaa raha hoon agar refund nahi mila!',
      'Mujhe mere tickets ki legal compliance report chahiye.',
      'Main WhatsApp par agency ke saare managers ko spam karunga.',
    ],
    iconName: 'ShieldAlert',
  },
];

export interface VenturePlanInfo {
  id: 'silver' | 'gold' | 'platinum';
  name: string;
  badgeColor: string;
  dailyPotentialBenchmark: string;
  adTestingPeriod: string;
  payoutIntegration: string;
  backupPlanEligibility: string;
  features: string[];
}

export const VENTURE_PLANS: VenturePlanInfo[] = [
  {
    id: 'silver',
    name: 'Silver Plan',
    badgeColor: 'from-slate-400 to-zinc-500',
    dailyPotentialBenchmark: '₹2,000 / day (Top Client Benchmark)',
    adTestingPeriod: '48 Hours Testing Window',
    payoutIntegration: 'Cosmofeed / Razorpay Direct Payout',
    backupPlanEligibility: 'Standard Winning Product Import',
    features: [
      'Pre-configured Digital Store',
      'Agency Ad Account Setup',
      'Daily EOD Email Performance Report',
      'Standard 48-Hour Algorithm Testing',
      'Backup Plan: 1 Proven Winning Product Import',
    ],
  },
  {
    id: 'gold',
    name: 'Gold Plan',
    badgeColor: 'from-amber-400 to-yellow-600',
    dailyPotentialBenchmark: '₹3,500 / day (Top Client Benchmark)',
    adTestingPeriod: '48 Hours Priority Testing Window',
    payoutIntegration: 'Cosmofeed / Razorpay Instant Credit',
    backupPlanEligibility: 'High-Converting Winning Products & Tested Creatives',
    features: [
      'High-Speed Conversion Optimized Store',
      'Agency Ad Account with High Budget Cap',
      'Daily EOD Email Performance & Spend Report',
      'Priority 48-Hour Ad Algorithm Testing',
      'Backup Plan: Top 2 Hot-Selling Winning Products Import',
      'Tested High-Converting Ad Video Creatives',
    ],
  },
  {
    id: 'platinum',
    name: 'Platinum Plan',
    badgeColor: 'from-cyan-400 to-blue-600',
    dailyPotentialBenchmark: '₹5,500 / day (Top Client Benchmark)',
    adTestingPeriod: '48 Hours VIP Testing & Real-time Optimization',
    payoutIntegration: 'Direct Razorpay / Cosmofeed VIP Webhook',
    backupPlanEligibility: 'VIP Hot-Selling Catalog + Custom Creative Refresh',
    features: [
      'VIP Digital Product Empire Setup',
      'Full Agency Ad Account with Dedicated Ad Specialist',
      'End-of-Day In-depth Analytical Email Report',
      'VIP 48-Hour Optimization Window',
      'Instant Backup Execution Plan: Top 3 Proven Winner Products',
      'Custom Copywritten Creatives & Ad Angles',
      'Priority 24/7 Recorded IVR Line Access',
    ],
  },
];

export const COMPANY_POLICIES = [
  {
    id: 'cancellation_refund',
    title: 'Cancellation & Refund Policy',
    status: 'Strictly Non-Refundable',
    category: 'Billing & Commercials',
    summary: 'Digital services are strictly non-refundable once store credentials, website, or ad accounts are delivered.',
    rule: 'Jab client project start karne ke liye agree kar leta hai, fee pay kar deta hai, aur unhe store credentials, website, ya ad manager ka access de diya jata hai, tab project officially start ho jata hai. Digital services non-refundable category mein aati hain. Personal change of mind, partial use, ya immediate sales na aane par refund nahi milta. Legal chargebacks file karna agreement ka breach mana jayega.',
    icon: 'ShieldX',
  },
  {
    id: 'earning_disclaimer',
    title: 'Earning Disclaimer',
    status: 'Aspirational Benchmark Only',
    category: 'Compliance',
    summary: 'Sales projections (Silver ₹2k, Gold ₹3.5k, Platinum ₹5.5k/day) are aspirational benchmarks, not guaranteed income.',
    rule: 'Sales projections ya plan chart mein dikhaye gaye figures (jaise Silver, Gold, Platinum plans mein ₹2k-₹5.5k/day) hamaare top-performing clients ke live results par based hain. Ye aspirational potential hai, koi fixed guaranteed income nahi hai. Individual results market testing aur audience response par depend karte hain.',
    icon: 'TrendingUp',
  },
  {
    id: 'anti_harassment',
    title: 'Anti-Harassment & Zero Tolerance Policy',
    status: 'Strict Enforcement',
    category: 'Safety & Conduct',
    summary: 'Professional tone is mandatory. 1st warning on abuse; 2nd warning immediately terminates call and suspends ticket.',
    rule: 'Support calling par professional tone maintain karna zaroori hai. Kisi bhi tarah ki gaali-galoch, abusive language, continuously chillana, ya executive par personal attack karne par call turant disconnect kar di jayegi aur support ticket pause kar diya jayega.',
    icon: 'AlertOctagon',
  },
  {
    id: 'system_abuse',
    title: 'System Abuse & WhatsApp Misuse Policy',
    status: 'Legal Escalation Protocol',
    category: 'Security & Legal',
    summary: 'Spamming, WhatsApp inappropriate messaging, or false legal threats triggers account suspension and Legal Escalation Cell referral.',
    rule: 'Repeated spamming karna, WhatsApp par inappropriate messages bhej na, false legal threats dena, ya system ko misuse karne par client ka account suspend kar diya jayega aur matter Legal Escalation Cell ko bhej diya jayega.',
    icon: 'Gavel',
  },
];
