import axios from '@/common/requests';
import { SiteConfig } from '@/models/site-config.class';
import { PostList, Category, Tag } from '@/models/posts.class';
import { Article } from '@/models/article.class';

export default {
    // 获取站点元数据
    async fetchSiteConfig() {
        return axios.get<SiteConfig>('/blog/site.json');
    },
    // 根据页码获取文章列表
    async fetchPostsByPage(currentPage: number = 1) {
        return axios.get<PostList>(`/blog/posts/${currentPage}.json`);
    },
    // 根据标签获取文章列表
    async fetchPostsByTag(tagName: string) {
        return axios.get<PostList>(`/blog/tags/${tagName}.json`);
    },
    // 根据目录获取文章列表
    async fetchPostsByCategory(categoryName: string) {
        return axios.get<PostList>(`/blog/categories/${categoryName}.json`);
    },
    // 根据文章标识获取详情
    async fetchPostDetail(abbrlink: string) {
        return axios.get<Article>(`/blog/articles/${abbrlink}.json`);
    },
    // 获取所有标签
    async fetchAllTags() {
        return axios.get<Tag[]>('/blog/tags.json');
    },
    // 获取所有目录
    async fetchAllCategories() {
        return axios.get<Category[]>('/blog/categories.json');
    },
};
