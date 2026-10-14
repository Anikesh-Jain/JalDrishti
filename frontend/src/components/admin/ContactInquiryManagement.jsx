import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import Badge from '../common/Badge';
import Button from '../common/Button';
import LoadingState from '../feedback/LoadingState';
import {
  MailIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  FileTextIcon,
  ShieldCheckIcon
} from '../common/Icons';

const STATUS_TABS = [
  { id: 'all', label: 'All Inquiries' },
  { id: 'New', label: 'New' },
  { id: 'In Review', label: 'In Review' },
  { id: 'Awaiting Response', label: 'Awaiting Response' },
  { id: 'Resolved', label: 'Resolved' }
];

export default function ContactInquiryManagement() {
  const [inquiries, setInquiries] = useState([]);
  const [counts, setCounts] = useState({ all: 0, new: 0, inReview: 0, awaitingResponse: 0, resolved: 0 });
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active inquiry for details modal
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Response composer state inside modal
  const [replyMessage, setReplyMessage] = useState('');
  const [sendEmailCopy, setSendEmailCopy] = useState(true);
  const [replyNewStatus, setReplyNewStatus] = useState('Awaiting Response');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [replyFeedback, setReplyFeedback] = useState(null);

  // Internal notes editor state
  const [internalNotes, setInternalNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesFeedback, setNotesFeedback] = useState(null);

  // Quick status update state
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Retry email state
  const [retryingReplyId, setRetryingReplyId] = useState(null);

  const loadInquiries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (activeTab !== 'all') {
        params.status = activeTab;
      }
      if (searchQuery.trim()) {
        params.q = searchQuery.trim();
      }
      const res = await api.contact.getInquiries(params);
      setInquiries(res.inquiries || []);
      if (res.counts) {
        setCounts(res.counts);
      }
    } catch (err) {
      setError(err.message || 'Failed to load contact inquiries from database');
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery]);

  useEffect(() => {
    loadInquiries();
  }, [loadInquiries]);

  // Open inquiry detail modal
  const handleOpenDetail = async (inquiry) => {
    setSelectedInquiry(inquiry);
    setInternalNotes(inquiry.adminNotes || '');
    setReplyMessage('');
    setReplyFeedback(null);
    setNotesFeedback(null);
    setReplyNewStatus(inquiry.status === 'Resolved' ? 'Resolved' : 'Awaiting Response');

    // Fetch full freshest details
    try {
      setDetailLoading(true);
      const res = await api.contact.getInquiry(inquiry._id);
      if (res.inquiry) {
        setSelectedInquiry(res.inquiry);
        setInternalNotes(res.inquiry.adminNotes || '');
      }
    } catch {
      // Keep existing data if fresh fetch fails
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedInquiry(null);
    setReplyFeedback(null);
    setNotesFeedback(null);
    loadInquiries();
  };

  // Change status directly
  const handleStatusChange = async (inquiryId, newStatus) => {
    try {
      setIsUpdatingStatus(true);
      const res = await api.contact.updateStatus(inquiryId, { status: newStatus });
      if (selectedInquiry && selectedInquiry._id === inquiryId) {
        setSelectedInquiry(res.inquiry);
      }
      await loadInquiries();
    } catch (err) {
      alert(`Status update failed: ${err.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Save internal investigation notes
  const handleSaveNotes = async () => {
    if (!selectedInquiry) return;
    try {
      setIsSavingNotes(true);
      setNotesFeedback(null);
      const res = await api.contact.updateStatus(selectedInquiry._id, {
        adminNotes: internalNotes
      });
      setSelectedInquiry(res.inquiry);
      setNotesFeedback({ type: 'success', message: 'Internal notes saved securely to MongoDB.' });
      setTimeout(() => setNotesFeedback(null), 3500);
      loadInquiries();
    } catch (err) {
      setNotesFeedback({ type: 'error', message: err.message || 'Failed to save notes.' });
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Submit response to citizen
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!selectedInquiry || !replyMessage.trim()) return;

    try {
      setIsSendingReply(true);
      setReplyFeedback(null);
      const res = await api.contact.reply(selectedInquiry._id, {
        message: replyMessage.trim(),
        sendEmail: sendEmailCopy,
        newStatus: replyNewStatus
      });

      setSelectedInquiry(res.inquiry);
      setReplyMessage('');
      setReplyFeedback({
        type: res.deliveryStatus === 'delivered' ? 'success' : 'info',
        message: res.message,
        details: res.deliveryDetails
      });
      loadInquiries();
    } catch (err) {
      setReplyFeedback({
        type: 'error',
        message: err.message || 'Failed to record response.'
      });
    } finally {
      setIsSendingReply(false);
    }
  };

  // Retry sending email for a reply
  const handleRetryEmail = async (replyId) => {
    if (!selectedInquiry) return;
    try {
      setRetryingReplyId(replyId);
      const res = await api.contact.retryEmail(selectedInquiry._id, replyId);
      setSelectedInquiry(res.inquiry);
      loadInquiries();
    } catch (err) {
      alert(`Retry email failed: ${err.message}`);
    } finally {
      setRetryingReplyId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'New':
        return <Badge variant="info" size="sm">New</Badge>;
      case 'In Review':
        return <Badge variant="warning" size="sm">In Review</Badge>;
      case 'Awaiting Response':
        return <Badge variant="neutral" size="sm">Awaiting Response</Badge>;
      case 'Resolved':
        return <Badge variant="safe" size="sm">Resolved</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  return (
    <div id="inquiries" className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden scroll-mt-20">
      {/* 1. Header with Title & Action Counter */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold shadow-xs">
            <MailIcon className="w-5 h-5 text-cyan-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Contact Inquiries & Civic Feedback
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Citizen, community, and academic correspondence submitted via the portal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            <span>Database Records: <strong>{counts.all || inquiries.length}</strong></span>
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={loadInquiries}
            loading={loading}
            className="text-xs"
          >
            Refresh List
          </Button>
        </div>
      </div>

      {/* 2. Search & Tab Filter Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3 bg-white">
        {/* Search input */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Inquiry ID, sender name, email, or keywords..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {STATUS_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            let countForTab = counts.all;
            if (tab.id === 'New') countForTab = counts.new;
            if (tab.id === 'In Review') countForTab = counts.inReview;
            if (tab.id === 'Awaiting Response') countForTab = counts.awaitingResponse;
            if (tab.id === 'Resolved') countForTab = counts.resolved;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#0EA5E9] to-[#0284C7] text-white font-bold shadow-xs'
                    : 'bg-[#F0FAFF] text-[#547181] hover:bg-[#E0F7FF] hover:text-[#163344] border border-[#BAE6FD]/60'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {countForTab}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Inquiry List View */}
      <div className="divide-y divide-slate-100">
        {loading ? (
          <div className="py-12 flex justify-center">
            <LoadingState message="Loading inquiries from JalDrishti database..." />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-rose-600 space-y-2">
            <AlertTriangleIcon className="w-6 h-6 mx-auto text-rose-500" />
            <p className="font-semibold">{error}</p>
            <Button variant="secondary" size="sm" onClick={loadInquiries}>Retry</Button>
          </div>
        ) : inquiries.length > 0 ? (
          inquiries.map((inquiry) => {
            const repliesCount = inquiry.replies ? inquiry.replies.length : 0;
            return (
              <div
                key={inquiry._id}
                className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                      {inquiry.referenceId || `INQ-${inquiry._id.substring(18).toUpperCase()}`}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 truncate max-w-md">
                      {inquiry.subject}
                    </h4>
                    {getStatusBadge(inquiry.status)}
                    {repliesCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full font-semibold border border-cyan-200">
                        <FileTextIcon className="w-3 h-3 text-cyan-600" />
                        <span>{repliesCount} {repliesCount === 1 ? 'Reply' : 'Replies'}</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600">
                    From: <strong className="text-slate-800">{inquiry.name}</strong> •{' '}
                    <span className="font-mono text-slate-500">{inquiry.email}</span>
                  </p>

                  <p className="text-xs text-slate-700 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    "{inquiry.message}"
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-0.5">
                    <span>Submitted: {new Date(inquiry.createdAt).toLocaleString()}</span>
                    {inquiry.adminNotes && (
                      <span className="text-amber-600 font-medium flex items-center gap-1">
                        <ShieldCheckIcon className="w-3 h-3" /> Internal Notes Attached
                      </span>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 shrink-0 md:self-center">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleOpenDetail(inquiry)}
                    className="text-xs bg-[#0284C7] hover:bg-[#0369A1]"
                  >
                    Review & Reply
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-16 text-center text-xs text-slate-400 space-y-2">
            <CheckCircleIcon className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No contact inquiries found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery
                ? `No submissions matched "${searchQuery}". Try clearing search or selecting a different status filter.`
                : activeTab !== 'all'
                ? `No inquiries currently have the "${activeTab}" status.`
                : 'No contact submissions recorded in MongoDB yet. Inquiries submitted via the public landing page will appear here.'}
            </p>
          </div>
        )}
      </div>

      {/* 4. MODAL: Detailed Inquiry Review, Internal Notes, and Reply Composer */}
      {selectedInquiry && (
        <div
          className="fixed inset-0 z-50 bg-[#163344]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={handleCloseDetail}
        >
          <div
            className="bg-white rounded-2xl border border-[#BAE6FD] shadow-2xl max-w-3xl w-full my-8 overflow-hidden text-[#163344] flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50/70 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {selectedInquiry.referenceId || `INQ-${selectedInquiry._id.substring(18).toUpperCase()}`}
                  </span>
                  {getStatusBadge(selectedInquiry.status)}
                </div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  {selectedInquiry.subject}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Submitted by <strong>{selectedInquiry.name}</strong> ({selectedInquiry.email}) on {new Date(selectedInquiry.createdAt).toLocaleString()}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseDetail}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors"
                aria-label="Close dialog"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
              {detailLoading && (
                <div className="py-2 text-center text-xs text-slate-400">
                  Refreshing latest telemetry...
                </div>
              )}

              {/* Citizen's Full Message */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Citizen Message
                </span>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed font-sans">
                  {selectedInquiry.message}
                </div>
              </div>

              {/* Status Management Dropdown & Direct Switchers */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Manage Status</span>
                  <span className="text-[11px] text-slate-500">Current workflow state for this inquiry</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {['New', 'In Review', 'Awaiting Response', 'Resolved'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      disabled={isUpdatingStatus || selectedInquiry.status === st}
                      onClick={() => handleStatusChange(selectedInquiry._id, st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        selectedInquiry.status === st
                          ? 'bg-[#0284C7] text-white shadow-xs'
                          : 'bg-white border border-[#BAE6FD] text-[#547181] hover:bg-[#F0FAFF] disabled:opacity-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Private Internal Notes (Never sent to Citizen) */}
              <div className="space-y-2 p-4 rounded-xl bg-amber-50/50 border border-amber-200/80">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <ShieldCheckIcon className="w-4 h-4 text-amber-600" />
                    <span>Private Internal Investigation Notes</span>
                  </div>
                  <span className="text-[10px] text-amber-700 font-semibold bg-amber-100 px-2 py-0.5 rounded-full">
                    Confidential • Admin Only
                  </span>
                </div>
                <p className="text-[11px] text-amber-800">
                  Notes saved here remain strictly internal to the JalDrishti admin team and are never visible or emailed to the citizen.
                </p>
                <textarea
                  rows={2}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Record internal troubleshooting observations, station probe checks, or investigation logs..."
                  className="w-full p-2.5 text-xs bg-white border border-amber-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-slate-400"
                />
                <div className="flex items-center justify-between">
                  {notesFeedback && (
                    <span
                      className={`text-xs font-medium ${
                        notesFeedback.type === 'success' ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {notesFeedback.message}
                    </span>
                  )}
                  <div className="ml-auto">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleSaveNotes}
                      loading={isSavingNotes}
                      className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300"
                    >
                      Save Internal Notes
                    </Button>
                  </div>
                </div>
              </div>

              {/* Administrator Response Composer */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Write Administrator Response
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Destination: <strong className="font-mono text-slate-700">{selectedInquiry.email}</strong>
                  </span>
                </div>

                <form onSubmit={handleSendReply} className="space-y-3">
                  <textarea
                    rows={4}
                    required
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder={`Dear ${selectedInquiry.name},\n\nThank you for reaching out to the JalDrishti team. Regarding your inquiry regarding ${selectedInquiry.subject}...`}
                    disabled={isSendingReply}
                    className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white placeholder-slate-400 disabled:opacity-60"
                  />

                  {/* Options: Delivery toggle & Status Transition */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 select-none">
                        <input
                          type="checkbox"
                          checked={sendEmailCopy}
                          onChange={(e) => setSendEmailCopy(e.target.checked)}
                          className="w-4 h-4 text-cyan-600 rounded border-slate-300 focus:ring-cyan-500"
                        />
                        <span>
                          Attempt outbound email dispatch to <strong>{selectedInquiry.email}</strong>
                        </span>
                      </label>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500">Update status to:</span>
                        <select
                          value={replyNewStatus}
                          onChange={(e) => setReplyNewStatus(e.target.value)}
                          className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        >
                          <option value="Awaiting Response">Awaiting Response</option>
                          <option value="Resolved">Resolved</option>
                          <option value="In Review">In Review</option>
                        </select>
                      </div>
                    </div>

                    {/* Notice on email dispatch mechanism */}
                    <div className="text-[11px] text-slate-500 flex items-start gap-1.5 pt-1 border-t border-slate-200/60">
                      <svg className="w-3.5 h-3.5 text-cyan-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>
                        Outbound email delivery depends on configured SMTP credentials in <code className="bg-slate-200 px-1 py-0.2 rounded text-slate-700 font-mono">backend/.env</code>. If SMTP is unconfigured, the response is persisted in MongoDB and clearly reported without claiming false delivery.
                      </span>
                    </div>
                  </div>

                  {replyFeedback && (
                    <div
                      className={`p-3 rounded-xl border text-xs ${
                        replyFeedback.type === 'success'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : replyFeedback.type === 'info'
                          ? 'bg-amber-50 border-amber-200 text-amber-800'
                          : 'bg-rose-50 border-rose-200 text-rose-800'
                      }`}
                    >
                      <p className="font-bold">{replyFeedback.message}</p>
                      {replyFeedback.details && (
                        <p className="text-[11px] mt-0.5 opacity-90">{replyFeedback.details}</p>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      loading={isSendingReply}
                      className="text-xs bg-[#0284C7] hover:bg-[#0369A1]"
                    >
                      {sendEmailCopy ? 'Record Response & Dispatch Email' : 'Save Response to Database'}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Reply History */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Response History ({selectedInquiry.replies?.length || 0})
                </h4>

                {selectedInquiry.replies && selectedInquiry.replies.length > 0 ? (
                  <div className="space-y-3">
                    {selectedInquiry.replies.map((reply) => {
                      const isDelivered = reply.deliveryStatus === 'delivered' || reply.sentViaEmail;
                      const isFailed = reply.deliveryStatus === 'failed';
                      const isNotConfig = reply.deliveryStatus === 'not_configured';

                      return (
                        <div key={reply._id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-900">
                              By {reply.adminName || 'Administrator'}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {new Date(reply.createdAt).toLocaleString()}
                            </span>
                          </div>

                          <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed bg-white p-3 rounded-lg border border-slate-100">
                            {reply.response}
                          </p>

                          <div className="flex items-center justify-between gap-2 flex-wrap pt-1 text-[11px]">
                            {/* Delivery status indicator */}
                            <div className="flex items-center gap-1.5">
                              {isDelivered ? (
                                <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full font-semibold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  Emailed to {selectedInquiry.email}
                                </span>
                              ) : isNotConfig ? (
                                <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-full font-semibold" title={reply.deliveryDetails}>
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                  Saved in Database (SMTP Not Configured)
                                </span>
                              ) : isFailed ? (
                                <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-100/70 px-2 py-0.5 rounded-full font-semibold" title={reply.deliveryDetails}>
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                  Email Failed
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded-full font-semibold">
                                  Internal Draft
                                </span>
                              )}
                            </div>

                            {/* Retry button for failed delivery */}
                            {(isFailed || isNotConfig) && (
                              <button
                                type="button"
                                disabled={retryingReplyId === reply._id}
                                onClick={() => handleRetryEmail(reply._id)}
                                className="text-cyan-700 hover:text-cyan-900 font-bold underline cursor-pointer disabled:opacity-50"
                              >
                                {retryingReplyId === reply._id ? 'Retrying...' : 'Retry Delivery'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    No responses have been recorded for this inquiry yet.
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50/70 flex justify-between items-center text-xs">
              <span className="text-slate-500 font-mono text-[11px]">
                ID: {selectedInquiry._id}
              </span>
              <Button variant="secondary" size="sm" onClick={handleCloseDetail}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
