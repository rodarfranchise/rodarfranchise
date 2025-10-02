import { useState } from 'react'
import { Send, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '../../utils/cn'

export default function ContactForm({
  onSubmit,
  className = '',
  title = 'Get in Touch',
  subtitle = 'We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.',
  fields = [
    { name: 'name', label: 'Full Name', type: 'text', required: true },
    { name: 'email', label: 'Email Address', type: 'email', required: true },
    { name: 'phone', label: 'Phone Number', type: 'tel', required: false },
    { name: 'company', label: 'Company', type: 'text', required: false },
    { name: 'message', label: 'Message', type: 'textarea', required: true }
  ],
  submitText = 'Send Message',
  successMessage = 'Thank you! Your message has been sent successfully.',
  errorMessage = 'Something went wrong. Please try again.'
}) {
  const [formData, setFormData] = useState({})
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null) // 'success' | 'error' | null

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    fields.forEach(field => {
      if (field.required && !formData[field.name]?.trim()) {
        newErrors[field.name] = `${field.label} is required`
      }
      
      if (field.name === 'email' && formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address'
      }
      
      if (field.name === 'phone' && formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'Please enter a valid phone number'
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    setSubmitStatus(null)
    
    try {
      await onSubmit(formData)
      setSubmitStatus('success')
      setFormData({})
      // Reset form after 3 seconds
      setTimeout(() => setSubmitStatus(null), 3000)
    } catch (error) {
      setSubmitStatus('error')
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderField = (field) => {
    const fieldId = `contact-${field.name}`
    const hasError = errors[field.name]
    
    if (field.type === 'textarea') {
      return (
        <div key={field.name} className="col-span-full">
          <label htmlFor={fieldId} className="block text-sm font-medium text-slate-700 mb-2">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <textarea
            id={fieldId}
            name={field.name}
            rows={4}
            value={formData[field.name] || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className={cn(
              'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500',
              hasError
                ? 'border-red-300 focus:ring-red-500'
                : 'border-slate-300'
            )}
            placeholder={`Enter your ${field.label.toLowerCase()}`}
            required={field.required}
          />
          {hasError && (
            <p className="mt-1 text-sm text-red-600">{hasError}</p>
          )}
        </div>
      )
    }
    
    return (
      <div key={field.name} className="col-span-full sm:col-span-1">
        <label htmlFor={fieldId} className="block text-sm font-medium text-slate-700 mb-2">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          id={fieldId}
          type={field.type}
          name={field.name}
          value={formData[field.name] || ''}
          onChange={(e) => handleInputChange(field.name, e.target.value)}
          className={cn(
            'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500',
            hasError
              ? 'border-red-300 focus:ring-red-500'
              : 'border-slate-300'
          )}
          placeholder={`Enter your ${field.label.toLowerCase()}`}
          required={field.required}
        />
        {hasError && (
          <p className="mt-1 text-sm text-red-600">{hasError}</p>
        )}
      </div>
    )
  }

  return (
    <div className={cn('bg-white rounded-lg border border-slate-200 p-6', className)}>
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
        {subtitle && (
          <p className="text-slate-600">{subtitle}</p>
        )}
      </div>

      {submitStatus === 'success' && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="h-5 w-5" />
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map(renderField)}
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              'w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-blue-600 text-white rounded-lg hover:bg-brand-blue-700 focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:ring-offset-2 transition-colors',
              isSubmitting && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                {submitText}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
