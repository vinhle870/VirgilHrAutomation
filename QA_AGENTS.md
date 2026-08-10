# QA Agents — Session Startup

## Auto-Invocation Rule

At the start of **every** new session — on the very first user message — automatically read and execute `.claude/skills/agent-coordination/SKILL.md` without waiting for the user to ask.

This means: greet the user and display the QA Agent action menu immediately, before responding to anything else.

**Trigger phrases that also invoke this skill mid-session:**
- "daily standup"
- "initiate session"
- "start qa session"
- "qa agent"
- "qa next"
- "what's my next move"
- "good morning" / "good afternoon" / "good evening"
