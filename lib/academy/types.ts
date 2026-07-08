export interface AcademyLesson {
  slug: string;
  title: string;
  content: string;
}

export interface AcademyModule {
  slug: string;
  title: string;
  description: string;
  status: string;
  progress: string;
  lessons: AcademyLesson[];
}
