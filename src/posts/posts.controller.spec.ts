import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreatePostDto } from './dto/create-post.dto';

const postsService = {
  create: jest.fn().mockImplementation(async () => ({
    id: 'testid',
    title: 'Test',
    content: 'Test content',
  })),

  getPosts: jest
    .fn()
    .mockImplementation(async () => [
      { id: 'testid', title: 'Test', content: 'Test content' },
    ]),
};

describe('PostsController', () => {
  let controller: PostsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        PostsService,
        PrismaService,
        EventEmitter2,
        { provide: CACHE_MANAGER, useValue: {} },
      ],
    })
      .overrideProvider(PostsService)
      .useValue(postsService)
      .compile();

    controller = module.get<PostsController>(PostsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a post', async () => {
    const postData: CreatePostDto = {
      title: 'Test',
      content: 'Test content',
    };

    const newPost = await controller.create(postData);

    expect(postsService.create).toHaveBeenCalledWith(postData);
    expect(newPost.id).toEqual('testid');
  });

  it('should find all posts', async () => {
    const allPosts: any = await controller.getPaginatedPosts({
      page: '1',
      size: '100',
    });

    expect(allPosts.length).toEqual(1);
    expect(allPosts[0].id).toEqual('testid');
  });
});
