// Example helper function for working with GitHub data
exports.formatGithubProfile = (profile) => {
  return {
    username: profile.username,
    profileUrl: profile.profileUrl
  };
};
