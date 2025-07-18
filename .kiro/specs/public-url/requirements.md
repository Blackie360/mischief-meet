# Requirements Document

## Introduction

The public URL feature enables users to create shareable, publicly accessible URLs for their booking pages or profiles. This allows users to share their availability and booking information with others without requiring authentication, making it easier for clients and contacts to schedule appointments or meetings.

## Requirements

### Requirement 1

**User Story:** As a user, I want to generate a public URL for my booking page, so that I can share it with clients who can book appointments without needing to create an account.

#### Acceptance Criteria

1. WHEN a user navigates to their profile settings THEN the system SHALL display an option to generate a public URL
2. WHEN a user clicks "Generate Public URL" THEN the system SHALL create a unique, shareable URL for their booking page
3. WHEN a user generates a public URL THEN the system SHALL display the URL in a copyable format
4. IF a user already has a public URL THEN the system SHALL display the existing URL instead of creating a new one

### Requirement 2

**User Story:** As a user, I want to customize my public URL slug, so that I can have a memorable and professional-looking link.

#### Acceptance Criteria

1. WHEN a user generates a public URL THEN the system SHALL allow them to specify a custom slug
2. IF a custom slug is already taken THEN the system SHALL display an error message and suggest alternatives
3. WHEN a custom slug is provided THEN the system SHALL validate it contains only alphanumeric characters and hyphens
4. IF no custom slug is provided THEN the system SHALL generate a random unique identifier

### Requirement 3

**User Story:** As a visitor, I want to access a user's public booking page via their public URL, so that I can view their availability and book appointments without creating an account.

#### Acceptance Criteria

1. WHEN a visitor accesses a valid public URL THEN the system SHALL display the user's public booking page
2. WHEN a visitor accesses an invalid public URL THEN the system SHALL display a 404 error page
3. WHEN displaying a public booking page THEN the system SHALL show the user's name, bio, available time slots, and booking form
4. WHEN a visitor submits a booking request THEN the system SHALL process it without requiring visitor authentication

### Requirement 4

**User Story:** As a user, I want to control the visibility of my public URL, so that I can enable or disable public bookings as needed.

#### Acceptance Criteria

1. WHEN a user views their public URL settings THEN the system SHALL display a toggle to enable/disable the public URL
2. WHEN a user disables their public URL THEN the system SHALL return a 404 error for visitors accessing the URL
3. WHEN a user re-enables their public URL THEN the system SHALL restore access using the same URL
4. WHEN a public URL is disabled THEN the system SHALL preserve the URL slug for future re-enabling

### Requirement 5

**User Story:** As a user, I want to regenerate my public URL, so that I can create a new link if the current one has been compromised or shared inappropriately.

#### Acceptance Criteria

1. WHEN a user clicks "Regenerate URL" THEN the system SHALL create a new unique URL
2. WHEN a URL is regenerated THEN the system SHALL invalidate the previous URL immediately
3. WHEN a URL is regenerated THEN the system SHALL display a confirmation dialog warning about the old URL becoming invalid
4. WHEN the old URL is accessed after regeneration THEN the system SHALL return a 404 error

### Requirement 6

**User Story:** As a user, I want to see analytics for my public URL, so that I can track how many people are visiting and booking through the public link.

#### Acceptance Criteria

1. WHEN a user views their public URL settings THEN the system SHALL display basic analytics including total views and bookings
2. WHEN a visitor accesses the public URL THEN the system SHALL increment the view counter
3. WHEN a booking is made through the public URL THEN the system SHALL increment the booking counter
4. WHEN displaying analytics THEN the system SHALL show data for the last 30 days