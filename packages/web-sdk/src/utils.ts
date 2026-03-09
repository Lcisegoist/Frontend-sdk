/**
 * 生成短UUID,由8位随机字符串和时间戳组成
 * @returns 短UUID
 **/
export const generateShortUUID = () => {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let shortUUID = '';

  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    shortUUID += characters.charAt(randomIndex);
  }

  return shortUUID + Date.now();
};

export const getUrlQuery = () => {
  const isHash = location.hash; // eg：#/user?id=123&name=张三
  if (isHash) {
    const link = location.hash.replace('#', '');
    const [pageUrl, query] = link.split('?');
    return {
      pageUrl,
      query: query || '',
      domain: location.host,
    };
  } else {
    return {
      query: location.search.replace('?', '') || '',
      pageUrl: location.pathname,
      domain: location.host,
    };
  }
};
