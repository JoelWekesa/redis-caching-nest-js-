import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Cache } from 'cache-manager';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostCreatedEvent } from './events/post-created.event';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostsService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}
  async create(createPostDto: CreatePostDto) {
    const newPost = await this.prisma.post
      .create({
        data: {
          ...createPostDto,
        },
      })
      .then((data) => {
        this.eventEmitter.emit('posts.modified', new PostCreatedEvent(data));
        return data;
      })
      .catch((err) => {
        throw new BadRequestException(err);
      });
    return newPost;
  }

  async getPosts(page: number, size: number, search?: string) {
    let posts = await this.cacheManager.get(
      'cache:posts' + page + size + search,
    );

    if (!posts) {
      console.log('not cached');
      posts = await this.paginatedPosts(page, size, search);
    }

    return posts;
  }

  async paginatedPosts(page: number, size: number, search?: string) {
    const count = this.prisma.post.count({
      where: {
        OR: [
          {
            title: {
              contains: search || '',
            },
          },
          {
            content: {
              contains: search || '',
            },
          },
        ],
      },
    });
    const posts = this.prisma.post.findMany({
      where: {
        OR: [
          {
            title: {
              contains: search || '',
            },
          },
          {
            content: {
              contains: search || '',
            },
          },
        ],
      },
      take: size,
      skip: (page - 1) * size,
    });

    const [totalCount, allPosts] = await Promise.all([count, posts]);

    const totalPages = Math.ceil(totalCount / size);

    let previousPage: boolean | number = false;
    let nextPage: boolean | number = false;

    if (page > 1) {
      previousPage = page - 1;
    }

    if (page < totalPages) {
      nextPage = page + 1;
    }

    this.cacheManager.set('cache:posts' + page + size + search, {
      previousPage,
      nextPage,
      allPosts,
    });

    return {
      previousPage,
      nextPage,
      allPosts,
    };
  }

  async editPost(updatePost: UpdatePostDto) {
    const editedPost = await this.prisma.post
      .update({
        where: {
          id: updatePost.id,
        },

        data: {
          ...updatePost,
        },
      })
      .then((data) => {
        this.eventEmitter.emit('posts.modified', new PostCreatedEvent(data));
        return data;
      });

    return editedPost;
  }

  // @Cron(CronExpression.EVERY_SECOND)
  // async handleCron() {
  //   const random = (Math.random() + 1).toString(36).substring(7);
  //   await this.prisma.post.create({
  //     data: {
  //       title: random,
  //       content: random + ' ' + random,
  //     },
  //   });
  // }

  @OnEvent('posts.modified')
  async handlePostsModified() {
    const cacheKeys = await this.cacheManager.store.keys();
    const filteredKeyPosts = cacheKeys.filter((key) =>
      key.includes('cache:posts'),
    );

    await Promise.all(
      filteredKeyPosts.map((item) => {
        return this.cacheManager.del(item);
      }),
    );
  }
}
