import * as db from './database';

function seed() {
  const universities = db.getUniversities();
  universities.forEach(u => db.deleteUniversity(u.id));

  const ratingCategories = ['宿舍条件', '食堂质量', '师资水平', '校园环境', '人文氛围', '就业支持', '安全指数'];

  const uniData = [
    {
      name: '清华大学', type: '985/211/双一流', location: '北京市海淀区',
      description: '清华大学（Tsinghua University）是中国最著名的高等学府之一，位于北京西郊的清华园。学校始建于1911年，前身是清华学堂，是清政府设立的留美预备学校。经过百余年的发展，清华大学已成为一所综合性、研究型、开放式的大学，在国内外享有盛誉。',
      website: 'https://www.tsinghua.edu.cn', established_year: 1911, student_count: 50000, feature_tag: '985/211/双一流',
    },
    {
      name: '北京大学', type: '985/211/双一流', location: '北京市海淀区',
      description: '北京大学（Peking University）创办于1898年，初名京师大学堂，是中国第一所国立综合性大学。北大是新文化运动的中心和五四运动的策源地，拥有深厚的人文底蕴和卓越的学术传统。',
      website: 'https://www.pku.edu.cn', established_year: 1898, student_count: 45000, feature_tag: '985/211/双一流',
    },
    {
      name: '浙江大学', type: '985/211/双一流', location: '浙江省杭州市',
      description: '浙江大学（Zhejiang University）坐落于杭州，前身是1897年创建的求是书院。浙大是一所特色鲜明、在海内外有较大影响的综合型、研究型、创新型大学。',
      website: 'https://www.zju.edu.cn', established_year: 1897, student_count: 60000, feature_tag: '985/211/双一流',
    },
    {
      name: '复旦大学', type: '985/211/双一流', location: '上海市',
      description: '复旦大学（Fudan University）位于上海市，始创于1905年，原名复旦公学。复旦是中国人自主创办的第一所高等院校，经过百余年的发展，已成为一所世界知名的综合性研究型大学。',
      website: 'https://www.fudan.edu.cn', established_year: 1905, student_count: 40000, feature_tag: '985/211/双一流',
    },
    {
      name: '上海交通大学', type: '985/211/双一流', location: '上海市',
      description: '上海交通大学（Shanghai Jiao Tong University）创建于1896年，原名南洋公学。历经两个甲子，交大已发展成为一所"综合性、研究型、国际化"的国内一流、国际知名大学。',
      website: 'https://www.sjtu.edu.cn', established_year: 1896, student_count: 42000, feature_tag: '985/211/双一流',
    },
    {
      name: '武汉大学', type: '985/211/双一流', location: '湖北省武汉市',
      description: '武汉大学（Wuhan University）坐落于江城武汉，溯源于1893年的自强学堂。校园环绕东湖水，坐拥珞珈山，被誉为"中国最美丽的大学"。',
      website: 'https://www.whu.edu.cn', established_year: 1893, student_count: 38000, feature_tag: '985/211/双一流',
    },
  ];

  const uniScores: number[][] = [
    [7, 8, 9, 9, 9, 9, 9],
    [7, 8, 9, 8, 10, 9, 8],
    [8, 9, 9, 9, 8, 9, 9],
    [7, 8, 9, 8, 9, 9, 8],
    [8, 8, 9, 8, 8, 9, 9],
    [8, 7, 8, 10, 9, 8, 8],
  ];

  const created: number[] = [];

  uniData.forEach((u, i) => {
    const uni = db.createUniversity(u);
    created.push(uni.id);
    ratingCategories.forEach((cat, j) => {
      db.upsertRating(uni.id, cat, uniScores[i][j]);
    });
  });

  const featureTagDefs = [
    { name: '上床下铺', desc: '学生宿舍是否提供上床下铺的设计' },
    { name: '独立卫浴', desc: '宿舍是否配备独立卫生间和浴室' },
    { name: '空调覆盖', desc: '宿舍及教学楼是否全面覆盖空调' },
    { name: '校园WiFi', desc: '全校是否覆盖免费WiFi网络' },
    { name: '24h热水', desc: '宿舍是否提供24小时热水供应' },
    { name: '通宵自习室', desc: '校园内是否设有通宵开放的自习室' },
    { name: '地铁直达', desc: '校园附近是否有地铁站直达' },
    { name: '健身房', desc: '校园内是否配备免费或低价健身房' },
  ];

  const uniTagStatus: boolean[][] = [
    [true, false, true, true, true, true, true, true],
    [true, false, true, true, true, true, true, false],
    [true, true, true, true, true, true, false, true],
    [true, true, true, true, false, true, true, true],
    [true, true, true, true, true, true, true, true],
    [true, true, true, true, true, false, true, false],
  ];

  created.forEach((uniId, i) => {
    featureTagDefs.forEach((def, j) => {
      db.createTag(uniId, { tag_name: def.name, status: uniTagStatus[i][j] ? 1 : 0, description: def.desc, sort_order: j });
    });
  });

  const sampleComments = [
    '预科期间住的紫荆22号楼，双人间很舒适，就是没有独立卫浴稍微不方便。正式开学后据说要搬到新建的东水磨去住。',
    '宿舍条件食堂质量师资水平校园环境人文氛围就业支持安全指数确实挺好，但是现在的教授有很多商业化严重。',
    '我只能说是国内天花板，尤其是有创业梦想的朋友，清华系是最棒的创业帮派，计算机系很推荐！',
    '食堂爆赞图书馆爆赞，就是部分宿舍有些逆天。环境也是夯爆了，杨絮柳絮柏树总有一款适合你，只要待得久再怎么铁石心肠总有流泪那天。',
    '没话说，除了吃了老建筑和老配套的亏，住行上有一丝丝不方便。其他的，没啥能挑了。',
    '北大的人文关怀绝对被低估了，老师里开到SSR的概率相当高。未名湖畔的风景让人流连忘返。',
    '仅评价GOAT，不谈了。着重提一下浙大的工科实力，计算机和人工智能方向非常强劲。',
    '复旦的自由而无用的灵魂令人着迷，经管和新闻传播学科实力雄厚。',
    '交大的工科氛围浓厚，就业相当给力。闵行校区很大，建议备好自行车。',
    '珞珈山下的樱花季美不胜收，武大的综合实力稳步提升，法学、测绘等学科全国领先。',
  ];

  const commentUniIds = [0, 0, 0, 0, 0, 1, 2, 3, 4, 5];
  const commentUsers = ['学长A', '匿名', '创业达人', '大四老油条', '新生小王', '文史哲爱好者', '工科狗', '自由而无用', '闵行村民', '珞珈山人'];

  const commentRatings = [7, 6, 9, 8, 7, 8, 9, 8, 8, 9];

  sampleComments.forEach((content, i) => {
    db.createComment(created[commentUniIds[i]], commentUsers[i], content, commentRatings[i]);
  });

  console.log(`✅ 已生成 ${created.length} 所大学，包含评分、标签和评论数据`);
}

seed();
