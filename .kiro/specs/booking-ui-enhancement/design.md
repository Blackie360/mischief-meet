# Design Document

## Overview

This design document outlines the approach for enhancing the booking UI/UX when visitors access a user's public URL. The design is inspired by the provided screenshot and aims to create a modern, intuitive, and visually appealing booking experience. The implementation will focus on improving the calendar interface, time slot selection, meeting information display, and overall form usability while maintaining consistency with the existing application architecture.

## Architecture

The enhanced booking experience will maintain the current architecture of the application:

1. **Frontend Components**: React components using Next.js framework
2. **Styling**: Tailwind CSS with custom components from the UI library
3. **State Management**: React hooks for local state management
4. **Data Flow**: Server-side data fetching for initial page load, client-side interactions for booking process
5. **API Integration**: RESTful API calls to handle booking creation

No architectural changes are required, as we're enhancing existing components rather than introducing new architectural patterns.

## Components and Interfaces

### 1. Enhanced Public Profile Page (`app/[username]/page.tsx`)

The main page will be updated to provide a more visually appealing layout with:

- Improved header section with host information
- Two-column layout for desktop view (host info + booking form)
- Responsive design for mobile devices

```tsx
// Updated structure (pseudo-code)
<PublicProfilePage>
  <Header>
    <HostInfo />
  </Header>
  <TwoColumnLayout>
    <LeftColumn>
      <MeetingTypeInfo />
      <HostDetails />
      <MeetingDetails />
    </LeftColumn>
    <RightColumn>
      <EnhancedBookingForm />
    </RightColumn>
  </TwoColumnLayout>
</PublicProfilePage>
```

### 2. Enhanced Booking Form Component (`components/booking-form.tsx`)

The booking form will be updated with the following sub-components:

#### 2.1 Calendar Component

An enhanced calendar component with:
- Month view with navigation controls
- Day name headers (Sun, Mon, Tue, etc.)
- Visual indicators for available/unavailable dates
- Selected date highlighting
- "Today" button for quick navigation

```tsx
interface CalendarProps {
  availability: AvailabilityType[];
  selectedDate: Date | undefined;
  onDateSelect: (date: Date) => void;
  timezone: string;
}
```

#### 2.2 Time Slot Selector

A redesigned time slot selector with:
- Clean, visually appealing layout for time slots
- Clear visual feedback for hover and selection states
- Timezone indicator
- Empty state for dates with no available slots

```tsx
interface TimeSlotSelectorProps {
  availableSlots: string[];
  selectedTime: string;
  onTimeSelect: (time: string) => void;
  timezone: string;
}
```

#### 2.3 Meeting Information Display

A component to display meeting details:
- Meeting type/title
- Duration options
- Host information
- Meeting description
- Web conferencing details

```tsx
interface MeetingInfoProps {
  hostName: string;
  hostImage?: string;
  meetingTitle: string;
  meetingDescription?: string;
  selectedDuration: number;
  allowedDurations: number[];
  onDurationChange: (duration: number) => void;
}
```

#### 2.4 Booking Form Steps

A step indicator component to guide users through the booking process:
- Visual indicators for current step
- Clear progression through Date → Time → Details

```tsx
interface StepIndicatorProps {
  currentStep: number;
  steps: { id: number; label: string; completed: boolean }[];
}
```

### 3. Confirmation Component

An enhanced confirmation screen after successful booking:
- Clear success message
- Summary of booking details
- Next steps information
- Option to book another meeting

```tsx
interface ConfirmationProps {
  hostName: string;
  bookingDate: string;
  bookingTime: string;
  duration: number;
  guestName: string;
  guestEmail: string;
  onBookAnother: () => void;
}
```

## Data Models

No changes to the existing data models are required for this UI enhancement. We'll continue to use the existing models:

- `User`: Contains host information
- `Availability`: Defines when a host is available
- `Booking`: Stores booking information

## UI Design

### Color Scheme

We'll use a color scheme that matches the screenshot inspiration:
- Primary: Blue (#3B82F6 to #4F46E5 gradient)
- Secondary: Light blue for selection (#EBF5FF)
- Accent: Highlight blue (#2563EB)
- Background: White (#FFFFFF) with light gray sections (#F9FAFB)
- Text: Dark gray (#111827) for headings, medium gray (#4B5563) for body text

### Typography

- Headings: Font size 24px (2xl) for main headings, 20px (xl) for section headings
- Body: Font size 16px (base) for regular text, 14px (sm) for secondary information
- Font weight: Semibold (600) for headings, medium (500) for important text, regular (400) for body text

### Layout

#### Desktop View
- Two-column layout with host information on the left and booking form on the right
- Calendar and time slots side by side when both are visible
- Clean white cards with subtle shadows for different sections

#### Mobile View
- Single column layout with host information at the top
- Stacked components for calendar, time slots, and form
- Full-width buttons and inputs for better touch targets

### Component Mockups

#### Calendar Component
```
┌─────────────────────────────────┐
│ July 2025                 ◄  ► │
├───┬───┬───┬───┬───┬───┬───┤
│Sun│Mon│Tue│Wed│Thu│Fri│Sat│
├───┼───┼───┼───┼───┼───┼───┤
│   │ 1 │ 2 │ 3 │ 4 │ 5 │ 6 │
├───┼───┼───┼───┼───┼───┼───┤
│ 7 │ 8 │ 9 │10 │11 │12 │13 │
├───┼───┼───┼───┼───┼───┼───┤
│14 │15 │16 │17 │18 │19 │20 │
├───┼───┼───┼───┼───┼───┼───┤
│21 │22 │23 │24 │25 │26 │27 │
├───┼───┼───┼───┼───┼───┼───┤
│28 │29 │30 │31 │   │   │   │
└───┴───┴───┴───┴───┴───┴───┘
       Today
```

#### Time Slot Selector
```
┌─────────────────┐ ┌─────────────────┐
│     11:00 AM    │ │     12:00 PM    │
└─────────────────┘ └─────────────────┘
┌─────────────────┐ ┌─────────────────┐
│     11:30 AM    │ │     12:30 PM    │
└─────────────────┘ └─────────────────┘
┌─────────────────┐ ┌─────────────────┐
│     1:00 PM     │ │     1:30 PM     │
└─────────────────┘ └─────────────────┘
```

#### Meeting Information Display
```
┌───────────────────────────────────┐
│ [Logo] Company Name               │
│                                   │
│ 30 minutes design session         │
│ with Jeremy Philips               │
│                                   │
│ [Avatar] Jeremy Philips           │
│ 30 min                            │
│                                   │
│ Web conferencing details provided │
│ upon confirmation                 │
│                                   │
│ Online design session with my     │
│ personal UX review and            │
│ recommendations                   │
└───────────────────────────────────┘
```

## Error Handling

### Form Validation

1. **Email Validation**:
   - Validate email format using regex
   - Display inline error messages for invalid emails
   - Prevent form submission with invalid email

2. **Required Fields**:
   - Clearly mark required fields with visual indicators
   - Display error messages for missing required fields
   - Prevent form submission with missing required fields

3. **API Errors**:
   - Display toast notifications for API errors
   - Provide clear error messages with potential solutions
   - Allow users to retry submission

### Edge Cases

1. **No Available Slots**:
   - Display a message when a selected date has no available time slots
   - Suggest selecting another date

2. **Timezone Differences**:
   - Clearly display both host timezone and user's local timezone
   - Show time conversion information to avoid confusion

3. **Mobile Responsiveness**:
   - Ensure all components adapt properly to small screens
   - Test on various device sizes to ensure usability

## Testing Strategy

### Unit Tests

1. **Component Tests**:
   - Test calendar component for correct date rendering and selection
   - Test time slot component for correct time display and selection
   - Test form validation logic

2. **Utility Function Tests**:
   - Test date formatting functions
   - Test time conversion functions
   - Test validation functions

### Integration Tests

1. **Form Submission Flow**:
   - Test the complete booking flow from date selection to form submission
   - Verify correct data is sent to the API

2. **Error Handling**:
   - Test form validation error displays
   - Test API error handling

### Visual Regression Tests

1. **Component Appearance**:
   - Verify components match design specifications
   - Test responsive behavior on different screen sizes

### Manual Testing

1. **Cross-browser Testing**:
   - Test on Chrome, Firefox, Safari, and Edge
   - Verify consistent appearance and behavior

2. **Accessibility Testing**:
   - Test keyboard navigation
   - Test screen reader compatibility
   - Verify color contrast meets WCAG standards

## Implementation Considerations

### Accessibility

- Ensure all interactive elements are keyboard accessible
- Add appropriate ARIA labels for screen readers
- Maintain sufficient color contrast for text readability
- Provide text alternatives for non-text content

### Performance

- Optimize component rendering to minimize layout shifts
- Lazy load components when appropriate
- Use efficient state management to prevent unnecessary re-renders

### Mobile Responsiveness

- Design for mobile-first approach
- Use responsive design patterns for all components
- Test on various device sizes to ensure usability

### Browser Compatibility

- Ensure compatibility with modern browsers (Chrome, Firefox, Safari, Edge)
- Use feature detection for any advanced browser features
- Provide fallbacks for unsupported features

## Design Decisions and Rationale

1. **Two-Column Layout**:
   - Rationale: Provides clear separation between host information and booking form, making it easier for users to understand the context while making their booking.

2. **Step Indicator**:
   - Rationale: Helps users understand where they are in the booking process and what steps remain, reducing confusion and abandonment.

3. **Enhanced Calendar**:
   - Rationale: A more visually appealing calendar with clear date indicators improves the user experience by making date selection more intuitive.

4. **Meeting Information Display**:
   - Rationale: Providing clear information about the meeting type, host, and details helps users understand what they're booking, increasing confidence in the booking process.

5. **Timezone Indicators**:
   - Rationale: Clearly displaying timezone information reduces confusion and prevents booking errors due to timezone misunderstandings.