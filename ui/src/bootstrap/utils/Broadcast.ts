export type MessageHandler = ({ data: any }) => void;

export class _Broadcast {
  private static broadcastScopes = {};
  public onmessage: MessageHandler;

  constructor(private readonly scope) {
    this.onmessage = null;
    _Broadcast.broadcastScopes[scope] = _Broadcast.broadcastScopes[scope] || [];
    _Broadcast.broadcastScopes[scope].push(this);
    this.close = this.close.bind(this);
    this.postMessage = this.postMessage.bind(this);
  }

  close() {
    _Broadcast.broadcastScopes[this.scope] = _Broadcast.broadcastScopes[this.scope].filter((bc) => bc !== this);
    this.onmessage = null;
  };

  postMessage(data: any) {
    _Broadcast.broadcastScopes[this.scope].forEach((bc) => {
      if (bc !== this && bc.onmessage) {
        bc.onmessage({ data });
      }
    });
  };
}

export const Broadcast = typeof BroadcastChannel !== 'undefined' ? BroadcastChannel : _Broadcast;
export type BroadcastType = BroadcastChannel | _Broadcast;
