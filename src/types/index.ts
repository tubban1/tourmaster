export interface User {
  id: string
  agencyId: string
  username: string
  email: string
  role: string
  isActive: boolean
  openid?: string
  createdAt: Date
  updatedAt: Date
  agency?: Agency
}

export interface Agency {
  id: string
  name: string
  contactEmail: string
  contactPhone: string
  address: string
  isActive: boolean
  platformAdminId: string
  createdAt: Date
  updatedAt: Date
}

export interface Itinerary {
  id: string
  agencyId: string
  tourId?: string
  name: string
  description: string
  durationDays: number
  destinations: string[]
  activities: any[]
  costEstimation: number
  inclusion: string[]
  exclusion: string[]
  isActive: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface Tour {
  id: string
  agencyId: string
  name: string
  itineraryId?: string
  status: 'planned' | 'paid' | 'completed' | 'cancelled'
  maxCapacity: number
  currentMembersCount: number
  salesManagerId: string
  actualCost?: number
  actualRevenue?: number
  notes?: string
  overallArrivalTime?: Date
  overallDepartureTime?: Date
  pickupSignInfo?: string
  flightDetails?: any
  createdAt: Date
  updatedAt: Date
}

export interface TourMember {
  id: string
  tourId: string
  firstName: string
  lastName: string
  gender: string
  dateOfBirth: Date
  passportNumber: string
  contactEmail: string
  contactPhone: string
  emergencyContactName: string
  emergencyContactPhone: string
  healthNotes?: string
  dietaryRestrictions?: string
  createdAt: Date
  updatedAt: Date
}

export interface TourGuide {
  id: string
  name: string
  gender: string
  contactPhone: string
  email: string
  languages: string[]
  specialties: string[]
  rating: number
  occupiedDates: string[]
  notes?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Vehicle {
  id: string
  agencyId: string
  plateNumber: string
  type: string
  make: string
  model: string
  capacity: number
  year: number
  driverName: string
  driverContact: string
  maintenanceStatus: string
  lastMaintenanceDate: Date
  nextMaintenanceDate: Date
  occupations: VehicleOccupation[]
  notes?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface VehicleOccupation {
  type: '使用' | '维修' | '保养' | '事故' | '待命' | '报废' | '租赁' | '检测'
  dates: string[] // 日期数组，格式：YYYY-MM-DD
}

export interface Booking {
  id: string
  tourId: string
  startDate: Date
  endDate: Date
  assignedGuides: any[]
  assignedVehicle?: any
  assignedAccommodations?: any[]
  status: 'pending' | 'confirmed' | 'cancelled'
  bookedBy: string
  createdAt: Date
  updatedAt: Date
}

export interface Supplier {
  id: string
  agencyId: string
  name: string
  type: string
  contactPerson: string
  contactEmail: string
  contactPhone: string
  address: string
  serviceOfferings: string[]
  notes?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ServiceReservation {
  id: string
  tourId: string
  supplierId: string
  serviceType: string
  description: string
  startDate: Date
  endDate: Date
  quantity: number
  unitPrice: number
  totalCost: number
  status: 'pending' | 'confirmed' | 'cancelled'
  confirmationNumber: string
  bookedBy: string
  createdAt: Date
  updatedAt: Date
} 