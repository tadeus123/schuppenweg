'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function AdminLoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  // Check if Supabase is configured
  const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder'

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isSupabaseConfigured) {
      // For development without Supabase, just redirect to admin
      router.push('/admin')
      return
    }
    
    setIsLoading(true)
    setError('')

    try {
      const supabase = createClient()
      
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (authError) {
        throw authError
      }

      router.push('/admin')
      router.refresh()
    } catch (err) {
      console.error('Login error:', err)
      setError('Ungültige Anmeldedaten. Bitte versuche es erneut.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold mb-2">Admin Login</h1>
          <p className="text-foreground-muted">Schuppenweg Verwaltung</p>
        </div>

        {!isSupabaseConfigured && (
          <div className="card p-4 mb-6 border-warning/30 bg-warning/5">
            <p className="text-sm text-warning">
              <strong>Dev Mode:</strong> Supabase ist nicht konfiguriert. 
              Klicke einfach auf Anmelden um fortzufahren.
            </p>
          </div>
        )}

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground-muted mb-2">
                E-Mail
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@schuppenweg.de"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                disabled={!isSupabaseConfigured}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground-muted mb-2">
                Passwort
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                disabled={!isSupabaseConfigured}
              />
            </div>

            {error && (
              <p className="text-error text-sm">{error}</p>
            )}

            <Button
              type="submit"
              size="lg"
              isLoading={isLoading}
              className="w-full"
            >
              Anmelden
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-foreground-subtle mt-6">
          Nur für autorisierte Administratoren.
        </p>
      </motion.div>
    </main>
  )
}
