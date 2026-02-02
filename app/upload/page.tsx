'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { SolutionSection } from '@/components/landing/solution-section'
import { ImageUploadZone } from '@/components/upload/image-upload-zone'
import { Button } from '@/components/ui/button'
import { useImageUpload } from '@/lib/hooks/use-image-upload'
import { useOrder } from '@/lib/context/order-context'
import type { ImagePosition } from '@/lib/types'

const positions: { position: ImagePosition; label: string }[] = [
  { position: 'front', label: 'Vorne' },
  { position: 'back', label: 'Hinten' },
  { position: 'left', label: 'Links' },
  { position: 'right', label: 'Rechts' },
  { position: 'top', label: 'Oben' },
]

export default function UploadPage() {
  const router = useRouter()
  const { setImages: setOrderImages } = useOrder()
  const {
    images,
    isCompressing,
    handleImageSelect,
    handleImageRemove,
    allImagesUploaded,
    uploadedCount,
  } = useImageUpload()

  const handleContinue = () => {
    if (allImagesUploaded) {
      setOrderImages(images)
      router.push('/checkout')
    }
  }

  return (
    <>
      <main className="min-h-screen pt-20 md:pt-32 pb-16">
        <div className="container max-w-4xl">
          {/* Simple header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12 md:mb-16"
          >
            <h1 className="font-heading text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-4">
              5 Fotos.
            </h1>
            <p className="text-foreground-muted text-base md:text-lg">
              Zeig uns deine Kopfhaut.
            </p>
          </motion.div>

          {/* Progress - minimal */}
          <div className="flex justify-center gap-2 mb-8 md:mb-12" style={{ height: '44px', lineHeight: '120px', paddingTop: '9px', paddingBottom: '9px' }}>
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`w-[12px] h-[12px] rounded-full transition-colors ${
                  i < uploadedCount ? 'bg-accent' : 'bg-border'
                }`}
              />
            ))}
          </div>

          {/* Upload Grid - cleaner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-12 md:mb-16">
            {positions.map((pos, index) => (
              <motion.div
                key={pos.position}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ImageUploadZone
                  position={pos.position}
                  label={pos.label}
                  description=""
                  image={images[pos.position]}
                  onImageSelect={handleImageSelect}
                  onImageRemove={handleImageRemove}
                />
              </motion.div>
            ))}
          </div>

          {/* Continue - styled exactly like hero CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center flex items-center justify-center"
            style={{ minHeight: '287px' }}
          >
            <div className="group">
              <motion.button
                whileHover={allImagesUploaded && !isCompressing ? { y: -2 } : {}}
                whileTap={allImagesUploaded && !isCompressing ? { y: 0 } : {}}
                onClick={handleContinue}
                disabled={!allImagesUploaded || isCompressing}
                className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-accent text-accent font-semibold text-base tracking-[-0.5px] uppercase whitespace-nowrap transition-all duration-300 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.25)] group-hover:bg-accent group-hover:text-white group-hover:border-accent group-hover:shadow-[0_6px_28px_-4px_rgba(0,0,0,0.35)] disabled:opacity-50 disabled:cursor-not-allowed disabled:group-hover:bg-transparent disabled:group-hover:text-accent disabled:group-hover:border-accent disabled:group-hover:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.25)]"
                style={{ borderRadius: 0, paddingLeft: '0.375rem', paddingRight: '0.375rem', paddingTop: '0.375rem', paddingBottom: '0.375rem' }}
              >
                {isCompressing ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : allImagesUploaded ? (
                  <>
                    Weiter
                    <svg 
                      className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </>
                ) : (
                  `${uploadedCount}/5`
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>

        <SolutionSection />
      </main>
    </>
  )
}
