import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-border mt-40 pt-32">
      <div className="container py-8 h-[32px]">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 h-[31px]">
          <p className="text-sm text-foreground-muted">HUGE Production GmbH</p>
          <div className="flex items-center gap-4">
            <Link
              href="/impressum"
              className="text-sm text-foreground-muted hover:text-foreground transition-colors"
            >
              Impressum
            </Link>
            <Link href="/datenschutz" className="text-sm text-foreground-muted hover:text-foreground transition-colors">
              Datenschutz
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
