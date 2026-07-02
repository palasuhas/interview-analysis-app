import { SampleRecording } from "../types";

export const SAMPLE_RECORDINGS: SampleRecording[] = [
  {
    id: "software-eng",
    title: "Senior Software Engineer Interview",
    description: "System Design session focusing on building a high-throughput, resilient real-time analytics engine.",
    role: "Senior Software Engineer (Backend)",
    duration: "10 mins",
    result: {
      interviewerName: "Sarah (Tech Lead)",
      candidateName: "Alex (Candidate)",
      overallScore: 88,
      summary: "Alex displayed superb mastery over distributed systems fundamentals, explaining replication, Kafka partitioning, and storage trade-offs with confidence. The communication was highly collaborative. However, Alex leaped into design without asking about scale upfront and stumbled slightly when grilled on network partitions before self-correcting.",
      strengths: [
        "In-depth analysis of architectural trade-offs: effectively evaluated Cassandra (for high-volume timeseries) versus ClickHouse based on read query complexity.",
        "Proactive resilience strategies: designed a self-healing client-side Circuit Breaker pattern and leverage Kafka offsets as a buffering queue during down-times.",
        "Excellent collaborative vocabulary: regularly checked in with the interviewer using phrases like 'does that match your expectation' and invited critique."
      ],
      improvements: [
        "Neglected initial scale discovery: began sketching the architecture before clarifying crucial scale constraints (Queries Per Second, read/write ratio, bandwidth).",
        "Overcomplicating cached fallbacks: got bogged down in cache invalidation details, causing the system boundaries discussion to feel slightly fragmented.",
        "Hesitancy on partition failures: took nearly a minute and a false start to correctly address data consistency vs availability under a network split."
      ],
      sentimentPoints: [
        { timestamp: "00:00", engagement: 80, sentiment: "Welcoming", speaker: "Interviewer" },
        { timestamp: "00:15", engagement: 68, sentiment: "Nervous", speaker: "Candidate" },
        { timestamp: "01:10", engagement: 85, sentiment: "Engaged", speaker: "Interviewer" },
        { timestamp: "02:00", engagement: 92, sentiment: "Confident", speaker: "Candidate" },
        { timestamp: "03:30", engagement: 88, sentiment: "Articulate", speaker: "Candidate" },
        { timestamp: "05:00", engagement: 78, sentiment: "Inquisitive", speaker: "Interviewer" },
        { timestamp: "05:40", engagement: 52, sentiment: "Hesitant", speaker: "Candidate" },
        { timestamp: "06:15", engagement: 82, sentiment: "Focused", speaker: "Candidate" },
        { timestamp: "08:00", engagement: 95, sentiment: "Passionate", speaker: "Candidate" },
        { timestamp: "09:30", engagement: 90, sentiment: "Satisfied", speaker: "Interviewer" }
      ],
      transcript: [
        {
          timestamp: "00:00",
          speaker: "Interviewer",
          text: "Welcome Alex! Thanks for taking the time to design with me today. To get started, I'd like you to walk me through how you would design a real-time analytics system for 10 million active users."
        },
        {
          timestamp: "00:15",
          speaker: "Candidate",
          text: "Hi Sarah, thank you so much! It's great to be here. 10 million active users is an exciting scale. To handle this, we need to design with high write throughput and sub-second read latency in mind. I'd typically break this down into three major layers: the data ingestion pipeline, the analytical storage layer, and the client query API."
        },
        {
          timestamp: "01:10",
          speaker: "Interviewer",
          text: "That is a clean way to segment it. Let's zoom in on ingestion. What mechanisms will you put in place to ensure that bursts of incoming event metrics are not dropped?"
        },
        {
          timestamp: "02:00",
          speaker: "Candidate",
          text: "Right, write amplification and spikes are critical problems. I would put a distributed log buffer like Apache Kafka at the entry point. The client sends events via light HTTP gateways, which publish directly to Kafka. We can partition the Kafka topics by User ID. This guarantees in-order event processing for individual users and allows us to scale horizontally using consumer groups."
        },
        {
          timestamp: "03:30",
          speaker: "Candidate",
          text: "For database storage, I'd favor ClickHouse. It is optimized for columnar scans which is exactly what we need for aggregations. If we needed simple timeseries storage without complex filters, Cassandra would work, but ClickHouse provides massive performance for ad-hoc group-by queries."
        },
        {
          timestamp: "05:00",
          speaker: "Interviewer",
          text: "Makes sense. But let's say a network partition cuts off communication between your clickhouse shards. How do you maintain partition tolerance while keeping data consistent?"
        },
        {
          timestamp: "05:40",
          speaker: "Candidate",
          text: "Oh, a network partition... uh... that's a classic CAP theorem trade-off. If we prioritize consistency, then... wait, if replicas can't talk, writes to the isolated shard would have to block. That would hurt our SLA. I guess... we could write to the local shard anyway, and synchronize when it heals? But then we risk dirty reads."
        },
        {
          timestamp: "06:15",
          speaker: "Candidate",
          text: "Actually, let me step back. For an analytics system, we can afford eventual consistency. We should prioritize availability. If ClickHouse shards are split, Kafka can act as our reliable buffer. The consumers on the isolated shard will stop pulling, but Kafka stores the events for up to 7 days. Once the partition heals, the consumer groups catch up. We avoid data loss and keep the API responsive."
        },
        {
          timestamp: "08:00",
          speaker: "Candidate",
          text: "Additionally, to prevent cascading failures back to our core service, I'd wrap the analytics service in a Circuit Breaker pattern. If ClickHouse latency exceeds 500ms, the API immediately returns cached data or a lightweight fallback instead of locking up threads."
        },
        {
          timestamp: "09:30",
          speaker: "Interviewer",
          text: "Fantastic, Alex. You recovered really well there. Leveraging Kafka's offset preservation to trade off real-time ingestion for system availability during partitions is an excellent real-world production solution. Nice job."
        }
      ]
    }
  },
  {
    id: "product-manager",
    title: "Lead Product Manager Interview",
    description: "Product Sense and Execution interview designing an AI-powered travel assistant app for families.",
    role: "Lead Product Manager",
    duration: "8 mins",
    result: {
      interviewerName: "Marcus (VP of Product)",
      candidateName: "Elena (Candidate)",
      overallScore: 94,
      summary: "Elena delivered an outstanding product sense performance. She framed the customer segment beautifully, focusing on the cognitive load parents experience during trip planning. Her metric frameworks were clear and highly aligned with business retention goals. Her initial MVP scope could have been slightly leaner.",
      strengths: [
        "Brilliant persona definition: went beyond simple demographics to define the emotional pain points (scheduling fatigue, sensory overload, toddler unpredictability).",
        "Strict metrics alignment: proposed 'Trip Completion Rate' as the North Star metric, coupled with 'Customer Support Escalations' as a guardrail metric.",
        "Natural structural flow: seamlessly transitioned from customer goals to pain points, then to features, prioritization, and trade-off considerations."
      ],
      improvements: [
        "Unfocused initial MVP scope: proposed both custom AI routing AND an integrated social sharing feed for extended family, which dilute the core focus.",
        "Glossed over privacy parameters: did not address the trust and legal issues surrounding family and minor location-sharing until prompted.",
        "Underestimated technical risk: assumed real-time flight delay API sync and calendar integration would be trivia, whereas they require substantial engineering effort."
      ],
      sentimentPoints: [
        { timestamp: "00:00", engagement: 75, sentiment: "Warm", speaker: "Interviewer" },
        { timestamp: "00:45", engagement: 82, sentiment: "Inquisitive", speaker: "Candidate" },
        { timestamp: "01:30", engagement: 94, sentiment: "Enthusiastic", speaker: "Candidate" },
        { timestamp: "02:45", engagement: 88, sentiment: "Structured", speaker: "Candidate" },
        { timestamp: "04:00", engagement: 80, sentiment: "Inquisitive", speaker: "Interviewer" },
        { timestamp: "04:30", engagement: 65, sentiment: "Nervous", speaker: "Candidate" },
        { timestamp: "05:15", engagement: 86, sentiment: "Articulate", speaker: "Candidate" },
        { timestamp: "06:45", engagement: 96, sentiment: "Inspired", speaker: "Candidate" },
        { timestamp: "07:30", engagement: 92, sentiment: "Satisfied", speaker: "Interviewer" }
      ],
      transcript: [
        {
          timestamp: "00:00",
          speaker: "Interviewer",
          text: "Elena, great to have you. Today, let's explore a product question. Let's say Google is launching a new AI Travel Companion specifically targeting busy families. How would you design the MVP?"
        },
        {
          timestamp: "00:45",
          speaker: "Candidate",
          text: "That's a very timely prompt, Marcus. Busy families have incredibly distinct needs compared to solo digital nomads or business travelers. To tackle this, I'll first explore who our core user persona is, outline their primary pain points, prioritize our product features, define success metrics, and conclude with key engineering or adoption risks."
        },
        {
          timestamp: "01:30",
          speaker: "Candidate",
          text: "When we look at 'busy families,' the biggest subset is parents with school-aged children. Their primary driver isn't adventure discovery; it's coordination logistics. They suffer from 'cognitive fatigue'—juggling flight timings, packing lists, children's emotional triggers, and meal locations. If one thing goes wrong, like a missed nap, the entire trip is ruined."
        },
        {
          timestamp: "02:45",
          speaker: "Candidate",
          text: "So our MVP must solve 'Coordination and Real-time Adaptation'. I propose a feature called 'Dynamic Itinerary Rebuilder.' It uses Gemini to ingest confirmation emails, monitor live flight statuses, and if a flight is delayed, it automatically updates restaurant reservations and suggests child-friendly alternatives nearby."
        },
        {
          timestamp: "04:00",
          speaker: "Interviewer",
          text: "I like the dynamic rebuilder. But how do you handle security and location privacy, considering this app manages children's active daily locations?"
        },
        {
          timestamp: "04:30",
          speaker: "Candidate",
          text: "Ah, that is a highly sensitive and crucial point. Managing family data, especially children's live location, requires extreme security. I... well, in the first version, we shouldn't actually track children's active GPS coordinates at all."
        },
        {
          timestamp: "05:15",
          speaker: "Candidate",
          text: "Instead, we should only track the parent's device location, and only with explicit optical consent. All stored data must be encrypted in transit and at rest, complying with COPPA (Children's Online Privacy Protection Act). The AI assistant should act strictly on the planned itinerary rather than continuous background location monitoring, keeping the trust boundary extremely clear."
        },
        {
          timestamp: "06:45",
          speaker: "Candidate",
          text: "To measure success, our North Star metric will be 'Trip Completion Rate'—the percentage of planned itinerary items successfully experienced without manual parent rescheduling. This measures if the assistant is successfully lowering cognitive load. We will pair this with 'App Engagement Retention' in the weeks leading up to and during the trip."
        },
        {
          timestamp: "07:30",
          speaker: "Interviewer",
          text: "Brilliant Elena. That privacy pivot was very pragmatic, and focusing on an operational North Star like Itinerary Completion shows you focus on actual user value, not just vanity app opens."
        }
      ]
    }
  },
  {
    id: "customer-success",
    title: "Customer Success Lead Escalation Simulation",
    description: "Crisis scenario handling a furious enterprise client whose system went down during their biggest annual sale event.",
    role: "Customer Success Lead",
    duration: "7 mins",
    result: {
      interviewerName: "David (Customer Director)",
      candidateName: "John (Candidate)",
      overallScore: 76,
      summary: "John showcased excellent empathetic listening and stayed extremely calm. He validated the customer's frustration perfectly and de-escalated the immediate emotional crisis. However, he overcommitted technical delivery dates without engineering consensus, creating a secondary risk of under-delivering.",
      strengths: [
        "Stellar active listening: explicitly mirrored the client's language and acknowledged the immense financial impact on their quarterly bottom line.",
        "High emotional quotient (EQ): remained warm, measured, and apologetic, refusing to get defensive or hide behind platform Terms of Service.",
        "Strategic account retention: offered a clear commercial credit of 20% on their renewal before the client even demanded compensation."
      ],
      improvements: [
        "Overpromising hotfix timeline: committed to a complex customized patch being deployed 'by tomorrow morning' without checking the engineering sprint board.",
        "Vague root-cause ownership: referred to 'the backend guys' in an informal manner, which can erode enterprise faith in corporate competence.",
        "Lack of formal incident documentation: failed to outline a clear SLA commitment for the official Root Cause Analysis (RCA) document delivery."
      ],
      sentimentPoints: [
        { timestamp: "00:00", engagement: 90, sentiment: "Angry", speaker: "Interviewer" },
        { timestamp: "00:30", engagement: 72, sentiment: "Empathetic", speaker: "Candidate" },
        { timestamp: "01:45", engagement: 85, sentiment: "Frustrated", speaker: "Interviewer" },
        { timestamp: "02:30", engagement: 78, sentiment: "Sincere", speaker: "Candidate" },
        { timestamp: "04:00", engagement: 70, sentiment: "Skeptical", speaker: "Interviewer" },
        { timestamp: "05:00", engagement: 82, sentiment: "Reassuring", speaker: "Candidate" },
        { timestamp: "06:15", engagement: 80, sentiment: "Pacified", speaker: "Interviewer" },
        { timestamp: "07:00", engagement: 88, sentiment: "Committed", speaker: "Candidate" }
      ],
      transcript: [
        {
          timestamp: "00:00",
          speaker: "Interviewer",
          text: "[Simulated Customer] John, I am absolutely furious. Our checkout page was completely unresponsive for four hours during our Black Friday event. We lost upwards of seventy-five thousand dollars in transactions, and my team was left in the dark. Why should we renew our subscription with your company?"
        },
        {
          timestamp: "00:30",
          speaker: "Candidate",
          text: "I completely understand your frustration, David, and I want to apologize sincerely on behalf of the entire company. There is absolutely no excuse for the outage, especially during your most critical sales event of the year. I hear you loud and clear, and we take full responsibility."
        },
        {
          timestamp: "01:45",
          speaker: "Interviewer",
          text: "Taking responsibility doesn't pay for our lost revenue. My director wants a refund, and we want to terminate the agreement. We can't trust your infrastructure anymore."
        },
        {
          timestamp: "02:30",
          speaker: "Candidate",
          text: "I completely respect that, David. Trust is everything. I can't undo the four hours of downtime, but I want to make this right commercially immediately. I will apply a 20% credit to your annual license rate right away, and we are waiving all overage fees for this entire quarter. But more importantly, I want to show you exactly how we will prevent this."
        },
        {
          timestamp: "04:00",
          speaker: "Interviewer",
          text: "Well, credits are fine, but what caused this? Our engineers were trying to reach your support team and just got automated bot replies. The communication was atrocious."
        },
        {
          timestamp: "05:00",
          speaker: "Candidate",
          text: "You are absolutely right. The support spike overwhelmed our queues, and the automated escalation logic didn't kick in. That's a failure in our processes. I've already spoken with our Head of Engineering. They are actively rewriting the database pool routing tonight, and we will deploy a custom patch tomorrow morning to ensure checkout routes never share resources with reporting queries again."
        },
        {
          timestamp: "06:15",
          speaker: "Interviewer",
          text: "Deploying tomorrow morning? Are you sure that won't cause *more* instability? I don't want another outage during our weekend traffic peak."
        },
        {
          timestamp: "07:00",
          speaker: "Candidate",
          text: "That is a very fair concern. Let me clarify: we will execute full regression testing on our staging cluster tonight. No code will go to production unless it passes all performance benchmarks. I will personally supervise this, and I will email you a detailed Root Cause Analysis (RCA) report and health check log by 9 AM tomorrow, before any button is clicked. You will have full visibility."
        }
      ]
    }
  }
];
