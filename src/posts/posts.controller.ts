import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PostsService } from './posts.service';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatedDto } from './dto/get-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post('add')
  create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  @Get('paginated')
  getPaginatedPosts(@Query() data: PaginatedDto) {
    return this.postsService.getPosts(+data.page, +data.size, data.search);
  }

  @Patch('update')
  updatePost(@Body() updatePostDto: UpdatePostDto) {
    return this.postsService.editPost(updatePostDto);
  }
}
