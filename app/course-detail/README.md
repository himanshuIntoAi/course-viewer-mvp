# Course Detail Page

This directory contains the complete course detail page implementation based on the CloudOU design.

## Structure

```
app/course-detail/
├── components/
│   ├── CourseDetailHeader.tsx      # Top header with logo, search, and user profile
│   ├── CourseDetailSidebar.tsx     # Left navigation sidebar
│   ├── CourseDetailContent.tsx     # Main content area with course details
│   ├── CourseDetailRightSidebar.tsx # Right sidebar with video and enrollment
│   └── index.ts                    # Component exports
├── types/
│   └── course.ts                   # TypeScript interfaces
├── page.tsx                        # Main page component
└── README.md                       # This file
```

## Components

### CourseDetailHeader
- CloudOU logo and branding
- Search bar
- Dashboard button
- Notification bell
- User profile with dropdown

### CourseDetailSidebar
- "+ New Course" button
- LEARN section (Course Catalog, Find Mentor, Career Tools)
- DISCOVER section (Chat History, Marketplace, Library, Projects, Assets, Career AI)

### CourseDetailContent
- Breadcrumb navigation
- Course title and subtitle
- Instructor information and stats
- Learning objectives
- Related topics
- Course inclusions (video hours, assignments, resources, etc.)
- Tabbed content (Content, Details, Instructor, Reviews)
- Expandable course sections with lessons

### CourseDetailRightSidebar
- Video thumbnail with play button
- Subscription information
- Action buttons (Start Learning, Enroll Now)
- Course metadata (start date, enrolled count, languages)
- Course statistics (sections, lectures, duration, video hours)
- 30-day money-back guarantee

## Features

- **Responsive Design**: Built with Tailwind CSS for mobile and desktop
- **Interactive Elements**: Expandable sections, tabbed content, hover effects
- **Type Safety**: Full TypeScript support with proper interfaces
- **Accessibility**: Proper semantic HTML and ARIA attributes
- **Modern UI**: Clean, professional design matching the CloudOU brand

## Usage

The page is self-contained and can be accessed at `/course-detail`. It uses mock data for demonstration but is structured to easily integrate with real APIs.

## Dependencies

- React 18+
- TypeScript
- Tailwind CSS
- React Icons (heroicons and feather icons)
