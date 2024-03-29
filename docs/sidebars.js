// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    "intro",
    "vision",
    "get-started",
    {
      type: "category",
      label: "Content System",
      items: [
        {
          type: "autogenerated",
          dirName: "zerve",
        },
      ],
    },
    {
      type: "category",
      label: "Internal / Contributors",
      link: { type: "doc", id: "internal/index" },
      items: ["internal/zed", "internal/zen", "internal/zoo"],
    },
    "roadmap",
    "about",
  ],
};

module.exports = sidebars;
