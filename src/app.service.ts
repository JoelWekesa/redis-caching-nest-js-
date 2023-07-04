import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import axios from 'axios';
import { Cache } from 'cache-manager';
import { CacheItems } from './enums/cache';

export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

@Injectable()
export class AppService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}
  async getHello(): Promise<Post[]> {
    let posts = (await this.cacheManager.get(CacheItems.POSTS)) as Post[];

    if (posts) {
      console.log('cached ');
    }

    if (!posts) {
      posts = await axios
        .get('https://jsonplaceholder.typicode.com/posts')
        .then((res) => res.data);

      await this.cacheManager.set(CacheItems.POSTS, posts);
      console.log('not cached');
    }
    return posts;
  }

  async resetByPost(): Promise<string> {
    const post = await axios
      .get('https://jsonplaceholder.typicode.com/posts')
      .then((res) => res.data);
    await this.cacheManager.del('posts');
    await this.cacheManager.set('posts', post);
    return post;
  }
}
