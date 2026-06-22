import axios from 'axios';

const MAILDROP_API = 'https://api.maildrop.cc/graphql';
const REQUEST_TIMEOUT = 10000;

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
  format?: 'txt' | 'html';
}

export class MaildropHandler {
  /** Posts a GraphQL query to the Maildrop API and returns the `data` payload. */
  private async graphql<T>(query: string): Promise<T> {
    const response = await axios.post(
      MAILDROP_API,
      { query },
      { headers: { 'Content-Type': 'application/json' }, timeout: REQUEST_TIMEOUT },
    );
    return response.data.data;
  }

  /**
   * Fetches a single email from a Maildrop inbox.
   * Lists the inbox to locate a matching message by subject, then retrieves the full content.
   * Throws if no matching email is found or the request exceeds the timeout.
   */
  async readEmail(
    inbox: string,
    subject?: string,
    options: ReadEmailOptions = {},
  ): Promise<EmailMessage> {
    const { format = 'html' } = options;
    const mailAcc = inbox.split('@')[0];

    const inboxData = await this.graphql<{ inbox: any[] }>(
      `query { inbox(mailbox:"${mailAcc}") { id headerfrom subject date } }`
    );
    const emails = inboxData.inbox ?? [];
    const match = subject ? emails.find((e: any) => e.subject?.includes(subject)) : emails[0];

    if (!match) {
      const subjectClause = subject ? ` with subject "${subject}"` : '';
      throw new Error(`No email${subjectClause} found in inbox '${mailAcc}'.`);
    }

    const messageData = await this.graphql<{ message: any }>(
      `query { message(mailbox:"${mailAcc}", id:"${match.id}") { id headerfrom subject date html data } }`
    );

    const msg = messageData.message;

    return {
      id: msg.id,
      from: msg.headerfrom,
      subject: msg.subject,
      date: msg.date,
      content: format === 'html' ? (msg.html ?? '') : (msg.data ?? ''),
    };
  }

  /** Extracts the password and login URL from the HTML body of a Maildrop credential email. */
  parseCredentialsFromMailBody(html: string): EmailCredentials {
    const passwordMatch = html.match(/Password:\s*(.+?)\s*<\/p>/s);
    const loginUrlMatch = html.match(/<a[^>]+href="([^"]+)"[^>]*>\s*Login\s*<\/a>/i);

    if (!passwordMatch) throw new Error('Password not found in email content');
    if (!loginUrlMatch) throw new Error('Login URL not found in email content');

    return {
      password: this.decodeHtmlEntities(passwordMatch[1].trim()),
      loginUrl: loginUrlMatch[1],
    };
  }

  private decodeHtmlEntities(str: string): string {
    return str
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&apos;/g, "'")
      .replace(/&#39;/g, "'")
      .replace(/&#x27;/g, "'");
  }
}
