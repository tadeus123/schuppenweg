export type ImagePosition = 'front' | 'back' | 'left' | 'right' | 'top'

export type OrderStatus = 'pending' | 'paid' | 'diagnosed' | 'shipped' | 'delivered'

export type DiagnosisType = 'oily' | 'dry' | null

export interface Order {
  id: string
  email: string
  customer_name: string
  address: string
  city: string
  postal_code: string
  payment_intent_id: string | null
  payment_status: 'pending' | 'paid' | 'failed'
  diagnosis: DiagnosisType
  tracking_number: string | null
  status: OrderStatus
  created_at: string
}

export interface OrderImage {
  id: string
  order_id: string
  image_url: string
  position: ImagePosition
  created_at: string
}

export interface OrderWithImages extends Order {
  order_images: OrderImage[]
}

export interface UploadedImage {
  position: ImagePosition
  file: File
  preview: string
}

export interface ShippingDetails {
  email: string
  customer_name: string
  address: string
  city: string
  postal_code: string
}
