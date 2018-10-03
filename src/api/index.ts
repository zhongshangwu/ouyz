
export function fetchPostsList(cuurentPage: number = 1) {
  return {
    data: [
      /* 2017 */
      {
        title: '多语言支持',
        banner: 'https://casper.ghost.org/v2.0.0/images/writing-posts-with-ghost.jpg',
        content: '<h2>我是</h2>'
          + '<p>在上过两个星期小学后，我便退学回家自学，成为一名 homeschooler。从此，应试教育和学校里面所发生的一切，都与我无关。</p>'
          + '<p>现在我 22 岁，在自学的这些年里，我自己学，做自己。追寻自己的所想所爱，并试着将各种兴趣爱好串连在一起。</p>',
        slug: 'multiple-languages-support',
        category: 'docs',
        date: '2017-01-24'
      },
      {
        title: '使用社会化评论服务',
        banner: 'https://casper.ghost.org/v2.0.0/images/publishing-options.jpg',
        content: '<h2>我是</h2>'
        + '<p>在上过两个星期小学后，我便退学回家自学，成为一名 homeschooler。从此，应试教育和学校里面所发生的一切，都与我无关。</p>'
        + '<p>现在我 22 岁，在自学的这些年里，我自己学，做自己。追寻自己的所想所爱，并试着将各种兴趣爱好串连在一起。</p>',
        slug: 'use-social-commenting-services',
        category: 'docs',
        date: '2017-01-19',
        draft: true
      },
      {
        title: '插入语法高亮的代码块',
        banner: 'https://casper.ghost.org/v2.0.0/images/app-integrations.jpg',
        content: '<h2>我是</h2>'
        + '<p>在上过两个星期小学后，我便退学回家自学，成为一名 homeschooler。从此，应试教育和学校里面所发生的一切，都与我无关。</p>'
        + '<p>现在我 22 岁，在自学的这些年里，我自己学，做自己。追寻自己的所想所爱，并试着将各种兴趣爱好串连在一起。</p>',
        slug: 'insert-code-blocks-with-syntax-highlight',
        category: 'docs',
        date: '2017-01-18'
      },
      {
        title: '编写文章或页面',
        content: '<h2>我是</h2>'
        + '<p>在上过两个星期小学后，我便退学回家自学，成为一名 homeschooler。从此，应试教育和学校里面所发生的一切，都与我无关。</p>'
        + '<p>现在我 22 岁，在自学的这些年里，我自己学，做自己。追寻自己的所想所爱，并试着将各种兴趣爱好串连在一起。</p>',
        slug: 'author-posts-or-pages',
        category: 'docs',
        date: '2017-01-13'
      },

      {
        title: '新建文章或页面',

        content: '<h2>我是</h2>'
        + '<p>在上过两个星期小学后，我便退学回家自学，成为一名 homeschooler。从此，应试教育和学校里面所发生的一切，都与我无关。</p>'
        + '<p>现在我 22 岁，在自学的这些年里，我自己学，做自己。追寻自己的所想所爱，并试着将各种兴趣爱好串连在一起。</p>',
        slug: 'add-posts-or-pages',
        category: 'docs',
        date: '2017-01-12'
      },
      {
        title: 'Customize navigation menu',
        content: '<h2>我是</h2>'
        + '<p>在上过两个星期小学后，我便退学回家自学，成为一名 homeschooler。从此，应试教育和学校里面所发生的一切，都与我无关。</p>'
        + '<p>现在我 22 岁，在自学的这些年里，我自己学，做自己。追寻自己的所想所爱，并试着将各种兴趣爱好串连在一起。</p>',
        slug: 'customize-navigation-menu',
        category: 'docs',
        date: '2017-01-11'
      },
      {
        title: 'Customize navigation menu',
        banner: 'https://casper.ghost.org/v2.0.0/images/app-integrations.jpg',
        content: '<h2>我是</h2>'
        + '<p>在上过两个星期小学后，我便退学回家自学，成为一名 homeschooler。从此，应试教育和学校里面所发生的一切，都与我无关。</p>'
        + '<p>现在我 22 岁，在自学的这些年里，我自己学，做自己。追寻自己的所想所爱，并试着将各种兴趣爱好串连在一起。</p>',
        slug: 'customize-navigation-menu',
        category: 'docs',
        date: '2017-01-11'
      }
    ]
  };
}