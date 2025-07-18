import { render, screen } from '@testing-library/react'
import { BookingStepIndicator } from '@/components/booking-step-indicator'

describe('BookingStepIndicator', () => {
  const mockSteps = [
    { id: 'date', name: 'Date' },
    { id: 'time', name: 'Time' },
    { id: 'details', name: 'Details' }
  ]

  it('renders all steps', () => {
    render(
      <BookingStepIndicator
        steps={mockSteps}
        currentStep="date"
        completedSteps={[]}
      />
    )

    expect(screen.getByText('Date')).toBeInTheDocument()
    expect(screen.getByText('Time')).toBeInTheDocument()
    expect(screen.getByText('Details')).toBeInTheDocument()
  })

  it('highlights the current step', () => {
    render(
      <BookingStepIndicator
        steps={mockSteps}
        currentStep="time"
        completedSteps={['date']}
      />
    )

    // Check that the current step has the active class
    const timeStep = screen.getByText('2')
    expect(timeStep.parentElement).toHaveClass('bg-blue-600')
  })

  it('marks completed steps', () => {
    render(
      <BookingStepIndicator
        steps={mockSteps}
        currentStep="details"
        completedSteps={['date', 'time']}
      />
    )

    // Check for check icons in completed steps
    const checkIcons = screen.getAllByTestId('check-icon')
    expect(checkIcons).toHaveLength(2)
  })
})