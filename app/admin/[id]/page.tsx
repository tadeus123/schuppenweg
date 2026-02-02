import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { OrderDetailForm } from '@/components/admin/order-detail-form'
import { OrderImage } from '@/components/admin/order-image'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getOrder(id: string) {
  const supabase = await createClient()
  
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_images (*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching order:', error)
    return null
  }

  return order
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  const order = await getOrder(id)

  if (!order) {
    notFound()
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back link */}
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Zurück zu Bestellungen
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold mb-2">
            Bestellung #{order.id.slice(0, 8)}
          </h1>
          <p className="text-foreground-muted">
            Erstellt am {formatDate(order.created_at)}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Customer Info */}
          <div className="card p-6">
            <h2 className="font-heading text-xl font-bold mb-4">Kundendaten</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-foreground-muted">Name</dt>
                <dd className="font-medium">{order.customer_name}</dd>
              </div>
              <div>
                <dt className="text-foreground-muted">E-Mail</dt>
                <dd className="font-medium">{order.email}</dd>
              </div>
              <div>
                <dt className="text-foreground-muted">Adresse</dt>
                <dd className="font-medium">
                  {order.address}<br />
                  {order.postal_code} {order.city}
                </dd>
              </div>
            </dl>
          </div>

          {/* Order Status */}
          <div className="card p-6">
            <h2 className="font-heading text-xl font-bold mb-4">Bestellstatus</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-foreground-muted">Zahlungsstatus</dt>
                <dd className={`font-medium ${
                  order.payment_status === 'paid' ? 'text-success' : 
                  order.payment_status === 'failed' ? 'text-error' : 'text-warning'
                }`}>
                  {order.payment_status === 'paid' ? 'Bezahlt' : 
                   order.payment_status === 'failed' ? 'Fehlgeschlagen' : 'Ausstehend'}
                </dd>
              </div>
              <div>
                <dt className="text-foreground-muted">Bestellstatus</dt>
                <dd className="font-medium capitalize">{order.status}</dd>
              </div>
              {order.payment_intent_id && (
                <div>
                  <dt className="text-foreground-muted">Payment ID</dt>
                  <dd className="font-mono text-xs">{order.payment_intent_id}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Images */}
        <div className="card p-6 mt-8">
          <h2 className="font-heading text-xl font-bold mb-4">Hochgeladene Fotos</h2>
          {order.order_images && order.order_images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {order.order_images.map((image: { id: string; position: string; image_url: string }) => (
                <OrderImage
                  key={image.id}
                  imageUrl={image.image_url}
                  position={image.position}
                  alt={`${image.position} view`}
                />
              ))}
            </div>
          ) : (
            <p className="text-foreground-muted text-sm">
              Noch keine Fotos hochgeladen.
            </p>
          )}
        </div>

        {/* Diagnosis & Shipping Form */}
        <div className="card p-6 mt-8">
          <h2 className="font-heading text-xl font-bold mb-4">Diagnose & Versand</h2>
          <OrderDetailForm order={order} />
        </div>
      </div>
    </main>
  )
}
