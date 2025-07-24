/**
 * Anonymous telemetry for understanding usage patterns
 * Helps improve the service and track adoption
 * 
 * Privacy: Only collects anonymous usage metrics, no personal data
 * Users can opt-out via telemetry: false in config
 */

interface TelemetryEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: string;
}

interface TelemetryConfig {
  apiKey: string;
  version: string;
  endpoint: string;
}

export class TelemetryClient {
  private queue: TelemetryEvent[] = [];
  private config: TelemetryConfig;
  private sessionId: string;
  private flushInterval: NodeJS.Timeout;
  private readonly MAX_QUEUE_SIZE = 100;
  private readonly FLUSH_INTERVAL_MS = 30000; // 30 seconds

  constructor(config: TelemetryConfig) {
    this.config = config;
    this.sessionId = this.generateSessionId();
    
    // Start periodic flush
    this.flushInterval = setInterval(() => {
      this.flush().catch(() => {
        // Silently fail telemetry
      });
    }, this.FLUSH_INTERVAL_MS);

    // Flush on process exit
    if (typeof process !== 'undefined') {
      process.on('beforeExit', () => this.flush());
    }
  }

  track(event: string, properties?: Record<string, any>) {
    // Add to queue
    this.queue.push({
      event,
      properties: {
        ...properties,
        session_id: this.sessionId,
        client_version: this.config.version,
        platform: this.getPlatform(),
        node_version: process.version,
      },
      timestamp: new Date().toISOString()
    });

    // Flush if queue is getting large
    if (this.queue.length >= this.MAX_QUEUE_SIZE) {
      this.flush().catch(() => {
        // Silently fail
      });
    }
  }

  async flush() {
    if (this.queue.length === 0) {
      return;
    }

    const events = [...this.queue];
    this.queue = [];

    try {
      // Send telemetry to platform
      // This is a fire-and-forget operation
      await fetch(`${this.config.endpoint}/telemetry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey,
          'X-Telemetry': 'true'
        },
        body: JSON.stringify({ events })
      });
    } catch (error) {
      // Telemetry should never break the app
      // Silently fail and continue
    }
  }

  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getPlatform(): string {
    if (typeof process === 'undefined') {
      return 'browser';
    }

    // Try to detect if we're in specific environments
    if (process.env.CLAUDE_DESKTOP) {
      return 'claude-desktop';
    }
    if (process.env.CURSOR_IDE) {
      return 'cursor';
    }
    if (process.env.VSCODE_PID) {
      return 'vscode';
    }
    
    return 'node';
  }
}

// Telemetry events we track (for documentation)
export const TELEMETRY_EVENTS = {
  // Memory operations
  'memory.stored': 'A memory was successfully stored',
  'memory.searched': 'Memories were searched',
  'memory.retrieved': 'A specific memory was retrieved',
  'memory.updated': 'A memory was updated',
  'memory.deleted': 'A memory was deleted',
  
  // Entity operations
  'entities.listed': 'Entities were listed',
  'entities.graph_retrieved': 'Entity graph was retrieved',
  
  // Attachments
  'attachment.created': 'An attachment was added',
  
  // Recommendations
  'recommendations.retrieved': 'Recommendations were requested',
  
  // Errors (anonymous)
  'error.auth': 'Authentication error occurred',
  'error.rate_limit': 'Rate limit was hit',
  'error.quota': 'Quota exceeded',
  
  // Session
  'session.started': 'New session started',
  'session.ended': 'Session ended'
} as const;

// Privacy notice for README
export const TELEMETRY_NOTICE = `
## Telemetry

This client collects anonymous usage telemetry to help improve the service. 
No personal data or memory content is ever collected.

What we collect:
- API methods used (store, search, etc.)
- Error types (not error messages)
- Client version and platform
- Session duration

To opt-out, set telemetry: false in your configuration:

\`\`\`javascript
const client = new PuoMemoClient({
  apiKey: 'your-key',
  telemetry: false
});
\`\`\`
`;