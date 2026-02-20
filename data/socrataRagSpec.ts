const spec = {
  "version": 1,
  "discovery": {
    "catalogBaseUrls": {
      "us": "https://api.us.socrata.com/api/catalog/v1",
      "eu": "https://api.eu.socrata.com/api/catalog/v1"
    },
    "allowedParams": [
      "approval_status",
      "attribution",
      "audience",
      "boostDesc",
      "boostDomains[{DomainName}]",
      "boostOfficial",
      "boostTitle",
      "boost{Datatype}",
      "boost{key}",
      "categories",
      "column_names",
      "custom-metadata_key",
      "deduplicate",
      "derived",
      "derived_from",
      "domains",
      "explicitly_hidden",
      "for_user",
      "ids",
      "license",
      "limit",
      "min_should_match",
      "names",
      "offset",
      "only",
      "order",
      "parent_ids",
      "provenance",
      "published",
      "q",
      "reviewer_id",
      "scroll_id",
      "search_context",
      "shared_to",
      "show_visibility",
      "submitter_id",
      "tags",
      "target_audience",
      "visibility",
      "{custom_metadata_key}"
    ],
    "pagination": {
      "defaultLimit": 100,
      "maxOffsetPlusLimit": 10000
    },
    "sourceChunkIds": [
      "section-purpose-1",
      "endpoint-get-catalog-v1-ids-4x4-find-assets-by-id-summary-1",
      "endpoint-get-catalog-v1-search-context-domain-domains-domain-find-assets-by-domain-summary-1",
      "endpoint-get-catalog-v1-names-name-find-assets-by-name-summary-1",
      "endpoint-get-catalog-v1-search-context-search-context-categories-category-find-assets-by-category-summary-1",
      "endpoint-get-catalog-v1-search-context-search-context-tags-tag-find-assets-by-tag-summary-1",
      "endpoint-get-catalog-v1-only-type-find-assets-by-type-summary-1",
      "endpoint-get-catalog-v1-custom-metadata-key-value-find-by-domain-specific-metadata-summary-1"
    ]
  },
  "soda": {
    "v2": {
      "resourcePath": "/resource/{id}.json",
      "sourceChunkIds": [
        "section-version-3-0-latest-1",
        "section-section-2",
        "section-extensions-1"
      ]
    },
    "v3": {
      "queryPath": "/api/v3/views/{id}/query.json",
      "exportPath": "/api/v3/views/{id}/export.csv",
      "sourceChunkIds": [
        "section-api-endpoints-2",
        "section-version-3-0-latest-1",
        "section-application-tokens-2",
        "section-authentication-2",
        "section-version-2-0-2",
        "section-section-2"
      ]
    }
  }
};
export default spec;
