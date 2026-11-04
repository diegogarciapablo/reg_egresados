export function makeGetCurrentUser({ userRepository }) {
  return async function getCurrentUser({ userId }) {
    if (!userId) return null;
    const user = await userRepository.findById(userId);
    if (!user || !user.isActive) return null;
    return user.toSafeObject ? user.toSafeObject() : user;
  };
}
