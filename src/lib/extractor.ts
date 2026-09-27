import {
  TranscriptEntry,
  TaskItem,
  NoteItem,
  MeetingItem,
  ClientProfile,
  SupportTicket,
  VenturePlanType,
  SupportCallCategory,
  CallerSentiment,
  TicketStatus,
} from '../types';

export interface ExtractedEntities {
  tasks: TaskItem[];
  notes: NoteItem[];
  meetings: MeetingItem[];
  clientProfile?: Partial<ClientProfile>;
  ticket?: SupportTicket;
}

export function detectPlanFromTranscripts(text: string): VenturePlanType {
  const lower = text.toLowerCase();
  if (lower.includes('platinum')) return 'Platinum Plan';
  if (lower.includes('gold')) return 'Gold Plan';
  if (lower.includes('silver')) return 'Silver Plan';
  return 'Gold Plan'; // default to most common package if undetermined
}

export function detectCategoryFromTranscripts(text: string): SupportCallCategory {
  const lower = text.toLowerCase();
  if (lower.includes('abuse') || lower.includes('gaali') || lower.includes('misbehave') || lower.includes('shout')) {
    return 'Policy & Abuse Warning';
  }
  if (lower.includes('refund') || lower.includes('paisa wapas') || lower.includes('chargeback') || lower.includes('cancel')) {
    return 'Refund & Billing Dispute';
  }
  if (lower.includes('jhoot') || lower.includes('sales executive') || lower.includes('promise') || lower.includes('thousands')) {
    return 'Sales Promise vs Reality';
  }
  if (lower.includes('backup') || lower.includes('winning product') || lower.includes('copy-paste') || lower.includes('cosmofeed') || lower.includes('razorpay')) {
    return 'Backup Plan (Winning Products)';
  }
  if (lower.includes('offline') || lower.includes('disconnect') || lower.includes('number')) {
    return 'Offline Phone Question';
  }
  if (lower.includes('report') || lower.includes('update') || lower.includes('eod') || lower.includes('email')) {
    return 'EOD Report & Dashboard';
  }
  if (lower.includes('48') || lower.includes('testing') || lower.includes('algorithm') || lower.includes('ad off')) {
    return '48-Hour Ad Testing';
  }
  return 'Zero Sales / Slow Performance';
}

export function detectSentiment(text: string): CallerSentiment {
  const lower = text.toLowerCase();
  if (lower.includes('gaali') || lower.includes('bastard') || lower.includes('bakwas') || lower.includes('chor')) {
    return 'Aggressive';
  }
  if (lower.includes('gussa') || lower.includes('cheat') || lower.includes('fraud') || lower.includes('jhoot') || lower.includes('off kar do')) {
    return 'Frustrated';
  }
  if (lower.includes('tension') || lower.includes('dar') || lower.includes('kyu nahi aa rahi') || lower.includes('loss')) {
    return 'Anxious';
  }
  if (lower.includes('theek hai') || lower.includes('samajh gaya') || lower.includes('thank you') || lower.includes('okay')) {
    return 'Reassured';
  }
  return 'Calm';
}

export function extractEntitiesFromTranscripts(
  transcripts: TranscriptEntry[],
  sessionId: string,
  existingProfile?: ClientProfile | null
): ExtractedEntities {
  const fullText = transcripts.map((t) => t.text).join(' ');
  const lower = fullText.toLowerCase();

  const tasks: TaskItem[] = [];
  const notes: NoteItem[] = [];
  const meetings: MeetingItem[] = [];
  const now = Date.now();

  const plan = detectPlanFromTranscripts(fullText);
  const category = detectCategoryFromTranscripts(fullText);
  const sentiment = detectSentiment(fullText);

  // Check warnings
  let warningCount = 0;
  if (lower.includes('anti-harassment') || lower.includes('abusive language stop')) {
    warningCount = 1;
  }
  if (lower.includes('system abuse') || lower.includes('escalation team ko transfer') || lower.includes('ticket suspend')) {
    warningCount = 2;
  }

  // Backup Plan Triggered?
  const isBackupEligible = lower.includes('backup') || lower.includes('winning product') || lower.includes('copy-paste');
  const backupPlanStatus = isBackupEligible ? 'Triggered - Winning Products Imported' : 'Eligible';

  // Ticket Status
  let ticketStatus: TicketStatus = 'Active - In Progress';
  if (warningCount >= 2) {
    ticketStatus = 'Escalated to Legal/Management';
  } else if (isBackupEligible) {
    ticketStatus = 'Backup Plan Triggered';
  } else if (lower.includes('48') || lower.includes('testing')) {
    ticketStatus = 'In 48-Hr Testing Window';
  }

  // 1. Task: 48-Hour Ad Testing & EOD Report
  tasks.push({
    id: `task-extract-${now}-1`,
    title: `Monitor 48-Hour Ad Algorithm Testing for ${existingProfile?.storeName || 'Client Store'}`,
    description: `Ensure ad campaign remains active without manual stops to allow Meta/Google algorithm to find high-converting buyers. Current plan: ${plan}.`,
    status: 'in_progress',
    priority: 'high',
    dueDate: new Date(now + 48 * 3600000).toISOString().split('T')[0],
    createdAt: now,
    updatedAt: now,
    sessionId,
    tags: ['48-hr-testing', 'ad-algorithm', plan.toLowerCase().replace(' ', '-')],
  });

  // 2. Task: EOD Report dispatch
  tasks.push({
    id: `task-extract-${now}-2`,
    title: 'Dispatch Daily End-of-Day (EOD) Ad Performance & Spend Email Report',
    description: 'Send transparent performance metric breakdown and spend metrics to client email at 7:00 PM.',
    status: 'pending',
    priority: 'medium',
    dueDate: new Date(now + 86400000).toISOString().split('T')[0],
    createdAt: now + 1,
    updatedAt: now + 1,
    sessionId,
    tags: ['eod-report', 'transparency'],
  });

  // 3. Task: Backup Plan Winning Product Copy-Paste if eligible
  if (isBackupEligible || lower.includes('zero sales') || lower.includes('slow')) {
    tasks.push({
      id: `task-extract-${now}-3`,
      title: 'Prepare Winning Product Copy-Paste & High-Converting Creatives',
      description: 'Import proven hot-selling digital product from top-performing agency clients directly into client Cosmofeed/Razorpay store.',
      status: 'pending',
      priority: 'high',
      createdAt: now + 2,
      updatedAt: now + 2,
      sessionId,
      tags: ['backup-plan', 'winning-product', 'cosmofeed-import'],
    });
  }

  // 4. Abuse / Escalation Task
  if (warningCount >= 1) {
    tasks.push({
      id: `task-extract-${now}-4`,
      title: warningCount >= 2 ? 'Legal Escalation: Account Suspended for Misconduct' : 'Compliance Flag: Warning 1 Issued for Abusive Language',
      description: 'Anti-Harassment & Zero Tolerance Policy invoked. Maintain audit logs of recorded IVR call.',
      status: 'pending',
      priority: 'high',
      createdAt: now + 3,
      updatedAt: now + 3,
      sessionId,
      tags: ['compliance', 'anti-harassment', 'zero-tolerance'],
    });
  }

  // 5. Notes
  const noteBullets: string[] = [
    `• Plan Verified: ${plan}`,
    `• Issue Category: ${category}`,
    `• Customer Sentiment: ${sentiment}`,
    `• 48-Hour Ad Testing Explained: ${lower.includes('48') ? 'Yes (Client agreed not to turn ad off early)' : 'Pending reassurance'}`,
    `• Backup Plan Status: ${backupPlanStatus}`,
    `• Gateway: ${existingProfile?.gateway || 'Cosmofeed / Razorpay Linked'}`,
  ];
  if (warningCount > 0) {
    noteBullets.push(`• Policy Enforcement: ${warningCount} warning(s) issued under Anti-Harassment & Zero Tolerance Policy.`);
  }

  notes.push({
    id: `note-extract-${now}`,
    title: `IVR Call Summary: ${existingProfile?.clientName || 'Rahul Verma'} (${plan})`,
    content: noteBullets.join('\n') + `\n\nExecutive Notes: Reassured customer using 'No Blame Game' framework. Explained that sales projections are aspirational benchmarks from existing top performers. Guided client towards the 48-hr algorithm testing window and backup winning product import.`,
    createdAt: now,
    updatedAt: now,
    sessionId,
    tags: ['ivr-summary', plan.toLowerCase().replace(' ', '-'), category.toLowerCase().slice(0, 10)],
    isPinned: true,
  });

  // 6. Callback / Ad Strategy Sync
  const targetDate = new Date(now + 48 * 3600000);
  meetings.push({
    id: `meeting-extract-${now}`,
    title: '48-Hour Ad Testing Review & Backup Plan Trigger Check',
    clientName: existingProfile?.clientName || 'Rahul Verma',
    clientContact: existingProfile?.contactNumber || '+91 98112 34567',
    date: targetDate.toISOString().split('T')[0],
    time: '17:00',
    location: 'Dedicated Support IVR Line (+91 1800-VENTURE-24)',
    type: 'ivr_callback',
    status: 'scheduled',
    notes: 'Review Cosmofeed / Razorpay revenue after 48-hour algorithm phase. If sales remain slow, execute winning product copy-paste immediately.',
    createdAt: now,
    sessionId,
  });

  // 7. Structured Support Ticket
  const rawTranscript = transcripts.map((t) => `${t.sender.toUpperCase()}: ${t.text}`).join('\n');
  const executiveSummary = `Customer on ${plan} called regarding ${category.toLowerCase()}. Executive Isha empathetically explained the 48-hour testing window without blaming the sales team and presented the Backup Execution Plan (Winning Product Copy-Paste to Cosmofeed/Razorpay).`;

  const ticket: SupportTicket = {
    id: `ticket-${now}`,
    callId: sessionId,
    createdAt: now,
    updatedAt: now,
    clientName: existingProfile?.clientName || 'Rahul Verma',
    contactNumber: existingProfile?.contactNumber || '+91 98112 34567',
    email: existingProfile?.email || 'rahul.verma@digitalventures.in',
    storeName: existingProfile?.storeName || 'Apex Digital Growth Store',
    storeId: existingProfile?.storeId || 'VENTURE-STORE-8921',
    plan,
    category,
    sentiment,
    testingWindowHoursElapsed: existingProfile?.testingHoursElapsed || 18,
    backupPlanStatus,
    gateway: existingProfile?.gateway || 'Both',
    warningCount,
    status: ticketStatus,
    executiveSummary,
    recommendedAction: isBackupEligible
      ? 'Execute Winning Product Copy-Paste into Cosmofeed dashboard and apply high-converting video creatives.'
      : 'Complete 48-Hour Ad testing window and dispatch EOD Email performance report.',
    assignedExecutive: 'Isha (Senior Support Executive)',
    rawTranscript: rawTranscript || 'No voice transcript logged for this session yet.',
    tags: [plan, category, `Warnings-${warningCount}`],
  };

  const clientProfileUpdate: Partial<ClientProfile> = {
    plan,
    testingHoursElapsed: Math.min(48, (existingProfile?.testingHoursElapsed || 18) + 2),
    winningProductsImported: isBackupEligible,
    updatedAt: now,
  };

  return { tasks, notes, meetings, clientProfile: clientProfileUpdate, ticket };
}

export async function analyzeCallAndExtractEntities(
  transcripts: TranscriptEntry[],
  sessionId: string,
  existingProfile?: ClientProfile | null
): Promise<ExtractedEntities> {
  const localResult = extractEntitiesFromTranscripts(transcripts, sessionId, existingProfile);
  const now = Date.now();

  try {
    const res = await fetch('/api/analyze-call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcripts,
        sessionId,
        existingProfile,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.analysis) {
        const a = data.analysis;

        const ticket: SupportTicket = {
          id: `ticket-${now}`,
          callId: sessionId,
          createdAt: now,
          updatedAt: now,
          clientName: a.clientName || localResult.ticket?.clientName || 'Rahul Verma',
          contactNumber: a.contactNumber || localResult.ticket?.contactNumber || '+91 98112 34567',
          email: a.email || localResult.ticket?.email || 'rahul.verma@digitalventures.in',
          storeName: a.storeName || localResult.ticket?.storeName || 'Apex Digital Growth Store',
          storeId: a.storeId || localResult.ticket?.storeId || 'VENTURE-STORE-8921',
          plan: a.plan || localResult.ticket?.plan || 'Gold Plan',
          category: a.category || localResult.ticket?.category || 'Zero Sales / Slow Performance',
          sentiment: a.sentiment || localResult.ticket?.sentiment || 'Calm',
          testingWindowHoursElapsed: a.testingWindowHoursElapsed ?? (localResult.ticket?.testingWindowHoursElapsed || 18),
          backupPlanStatus: a.backupPlanStatus || localResult.ticket?.backupPlanStatus || 'Eligible',
          gateway: a.gateway || localResult.ticket?.gateway || 'Both',
          warningCount: typeof a.warningCount === 'number' ? a.warningCount : (localResult.ticket?.warningCount || 0),
          status: a.status || localResult.ticket?.status || 'Active - In Progress',
          executiveSummary: a.executiveSummary || localResult.ticket?.executiveSummary || 'IVR consultation completed.',
          recommendedAction: a.recommendedAction || localResult.ticket?.recommendedAction || 'Monitor 48-Hour Ad Testing.',
          assignedExecutive: 'Isha (Senior Support Executive)',
          rawTranscript: transcripts.map((t) => `${t.sender.toUpperCase()}: ${t.text}`).join('\n'),
          tags: [a.plan || 'Gold Plan', a.category || 'General'],
        };

        return {
          tasks: localResult.tasks,
          notes: localResult.notes,
          meetings: localResult.meetings,
          clientProfile: localResult.clientProfile,
          ticket,
        };
      }
    }
  } catch (err) {
    console.warn('AI analysis API call warning, falling back to local extractor:', err);
  }

  return localResult;
}
