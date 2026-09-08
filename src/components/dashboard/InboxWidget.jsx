import React from 'react';
import { Link } from 'react-router-dom';
import { useInboxContext } from '../../context/InboxContext';
import Card from '../common/Card';
import { Inbox, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function InboxWidget() {
  const { inboxItems, stats, openQuickCapture } = useInboxContext();
  const unprocessedItems = inboxItems.filter((i) => i.status === 'unprocessed').slice(0, 4);

  return (
    <Card
      title="Inbox Captures"
      subtitle={`${stats.unprocessed} items waiting to triage`}
      action={
        <Link
          to="/inbox"
          className="text-xs text-[#7C3AED] hover:text-[#c4b5fd] font-semibold transition-colors inline-flex items-center gap-1"
        >
          <span>Open Inbox</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      }
    >
      <div className="space-y-2 text-xs">
        {unprocessedItems.length === 0 ? (
          <div className="py-5 text-center text-slate-500 italic space-y-2">
            <CheckCircle2 className="w-6 h-6 mx-auto opacity-40 text-emerald-400" />
            <p className="text-xs">Inbox is completely clear</p>
            <button
              type="button"
              onClick={openQuickCapture}
              className="text-[11px] text-[#7C3AED] hover:underline font-semibold"
            >
              + Quick Capture thought (Q)
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            {unprocessedItems.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-xl bg-[#171C27] border border-white/[0.04] flex items-center justify-between gap-2"
              >
                <span className="font-semibold text-white truncate flex-1">
                  {item.title}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-white/[0.06] text-slate-300 uppercase shrink-0">
                  {item.type}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
