export interface CreateRoomDto {
  propertyId: number
  name: string
  description: string
  basePrice: number
  capacity: number
  totalUnits: number
}

export interface UpdateRoomDto {
  name?: string
  description?: string
  basePrice?: number
  capacity?: number
  totalUnits?: number
}

export interface RoomResponseDto {
  id: number
  propertyId: number
  propertyName: string
  name: string
  description: string
  basePrice: number
  capacity: number
  totalUnits: number
  availableUnits: number
  imageUrls: string[]
  facilities: string[]
  status: 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
}

export interface CreateRoomImageDto {
  roomId: number
  url: string
  altText?: string
  order?: number
}

