export function getUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

export function setUser(user: any) {
  localStorage.setItem('user', JSON.stringify(user));
}

export function removeUser() {
  localStorage.removeItem('user');
}

export function getChatMessages(channelId: string) {
  const messagesStr = localStorage.getItem(`chat_${channelId}`);
  return messagesStr ? JSON.parse(messagesStr) : [];
}

export function saveChatMessages(channelId: string, messages: any[]) {
  localStorage.setItem(`chat_${channelId}`, JSON.stringify(messages));
}

export function getForumPosts() {
  const postsStr = localStorage.getItem('forum_posts');
  return postsStr ? JSON.parse(postsStr) : [];
}

export function saveForumPosts(posts: any[]) {
  localStorage.setItem('forum_posts', JSON.stringify(posts));
}
