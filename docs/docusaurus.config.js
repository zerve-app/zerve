// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Zerve Content System",
  tagline: "DOCS PREVIEW. PLEASE, DO NOT SHARE THIS YET",
  url: "https://docs.zerve.app/",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "./img/favicon.ico",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "", // Usually your GitHub org/user name.
  projectName: "", // Usually your repo name.

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: "https://github.com/zerve-app/zerve/tree/main/docs/",
        },
        blog: {
          showReadingTime: false,
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        respectPrefersColorScheme: true,
        disableSwitch: true,
      },
      navbar: {
        logo: {
          alt: "Zerve",
          src: "img/ZerveIconSquare.png",
          href: "https://zerve.app",
        },
        items: [
          {
            type: "doc",
            docId: "intro",
            position: "left",
            label: "Docs",
          },
          { to: "/blog", label: "Blog", position: "left" },
          {
            href: "https://github.com/zerve-app/zerve",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Docs",
            items: [
              {
                label: "Intro",
                to: "/docs/intro",
              },
              {
                label: "Vision",
                to: "/docs/vision",
              },
              {
                label: "Developer Workflow",
                to: "/docs/workflow",
              },
            ],
          },
          {
            title: "Community",
            items: [
              {
                label: "YouTube",
                href: "https://www.youtube.com/channel/UC2H16-XPP4IWrFl54ADOU3w",
              },
              {
                label: "Discord",
                href: "https://discord.gg/UDBJZRMQTp",
              },
              {
                label: "Twitter",
                href: "https://twitter.com/zerve-app",
              },
            ],
          },
          {
            title: "More",
            items: [
              {
                label: "Blog",
                to: "/blog",
              },
              {
                label: "GitHub",
                href: "https://github.com/zerve-app/zerve",
              },
              {
                label: "Service Status",
                href: "https://status.zerve.app",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Zerve, LLC.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
