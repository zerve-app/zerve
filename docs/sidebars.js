// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    "intro",
    "vision",
    "workflow",
    {
      type: "category",
      label: "Internal / Contributors",
      link: { type: "doc", id: "internal/index" },
      items: ["internal/zed", "internal/zen", "internal/zoo"],
    },
  ],
};

module.exports = sidebars;
