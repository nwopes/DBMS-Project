const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

// POST /api/ai/case-summary
router.post('/case-summary', async (req, res) => {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.startsWith('sk-paste')) {
    return res.status(503).json({ error: 'OpenAI API key not configured in backend/.env' });
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const { caseData } = req.body;

    const evidenceLines = (caseData.evidence || [])
      .map(e => `  • ${e.evidence_type}: ${e.description || 'No description'}`)
      .join('\n');

    const officerLines = (caseData.officers || [])
      .map(o => `${o.name} (${o.designation}, Badge: ${o.badge_number})`)
      .join(', ') || 'None assigned';

    const courtLines = (caseData.courtCases || [])
      .map(cc => `${cc.court_name} — Verdict: ${cc.verdict || 'Pending'}, Hearing: ${cc.hearing_date?.slice(0, 10) || 'TBD'}`)
      .join('; ') || 'No court proceedings initiated';

    const firLines = (caseData.firs || [])
      .map(f => `FIR #${f.fir_id} filed on ${f.filing_date?.slice(0, 10) || 'Unknown'} by ${f.filed_by_name || 'Unknown'}`)
      .join('; ') || 'No FIR on record';

    const prompt = `You are a senior police department analyst writing an official case report. Write a professional, formal, and comprehensive case summary based on the following details. The summary should read like official law enforcement documentation.

CASE INFORMATION:
- Case ID: #${caseData.case_id}
- Case Status: ${caseData.case_status}
- Case Opened: ${caseData.start_date?.slice(0, 10) || 'Unknown'}
- Case Closed: ${caseData.end_date?.slice(0, 10) || 'Ongoing'}

CRIME DETAILS:
- Crime Type: ${caseData.crime_type}
- Date of Crime: ${caseData.crime_date?.slice(0, 10) || 'Unknown'}
- Location: ${[caseData.address, caseData.city, caseData.state].filter(Boolean).join(', ') || 'Unknown'}
- Crime Status: ${caseData.crime_status}
- Description: ${caseData.crime_description || 'Not provided'}

FIRST INFORMATION REPORT:
${firLines}

INVESTIGATING OFFICERS:
- Lead Officer: ${caseData.lead_officer_name || 'Unassigned'}
- Assigned Team: ${officerLines}

EVIDENCE COLLECTED (${(caseData.evidence || []).length} items):
${evidenceLines || '  No evidence logged'}

COURT PROCEEDINGS:
${courtLines}

Write a 4-paragraph professional case summary. Cover: (1) nature and circumstances of the crime, (2) investigation progress and key findings, (3) evidence and its significance, (4) current legal/judicial status and recommended next steps. Be specific, formal, and objective. Do not add any headers or bullet points — write flowing paragraphs only.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 700,
      temperature: 0.4,
    });

    res.json({ summary: completion.choices[0].message.content.trim() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
