import { Post } from '@prisma/client';

export class PostCreatedEvent {
  constructor(public readonly post: Post) {}
}
