import assert from "node:assert/strict";

import { REPORT_SCHEMA } from "../data/reportSchema.ts";

const BANNED_KEYWORDS = ["oneOf"];

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

const isObjectTypeNode = (node) => {
  if (!isObject(node)) return false;
  if (node.type === "object") return true;
  if (Array.isArray(node.type) && node.type.includes("object")) return true;
  return false;
};

const walkSchema = (node, path, errors) => {
  if (Array.isArray(node)) {
    node.forEach((entry, index) => walkSchema(entry, `${path}[${index}]`, errors));
    return;
  }

  if (!isObject(node)) return;

  for (const keyword of BANNED_KEYWORDS) {
    if (Object.prototype.hasOwnProperty.call(node, keyword)) {
      errors.push(`${path}: "${keyword}" is not permitted for OpenAI strict response schemas.`);
    }
  }

  if (isObjectTypeNode(node) || Object.prototype.hasOwnProperty.call(node, "properties")) {
    const properties = isObject(node.properties) ? node.properties : null;
    if (!properties) {
      errors.push(`${path}: object schemas must define a "properties" object.`);
    } else {
      if (node.additionalProperties !== false) {
        errors.push(`${path}: object schemas must set "additionalProperties" to false.`);
      }

      if (!Array.isArray(node.required)) {
        errors.push(`${path}: object schemas must define a "required" array.`);
      } else {
        const propertyKeys = Object.keys(properties);
        const requiredSet = new Set(node.required);
        for (const key of propertyKeys) {
          if (!requiredSet.has(key)) {
            errors.push(`${path}: required is missing property "${key}".`);
          }
        }
      }
    }
  }

  if (isObject(node.properties)) {
    for (const [key, child] of Object.entries(node.properties)) {
      walkSchema(child, `${path}.properties.${key}`, errors);
    }
  }

  if (Object.prototype.hasOwnProperty.call(node, "items")) {
    walkSchema(node.items, `${path}.items`, errors);
  }

  if (Array.isArray(node.prefixItems)) {
    walkSchema(node.prefixItems, `${path}.prefixItems`, errors);
  }

  if (Array.isArray(node.anyOf)) {
    walkSchema(node.anyOf, `${path}.anyOf`, errors);
  }

  if (Array.isArray(node.allOf)) {
    walkSchema(node.allOf, `${path}.allOf`, errors);
  }
};

const errors = [];
walkSchema(REPORT_SCHEMA, "REPORT_SCHEMA", errors);

assert.equal(errors.length, 0, `OpenAI schema lint failed:\n- ${errors.join("\n- ")}`);
console.log("openai schema lint ok");
