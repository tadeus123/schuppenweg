import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

type OrderStatus = 'pending' | 'paid' | 'diagnosed' | 'shipped' | 'delivered'

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-warning/10 text-warning border-warning/30',
  paid: 'bg-accent/10 text-accent border-accent/30',
  diagnosed: 'bg-accent-secondary/10 text-accent-secondary border-accent-secondary/30',
  shipped: 'bg-success/10 text-success border-success/30',
  delivered: 'bg-foreground-muted/10 text-foreground-muted border-foreground-muted/30',
}

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Ausstehend',
  paid: 'Bezahlt',
  diagnosed: 'Diagnostiziert',
  shipped: 'Versendet',
  delivered: 'Zugestellt',
}

interface Order {
  id: string
  email: string
  customer_name: string
  status: string
  diagnosis: string | null
  created_at: string
}

async function getOrders(): Promise<Order[]> {
  // Check if Supabase is configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'placeholder') {
    return []
  }

  try {
    const supabase = await createClient()
    
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching orders:', error)
      return []
    }

    return orders || []
  } catch (error) {
    console.error('Error connecting to Supabase:', error)
    return []
  }
}

async function signOut() {
  'use server'
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'placeholder') {
    redirect('/admin/login')
  }
  
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}

export default async function AdminPage() {
  // Check if Supabase is configured
  const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder'

  let user = null
  if (isSupabaseConfigured) {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user
    
    if (!user) {
      redirect('/admin/login')
    }
  }

  const orders = await getOrders()

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold">Bestellungen</h1>
            <p className="text-foreground-muted">Schuppenweg Admin Panel</p>
          </div>
          {isSupabaseConfigured && (
            <form action={signOut}>
              <button
                type="submit"
                className="btn btn-secondary text-xs"
              >
                Abmelden
              </button>
            </form>
          )}
        </div>

        {/* Configuration notice */}
        {!isSupabaseConfigured && (
          <div className="card p-6 mb-8 border-warning/30 bg-warning/5">
            <h3 className="font-bold text-warning mb-2">Supabase nicht konfiguriert</h3>
            <p className="text-sm text-foreground-muted mb-4">
              Um das Admin Panel zu nutzen, konfiguriere bitte die Supabase Umgebungsvariablen in <code className="bg-background-tertiary px-1">.env.local</code>:
            </p>
            <ul className="text-xs font-mono text-foreground-subtle space-y-1">
              <li>NEXT_PUBLIC_SUPABASE_URL</li>
              <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
              <li>SUPABASE_SERVICE_ROLE_KEY</li>
            </ul>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="card p-4">
            <div className="text-2xl font-bold">{orders.length}</div>
            <div className="text-sm text-foreground-muted">Gesamt</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-warning">
              {orders.filter(o => o.status === 'pending').length}
            </div>
            <div className="text-sm text-foreground-muted">Ausstehend</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-accent">
              {orders.filter(o => o.status === 'paid').length}
            </div>
            <div className="text-sm text-foreground-muted">Bezahlt</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-accent-secondary">
              {orders.filter(o => o.status === 'diagnosed').length}
            </div>
            <div className="text-sm text-foreground-muted">Diagnostiziert</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-success">
              {orders.filter(o => o.status === 'shipped' || o.status === 'delivered').length}
            </div>
            <div className="text-sm text-foreground-muted">Versendet</div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="card overflow-hidden">
          {orders.length === 0 ? (
            <div className="p-12 text-center text-foreground-muted">
              <p className="text-lg mb-2">Noch keine Bestellungen</p>
              <p className="text-sm">Bestellungen erscheinen hier, sobald Kunden bezahlt haben.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background-tertiary">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold uppercase tracking-wider">ID</th>
                    <th className="text-left p-4 text-sm font-semibold uppercase tracking-wider">Kunde</th>
                    <th className="text-left p-4 text-sm font-semibold uppercase tracking-wider">Datum</th>
                    <th className="text-left p-4 text-sm font-semibold uppercase tracking-wider">Diagnose</th>
                    <th className="text-left p-4 text-sm font-semibold uppercase tracking-wider">Status</th>
                    <th className="text-left p-4 text-sm font-semibold uppercase tracking-wider">Aktion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-background-secondary transition-colors">
                      <td className="p-4">
                        <span className="font-mono text-sm">{order.id.slice(0, 8)}</span>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{order.customer_name}</div>
                          <div className="text-sm text-foreground-muted">{order.email}</div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-foreground-muted">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="p-4">
                        {order.diagnosis ? (
                          <span className={`text-sm font-medium ${
                            order.diagnosis === 'oily' ? 'text-warning' : 'text-accent-secondary'
                          }`}>
                            {order.diagnosis === 'oily' ? 'Fettig' : 'Trocken'}
                          </span>
                        ) : (
                          <span className="text-sm text-foreground-subtle">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-3 py-1 text-xs font-medium border ${statusColors[order.status as OrderStatus]}`}>
                          {statusLabels[order.status as OrderStatus]}
                        </span>
                      </td>
                      <td className="p-4">
                        <Link
                          href={`/admin/${order.id}`}
                          className="text-sm text-accent hover:text-accent-hover transition-colors"
                        >
                          Details →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
