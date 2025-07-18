import { render, screen, fireEvent } from '@testing-library/react'
import { TimeSlotSelector } from '@/components/time-slot-selector'

// Mock the Intl.DateTimeFormat
const mockResolvedOptions = jest.fn().mockReturnValue({ timeZone: 'America/New_York' })
Object.defineProperty(Intl, 'DateTimeFormat', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    resolvedOptions: mockResolvedOptions
  }))
})

describe('TimeSlotSelector', () => {
  const mockAvailableSlots = ['09:00', '09:30', '10:00', '10:30']
  const mockOnTimeSelect = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders available time slots', () => {
    render(
      <TimeSlotSelector
        availableSlots={mockAvailableSlots}
        selectedTime=""
        onTimeSelect={mockOnTimeSelect}
        hostTimezone="UTC"
      />
    )

    // Check that all time slots are rendered with AM/PM format
    expect(screen.getByText('9:00 AM')).toBeInTheDocument()
    expect(screen.getByText('9:30 AM')).toBeInTheDocument()
    expect(screen.getByText('10:00 AM')).toBeInTheDocument()
    expect(screen.getByText('10:30 AM')).toBeInTheDocument()
  })

  it('shows host timezone information', () => {
    render(
      <TimeSlotSelector
        availableSlots={mockAvailableSlots}
        selectedTime=""
        onTimeSelect={mockOnTimeSelect}
        hostTimezone="UTC"
      />
    )

    expect(screen.getByText(/Host timezone:/)).toBeInTheDocument()
    expect(screen.getByText(/UTC/)).toBeInTheDocument()
  })

  it('shows visitor timezone when different from host', () => {
    render(
      <TimeSlotSelector
        availableSlots={mockAvailableSlots}
        selectedTime=""
        onTimeSelect={mockOnTimeSelect}
        hostTimezone="UTC"
      />
    )

    // The visitor timezone should be America/New_York from our mock
    expect(screen.getByText(/Your timezone: America\/New_York/)).toBeInTheDocument()
  })

  it('calls onTimeSelect when a time slot is clicked', () => {
    render(
      <TimeSlotSelector
        availableSlots={mockAvailableSlots}
        selectedTime=""
        onTimeSelect={mockOnTimeSelect}
        hostTimezone="UTC"
      />
    )

    // Click on a time slot
    fireEvent.click(screen.getByText('9:00 AM'))
    expect(mockOnTimeSelect).toHaveBeenCalledWith('09:00')
  })

  it('highlights the selected time slot', () => {
    render(
      <TimeSlotSelector
        availableSlots={mockAvailableSlots}
        selectedTime="09:30"
        onTimeSelect={mockOnTimeSelect}
        hostTimezone="UTC"
      />
    )

    // The selected time slot should have the bg-blue-600 class
    const selectedSlot = screen.getByText('9:30 AM')
    expect(selectedSlot.closest('button')).toHaveClass('bg-blue-600')
  })

  it('shows empty state when no slots are available', () => {
    render(
      <TimeSlotSelector
        availableSlots={[]}
        selectedTime=""
        onTimeSelect={mockOnTimeSelect}
        hostTimezone="UTC"
      />
    )

    expect(screen.getByText('No available times')).toBeInTheDocument()
    expect(screen.getByText(/Please select another date/)).toBeInTheDocument()
  })
})