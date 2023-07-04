import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CreatePostDto } from './dto/create-post.dto';

const prismaService = {
  post: {
    create: jest.fn().mockImplementation(async () => ({
      id: 'sampleid',
      title: 'Test',
      content: 'Test content',
    })),

    findMany: jest.fn().mockImplementation(async () => [
      {
        id: 'sampleid',
        title: 'Test',
        content: 'Test content',
      },
    ]),
  },
};

const cacheManager = {
  get: jest.fn().mockImplementation(() => ({
    previousPage: false,
    nextPage: false,
    allPosts: [
      {
        id: 'sampleid',
        title: 'Test',
        content: 'Test content',
      },
    ],
  })),
};

describe('PostsService', () => {
  let service: PostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        PrismaService,
        EventEmitter2,
        { provide: CACHE_MANAGER, useValue: cacheManager },
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaService)
      .compile();

    service = module.get<PostsService>(PostsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a service', async () => {
    const postData: CreatePostDto = {
      title: 'Test',
      content: 'Test content',
    };

    const newPost = await service.create(postData);
    expect(prismaService.post.create).toHaveBeenCalledWith({
      data: { ...postData },
    });

    expect(newPost.id).toEqual('sampleid');
  });

  it('should find all services', async () => {
    await service.getPosts(1, 100);
    expect(cacheManager.get).toHaveBeenCalled();
  });
});
