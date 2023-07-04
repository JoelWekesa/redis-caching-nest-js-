import { Post } from '@prisma/client';

export interface PaginatedPosts {
  previousPage: boolean | number;
  nextPage: boolean | number;
  allPosts: Post[];
}
