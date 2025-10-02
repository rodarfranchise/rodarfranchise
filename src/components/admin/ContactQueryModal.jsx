import { X, Mail, Phone, Calendar, MessageSquare, User, FileText } from 'lucide-react'

export default function ContactQueryModal({ isOpen, onClose, query }) {
  if (!isOpen || !query) return null

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'new':
        return 'bg-orange-100 text-orange-800'
      case 'read':
        return 'bg-blue-100 text-blue-800'
      case 'replied':
        return 'bg-green-100 text-green-800'
      case 'closed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl border border-yellow-200">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-yellow-200 bg-yellow-50/60">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Contact Query Details</h2>
                <p className="text-sm text-slate-500">Query ID: {query.id.slice(0, 8)}...</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-yellow-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Contact Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-yellow-50 rounded-lg">
                    <User className="h-5 w-5 text-yellow-700" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">Name</h3>
                    <p className="text-slate-600">{query.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-yellow-50 rounded-lg">
                    <Mail className="h-5 w-5 text-yellow-700" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">Email</h3>
                    <p className="text-slate-600">{query.email}</p>
                  </div>
                </div>

                {query.phone && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-yellow-50 rounded-lg">
                      <Phone className="h-5 w-5 text-yellow-700" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900">Phone</h3>
                      <p className="text-slate-600">{query.phone}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-yellow-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-yellow-700" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">Submitted</h3>
                    <p className="text-slate-600">{formatDate(query.created_at)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-slate-900 mb-2">Status</h3>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(query.status)}`}>
                    {query.status.charAt(0).toUpperCase() + query.status.slice(1)}
                  </span>
                </div>

                <div>
                  <h3 className="font-medium text-slate-900 mb-2">Subject</h3>
                  <p className="text-slate-700 bg-yellow-50 p-3 rounded-lg border border-yellow-100">{query.subject}</p>
                </div>
              </div>
            </div>

            {/* Message */}
            <div>
              <h3 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Message
              </h3>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                <p className="text-slate-700 whitespace-pre-wrap">{query.message}</p>
              </div>
            </div>

            {/* Admin Notes */}
            {query.admin_notes && (
              <div>
                <h3 className="font-medium text-slate-900 mb-3">Admin Notes</h3>
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <p className="text-slate-700 whitespace-pre-wrap">{query.admin_notes}</p>
                </div>
              </div>
            )}

            {/* Last Updated */}
            {query.updated_at && query.updated_at !== query.created_at && (
              <div className="text-sm text-slate-500">
                Last updated: {formatDate(query.updated_at)}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-yellow-200 bg-yellow-50/60">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-800 bg-white border border-yellow-300 rounded-lg hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
