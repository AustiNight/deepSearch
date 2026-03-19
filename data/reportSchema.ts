export const REPORT_SCHEMA = {
  type: "object",
  properties: {
    schemaVersion: { type: "number" },
    title: { type: "string" },
    summary: { type: "string" },
    sections: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          content: { type: "string" },
          sources: { type: "array", items: { type: "string" } }
        },
        required: ["title", "content", "sources"],
        additionalProperties: false
      }
    },
    visualizations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: { type: "string" },
          title: { type: "string" },
          caption: { type: "string" },
          sources: { type: "array", items: { type: "string" } },
          data: {
            type: "object",
            properties: {
              labels: { type: "array", items: { type: "string" } },
              series: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    data: { type: "array", items: { type: "number" } }
                  },
                  required: ["name", "data"],
                  additionalProperties: false
                }
              },
              unit: { type: "string" },
              url: { type: "string" },
              alt: { type: "string" },
              width: { type: "number" },
              height: { type: "number" }
            },
            required: ["labels", "series", "unit", "url", "alt", "width", "height"],
            additionalProperties: false
          }
        },
        required: ["type", "title", "caption", "sources", "data"],
        additionalProperties: false
      }
    },
    provenance: {
      type: "object",
      properties: {
        totalSources: { type: "number" },
        methodAudit: { type: "string" }
      },
      required: ["totalSources", "methodAudit"],
      additionalProperties: false
    }
  },
  required: ["schemaVersion", "title", "summary", "sections", "visualizations", "provenance"],
  additionalProperties: false
};
