import type { PageBlock, BlockType } from "./types";

let counter = 0;
function newId() {
  counter++;
  return `${Date.now()}-${counter}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createDefaultBlock(type: BlockType): PageBlock {
  switch (type) {
    case "hero":
      return {
        id: newId(),
        type: "hero",
        config: {
          headline: "",
          tagline: "",
          welcome_message: "",
          cta_label: "Book an appointment",
          show_cta: true,
        },
      };
    case "about":
      return {
        id: newId(),
        type: "about",
        config: {
          title: "About me",
          body: "",
          credentials: [],
        },
      };
    case "gallery":
      return {
        id: newId(),
        type: "gallery",
        config: {
          title: "My work",
          images: [],
          layout: "grid",
          columns: 3,
        },
      };
    case "services":
      return {
        id: newId(),
        type: "services",
        config: {
          title: "Services",
          subtitle: "Choose what you're looking for",
        },
      };
    case "quote":
      return {
        id: newId(),
        type: "quote",
        config: {
          quote: "",
          author_name: "",
          author_role: "",
        },
      };
    case "link":
      return {
        id: newId(),
        type: "link",
        config: {
          title: "",
          description: "",
          url: "",
        },
      };
    case "contact":
      return {
        id: newId(),
        type: "contact",
        config: {
          title: "Get in touch",
          show_phone: true,
          show_email: true,
          show_address: false,
          address: "",
        },
      };
    case "digital_product":
      return {
        id: newId(),
        type: "digital_product",
        config: {
          product_id: "",
        },
      };
  }
}

/** Default starter page for new providers (Hero + Services + Contact). */
export function defaultStarterPage(): PageBlock[] {
  return [
    createDefaultBlock("hero"),
    createDefaultBlock("services"),
    createDefaultBlock("contact"),
  ];
}
