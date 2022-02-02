module.exports = {
  apps: [
    {
      name: "agent-web",
      script: "yarn workspace web start",
      env: {
        PORT: 3999,
      },
    },
    {
      name: "agent-server",
      script: "yarn workspace server start",
      env: {
        PORT: 3998,
      },
    },
  ],
};
