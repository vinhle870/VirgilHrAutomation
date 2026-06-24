// ─── Shared interfaces ────────────────────────────────────────────────────────

export interface EmailMessage {
  id: string;
  from: string;
  subject: string;
  date: string;
  content: string;
}

export interface EmailCredentials {
  password: string;
  loginUrl: string;
}

export interface ReadEmailOptions {
  format?: "txt" | "html";
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/%40/g, "@");
}

function parseCredentials(html: string, linkLabel: string): EmailCredentials {
  const passwordMatch = html.match(/Password:\s*(.+?)\s*<\/p>/s);
  const loginUrlMatch = html.match(new RegExp(`<a[^>]+href="([^"]+)"[^>]*>\\s*${linkLabel}\\s*<\\/a>`, "i"));

  return {
    password: passwordMatch ? decodeHtmlEntities(passwordMatch[1].trim()) : "",
    loginUrl: loginUrlMatch ? decodeHtmlEntities(loginUrlMatch[1].trim()) : "",
  };
}

// ─── YOPmail ──────────────────────────────────────────────────────────────────

export class YopmailHandler {
  async readEmail(inbox: string, subject?: string, options: ReadEmailOptions = {}): Promise<EmailMessage> {
    const { format = "html" } = options;
    const easyYopmail = require("easy-yopmail");

    const lowerCaseEmail = inbox.toLowerCase();
    if (!lowerCaseEmail.endsWith("@yopmail.com")) {
      throw new Error(`Invalid YOPmail address: ${inbox}. Must end with '@yopmail.com'.`);
    }
    const { inbox: emails } = await easyYopmail.getInbox(lowerCaseEmail);

    const match = subject ? emails?.find((e: any) => e.subject?.includes(subject)) : emails?.[0];

    if (!match) {
      const subjectClause = subject ? ` with subject "${subject}"` : "";
      throw new Error(`No email${subjectClause} found in inbox '${lowerCaseEmail}'.`);
    }

    const message = await easyYopmail.readMessage(lowerCaseEmail, match.id, { format });

    return {
      id: match.id,
      from: message.from,
      subject: match.subject,
      date: message.date,
      content: message.content,
    };
  }

  parseActivateCredentialsFromMailBody(html: string): EmailCredentials {
    return parseCredentials(html, "Login");
  }

  public parseInviteInfoFromMailBody(html: string): EmailCredentials {
    return parseCredentials(html, "Accept Invite");
  }
}
