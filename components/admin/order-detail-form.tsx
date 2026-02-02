'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { DiagnosisType, OrderStatus } from '@/lib/types'

interface Order {
  id: string
  diagnosis: DiagnosisType
  tracking_number: string | null
  status: OrderStatus
}

interface OrderDetailFormProps {
  order: Order
}

export function OrderDetailForm({ order }: OrderDetailFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [diagnosis, setDiagnosis] = useState<DiagnosisType>(order.diagnosis)
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || '')
  const [status, setStatus] = useState<OrderStatus>(order.status)
  const [message, setMessage] = useState('')

  const handleSave = async () => {
    setIsLoading(true)
    setMessage('')

    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('orders')
        .update({
          diagnosis,
          tracking_number: trackingNumber || null,
          status,
        })
        .eq('id', order.id)

      if (error) throw error

      setMessage('Änderungen gespeichert!')
      router.refresh()
    } catch (error) {
      console.error('Error updating order:', error)
      setMessage('Fehler beim Speichern.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkDiagnosed = async () => {
    if (!diagnosis) {
      setMessage('Bitte wähle eine Diagnose aus.')
      return
    }
    setStatus('diagnosed')
    setIsLoading(true)

    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('orders')
        .update({
          diagnosis,
          status: 'diagnosed',
        })
        .eq('id', order.id)

      if (error) throw error

      setMessage('Als diagnostiziert markiert!')
      router.refresh()
    } catch (error) {
      console.error('Error updating order:', error)
      setMessage('Fehler beim Speichern.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkShipped = async () => {
    if (!trackingNumber) {
      setMessage('Bitte gib eine Sendungsnummer ein.')
      return
    }
    setStatus('shipped')
    setIsLoading(true)

    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('orders')
        .update({
          tracking_number: trackingNumber,
          status: 'shipped',
        })
        .eq('id', order.id)

      if (error) throw error

      setMessage('Als versendet markiert!')
      router.refresh()
    } catch (error) {
      console.error('Error updating order:', error)
      setMessage('Fehler beim Speichern.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Diagnosis */}
      <div>
        <label className="block text-sm font-medium text-foreground-muted mb-2 uppercase tracking-wider">
          Diagnose
        </label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setDiagnosis('oily')}
            className={`flex-1 p-4 border text-center transition-colors ${
              diagnosis === 'oily'
                ? 'border-warning bg-warning/10 text-warning'
                : 'border-border hover:border-warning/50'
            }`}
          >
            <span className="block font-bold mb-1">Fettig</span>
            <span className="text-xs text-foreground-muted">Gelbliche, ölige Schuppen</span>
          </button>
          <button
            type="button"
            onClick={() => setDiagnosis('dry')}
            className={`flex-1 p-4 border text-center transition-colors ${
              diagnosis === 'dry'
                ? 'border-accent-secondary bg-accent-secondary/10 text-accent-secondary'
                : 'border-border hover:border-accent-secondary/50'
            }`}
          >
            <span className="block font-bold mb-1">Trocken</span>
            <span className="text-xs text-foreground-muted">Weiße, feine Schuppen</span>
          </button>
        </div>
      </div>

      {/* Tracking Number */}
      <div>
        <label htmlFor="tracking" className="block text-sm font-medium text-foreground-muted mb-2 uppercase tracking-wider">
          Sendungsnummer
        </label>
        <Input
          id="tracking"
          placeholder="z.B. DHL 1234567890"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
        />
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-foreground-muted mb-2 uppercase tracking-wider">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
          className="w-full px-4 py-3 bg-background-secondary border border-border text-foreground"
        >
          <option value="pending">Ausstehend</option>
          <option value="paid">Bezahlt</option>
          <option value="diagnosed">Diagnostiziert</option>
          <option value="shipped">Versendet</option>
          <option value="delivered">Zugestellt</option>
        </select>
      </div>

      {/* Message */}
      {message && (
        <p className={`text-sm ${message.includes('Fehler') ? 'text-error' : 'text-success'}`}>
          {message}
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-4 pt-4 border-t border-border">
        <Button
          onClick={handleSave}
          isLoading={isLoading}
          variant="secondary"
        >
          Änderungen speichern
        </Button>
        
        {order.status === 'paid' && (
          <Button
            onClick={handleMarkDiagnosed}
            isLoading={isLoading}
            disabled={!diagnosis}
          >
            Als diagnostiziert markieren
          </Button>
        )}
        
        {order.status === 'diagnosed' && (
          <Button
            onClick={handleMarkShipped}
            isLoading={isLoading}
            disabled={!trackingNumber}
          >
            Als versendet markieren
          </Button>
        )}
      </div>
    </div>
  )
}
