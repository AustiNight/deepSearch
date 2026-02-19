export type ComplianceMode = "audit" | "enforce";

export const COMPLIANCE_POLICY = {
  mode: "enforce" as ComplianceMode,
  zeroCostMode: true,
  signoff: {
    required: true,
    approvedBy: "",
    approvedAt: ""
  },
  blockedDomains: [] as string[],
  review: {
    requireLicense: true,
    requireTerms: true,
    requireAccessConstraints: false,
    costPatterns: [
      /\bfee\b/i,
      /\bfees\b/i,
      /\bpaid\b/i,
      /\bpayment\b/i,
      /\bpurchase\b/i,
      /\bsubscription\b/i,
      /\bpricing\b/i,
      /\bpremium\b/i,
      /\bcharge(d|s)?\b/i
    ],
    privacyPatterns: [
      /\bpersonal data\b/i,
      /\bpersonally identifiable\b/i,
      /\bpii\b/i,
      /\bprivacy\b/i,
      /\bconsent\b/i,
      /\bopt[-\s]?out\b/i,
      /\bdo not share\b/i,
      /\bdata subject\b/i
    ]
  },
  blocklist: {
    licensePatterns: [
      /all rights reserved/i,
      /\bnon[-\s]?commercial\b/i,
      /\bno\s+commercial\b/i,
      /\bno\s+redistribution\b/i,
      /\bno\s+reuse\b/i,
      /\bno\s+derivatives?\b/i,
      /\bpermission\s+required\b/i,
      /\bproprietary\b/i,
      /\bconfidential\b/i,
      /\binternal\s+use\s+only\b/i
    ],
    termsPatterns: [
      /\bno\s+scraping\b/i,
      /\bno\s+automated\b/i,
      /\brobots?\b/i,
      /\baccess\s+restricted\b/i,
      /\blogin\s+required\b/i,
      /\baccount\s+required\b/i,
      /\bdo\s+not\s+use\b/i,
      /\bprohibited\b/i
    ],
    accessConstraintPatterns: [
      /\brestricted\b/i,
      /\blicense\s+required\b/i,
      /\bpermission\s+required\b/i,
      /\bconfidential\b/i
    ]
  },
  attributionTemplate: '{source} — "{title}" ({portalDomain})',
  attributionFallbackTemplate: '{portalDomain} — "{title}"',
  requireAttributionByDefault: true
};
