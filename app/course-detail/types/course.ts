export interface CourseData {
  id: string;
  title: string;
  subtitle: string;
  instructor: string;
  rating: number;
  totalRatings: number;
  totalLearners: number;
  thumbnailUrl: string;
  startDate: string;
  enrolled: number;
  languages: string;
  sections: number;
  lectures: number;
  totalLength: string;
  videoHours: number;
  hasAssignments: boolean;
  downloadableResources: number;
  hasMobileAccess: boolean;
  hasCertificate: boolean;
  learningObjectives: string[];
  relatedTopics: string[];
  breadcrumbs: string[];
}
