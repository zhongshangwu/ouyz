export class PostLists {
  data: Post[] = [];
  pageCount = 0;
  pageSize = 0;
  total = 0;

  constructor(raw?: any) {
    if (raw) {
      for (const key of Object.keys(this)) {
        if (raw.hasOwnProperty(key)) {
          if (key === 'data') {
            Object.assign(this, { [key]: raw[ key ].map((one: any) => new Post(one)) });
          } else {
            Object.assign(this, { [ key ]: raw[ key ]});
          }
        }
      }
    }
  }
}

export class Post {
  title = '';
  slug = '';
  date = '';
  updated = '';
  banner: string | null = '';
  comments = false;
  path = '';
  excerpt: string | null = null;
  keywords: any = null;
  cover = '';
  content: string | null = null;
  text = '';
  link = '';
  raw: string | null = null;
  photos: string[] = [];

  constructor(raw?: any) {
    if (raw) {
      for (const key of Object.keys(this)) {
        if (raw.hasOwnProperty(key)) {
            Object.assign(this, { [ key ]: raw[ key ] });
        }
      }
    }
  }

}