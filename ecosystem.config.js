module.exports = {
  apps: [
    {
      name: "zerve-web",
      script: "yarn workspace web start",
      env: {
        PORT: 3999,
      },
    },
    {
      name: "zerve-server",
      script: "yarn workspace server start",
      env: {
        PORT: 3998,
      },
    },
  ],
};
